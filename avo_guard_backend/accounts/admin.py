from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP, Entity, Role, AppPermission

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'description')
    search_fields = ('role_name', 'description')
    filter_horizontal = ('permissions',)

@admin.register(AppPermission)
class AppPermissionAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'entity_type', 'HCDA_license', 'primary_county', 'is_active')
    list_filter = ('entity_type', 'is_active', 'primary_county')
    search_fields = ('company_name', 'HCDA_license', 'company_email', 'phone_number')
    ordering = ('company_name',)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ('phone_number',)
    list_display = ('phone_number', 'first_name', 'last_name', 'email', 'role', 'county', 'entity', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'county', 'entity')
    search_fields = ('phone_number', 'email', 'first_name', 'last_name')
    
    # Since we removed username, we need to adjust fieldsets
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'role', 'county', 'entity')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'email', 'first_name', 'last_name', 'role', 'county', 'entity', 'password'),
        }),
    )

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'code', 'created_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('phone_number', 'code')
    ordering = ('-created_at',)
