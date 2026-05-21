import json
import re
from rest_framework import serializers
from .models import Farm, FarmBlock, WeeklyRecord, Trap, ProblemReport, ScoutingReview
from .weekly_helpers import (
    actions_taken_list,
    beneficial_insects_list,
    disease_list,
    outcome_list,
    pests_observed_list,
)
from drf_spectacular.utils import extend_schema_field
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class TrapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trap
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')

class ProblemReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemReport
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')

class FarmSerializer(serializers.ModelSerializer):
    farmer_name = UserSerializer(read_only=True)
    farmer_name_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='farmer_name', write_only=True, required=False
    )
    class Meta:
        model = Farm
        fields = ['id', 'farmer_name', 'farmer_name_id', 'farm_name', 'location', 'number_of_blocks', 'farm_size', 'timestamp']
        read_only_fields = ('id', 'timestamp')

    def to_internal_value(self, data):
        data = data.copy()
        if 'farmer_name' in data and not isinstance(data['farmer_name'], dict):
            data['farmer_name_id'] = data.pop('farmer_name')
        return super().to_internal_value(data)

    def validate_farmer_name_id(self, value):
        if value and (not value.role or value.role.role_name != 'Farmer'):
            raise serializers.ValidationError("Assigned user must be a Farmer.")
        return value

class FarmBlockSerializer(serializers.ModelSerializer):
    farmer = UserSerializer(read_only=True)
    farmer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='farmer', write_only=True, required=False
    )
    farm_name = FarmSerializer(read_only=True)
    farm_name_id = serializers.PrimaryKeyRelatedField(
        queryset=Farm.objects.all(), source='farm_name', write_only=True, required=False
    )
    class Meta:
        model = FarmBlock
        fields = ['id', 'farmer', 'farmer_id', 'farm_name', 'farm_name_id', 'block_name', 'number_of_trees', 'timestamp']
        read_only_fields = ('id', 'timestamp')

    def to_internal_value(self, data):
        data = data.copy()
        if 'farmer' in data and not isinstance(data['farmer'], dict):
            data['farmer_id'] = data.pop('farmer')
        if 'farm_name' in data and not isinstance(data['farm_name'], dict):
            data['farm_name_id'] = data.pop('farm_name')
        return super().to_internal_value(data)

