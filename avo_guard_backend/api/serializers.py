from __future__ import annotations

from django.utils import timezone
from django.apps import apps
from django.conf import settings as dj_settings
from rest_framework import serializers

from accounts.models import Entity, AppPermission, Role  # noqa: F401  (used by DRF schema/readability)

from .models import AlertRule, Case, FarmBlock, FarmerProfile, ScoutingReport
from .rbac import ROLE_AGRONOMIST, ROLE_FARMER, is_admin_like, role_name

USER_MODEL = apps.get_model(*dj_settings.AUTH_USER_MODEL.split('.'))


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


class FarmerListSerializer(serializers.ModelSerializer):
    farmerCode = serializers.CharField(source='farmer_code')
    primaryChannel = serializers.CharField(source='primary_channel')
    weeklyScoutingLogs = serializers.SerializerMethodField()
    lastScoutingResult = serializers.SerializerMethodField()
    exportEligibility = serializers.CharField(source='export_eligibility')
    totalAcres = serializers.FloatField(source='total_acres')
    phone = serializers.CharField(source='user.phone_number')
    lastInspection = serializers.CharField(source='last_inspection')
    overdueScouts = serializers.BooleanField(source='overdue_scouts')
    linkedExporter = serializers.SerializerMethodField()
    complianceStatus = serializers.CharField(source='agronomist_compliance_status')

    class Meta:
        model = FarmerProfile
        fields = (
            'id',
            'farmerCode',
            'name',
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
        )

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
    farmName = serializers.CharField(source='farm_name')
    subCounty = serializers.CharField(source='sub_county')
    phone = serializers.CharField(source='user.phone_number')
    email = serializers.CharField(source='user.email', allow_null=True)
    primaryChannel = serializers.CharField(source='primary_channel')
    registrationDate = serializers.SerializerMethodField()
    totalAcres = serializers.FloatField(source='total_acres')
    blocksManaged = serializers.IntegerField(source='blocks_managed')
    treesCount = serializers.IntegerField(source='trees_count')
    exportEligibility = serializers.CharField(source='export_eligibility')
    lastScoutingResult = serializers.SerializerMethodField()
    weeklyScoutingLogs = serializers.SerializerMethodField()
    complianceScore = serializers.SerializerMethodField()
    activeCases = serializers.SerializerMethodField()
    recentActivities = serializers.SerializerMethodField()
    blocks = serializers.SerializerMethodField()
    complianceStatus = serializers.CharField(source='agronomist_compliance_status')

    class Meta:
        model = FarmerProfile
        fields = (
            'id',
            'farmerCode',
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
        )

    def get_registrationDate(self, obj):
        return obj.registration_date.isoformat() if obj.registration_date else ''

    def get_lastScoutingResult(self, obj):
        return {
            'status': obj.last_scouting_status or 'no-pests',
            'finding': obj.last_scouting_finding or '',
            'date': obj.last_scouting_date or '',
            'scoutName': obj.last_scouting_scout_name or '',
        }

    def get_weeklyScoutingLogs(self, obj):
        logs = list(obj.weekly_scouting_logs_4w or [])[:4]
        out = []
        for i, v in enumerate(logs):
            out.append({'week': f'W-{4 - i}', 'completed': bool(v), 'date': '', 'scout': ''})
        while len(out) < 4:
            out.append({'week': f'W-{4 - len(out)}', 'completed': False, 'date': '', 'scout': ''})
        return out

    def get_complianceScore(self, obj):
        logs = list(obj.weekly_scouting_logs_4w or [])[:4]
        if not logs:
            return 0
        completed = sum(1 for x in logs[:4] if int(x) == 1)
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
        return []

    def get_blocks(self, obj):
        return [
            {
                'id': str(b.id),
                'name': b.name,
                'acres': b.acres,
                'trees': b.trees,
                'status': b.status,
                'lastInspection': b.last_inspection,
            }
            for b in obj.blocks.all()
        ]


class FarmerComplianceStatusPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = ('agronomist_compliance_status',)

    def get_registrationDate(self, obj):
        return obj.registration_date.isoformat() if obj.registration_date else ''

    def get_lastScoutingResult(self, obj):
        return {
            'status': obj.last_scouting_status or 'no-pests',
            'finding': obj.last_scouting_finding or '',
            'date': obj.last_scouting_date or '',
            'scoutName': obj.last_scouting_scout_name or '',
        }

    def get_weeklyScoutingLogs(self, obj):
        logs = list(obj.weekly_scouting_logs_4w or [])[:4]
        out = []
        for i, v in enumerate(logs):
            out.append({'week': f'W-{4 - i}', 'completed': bool(v), 'date': '', 'scout': ''})
        while len(out) < 4:
            out.append({'week': f'W-{4 - len(out)}', 'completed': False, 'date': '', 'scout': ''})
        return out

    def get_complianceScore(self, obj):
        logs = list(obj.weekly_scouting_logs_4w or [])[:4]
        if not logs:
            return 0
        completed = sum(1 for x in logs[:4] if int(x) == 1)
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
        return []

    def get_blocks(self, obj):
        return [
            {
                'id': str(b.id),
                'name': b.name,
                'acres': b.acres,
                'trees': b.trees,
                'status': b.status,
                'lastInspection': b.last_inspection,
            }
            for b in obj.blocks.all()
        ]


class CaseManagementRowSerializer(serializers.ModelSerializer):
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

