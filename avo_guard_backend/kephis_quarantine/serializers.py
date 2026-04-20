from rest_framework import serializers
from .models import QuarantineManagement, KephisThresholdSetting, QuarantineActionLog


class QuarantineManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuarantineManagement
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'lift_requested_at',
            'lift_recommended_at',
            'lift_recommended_by',
            'lift_approved_at',
            'lift_approved_by',
        ]


class KephisThresholdSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = KephisThresholdSetting
        fields = ['fruit_fly_limit', 'fcm_limit', 'thrips_limit', 'updated_at']
        read_only_fields = ['updated_at']


class RiskIntelligenceSummarySerializer(serializers.Serializer):
    total_pest_detections = serializers.IntegerField()
    active_quarantine_zones = serializers.IntegerField()
    affected_farmers = serializers.IntegerField()
    compliance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)


class ExporterComplianceSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    exporterName = serializers.CharField()
    farmerCount = serializers.IntegerField()
    restrictedBlocks = serializers.IntegerField()
    riskScore = serializers.IntegerField()
    county = serializers.CharField()


class InfectionClusterSerializer(serializers.Serializer):
    county = serializers.CharField()
    intensity = serializers.CharField()
    farmerCount = serializers.IntegerField()
    pestCount = serializers.IntegerField()


class QuarantineActionLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    blockId = serializers.SerializerMethodField()

    class Meta:
        model = QuarantineActionLog
        fields = [
            'id',
            'quarantine',
            'action_type',
            'from_status',
            'to_status',
            'actor',
            'actor_name',
            'blockId',
            'notes',
            'created_at',
        ]
        read_only_fields = fields

    def get_actor_name(self, obj):
        if not obj.actor:
            return 'Unknown'
        full = f'{obj.actor.first_name} {obj.actor.last_name}'.strip()
        return full or obj.actor.phone_number

    def get_blockId(self, obj):
        return obj.quarantine.blockId

