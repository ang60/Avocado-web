import { apiRequest } from './client';
import { API_PATHS } from './endpoints';

export type ReviewStatus = 'new' | 'under-review' | 'reviewed';
export type TriageStatus = 'pending' | 'confirmed' | 'needs_follow_up';

/** Maps API `reviewed` (slug string or legacy boolean) to a dashboard status. */
export function normalizeReviewStatus(value: unknown): ReviewStatus {
  if (value === true) return 'reviewed';
  if (value === false || value == null) return 'new';
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
    if (s === 'new' || s === 'pending') return 'new';
    if (s === 'under-review' || s === 'underreview') return 'under-review';
    if (s === 'reviewed' || s === 'yes' || s === 'done') return 'reviewed';
  }
  return 'new';
}

export function isReviewStatusNew(value: unknown): boolean {
  return normalizeReviewStatus(value) === 'new';
}

function normalizeScoutingReportRow<T extends { reviewed?: unknown }>(row: T): T & { reviewed: ReviewStatus } {
  return { ...row, reviewed: normalizeReviewStatus(row.reviewed) };
}

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

  const data = await apiRequest<ScoutingReportListResponse>(
    `${API_PATHS.pestScouting.scoutingReports}?${query.toString()}`,
    { method: 'GET', auth: true }
  );
  return {
    ...data,
    results: data.results.map((row) => normalizeScoutingReportRow(row)),
  };
}

/** WeeklyRecord UUID for pest_scouting detail API (strips dashboard `app-weekly-` prefix). */
export function normalizeScoutingReportApiId(id: string): string {
  const key = id.trim();
  if (key.startsWith('app-weekly-')) return key.slice('app-weekly-'.length);
  return key;
}

export async function fetchScoutingReportDetail(id: string): Promise<ScoutingReport> {
  const apiId = normalizeScoutingReportApiId(id);
  const row = await apiRequest<ScoutingReport>(`${API_PATHS.pestScouting.scoutingReports}${apiId}/`, {
    method: 'GET',
    auth: true,
  });
  return normalizeScoutingReportRow(row);
}
