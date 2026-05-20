import { apiRequest } from './client';

export type ReviewStatus = 'new' | 'under-review' | 'reviewed';
export type TriageStatus = 'pending' | 'confirmed' | 'needs_follow_up';

export type ScoutingReport = {
  id: string;
  farmName: string;
  blockId: string;
  farmerName: string;
  severity: 'low' | 'medium' | 'high';
  source: string;
  finding: string;
  status: string;
  mediaPreview: string | null;
  timestamp: string;
  reviewed: ReviewStatus;
  county: string | null;
  assignedTo: string | null;

  triageStatus?: TriageStatus;
  triageLabel?: string | null;
  triagedAt?: string | null;
  managementProtocol?: string | null;
  reviewNotes?: string | null;
  pushedToFarmer?: boolean;
  ussdCode?: string;
  farmerId?: string;
  blockUuid?: string | null;
  rawTimestamp?: string;
  auditFlags?: string[];
  /** Full mobile / Android payload preserved on import */
  rawPayload?: Record<string, unknown> | null;
  pestsObservedList?: string[];
  diseasesObservedList?: string[];
  beneficialInsectsObservedList?: string[];
  pestPlantPartsAffectedList?: string[];
  diseasePlantPartsAffectedList?: string[];
  actionsTakenList?: string[];
  outcomeList?: string[];
  /** Hass, etc. */
  variety?: string | null;
  /** Weekly record location (e.g. county / ward text) */
  reportLocation?: string | null;
  blockTreeCount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  additionalNotes?: string | null;
  remarks?: string | null;
  gpsLatitude?: string | null;
  gpsLongitude?: string | null;
  /** All image / file URLs for review (photos + voice) */
  mediaGallery?: string[];
  /** WeeklyRecord trap summary when `trap_use` is absent in raw JSON */
  recordTypeOfTrap?: string;
  recordNumberOfTrap?: number;
  recordTrapsReplaced?: number;
  recordPestsPerTrap?: string | null;
};

export type ScoutingReportListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ScoutingReport[];
};

export async function fetchScoutingReports(params: {
  page?: number;
  page_size?: number;
  search?: string;
} = {}): Promise<ScoutingReportListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.page_size) query.append('page_size', params.page_size.toString());
  if (params.search) query.append('search', params.search);

  return apiRequest<ScoutingReportListResponse>(`/api/pest-scouting/scouting-reports/?${query.toString()}`, {
    method: 'GET',
    auth: true,
  });
}

export async function fetchScoutingReportDetail(id: string): Promise<ScoutingReport> {
  return apiRequest<ScoutingReport>(`/api/pest-scouting/scouting-reports/${id}/`, {
    method: 'GET',
    auth: true,
  });
}
