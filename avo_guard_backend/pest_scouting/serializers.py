from rest_framework import serializers
from .models import FarmBlock, WeeklyRecord
from drf_spectacular.utils import extend_schema_field


class FarmBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmBlock
        fields = '__all__'
        # farmer is set from request.user in the viewset (perform_create),
        # so clients should not be forced to send it.
        read_only_fields = ('id', 'timestamp', 'farmer')


class WeeklyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyRecord
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')


class ScoutingReportSerializer(serializers.ModelSerializer):
    farmName = serializers.CharField(source='farmer.entity.company_name', default='Individual Farmer')
    blockId = serializers.CharField(source='block.block_name')
    farmerName = serializers.SerializerMethodField()
    severity = serializers.SerializerMethodField()
    source = serializers.CharField(default='app')  # Defaulting to app as per model fields availability
    finding = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    mediaPreview = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    reviewed = serializers.CharField(default='new')
    county = serializers.CharField(source='farmer.county')
    assignedTo = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyRecord
        fields = [
            'id', 'farmName', 'blockId', 'farmerName', 'severity', 'source',
            'finding', 'status', 'mediaPreview', 'timestamp', 'reviewed',
            'county', 'assignedTo'
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
        if obj.any_pests_observed == 'Yes' and obj.pests_observed:
            findings.append(obj.pests_observed)
        if obj.any_diseases_observed == 'Yes' and obj.disease:
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

