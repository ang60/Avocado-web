from __future__ import annotations

from typing import Iterable

ROLE_ADMIN = 'Administrator'
ROLE_KEPHIS = 'KEPHIS'
ROLE_HCDA = 'HCDA'
ROLE_EXPORTER = 'Exporter'
ROLE_AGRONOMIST = 'Agronomist'
ROLE_FARM_MANAGER = 'Farm Manager'
ROLE_FARMER = 'Farmer'


ADMIN_LIKE_ROLES = {ROLE_ADMIN, ROLE_KEPHIS, ROLE_HCDA}


def role_name(user) -> str:
    r = getattr(user, 'role', None)
    name = getattr(r, 'role_name', '') if r else ''
    return str(name or '').strip()


def is_admin_like(user) -> bool:
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return True
    return role_name(user) in ADMIN_LIKE_ROLES


def has_any_role(user, roles: Iterable[str]) -> bool:
    rn = role_name(user)
    return rn in set(roles)


def has_app_permission(user, permission_name: str) -> bool:
    """
    Checks permissions attached to the user's Role (api.AppPermission).
    Superusers/staff always pass.
    """
    if not user or not getattr(user, 'is_authenticated', False):
        return False
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
        return True
    role = getattr(user, 'role', None)
    if not role:
        return False
    try:
        return role.permissions.filter(name=permission_name).exists()
    except Exception:
        return False

