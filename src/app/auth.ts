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
  role_details?: { id: string; role_name: string } | null;
  entity_details?: { id: string; company_name: string } | null;
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

export function setAuthSession(params: { access: string; refresh: string; user: AuthUser }) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, params.access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, params.refresh);
  window.localStorage.setItem(USER_KEY, JSON.stringify(params.user));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return Boolean(token && token.trim().length > 0);
}
