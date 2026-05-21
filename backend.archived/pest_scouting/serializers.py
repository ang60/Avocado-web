from rest_framework import serializers
from .models import Farm, FarmBlock, ProblemReport, TrapLog, WeeklyRecord, ScoutingReview, ScoutingSession
from drf_spectacular.utils import extend_schema_field

_RAW_PHOTO_KEYS = (
    'dont_know_variety_photo',
    'dont_know_trap_photo',
    'other_trap_photo',
    'dont_know_pest_photo',
    'dont_know_beneficial_insects_observed_photo',
    # USSD / long-form keys seen in fixtures and older payloads
    '3_select_pests_observed_i_dont_know_photo',
)


def _looks_like_media_url(value: str) -> bool:
    s = value.strip()
    if not s:
        return False
    if s.startswith(('http://', 'https://', '/media/')):
        return True
    low = s.split('?')[0].lower()
    return low.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.m4a', '.mp3', '.aac', '.wav', '.ogg'))


def weekly_media_gallery_urls(obj: WeeklyRecord) -> list[str]:
    """Collect signed URLs and uploaded files for the agronomist review UI."""
    urls: list[str] = []
    try:
        if obj.voice_note:
            u = obj.voice_note.url
            if u:
                urls.append(u)
    except Exception:
        pass
    raw = obj.raw_payload or {}
    if isinstance(raw, dict):
        for key in _RAW_PHOTO_KEYS:
            v = raw.get(key)
            if isinstance(v, str) and _looks_like_media_url(v):
                urls.append(v.strip())
        tu = raw.get('trap_use')
        if isinstance(tu, list):
            for row in tu:
                if not isinstance(row, dict):
                    continue
                p = row.get('photo')
                if isinstance(p, str) and _looks_like_media_url(p):
                    urls.append(p.strip())
        po = raw.get('pests_observed')
        if isinstance(po, list):
            for row in po:
                if not isinstance(row, dict):
                    continue
                p = row.get('photo')
                if isinstance(p, str) and _looks_like_media_url(p):
                    urls.append(p.strip())
        # Any remaining *_photo values (mobile may add new keys)
        for key, v in raw.items():
            if not isinstance(key, str) or 'photo' not in key.lower():
                continue
            if key in _RAW_PHOTO_KEYS or key == '3_select_pests_observed_i_dont_know_photo':
                continue
            if isinstance(v, str) and _looks_like_media_url(v):
                urls.append(v.strip())
    seen: set[str] = set()
    out: list[str] = []
    for u in urls:
        if u and u not in seen:
            seen.add(u)
            out.append(u)
    return out


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ('id', 'farm_name', 'location', 'number_of_blocks', 'farm_size', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class TrapLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrapLog
        fields = ('id', 'farmer', 'farm', 'trap_name', 'number_of_traps', 'photo', 'timestamp')
        read_only_fields = ('id', 'farmer', 'timestamp')


class ProblemReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemReport
        fields = ('id', 'farmer', 'problem_type', 'urgency', 'photo', 'description', 'timestamp')
        read_only_fields = ('id', 'farmer', 'timestamp')


class FarmBlockSerializer(serializers.ModelSerializer):
    """Mobile expects nested `farm_name`: { id, farm_name } on each block."""

    farm_name = serializers.SerializerMethodField()

    class Meta:
        model = FarmBlock
        fields = '__all__'
        # farmer is set from request.user in the viewset (perform_create),
        # so clients should not be forced to send it.
        read_only_fields = ('id', 'timestamp', 'farmer', 'farm_name')

    @extend_schema_field(serializers.DictField(child=serializers.CharField()))
    def get_farm_name(self, obj):
        f = obj.farm
        if not f:
            return None
        return {'id': str(f.id), 'farm_name': f.farm_name}


class ScoutingSessionSerializer(serializers.ModelSerializer):
    block_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        allow_empty=True,
    )
    record_count = serializers.IntegerField(source='records.count', read_only=True)

    class Meta:
        model = ScoutingSession
        fields = '__all__'
        read_only_fields = ('id', 'farmer', 'started_at', 'completed_at', 'updated_at', 'record_count')


class WeeklyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyRecord
        fields = '__all__'
        read_only_fields = ('id', 'timestamp', 'farmer')


