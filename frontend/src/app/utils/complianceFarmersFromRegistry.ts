import type { ComplianceFarmerRow, FarmerListRow } from '../api/types';

function scoutingHistoryFromLogs(logs: FarmerListRow['weeklyScoutingLogs']): [boolean, boolean, boolean, boolean] {
  const src = logs ?? [0, 0, 0, 0];
  return [src[0] === 1, src[1] === 1, src[2] === 1, src[3] === 1];
}

function riskLevelFromRow(row: FarmerListRow): 'high' | 'medium' | 'low' {
  const st = (row.lastScoutingResult?.status || '').toLowerCase();
  if (st.includes('high')) return 'high';
  if (st.includes('medium')) return 'medium';
  return 'low';
}

function reportStatusFromRow(row: FarmerListRow, scoutingHistory: [boolean, boolean, boolean, boolean]): ComplianceFarmerRow['reportStatus'] {
  if (row.exportEligibility === 'ready') return 'export-ready';
  if (row.exportEligibility === 'suspended') return 'incomplete';
  if (row.exportEligibility === 'at-risk') return 'pending-approval';
  const weeksDone = scoutingHistory.filter(Boolean).length;
  const risk = riskLevelFromRow(row);
  if (row.overdueScouts || weeksDone < 2) return 'incomplete';
  if (risk === 'high') return 'pending-approval';
  if (weeksDone >= 3) return 'pending-approval';
  return 'incomplete';
}

/** Map registry / mobile-synced farmer list row into Compliance Hub table shape. */
export function complianceRowFromFarmerList(row: FarmerListRow): ComplianceFarmerRow {
  const scoutingHistory = scoutingHistoryFromLogs(row.weeklyScoutingLogs);
  const m = row.mobileFarmFromApp;
  const farmName = (row.farmName || m?.farmName || row.owner || '').trim();
  const location = (row.location || m?.location || '').trim();

  return {
    id: row.id,
    farmerCode: row.farmerCode,
    name: row.name,
    farmName,
    location,
    county: row.county || '—',
    scoutingHistory,
    riskLevel: riskLevelFromRow(row),
    submissionMode: row.primaryChannel === 'smartphone' ? 'app' : 'ussd',
    reportStatus: reportStatusFromRow(row, scoutingHistory),
    lastUpdate: row.lastInspection?.trim() || '—',
    phoneNumber: row.phone || '—',
    mobileFarmFromApp: m ?? null,
  };
}

export function complianceRowsFromFarmerList(rows: FarmerListRow[]): ComplianceFarmerRow[] {
  return rows.map(complianceRowFromFarmerList);
}

/** Region filter keys match county names (e.g. `muranga` → Murang'a County). */
export function complianceCountyMatches(county: string, regionKey: string): boolean {
  if (!regionKey || regionKey === 'all') return true;
  const norm = county.toLowerCase().replace(/['\s]/g, '');
  const key = regionKey.toLowerCase().replace(/['\s]/g, '');
  return norm.includes(key) || key.includes(norm);
}

export function uniqueCountyOptions(rows: ComplianceFarmerRow[]): { value: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const r of rows) {
    const c = (r.county || '').trim();
    if (!c || c === '—') continue;
    const slug = c
      .toLowerCase()
      .replace(/['\s]/g, '')
      .replace(/county$/, '');
    if (!seen.has(slug)) seen.set(slug, c);
  }
  return [{ value: 'all', label: 'All regions' }, ...[...seen.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([value, label]) => ({ value, label }))];
}
