from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    time_ago = serializers.ReadOnlyField()

    class Meta:
        model = Alert
        fields = ['id', 'farmer', 'title', 'message', 'is_read', 'timestamp', 'time_ago']
        read_only_fields = ['id', 'farmer', 'timestamp', 'time_ago']

