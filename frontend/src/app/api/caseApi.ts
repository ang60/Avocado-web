import { apiRequest } from './client';

export type CreateCaseParams = {
  case_title: string;
  severity: 'low' | 'medium' | 'high';
  scouting_record_id: string;
  notes: string;
  agronomist_id: string;
};

export async function createCase(params: CreateCaseParams): Promise<any> {
  return apiRequest('/api/case-management/cases/', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(params),
  });
}
