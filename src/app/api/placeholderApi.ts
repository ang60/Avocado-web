
import type {
  AdminPayload,
  AdminEntityRow,
  AdminRoleRow,
  AdminUserRow,
  CaseDetailPayload,
  CaseManagementPayload,
  DashboardPayload,
  FarmerDetailPayload,
  KnowledgeBaseListPayload,
  NavbarNotification,
  NavbarUser,
  OutbreakMonitoringPayload,
  PlaceholderAlert,
  ScoutingFeedItem,
  SearchResultItem,
  SymptomCodebookEntry,
  FarmerListRow,
  ComplianceFarmerRow,
} from './types';
import { apiRequest, type PaginatedResults } from './client';
import { PLACEHOLDER_ALERTS } from './placeholderData/alertsData';
import { PLACEHOLDER_ADMIN } from './placeholderData/adminData';
import { getPlaceholderCaseDetail } from './placeholderData/caseDetailData';
import { PLACEHOLDER_CASE_MANAGEMENT } from './placeholderData/caseManagementData';
import { PLACEHOLDER_DASHBOARD } from './placeholderData/dashboardPayload';
import { getPlaceholderFarmerDetail } from './placeholderData/farmerDetailData';
import { PLACEHOLDER_FARMERS } from './placeholderData/farmersListData';
import { PLACEHOLDER_COMPLIANCE_FARMERS } from './placeholderData/complianceFarmersData';
import {
  PLACEHOLDER_KB_ARTICLES,
  PLACEHOLDER_KB_CATEGORIES,
} from './placeholderData/knowledgeBaseListData';
import { PLACEHOLDER_OUTBREAK_MONITORING } from './placeholderData/outbreakMonitoringData';
import { PLACEHOLDER_SCOUTING_FEED } from './placeholderData/scoutingFeedData';
import { PLACEHOLDER_SYMPTOM_CODES } from './placeholderData/symptomCodebookData';
import {
  PLACEHOLDER_NAVBAR_USER,
  PLACEHOLDER_NOTIFICATIONS,
  PLACEHOLDER_SEARCH_INDEX,
} from './placeholderData/navbarData';
import { articleData } from '../data/articleData';

const DELAY_MS = Number(import.meta.env?.VITE_PLACEHOLDER_API_DELAY_MS) || 380;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function mock<T>(data: T): Promise<T> {
  await sleep(DELAY_MS);
  return JSON.parse(JSON.stringify(data)) as T;
}

function entityTypeToUiSlug(entityType: string): string {
  const v = entityType?.toLowerCase() ?? '';
  if (v.includes('k ephis') || v.includes('kephis')) return 'kephis';
  if (v.includes('hcda')) return 'hcda';
  if (v.includes('partner')) return 'partner';
  return 'exporter';
}

export async function fetchUsers(): Promise<AdminUserRow[]> {
  const data = await apiRequest<PaginatedResults<any>>('/api/users/?page_size=1000');
  return data.results.map((u) => {
    const first = u.first_name ?? '';
    const last = u.last_name ?? '';
    return {
      id: u.id,
      name: `${first} ${last}`.trim() || u.email || u.phone_number || u.id,
      role: u.role_details?.role_name ?? u.role_details?.id ?? 'Unknown',
      email: u.email ?? '',
      phone: u.phone_number ?? '',
      county: u.county ?? '',
      status: u.is_active ? 'active' : 'inactive',
      lastLogin: u.last_login ?? 'Never',
    };
  });
}

export async function fetchRoles(): Promise<AdminRoleRow[]> {
  const data = await apiRequest<PaginatedResults<any>>('/api/roles/?page_size=1000');
  return data.results.map((r) => ({
    id: r.id,
    name: r.role_name ?? '',
    description: r.description ?? '',
    users: r.users ?? 0,
    permissions: r.permissions_count ?? 0,
  }));
}

export async function fetchEntities(): Promise<AdminEntityRow[]> {
  const data = await apiRequest<PaginatedResults<any>>('/api/entities/?page_size=1000');
  return data.results.map((e) => ({
    id: e.id,
    companyName: e.company_name ?? '',
    hcdaLicense: e.HCDA_license ?? '',
    licenseExpiry: e.license_expiry_date ?? 'N/A',
    headAgronomist: e.head_agronomist ?? '',
    linkedFarmers: e.linked_farmers ?? 0,
    status: Boolean(e.is_active),
    email: e.company_email ?? '',
    phone: e.phone_number ?? '',
    county: e.primary_county ?? '',
    entityType: entityTypeToUiSlug(e.entity_type ?? ''),
  }));
}

