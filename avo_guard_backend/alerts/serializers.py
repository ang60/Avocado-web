from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    @extend_schema_field(serializers.CharField())
    def get_time_ago(self, obj):
        return obj.time_ago

    class Meta:
        model = Alert
        fields = ['id', 'farmer', 'title', 'message', 'is_read', 'category', 'timestamp', 'time_ago']
        read_only_fields = ['id', 'farmer', 'timestamp', 'time_ago']
