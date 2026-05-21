from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import Advisory

class AdvisorySerializer(serializers.ModelSerializer):
    action_taken_status = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    @extend_schema_field(serializers.CharField())
    def get_time_ago(self, obj):
        return obj.time_ago

    class Meta:
        model = Advisory
        fields = ['id', 'weekly_record', 'farmer', 'advisory_message', 'actions_taken', 'outcome', 'remarks', 'category', 'timestamp', 'action_taken_status', 'time_ago']

    @extend_schema_field(serializers.CharField())
    def get_action_taken_status(self, obj):
        if obj.outcome == '✅ Controlled':
            return 'Complete'
        return 'In Progress'
