from rest_framework import serializers

from .models import AlertRule, AppPermission, Case, Entity, FarmBlock, FarmerProfile, Role, ScoutingReport, User
from .rbac import ROLE_FARMER, is_admin_like, role_name


class AppPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppPermission
        fields = ('id', 'name')


class RoleNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('id', 'role_name')


class EntityNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = ('id', 'company_name')


class UserSerializer(serializers.ModelSerializer):
    role_details = serializers.SerializerMethodField()
    entity_details = serializers.SerializerMethodField()
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), allow_null=True, required=False)
    entity = serializers.PrimaryKeyRelatedField(queryset=Entity.objects.all(), allow_null=True, required=False)

    class Meta:
        model = User
        fields = (
            'id',
            'phone_number',
            'email',
            'first_name',
            'last_name',
            'county',
            'is_active',
            'last_login',
            'role',
            'entity',
            'role_details',
            'entity_details',
        )
        read_only_fields = ('id', 'last_login', 'role_details', 'entity_details')

    def get_role_details(self, obj):
        if not obj.role_id:
            return None
        return {'id': str(obj.role_id), 'role_name': obj.role.role_name}

    def get_entity_details(self, obj):
        if not obj.entity_id:
            return None
        return {'id': str(obj.entity_id), 'company_name': obj.entity.company_name}


class UserCreateSerializer(serializers.ModelSerializer):
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), allow_null=True, required=False)
    entity = serializers.PrimaryKeyRelatedField(queryset=Entity.objects.all(), allow_null=True, required=False)

    class Meta:
        model = User
        fields = (
            'phone_number',
            'email',
            'first_name',
            'last_name',
            'county',
            'role',
            'entity',
        )

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_unusable_password()
        user.save()
        return user


class AuthUserSerializer(serializers.ModelSerializer):
    role_details = serializers.SerializerMethodField()
    entity_details = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id',
            'phone_number',
            'email',
            'first_name',
            'last_name',
            'county',
            'role_details',
            'entity_details',
        )

    def get_role_details(self, obj):
        if not obj.role_id:
            return None
        return {'id': str(obj.role_id), 'role_name': obj.role.role_name}

    def get_entity_details(self, obj):
        if not obj.entity_id:
            return None
        return {'id': str(obj.entity_id), 'company_name': obj.entity.company_name}

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['id'] = str(instance.id)
        return data


class RoleListSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()
    permissions_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ('id', 'role_name', 'description', 'users', 'permissions_count')

    def get_users(self, obj):
        return obj.users.filter(is_active=True).count()

    def get_permissions_count(self, obj):
        return obj.permissions.count()


class RoleDetailSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ('id', 'role_name', 'description', 'permissions')

    def get_permissions(self, obj):
        return [str(p.id) for p in obj.permissions.all()]


