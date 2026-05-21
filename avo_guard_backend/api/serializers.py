from __future__ import annotations

from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from django.apps import apps
from django.conf import settings as dj_settings
from rest_framework import serializers

from accounts.models import Entity, AppPermission, Role  # noqa: F401  (used by DRF schema/readability)

from .models import (
    AlertRule,
    BroadcastCampaign,
    BroadcastRecipient,
    Case,
    FarmBlock,
    FarmerProfile,
    ProductionVolumeSubmission,
    ScoutingReport,
)
from .rbac import ROLE_AGRONOMIST, ROLE_FARMER, is_admin_like, role_name

USER_MODEL = apps.get_model(*dj_settings.AUTH_USER_MODEL.split('.'))

_INT_SENTINEL = 2147483647


def _display_user_name(user) -> str:
    parts = [getattr(user, 'first_name', '') or '', getattr(user, 'last_name', '') or '']
    name = ' '.join(parts).strip()
    return name or (getattr(user, 'phone_number', '') or '') or 'Farmer'


def _pest_farm_latest_for_profile(obj: FarmerProfile):
    """Latest `pest_scouting.Farm` for this profile; uses `Prefetch` cache when present."""
    try:
        from pest_scouting.models import Farm
    except ImportError:
        return None
    user = obj.user
    relname = 'pest_scouting_farms'
    cache = getattr(user, '_prefetched_objects_cache', None) or {}
    if relname in cache:
        for farm in user.pest_scouting_farms.all():
            return farm
        return None
    return Farm.objects.filter(farmer_name_id=obj.user_id).order_by('-timestamp').first()


def _serialize_pest_scouting_farm_row(farm) -> dict | None:
    """Shape aligned with `FarmerDetailSerializer.get_mobileFarmFromApp` (mobile onboarding farm)."""
    if not farm:
        return None
    nb = _sanitize_block_count(farm.number_of_blocks)
    fs = float(farm.farm_size or 0)
    if fs <= 0 or fs >= 10**7:
        fs_out = None
    else:
        fs_out = round(fs, 2)
    return {
        'farmName': farm.farm_name or '',
        'location': farm.location or '',
        'numberOfBlocks': nb,
        'farmSize': fs_out,
        'updatedAt': farm.updated_at.isoformat() if getattr(farm, 'updated_at', None) else '',
    }


def _sanitize_block_count(n: int | None) -> int | None:
    if n is None:
        return None
    try:
        v = int(n)
    except (TypeError, ValueError):
        return None
    if v <= 0 or v >= _INT_SENTINEL or v > 50_000:
        return None
    return v


def _sanitize_tree_count(n: int | None) -> int:
    if n is None:
        return 0
    try:
        v = int(n)
    except (TypeError, ValueError):
        return 0
    if v < 0 or v >= _INT_SENTINEL or v > 500_000:
        return 0
    return v


def _weekly_scouting_logs_for_farmer(obj: FarmerProfile) -> list[dict]:
    """Rolling four 7-day windows (oldest = W-4); prefers pest_scouting WeeklyRecord when present."""
    uid = obj.user_id
    try:
        from pest_scouting.models import WeeklyRecord
    except ImportError:
        WeeklyRecord = None  # type: ignore
    if WeeklyRecord is not None and WeeklyRecord.objects.filter(farmer_id=uid).exists():
        now = timezone.now()
        out: list[dict] = []
        for i in range(4):
            label = f'W-{4 - i}'
            window_start = now - timedelta(days=28 - i * 7)
            window_end = now - timedelta(days=21 - i * 7)
            qs = WeeklyRecord.objects.filter(
                farmer_id=uid,
                timestamp__gte=window_start,
                timestamp__lt=window_end,
            )
            completed = qs.exists()
            rec = qs.order_by('-timestamp').first()
            scout = ''
            date_str = ''
            if rec and rec.timestamp:
                scout = _display_user_name(rec.farmer)
                date_str = timezone.localtime(rec.timestamp).strftime('%Y-%m-%d')
            out.append(
                {
                    'week': label,
                    'completed': completed,
                    'date': date_str,
                    'scout': scout,
                }
            )
        return out
    logs = list(obj.weekly_scouting_logs_4w or [])[:4]
    out = []
    for i, v in enumerate(logs):
        out.append({'week': f'W-{4 - i}', 'completed': bool(v), 'date': '', 'scout': ''})
    while len(out) < 4:
        out.append({'week': f'W-{4 - len(out)}', 'completed': False, 'date': '', 'scout': ''})
    return out


