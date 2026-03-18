/**
 * Placeholder API — simulates network latency. Replace calls with real fetch() when backend exists.
 * Set VITE_API_BASE_URL later and branch here, or swap this module.
 */
import type {
  AdminPayload,
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
import { PLACEHOLDER_ALERTS } from './placeholderData/alertsData';
import { PLACEHOLDER_ADMIN } from './placeholderData/adminData';
import { getPlaceholderCaseDetail } from './placeholderData/caseDetailData';
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
  return mock(PLACEHOLDER_ADMIN);
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
