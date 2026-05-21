from __future__ import annotations

from rest_framework.permissions import BasePermission

from .rbac import ROLE_AGRONOMIST, ROLE_HCDA, has_app_permission, is_admin_like, role_name


class IsAdminLike(BasePermission):
    message = 'You do not have permission to access this resource.'

    def has_permission(self, request, view):
        return is_admin_like(request.user)


class HasRolePermission(BasePermission):
    """
    Requires a permission name existing in accounts.AppPermission and attached
    to the user's accounts.Role.permissions.
    """

    message = 'You do not have permission to perform this action.'
    required_permission: str | None = None

    def has_permission(self, request, view):
        perm = getattr(self, 'required_permission', None)
        if not perm:
            return False
        return has_app_permission(request.user, perm)


def require_permission(permission_name: str):
    class _Perm(HasRolePermission):
        required_permission = permission_name

    return _Perm


class CanManageScoutingReview(BasePermission):
    """Admin-like, Agronomist, or role with `scouting.manage`."""

    message = 'You do not have permission to review scouting submissions.'

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return False
        if role_name(user) == ROLE_AGRONOMIST:
            return True
        # HCDA is admin_like for county APIs but must not review individual scouting without scouting.manage.
        if role_name(user) == ROLE_HCDA:
            return has_app_permission(user, 'scouting.manage')
        if is_admin_like(user):
            return True
        return has_app_permission(user, 'scouting.manage')

