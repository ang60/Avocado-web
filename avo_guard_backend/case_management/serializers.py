from rest_framework import serializers
from .models import Case
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer
from pest_scouting.serializers import WeeklyRecordSerializer

User = get_user_model()


class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = [
            'id', 'case_code', 'case_title', 'severity', 'pest_scouting_record',
            'notes', 'status', 'diagnosis', 'recommended_actions', 'closed_at',
            'assigned_agronomist', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Frontend prefers camelCase for display-only IDs.
        representation['caseCode'] = representation.get('case_code') or getattr(instance, 'case_code', None)
        if instance.assigned_agronomist:
            representation['assigned_agronomist'] = UserSerializer(instance.assigned_agronomist).data
        if instance.pest_scouting_record:
            # `WeeklyRecordSerializer` outputs foreign keys as primary keys by default.
            # Case-management UI expects `pest_scouting_record.farmer.*` and `pest_scouting_record.block.block_name`,
            # so we replace those FK values with minimal nested objects.
            record = instance.pest_scouting_record
            weekly = WeeklyRecordSerializer(record).data

            if getattr(record, 'farmer', None):
                weekly['farmer'] = {
                    'id': str(record.farmer.id),
                    'phone_number': record.farmer.phone_number,
                    'first_name': record.farmer.first_name,
                    'last_name': record.farmer.last_name,
                    'county': getattr(record.farmer, 'county', None),
                }

            if getattr(record, 'block', None):
                weekly['block'] = {
                    'id': str(record.block.id),
                    'block_name': record.block.block_name,
                }

            representation['pest_scouting_record'] = weekly
        return representation

    def validate_assigned_agronomist(self, value):
        if value and (not value.role or value.role.role_name != 'Agronomist'):
            raise serializers.ValidationError("Assigned user must be an agronomist.")
        return value


class CaseAssignmentSerializer(serializers.Serializer):
    assigned_agronomist = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__role_name='Agronomist'),
        source='agronomist'
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class CaseCloseSerializer(serializers.Serializer):
    diagnosis = serializers.CharField(required=True)
    recommended_actions = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        min_length=1
    )

