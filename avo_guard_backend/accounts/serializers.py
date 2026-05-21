from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import User, Entity, Role, AppPermission, FCMDevice

class AppPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppPermission
        fields = ['id', 'name']

class RoleSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()
    # Use MethodField for read, write_only ListField for write to avoid DRF field conflict
    permissions = serializers.SerializerMethodField()
    permissions_input = serializers.ListField(
        child=serializers.CharField(), 
        required=False, 
        write_only=True
    )
    permissions_count = serializers.SerializerMethodField(method_name='get_permissions_count')

    class Meta:
        model = Role
        fields = ['id', 'role_name', 'description', 'permissions', 'permissions_input', 'users', 'permissions_count']

    def to_internal_value(self, data):
        # Support both 'permissions' and 'permissions_input' keys in request body
        if 'permissions' in data and 'permissions_input' not in data:
            data['permissions_input'] = data.pop('permissions')
        return super().to_internal_value(data)

    @extend_schema_field(serializers.IntegerField())
    def get_users(self, obj):
        return obj.users.count()

    @extend_schema_field(serializers.IntegerField())
    def get_permissions_count(self, obj):
        return obj.permissions.count()

    @extend_schema_field(AppPermissionSerializer(many=True))
    def get_permissions(self, obj):
        return AppPermissionSerializer(obj.permissions.all(), many=True).data

    def _resolve_permissions(self, permissions_list):
        if permissions_list is None:
            return None
        resolved = []
        for item in permissions_list:
            perm = None
            # Try UUID first
            try:
                perm = AppPermission.objects.get(id=item)
            except Exception:
                # Not a valid UUID or not found by id; try by name
                perm = AppPermission.objects.filter(name=item).first()
            if not perm:
                raise serializers.ValidationError(
                    f"Permission '{item}' not found by id or name."
                )
            resolved.append(perm)
        return resolved

    def create(self, validated_data):
        permissions_list = validated_data.pop('permissions_input', None)
        role = Role.objects.create(**validated_data)
        if permissions_list is not None:
            perms = self._resolve_permissions(permissions_list)
            role.permissions.set(perms)
        return role

    def update(self, instance, validated_data):
        permissions_list = validated_data.pop('permissions_input', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if permissions_list is not None:
            perms = self._resolve_permissions(permissions_list)
            instance.permissions.set(perms)
        return instance

class EntitySerializer(serializers.ModelSerializer):
    linked_farmers = serializers.SerializerMethodField()

    class Meta:
        model = Entity
        fields = '__all__'

    @extend_schema_field(serializers.IntegerField())
    def get_linked_farmers(self, obj):
        return obj.users.count()

class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'phone_number', 'first_name', 'last_name', 'email', 'identification_number', 'profile_picture']

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    entity = EntitySerializer(read_only=True)
    managed_by = BasicUserSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True, required=False, allow_null=True
    )
    entity_id = serializers.PrimaryKeyRelatedField(
        queryset=Entity.objects.all(), source='entity', write_only=True, required=False, allow_null=True
    )
    managed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='managed_by', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'first_name', 'last_name', 
            'role', 'role_id', 'county', 'entity', 'entity_id', 
            'managed_by', 'managed_by_id', 'identification_number',
            'profile_picture', 'last_login', 'is_staff', 'is_active'
        ]
        read_only_fields = ['last_login', 'is_staff', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def to_internal_value(self, data):
        # Support sending 'role', 'entity', 'managed_by' as IDs in the request body
        data = data.copy()
        if 'role' in data and not isinstance(data['role'], dict):
            data['role_id'] = data.pop('role')
        if 'entity' in data and not isinstance(data['entity'], dict):
            data['entity_id'] = data.pop('entity')
        if 'managed_by' in data and not isinstance(data['managed_by'], dict):
            data['managed_by_id'] = data.pop('managed_by')
        return super().to_internal_value(data)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        
        # Set default role to 'Farmer' if not provided
        if not validated_data.get('role'):
            farmer_role, _ = Role.objects.get_or_create(role_name='Farmer')
            validated_data['role'] = farmer_role
            
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ['phone_number', 'email', 'first_name', 'last_name', 'identification_number', 'role', 'entity', 'county', 'password']
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': False},
            'entity': {'required': False},
            'county': {'required': True},
        }

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        
        # Set default role to 'Farmer' if not provided
        if not validated_data.get('role'):
            farmer_role, _ = Role.objects.get_or_create(role_name='Farmer')
            validated_data['role'] = farmer_role

        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class UserManagementStatsSerializer(serializers.Serializer):
    active_users_count = serializers.IntegerField()
    roles_count = serializers.IntegerField()
    entities_count = serializers.IntegerField()
    permissions_count = serializers.IntegerField()

class OTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15, required=False)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('phone_number') and not data.get('email'):
            raise serializers.ValidationError("Either phone_number or email is required.")
        return data

class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)

class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True)

class PasswordResetRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15, required=False)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('phone_number') and not data.get('email'):
            raise serializers.ValidationError("Either phone_number or email is required.")
        return data

class PasswordResetConfirmSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

class LinkAgronomistSerializer(serializers.Serializer):
    farmer_id = serializers.UUIDField()
    # agronomist is the current user

class VerifyLinkSerializer(serializers.Serializer):
    farmer_id = serializers.UUIDField()
    otp_code = serializers.CharField(max_length=6)

class FarmerLinkAgronomistSerializer(serializers.Serializer):
    agronomist_id = serializers.UUIDField(required=False)
    farmer_id = serializers.UUIDField(required=False)
    otp_code = serializers.CharField(max_length=6)

    def validate(self, data):
        if not data.get('agronomist_id') and not data.get('farmer_id'):
            raise serializers.ValidationError("Either agronomist_id or farmer_id is required.")
        return data

class UserProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_picture']

class FCMDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FCMDevice
        fields = ['registration_id', 'device_id', 'device_type', 'is_active']
        extra_kwargs = {
            'registration_id': {'required': True},
        }

    def create(self, validated_data):
        user = self.context['request'].user
        registration_id = validated_data.get('registration_id')
        
        # Update if exists, else create
        device, created = FCMDevice.objects.update_or_create(
            registration_id=registration_id,
            defaults={
                'user': user,
                'device_id': validated_data.get('device_id'),
                'device_type': validated_data.get('device_type', 'android'),
                'is_active': True
            }
        )
        return device