class WeeklyRecordSerializer(serializers.ModelSerializer):
    farmer = UserSerializer(read_only=True)
    block = FarmBlockSerializer(read_only=True)
    farmer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='farmer', write_only=True, required=False
    )
    block_id = serializers.PrimaryKeyRelatedField(
        queryset=FarmBlock.objects.all(), source='block', write_only=True, required=False
    )
    other_production_challenges = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = WeeklyRecord
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')

    def to_internal_value(self, data):
        # Convert QueryDict to a regular dict to allow complex objects as values
        if hasattr(data, 'dict'):
            data = data.dict()
        else:
            data = data.copy()
        
        # Handle UUIDs and other fields passed as stringified lists/objects (e.g., "“['uuid']”")
        # Especially common in multipart/form-data requests
        json_fields = ['other_production_challenges', 'trap_use', 'pests_observed', 'beneficial_insects_observed', 'disease', 'disease_plant_part', 'actions_taken']
        uuid_fields = ['farmer', 'block', 'farmer_id', 'block_id']
        bool_fields = ['dont_know_variety', 'dont_know_trap', 'dont_know_pest', 'dont_know_beneficial_insects_observed', 'dont_know_disease']
        date_fields = ['start_date', 'end_date']
        choice_fields = ['any_pests_observed', 'any_diseases_observed', 'disease_crop_stage', 'disease_detection_method', 'outcome']
        
        # We need to be careful with file fields, they shouldn't be treated as stringified lists if they are actual files
        file_fields = ['dont_know_variety_photo', 'dont_know_variety_voice', 'dont_know_trap_photo', 'other_trap_photo', 'dont_know_pest_photo', 'dont_know_beneficial_insects_observed_photo', 'overall_image', 'voice_note']
        
        target_fields = uuid_fields + json_fields + bool_fields + date_fields + choice_fields
        for field in target_fields:
            if field in data:
                val = data[field]
                
                # Unwrap from list if necessary (common in some parsers)
                if isinstance(val, list) and len(val) > 0:
                    # For JSON fields, if it's already a list of objects, we might want to keep it
                    if field in json_fields and not isinstance(val[0], (str, bytes)):
                        pass 
                    else:
                        val = val[0]
                
                if isinstance(val, str):
                    val = val.strip()
                    # Strip curly quotes and regular quotes that might wrap the value
                    while val.startswith(('“', '‘', '"', "'")):
                        val = val[1:]
                    while val.endswith(('”', '’', '"', "'")):
                        val = val[:-1]
                    val = val.strip()
                    
                    if not val:
                        continue

                    # Handle stringified list/dict
                    if (val.startswith('[') and val.endswith(']')) or (val.startswith('{') and val.endswith('}')):
                        try:
                            # Try parsing as JSON, replacing single quotes with double quotes
                            parsed_val = json.loads(val.replace("'", '"'))
                            
                            if isinstance(parsed_val, list) and len(parsed_val) > 0:
                                if field in uuid_fields or field in bool_fields or field in date_fields or field in choice_fields:
                                    data[field] = parsed_val[0]
                                else:
                                    data[field] = parsed_val
                            else:
                                data[field] = parsed_val
                        except:
                            if field in uuid_fields:
                                match = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', val)
                                if match:
                                    data[field] = match.group(0)
                                else:
                                    data[field] = val
                            elif field in date_fields:
                                match = re.search(r'\d{4}-\d{2}-\d{2}', val)
                                if match:
                                    data[field] = match.group(0)
                                else:
                                    data[field] = val
                            else:
                                data[field] = val
                    elif field in uuid_fields:
                        # Just a plain UUID string but maybe with quotes or other noise (already stripped)
                        match = re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', val)
                        if match:
                            data[field] = match.group(0)
                        else:
                            data[field] = val
                    else:
                        data[field] = val
        
        # Further processing for booleans that might be "true"/"false" strings
        for field in bool_fields:
            if field in data:
                val = data[field]
                if isinstance(val, str):
                    val = val.lower()
                    if val in ['true', 'yes', '1']:
                        data[field] = True
                    elif val in ['false', 'no', '0']:
                        data[field] = False
                elif isinstance(val, list) and len(val) > 0:
                    # Handle case where it's still a list (though it should have been unwrapped above)
                    val0 = str(val[0]).lower()
                    if val0 in ['true', 'yes', '1']:
                        data[field] = True
                    elif val0 in ['false', 'no', '0']:
                        data[field] = False

        if 'farmer' in data and not isinstance(data['farmer'], dict):
            data['farmer_id'] = data.pop('farmer')
        if 'block' in data and not isinstance(data['block'], dict):
            data['block_id'] = data.pop('block')
        
        # Truncate GPS coordinates to 6 decimal places
        for field in ['gps_latitude', 'gps_longitude']:
            if field in data and data[field]:
                try:
                    from decimal import Decimal, ROUND_DOWN
                    val = data[field]
                    if isinstance(val, list) and len(val) > 0:
                        val = val[0]
                    
                    val_str = str(val)
                    # If it's a list with one item, extract it (sometimes happens with multipart)
                    if val_str.startswith('[') and val_str.endswith(']'):
                        match = re.search(r'[-+]?\d*\.?\d+', val_str)
                        if match:
                            val_str = match.group(0)
                    data[field] = Decimal(val_str).quantize(Decimal('0.000000'), rounding=ROUND_DOWN)
                except:
                    pass

        # Handle other_production_challenges if it's a comma-separated string from old clients
        if 'other_production_challenges' in data and isinstance(data['other_production_challenges'], str):
            val = data['other_production_challenges'].strip()
            if val:
                data['other_production_challenges'] = [item.strip() for item in val.split(',') if item.strip()]
            else:
                data['other_production_challenges'] = []

        return super().to_internal_value(data)

from .media_urls import weekly_record_image_urls, weekly_record_media_urls
from .record_payload import weekly_record_display_payload


def weekly_media_gallery_urls(obj: WeeklyRecord, request=None) -> list[str]:
    return weekly_record_media_urls(obj, request)


