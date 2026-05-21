import { clearAuthSession, getAccessToken } from '../auth';
import { DEFAULT_API_BASE_URL } from './endpoints';

export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export type PaginatedResults<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/** DRF list views: either a JSON array or `{ results: [...] }` when paginated. */
export function parseDrfList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as PaginatedResults<T>).results)
  ) {
    return (data as PaginatedResults<T>).results;
  }
  return [];
}

export class ApiError extends Error {
  status: number;
  bodyText: string;

  constructor(message: string, status: number, bodyText: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.bodyText = bodyText;
  }

  /** Parses DRF `detail`, `non_field_errors`, and per-field validation messages. */
  getDetailMessage(): string | null {
    const raw = this.bodyText?.trim();
    if (!raw) return null;
    try {
      const body = JSON.parse(raw) as Record<string, unknown>;
      const chunks: string[] = [];

      const pushDetail = (val: unknown) => {
        if (typeof val === 'string' && val.trim()) chunks.push(val.trim());
        else if (Array.isArray(val)) {
          for (const item of val) {
            if (typeof item === 'string' && item.trim()) chunks.push(item.trim());
          }
        }
      };

      pushDetail(body.detail);
      pushDetail(body.non_field_errors);

      for (const [key, val] of Object.entries(body)) {
        if (key === 'detail' || key === 'non_field_errors') continue;
        if (typeof val === 'string' && val.trim()) chunks.push(`${key}: ${val.trim()}`);
        else if (Array.isArray(val)) {
          const strs = val.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean);
          if (strs.length) chunks.push(`${key}: ${strs.join(' ')}`);
        }
      }

      return chunks.length ? [...new Set(chunks)].join(' ') : null;
    } catch {
      /* not JSON (e.g. HTML error page) */
    }
    return null;
  }
}

function buildUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const auth = init?.auth ?? true;
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');
  if (auth) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), { ...init, headers });
  if (!res.ok) {
    if (auth && res.status === 401) {
      clearAuthSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    const bodyText = await res.text().catch(() => '');
    throw new ApiError(`Request failed (${res.status}) ${res.statusText}`, res.status, bodyText);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

