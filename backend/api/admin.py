from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import AlertRule, AppPermission, Entity, Role, User


@admin.register(AppPermission)
class AppPermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'id')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('role_name', 'id')
    filter_horizontal = ('permissions',)


@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'condition', 'county', 'triggered_count', 'id')
    list_filter = ('status', 'condition')


@admin.register(Entity)
class EntityAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'entity_type', 'is_active', 'id')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ('phone_number',)
    list_display = ('phone_number', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('phone_number', 'email', 'first_name', 'last_name')
    filter_horizontal = ('groups', 'user_permissions',)

    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal', {'fields': ('first_name', 'last_name', 'email', 'county')}),
        ('Organization', {'fields': ('role', 'entity')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )
