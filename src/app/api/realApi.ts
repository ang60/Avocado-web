import type {
  CaseDetailPayload,
  CaseManagementCaseRow,
  CaseManagementPayload,
  DashboardPayload,
  FarmerDetailPayload,
  FarmerListRow,
  ScoutingFeedItem,
} from './types';
import { API_BASE_URL, apiRequest, parseDrfList, type PaginatedResults } from './client';

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

export async function updateFarmerComplianceStatus(params: {
  farmerId: string;
  agronomist_compliance_status: 'compliant' | 'needs-follow-up';
}): Promise<FarmerListRow> {
  return apiRequest<FarmerListRow>(`/api/farmers/${params.farmerId}/compliance_status/`, {
    method: 'PATCH',
    body: JSON.stringify({
      agronomist_compliance_status: params.agronomist_compliance_status,
    }),
  });
}

export async function fetchFarmerDetail(farmerId: string | undefined): Promise<FarmerDetailPayload> {
  const id = String(farmerId ?? '').trim();
  return apiRequest<FarmerDetailPayload>(`/api/farmers/${id}/`);
}

type BackendUser = {
  id: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
};

type BackendWeeklyRecord = {
  id: string;
  farmer?: BackendUser;
  block?: { id: string; block_name: string } | string;
  location?: string;
  number_of_trees_affected?: number;
  pests_observed?: string | null;
  disease?: string | null;
  voice_note?: string | null;
  timestamp?: string;
};

