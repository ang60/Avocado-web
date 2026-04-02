from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import User, Entity, Role, AppPermission


def normalize_phone_number(value: str) -> str:
    """
    Normalize a phone number so OTP storage + lookup match even if the client
    includes spaces/dashes (e.g. "+254 798 123 456").
    """
    p = (value or '').strip().replace(' ', '').replace('-', '')
    if len(p) > 15:
        raise serializers.ValidationError('Phone number is too long.')
    if len(p) < 3:
        raise serializers.ValidationError('Enter a valid phone number.')
    return p

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

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_permissions(self, obj):
        return list(obj.permissions.values_list('name', flat=True))

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

class UserSerializer(serializers.ModelSerializer):
    entity_details = EntitySerializer(source='entity', read_only=True)
    role_details = RoleSerializer(source='role', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'first_name', 'last_name', 
            'role', 'role_details', 'county', 'entity', 'entity_details', 
            'last_login', 'is_staff', 'is_active'
        ]
        read_only_fields = ['last_login', 'is_staff', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'entity': {'write_only': True, 'required': False},
            'role': {'write_only': True, 'required': False},
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class RegisterSerializer(serializers.Serializer):
    """
    Frontend integration payload:
      - POST /api/users/register/ with { name, email, phone_number }
    """

    name = serializers.CharField(max_length=255)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(max_length=15)

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)

    def create(self, validated_data):
        name = validated_data.get('name') or ''
        email = validated_data.get('email') or ''
        phone_number = validated_data.get('phone_number')

        parts = [p for p in name.split() if p]
        first_name = parts[0] if parts else ''
        last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''

        user, _ = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'email': email or None,
                'county': None,
                'is_active': True,
            },
        )

        changed = False
        if first_name and user.first_name != first_name:
            user.first_name = first_name
            changed = True
        if last_name and user.last_name != last_name:
            user.last_name = last_name
            changed = True
        if email and user.email != email:
            user.email = email
            changed = True
        if changed:
            user.save(update_fields=['first_name', 'last_name', 'email'])

        return user

class OTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)

class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)
