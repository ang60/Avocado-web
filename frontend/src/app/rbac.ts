import type { AuthUser } from './auth';

/**
 * AppPermission.name values from the API (see accounts migration 0012_seed_app_permissions_for_roles).
 * Nav items require the matching `nav.*` permission unless `is_privileged` is true.
 */
export function hasAppAccess(user: AuthUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.is_privileged) return true;
  const keys = user.app_permissions;
  // Sessions from before this field existed: treat as full access until the user signs in again.
  if (keys === undefined) return true;
  return keys.includes(permission);
}
