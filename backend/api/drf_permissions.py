from rest_framework.permissions import BasePermission

from .rbac import ROLE_AGRONOMIST, has_app_permission, is_admin_like, role_name


class IsAdminLike(BasePermission):
    message = 'You do not have permission to access this resource.'

    def has_permission(self, request, view):
        return is_admin_like(request.user)


class IsSelfOrAdminLike(BasePermission):
    message = 'You do not have permission to access this resource.'

    def has_object_permission(self, request, view, obj):
        if is_admin_like(request.user):
            return True
        try:
            return obj.id == request.user.id
        except Exception:
            return False


class HasRolePermission(BasePermission):
    """
    Requires a permission name existing in api.AppPermission and attached
    to the user's api.Role.permissions.
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
    """Review workflow: admin-like, agronomist, or role with scouting.manage."""

    message = 'You do not have permission to review scouting submissions.'

    def has_permission(self, request, view):
        if not request.user or not getattr(request.user, 'is_authenticated', False):
            return False
        if is_admin_like(request.user):
            return True
        if role_name(request.user) == ROLE_AGRONOMIST:
            return True
        return has_app_permission(request.user, 'scouting.manage')

