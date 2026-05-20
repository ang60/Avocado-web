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
    # Assign by human-readable Role.role_name (preferred from the Admin UI dropdown).
    role_name = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    app_permissions = serializers.SerializerMethodField(read_only=True)
    is_privileged = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'email', 'first_name', 'last_name',
            'password',
            'role', 'role_name', 'role_details', 'county', 'entity', 'entity_details',
            'managed_by',
            'last_login', 'is_staff', 'is_active',
            'app_permissions', 'is_privileged',
        ]
        read_only_fields = ['last_login', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'entity': {'write_only': True, 'required': False},
            'role': {'write_only': True, 'required': False},
            'managed_by': {'write_only': True, 'required': False, 'allow_null': True},
        }

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_app_permissions(self, obj):
        if obj.is_superuser or obj.is_staff:
            return list(AppPermission.objects.values_list('name', flat=True).order_by('name'))
        role = obj.role
        if not role:
            return []
        return list(role.permissions.values_list('name', flat=True).order_by('name'))

    @extend_schema_field(serializers.BooleanField())
    def get_is_privileged(self, obj):
        """
        Full navigation bypass in the SPA (not the same as is_admin_like: KEPHIS/HCDA
        keep regulator directory powers on the API but only see nav allowed by app_permissions).
        """
        from api.rbac import ROLE_ADMIN

        if obj.is_superuser or obj.is_staff:
            return True
        role = obj.role
        name = str(getattr(role, 'role_name', '') or '').strip()
        return name in (ROLE_ADMIN, 'System Administrator')

    def validate(self, attrs):
        """
        If the client sends `role_name`, it overrides `role` (UUID) and resolves
        the ForeignKey by Role.role_name (case-insensitive).
        """
        if 'role_name' in self.initial_data:
            attrs.pop('role_name', None)
            raw = self.initial_data.get('role_name')
            if raw is None or (isinstance(raw, str) and not raw.strip()):
                attrs['role'] = None
            else:
                s = str(raw).strip()
                role_obj = Role.objects.filter(role_name__iexact=s).first()
                if not role_obj:
                    raise serializers.ValidationError(
                        {
                            'role_name': (
                                f'No role named "{s}". Create it under Roles (exact name) '
                                'or pick an existing role from the list.'
                            ),
                        }
                    )
                attrs['role'] = role_obj
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        return user


class RequestPasswordResetSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    email = serializers.EmailField()

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)


class ConfirmPasswordResetSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)


class RegisterSerializer(serializers.Serializer):
    """
    Access request only — not phone verification and does not send an OTP.
    Creates or updates a pending user; admin must set is_active before the user can use request_otp / verify_otp.
      - POST /api/users/register/ with { first_name, last_name, email?, phone_number, county?, role?,
        password, password_confirm } or legacy { name, ... }.
    """

    name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    phone_number = serializers.CharField(max_length=15)
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    county = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    role = serializers.UUIDField(required=False, allow_null=True)

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)

    def validate(self, attrs):
        phone = attrs['phone_number']
        existing = User.objects.filter(phone_number=phone).first()
        if existing and existing.is_active:
            raise serializers.ValidationError(
                {'phone_number': 'An account with this phone number already exists. Sign in instead.'}
            )
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        fn = (attrs.get('first_name') or '').strip()
        ln = (attrs.get('last_name') or '').strip()
        legacy = (attrs.get('name') or '').strip()
        if fn or ln:
            resolved_fn, resolved_ln = fn, ln
        elif legacy:
            parts = [p for p in legacy.split() if p]
            resolved_fn = parts[0] if parts else ''
            resolved_ln = ' '.join(parts[1:]) if len(parts) > 1 else ''
        else:
            raise serializers.ValidationError(
                {'non_field_errors': 'Enter your first and last name (or full name).'}
            )
        attrs['resolved_first_name'] = resolved_fn
        attrs['resolved_last_name'] = resolved_ln

        role_id = attrs.get('role')
        if role_id and not Role.objects.filter(pk=role_id).exists():
            raise serializers.ValidationError({'role': 'Invalid role selected.'})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirm', None)
        first_name = validated_data.pop('resolved_first_name')
        last_name = validated_data.pop('resolved_last_name')
        validated_data.pop('first_name', None)
        validated_data.pop('last_name', None)
        validated_data.pop('name', None)
        email = validated_data.pop('email', None) or None
        phone_number = validated_data.pop('phone_number')
        county_raw = validated_data.pop('county', None)
        county = (county_raw or '').strip() or None
        role_id = validated_data.pop('role', None)
        role = Role.objects.filter(pk=role_id).first() if role_id else None

        user = User.objects.filter(phone_number=phone_number).first()
        if user:
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.email = email if email is not None else user.email
            if county is not None:
                user.county = county
            if role is not None:
                user.role = role
            user.set_password(password)
            user.save()
            return user

        return User.objects.create_user(
            phone_number=phone_number,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email,
            county=county,
            role=role,
            is_active=False,
        )

class OTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)

class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    code = serializers.CharField(max_length=6)

    def validate_phone_number(self, value: str) -> str:
        return normalize_phone_number(value)


class LoginPasswordSerializer(serializers.Serializer):
    """Sign-in with email or phone plus password (approved accounts only)."""

    identifier = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        help_text='Email address or phone number',
    )
    email = serializers.CharField(required=False, allow_blank=True, max_length=255, write_only=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=20, write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        ident = (attrs.get('identifier') or '').strip()
        if not ident:
            ident = (attrs.get('email') or '').strip()
        if not ident:
            ident = (attrs.get('phone_number') or '').strip()
        if not ident:
            raise serializers.ValidationError({'identifier': ['Enter your email or phone number.']})
        attrs['identifier'] = ident
        attrs.pop('email', None)
        attrs.pop('phone_number', None)
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=255, help_text='Email address or phone number')

    def validate_identifier(self, value: str) -> str:
        s = (value or '').strip()
        if not s:
            raise serializers.ValidationError('Enter your email or phone number.')
        return s


class PasswordResetConfirmSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=255, help_text='Email address or phone number')
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    def validate_identifier(self, value: str) -> str:
        s = (value or '').strip()
        if not s:
            raise serializers.ValidationError('Enter your email or phone number.')
        return s


class LinkAgronomistSerializer(serializers.Serializer):
    farmer_id = serializers.UUIDField()


class VerifyLinkSerializer(serializers.Serializer):
    farmer_id = serializers.UUIDField()
    otp_code = serializers.CharField(max_length=6)
