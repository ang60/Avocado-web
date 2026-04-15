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
      status: 'new',
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

  return {
    id: c.id,
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
    timeline: [
      { stage: 'Submitted', timestamp: c.created_at ?? null, status: 'completed' },
      { stage: 'Under review', timestamp: null, status: 'pending' },
      { stage: 'Advisory issued', timestamp: null, status: 'pending' },
    ],
  };
}

export async function fetchScoutingFeed(): Promise<ScoutingFeedItem[]> {
  const data = await apiRequest<PaginatedResults<ScoutingFeedItem> | ScoutingFeedItem[]>(
    '/api/pest-scouting/scouting-reports/?page_size=500',
  );
  return parseDrfList<ScoutingFeedItem>(data);
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
};

export async function fetchKephisQuarantineBlocks(): Promise<QuarantineBlockRow[]> {
  const data = await apiRequest<PaginatedResults<QuarantineBlockRow> | QuarantineBlockRow[]>(
    '/api/kephis-quarantine/management/?page_size=1000',
  );
  return parseDrfList<QuarantineBlockRow>(data);
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
  const payload: Record<string, unknown> = {
    case_title: body.case_title,
    severity: body.severity,
    pest_scouting_record: body.weekly_record,
  };
  if (body.notes && body.notes.trim()) payload.notes = body.notes.trim();
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

export async function fetchMyFarmBlocks(): Promise<FarmBlockDto[]> {
  const data = await apiRequest<PaginatedResults<FarmBlockDto> | FarmBlockDto[]>(
    '/api/pest-scouting/farm-blocks/?page_size=1000',
  );
  return parseDrfList<FarmBlockDto>(data);
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