class AlertRuleSerializer(serializers.ModelSerializer):
    triggered = serializers.IntegerField(source='triggered_count', read_only=True)

    class Meta:
        model = AlertRule
        fields = (
            'id',
            'name',
            'condition',
            'threshold',
            'county',
            'pest',
            'action',
            'recipients',
            'status',
            'triggered',
            'last_triggered_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'triggered', 'last_triggered_at', 'created_at', 'updated_at')


class ProductionVolumeSubmissionSerializer(serializers.ModelSerializer):
    sourceEntityName = serializers.SerializerMethodField()
    submittedBy = serializers.SerializerMethodField()

    class Meta:
        model = ProductionVolumeSubmission
        fields = (
            'id',
            'year',
            'month',
            'county',
            'sub_county',
            'ward',
            'village',
            'tonnage_mt',
            'source_type',
            'source_entity',
            'sourceEntityName',
            'status',
            'notes',
            'submitted_by',
            'submittedBy',
            'created_at',
            'updated_at',
        )
        # These fields are inferred server-side from the authenticated user.
        read_only_fields = (
            'id',
            'source_type',
            'source_entity',
            'submitted_by',
            'sourceEntityName',
            'submittedBy',
            'created_at',
            'updated_at',
        )
        extra_kwargs = {
            # Allow POST without providing these; server sets them.
            'source_type': {'required': False},
            'source_entity': {'required': False},
            'submitted_by': {'required': False},
        }

    def get_sourceEntityName(self, obj):
        return getattr(getattr(obj, 'source_entity', None), 'company_name', None)

    def get_submittedBy(self, obj):
        u = getattr(obj, 'submitted_by', None)
        if not u:
            return None
        name = f"{getattr(u, 'first_name', '')} {getattr(u, 'last_name', '')}".strip()
        return name or getattr(u, 'phone_number', None) or str(getattr(u, 'id', ''))


class BroadcastRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = BroadcastRecipient
        fields = (
            'id',
            'phone_number',
            'status',
            'error',
            'provider_response',
            'sent_at',
        )
        read_only_fields = fields


class BroadcastCampaignSerializer(serializers.ModelSerializer):
    createdBy = serializers.SerializerMethodField()
    recipientsPreview = serializers.SerializerMethodField()

    class Meta:
        model = BroadcastCampaign
        fields = (
            'id',
            'county',
            'ward',
            'village',
            'message',
            'status',
            'total_recipients',
            'sent_count',
            'failed_count',
            'createdBy',
            'created_at',
            'updated_at',
            'recipientsPreview',
        )
        read_only_fields = (
            'id',
            'status',
            'total_recipients',
            'sent_count',
            'failed_count',
            'createdBy',
            'created_at',
            'updated_at',
            'recipientsPreview',
        )

    def get_createdBy(self, obj):
        u = getattr(obj, 'created_by', None)
        if not u:
            return None
        name = f"{getattr(u, 'first_name', '')} {getattr(u, 'last_name', '')}".strip()
        return name or getattr(u, 'phone_number', None) or str(getattr(u, 'id', ''))

    def get_recipientsPreview(self, obj):
        qs = obj.recipients.all().order_by('-sent_at')[:25]
        return BroadcastRecipientSerializer(qs, many=True).data


class FarmerListSerializer(serializers.ModelSerializer):
    farmerCode = serializers.CharField(source='farmer_code')
    farmName = serializers.SerializerMethodField()
    primaryChannel = serializers.CharField(source='primary_channel')
    location = serializers.SerializerMethodField()
    weeklyScoutingLogs = serializers.SerializerMethodField()
    lastScoutingResult = serializers.SerializerMethodField()
    exportEligibility = serializers.CharField(source='export_eligibility')
    totalAcres = serializers.SerializerMethodField()
    phone = serializers.CharField(source='user.phone_number')
    lastInspection = serializers.CharField(source='last_inspection')
    overdueScouts = serializers.BooleanField(source='overdue_scouts')
    linkedExporter = serializers.SerializerMethodField()
    complianceStatus = serializers.CharField(source='agronomist_compliance_status')
    mobileFarmFromApp = serializers.SerializerMethodField()

    class Meta:
        model = FarmerProfile
        fields = (
            'id',
            'farmerCode',
            'name',
            'farmName',
            'owner',
            'location',
            'county',
            'ward',
            'primaryChannel',
            'weeklyScoutingLogs',
            'lastScoutingResult',
            'exportEligibility',
            'totalAcres',
            'phone',
            'lastInspection',
            'overdueScouts',
            'linkedExporter',
            'complianceStatus',
            'mobileFarmFromApp',
        )

    def get_farmName(self, obj):
        farm = _pest_farm_latest_for_profile(obj)
        if farm and (farm.farm_name or '').strip():
            return farm.farm_name.strip()
        return (obj.farm_name or obj.owner or '').strip()

    def get_location(self, obj):
        farm = _pest_farm_latest_for_profile(obj)
        if farm and (farm.location or '').strip():
            return farm.location.strip()
        return (obj.location or '').strip()

    def get_totalAcres(self, obj):
        farm = _pest_farm_latest_for_profile(obj)
        if farm is not None:
            fs = float(farm.farm_size or 0)
            if 0 < fs < 10**7:
                return round(fs, 2)
        return round(float(obj.total_acres or 0), 2)

    def get_mobileFarmFromApp(self, obj):
        return _serialize_pest_scouting_farm_row(_pest_farm_latest_for_profile(obj))

    def get_weeklyScoutingLogs(self, obj):
        v = obj.weekly_scouting_logs_4w or []
        v = list(v)[:4]
        while len(v) < 4:
            v.append(0)
        return v

    def get_lastScoutingResult(self, obj):
        return {
            'status': obj.last_scouting_status or 'no-pests',
            'finding': obj.last_scouting_finding or '',
        }

    def get_linkedExporter(self, obj):
        return str(obj.linked_exporter_id) if obj.linked_exporter_id else None


class FarmerDetailSerializer(serializers.ModelSerializer):
    farmerCode = serializers.CharField(source='farmer_code')
    hcdaRegNo = serializers.SerializerMethodField()
    farmName = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    subCounty = serializers.CharField(source='sub_county')
    phone = serializers.CharField(source='user.phone_number')
    email = serializers.CharField(source='user.email', allow_null=True)
    primaryChannel = serializers.CharField(source='primary_channel')
    registrationDate = serializers.SerializerMethodField()
    totalAcres = serializers.SerializerMethodField()
    blocksManaged = serializers.SerializerMethodField()
    treesCount = serializers.SerializerMethodField()
    exportEligibility = serializers.CharField(source='export_eligibility')
    lastScoutingResult = serializers.SerializerMethodField()
    weeklyScoutingLogs = serializers.SerializerMethodField()
    complianceScore = serializers.SerializerMethodField()
    activeCases = serializers.SerializerMethodField()
    recentActivities = serializers.SerializerMethodField()
    blocks = serializers.SerializerMethodField()
    complianceStatus = serializers.CharField(source='agronomist_compliance_status')
    trapLogsFromApp = serializers.SerializerMethodField()
    problemReportsFromApp = serializers.SerializerMethodField()
    mobileFarmFromApp = serializers.SerializerMethodField()
    latestScoutingFromApp = serializers.SerializerMethodField()

    class Meta:
        model = FarmerProfile
        fields = (
            'id',
            'farmerCode',
            'hcdaRegNo',
            'name',
            'farmName',
            'location',
            'county',
            'ward',
            'subCounty',
            'phone',
            'email',
            'primaryChannel',
            'registrationDate',
            'totalAcres',
            'blocksManaged',
            'treesCount',
            'exportEligibility',
            'lastScoutingResult',
            'weeklyScoutingLogs',
            'complianceScore',
            'complianceStatus',
            'activeCases',
            'recentActivities',
            'blocks',
            'trapLogsFromApp',
            'problemReportsFromApp',
            'mobileFarmFromApp',
            'latestScoutingFromApp',
        )

    def get_hcdaRegNo(self, obj):
        return (obj.farmer_code or '').strip()

    def get_farmName(self, obj):
        farm = _pest_farm_latest_for_profile(obj)
        if farm and (farm.farm_name or '').strip():
            return farm.farm_name.strip()
        return obj.farm_name or ''

    def get_location(self, obj):
        farm = _pest_farm_latest_for_profile(obj)
        if farm and (farm.location or '').strip():
            return farm.location.strip()
        return obj.location or ''

    def get_registrationDate(self, obj):
        return obj.registration_date.isoformat() if obj.registration_date else ''

    def get_totalAcres(self, obj):
        farm = _pest_farm_latest_for_profile(obj)
        if farm is not None:
            fs = float(farm.farm_size or 0)
            if 0 < fs < 10**7:
                return round(fs, 2)
        ta = float(obj.total_acres or 0)
        return round(ta, 2)

    def get_blocksManaged(self, obj):
        farm = _pest_farm_latest_for_profile(obj)
        if farm is not None:
            nb = _sanitize_block_count(farm.number_of_blocks)
            if nb is not None:
                return nb
        try:
            from pest_scouting.models import FarmBlock as PsFarmBlock
        except ImportError:
            PsFarmBlock = None  # type: ignore
        if PsFarmBlock is not None:
            n = PsFarmBlock.objects.filter(farmer_id=obj.user_id).count()
            if n:
                return min(n, 50_000)
        return int(obj.blocks_managed or 0)

    def get_treesCount(self, obj):
        try:
            from pest_scouting.models import FarmBlock as PsFarmBlock
        except ImportError:
            PsFarmBlock = None  # type: ignore
        if PsFarmBlock is not None:
            agg = PsFarmBlock.objects.filter(farmer_id=obj.user_id).aggregate(s=Sum('number_of_trees'))
            s = agg.get('s')
            if s is not None and s < _INT_SENTINEL:
                return min(int(s), 50_000_000)
        return int(obj.trees_count or 0)

    def get_mobileFarmFromApp(self, obj):
        return _serialize_pest_scouting_farm_row(_pest_farm_latest_for_profile(obj))

    def get_trapLogsFromApp(self, obj):
        try:
            from pest_scouting.models import TrapLog
        except ImportError:
            return []
        out = []
        for t in TrapLog.objects.filter(farmer_id=obj.user_id).order_by('-timestamp')[:12]:
            n = t.number_of_traps
            if n >= _INT_SENTINEL - 1000:
                n = 0
            out.append(
                {
                    'trapName': t.trap_name,
                    'numberOfTraps': int(n),
                    'photo': t.photo or '',
                    'timestamp': t.timestamp.isoformat() if t.timestamp else '',
                }
            )
        return out

    def get_problemReportsFromApp(self, obj):
        try:
            from pest_scouting.models import ProblemReport
        except ImportError:
            return []
        out = []
        for pr in ProblemReport.objects.filter(farmer_id=obj.user_id).order_by('-timestamp')[:8]:
            out.append(
                {
                    'problemType': pr.problem_type,
                    'urgency': pr.urgency,
                    'description': (pr.description or '')[:500],
                    'photo': pr.photo or '',
                    'timestamp': pr.timestamp.isoformat() if pr.timestamp else '',
                }
            )
        return out

    def get_latestScoutingFromApp(self, obj):
        try:
            from pest_scouting.models import WeeklyRecord
        except ImportError:
            return None

        rec = WeeklyRecord.objects.filter(farmer_id=obj.user_id).order_by('-timestamp').first()
        if not rec:
            return None

        from pest_scouting.record_payload import weekly_record_display_payload

        raw = weekly_record_display_payload(rec)

        def as_list(v):
            if isinstance(v, list):
                return [x for x in v if x not in (None, '')]
            if isinstance(v, str) and v.strip():
                return [v.strip()]
            return []

        from pest_scouting.media_urls import weekly_record_image_urls

        blk = getattr(rec, 'block', None)
        block_name = getattr(blk, 'block_name', '') if blk else ''
        block_trees = getattr(blk, 'number_of_trees', None) if blk else None

        gps_lat = raw.get('gps_latitude', None)
        gps_lng = raw.get('gps_longitude', None)

        trap_use = raw.get('trap_use', None)
        if not isinstance(trap_use, list):
            # backward compatible (single trap fields on model)
            trap_use = []
            if getattr(rec, 'type_of_trap', None):
                trap_use.append(
                    {
                        'type_of_trap': rec.type_of_trap,
                        'number_of_trap': int(getattr(rec, 'number_of_trap', 0) or 0),
                        'average_no_of_pest_per_trap': float(getattr(rec, 'pests_per_trap', 0) or 0),
                    }
                )

        return {
            'id': str(rec.id),
            'timestamp': rec.timestamp.isoformat() if rec.timestamp else '',
            'farmName': str(raw.get('farm_name') or ''),
            'location': str(raw.get('location') or ''),
            'blockName': block_name,
            'blockTrees': _sanitize_tree_count(block_trees),
            'variety': str(raw.get('variety') or getattr(rec, 'variety', '') or ''),
            'anyPestsObserved': str(raw.get('any_pests_observed') or getattr(rec, 'any_pests_observed', '') or ''),
            'pestsObserved': as_list(raw.get('pests_observed') or raw.get('pests_observed_list') or getattr(rec, 'pests_observed_list', [])),
            'beneficialInsectsObserved': as_list(
                raw.get('beneficial_insects_observed') or raw.get('beneficial_insects_observed_list') or getattr(rec, 'beneficial_insects_observed_list', [])
            ),
            'anyDiseasesObserved': str(raw.get('any_diseases_observed') or getattr(rec, 'any_diseases_observed', '') or ''),
            'diseasesObserved': as_list(raw.get('disease') or raw.get('disease_list') or getattr(rec, 'disease_list', [])),
            'diseasePlantPart': as_list(raw.get('disease_plant_part') or raw.get('disease_plant_parts_list') or getattr(rec, 'disease_plant_parts_list', [])),
            'diseaseCropStage': str(raw.get('disease_crop_stage') or getattr(rec, 'disease_crop_stage', '') or ''),
            'diseaseDetectionMethod': str(raw.get('disease_detection_method') or getattr(rec, 'disease_detection_method', '') or ''),
            'trapUse': trap_use,
            'actionsTaken': as_list(raw.get('actions_taken') or raw.get('actions_taken_list') or getattr(rec, 'actions_taken_list', [])),
            'outcome': str(raw.get('outcome') or getattr(rec, 'outcome', '') or ''),
            'otherProductionChallenges': as_list(raw.get('other_production_challenges') or raw.get('other_production_challenges_list') or []),
            'additionalNotes': str(raw.get('additional_notes') or getattr(rec, 'additional_notes', '') or ''),
            'gpsLatitude': str(gps_lat) if gps_lat not in (None, '') else '',
            'gpsLongitude': str(gps_lng) if gps_lng not in (None, '') else '',
            'mediaUrls': weekly_record_image_urls(rec, self.context.get('request')),
        }

    def get_lastScoutingResult(self, obj):
        out = {
            'status': obj.last_scouting_status or 'no-pests',
            'finding': obj.last_scouting_finding or '',
            'date': obj.last_scouting_date or '',
            'scoutName': obj.last_scouting_scout_name or '',
        }
        try:
            from pest_scouting.models import WeeklyRecord
        except ImportError:
            return out
        rec = WeeklyRecord.objects.filter(farmer_id=obj.user_id).order_by('-timestamp').first()
        if not rec:
            return out
        raw = rec.raw_payload if isinstance(rec.raw_payload, dict) else {}
        if rec.timestamp:
            out['date'] = timezone.localtime(rec.timestamp).strftime('%Y-%m-%d')
        scout_name = _display_user_name(rec.farmer)
        if scout_name:
            out['scoutName'] = out['scoutName'] or scout_name
        pests_yes = str(raw.get('any_pests_observed', '')).strip().lower() == 'yes'
        disease_yes = str(raw.get('any_diseases_observed', '')).strip().lower() == 'yes'
        if pests_yes or disease_yes:
            out['status'] = 'pests'
            bits = []
            if pests_yes:
                bits.append('Pests observed')
            if disease_yes:
                bits.append('Diseases observed')
            if bits and not (out.get('finding') or '').strip():
                out['finding'] = '; '.join(bits)
        return out

    def get_weeklyScoutingLogs(self, obj):
        return _weekly_scouting_logs_for_farmer(obj)

    def get_complianceScore(self, obj):
        logs = _weekly_scouting_logs_for_farmer(obj)
        if not logs:
            return 0
        completed = sum(1 for x in logs if x.get('completed'))
        return int(round((completed / 4) * 100))

    def get_activeCases(self, obj):
        qs = obj.cases.all()[:10]
        return [
            {
                'id': str(c.id),
                'issue': c.pest_disease,
                'severity': c.severity,
                'status': c.status,
                'date': c.date_submitted.isoformat() if c.date_submitted else '',
            }
            for c in qs
        ]

    def get_recentActivities(self, obj):
        rows = []
        uid = obj.user_id
        try:
            from pest_scouting.models import ProblemReport, WeeklyRecord
        except ImportError:
            return []

        for rec in WeeklyRecord.objects.filter(farmer_id=uid).order_by('-timestamp')[:6]:
            raw = rec.raw_payload if isinstance(rec.raw_payload, dict) else {}
            blk = getattr(rec, 'block', None)
            farm_label = (raw.get('farm_name') or '') or (blk.block_name if blk else '')
            desc = f'Weekly scouting{f" — {farm_label}" if farm_label else ""}'
            ap = str(raw.get('any_pests_observed', '')).strip().lower()
            ad = str(raw.get('any_diseases_observed', '')).strip().lower()
            if ap == 'yes' or ad == 'yes':
                desc += ' (issues reported)'
            ts = rec.timestamp
            rows.append(
                {
                    '_ts': ts,
                    'type': 'scouting',
                    'description': desc[:240],
                    'date': timezone.localtime(ts).strftime('%Y-%m-%d %H:%M') if ts else '',
                    'user': _display_user_name(rec.farmer),
                }
            )

        for pr in ProblemReport.objects.filter(farmer_id=uid).order_by('-timestamp')[:5]:
            ts = pr.timestamp
            rows.append(
                {
                    '_ts': ts,
                    'type': 'report',
                    'description': f'Problem report ({pr.problem_type}){((": " + pr.description[:160]) if pr.description else "")}',
                    'date': timezone.localtime(ts).strftime('%Y-%m-%d %H:%M') if ts else '',
                    'user': _display_user_name(pr.farmer),
                }
            )

        rows.sort(
            key=lambda r: r['_ts'].timestamp() if r.get('_ts') else 0.0,
            reverse=True,
        )
        return [{k: v for k, v in r.items() if k != '_ts'} for r in rows[:10]]

    def get_blocks(self, obj):
        try:
            from pest_scouting.models import FarmBlock as PsFarmBlock
        except ImportError:
            PsFarmBlock = None  # type: ignore

        if PsFarmBlock is not None:
            ps_blocks = list(PsFarmBlock.objects.filter(farmer_id=obj.user_id).order_by('-timestamp')[:24])
            if ps_blocks:
                return [
                    {
                        'id': str(b.id),
                        'name': b.block_name,
                        'acres': 0.0,
                        'trees': _sanitize_tree_count(b.number_of_trees),
                        'status': 'healthy',
                        'lastInspection': timezone.localtime(b.timestamp).strftime('%Y-%m-%d') if b.timestamp else '',
                        'source': 'app',
                    }
                    for b in ps_blocks
                ]

        return [
            {
                'id': str(b.id),
                'name': b.name,
                'acres': b.acres,
                'trees': b.trees,
                'status': b.status,
                'lastInspection': b.last_inspection,
                'source': 'registry',
            }
            for b in obj.blocks.all()
        ]


class FarmerComplianceStatusPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = ('agronomist_compliance_status',)


class CaseManagementRowSerializer(serializers.ModelSerializer):
    caseCode = serializers.CharField(source='case_code', read_only=True)
    farm = serializers.CharField(source='farmer.farm_name')
    block = serializers.SerializerMethodField()
    pestDisease = serializers.CharField(source='pest_disease')
    pestDiseaseKiswahili = serializers.CharField(source='pest_disease_kiswahili')
    dateSubmitted = serializers.SerializerMethodField()
    scoutName = serializers.CharField(source='scout_name')
    location = serializers.CharField(source='farmer.location')
    affectedTrees = serializers.IntegerField(source='affected_trees')
    channel = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = (
            'id',
            'caseCode',
            'severity',
            'farm',
            'block',
            'pestDisease',
            'pestDiseaseKiswahili',
            'dateSubmitted',
            'status',
            'scoutName',
            'location',
            'affectedTrees',
            'symptoms',
            'notes',
            'channel',
        )

    def get_block(self, obj):
        return obj.block.name if obj.block_id else ''

    def get_dateSubmitted(self, obj):
        return obj.date_submitted.isoformat() if obj.date_submitted else ''

    def get_channel(self, obj):
        v = (obj.submission_channel or '').lower()
        return 'ussd' if 'ussd' in v else 'smartphone'


class CaseDetailSerializer(serializers.ModelSerializer):
    caseCode = serializers.CharField(source='case_code', read_only=True)
    farmerName = serializers.CharField(source='farmer.name')
    farmerPhone = serializers.CharField(source='farmer.user.phone_number')
    location = serializers.CharField(source='farmer.location')
    subCounty = serializers.CharField(source='farmer.sub_county')
    farm = serializers.CharField(source='farmer.farm_name')
    block = serializers.SerializerMethodField()
    blockCoordinates = serializers.SerializerMethodField()
    submissionChannel = serializers.CharField(source='submission_channel')
    pestDisease = serializers.CharField(source='pest_disease')
    pestDiseaseKiswahili = serializers.CharField(source='pest_disease_kiswahili')
    dateSubmitted = serializers.SerializerMethodField()
    scoutName = serializers.CharField(source='scout_name')
    scoutPhone = serializers.CharField(source='scout_phone')
    affectedTrees = serializers.IntegerField(source='affected_trees')
    symptomCodes = serializers.ListField(source='symptom_codes')
    photos = serializers.SerializerMethodField()
    voiceNote = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = (
            'id',
            'caseCode',
            'farmerName',
            'farmerPhone',
            'location',
            'subCounty',
            'farm',
            'block',
            'blockCoordinates',
            'severity',
            'submissionChannel',
            'pestDisease',
            'pestDiseaseKiswahili',
            'dateSubmitted',
            'scoutName',
            'scoutPhone',
            'affectedTrees',
            'symptoms',
            'symptomCodes',
            'notes',
            'photos',
            'voiceNote',
            'timeline',
        )

    def get_block(self, obj):
        return obj.block.name if obj.block_id else ''

    def get_blockCoordinates(self, obj):
        if not obj.block_id:
            return {'lat': 0, 'lng': 0}
        return {'lat': obj.block.latitude or 0, 'lng': obj.block.longitude or 0}

    def get_dateSubmitted(self, obj):
        return obj.date_submitted.isoformat() if obj.date_submitted else ''

    def get_photos(self, obj):
        return []

    def get_voiceNote(self, obj):
        return {'duration': '', 'url': ''}

    def get_timeline(self, obj):
        return [
            {
                'stage': 'Submitted',
                'timestamp': self.get_dateSubmitted(obj),
                'status': 'complete' if obj.date_submitted else 'pending',
            },
            {
                'stage': 'Under review',
                'timestamp': None,
                'status': 'pending' if obj.status == 'new' else 'complete',
            },
            {'stage': 'Advisory issued', 'timestamp': None, 'status': 'pending'},
        ]


class ScoutingFeedItemSerializer(serializers.ModelSerializer):
    recordCode = serializers.CharField(source='record_code', read_only=True)
    farmerId = serializers.UUIDField(source='farmer_id', read_only=True)
    blockUuid = serializers.UUIDField(source='block_id', read_only=True, allow_null=True)

    farmName = serializers.CharField(source='farmer.farm_name')
    blockId = serializers.SerializerMethodField()
    farmerName = serializers.CharField(source='farmer.name')
    mediaPreview = serializers.CharField(source='media_preview', allow_blank=True)
    ussdCode = serializers.CharField(source='ussd_code', allow_blank=True)
    timestamp = serializers.SerializerMethodField()
    county = serializers.CharField(source='farmer.county', allow_blank=True)
    assignedTo = serializers.SerializerMethodField()

    class Meta:
        model = ScoutingReport
        fields = (
            'id',
            'recordCode',
            'farmerId',
            'blockUuid',
            'farmName',
            'blockId',
            'farmerName',
            'severity',
            'source',
            'finding',
            'status',
            'mediaPreview',
            'ussdCode',
            'timestamp',
            'reviewed',
            'county',
            'assignedTo',
        )

    def get_blockId(self, obj):
        return obj.block.name if obj.block_id else ''

    def get_timestamp(self, obj):
        dt = obj.submitted_at
        if not dt:
            return ''
        return f"{dt.day} {dt.strftime('%b')}, {dt.strftime('%H:%M')}"

    def get_assignedTo(self, obj):
        u = obj.assigned_to
        if not u:
            return None
        name = f'{getattr(u, "first_name", "")} {getattr(u, "last_name", "")}'.strip()
        return name or getattr(u, 'phone_number', None)


class ScoutingReportWriteSerializer(serializers.ModelSerializer):
    farmer = serializers.PrimaryKeyRelatedField(queryset=FarmerProfile.objects.all())
    block = serializers.PrimaryKeyRelatedField(queryset=FarmBlock.objects.all(), allow_null=True, required=False)

    class Meta:
        model = ScoutingReport
        fields = (
            'farmer',
            'block',
            'source',
            'severity',
            'finding',
            'status',
            'media_preview',
            'ussd_code',
            'scout_name',
        )

    def validate(self, attrs):
        farmer = attrs.get('farmer')
        block = attrs.get('block')
        if farmer and block and block.farmer_id != farmer.id:
            raise serializers.ValidationError({'block': 'Block does not belong to this farmer.'})
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if user and user.is_authenticated and not is_admin_like(user):
            if role_name(user) == ROLE_FARMER:
                fp = getattr(user, 'farmer_profile', None)
                if not fp or str(farmer.id) != str(fp.id):
                    raise serializers.ValidationError({'farmer': 'You may only submit scouting for your own farm.'})
        return attrs


class ScoutingReportPatchSerializer(serializers.ModelSerializer):
    # allow null/undefined; validated in view
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=USER_MODEL.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = ScoutingReport
        fields = ('reviewed', 'assigned_to')


class CaseCreateSerializer(serializers.ModelSerializer):
    scouting_report = serializers.PrimaryKeyRelatedField(
        queryset=ScoutingReport.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Case
        fields = (
            'farmer',
            'block',
            'scouting_report',
            'pest_disease',
            'pest_disease_kiswahili',
            'severity',
            'notes',
            'assigned_agronomist',
            'affected_trees',
            'scout_name',
            'scout_phone',
            'submission_channel',
        )
        extra_kwargs = {
            'farmer': {'required': True},
            'block': {'required': False, 'allow_null': True},
            'pest_disease': {'required': False, 'allow_blank': True},
            'pest_disease_kiswahili': {'required': False, 'allow_blank': True},
            'severity': {'required': False},
            'notes': {'required': False, 'allow_blank': True},
            'assigned_agronomist': {'required': False, 'allow_null': True},
            'affected_trees': {'required': False},
            'scout_name': {'required': False, 'allow_blank': True},
            'scout_phone': {'required': False, 'allow_blank': True},
            'submission_channel': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        farmer = attrs.get('farmer')
        block = attrs.get('block')
        report = attrs.get('scouting_report')

        if report and report.related_case_id:
            raise serializers.ValidationError(
                {'scouting_report': 'This scouting submission already has a linked case.'}
            )

        if report:
            if farmer and report.farmer_id != farmer.id:
                raise serializers.ValidationError({'scouting_report': 'Report does not match farmer.'})
            if block and report.block_id and report.block_id != block.id:
                raise serializers.ValidationError({'block': 'Block does not match scouting report.'})

        if not report and not (attrs.get('pest_disease') or '').strip():
            raise serializers.ValidationError({'pest_disease': 'Provide a case title/issue or link a scouting report.'})

        return attrs

    def create(self, validated_data):
        report = validated_data.pop('scouting_report', None)
        request = self.context.get('request')

        if report:
            if not (validated_data.get('pest_disease') or '').strip():
                validated_data['pest_disease'] = (report.finding or '').strip() or 'Scouting follow-up'

            sev = validated_data.get('severity')
            if not sev or sev == Case.Severity.UNKNOWN:
                if report.severity in (Case.Severity.HIGH, Case.Severity.MEDIUM, Case.Severity.LOW):
                    validated_data['severity'] = report.severity
                else:
                    validated_data['severity'] = Case.Severity.MEDIUM

            if not (validated_data.get('submission_channel') or '').strip():
                validated_data['submission_channel'] = (
                    'ussd' if report.source == ScoutingReport.Source.USSD else 'smartphone'
                )

            if not (validated_data.get('scout_name') or '').strip():
                validated_data['scout_name'] = (report.scout_name or '').strip() or (report.farmer.name or '')

            if not validated_data.get('block') and report.block_id:
                validated_data['block'] = report.block

        validated_data.setdefault('date_submitted', timezone.now())
        validated_data.setdefault('status', 'new')
        if not validated_data.get('severity'):
            validated_data['severity'] = Case.Severity.UNKNOWN

        # Auto-assign if the caller is an agronomist and didn't specify.
        if 'assigned_agronomist' not in validated_data:
            if request and request.user.is_authenticated and role_name(request.user) == ROLE_AGRONOMIST:
                validated_data['assigned_agronomist'] = request.user

        case = Case.objects.create(**validated_data)

        if report:
            report.related_case = case
            report.reviewed = ScoutingReport.ReviewStatus.UNDER_REVIEW
            report.save(update_fields=['related_case', 'reviewed'])

        return case