class ScoutingReportSerializer(serializers.ModelSerializer):
    farmerId = serializers.UUIDField(source='farmer.id', read_only=True)
    blockUuid = serializers.UUIDField(source='block.id', read_only=True)
    farmName = serializers.SerializerMethodField()
    blockId = serializers.CharField(source='block.block_name')
    farmerName = serializers.SerializerMethodField()
    severity = serializers.SerializerMethodField()
    source = serializers.CharField(default='app')  # Defaulting to app as per model fields availability
    finding = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    mediaPreview = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    # UI uses `reviewed` as a workflow state:
    # - 'new' => needs review (no triage_review yet)
    # - 'under-review' => review exists but not confirmed
    # - 'reviewed' => confirmed review exists
    reviewed = serializers.SerializerMethodField()
    county = serializers.CharField(source='farmer.county')
    assignedTo = serializers.SerializerMethodField()
    triageStatus = serializers.SerializerMethodField()
    triageLabel = serializers.SerializerMethodField()
    triagedAt = serializers.SerializerMethodField()
    managementProtocol = serializers.SerializerMethodField()
    reviewNotes = serializers.SerializerMethodField()
    pushedToFarmer = serializers.SerializerMethodField()
    auditFlags = serializers.SerializerMethodField()
    rawTimestamp = serializers.SerializerMethodField()
    pestsObservedList = serializers.ListField(source='pests_observed_list', child=serializers.CharField(), read_only=True)
    diseasesObservedList = serializers.ListField(source='disease_list', child=serializers.CharField(), read_only=True)
    beneficialInsectsObservedList = serializers.ListField(source='beneficial_insects_observed_list', child=serializers.CharField(), read_only=True)
    pestPlantPartsAffectedList = serializers.ListField(source='pest_plant_parts_affected_list', child=serializers.CharField(), read_only=True)
    diseasePlantPartsAffectedList = serializers.ListField(source='disease_plant_parts_list', child=serializers.CharField(), read_only=True)
    actionsTakenList = serializers.ListField(source='actions_taken_list', child=serializers.CharField(), read_only=True)
    outcomeList = serializers.ListField(source='outcome_list', child=serializers.CharField(), read_only=True)
    rawPayload = serializers.JSONField(source='raw_payload', read_only=True)
    variety = serializers.CharField(read_only=True)
    reportLocation = serializers.CharField(source='location', read_only=True)
    blockTreeCount = serializers.SerializerMethodField()
    startDate = serializers.DateField(source='start_date', read_only=True)
    endDate = serializers.DateField(source='end_date', read_only=True)
    additionalNotes = serializers.CharField(source='additional_notes', read_only=True, allow_null=True)
    remarks = serializers.CharField(read_only=True, allow_null=True)
    gpsLatitude = serializers.SerializerMethodField()
    gpsLongitude = serializers.SerializerMethodField()
    mediaGallery = serializers.SerializerMethodField()
    recordTypeOfTrap = serializers.CharField(source='type_of_trap', read_only=True)
    recordNumberOfTrap = serializers.IntegerField(source='number_of_trap', read_only=True)
    recordTrapsReplaced = serializers.IntegerField(source='traps_replaced', read_only=True)
    recordPestsPerTrap = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyRecord
        fields = [
            'id', 'farmerId', 'blockUuid', 'farmName', 'blockId', 'farmerName', 'severity', 'source',
            'finding', 'status', 'mediaPreview', 'timestamp', 'reviewed',
            'county',
            'assignedTo',
            'triageStatus',
            'triageLabel',
            'triagedAt',
            'managementProtocol',
            'reviewNotes',
            'pushedToFarmer',
            'auditFlags',
            'rawTimestamp',
            'pestsObservedList', 'diseasesObservedList', 'beneficialInsectsObservedList',
            'pestPlantPartsAffectedList', 'diseasePlantPartsAffectedList',
            'actionsTakenList', 'outcomeList', 'rawPayload',
            'variety', 'reportLocation', 'blockTreeCount', 'startDate', 'endDate',
            'additionalNotes', 'remarks', 'gpsLatitude', 'gpsLongitude', 'mediaGallery',
            'recordTypeOfTrap', 'recordNumberOfTrap', 'recordTrapsReplaced', 'recordPestsPerTrap',
        ]

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_recordPestsPerTrap(self, obj):
        if obj.pests_per_trap is None:
            return None
        return format(obj.pests_per_trap, 'f').rstrip('0').rstrip('.') or '0'

    @extend_schema_field(serializers.CharField())
    def get_farmName(self, obj):
        raw = obj.raw_payload if isinstance(obj.raw_payload, dict) else {}
        fn = str(raw.get('farm_name') or '').strip()
        if fn:
            return fn
        try:
            from pest_scouting.models import Farm

            farm = Farm.objects.filter(farmer_id=obj.farmer_id).order_by('-updated_at').values_list('farm_name', flat=True).first()
            if farm and str(farm).strip():
                return str(farm).strip()
        except Exception:
            pass
        entity = getattr(obj.farmer, 'entity', None)
        if entity and getattr(entity, 'company_name', None):
            return entity.company_name
        fp = getattr(obj.farmer, 'farmer_profile', None)
        if fp and (fp.farm_name or '').strip():
            return fp.farm_name.strip()
        return 'Individual Farmer'

    @extend_schema_field(serializers.CharField())
    def get_farmerName(self, obj):
        raw = obj.raw_payload if isinstance(obj.raw_payload, dict) else {}
        fn = str(raw.get('farmer_name') or '').strip()
        if fn:
            return fn
        if obj.farmer.first_name and obj.farmer.last_name:
            return f"{obj.farmer.first_name} {obj.farmer.last_name}"
        return obj.farmer.phone_number

    @extend_schema_field(serializers.CharField())
    def get_severity(self, obj):
        # Logic to determine severity
        if obj.any_pests_observed == 'Yes' or obj.any_diseases_observed == 'Yes':
            return 'high'
        return 'low'

    @extend_schema_field(serializers.CharField())
    def get_finding(self, obj):
        findings = []
        if obj.any_pests_observed == 'Yes':
            findings.extend([x for x in (obj.pests_observed_list or []) if x])
            if obj.pests_observed and obj.pests_observed not in findings:
                findings.append(obj.pests_observed)
        if obj.any_diseases_observed == 'Yes':
            findings.extend([x for x in (obj.disease_list or []) if x and x not in findings])
            if obj.disease and obj.disease not in findings:
                findings.append(obj.disease)

        if not findings:
            return "No Pests Found"
        return ", ".join(findings)

    @extend_schema_field(serializers.CharField())
    def get_status(self, obj):
        if obj.any_pests_observed == 'Yes' or obj.any_diseases_observed == 'Yes':
            return 'detected'
        return 'clean'

    @extend_schema_field(serializers.IntegerField(allow_null=True))
    def get_blockTreeCount(self, obj):
        if obj.block_id and obj.block:
            return obj.block.number_of_trees
        return None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_gpsLatitude(self, obj):
        return str(obj.gps_latitude) if obj.gps_latitude is not None else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_gpsLongitude(self, obj):
        return str(obj.gps_longitude) if obj.gps_longitude is not None else None

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_mediaGallery(self, obj):
        return weekly_media_gallery_urls(obj)

    @extend_schema_field(serializers.CharField())
    def get_mediaPreview(self, obj):
        gallery = weekly_media_gallery_urls(obj)
        for u in gallery:
            if isinstance(u, str) and _looks_like_media_url(u) and not u.lower().endswith(('.m4a', '.mp3', '.aac', '.wav', '.ogg')):
                return u
        return gallery[0] if gallery else None

    @extend_schema_field(serializers.CharField())
    def get_timestamp(self, obj):
        # Format: '14 Mar, 08:30'
        return obj.timestamp.strftime('%d %b, %H:%M')

    @extend_schema_field(serializers.CharField())
    def get_assignedTo(self, obj):
        if obj.farmer.entity and obj.farmer.entity.head_agronomist:
            return obj.farmer.entity.head_agronomist
        return None

    @extend_schema_field(serializers.CharField())
    def get_triageStatus(self, obj):
        review = getattr(obj, 'triage_review', None)
        return review.review_status if review else 'pending'

    @extend_schema_field(serializers.CharField())
    def get_reviewed(self, obj):
        review = getattr(obj, 'triage_review', None)
        if not review:
            return 'new'

        if review.review_status in ('pending', 'needs_follow_up'):
            return 'under-review'

        if review.review_status == 'confirmed':
            return 'reviewed'

        # Fallback for any unexpected state values.
        return 'under-review'

    @extend_schema_field(serializers.CharField())
    def get_triageLabel(self, obj):
        review = getattr(obj, 'triage_review', None)
        return review.identified_label if review else None

    @extend_schema_field(serializers.CharField())
    def get_triagedAt(self, obj):
        review = getattr(obj, 'triage_review', None)
        if not review:
            return None
        return review.reviewed_at.isoformat()

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_managementProtocol(self, obj):
        review = getattr(obj, 'triage_review', None)
        return (review.management_protocol or '').strip() or None if review else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_reviewNotes(self, obj):
        review = getattr(obj, 'triage_review', None)
        return (review.review_notes or '').strip() or None if review else None

    @extend_schema_field(serializers.BooleanField())
    def get_pushedToFarmer(self, obj):
        review = getattr(obj, 'triage_review', None)
        return bool(review and review.pushed_to_farmer)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_auditFlags(self, obj):
        flags = []
        if not obj.voice_note:
            flags.append('missing_media')
        if obj.end_date < obj.start_date:
            flags.append('invalid_window')
        if obj.gps_latitude is None or obj.gps_longitude is None:
            flags.append('missing_gps')
        if obj.pests_per_trap == 0 and obj.any_pests_observed == 'Yes':
            flags.append('inconsistent_capture')
        return flags

    @extend_schema_field(serializers.CharField())
    def get_rawTimestamp(self, obj):
        return obj.timestamp.isoformat()


class ScoutingReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoutingReview
        fields = [
            'id',
            'record',
            'reviewed_by',
            'identified_label',
            'management_protocol',
            'review_status',
            'training_tagged',
            'review_notes',
            'pushed_to_farmer',
            'reviewed_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'reviewed_by', 'reviewed_at', 'updated_at']
        extra_kwargs = {
            'record': {'read_only': True},
        }

