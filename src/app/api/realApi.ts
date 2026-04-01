import type {
  CaseDetailPayload,
  CaseManagementPayload,
  DashboardPayload,
  FarmerDetailPayload,
  FarmerListRow,
  ScoutingFeedItem,
} from './types';
import { apiRequest, type PaginatedResults } from './client';

/**
 * Real backend API calls (Django/DRF).
 * These mirror the placeholderApi function names but call live endpoints.
 */

export async function fetchDashboard(): Promise<DashboardPayload> {
  return apiRequest<DashboardPayload>('/api/dashboard/');
}

export async function fetchFarmersList(): Promise<FarmerListRow[]> {
  return apiRequest<FarmerListRow[]>('/api/farmers/?page_size=1000').then((res: any) => res.results ?? res);
}

export async function fetchFarmerDetail(farmerId: string | undefined): Promise<FarmerDetailPayload> {
  const id = String(farmerId ?? '').trim();
  return apiRequest<FarmerDetailPayload>(`/api/farmers/${id}/`);
}

export async function fetchCaseManagement(): Promise<CaseManagementPayload> {
  return apiRequest<CaseManagementPayload>('/api/case_management/');
}

export async function fetchCaseDetail(caseId: string | undefined): Promise<CaseDetailPayload> {
  const id = String(caseId ?? '').trim();
  return apiRequest<CaseDetailPayload>(`/api/cases/${id}/`);
}

export async function fetchScoutingFeed(): Promise<ScoutingFeedItem[]> {
  return apiRequest<PaginatedResults<ScoutingFeedItem>>('/api/scouting_reports/?page_size=500').then(
    (res) => res.results ?? []
  );
}

