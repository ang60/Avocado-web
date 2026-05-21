from rest_framework import serializers
from .models import Case
from django.contrib.auth import get_user_model
from accounts.serializers import UserSerializer
from pest_scouting.serializers import WeeklyRecordSerializer
from pest_scouting.models import WeeklyRecord

User = get_user_model()

class CaseSerializer(serializers.ModelSerializer):
    assigned_agronomist = UserSerializer(read_only=True)
    pest_scouting_record = WeeklyRecordSerializer(read_only=True)
    
    agronomist_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='assigned_agronomist', write_only=True, required=False
    )
    scouting_record_id = serializers.PrimaryKeyRelatedField(
        queryset=WeeklyRecord.objects.all(), source='pest_scouting_record', write_only=True, required=False
    )

    class Meta:
        model = Case
        fields = [
            'id', 'case_title', 'severity', 'status', 'pest_scouting_record', 'scouting_record_id',
            'initial_notes', 'notes', 'diagnosis', 'recommended_actions', 'recommended_chemical', 
            'application_rate', 'pre_harvest_interval', 'assigned_agronomist', 
            'agronomist_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        data = data.copy()
        if 'assigned_agronomist' in data and not isinstance(data['assigned_agronomist'], dict):
            data['agronomist_id'] = data.pop('assigned_agronomist')
        if 'pest_scouting_record' in data and not isinstance(data['pest_scouting_record'], dict):
            data['scouting_record_id'] = data.pop('pest_scouting_record')
        return super().to_internal_value(data)

    def validate_assigned_agronomist(self, value):
        if value and (not value.role or value.role.role_name != 'Agronomist'):
            raise serializers.ValidationError("Assigned user must be an agronomist.")
        return value

class CaseAssignmentSerializer(serializers.Serializer):
    assigned_agronomist = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__role_name='Agronomist'),
        source='agronomist' # Map the input 'assigned_agronomist' to the validated_data key 'agronomist'
    )
    notes = serializers.CharField(required=False, allow_blank=True)

class CaseCloseSerializer(serializers.Serializer):
    diagnosis = serializers.CharField(required=True)
    recommended_actions = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        min_length=1
    )
    recommended_chemical = serializers.CharField(required=True)
    application_rate = serializers.CharField(required=True)
    pre_harvest_interval = serializers.CharField(required=True)
