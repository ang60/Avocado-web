from rest_framework import serializers
from .models import Advisory


class AdvisorySerializer(serializers.ModelSerializer):
    action_taken_status = serializers.SerializerMethodField()
    time_ago = serializers.ReadOnlyField()

    class Meta:
        model = Advisory
        fields = [
            'id',
            'weekly_record',
            'farmer',
            'advisory_message',
            'actions_taken',
            'outcome',
            'remarks',
            'category',
            'timestamp',
            'action_taken_status',
            'time_ago',
        ]

    def get_action_taken_status(self, obj):
        o = (obj.outcome or '').lower()
        if 'controlled' in o or obj.outcome == '✅ Controlled':
            return 'Complete'
        return 'In Progress'