type BackendCase = {
  id: string;
  case_title: string;
  severity: 'high' | 'medium' | 'low' | 'unknown';
  notes: string;
  status?: string;
  diagnosis?: string | null;
  recommended_actions?: string[];
  closed_at?: string | null;
  assigned_agronomist?: BackendUser | null;
  pest_scouting_record?: BackendWeeklyRecord | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchCaseManagement(): Promise<CaseManagementPayload> {
  const data = await apiRequest<PaginatedResults<BackendCase> | BackendCase[]>(
    '/api/case-management/cases/?page_size=1000',
  );
  const rows = parseDrfList<BackendCase>(data);

  const cases: CaseManagementCaseRow[] = rows.map((c) => {
    const rec = c.pest_scouting_record ?? null;
    const farmerName =
      rec?.farmer?.first_name || rec?.farmer?.last_name
        ? `${rec?.farmer?.first_name ?? ''} ${rec?.farmer?.last_name ?? ''}`.trim()
        : (rec?.farmer?.phone_number ?? '—');
    const location = rec?.location ?? '—';
    const finding = (rec?.pests_observed || rec?.disease || c.case_title || '—').trim?.() ?? '—';
    const affectedTrees = typeof rec?.number_of_trees_affected === 'number' ? rec.number_of_trees_affected : 0;
    const blockLabel =
      typeof rec?.block === 'object' && rec?.block
        ? rec.block.block_name
        : typeof rec?.block === 'string'
          ? rec.block
          : '—';

    return {
      id: c.id,
      severity: c.severity,
      farm: farmerName,
      block: blockLabel || '—',
      pestDisease: finding,
      pestDiseaseKiswahili: '—',
      dateSubmitted: (c.created_at || '').slice(0, 10) || '—',
      status:
        c.status === 'under_review' || c.status === 'verified' || c.status === 'closed'
          ? c.status
          : 'new',
      scoutName: (c.assigned_agronomist?.phone_number ?? '—') as string,
      location,
      affectedTrees,
      symptoms: [],
      notes: c.notes || '',
      channel: 'smartphone',
    };
  });

  const total = cases.length;
  const high = cases.filter((c) => c.severity === 'high').length;
  const medium = cases.filter((c) => c.severity === 'medium').length;
  const low = cases.filter((c) => c.severity === 'low').length;

  return {
    kpis: [
      { title: 'Total Cases', value: String(total), icon: 'folder', iconColor: '#1B4332', iconBg: '#74C69D20' },
      { title: 'High Severity', value: String(high), icon: 'alert', iconColor: '#C0392B', iconBg: '#FEE2E2' },
      { title: 'Medium Severity', value: String(medium), icon: 'users', iconColor: '#F39C12', iconBg: '#FEF3C7' },
      { title: 'Low Severity', value: String(low), icon: 'check', iconColor: '#2D6A4F', iconBg: '#D1FAE5' },
    ],
    cases,
  };
}

export async function fetchCaseDetail(caseId: string | undefined): Promise<CaseDetailPayload> {
  const id = String(caseId ?? '').trim();
  const c = await apiRequest<BackendCase>(`/api/case-management/cases/${id}/`);
  return mapBackendCaseToCaseDetail(c);
}

function mapBackendCaseToCaseDetail(c: BackendCase): CaseDetailPayload {
  const rec = c.pest_scouting_record ?? null;

  const farmerName =
    rec?.farmer?.first_name || rec?.farmer?.last_name
      ? `${rec?.farmer?.first_name ?? ''} ${rec?.farmer?.last_name ?? ''}`.trim()
      : (rec?.farmer?.phone_number ?? 'Farmer');

  const farmerPhone = rec?.farmer?.phone_number ?? '—';
  const location = rec?.location ?? '—';
  const finding = (rec?.pests_observed || rec?.disease || c.case_title || '—').trim?.() ?? '—';
  const blockLabel =
    typeof rec?.block === 'object' && rec?.block
      ? rec.block.block_name
      : typeof rec?.block === 'string'
        ? rec.block
        : '—';

  const caseStatus = String(c.status ?? 'new').trim().toLowerCase();
  const submittedTimestamp = c.created_at ?? null;
  const underReviewTimestamp =
    caseStatus === 'under_review' || caseStatus === 'verified' || caseStatus === 'closed'
      ? (c.updated_at ?? c.created_at ?? null)
      : null;
  const advisoryIssuedTimestamp =
    caseStatus === 'verified' || caseStatus === 'closed'
      ? (c.closed_at ?? c.updated_at ?? c.created_at ?? null)
      : null;

  const timeline = [
    { stage: 'Submitted', timestamp: submittedTimestamp, status: 'completed' as const },
    {
      stage: 'Under review',
      timestamp: underReviewTimestamp,
      status:
        caseStatus === 'under_review'
          ? ('current' as const)
          : caseStatus === 'verified' || caseStatus === 'closed'
            ? ('completed' as const)
            : ('pending' as const),
    },
    {
      stage: 'Advisory issued',
      timestamp: advisoryIssuedTimestamp,
      status:
        caseStatus === 'verified'
          ? ('current' as const)
          : caseStatus === 'closed'
            ? ('completed' as const)
            : ('pending' as const),
    },
  ];

  return {
    id: c.id,
    caseStatus: caseStatus,
    farmerName,
    farmerPhone,
    location,
    subCounty: '—',
    farm: farmerName,
    block: blockLabel || '—',
    blockCoordinates: { lat: 0, lng: 0 },
    severity: c.severity,
    submissionChannel: 'smartphone',
    pestDisease: finding,
    pestDiseaseKiswahili: '—',
    dateSubmitted: (c.created_at || '').slice(0, 10) || '—',
    scoutName:
      c.assigned_agronomist?.first_name || c.assigned_agronomist?.last_name
        ? `${c.assigned_agronomist?.first_name ?? ''} ${c.assigned_agronomist?.last_name ?? ''}`.trim()
        : (c.assigned_agronomist?.phone_number ?? '—'),
    scoutPhone: c.assigned_agronomist?.phone_number ?? '—',
    affectedTrees: typeof rec?.number_of_trees_affected === 'number' ? rec.number_of_trees_affected : 0,
    symptoms: [],
    symptomCodes: [],
    notes: c.notes || '',
    photos: [],
    voiceNote: {
      duration: '—',
      url: (rec?.voice_note as string) || '',
    },
    timeline,
  };
}

export function mapVerifiedCaseResponseToDetail(c: BackendCase): CaseDetailPayload {
  return mapBackendCaseToCaseDetail(c);
}

type FarmerCaseForDashboard = {
  id: string;
  case_title: string;
  status: string;
  diagnosis?: string | null;
  recommended_actions?: string[];
  created_at?: string;
  closed_at?: string | null;
  pest_scouting_record?: {
    block?: { id: string; block_name: string } | string | null;
    location?: string;
    disease?: string | null;
    pests_observed?: string | null;
  } | null;
};

/** Farmer dashboard advisory history (scoped by backend to the logged-in farmer). */
export async function fetchFarmerCaseAdvisories(): Promise<FarmerCaseForDashboard[]> {
  const data = await apiRequest<PaginatedResults<FarmerCaseForDashboard> | FarmerCaseForDashboard[]>(
    '/api/case-management/cases/?page_size=1000',
  );
  return parseDrfList<FarmerCaseForDashboard>(data);
}

export async function fetchScoutingFeed(): Promise<ScoutingFeedItem[]> {
  const data = await apiRequest<PaginatedResults<ScoutingFeedItem> | ScoutingFeedItem[]>(
    '/api/pest-scouting/scouting-reports/?page_size=500',
  );
  return parseDrfList<ScoutingFeedItem>(data);
}

export async function fetchAgronomistAnalytics(): Promise<{
  county_pressure: Array<{ county: string; detections: number; reports: number; avg_pests_per_trap: number }>;
  protocol_performance: Array<{ action: string; outcome: string; count: number }>;
}> {
  return apiRequest('/api/pest-scouting/scouting-reports/agronomist_analytics/');
}

export async function fetchScoutingAuditLog(): Promise<
  Array<{ id: string; scout: string; block: string; county: string; timestamp: string; flags: string[]; status: string }>
> {
  return apiRequest('/api/pest-scouting/scouting-reports/audit_log/');
}

export type ScoutingBlockOverviewRow = {
  farmer_id: string;
  farmer_name: string;
  county: string;
  block_id: string;
  block_name: string;
  last_scouted_at: string;
  latest_finding: string;
  status: 'detected' | 'clean';
  severity: 'high' | 'medium' | 'low' | string;
  pests: string[];
  diseases: string[];
  actions_taken: string[];
  outcomes: string[];
  history_count: number;
};

export async function fetchScoutingBlockOverview(): Promise<ScoutingBlockOverviewRow[]> {
  const data = await apiRequest<PaginatedResults<ScoutingBlockOverviewRow> | ScoutingBlockOverviewRow[]>(
    '/api/pest-scouting/scouting-reports/block_overview/'
  );
  return parseDrfList<ScoutingBlockOverviewRow>(data);
}

export async function confirmScoutingIdentification(params: {
  reportId: string;
  identified_label: string;
  management_protocol?: string;
  review_status?: 'confirmed' | 'needs_follow_up' | 'pending';
  training_tagged?: boolean;
  review_notes?: string;
  pushed_to_farmer?: boolean;
}): Promise<{ status: string; message: string; linked_case_id?: string | null }> {
  return apiRequest(`/api/pest-scouting/scouting-reports/${params.reportId}/confirm_identification/`, {
    method: 'POST',
    body: JSON.stringify({
      identified_label: params.identified_label,
      management_protocol: params.management_protocol,
      review_status: params.review_status ?? 'confirmed',
      training_tagged: params.training_tagged ?? true,
      review_notes: params.review_notes ?? '',
      pushed_to_farmer: params.pushed_to_farmer ?? true,
    }),
  });
}

export type QuarantineBlockRow = {
  id: string;
  blockId: string;
  farmName: string;
  county: string;
  pestType: string;
  captureRate: number;
  lastInspection: string;
  kephisStatus: 'cleared' | 'gated' | 'pending';
  inspector: string;
  selected: boolean;
  evidenceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type QuarantineActionLogRow = {
  id: string;
  quarantineId: string;
  blockId: string;
  actionType: 'issue_restriction' | 'request_lift' | 'recommend_lift' | 'approve_lift' | 'manual_update';
  fromStatus: string;
  toStatus: string;
  actorName: string;
  notes?: string;
  createdAt: string;
};

export type KephisAlertRow = {
  id: string;
  blockId: string;
  farmName: string;
  county: string;
  pestType: string;
  captureRate: number;
  threshold: number;
  kephisStatus: 'cleared' | 'gated' | 'pending';
  severity: 'critical' | 'warning';
  lastInspection: string;
  inspector: string;
};

function mapQuarantineRow(row: Record<string, unknown>): QuarantineBlockRow {
  const captureRateNum = Number(row.captureRate ?? 0);
  return {
    id: String(row.id ?? ''),
    blockId: String(row.blockId ?? ''),
    farmName: String(row.farmName ?? ''),
    county: String(row.county ?? ''),
    pestType: String(row.pestType ?? ''),
    captureRate: Number.isFinite(captureRateNum) ? captureRateNum : 0,
    lastInspection: String(row.lastInspection ?? ''),
    kephisStatus:
      row.kephisStatus === 'cleared' || row.kephisStatus === 'gated' || row.kephisStatus === 'pending'
        ? row.kephisStatus
        : 'pending',
    inspector: String(row.inspector ?? ''),
    selected: Boolean(row.selected),
    evidenceUrl: row.evidence_url ? String(row.evidence_url) : undefined,
    createdAt: row.created_at ? String(row.created_at) : undefined,
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function fetchKephisQuarantineBlocks(): Promise<QuarantineBlockRow[]> {
  const data = await apiRequest<PaginatedResults<Record<string, unknown>> | Record<string, unknown>[]>(
    '/api/kephis-quarantine/management/?page_size=1000',
  );
  const rows = parseDrfList<Record<string, unknown>>(data);
  return rows.map((row) => mapQuarantineRow(row));
}

export async function updateKephisQuarantineBlock(
  id: string,
  body: Partial<{
    kephisStatus: 'cleared' | 'gated' | 'pending';
    pestType: string;
    captureRate: number;
    evidence_url: string;
    inspector: string;
  }>
): Promise<QuarantineBlockRow> {
  const row = await apiRequest<Record<string, unknown>>(`/api/kephis-quarantine/management/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  return mapQuarantineRow(row);
}

export async function issueKephisRestriction(id: string, notes?: string): Promise<QuarantineBlockRow> {
  const row = await apiRequest<Record<string, unknown>>(`/api/kephis-quarantine/management/${id}/issue_restriction/`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes ?? '' }),
  });
  return mapQuarantineRow(row);
}

export async function requestKephisLift(id: string, notes?: string): Promise<QuarantineBlockRow> {
  const row = await apiRequest<Record<string, unknown>>(`/api/kephis-quarantine/management/${id}/request_lift/`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes ?? '' }),
  });
  return mapQuarantineRow(row);
}

export async function recommendKephisLift(id: string, notes?: string): Promise<QuarantineBlockRow> {
  const row = await apiRequest<Record<string, unknown>>(`/api/kephis-quarantine/management/${id}/recommend_lift/`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes ?? '' }),
  });
  return mapQuarantineRow(row);
}

export async function approveKephisLift(id: string, notes?: string): Promise<QuarantineBlockRow> {
  const row = await apiRequest<Record<string, unknown>>(`/api/kephis-quarantine/management/${id}/approve_lift/`, {
    method: 'POST',
    body: JSON.stringify({ notes: notes ?? '' }),
  });
  return mapQuarantineRow(row);
}

export async function fetchKephisChainOfCustody(blockId?: string): Promise<QuarantineActionLogRow[]> {
  const query = blockId ? `?blockId=${encodeURIComponent(blockId)}` : '';
  const data = await apiRequest<{ results: Record<string, unknown>[] }>(
    `/api/kephis-quarantine/management/chain_of_custody/${query}`
  );
  const rows = Array.isArray(data.results) ? data.results : [];
  return rows.map((row) => ({
    id: String(row.id ?? ''),
    quarantineId: String(row.quarantine ?? ''),
    blockId: String(row.blockId ?? ''),
    actionType:
      row.action_type === 'issue_restriction' ||
      row.action_type === 'request_lift' ||
      row.action_type === 'recommend_lift' ||
      row.action_type === 'approve_lift'
        ? row.action_type
        : 'manual_update',
    fromStatus: String(row.from_status ?? ''),
    toStatus: String(row.to_status ?? ''),
    actorName: String(row.actor_name ?? 'Unknown'),
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at ?? ''),
  }));
}

export async function fetchKephisAlerts(): Promise<KephisAlertRow[]> {
  const data = await apiRequest<{ results: Record<string, unknown>[] }>(
    '/api/kephis-quarantine/management/alerts/'
  );
  const rows = Array.isArray(data.results) ? data.results : [];
  return rows.map((row) => {
    const captureRateNum = Number(row.captureRate ?? 0);
    const thresholdNum = Number(row.threshold ?? 0);
    return {
      id: String(row.id ?? ''),
      blockId: String(row.blockId ?? ''),
      farmName: String(row.farmName ?? ''),
      county: String(row.county ?? ''),
      pestType: String(row.pestType ?? ''),
      captureRate: Number.isFinite(captureRateNum) ? captureRateNum : 0,
      threshold: Number.isFinite(thresholdNum) ? thresholdNum : 0,
      kephisStatus:
        row.kephisStatus === 'cleared' || row.kephisStatus === 'gated' || row.kephisStatus === 'pending'
          ? row.kephisStatus
          : 'pending',
      severity: row.severity === 'critical' ? 'critical' : 'warning',
      lastInspection: String(row.lastInspection ?? ''),
      inspector: String(row.inspector ?? ''),
    };
  });
}

export type CreateCaseFromScoutingPayload = {
  weekly_record: string;
  case_title: string;
  severity: 'high' | 'medium' | 'low' | 'unknown';
  notes?: string;
};

export async function createCaseFromScouting(
  body: CreateCaseFromScoutingPayload
): Promise<CaseManagementCaseRow> {
  const normalizedNotes = String(body.notes ?? '').trim();
  const payload: Record<string, unknown> = {
    case_title: body.case_title,
    severity: body.severity,
    pest_scouting_record: body.weekly_record,
    // Backend requires notes; always provide a non-empty value.
    notes: normalizedNotes || 'Created from agronomist triage review.',
  };
  const created = await apiRequest<BackendCase>('/api/case-management/cases/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  // Return a row compatible with the Case Management table
  return {
    id: created.id,
    severity: created.severity,
    farm: '—',
    block: '—',
    pestDisease: created.case_title,
    pestDiseaseKiswahili: '—',
    dateSubmitted: (created.created_at || '').slice(0, 10) || '—',
    status: 'new',
    scoutName: '—',
    location: '—',
    affectedTrees: 0,
    symptoms: [],
    notes: created.notes || '',
    channel: 'smartphone',
  };
}

export type ReinspectionResponse = {
  status: 'reinspection_requested';
  message: string;
  case_id: string;
};

export async function requestReinspectionFromScouting(params: {
  reportId: string;
  case_title?: string;
  severity?: 'high' | 'medium' | 'low' | 'unknown';
  notes?: string;
}): Promise<ReinspectionResponse> {
  return apiRequest<ReinspectionResponse>(
    `/api/pest-scouting/scouting-reports/${params.reportId}/request_reinspection/`,
    {
      method: 'POST',
      body: JSON.stringify({
        case_title: params.case_title,
        severity: params.severity ?? 'medium',
        notes: params.notes,
      }),
    },
  );
}

export type FarmBlockDto = {
  id: string;
  block_name: string;
  number_of_trees: number;
  boundary_points?: Array<{ lat: number; lng: number }>;
  timestamp?: string;
};

export type ScoutingSessionDto = {
  id: string;
  session_name?: string;
  notes?: string | null;
  status: 'draft' | 'in_progress' | 'completed' | string;
  started_at?: string;
  completed_at?: string | null;
  updated_at?: string;
  record_count?: number;
};

export type CreateScoutingSessionPayload = {
  session_name?: string;
  notes?: string;
  status?: 'draft' | 'in_progress' | 'completed';
  block_ids?: string[];
};

export type CreateWeeklyRecordPayload = {
  scouting_session?: string;
  block: string;
  variety: string;
  type_of_trap: string;
  number_of_trap: number;
  traps_replaced: number;
  any_pests_observed: 'Yes' | 'No';
  pests_observed?: string | null;
  beneficial_insects_observed?: string | null;
  number_of_trees_affected: number;
  pest_plant_part_affected?: string | null;
  pest_crop_stage?: string | null;
  pest_detection_method?: string | null;
  pests_per_trap: number;
  any_diseases_observed: 'Yes' | 'No';
  disease?: string | null;
  disease_plant_part?: string | null;
  disease_crop_stage?: string | null;
  disease_detection_method?: string | null;
  number_of_photos_taken?: number;
  additional_notes?: string | null;
  actions_taken: string;
  outcome: string;
  remarks?: string | null;
  start_date: string;
  end_date: string;
  location: string;
  gps_latitude?: number | null;
  gps_longitude?: number | null;
};

export type KnowledgeEntryDto = {
  id: string;
  category_name?: string;
  title: string;
  content: string;
  severity?: string;
  tags?: string[];
  views?: number;
  active_use_cases?: string;
  approved_content?: boolean;
  chemical_gate?: string;
  regional_alerts?: Array<{
    county: string;
    alert: string;
    active?: boolean;
    created_by?: string;
    created_at?: string;
  }>;
  created_at?: string;
  last_updated?: string;
};

export type HcdaFarmerDto = {
  id: string;
  farmerName: string;
  hcdaRegNumber: string;
  ward: string;
  county: string;
  acreage: number;
  globalGAPStatus: string;
  globalGAPExpiry: string;
  primaryExporter: string;
  lat: number;
  lng: number;
};

export type HcdaStatisticsDto = {
  total_registered_active_hcda_farmers: number;
  globalgap_compliant: { total_number: number; percentage: number };
  expired_non_compliant: number;
  total_acreage: number;
};

export type KephisRiskExporterDto = {
  id: string;
  exporterName: string;
  farmerCount: number;
  restrictedBlocks: number;
  riskScore: number;
  county: string;
};

export type KephisInfectionClusterDto = {
  county: string;
  intensity: 'low' | 'medium' | 'high';
  farmerCount: number;
  pestCount: number;
};

export type KephisRiskSummaryDto = {
  total_pest_detections: number;
  active_quarantine_zones: number;
  affected_farmers: number;
  compliance_rate: number;
};

export type KephisRiskIntelligenceDto = {
  exporterCompliance: KephisRiskExporterDto[];
  infectionClusters: KephisInfectionClusterDto[];
  summary: KephisRiskSummaryDto;
};

export type KephisThresholdsDto = {
  fruit_fly_limit: number;
  fcm_limit: number;
  thrips_limit: number;
  updated_at?: string;
};

export async function fetchMyFarmBlocks(): Promise<FarmBlockDto[]> {
  const data = await apiRequest<PaginatedResults<FarmBlockDto> | FarmBlockDto[]>(
    '/api/pest-scouting/farm-blocks/?page_size=1000',
  );
  return parseDrfList<FarmBlockDto>(data);
}

export async function createScoutingSession(
  body: CreateScoutingSessionPayload
): Promise<ScoutingSessionDto> {
  return apiRequest<ScoutingSessionDto>('/api/pest-scouting/scouting-sessions/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function completeScoutingSession(sessionId: string): Promise<ScoutingSessionDto> {
  return apiRequest<ScoutingSessionDto>(`/api/pest-scouting/scouting-sessions/${sessionId}/complete/`, {
    method: 'POST',
  });
}

export async function createWeeklyRecord(body: CreateWeeklyRecordPayload) {
  return apiRequest('/api/pest-scouting/weekly-records/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createFarmBlock(body: {
  block_name: string;
  number_of_trees: number;
  boundary_points?: Array<{ lat: number; lng: number }>;
}): Promise<FarmBlockDto> {
  return apiRequest<FarmBlockDto>('/api/pest-scouting/farm-blocks/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateFarmBlock(
  blockId: string,
  body: Partial<{
    block_name: string;
    number_of_trees: number;
    boundary_points: Array<{ lat: number; lng: number }>;
  }>
): Promise<FarmBlockDto> {
  return apiRequest<FarmBlockDto>(`/api/pest-scouting/farm-blocks/${blockId}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function fetchKnowledgeEntries(search = ''): Promise<KnowledgeEntryDto[]> {
  const query = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
  const data = await apiRequest<PaginatedResults<KnowledgeEntryDto> | KnowledgeEntryDto[]>(
    `/api/knowledge-base/entries/?page_size=200${query}`,
  );
  return parseDrfList<KnowledgeEntryDto>(data);
}

export async function fetchKnowledgeEntryById(id: string): Promise<KnowledgeEntryDto> {
  return apiRequest<KnowledgeEntryDto>(`/api/knowledge-base/entries/${id}/`);
}

export async function fetchContextualKnowledgeLinks(params: {
  finding: string;
  county?: string;
}): Promise<KnowledgeEntryDto[]> {
  const query = new URLSearchParams();
  query.set('finding', params.finding);
  if (params.county) query.set('county', params.county);
  const data = await apiRequest<{ results: KnowledgeEntryDto[] }>(
    `/api/knowledge-base/entries/contextual-links/?${query.toString()}`
  );
  return data.results || [];
}

export async function addKnowledgeRegionalAlert(params: {
  entryId: string;
  county: string;
  alert: string;
  active?: boolean;
}): Promise<KnowledgeEntryDto> {
  return apiRequest<KnowledgeEntryDto>(`/api/knowledge-base/entries/${params.entryId}/add_regional_alert/`, {
    method: 'POST',
    body: JSON.stringify({
      county: params.county,
      alert: params.alert,
      active: params.active ?? true,
    }),
  });
}

export async function fetchHcdaFarmers(): Promise<HcdaFarmerDto[]> {
  const data = await apiRequest<PaginatedResults<HcdaFarmerDto> | HcdaFarmerDto[]>(
    '/api/hcda-registry/farmers/?page_size=1000',
  );
  return parseDrfList<HcdaFarmerDto>(data);
}

export async function fetchHcdaStatistics(): Promise<HcdaStatisticsDto> {
  return apiRequest<HcdaStatisticsDto>('/api/hcda-registry/farmers/statistics/');
}

/** Opens printable PDF export generated by backend. */
export function openHcdaPdfExport() {
  if (typeof window === 'undefined') return;
  window.open(`${API_BASE_URL}/api/hcda-registry/farmers/export/?format=pdf`, '_blank', 'noopener,noreferrer');
}

/** Opens excel export generated by backend. */
export function openHcdaExcelExport() {
  if (typeof window === 'undefined') return;
  window.open(
    `${API_BASE_URL}/api/hcda-registry/farmers/export/?format=excel`,
    '_blank',
    'noopener,noreferrer'
  );
}

export async function fetchKephisRiskIntelligence(): Promise<KephisRiskIntelligenceDto> {
  return apiRequest<KephisRiskIntelligenceDto>('/api/kephis-quarantine/management/risk_intelligence/');
}

export async function fetchKephisThresholds(): Promise<KephisThresholdsDto> {
  return apiRequest<KephisThresholdsDto>('/api/kephis-quarantine/management/thresholds/');
}

export async function updateKephisThresholds(
  body: Partial<Pick<KephisThresholdsDto, 'fruit_fly_limit' | 'fcm_limit' | 'thrips_limit'>>
): Promise<KephisThresholdsDto> {
  return apiRequest<KephisThresholdsDto>('/api/kephis-quarantine/management/thresholds/', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function openKephisExportCsv() {
  if (typeof window === 'undefined') return;
  window.open(
    `${API_BASE_URL}/api/kephis-quarantine/management/export_excel/`,
    '_blank',
    'noopener,noreferrer'
  );
}

export async function verifyAndCloseCase(params: {
  caseId: string;
  diagnosis: string;
  recommended_actions: string[];
}): Promise<{ status: string; case: BackendCase }> {
  return apiRequest<{ status: string; case: BackendCase }>(
    `/api/case-management/cases/${params.caseId}/verify_and_close/`,
    {
      method: 'POST',
      body: JSON.stringify({
        diagnosis: params.diagnosis,
        recommended_actions: params.recommended_actions,
      }),
    },
  );
}

