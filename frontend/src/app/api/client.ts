import axios, { AxiosError, type AxiosRequestConfig, type Method } from 'axios';
import { clearAuthSession, getAccessToken } from '../auth';
import { DEFAULT_API_BASE_URL } from './endpoints';

export const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');

/** Shared axios instance (base URL + JSON defaults). */
export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

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

function responseBodyText(data: unknown): string {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

function headersFromInit(init?: RequestInit): Record<string, string> {
  const out: Record<string, string> = {};
  if (!init?.headers) return out;
  const h = new Headers(init.headers);
  h.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  if (body == null) return undefined;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return body;
    }
  }
  return body;
}

function axiosConfigFromInit(path: string, init?: RequestInit & { auth?: boolean }): AxiosRequestConfig {
  const auth = init?.auth ?? true;
  const method = (init?.method?.toUpperCase() || 'GET') as Method;
  const headers = headersFromInit(init);
  const data = parseRequestBody(init?.body ?? undefined);

  if (data !== undefined && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const config: AxiosRequestConfig = {
    method,
    headers,
    data: method === 'GET' || method === 'HEAD' ? undefined : data,
    validateStatus: () => true,
  };

  if (path.startsWith('http://') || path.startsWith('https://')) {
    config.url = path;
  } else {
    config.url = path;
    config.baseURL = API_BASE_URL;
  }

  return config;
}

function throwApiErrorFromAxios(err: AxiosError, auth: boolean): never {
  const status = err.response?.status ?? 0;
  const statusText = err.response?.statusText ?? err.message;
  const bodyText = responseBodyText(err.response?.data);

  if (auth && status === 401) {
    clearAuthSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }

  throw new ApiError(`Request failed (${status}) ${statusText}`, status, bodyText);
}

function handleUnauthorized(auth: boolean, status: number): void {
  if (auth && status === 401) {
    clearAuthSession();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  }
}

export type ApiCallOptions = {
  /** Attach Bearer token (default true). */
  auth?: boolean;
};

async function apiCall<T>(
  config: AxiosRequestConfig,
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(config.headers as Record<string, string> | undefined),
  };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await http.request<T>({
      validateStatus: () => true,
      ...config,
      headers,
    });

    if (res.status >= 200 && res.status < 300) {
      if (res.status === 204) return undefined as unknown as T;
      return res.data as T;
    }

    const bodyText = responseBodyText(res.data);
    handleUnauthorized(auth, res.status);
    throw new ApiError(`Request failed (${res.status}) ${res.statusText}`, res.status, bodyText);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (axios.isAxiosError(err)) throwApiErrorFromAxios(err, auth);
    throw err;
  }
}

export function apiGet<T>(path: string, options: ApiCallOptions = {}): Promise<T> {
  return apiCall<T>({ method: 'GET', url: path }, options.auth ?? true);
}

export function apiPost<T>(path: string, data?: unknown, options: ApiCallOptions = {}): Promise<T> {
  return apiCall<T>({ method: 'POST', url: path, data }, options.auth ?? true);
}

export function apiPatch<T>(path: string, data?: unknown, options: ApiCallOptions = {}): Promise<T> {
  return apiCall<T>({ method: 'PATCH', url: path, data }, options.auth ?? true);
}

export function apiPut<T>(path: string, data?: unknown, options: ApiCallOptions = {}): Promise<T> {
  return apiCall<T>({ method: 'PUT', url: path, data }, options.auth ?? true);
}

export function apiDelete<T>(path: string, options: ApiCallOptions = {}): Promise<T> {
  return apiCall<T>({ method: 'DELETE', url: path }, options.auth ?? true);
}

/** Legacy fetch-style wrapper — prefer `apiGet` / `apiPost` for new code. */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const auth = init?.auth ?? true;

  try {
    const res = await http.request<T>(axiosConfigFromInit(path, init));

    if (res.status >= 200 && res.status < 300) {
      if (res.status === 204) return undefined as unknown as T;
      return res.data as T;
    }

    const bodyText = responseBodyText(res.data);
    handleUnauthorized(auth, res.status);
    throw new ApiError(`Request failed (${res.status}) ${res.statusText}`, res.status, bodyText);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (axios.isAxiosError(err)) throwApiErrorFromAxios(err, auth);
    throw err;
  }
}
