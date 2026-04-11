from rest_framework import serializers
from .models import QuarantineManagement


class QuarantineManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuarantineManagement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


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

