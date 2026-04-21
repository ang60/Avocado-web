import { ApiError, API_BASE_URL } from './client';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Your session is missing or expired. Sign in again.';
    }
    if (err.status === 403) {
      return 'You do not have permission for this data. Ask an admin to assign the right role.';
    }
    const parsed = err.getDetailMessage();
    if (parsed) return parsed;
    return `${fallback} (HTTP ${err.status}).`;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (err instanceof TypeError || /fetch|network|failed to fetch|connection refused/i.test(msg)) {
    return `Cannot reach the API at ${API_BASE_URL}. Start the Django server (python manage.py runserver) and set VITE_API_BASE_URL if needed.`;
  }
  return fallback;
}
