import { ApiError, API_BASE_URL } from './client';
import { DEFAULT_API_BASE_URL } from './endpoints';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Your session is missing or expired. Sign in again.';
    }
    if (err.status === 503 || err.status === 502 || err.status === 504) {
      const target = API_BASE_URL || DEFAULT_API_BASE_URL;
      return `API unavailable (HTTP ${err.status}) at ${target}. Check https://avo-guard.vercel.app/api/schema/swagger-ui/ is up. For local dev, use VITE_API_PROXY_TARGET=https://avo-guard.vercel.app (see frontend/env.example).`;
    }
    if (err.status === 403) {
      return 'You do not have permission for this data. Ask an admin to assign the right role.';
    }
    const parsed = err.getDetailMessage();
    if (parsed) return parsed;
    return `${fallback} (HTTP ${err.status}).`;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (
    err instanceof TypeError ||
    /fetch|network|failed to fetch|connection refused|ECONNREFUSED|ERR_NETWORK|ERR_FAILED|CORS/i.test(msg)
  ) {
    const devHint =
      import.meta.env.DEV && import.meta.env.VITE_API_USE_PROXY !== 'true'
        ? ' For local dev, set VITE_API_USE_PROXY=true in frontend/.env.local (uses Vite proxy to avoid CORS).'
        : '';
    const target = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : DEFAULT_API_BASE_URL);
    return `Cannot reach the API at ${target}.${devHint} If the dashboard is on a different host than Django, add that origin to the API CORS_ALLOWED_ORIGINS.`;
  }
  return fallback;
}
