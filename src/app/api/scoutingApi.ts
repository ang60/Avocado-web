import { apiRequest } from './client';

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
  reviewed: string;
  county: string | null;
  assignedTo: string | null;
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
