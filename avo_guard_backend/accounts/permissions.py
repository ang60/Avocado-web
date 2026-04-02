from rest_framework.permissions import BasePermission

from api.rbac import is_admin_like


class IsAdminLikeUser(BasePermission):
    """
    Staff, superuser, or accounts.Role matching Administrator / KEPHIS / HCDA
    (see api.rbac.is_admin_like).
    """

    message = 'Administrator access is required to manage directory data.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return is_admin_like(request.user)