class RoleWriteSerializer(serializers.ModelSerializer):
    permissions_input = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Role
        fields = ('role_name', 'description', 'permissions_input')

    def create(self, validated_data):
        perm_ids = validated_data.pop('permissions_input', None)
        role = Role.objects.create(**validated_data)
        if perm_ids is not None:
            perms = AppPermission.objects.filter(id__in=perm_ids)
            role.permissions.set(perms)
        return role

    def update(self, instance, validated_data):
        perm_ids = validated_data.pop('permissions_input', None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        if perm_ids is not None:
            perms = AppPermission.objects.filter(id__in=perm_ids)
            instance.permissions.set(perms)
        return instance


class EntitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entity
        fields = (
            'id',
            'entity_type',
            'company_name',
            'HCDA_license',
            'license_expiry_date',
            'head_agronomist',
            'linked_farmers',
            'is_active',
            'company_email',
            'phone_number',
            'primary_county',
        )

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = {**data}
            if 'license_expiry_date' in data:
                v = data.get('license_expiry_date')
                if v in ('', 'N/A', 'n/a', None):
                    data['license_expiry_date'] = None
        return super().to_internal_value(data)


class AlertRuleSerializer(serializers.ModelSerializer):
    triggered = serializers.IntegerField(source='triggered_count', read_only=True)

    class Meta:
        model = AlertRule
        fields = (
            'id',
            'name',
            'condition',
            'threshold',
            'county',
            'pest',
            'action',
            'recipients',
            'status',
            'triggered',
            'last_triggered_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'triggered', 'last_triggered_at', 'created_at', 'updated_at')


class FarmerListSerializer(serializers.ModelSerializer):
    primaryChannel = serializers.CharField(source='primary_channel')
    weeklyScoutingLogs = serializers.SerializerMethodField()
    lastScoutingResult = serializers.SerializerMethodField()
    exportEligibility = serializers.CharField(source='export_eligibility')
    totalAcres = serializers.FloatField(source='total_acres')
    phone = serializers.CharField(source='user.phone_number')
    lastInspection = serializers.CharField(source='last_inspection')
    overdueScouts = serializers.BooleanField(source='overdue_scouts')
    linkedExporter = serializers.SerializerMethodField()

    class Meta:
        model = FarmerProfile
        fields = (
            'id',
            'name',
            'owner',
            'location',
            'county',
            'ward',
            'primaryChannel',
            'weeklyScoutingLogs',
            'lastScoutingResult',
            'exportEligibility',
            'totalAcres',
            'phone',
            'lastInspection',
            'overdueScouts',
            'linkedExporter',
        )

    def get_weeklyScoutingLogs(self, obj):
        v = obj.weekly_scouting_logs_4w or []
        v = list(v)[:4]
        while len(v) < 4:
            v.append(0)
        return v

    def get_lastScoutingResult(self, obj):
        return {'status': obj.last_scouting_status or 'no-pests', 'finding': obj.last_scouting_finding or ''}

    def get_linkedExporter(self, obj):
        return str(obj.linked_exporter_id) if obj.linked_exporter_id else None


class FarmerDetailSerializer(serializers.ModelSerializer):
    farmName = serializers.CharField(source='farm_name')
    subCounty = serializers.CharField(source='sub_county')
    phone = serializers.CharField(source='user.phone_number')
    email = serializers.CharField(source='user.email', allow_null=True)
    primaryChannel = serializers.CharField(source='primary_channel')
    registrationDate = serializers.SerializerMethodField()
    totalAcres = serializers.FloatField(source='total_acres')
    blocksManaged = serializers.IntegerField(source='blocks_managed')
    treesCount = serializers.IntegerField(source='trees_count')
    exportEligibility = serializers.CharField(source='export_eligibility')
    lastScoutingResult = serializers.SerializerMethodField()
    weeklyScoutingLogs = serializers.SerializerMethodField()
    complianceScore = serializers.SerializerMethodField()
    activeCases = serializers.SerializerMethodField()
    recentActivities = serializers.SerializerMethodField()
    blocks = serializers.SerializerMethodField()

    class Meta:
        model = FarmerProfile
        fields = (
            'id',
            'name',
            'farmName',
            'location',
            'county',
            'ward',
            'subCounty',
            'phone',
            'email',
            'primaryChannel',
            'registrationDate',
            'totalAcres',
            'blocksManaged',
            'treesCount',
            'exportEligibility',
            'lastScoutingResult',
            'weeklyScoutingLogs',
            'complianceScore',
            'activeCases',
            'recentActivities',
            'blocks',
        )

    def get_registrationDate(self, obj):
        return obj.registration_date.isoformat() if obj.registration_date else ''

    def get_lastScoutingResult(self, obj):
        return {
            'status': obj.last_scouting_status or 'no-pests',
            'finding': obj.last_scouting_finding or '',
            'date': obj.last_scouting_date or '',
            'scoutName': obj.last_scouting_scout_name or '',
        }

    def get_weeklyScoutingLogs(self, obj):
        out = []
        logs = list(obj.weekly_scouting_logs_4w or [])[:4]
        for i, v in enumerate(logs):
            out.append({'week': f'W-{4-i}', 'completed': bool(v), 'date': '', 'scout': ''})
        return out

    def get_complianceScore(self, obj):
        logs = list(obj.weekly_scouting_logs_4w or [])[:4]
        if not logs:
            return 0
        return int(round((sum(1 for x in logs if int(x) == 1) / 4) * 100))

    def get_activeCases(self, obj):
        qs = obj.cases.all()[:10]
        return [
            {
                'id': str(c.id),
                'issue': c.pest_disease,
                'severity': c.severity,
                'status': c.status,
                'date': c.date_submitted.isoformat() if c.date_submitted else '',
            }
            for c in qs
        ]

    def get_recentActivities(self, obj):
        return []

    def get_blocks(self, obj):
        return [
            {
                'id': str(b.id),
                'name': b.name,
                'acres': b.acres,
                'trees': b.trees,
                'status': b.status,
                'lastInspection': b.last_inspection,
            }
            for b in obj.blocks.all()
        ]


class CaseManagementRowSerializer(serializers.ModelSerializer):
    farm = serializers.CharField(source='farmer.farm_name')
    block = serializers.SerializerMethodField()
    pestDisease = serializers.CharField(source='pest_disease')
    pestDiseaseKiswahili = serializers.CharField(source='pest_disease_kiswahili')
    dateSubmitted = serializers.SerializerMethodField()
    scoutName = serializers.CharField(source='scout_name')
    location = serializers.CharField(source='farmer.location')
    affectedTrees = serializers.IntegerField(source='affected_trees')
    channel = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = (
            'id',
            'severity',
            'farm',
            'block',
            'pestDisease',
            'pestDiseaseKiswahili',
            'dateSubmitted',
            'status',
            'scoutName',
            'location',
            'affectedTrees',
            'symptoms',
            'notes',
            'channel',
        )

    def get_block(self, obj):
        return obj.block.name if obj.block_id else ''

    def get_dateSubmitted(self, obj):
        return obj.date_submitted.isoformat() if obj.date_submitted else ''

    def get_channel(self, obj):
        v = (obj.submission_channel or '').lower()
        return 'ussd' if 'ussd' in v or 'sms' in v else 'smartphone'


class CaseDetailSerializer(serializers.ModelSerializer):
    farmerName = serializers.CharField(source='farmer.name')
    farmerPhone = serializers.CharField(source='farmer.user.phone_number')
    location = serializers.CharField(source='farmer.location')
    subCounty = serializers.CharField(source='farmer.sub_county')
    farm = serializers.CharField(source='farmer.farm_name')
    block = serializers.SerializerMethodField()
    blockCoordinates = serializers.SerializerMethodField()
    submissionChannel = serializers.CharField(source='submission_channel')
    pestDisease = serializers.CharField(source='pest_disease')
    pestDiseaseKiswahili = serializers.CharField(source='pest_disease_kiswahili')
    dateSubmitted = serializers.SerializerMethodField()
    scoutName = serializers.CharField(source='scout_name')
    scoutPhone = serializers.CharField(source='scout_phone')
    affectedTrees = serializers.IntegerField(source='affected_trees')
    symptomCodes = serializers.ListField(source='symptom_codes')
    photos = serializers.SerializerMethodField()
    voiceNote = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = (
            'id',
            'farmerName',
            'farmerPhone',
            'location',
            'subCounty',
            'farm',
            'block',
            'blockCoordinates',
            'severity',
            'submissionChannel',
            'pestDisease',
            'pestDiseaseKiswahili',
            'dateSubmitted',
            'scoutName',
            'scoutPhone',
            'affectedTrees',
            'symptoms',
            'symptomCodes',
            'notes',
            'photos',
            'voiceNote',
            'timeline',
        )

    def get_block(self, obj):
        return obj.block.name if obj.block_id else ''

    def get_blockCoordinates(self, obj):
        if not obj.block_id:
            return {'lat': 0, 'lng': 0}
        return {'lat': obj.block.latitude or 0, 'lng': obj.block.longitude or 0}

    def get_dateSubmitted(self, obj):
        return obj.date_submitted.isoformat() if obj.date_submitted else ''

    def get_photos(self, obj):
        return []

    def get_voiceNote(self, obj):
        return {'duration': '', 'url': ''}

    def get_timeline(self, obj):
        return [
            {
                'stage': 'Submitted',
                'timestamp': self.get_dateSubmitted(obj),
                'status': 'complete' if obj.date_submitted else 'pending',
            },
            {'stage': 'Under review', 'timestamp': None, 'status': 'pending' if obj.status == 'new' else 'complete'},
            {'stage': 'Advisory issued', 'timestamp': None, 'status': 'pending'},
        ]


class ScoutingFeedItemSerializer(serializers.ModelSerializer):
    farmName = serializers.CharField(source='farmer.farm_name')
    blockId = serializers.SerializerMethodField()
    farmerName = serializers.CharField(source='farmer.name')
    mediaPreview = serializers.CharField(source='media_preview', allow_blank=True)
    ussdCode = serializers.CharField(source='ussd_code', allow_blank=True)
    timestamp = serializers.SerializerMethodField()
    county = serializers.CharField(source='farmer.county', allow_blank=True)
    assignedTo = serializers.SerializerMethodField()

    class Meta:
        model = ScoutingReport
        fields = (
            'id',
            'farmName',
            'blockId',
            'farmerName',
            'severity',
            'source',
            'finding',
            'status',
            'mediaPreview',
            'ussdCode',
            'timestamp',
            'reviewed',
            'county',
            'assignedTo',
        )

    def get_blockId(self, obj):
        return obj.block.name if obj.block_id else ''

    def get_timestamp(self, obj):
        dt = obj.submitted_at
        if not dt:
            return ''
        return f"{dt.day} {dt.strftime('%b')}, {dt.strftime('%H:%M')}"

    def get_assignedTo(self, obj):
        u = obj.assigned_to
        if not u:
            return None
        name = f'{u.first_name} {u.last_name}'.strip()
        return name or u.phone_number


class ScoutingReportWriteSerializer(serializers.ModelSerializer):
    farmer = serializers.PrimaryKeyRelatedField(queryset=FarmerProfile.objects.all())
    block = serializers.PrimaryKeyRelatedField(queryset=FarmBlock.objects.all(), allow_null=True, required=False)

    class Meta:
        model = ScoutingReport
        fields = (
            'farmer',
            'block',
            'source',
            'severity',
            'finding',
            'status',
            'media_preview',
            'ussd_code',
            'scout_name',
        )

    def validate(self, attrs):
        farmer = attrs.get('farmer')
        block = attrs.get('block')
        if farmer and block and block.farmer_id != farmer.id:
            raise serializers.ValidationError({'block': 'Block does not belong to this farmer.'})
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        if user and user.is_authenticated and not is_admin_like(user):
            if role_name(user) == ROLE_FARMER:
                fp = getattr(user, 'farmer_profile', None)
                if not fp or str(farmer.id) != str(fp.id):
                    raise serializers.ValidationError({'farmer': 'You may only submit scouting for your own farm.'})
        return attrs


class ScoutingReportPatchSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True, required=False)

    class Meta:
        model = ScoutingReport
        fields = ('reviewed', 'assigned_to')


class RequestOtpSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=32)


class RegisterUserSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=32)


class VerifyOtpSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=32)
    code = serializers.CharField(max_length=12)
