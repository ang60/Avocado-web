import { AlertTriangle, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAuthUser } from '../auth';
import { getApiErrorMessage } from '../api/errors';
import {
  fetchHcdaFarmers,
  fetchHcdaStatistics,
  fetchKnowledgeEntries,
  fetchMyFarmBlocks,
  fetchFarmerCaseAdvisories,
  fetchFarmerMe,
  fetchScoutingBlockOverview,
  fetchScoutingFeed,
  openHcdaPdfExport,
} from '../api/realApi';
import type { ScoutingFeedItem } from '../api/types';
import { FarmerFarmPointMap } from '../components/FarmerFarmPointMap';
import { RecentScoutingReportsTable } from '../components/RecentScoutingReportsTable';
import {
  actionsFromReport,
  diseaseLabelsFromReport,
  outcomeFromReport,
  pestRowsFromReport,
} from '../utils/scoutingPayloadDisplay';

type BlockStatus = 'Cleared' | 'Under Observation' | 'Restricted';

type UiBlock = {
  id: string;
  variety: string;
  treeCount: number;
  lastScoutDate: string;
  status: BlockStatus;
  latestFinding?: string;
  pests?: string[];
  diseases?: string[];
  actionsTaken?: string[];
  outcomes?: string[];
  historyCount?: number;
  boundaryPoints?: Array<{ lat: number; lng: number }>;
};

function statusStyle(status: BlockStatus) {
  if (status === 'Restricted') return { bg: '#FEE2E2', text: '#B91C1C' };
  if (status === 'Under Observation') return { bg: '#FEF3C7', text: '#B45309' };
  return { bg: '#DCFCE7', text: '#166534' };
}

type AdvisoryStatus = 'under_review' | 'verified' | 'closed' | 'new' | string;

type FarmerAdvisory = {
  id: string;
  diagnosisName: string;
  blockName: string;
  location: string;
  issuedAt: string;
  recommendedActions: string[];
  chemicalGuidanceIncluded: boolean;
  status: AdvisoryStatus;
  statusLabel: string;
};

function advisoryStatusStyle(status: AdvisoryStatus) {
  if (status === 'under_review') return { bg: '#FEF3C7', text: '#B45309' };
  if (status === 'verified') return { bg: '#DCFCE7', text: '#166534' };
  if (status === 'closed') return { bg: '#E0E7FF', text: '#4338CA' };
  return { bg: '#F3F4F6', text: '#6B7280' };
}

