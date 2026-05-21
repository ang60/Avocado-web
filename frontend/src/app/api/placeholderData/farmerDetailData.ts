import type { FarmerDetailPayload, FarmerListRow } from '../types';
import { PLACEHOLDER_FARMERS } from './farmersListData';

const RICH_FRM_1024: FarmerDetailPayload = {
  id: 'FRM-1024',
  name: 'Peter Mwangi',
  farmName: 'Kangema Avocado Growers',
  location: 'Kangema',
  county: "Murang'a",
  ward: 'Kangema',
  subCounty: 'Kangema',
  phone: '+254 722 345 678',
  email: 'pmwangi@kangemaavocado.co.ke',
  primaryChannel: 'smartphone',
  registrationDate: 'Jan 15, 2024',
  totalAcres: 245,
  blocksManaged: 12,
  treesCount: 3240,
  exportEligibility: 'at-risk',
  lastScoutingResult: {
    status: 'high-risk',
    finding: 'False Codling Moth',
    date: 'Mar 14, 2026',
    scoutName: 'Jane Wambui',
  },
  weeklyScoutingLogs: [
    { week: 'Week 1 (Mar 1-7)', completed: true, date: 'Mar 5, 2026', scout: 'Jane Wambui' },
    { week: 'Week 2 (Mar 8-14)', completed: true, date: 'Mar 12, 2026', scout: 'Jane Wambui' },
    { week: 'Week 3 (Feb 22-28)', completed: true, date: 'Feb 26, 2026', scout: 'Jane Wambui' },
    { week: 'Week 4 (Feb 15-21)', completed: true, date: 'Feb 19, 2026', scout: 'Samuel Omondi' },
  ],
  complianceScore: 100,
  activeCases: [
    { id: 'CSE-1024', issue: 'False Codling Moth', severity: 'high', status: 'new', date: 'Mar 14, 2026' },
    { id: 'CSE-1018', issue: 'Avocado Thrips', severity: 'medium', status: 'under-review', date: 'Mar 10, 2026' },
  ],
  recentActivities: [
    {
      type: 'scouting',
      description: 'Weekly scouting completed - High risk detected',
      date: 'Mar 14, 2026 14:32',
      user: 'Jane Wambui',
    },
    {
      type: 'advisory',
      description: 'IPM advisory issued for False Codling Moth',
      date: 'Mar 14, 2026 16:45',
      user: 'Dr. James Kariuki',
    },
    {
      type: 'scouting',
      description: 'Weekly scouting completed - No issues',
      date: 'Mar 12, 2026 11:20',
      user: 'Jane Wambui',
    },
    {
      type: 'sms',
      description: 'SMS reminder sent: Complete weekly scouting',
      date: 'Mar 8, 2026 08:00',
      user: 'System',
    },
  ],
  blocks: [
    { id: 'A-12', name: 'Block A-12', acres: 25, trees: 340, status: 'at-risk', lastInspection: 'Mar 14, 2026' },
    { id: 'B-08', name: 'Block B-08', acres: 18, trees: 245, status: 'healthy', lastInspection: 'Mar 12, 2026' },
    { id: 'C-05', name: 'Block C-05', acres: 22, trees: 298, status: 'healthy', lastInspection: 'Mar 12, 2026' },
    { id: 'D-03', name: 'Block D-03', acres: 15, trees: 203, status: 'healthy', lastInspection: 'Mar 10, 2026' },
  ],
};

const WEEK_LABELS = [
  'Week 1 (recent)',
  'Week 2',
  'Week 3',
  'Week 4',
];

function fromListRow(row: FarmerListRow): FarmerDetailPayload {
  const logs = row.weeklyScoutingLogs.map((done, i) => ({
    week: WEEK_LABELS[i] ?? `Week ${i + 1}`,
    completed: done === 1,
    date: row.lastInspection,
    scout: '—',
  }));
  return {
    id: row.id,
    name: row.name,
    farmName: row.owner,
    location: row.location,
    county: row.county,
    ward: row.ward,
    subCounty: row.ward,
    phone: row.phone,
    email: `${row.id.toLowerCase()}@farm.placeholder.ke`,
    primaryChannel: row.primaryChannel,
    registrationDate: '—',
    totalAcres: row.totalAcres,
    blocksManaged: 4,
    treesCount: Math.max(100, Math.round(row.totalAcres * 12)),
    exportEligibility: row.exportEligibility,
    lastScoutingResult: {
      status: row.lastScoutingResult.status,
      finding: row.lastScoutingResult.finding,
      date: row.lastInspection,
      scout: '—',
    },
    weeklyScoutingLogs: logs,
    complianceScore: row.overdueScouts ? 72 : 88,
    activeCases: [],
    recentActivities: [],
    blocks: [
      {
        id: '1',
        name: 'Main block',
        acres: row.totalAcres,
        trees: Math.round(row.totalAcres * 12),
        status: row.lastScoutingResult.status.includes('high') ? 'at-risk' : 'healthy',
        lastInspection: row.lastInspection,
      },
    ],
  };
}

export function getPlaceholderFarmerDetail(farmerId: string | undefined): FarmerDetailPayload {
  const id = farmerId?.trim() || 'FRM-1024';
  if (id === 'FRM-1024') {
    return JSON.parse(JSON.stringify(RICH_FRM_1024)) as FarmerDetailPayload;
  }
  const row = PLACEHOLDER_FARMERS.find((f) => f.id === id);
  if (row) {
    return JSON.parse(JSON.stringify(fromListRow(row))) as FarmerDetailPayload;
  }
  return { ...JSON.parse(JSON.stringify(RICH_FRM_1024)) as FarmerDetailPayload, id };
}