class ScoutingReportSerializer(serializers.ModelSerializer):
    farmerId = serializers.UUIDField(source='farmer.id', read_only=True)
    blockUuid = serializers.UUIDField(source='block.id', read_only=True)
    farmName = serializers.SerializerMethodField()
    blockId = serializers.CharField(source='block.block_name')
    farmerName = serializers.SerializerMethodField()
    severity = serializers.SerializerMethodField()
    source = serializers.CharField(default='app')
    finding = serializers.SerializerMethodField()
    observation_status = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    mediaPreview = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    reviewed = serializers.SerializerMethodField()
    county = serializers.CharField(source='farmer.county')
    assignedTo = serializers.SerializerMethodField()
    triageStatus = serializers.SerializerMethodField()
    triageLabel = serializers.SerializerMethodField()
    triagedAt = serializers.SerializerMethodField()
    managementProtocol = serializers.SerializerMethodField()
    reviewNotes = serializers.SerializerMethodField()
    pushedToFarmer = serializers.SerializerMethodField()
    auditFlags = serializers.SerializerMethodField()
    rawTimestamp = serializers.SerializerMethodField()
    pestsObservedList = serializers.SerializerMethodField()
    diseasesObservedList = serializers.SerializerMethodField()
    beneficialInsectsObservedList = serializers.SerializerMethodField()
    actionsTakenList = serializers.SerializerMethodField()
    outcomeList = serializers.SerializerMethodField()
    rawPayload = serializers.SerializerMethodField()
    variety = serializers.CharField(read_only=True)
    reportLocation = serializers.CharField(source='location', read_only=True)
    blockTreeCount = serializers.SerializerMethodField()
    startDate = serializers.DateField(source='start_date', read_only=True)
    endDate = serializers.DateField(source='end_date', read_only=True)
    additionalNotes = serializers.CharField(source='additional_notes', read_only=True, allow_null=True)
    remarks = serializers.CharField(read_only=True, allow_null=True)
    gpsLatitude = serializers.SerializerMethodField()
    gpsLongitude = serializers.SerializerMethodField()
    mediaGallery = serializers.SerializerMethodField()

    class Meta:
        model = WeeklyRecord
        fields = [
            'id', 'farmerId', 'blockUuid', 'farmName', 'blockId', 'farmerName', 'severity', 'source',
            'finding', 'observation_status', 'status', 'mediaPreview', 'timestamp', 'reviewed',
            'county', 'assignedTo', 'triageStatus', 'triageLabel', 'triagedAt', 'managementProtocol',
            'reviewNotes', 'pushedToFarmer', 'auditFlags', 'rawTimestamp',
            'pestsObservedList', 'diseasesObservedList', 'beneficialInsectsObservedList',
            'actionsTakenList', 'outcomeList', 'rawPayload', 'variety', 'reportLocation',
            'blockTreeCount', 'startDate', 'endDate', 'additionalNotes', 'remarks',
            'gpsLatitude', 'gpsLongitude', 'mediaGallery',
        ]

    @extend_schema_field(serializers.DictField())
    def get_rawPayload(self, obj):
        return weekly_record_display_payload(obj)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_pestsObservedList(self, obj):
        return pests_observed_list(obj)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_diseasesObservedList(self, obj):
        return disease_list(obj)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_beneficialInsectsObservedList(self, obj):
        return beneficial_insects_list(obj)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_actionsTakenList(self, obj):
        return actions_taken_list(obj)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_outcomeList(self, obj):
        return outcome_list(obj)

    @extend_schema_field(serializers.CharField())
    def get_farmName(self, obj):
        raw = obj.raw_payload if isinstance(obj.raw_payload, dict) else {}
        fn = str(raw.get('farm_name') or '').strip()
        if fn:
            return fn
        farm = Farm.objects.filter(farmer_name_id=obj.farmer_id).order_by('-timestamp').values_list('farm_name', flat=True).first()
        if farm and str(farm).strip():
            return str(farm).strip()
        entity = getattr(obj.farmer, 'entity', None)
        if entity and getattr(entity, 'company_name', None):
            return entity.company_name
        fp = getattr(obj.farmer, 'farmer_profile', None)
        if fp and (fp.farm_name or '').strip():
            return fp.farm_name.strip()
        return 'Individual Farmer'

    @extend_schema_field(serializers.CharField())
    def get_farmerName(self, obj):
        raw = obj.raw_payload if isinstance(obj.raw_payload, dict) else {}
        fn = str(raw.get('farmer_name') or '').strip()
        if fn:
            return fn
        if obj.farmer.first_name and obj.farmer.last_name:
            return f"{obj.farmer.first_name} {obj.farmer.last_name}"
        return obj.farmer.phone_number

    @extend_schema_field(serializers.CharField())
    def get_severity(self, obj):
        if obj.any_pests_observed == 'Yes' or obj.any_diseases_observed == 'Yes':
            return 'high'
        return 'low'

    @extend_schema_field(serializers.CharField())
    def get_finding(self, obj):
        findings = []
        if obj.any_pests_observed == 'Yes':
            findings.extend(pests_observed_list(obj))
        if obj.any_diseases_observed == 'Yes':
            for x in disease_list(obj):
                if x and x not in findings:
                    findings.append(x)
        return ', '.join(findings) if findings else 'No Pests Found'

    @extend_schema_field(serializers.CharField())
    def get_observation_status(self, obj):
        if obj.any_pests_observed == 'Yes' or obj.any_diseases_observed == 'Yes':
            return 'detected'
        return 'clean'

    @extend_schema_field(serializers.CharField())
    def get_status(self, obj):
        return self.get_observation_status(obj)

    @extend_schema_field(serializers.IntegerField(allow_null=True))
    def get_blockTreeCount(self, obj):
        return obj.block.number_of_trees if obj.block_id else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_gpsLatitude(self, obj):
        return str(obj.gps_latitude) if obj.gps_latitude is not None else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_gpsLongitude(self, obj):
        return str(obj.gps_longitude) if obj.gps_longitude is not None else None

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_mediaGallery(self, obj):
        request = self.context.get('request')
        return weekly_media_gallery_urls(obj, request)

    @extend_schema_field(serializers.CharField())
    def get_mediaPreview(self, obj):
        request = self.context.get('request')
        images = weekly_record_image_urls(obj, request)
        return images[0] if images else None

    @extend_schema_field(serializers.CharField())
    def get_timestamp(self, obj):
        from django.utils.timezone import localtime
        return localtime(obj.timestamp).strftime('%d %b, %H:%M')

    @extend_schema_field(serializers.CharField())
    def get_assignedTo(self, obj):
        if obj.farmer.entity and obj.farmer.entity.head_agronomist:
            return obj.farmer.entity.head_agronomist
        return None

    @extend_schema_field(serializers.CharField())
    def get_triageStatus(self, obj):
        review = getattr(obj, 'triage_review', None)
        return review.review_status if review else 'pending'

    @extend_schema_field(serializers.CharField())
    def get_reviewed(self, obj):
        review = getattr(obj, 'triage_review', None)
        if not review:
            return 'new'
        if review.review_status in ('pending', 'needs_follow_up'):
            return 'under-review'
        if review.review_status == 'confirmed':
            return 'reviewed'
        return 'under-review'

    @extend_schema_field(serializers.CharField())
    def get_triageLabel(self, obj):
        review = getattr(obj, 'triage_review', None)
        return review.identified_label if review else None

    @extend_schema_field(serializers.CharField())
    def get_triagedAt(self, obj):
        review = getattr(obj, 'triage_review', None)
        return review.reviewed_at.isoformat() if review else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_managementProtocol(self, obj):
        review = getattr(obj, 'triage_review', None)
        return (review.management_protocol or '').strip() or None if review else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_reviewNotes(self, obj):
        review = getattr(obj, 'triage_review', None)
        if review and (review.review_notes or '').strip():
            return review.review_notes.strip()
        return (obj.review_notes or '').strip() or None

    @extend_schema_field(serializers.BooleanField())
    def get_pushedToFarmer(self, obj):
        review = getattr(obj, 'triage_review', None)
        return bool(review and review.pushed_to_farmer)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_auditFlags(self, obj):
        flags = []
        if not obj.voice_note:
            flags.append('missing_media')
        if obj.end_date < obj.start_date:
            flags.append('invalid_window')
        if obj.gps_latitude is None or obj.gps_longitude is None:
            flags.append('missing_gps')
        return flags

    @extend_schema_field(serializers.CharField())
    def get_rawTimestamp(self, obj):
        return obj.timestamp.isoformat()


class ScoutingReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoutingReview
        fields = [
            'id', 'record', 'reviewed_by', 'identified_label', 'management_protocol',
            'review_status', 'training_tagged', 'review_notes', 'pushed_to_farmer',
            'reviewed_at', 'updated_at',
        ]
        read_only_fields = ['id', 'reviewed_by', 'reviewed_at', 'updated_at']
        extra_kwargs = {'record': {'required': False}}

class USSDRequestSerializer(serializers.Serializer):
    sessionId = serializers.CharField(
        help_text="A unique value generated by Africa's Talking when the session starts."
    )
    serviceCode = serializers.CharField(
        help_text="The USSD code that the user dialed (e.g., *123#)."
    )
    phoneNumber = serializers.CharField(
        help_text="The phone number of the mobile subscriber."
    )
    text = serializers.CharField(
        required=False, 
        allow_blank=True, 
        help_text="The user input. This is a concatenated string of all the user's inputs in the session, separated by *. An empty string represents the start of the session."
    )