export function FarmerDashboard() {
  const user = getAuthUser();
  const [registryFarmName, setRegistryFarmName] = useState(
    () => user?.entity_details?.company_name || 'My Avocado Farm',
  );
  const farmName = registryFarmName;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<UiBlock[]>([]);
  const [advisories, setAdvisories] = useState<FarmerAdvisory[]>([]);
  const [latestAdvisory, setLatestAdvisory] = useState<FarmerAdvisory | null>(null);
  const [advisoryTab, setAdvisoryTab] = useState<'history' | 'latest'>('history');
  const [expandedAdvisoryId, setExpandedAdvisoryId] = useState<string | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [kbSuggestion, setKbSuggestion] = useState('Loading recommendation...');
  const [hcdaLicense, setHcdaLicense] = useState('—');
  const [compliancePct, setCompliancePct] = useState(0);
  const [farmCoordinates, setFarmCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [pestPulseData, setPestPulseData] = useState([
    { week: 'W1', traps: 0, threshold: 3.0 },
    { week: 'W2', traps: 0, threshold: 3.0 },
    { week: 'W3', traps: 0, threshold: 3.0 },
    { week: 'W4', traps: 0, threshold: 3.0 },
  ]);
  const [selectedBlock, setSelectedBlock] = useState<UiBlock | null>(null);
  const [protocolOpen, setProtocolOpen] = useState(false);
  const [scoutingFeed, setScoutingFeed] = useState<ScoutingFeedItem[]>([]);

  const handleViewAffectedBlock = () => {
    const restrictedBlocks = blocks.filter((b) => b.status === 'Restricted');
    const currentId = selectedBlock?.id;

    const candidate =
      restrictedBlocks.find((b) => b.id !== currentId) ??
      restrictedBlocks[0] ??
      blocks.find((b) => b.id !== currentId) ??
      blocks[0] ??
      null;

    setSelectedBlock(candidate);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchMyFarmBlocks(),
      fetchScoutingFeed(),
      fetchScoutingBlockOverview(),
      fetchFarmerCaseAdvisories(),
      fetchFarmerMe().catch(() => null),
      fetchHcdaFarmers(),
      fetchHcdaStatistics(),
    ])
      .then(async ([farmBlocks, scouting, blockOverview, farmerCases, farmerMe, hcdaRows, hcdaStats]) => {
        if (cancelled) return;
        if (farmerMe) {
          const appFarm = farmerMe.mobileFarmFromApp?.farmName?.trim() || farmerMe.farmName?.trim();
          if (appFarm) setRegistryFarmName(appFarm);
          const lat = farmerMe.latestScoutingFromApp?.gpsLatitude;
          const lng = farmerMe.latestScoutingFromApp?.gpsLongitude;
          if (lat && lng) {
            const la = parseFloat(lat);
            const lo = parseFloat(lng);
            if (!Number.isNaN(la) && !Number.isNaN(lo)) setFarmCoordinates({ lat: la, lng: lo });
          }
        }
        setScoutingFeed(scouting);
        const userCounty = (user?.county || '').toLowerCase();
        const userName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim().toLowerCase();
        const myHcda =
          hcdaRows.find((r) => r.farmerName.trim().toLowerCase() === userName) ||
          hcdaRows.find((r) => r.county.toLowerCase() === userCounty) ||
          hcdaRows[0];

        setHcdaLicense(myHcda?.hcdaRegNumber ?? '—');
        setCompliancePct(Math.round(hcdaStats.globalgap_compliant.percentage || 0));
        if (myHcda && Number.isFinite(myHcda.lat) && Number.isFinite(myHcda.lng)) {
          setFarmCoordinates({ lat: Number(myHcda.lat), lng: Number(myHcda.lng) });
        } else {
          setFarmCoordinates(null);
        }

        const byBlock: Record<
          string,
          {
            status: BlockStatus;
            lastScoutDate: string;
            latestFinding?: string;
            pests?: string[];
            diseases?: string[];
            actionsTaken?: string[];
            outcomes?: string[];
            historyCount?: number;
          }
        > = {};
        const alerts: string[] = [];
        const activities: string[] = [];
        const detectedFindings: string[] = [];

        for (const row of scouting) {
          const pests = pestRowsFromReport(row).map((p) => p.name);
          const diseases = diseaseLabelsFromReport(row);
          const hasIssues = row.status === 'detected' || pests.length > 0 || diseases.length > 0;
          const status: BlockStatus = hasIssues ? (row.severity === 'high' ? 'Restricted' : 'Under Observation') : 'Cleared';
          byBlock[row.blockId] = {
            status,
            lastScoutDate: row.timestamp || '—',
            latestFinding: row.finding,
            pests,
            diseases,
            actionsTaken: actionsFromReport(row),
            outcomes: outcomeFromReport(row) ? [outcomeFromReport(row)] : [],
            historyCount: 1,
          };
          if (hasIssues) {
            alerts.push(`Block ${row.blockId} detected: ${row.finding}.`);
            detectedFindings.push(row.finding);
          }
          activities.push(`${row.farmerName} submitted a scouting report for ${row.blockId}${hasIssues ? ` — ${row.finding}` : ''}.`);
        }

        for (const row of blockOverview) {
          const status: BlockStatus =
            row.status === 'detected' ? (row.severity === 'high' ? 'Restricted' : 'Under Observation') : 'Cleared';
          byBlock[row.block_name] = {
            status,
            lastScoutDate: row.last_scouted_at || '—',
            latestFinding: row.latest_finding,
            pests: row.pests,
            diseases: row.diseases,
            actionsTaken: row.actions_taken,
            outcomes: row.outcomes,
            historyCount: row.history_count,
          };
        }

        if (myHcda?.globalGAPExpiry) {
          alerts.push(`GlobalGAP expiry: ${myHcda.globalGAPExpiry}.`);
        }

        const mappedBlocks: UiBlock[] = farmBlocks.map((b) => ({
          id: b.block_name,
          variety: 'Avocado',
          treeCount: b.number_of_trees,
          status: byBlock[b.block_name]?.status ?? 'Cleared',
          lastScoutDate: byBlock[b.block_name]?.lastScoutDate ?? '—',
          latestFinding: byBlock[b.block_name]?.latestFinding ?? 'No scouting history yet',
          pests: byBlock[b.block_name]?.pests ?? [],
          diseases: byBlock[b.block_name]?.diseases ?? [],
          actionsTaken: byBlock[b.block_name]?.actionsTaken ?? [],
          outcomes: byBlock[b.block_name]?.outcomes ?? [],
          historyCount: byBlock[b.block_name]?.historyCount ?? 0,
          boundaryPoints: Array.isArray(b.boundary_points) ? b.boundary_points : [],
        }));

        setBlocks(mappedBlocks);
        setSelectedBlock(mappedBlocks[0] ?? null);
        setRecentAlerts(alerts.slice(0, 3).length ? alerts.slice(0, 3) : ['No active pest alerts right now.']);
        setRecentActivity(activities.slice(0, 3).length ? activities.slice(0, 3) : ['No recent scouting activity yet.']);

        const mappedAdvisories: FarmerAdvisory[] = (farmerCases ?? []).map((c) => {
          const record = c.pest_scouting_record ?? null;
          const blockValue = record?.block;
          const blockName =
            typeof blockValue === 'string'
              ? blockValue
              : typeof blockValue === 'object' && blockValue
                ? blockValue.block_name
                : '—';
          const location = record?.location ?? '—';
          const diagnosisName = (c.diagnosis ?? c.case_title ?? record?.disease ?? record?.pests_observed ?? '—') as string;
          const recommendedActions = Array.isArray(c.recommended_actions) ? c.recommended_actions : [];
          const chemicalGuidanceIncluded = recommendedActions.some((a) =>
            (a || '').toLowerCase().includes('chemical') || (a || '').toLowerCase().includes('active ingredient'),
          );
          const issuedAt = c.closed_at || c.created_at || '';
          const status = (c.status ?? 'new') as AdvisoryStatus;
          const statusLabel =
            status === 'under_review'
              ? 'Under Review'
              : status === 'verified'
                ? 'Advisory Issued'
                : status === 'closed'
                  ? 'Closed'
                  : 'New';

          return {
            id: c.id,
            diagnosisName,
            blockName,
            location,
            issuedAt,
            recommendedActions,
            chemicalGuidanceIncluded,
            status,
            statusLabel,
          };
        });

        mappedAdvisories.sort((a, b) => (b.issuedAt || '').localeCompare(a.issuedAt || ''));
        setAdvisories(mappedAdvisories);
        setLatestAdvisory(mappedAdvisories[0] ?? null);
        setExpandedAdvisoryId(null);

        const recent = scouting.slice(0, 4).reverse();
        if (recent.length) {
          const pulse = recent.map((r, i) => ({
            week: `W${i + 1}`,
            traps: r.severity === 'high' ? 3.4 : r.severity === 'medium' ? 2.5 : 1.4,
            threshold: 3.0,
          }));
          while (pulse.length < 4) {
            pulse.unshift({ week: `W${4 - pulse.length}`, traps: 0, threshold: 3.0 });
          }
          setPestPulseData(pulse);
        }

        const keyword = detectedFindings[0] || 'avocado pest';
        try {
          const kb = await fetchKnowledgeEntries(keyword);
          if (!cancelled) {
            setKbSuggestion(kb[0]?.title ? `Suggested: ${kb[0].title}` : 'Suggested: Avocado IPM management guide.');
          }
        } catch {
          if (!cancelled) setKbSuggestion('Suggested: Avocado IPM management guide.');
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(getApiErrorMessage(e, 'Could not load farmer dashboard data.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.county, user?.first_name, user?.last_name]);

  const recentScoutingSorted = useMemo(() => {
    return [...scoutingFeed].sort((a, b) => {
      const ta = a.rawTimestamp || '';
      const tb = b.rawTimestamp || '';
      if (ta || tb) return tb.localeCompare(ta);
      return String(b.timestamp).localeCompare(String(a.timestamp));
    });
  }, [scoutingFeed]);

  const hasRestricted = useMemo(() => blocks.some((b) => b.status === 'Restricted'), [blocks]);
  const heroBg = hasRestricted ? '#B91C1C' : '#2E7D32';
  const heroText = hasRestricted ? 'Farm Status: Warning — Restricted Block Detected' : 'Farm Status: Export Ready';

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const stroke = circumference * (1 - compliancePct / 100);

  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Farmer Command Center
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
          Action-oriented monitoring for {farmName}
        </p>
      </header>

      {loadError ? (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm" style={{ color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {loadError}
        </div>
      ) : null}

      <div
        className="sticky top-0 z-10 mb-4 rounded-xl border px-4 py-3 text-white shadow-sm"
        style={{ backgroundColor: heroBg, borderColor: heroBg }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm opacity-90" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {farmName} · {hcdaLicense}
            </p>
            <p className="text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {heroText}
            </p>
          </div>
          <button
            type="button"
            onClick={handleViewAffectedBlock}
            className="rounded-lg bg-white/15 px-3 py-2 text-sm hover:bg-white/25"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            View Affected Block
          </button>
        </div>
      </div>

      <RecentScoutingReportsTable
        items={recentScoutingSorted}
        maxRows={8}
        title="Your recent scouting (mobile)"
        subtitle="Same feed as Scouting Reports: app submissions, traps, and review status. Use View for full detail."
        showFullFeedLink
      />

      {/* Latest Advisory */}
      <section className="mb-4 rounded-xl border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
              Latest Advisory
            </h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Latest diagnosis and remedies for your farm
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdvisoryTab('history')}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              style={{ borderColor: '#E0DDD6', color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              View History
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Loading latest advisory...
          </p>
        ) : latestAdvisory ? (
          <div className="mt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex rounded-full px-3 py-1 text-xs"
                style={{
                  backgroundColor: advisoryStatusStyle(latestAdvisory.status).bg,
                  color: advisoryStatusStyle(latestAdvisory.status).text,
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontWeight: 600,
                }}
              >
                {latestAdvisory.statusLabel}
              </span>
              {latestAdvisory.chemicalGuidanceIncluded ? (
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs"
                  style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}
                >
                  Chemical guidance included
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Diagnosis: <span style={{ color: '#1B4332', fontWeight: 700 }}>{latestAdvisory.diagnosisName}</span>
            </p>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Affected: {latestAdvisory.blockName} · Location: {latestAdvisory.location}
            </p>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Issued: {latestAdvisory.issuedAt ? latestAdvisory.issuedAt.slice(0, 10) : '—'}
            </p>

            <div className="mt-3 rounded-lg border p-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#F8FAFC' }}>
              <p className="text-xs font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
                Recommended actions
              </p>
              {latestAdvisory.recommendedActions.length ? (
                <ul className="mt-2 space-y-1">
                  {latestAdvisory.recommendedActions.slice(0, 4).map((a, idx) => (
                    <li key={`${idx}-${a}`} className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  No remedies recorded yet.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            No advisories yet.
          </p>
        )}
      </section>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
          <p className="text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Pest Pressure
          </p>
          <p className="text-2xl" style={{ color: '#2E7D32', fontFamily: 'DM Serif Display, serif' }}>
            {hasRestricted ? 'High' : 'Low'}
          </p>
          <p className="text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Avg {(pestPulseData.reduce((acc, p) => acc + p.traps, 0) / pestPulseData.length).toFixed(1)} insects / trap
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
          <p className="text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Scouting Compliance
          </p>
          <p className="text-2xl" style={{ color: '#2E7D32', fontFamily: 'DM Serif Display, serif' }}>
            {blocks.length ? `${Math.round((blocks.filter((b) => b.lastScoutDate !== '—').length / blocks.length) * 100)}%` : '0%'}
          </p>
          <p className="text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            All blocks inspected
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
          <p className="text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Upcoming Harvest
          </p>
          <p className="text-2xl" style={{ color: '#2E7D32', fontFamily: 'DM Serif Display, serif' }}>
            14 Days
          </p>
          <p className="text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Est. May 2nd
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
          <p className="text-xs" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Recent Activity
          </p>
          <p className="text-sm" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {loading ? 'Loading...' : recentActivity[0]}
          </p>
        </div>
      </div>

      {/* Diagnoses & Remedies */}
      <section className="mb-4 rounded-xl border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
            Diagnoses & Remedies
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdvisoryTab('history')}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              style={{
                borderColor: '#E0DDD6',
                color: advisoryTab === 'history' ? '#2E7D32' : '#455A64',
                backgroundColor: advisoryTab === 'history' ? '#F0FDF4' : '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: advisoryTab === 'history' ? 700 : 600,
              }}
            >
              History
            </button>
            <button
              type="button"
              onClick={() => setAdvisoryTab('latest')}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              style={{
                borderColor: '#E0DDD6',
                color: advisoryTab === 'latest' ? '#2E7D32' : '#455A64',
                backgroundColor: advisoryTab === 'latest' ? '#F0FDF4' : '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: advisoryTab === 'latest' ? 700 : 600,
              }}
            >
              Latest
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Loading diagnoses & remedies...
            </p>
          ) : advisoryTab === 'latest' ? (
            latestAdvisory ? (
              <div className="rounded-lg border p-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#F8FAFC' }}>
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs"
                      style={{
                        backgroundColor: advisoryStatusStyle(latestAdvisory.status).bg,
                        color: advisoryStatusStyle(latestAdvisory.status).text,
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {latestAdvisory.statusLabel}
                    </span>
                    {latestAdvisory.chemicalGuidanceIncluded ? (
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs"
                        style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 700 }}
                      >
                        Chemical guidance included
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {latestAdvisory.issuedAt ? latestAdvisory.issuedAt.slice(0, 10) : '—'}
                  </span>
                </div>
                <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  <span style={{ color: '#1B4332', fontWeight: 800 }}>{latestAdvisory.diagnosisName}</span>
                  <span> · {latestAdvisory.blockName}</span>
                  <span> · {latestAdvisory.location}</span>
                </p>
                {latestAdvisory.recommendedActions.length ? (
                  <ul className="mt-2 space-y-1">
                    {latestAdvisory.recommendedActions.slice(0, 4).map((a, idx) => (
                      <li key={`${latestAdvisory.id}-${idx}`} className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    No remedies recorded yet.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                No advisories yet.
              </p>
            )
          ) : advisories.length ? (
            advisories.map((a) => {
              const isExpanded = expandedAdvisoryId === a.id;
              const shown = isExpanded ? a.recommendedActions : a.recommendedActions.slice(0, 2);
              return (
                <div key={a.id} className="rounded-lg border p-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs"
                        style={{
                          backgroundColor: advisoryStatusStyle(a.status).bg,
                          color: advisoryStatusStyle(a.status).text,
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          fontWeight: 700,
                        }}
                      >
                        {a.statusLabel}
                      </span>
                      {a.chemicalGuidanceIncluded ? (
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs"
                          style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 700 }}
                        >
                          Chemical guidance
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {a.issuedAt ? a.issuedAt.slice(0, 10) : '—'}
                    </span>
                  </div>

                  <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                    <span style={{ color: '#1B4332', fontWeight: 800 }}>{a.diagnosisName}</span>
                    <span> · {a.blockName}</span>
                    <span> · {a.location}</span>
                  </p>

                  {a.recommendedActions.length ? (
                    <>
                      <ul className="mt-2 space-y-1">
                        {shown.map((act, idx) => (
                          <li key={`${a.id}-act-${idx}`} className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                            {act}
                          </li>
                        ))}
                      </ul>
                      {a.recommendedActions.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => setExpandedAdvisoryId(isExpanded ? null : a.id)}
                          className="mt-2 text-sm rounded-lg border px-3 py-2 hover:bg-gray-50"
                          style={{ borderColor: '#E0DDD6', color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 700 }}
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      No remedies recorded yet.
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              No diagnoses/remedies history yet.
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="rounded-xl border bg-white p-4 xl:col-span-6" style={{ borderColor: '#E0DDD6' }}>
          <h3 className="mb-1 text-base font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
            Interactive Satellite Map
          </h3>
          <p className="mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
            Click a block to view quick stats
          </p>
          <FarmerFarmPointMap
            lat={farmCoordinates?.lat ?? null}
            lng={farmCoordinates?.lng ?? null}
            blockBoundaryPoints={selectedBlock?.boundaryPoints ?? null}
            polygonStyle={
              selectedBlock?.status === 'Restricted'
                ? { fill: 'rgba(239, 68, 68, 0.18)', stroke: '#DC2626' }
                : selectedBlock?.status === 'Under Observation'
                  ? { fill: 'rgba(245, 158, 11, 0.18)', stroke: '#D97706' }
                  : { fill: 'rgba(22, 163, 74, 0.18)', stroke: '#15803D' }
            }
          />
          <div className="mt-3 rounded-lg border p-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#F8FAFC' }}>
            <p className="font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
              Block Quick Stats: {selectedBlock?.id ?? '—'}
            </p>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Variety: {selectedBlock?.variety ?? '—'} · Trees: {selectedBlock?.treeCount ?? 0} · Last scout: {selectedBlock?.lastScoutDate ?? '—'}
            </p>
            <p className="mt-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              Latest finding: {selectedBlock?.latestFinding ?? '—'}
            </p>
            {selectedBlock?.boundaryPoints && selectedBlock.boundaryPoints.length >= 3 ? (
              <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#94A3B8' }}>
                Boundary polygon loaded ({selectedBlock.boundaryPoints.length} points)
              </p>
            ) : (
              <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#94A3B8' }}>
                No boundary polygon available for this block.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 xl:col-span-3" style={{ borderColor: '#E0DDD6' }}>
          <h3 className="mb-2 text-base font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
            Action Center
          </h3>
          <div className="mb-3 rounded-lg border px-3 py-2" style={{ borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }}>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E3A8A' }}>
              AI Nudge: Service traps in Block A and monitor root rot symptoms on Thursday.
              {hasRestricted ? ' Restricted block detected; prioritize sanitation and re-scout in 48 hours.' : ''}
            </p>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((a) => (
              <div key={a} className="flex items-start gap-2 rounded-lg border p-2" style={{ borderColor: '#E0DDD6' }}>
                <AlertTriangle className="mt-0.5 h-4 w-4" style={{ color: '#F59E0B' }} />
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>{a}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setProtocolOpen(true)}
            className="mt-3 w-full rounded-lg px-3 py-2 text-sm text-white"
            style={{ backgroundColor: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            Treatment Protocol
          </button>
          <a
            href="https://wa.me/254700990010"
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: '#2E7D32', color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <MessageCircle className="h-4 w-4" /> Contact Agronomist
          </a>
        </section>

        <section className="rounded-xl border bg-white p-4 xl:col-span-3" style={{ borderColor: '#E0DDD6' }}>
          <h3 className="mb-2 text-base font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
            Pest Pulse
          </h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pestPulseData}>
                <XAxis dataKey="week" tick={{ fill: '#455A64', fontSize: 12 }} />
                <YAxis tick={{ fill: '#455A64', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="traps" stroke="#2E7D32" strokeWidth={3} />
                <Line type="monotone" dataKey="threshold" stroke="#DC2626" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            <div className="rounded-lg border p-3" style={{ borderColor: '#E0DDD6' }}>
              <p className="mb-1 text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
                Compliance Gauge
              </p>
              <div className="flex items-center gap-3">
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    fill="none"
                    stroke="#2E7D32"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={stroke}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                  />
                </svg>
                <div>
                  <p className="text-2xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#2E7D32' }}>{compliancePct}%</p>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>GlobalGAP met</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: '#E0DDD6' }}>
              <p className="mb-1 text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
                Digital Permit
              </p>
              <button type="button" className="flex w-full items-center justify-between rounded border px-2 py-2" style={{ borderColor: '#E0DDD6' }}>
                <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  {selectedBlock ? `${selectedBlock.id} movement permit preview` : 'No block selected'}
                </span>
                <ShieldCheck className="h-4 w-4" style={{ color: '#2E7D32' }} />
              </button>
              <button
                type="button"
                onClick={openHcdaPdfExport}
                className="mt-2 w-full rounded border px-2 py-2 text-xs"
                style={{ borderColor: '#2E7D32', color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                Open Printable PDF
              </button>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: '#E0DDD6' }}>
              <p className="mb-1 text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
                KB Quick-Link
              </p>
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                {kbSuggestion}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {blocks.map((b) => {
          const style = statusStyle(b.status);
          return (
            <div key={b.id} className="rounded-lg border bg-white p-3" style={{ borderColor: '#E0DDD6' }}>
              <p className="font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
                {b.id}
              </p>
              <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                {b.variety} · Last scout {b.lastScoutDate}
              </p>
              <p className="mt-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                {b.latestFinding || 'No scouting history yet'}
              </p>
              {b.pests?.length || b.diseases?.length ? (
                <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#64748B' }}>
                  {(b.pests || []).concat(b.diseases || []).join(', ')}
                </p>
              ) : null}
              {b.actionsTaken?.length ? (
                <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#64748B' }}>
                  Action: {b.actionsTaken.join(', ')}
                </p>
              ) : null}
              <span className="mt-2 inline-flex rounded-full px-2 py-1 text-xs" style={{ backgroundColor: style.bg, color: style.text, fontFamily: 'IBM Plex Sans, sans-serif' }}>
                {b.status}
              </span>
              <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#94A3B8' }}>
                {b.historyCount || 0} scouting entr{(b.historyCount || 0) === 1 ? 'y' : 'ies'}
              </p>
            </div>
          );
        })}
      </div>

      {protocolOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5">
            <h3 className="mb-2 text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2E7D32' }}>
              Treatment Protocol
            </h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
              1) Service traps in BLK-KMB-01 within 24h.
              <br />
              2) Remove and destroy infested fallen fruit.
              <br />
              3) Re-scout in 48h and compare against KEPHIS threshold.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setProtocolOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white"
                style={{ backgroundColor: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

