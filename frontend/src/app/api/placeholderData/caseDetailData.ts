import type { CaseDetailPayload, CaseManagementCaseRow } from '../types';
import { PLACEHOLDER_CASE_MANAGEMENT } from './caseManagementData';

export const PLACEHOLDER_CASE_DETAIL_CSE1024: CaseDetailPayload = {
  id: 'CSE-1024',
  farmerName: 'John Kamau Mwangi',
  farmerPhone: '+254 712 345 678',
  location: "Murang'a County",
  subCounty: 'Kangema',
  farm: 'Kangema Avocado Growers',
  block: 'Block A-12',
  blockCoordinates: { lat: -0.6833, lng: 37.0167 },
  severity: 'high',
  submissionChannel: 'smartphone',
  pestDisease: 'False Codling Moth',
  pestDiseaseKiswahili: 'Nondo wa Parachichi',
  dateSubmitted: 'Mar 14, 2026 14:32',
  scoutName: 'Jane Wambui',
  scoutPhone: '+254 723 456 789',
  affectedTrees: 45,
  symptoms: ['Fruit damage', 'Larvae in fruit', 'Premature fruit drop'],
  symptomCodes: ['FCM-01', 'FCM-03', 'FCM-05'],
  notes:
    'Heavy infestation of false codling moth observed. Larvae found inside developing fruit. Population density appears to be increasing. Recommend immediate pheromone trap deployment and intervention.',
  photos: [
    { id: 1, url: 'photo1.jpg', caption: 'Damaged fruit with larvae' },
    { id: 2, url: 'photo2.jpg', caption: 'Entry hole on avocado' },
    { id: 3, url: 'photo3.jpg', caption: 'Multiple affected fruits' },
  ],
  voiceNote: { duration: '2:34', url: 'voice-note.mp3' },
  timeline: [
    { stage: 'Report Received', timestamp: 'Mar 14, 2026 14:32', status: 'completed' },
    { stage: 'Auto-Triage', timestamp: 'Mar 14, 2026 14:33', status: 'completed' },
    { stage: 'Agronomist Review', timestamp: 'Mar 15, 2026 09:15', status: 'current' },
    { stage: 'Advisory Issued', timestamp: null, status: 'pending' },
  ],
};

function rowToCaseDetail(row: CaseManagementCaseRow): CaseDetailPayload {
  const submissionChannel = row.channel === 'ussd' ? 'ussd' : 'smartphone';
  return {
    id: row.id,
    farmerName: 'Registered grower',
    farmerPhone: '+254 —',
    location: row.location,
    subCounty: '—',
    farm: row.farm,
    block: row.block,
    blockCoordinates: { lat: -0.4, lng: 37.0 },
    severity: row.severity,
    submissionChannel,
    pestDisease: row.pestDisease,
    pestDiseaseKiswahili: row.pestDiseaseKiswahili,
    dateSubmitted: `${row.dateSubmitted} 12:00`,
    scoutName: row.scoutName,
    scoutPhone: '+254 —',
    affectedTrees: row.affectedTrees,
    symptoms: row.symptoms,
    symptomCodes: row.symptoms.map((_, i) => `SYM-${i + 1}`),
    notes: row.notes,
    photos: [],
    voiceNote: { duration: '0:00', url: '#' },
    timeline: [
      { stage: 'Report Received', timestamp: row.dateSubmitted, status: 'completed' },
      { stage: 'Auto-Triage', timestamp: row.dateSubmitted, status: 'completed' },
      { stage: 'Agronomist Review', timestamp: null, status: 'current' },
      { stage: 'Advisory Issued', timestamp: null, status: 'pending' },
    ],
  };
}

export function getPlaceholderCaseDetail(caseId: string | undefined): CaseDetailPayload {
  const id = caseId?.trim() || 'CSE-1024';
  if (id === 'CSE-1024') {
    return JSON.parse(JSON.stringify(PLACEHOLDER_CASE_DETAIL_CSE1024)) as CaseDetailPayload;
  }
  const row = PLACEHOLDER_CASE_MANAGEMENT.cases.find((c) => c.id === id);
  if (row) {
    return JSON.parse(JSON.stringify(rowToCaseDetail(row))) as CaseDetailPayload;
  }
  const fallback = JSON.parse(JSON.stringify(PLACEHOLDER_CASE_DETAIL_CSE1024)) as CaseDetailPayload;
  return { ...fallback, id };
}
