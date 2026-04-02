import type {
  CaseDetailPayload,
  CaseManagementCaseRow,
  CaseManagementPayload,
  DashboardPayload,
  FarmerDetailPayload,
  FarmerListRow,
  ScoutingFeedItem,
} from './types';
import { apiRequest, parseDrfList, type PaginatedResults } from './client';

/**
 * Real backend API calls (Django/DRF).
 * These mirror the placeholderApi function names but call live endpoints.
 */

export async function fetchDashboard(): Promise<DashboardPayload> {
  return apiRequest<DashboardPayload>('/api/dashboard/');
}

export async function fetchFarmersList(): Promise<FarmerListRow[]> {
  const data = await apiRequest<PaginatedResults<FarmerListRow> | FarmerListRow[]>(
    '/api/farmers/?page_size=1000',
  );
  return parseDrfList<FarmerListRow>(data);
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
  const data = await apiRequest<PaginatedResults<ScoutingFeedItem> | ScoutingFeedItem[]>(
    '/api/scouting_reports/?page_size=500',
  );
  return parseDrfList<ScoutingFeedItem>(data);
}

export type CreateCaseFromScoutingPayload = {
  farmer: string;
  scouting_report: string;
  pest_disease: string;
  severity: 'high' | 'medium' | 'low' | 'unknown';
  notes?: string;
  block?: string | null;
  /** Omit to let the server assign the current user when they are an agronomist; send `null` to leave unassigned. */
  assigned_agronomist?: string | null;
};

export async function createCaseFromScouting(
  body: CreateCaseFromScoutingPayload
): Promise<CaseManagementCaseRow> {
  const payload: Record<string, unknown> = {
    farmer: body.farmer,
    scouting_report: body.scouting_report,
    pest_disease: body.pest_disease,
    severity: body.severity,
  };
  if (body.notes && body.notes.trim()) payload.notes = body.notes.trim();
  if (body.block) payload.block = body.block;
  if (body.assigned_agronomist === null) payload.assigned_agronomist = null;
  if (typeof body.assigned_agronomist === 'string' && body.assigned_agronomist)
    payload.assigned_agronomist = body.assigned_agronomist;
  return apiRequest<CaseManagementCaseRow>('/api/cases/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

