import type { AdminEntityRow, AdminRoleRow, AdminUserRow } from './types';
import { apiRequest, type PaginatedResults } from './client';

export type AppPermissionDto = { id: string; name: string };

function entityTypeToUiSlug(entityType: string): string {
  const v = entityType?.toLowerCase() ?? '';
  if (v.includes('kephis')) return 'kephis';
  if (v.includes('hcda')) return 'hcda';
  if (v.includes('partner')) return 'partner';
  return 'exporter';
}

export async function listPermissions(): Promise<AppPermissionDto[]> {
  const data = await apiRequest<PaginatedResults<AppPermissionDto>>('/api/permissions/?page_size=1000');
  return data.results;
}

function formatLastLogin(iso: string | null | undefined): string {
  if (iso == null || iso === '') return 'Never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export async function listUsers(): Promise<AdminUserRow[]> {
  const data = await apiRequest<PaginatedResults<any>>('/api/users/?page_size=1000');
  return data.results.map((u) => {
    const first = u.first_name ?? '';
    const last = u.last_name ?? '';
    return {
      id: u.id,
      name: `${first} ${last}`.trim() || u.email || u.phone_number || u.id,
      role: u.role_details?.role_name ?? 'Unknown',
      email: u.email ?? '',
      phone: u.phone_number ?? '',
      county: u.county ?? '',
      status: u.is_active ? 'active' : 'inactive',
      lastLogin: formatLastLogin(u.last_login),
    };
  });
}

export async function createUser(input: {
  phone_number: string;
  email?: string | null;
  first_name: string;
  last_name: string;
  role?: string | null; // role uuid (optional if role_name is set)
  role_name?: string | null; // Role.role_name — preferred for Admin UI
  entity?: string | null; // entity uuid
  county?: string | null;
}) {
  return apiRequest('/api/users/', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateUser(
  id: string,
  input: Partial<{
    phone_number: string;
    email: string | null;
    first_name: string;
    last_name: string;
    role: string | null;
    role_name: string | null;
    entity: string | null;
    county: string | null;
    is_active: boolean;
  }>
) {
  return apiRequest(`/api/users/${id}/`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteUser(id: string) {
  return apiRequest<void>(`/api/users/${id}/`, { method: 'DELETE' });
}

export async function listRoles(): Promise<AdminRoleRow[]> {
  const data = await apiRequest<PaginatedResults<any>>('/api/roles/?page_size=1000');
  return data.results.map((r) => ({
    id: r.id,
    name: r.role_name ?? '',
    description: r.description ?? '',
    users: r.users ?? 0,
    permissions: r.permissions_count ?? 0,
  }));
}

export async function createRole(input: { role_name: string; description?: string | null; permissions_input?: string[] }) {
  return apiRequest('/api/roles/', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateRole(
  id: string,
  input: Partial<{ role_name: string; description: string | null; permissions_input: string[] }>
) {
  return apiRequest(`/api/roles/${id}/`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function retrieveRole(id: string): Promise<{
  id: string;
  role_name: string;
  description: string | null;
  permissions: string[];
}> {
  return apiRequest(`/api/roles/${id}/`, { method: 'GET' });
}

export async function deleteRole(id: string) {
  return apiRequest<void>(`/api/roles/${id}/`, { method: 'DELETE' });
}

export async function listEntities(): Promise<AdminEntityRow[]> {
  const data = await apiRequest<PaginatedResults<any>>('/api/entities/?page_size=1000');
  return data.results.map((e) => ({
    id: e.id,
    companyName: e.company_name ?? '',
    hcdaLicense: e.HCDA_license ?? '',
    licenseExpiry: e.license_expiry_date ? String(e.license_expiry_date) : 'N/A',
    headAgronomist: e.head_agronomist ?? '',
    linkedFarmers: e.linked_farmers ?? 0,
    status: Boolean(e.is_active),
    email: e.company_email ?? '',
    phone: e.phone_number ?? '',
    county: e.primary_county ?? '',
    entityType: entityTypeToUiSlug(e.entity_type ?? ''),
  }));
}

export async function createEntity(input: {
  entity_type: 'Exporter' | 'Government - KEPHIS' | 'Government - HCDA' | 'Partner Organization';
  company_name: string;
  HCDA_license: string;
  license_expiry_date: string;
  head_agronomist: string;
  primary_county: string;
  company_email: string;
  phone_number: string;
  is_active: boolean;
}) {
  return apiRequest('/api/entities/', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateEntity(
  id: string,
  input: Partial<{
    entity_type: 'Exporter' | 'Government - KEPHIS' | 'Government - HCDA' | 'Partner Organization';
    company_name: string;
    HCDA_license: string;
    license_expiry_date: string;
    head_agronomist: string;
    primary_county: string;
    company_email: string;
    phone_number: string;
    is_active: boolean;
  }>
) {
  return apiRequest(`/api/entities/${id}/`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteEntity(id: string) {
  return apiRequest<void>(`/api/entities/${id}/`, { method: 'DELETE' });
}

/** Alert rules (admin “Alert Rules” tab) */
export type AdminAlertRuleApiRow = {
  id: string;
  name: string;
  condition: string;
  threshold: string;
  county: string;
  pest: string;
  action: string;
  recipients: string;
  status: string;
  triggered: number;
  lastTriggered: string;
};

export async function listAlertRules(): Promise<AdminAlertRuleApiRow[]> {
  const data = await apiRequest<PaginatedResults<any>>('/api/alert_rules/?page_size=1000');
  return data.results.map((r) => ({
    id: r.id,
    name: r.name,
    condition: r.condition,
    threshold: r.threshold,
    county: r.county ?? '',
    pest: r.pest ?? '',
    action: r.action,
    recipients: r.recipients ?? '',
    status: r.status ?? 'active',
    triggered: r.triggered ?? 0,
    lastTriggered: r.last_triggered_at ? new Date(r.last_triggered_at).toLocaleString() : 'Never',
  }));
}

export async function createAlertRule(input: {
  name: string;
  condition: string;
  threshold: string;
  county?: string;
  pest?: string;
  action: string;
  recipients?: string;
  status?: string;
}) {
  return apiRequest('/api/alert_rules/', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateAlertRule(
  id: string,
  input: Partial<{
    name: string;
    condition: string;
    threshold: string;
    county: string;
    pest: string;
    action: string;
    recipients: string;
    status: string;
  }>
) {
  return apiRequest(`/api/alert_rules/${id}/`, { method: 'PATCH', body: JSON.stringify(input) });
}

export async function deleteAlertRule(id: string) {
  return apiRequest<void>(`/api/alert_rules/${id}/`, { method: 'DELETE' });
}

export type AdminSummaryDto = {
  active_users: number;
  roles_count: number;
  entities_count: number;
  entities_active_count: number;
  alert_rules_count: number;
  alert_rules_active_count: number;
  permissions_count: number;
};

export async function fetchAdminSummary(): Promise<AdminSummaryDto> {
  return apiRequest<AdminSummaryDto>('/api/admin/summary/');
}

