from rest_framework import serializers
from .models import FarmerRegistration

class FarmerRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerRegistration
        fields = '__all__'

class GlobalGAPCompliantSerializer(serializers.Serializer):
    total_number = serializers.IntegerField()
    percentage = serializers.FloatField()

class FarmerStatisticsSerializer(serializers.Serializer):
    total_registered_active_hcda_farmers = serializers.IntegerField()
    globalgap_compliant = GlobalGAPCompliantSerializer()
    expired_non_compliant = serializers.IntegerField()
    total_acreage = serializers.FloatField()
