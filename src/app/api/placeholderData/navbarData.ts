import type { NavbarNotification, NavbarUser, SearchResultItem } from '../types';
import { PLACEHOLDER_DASHBOARD } from './dashboardPayload';
import { PLACEHOLDER_SCOUTING_FEED } from './scoutingFeedData';

export const PLACEHOLDER_NAVBAR_USER: NavbarUser = {
  name: 'Alice Omondi',
  initials: 'AO',
  role: 'Agronomist',
};

export const PLACEHOLDER_NOTIFICATIONS: NavbarNotification[] = [
  {
    id: 'n1',
    title: 'New high-priority case',
    subtitle: 'CSE-1024 — Avocado Thrips in Murang\'a',
    time: '12 min ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Scouting submission pending review',
    subtitle: 'SF-2145 — Wanjiru Farm',
    time: '1 hr ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Weekly compliance target met',
    subtitle: '95% scouting compliance this week',
    time: '3 hrs ago',
    unread: false,
  },
  {
    id: 'n4',
    title: 'USSD report batch',
    subtitle: '7 new USSD submissions today',
    time: 'Yesterday',
    unread: false,
  },
];

function buildSearchIndex(): SearchResultItem[] {
  const items: SearchResultItem[] = [];
  for (const t of PLACEHOLDER_DASHBOARD.triageQueue) {
    items.push({
      id: t.id,
      label: `${t.id} — ${t.farm}`,
      sublabel: `${t.pest} · ${t.location}`,
      path: `/case-management/${t.id}`,
      type: 'case',
    });
  }
  for (const r of PLACEHOLDER_DASHBOARD.recentScoutingRecords) {
    items.push({
      id: r.id,
      label: `${r.id} — ${r.farm}`,
      sublabel: `Scout: ${r.scout}`,
      path: '/scouting-reports',
      type: 'scout',
    });
  }
  const seen = new Set<string>();
  for (const s of PLACEHOLDER_SCOUTING_FEED) {
    const key = s.farmName + s.farmerName;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      id: s.id,
      label: s.farmName,
      sublabel: `${s.farmerName} · ${s.county}`,
      path: '/scouting-reports',
      type: 'farm',
    });
  }
  items.push(
    {
      id: 'scout-jane',
      label: 'Jane Wambui',
      sublabel: 'Scout · Murang\'a',
      path: '/farmers',
      type: 'scout',
    },
    {
      id: 'scout-grace',
      label: 'Grace Achieng',
      sublabel: 'Scout · Kiambu',
      path: '/farmers',
      type: 'scout',
    },
    {
      id: 'nav-kephis',
      label: 'KEPHIS Quarantine',
      sublabel: 'National plant health surveillance',
      path: '/kephis-quarantine',
      type: 'page',
    },
    {
      id: 'nav-hcda',
      label: 'HCDA Traceability Registry',
      sublabel: 'Verified farmers & GlobalGAP',
      path: '/hcda-registry',
      type: 'page',
    },
    {
      id: 'nav-exporter',
      label: 'Exporter Consignment Hub',
      sublabel: 'Batches, PHI & export readiness',
      path: '/exporter',
      type: 'page',
    }
  );
  return items;
}

export const PLACEHOLDER_SEARCH_INDEX: SearchResultItem[] = buildSearchIndex();
