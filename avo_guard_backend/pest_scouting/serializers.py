from rest_framework import serializers
from .models import FarmBlock, WeeklyRecord, ScoutingReview, ScoutingSession
from drf_spectacular.utils import extend_schema_field


class FarmBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmBlock
        fields = '__all__'
        # farmer is set from request.user in the viewset (perform_create),
        # so clients should not be forced to send it.
        read_only_fields = ('id', 'timestamp', 'farmer')


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
    farmName = serializers.CharField(source='farmer.entity.company_name', default='Individual Farmer')
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

    class Meta:
        model = WeeklyRecord
        fields = [
            'id', 'farmerId', 'blockUuid', 'farmName', 'blockId', 'farmerName', 'severity', 'source',
            'finding', 'status', 'mediaPreview', 'timestamp', 'reviewed',
            'county', 'assignedTo', 'triageStatus', 'triageLabel', 'triagedAt', 'auditFlags', 'rawTimestamp',
            'pestsObservedList', 'diseasesObservedList', 'beneficialInsectsObservedList',
            'pestPlantPartsAffectedList', 'diseasePlantPartsAffectedList',
            'actionsTakenList', 'outcomeList', 'rawPayload'
        ]

    @extend_schema_field(serializers.CharField())
    def get_farmerName(self, obj):
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

    @extend_schema_field(serializers.CharField())
    def get_mediaPreview(self, obj):
        if obj.voice_note:
            return obj.voice_note.url
        return None

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