export async function fetchDashboard(): Promise<DashboardPayload> {
  return mock(PLACEHOLDER_DASHBOARD);
}

export async function fetchScoutingFeed(): Promise<ScoutingFeedItem[]> {
  return mock(PLACEHOLDER_SCOUTING_FEED);
}

export async function fetchNavbarUser(): Promise<NavbarUser> {
  return mock(PLACEHOLDER_NAVBAR_USER);
}

export async function fetchNotifications(): Promise<NavbarNotification[]> {
  return mock(PLACEHOLDER_NOTIFICATIONS);
}

export async function searchGlobal(query: string): Promise<SearchResultItem[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  await sleep(Math.min(200, DELAY_MS));
  const results = PLACEHOLDER_SEARCH_INDEX.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.sublabel.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
  );
  return results.slice(0, 8);
}

export function getPlaceholderCurrentAgronomist(): string {
  return 'Dr. James Kariuki';
}

export async function fetchCaseManagement(): Promise<CaseManagementPayload> {
  return mock(PLACEHOLDER_CASE_MANAGEMENT);
}

export async function fetchOutbreakMonitoring(): Promise<OutbreakMonitoringPayload> {
  return mock(PLACEHOLDER_OUTBREAK_MONITORING);
}

export async function fetchAlerts(): Promise<PlaceholderAlert[]> {
  return mock(PLACEHOLDER_ALERTS);
}

export async function fetchSymptomCodebook(): Promise<SymptomCodebookEntry[]> {
  return mock(PLACEHOLDER_SYMPTOM_CODES);
}

export async function fetchFarmersList(): Promise<FarmerListRow[]> {
  return mock(PLACEHOLDER_FARMERS);
}

export async function fetchComplianceFarmers(): Promise<ComplianceFarmerRow[]> {
  return mock(PLACEHOLDER_COMPLIANCE_FARMERS);
}

export async function fetchKnowledgeBaseList(): Promise<KnowledgeBaseListPayload> {
  return mock({
    articles: PLACEHOLDER_KB_ARTICLES,
    categories: PLACEHOLDER_KB_CATEGORIES,
  });
}

export async function fetchAdmin(): Promise<AdminPayload> {
  // Admin user management endpoints are real; alert rules/system stats remain placeholder until endpoints exist.
  try {
    const [users, roles] = await Promise.all([fetchUsers(), fetchRoles()]);
    const activeUsers = users.filter((u) => u.status === 'active').length;
    const systemStats: AdminPayload['systemStats'] = [
      { label: 'Active Users', value: String(activeUsers), icon: 'users', color: '#2D6A4F' },
      ...PLACEHOLDER_ADMIN.systemStats.filter((s) => s.label !== 'Active Users'),
    ];

    return {
      ...PLACEHOLDER_ADMIN,
      users,
      roles,
      systemStats,
    };
  } catch {
    // If auth/baseUrl aren’t configured, keep the UI working with demo data.
    return mock(PLACEHOLDER_ADMIN);
  }
}

export async function fetchFarmerDetail(farmerId: string | undefined): Promise<FarmerDetailPayload> {
  return mock(getPlaceholderFarmerDetail(farmerId));
}

export async function fetchCaseDetail(caseId: string | undefined): Promise<CaseDetailPayload> {
  return mock(getPlaceholderCaseDetail(caseId));
}

/** Knowledge Base article body (rich content from static articleData). */
export async function fetchKBArticle(articleId: string | undefined): Promise<Record<string, unknown> | null> {
  const id = articleId?.trim() || '';
  await sleep(DELAY_MS);
  const raw = id && articleData[id as keyof typeof articleData];
  if (!raw) return null;
  return JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;
}

export interface GeneratedReportPayload {
  reportType: string;
  reportTitle: string;
  generatedAt: string;
  format: 'pdf' | 'excel' | 'json';
  dateRange: string;
  region: string;
  farmerIds: string[];
  summaryLines: string[];
}

export async function generateComplianceReport(params: {
  reportType: string;
  reportTitle: string;
  format: 'pdf' | 'excel' | 'json';
  dateRange: string;
  region: string;
  farmerIds: string[];
  summaryLines: string[];
}): Promise<GeneratedReportPayload> {
  await sleep(Math.max(400, DELAY_MS));
  return {
    reportType: params.reportType,
    reportTitle: params.reportTitle,
    generatedAt: new Date().toISOString(),
    format: params.format,
    dateRange: params.dateRange,
    region: params.region,
    farmerIds: [...params.farmerIds],
    summaryLines: params.summaryLines,
  };
}
