const ACCESS_TOKEN_KEY = 'avoguard.auth.access';
const REFRESH_TOKEN_KEY = 'avoguard.auth.refresh';
const USER_KEY = 'avoguard.auth.user';

export type AuthUser = {
  id: string;
  phone_number: string;
  email?: string | null;
  first_name: string;
  last_name: string;
  county?: string | null;
  role?: {
    id: string;
    role_name: string;
    description?: string;
    permissions?: Array<{ id: string; name: string }>;
    users?: number;
    permissions_count?: number;
  } | null;
  role_details?: { id: string; role_name: string } | null;
  entity?: any | null;
  entity_details?: { id: string; company_name: string } | null;
  /** Permission names from the user's role (omitted on older sessions until next login). */
  app_permissions?: string[];
  /** Staff, superuser, or Administrator role — all nav areas without checking app_permissions. */
  is_privileged?: boolean;
};

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

const authListeners = new Set<() => void>();

/** Subscribe to login/logout (localStorage session changes). Used by TopBar to refresh profile. */
export function subscribeAuth(listener: () => void): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

function notifyAuthListeners() {
  authListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

export function setAuthSession(params: { access: string; refresh: string; user: AuthUser }) {
  if (typeof window === 'undefined') return;
  const user = { ...params.user };
  if (user.role && !user.role_details) {
    user.role_details = { id: user.role.id, role_name: user.role.role_name };
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, params.access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, params.refresh);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthListeners();
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyAuthListeners();
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.trim().length > 0);
}
