import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Headphones,
  MapPin,
  Microscope,
  Search,
  ShieldCheck,
  Smartphone,
  Waves,
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import { KenyaHeatMap } from '../components/KenyaHeatMap';
import { DashboardScoutingTrapPanels } from '../components/DashboardScoutingTrapPanels';
import { TableScroll } from '../components/TableScroll';
import { AppToast } from '../components/AppToast';
import { getApiErrorMessage } from '../api/errors';
import {
  addKnowledgeRegionalAlert,
  createCaseFromScouting,
  confirmScoutingIdentification,
  fetchAgronomistAnalytics,
  fetchScoutingBlockOverview,
  fetchContextualKnowledgeLinks,
  fetchFarmersList,
  fetchKnowledgeEntries,
  fetchScoutingAuditLog,
  fetchScoutingFeed,
  fetchDashboard,
  updateFarmerComplianceStatus,
  type KnowledgeEntryDto,
  type ScoutingBlockOverviewRow,
} from '../api/realApi';
import type { FarmerListRow, RecentScoutingRecord, RecentTrapActivityRow, ScoutingFeedItem } from '../api/types';
import {
  beneficialSummaryLine,
  diseaseLabelsFromReport,
  diseaseMetaSummaryLine,
  gpsLineFromPayload,
  farmSnapshotFromReport,
  mobileBlockLineFromReport,
  pestRowsFromReport,
  trapUseRows,
} from '../utils/scoutingPayloadDisplay';
import { MobileFarmChip } from '../utils/mobileFarmDisplay';

type AgronomistTab =
  | 'overview'
  | 'triage'
  | 'my-farmers'
  | 'analytics'
  | 'kb'
  | 'audit';
type TriageModalAction = 'review' | 'confirm';

type ActiveTriageModal = {
  report: ScoutingFeedItem;
  fallbackKb: KnowledgeEntryDto | null;
  action: TriageModalAction;
};

function detectKbMatch(report: ScoutingFeedItem, entries: KnowledgeEntryDto[]) {
  const hay = `${report.finding} ${report.blockId} ${report.farmName}`.toLowerCase();
  const match = entries.find((e) => {
    const title = String(e.title || '').toLowerCase();
    const tags = (e.tags || []).join(' ').toLowerCase();
    return title && (hay.includes(title.split(' ')[0]) || tags.split(' ').some((t) => t && hay.includes(t)));
  });
  return match || null;
}

function isUnknownFinding(report: ScoutingFeedItem) {
  const finding = String(report.finding || '').toLowerCase();
  return finding.includes('unknown') || finding.includes('i don') || !finding.trim();
}

export function AgronomistDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AgronomistTab>('overview');
  const [feed, setFeed] = useState<ScoutingFeedItem[]>([]);
  const [kbEntries, setKbEntries] = useState<KnowledgeEntryDto[]>([]);
  const [farmers, setFarmers] = useState<FarmerListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [countyPressure, setCountyPressure] = useState<Array<{ county: string; detections: number; reports: number }>>([]);
  const [protocolPerformanceRows, setProtocolPerformanceRows] = useState<Array<{ action: string; outcome: string; count: number }>>([]);
  const [blockOverviewRows, setBlockOverviewRows] = useState<ScoutingBlockOverviewRow[]>([]);
  const [auditRows, setAuditRows] = useState<
    Array<{ id: string; scout: string; block: string; county: string; timestamp: string; flag: string }>
  >([]);
  const [regionalAlertDrafts, setRegionalAlertDrafts] = useState<Record<string, string>>({});
  const [complianceModeByFarmer, setComplianceModeByFarmer] = useState<Record<string, 'compliant' | 'needs-follow-up'>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTriageModal, setActiveTriageModal] = useState<ActiveTriageModal | null>(null);
  const [triageKbLinks, setTriageKbLinks] = useState<KnowledgeEntryDto[]>([]);
  const [triageKbLoading, setTriageKbLoading] = useState(false);
  const [triageActionLoading, setTriageActionLoading] = useState(false);
  const [triageDiagnosisDraft, setTriageDiagnosisDraft] = useState('');
  const [triageProtocolDraft, setTriageProtocolDraft] = useState('');
  const [mergedFieldFeed, setMergedFieldFeed] = useState<{
    recentScoutingRecords: RecentScoutingRecord[];
    recentTrapActivity: RecentTrapActivityRow[];
    todayDateKey?: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchScoutingFeed(),
      fetchKnowledgeEntries(),
      fetchAgronomistAnalytics(),
      fetchScoutingBlockOverview(),
      fetchScoutingAuditLog(),
      fetchFarmersList(),
      fetchDashboard().catch(() => null),
    ])
      .then(([scouting, kb, analytics, blockOverview, audit, farmerRows, dashboard]) => {
        if (cancelled) return;
        setFeed(scouting);
        setKbEntries(kb);
        setBlockOverviewRows(blockOverview);
        setFarmers(farmerRows);
        setComplianceModeByFarmer(
          farmerRows.reduce<Record<string, 'compliant' | 'needs-follow-up'>>((acc, f) => {
            acc[f.id] =
              f.complianceStatus ||
              (f.overdueScouts || f.lastScoutingResult.status === 'high-risk' ? 'needs-follow-up' : 'compliant');
            return acc;
          }, {})
        );
        setCountyPressure(analytics.county_pressure.map((x) => ({ county: x.county, detections: x.detections, reports: x.reports })));
        setProtocolPerformanceRows(analytics.protocol_performance);
        setAuditRows(
          audit.map((r) => ({
            id: r.id,
            scout: r.scout,
            block: r.block,
            county: r.county,
            timestamp: r.timestamp,
            flag: r.flags.length ? `Review Needed (${r.flags.join(', ')})` : 'OK',
          }))
        );
        setError(null);
        if (dashboard) {
          setMergedFieldFeed({
            recentScoutingRecords: dashboard.recentScoutingRecords,
            recentTrapActivity: dashboard.recentTrapActivity ?? [],
            todayDateKey: dashboard.todayDateKey,
          });
        } else {
          setMergedFieldFeed(null);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(e, 'Could not load agronomist command center data.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Allow deep-linking from sidebar items like /dashboard?tab=my-farmers
  useEffect(() => {
    const raw = String(searchParams.get('tab') || '').trim();
    const allowed: AgronomistTab[] = ['overview', 'triage', 'my-farmers', 'analytics', 'kb', 'audit'];
    if (raw && (allowed as string[]).includes(raw)) {
      setActiveTab(raw as AgronomistTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const triageQueue = useMemo(
    () => feed.filter((r) => r.status === 'detected' && (isUnknownFinding(r) || !r.mediaPreview)),
    [feed]
  );

  const surveillanceByCounty = useMemo(() => {
    if (countyPressure.length) {
      return countyPressure
        .map((x) => ({ county: x.county, score: x.detections }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
    }
    const map = new Map<string, number>();
    for (const r of feed) {
      const county = r.county || 'Unknown';
      const bump = r.status === 'detected' ? 2 : 1;
      map.set(county, (map.get(county) || 0) + bump);
    }
    return Array.from(map.entries())
      .map(([county, score]) => ({ county, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [feed]);

  const protocolPerformance = useMemo(() => {
    if (protocolPerformanceRows.length) {
      const controlled = protocolPerformanceRows
        .filter((x) => String(x.outcome).toLowerCase().includes('controlled') || String(x.outcome).toLowerCase().includes('reduced'))
        .reduce((sum, x) => sum + x.count, 0);
      const total = protocolPerformanceRows.reduce((sum, x) => sum + x.count, 0) || 1;
      const successRate = Math.round((controlled / total) * 100);
      return { successRate, needsReview: 100 - successRate, sampleSize: total };
    }
    const detected = feed.filter((r) => r.status === 'detected').length;
    const clean = feed.filter((r) => r.status === 'clean').length;
    const total = Math.max(1, detected + clean);
    const successRate = Math.round((clean / total) * 100);
    return {
      successRate,
      needsReview: Math.max(0, 100 - successRate),
      sampleSize: total,
    };
  }, [feed]);

  const farmerPortfolio = useMemo(() => {
    const now = Date.now();
    const pendingByFarm = new Map<string, { count: number; oldestPendingMs: number | null }>();
    for (const report of feed) {
      if (report.triageStatus && report.triageStatus !== 'pending') continue;
      const ts = report.rawTimestamp ? new Date(report.rawTimestamp).getTime() : NaN;
      const item = pendingByFarm.get(report.farmName) || { count: 0, oldestPendingMs: null };
      item.count += 1;
      if (!Number.isNaN(ts)) {
        const age = Math.max(0, now - ts);
        item.oldestPendingMs = item.oldestPendingMs === null ? age : Math.max(item.oldestPendingMs, age);
      }
      pendingByFarm.set(report.farmName, item);
    }
    const slaLabel = (ms: number | null) => {
      if (ms === null) return 'No pending triage';
      const h = Math.floor(ms / (1000 * 60 * 60));
      if (h < 24) return '<24h';
      if (h <= 48) return '24-48h';
      return '>48h';
    };

    return farmers.map((farmer) => {
      const pending = pendingByFarm.get(farmer.name) || { count: 0, oldestPendingMs: null };
      return {
        ...farmer,
        pendingTriage: pending.count,
        triageSla: slaLabel(pending.oldestPendingMs),
        triageSlaColor:
          pending.oldestPendingMs === null
            ? '#15803D'
            : pending.oldestPendingMs > 48 * 3600 * 1000
              ? '#C0392B'
              : pending.oldestPendingMs > 24 * 3600 * 1000
                ? '#B45309'
                : '#15803D',
      };
    });
  }, [farmers, feed]);

  const blockOverviewByFarmer = useMemo(() => {
    const grouped = new Map<string, ScoutingBlockOverviewRow[]>();
    for (const row of blockOverviewRows) {
      const key = row.farmer_name.trim().toLowerCase();
      const current = grouped.get(key) || [];
      current.push(row);
      grouped.set(key, current);
    }
    return grouped;
  }, [blockOverviewRows]);

  const filteredKb = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return kbEntries;
    return kbEntries.filter((k) => `${k.title} ${k.category_name} ${(k.tags || []).join(' ')}`.toLowerCase().includes(q));
  }, [kbEntries, search]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeoutId = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  const openTriageActionModal = async (
    report: ScoutingFeedItem,
    action: TriageModalAction,
    fallbackKb: KnowledgeEntryDto | null
  ) => {
    setActiveTriageModal({ report, action, fallbackKb });
    setTriageDiagnosisDraft(fallbackKb?.title || report.finding || '');
    setTriageProtocolDraft(
      fallbackKb?.active_use_cases || 'Use integrated pest management protocol and monitor after 7 days.'
    );
    setTriageKbLoading(true);
    try {
      const contextual = await fetchContextualKnowledgeLinks({ finding: report.finding, county: report.county });
      setTriageKbLinks(contextual);
      const preferredKb = contextual[0] || fallbackKb;
      if (preferredKb?.title) {
        setTriageDiagnosisDraft(preferredKb.title);
      }
      if (preferredKb?.active_use_cases) {
        setTriageProtocolDraft(preferredKb.active_use_cases);
      }
    } catch {
      setTriageKbLinks([]);
    } finally {
      setTriageKbLoading(false);
    }
  };

  const handleTriageModalSubmit = async () => {
    if (!activeTriageModal) return;
    const { report, action, fallbackKb } = activeTriageModal;
    const selectedKb = triageKbLinks[0] || fallbackKb;
    const identifiedLabel = triageDiagnosisDraft.trim() || selectedKb?.title || report.finding || 'Field-confirmed diagnosis';
    const managementProtocol =
      triageProtocolDraft.trim() ||
      selectedKb?.active_use_cases ||
      'Use integrated pest management protocol and monitor after 7 days.';
    setTriageActionLoading(true);
    try {
      if (action === 'review') {
        const caseTitle = `${report.finding} — ${report.farmName} / ${report.blockId}`.trim();
        await createCaseFromScouting({
          weekly_record: report.id,
          case_title: caseTitle,
          severity: (report.severity as any) || 'medium',
        });
      }

      await confirmScoutingIdentification({
        reportId: report.id,
        identified_label: identifiedLabel,
        management_protocol: managementProtocol,
        review_status: 'confirmed',
        training_tagged: true,
        pushed_to_farmer: true,
      });
      setVerifiedIds((prev) => new Set(prev).add(report.id));
      setToastMessage(action === 'review' ? 'Case reviewed successfully.' : 'Identification confirmed.');
      setActiveTriageModal(null);
      setTriageKbLinks([]);
      setTriageDiagnosisDraft('');
      setTriageProtocolDraft('');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, action === 'review' ? 'Failed to review case.' : 'Failed to confirm identification.'));
    } finally {
      setTriageActionLoading(false);
    }
  };

  return (
    <>
      {toastMessage ? (
        <AppToast
          message={toastMessage}
          variant="success"
          onDismiss={() => setToastMessage(null)}
        />
      ) : null}

      <header className="mb-4 md:mb-5">
        <h1 className="mb-1 text-2xl sm:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Agronomist Command Center
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Expert triage, surveillance analytics, and knowledge support for your assigned farmers.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 sm:mb-5">
        {[
          ['overview', 'Overview'],
          ['triage', `Triage Queue (${triageQueue.length})`],
          ['my-farmers', `My Farmers (${farmers.length})`],
          ['analytics', 'Trend Analytics'],
          ['kb', 'Knowledge Base'],
          ['audit', 'Audit Logs'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              const t = id as AgronomistTab;
              setActiveTab(t);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('tab', t);
                return next;
              });
            }}
            className="rounded-lg px-4 py-2 text-sm transition-all"
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              backgroundColor: activeTab === id ? '#2D6A4F' : '#FFFFFF',
              color: activeTab === id ? '#FFFFFF' : '#1B4332',
              border: '1px solid #E0DDD6',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 rounded-lg border" style={{ borderColor: '#E0DDD6' }}>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading agronomist modules…</p>
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: '#D97706', backgroundColor: '#FFFBEB' }}>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E' }}>{error}</p>
        </div>
      ) : null}

      {!loading && activeTab === 'overview' ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-5 lg:grid-cols-4">
            {[
              { label: 'Unknown Reports', value: triageQueue.length, icon: AlertTriangle, color: '#C0392B', bg: '#FEE2E2' },
              { label: 'Detected Findings', value: feed.filter((r) => r.status === 'detected').length, icon: Microscope, color: '#D97706', bg: '#FEF3C7' },
              { label: 'KB Articles', value: kbEntries.length, icon: BookOpen, color: '#1B4332', bg: '#74C69D20' },
              { label: 'Protocol Success', value: `${protocolPerformance.successRate}%`, icon: ShieldCheck, color: '#2D6A4F', bg: '#DCFCE7' },
            ].map((card) => (
              <div key={card.label} className="rounded-lg border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {card.label}
                  </p>
                  <div className="rounded-lg p-2" style={{ backgroundColor: card.bg }}>
                    <card.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-2xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {mergedFieldFeed ? (
            <div className="mb-4">
              <h3 className="mb-2 text-base sm:text-lg" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Registry + mobile app (merged)
              </h3>
              <p className="mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Same feed as the main dashboard API: weekly scouting from the field registry and the smartphone app, plus trap
                check-ins.
              </p>
              <DashboardScoutingTrapPanels
                recentScoutingRecords={mergedFieldFeed.recentScoutingRecords}
                recentTrapActivity={mergedFieldFeed.recentTrapActivity}
                todayDateKey={mergedFieldFeed.todayDateKey}
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
              <h3 className="mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Pest Surveillance Heatmap
              </h3>
              <p className="mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Regional pressure proxy from current scouting detections.
              </p>
              <KenyaHeatMap />
            </div>
            <div className="rounded-lg border p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
              <h3 className="mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Top Counties (Detection Pressure)
              </h3>
              <div className="space-y-2">
                {surveillanceByCounty.map((c) => (
                  <div key={c.county} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: '#F7F4EF' }}>
                    <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{c.county}</span>
                    <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F', fontWeight: 600 }}>{c.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {!loading && activeTab === 'triage' ? (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
          <div className="border-b px-4 py-3 sm:px-6 sm:py-4" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Smart Triage Hub</h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Resolve unknown findings and push verified identifications back to field users.
            </p>
          </div>
          <TableScroll>
            <table className="w-full min-w-[1240px]">
              <thead>
                <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                  {[
                    'Timestamp',
                    'Farm / block',
                    'Variety',
                    'Traps',
                    'Pests',
                    'Diseases',
                    'Beneficials',
                    'Disease / GPS',
                    'Finding',
                    'Media',
                    'KB Deep Link',
                    'Action',
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {triageQueue.map((r, i) => {
                  const kb = detectKbMatch(r, kbEntries);
                  const isVerified = verifiedIds.has(r.id);
                  const appBlock = mobileBlockLineFromReport(r);
                  const trapLine = trapUseRows(r)
                    .map((t) => `${t.type} (×${t.count}${t.avg ? `, avg ${t.avg}` : ''})`)
                    .join(' · ');
                  const pestLine = pestRowsFromReport(r)
                    .map((p) => (p.perTrap ? `${p.name} (${p.perTrap}/trap)` : p.name))
                    .join(' · ');
                  const diseaseLine = diseaseLabelsFromReport(r).join(' · ');
                  const benLine = beneficialSummaryLine(r);
                  const disGps = [diseaseMetaSummaryLine(r), gpsLineFromPayload(r)].filter(Boolean).join(' · ');
                  return (
                    <tr key={r.id} style={{ borderBottom: i === triageQueue.length - 1 ? 'none' : '1px solid #E0DDD6' }}>
                      <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {r.timestamp}
                      </td>
                      <td className="max-w-[200px] px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        <div className="font-medium">{r.farmName}</div>
                        <div className="text-xs" style={{ color: '#717182' }}>
                          {r.blockId} · {r.county}
                        </div>
                        {appBlock ? (
                          <div className="mt-0.5 truncate text-xs" style={{ color: '#455A64' }} title={appBlock}>
                            App: {appBlock}
                          </div>
                        ) : null}
                      </td>
                      <td
                        className="max-w-[88px] px-4 py-3 text-xs"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                        title={r.variety || ''}
                      >
                        {r.variety ? <span className="line-clamp-2">{r.variety}</span> : '—'}
                      </td>
                      <td
                        className="max-w-[120px] px-4 py-3 text-xs"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                        title={trapLine}
                      >
                        {trapLine ? <span className="line-clamp-3">{trapLine}</span> : '—'}
                      </td>
                      <td
                        className="max-w-[120px] px-4 py-3 text-xs"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                        title={pestLine}
                      >
                        {pestLine ? <span className="line-clamp-3">{pestLine}</span> : '—'}
                      </td>
                      <td
                        className="max-w-[100px] px-4 py-3 text-xs"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                        title={diseaseLine}
                      >
                        {diseaseLine ? <span className="line-clamp-2">{diseaseLine}</span> : '—'}
                      </td>
                      <td
                        className="max-w-[100px] px-4 py-3 text-xs"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                        title={benLine}
                      >
                        {benLine ? <span className="line-clamp-2">{benLine}</span> : '—'}
                      </td>
                      <td
                        className="max-w-[120px] px-4 py-3 text-[11px]"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                        title={disGps}
                      >
                        {disGps ? <span className="line-clamp-2 font-mono">{disGps}</span> : '—'}
                      </td>
                      <td className="max-w-[180px] px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                        <span className="line-clamp-3" title={r.finding || ''}>
                          {r.finding || 'Unknown finding'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.mediaPreview ? (
                          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                            <Headphones className="inline mr-1 h-3 w-3" />
                            Evidence available
                          </span>
                        ) : (
                          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
                            Missing preview
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {kb ? (
                          <a href={`/knowledge-base/${kb.id}`} className="text-xs underline" style={{ color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                            {kb.title}
                          </a>
                        ) : (
                          <span className="text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                            No direct match
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void openTriageActionModal(r, 'review', kb)}
                            disabled={isVerified}
                            className="rounded px-3 py-1.5 text-xs"
                            style={{
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              backgroundColor: isVerified ? '#DCFCE7' : '#F59E0B',
                              color: isVerified ? '#15803D' : '#92400E',
                              border: '1px solid #E0DDD6',
                            }}
                          >
                            {isVerified ? 'Reviewed' : 'Review Case'}
                          </button>

                          <button
                            type="button"
                            onClick={() => void openTriageActionModal(r, 'confirm', kb)}
                            disabled={isVerified}
                            className="rounded px-3 py-1.5 text-xs"
                            style={{
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              backgroundColor: isVerified ? '#DCFCE7' : '#2D6A4F',
                              color: isVerified ? '#15803D' : '#FFFFFF',
                            }}
                          >
                            {isVerified ? 'Confirmed' : 'Confirm Identification'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>
        </div>
      ) : null}

      {!loading && activeTab === 'analytics' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
            <h3 className="mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Comparison & Benchmark
            </h3>
            <p className="mb-4 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Compare two blocks by detection pressure (proxy from current feed).
            </p>
            <div className="space-y-2">
              {feed.slice(0, 6).map((r) => (
                <div key={r.id} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ backgroundColor: '#F7F4EF' }}>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {r.blockId} <span style={{ color: '#717182' }}>({r.county})</span>
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: r.status === 'detected' ? '#D97706' : '#2D6A4F', fontWeight: 600 }}>
                    {r.status === 'detected' ? 'Detected' : 'Clean'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
            <h3 className="mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Intervention Validation
            </h3>
            <p className="mb-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Based on current detectable field outcomes.
            </p>
            <div className="space-y-2">
              <div className="rounded-lg px-3 py-2" style={{ backgroundColor: '#DCFCE7' }}>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D' }}>
                  <CheckCircle2 className="inline mr-2 h-4 w-4" />
                  Protocol success: {protocolPerformance.successRate}%
                </span>
              </div>
              <div className="rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF3C7' }}>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#B45309' }}>
                  <Waves className="inline mr-2 h-4 w-4" />
                  Needs review: {protocolPerformance.needsReview}% ({protocolPerformance.sampleSize} samples)
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && activeTab === 'my-farmers' ? (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
          <div className="border-b px-4 py-3 sm:px-6 sm:py-4" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>My Farmers Portfolio</h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Track compliance posture and triage SLA for farmers assigned to you.
            </p>
          </div>
          <TableScroll>
            <table className="w-full min-w-[860px]">
              <thead>
                <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                  {['Farmer', 'County', 'Latest Risk', 'Block Scouting', 'Pending Triage', 'Triage SLA', 'Compliance Toggle'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {farmerPortfolio.map((f, i) => {
                  const blockRows = blockOverviewByFarmer.get(f.name.trim().toLowerCase()) || [];
                  return (
                  <tr key={f.id} style={{ borderBottom: i === farmerPortfolio.length - 1 ? 'none' : '1px solid #E0DDD6' }}>
                    <td className="px-4 py-3">
                      <div>
                        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>{f.name}</p>
                        <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>{f.location}</p>
                        <MobileFarmChip row={f} title="App farm" />
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      {f.county}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          backgroundColor: f.lastScoutingResult.status === 'high-risk' ? '#FEE2E2' : '#DCFCE7',
                          color: f.lastScoutingResult.status === 'high-risk' ? '#B91C1C' : '#15803D',
                        }}
                      >
                        {f.lastScoutingResult.finding}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {blockRows.length ? (
                        <div className="space-y-2">
                          {blockRows.slice(0, 3).map((row) => (
                            <div key={row.block_id} className="rounded-lg border px-2 py-2" style={{ borderColor: '#E0DDD6', backgroundColor: '#F8FAFC' }}>
                              <p className="text-xs font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                                {row.block_name}
                              </p>
                              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#64748B' }}>
                                {row.latest_finding}
                              </p>
                              {(row.pests.length || row.diseases.length) ? (
                                <p className="text-[11px]" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#94A3B8' }}>
                                  {[...row.pests, ...row.diseases].join(', ')}
                                </p>
                              ) : null}
                            </div>
                          ))}
                          {blockRows.length > 3 ? (
                            <p className="text-[11px]" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#94A3B8' }}>
                              +{blockRows.length - 3} more blocks
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#94A3B8' }}>
                          No block scouting yet
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      {f.pendingTriage}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', backgroundColor: '#F8FAFC', color: f.triageSlaColor }}>
                        {f.triageSla}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex rounded-lg border p-1" style={{ borderColor: '#E0DDD6' }}>
                        <button
                          className="px-2 py-1 text-xs rounded"
                          onClick={async () => {
                            const previous = complianceModeByFarmer[f.id] || 'compliant';
                            setComplianceModeByFarmer((prev) => ({ ...prev, [f.id]: 'compliant' }));
                            try {
                              await updateFarmerComplianceStatus({
                                farmerId: f.id,
                                agronomist_compliance_status: 'compliant',
                              });
                              setToastMessage('Compliance status saved.');
                            } catch (e: unknown) {
                              setComplianceModeByFarmer((prev) => ({ ...prev, [f.id]: previous }));
                              setError(getApiErrorMessage(e, 'Failed to update farmer compliance status.'));
                            }
                          }}
                          style={{
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            backgroundColor: complianceModeByFarmer[f.id] === 'compliant' ? '#DCFCE7' : 'transparent',
                            color: complianceModeByFarmer[f.id] === 'compliant' ? '#15803D' : '#64748B',
                          }}
                        >
                          Compliant
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded"
                          onClick={async () => {
                            const previous = complianceModeByFarmer[f.id] || 'compliant';
                            setComplianceModeByFarmer((prev) => ({ ...prev, [f.id]: 'needs-follow-up' }));
                            try {
                              await updateFarmerComplianceStatus({
                                farmerId: f.id,
                                agronomist_compliance_status: 'needs-follow-up',
                              });
                              setToastMessage('Compliance status saved.');
                            } catch (e: unknown) {
                              setComplianceModeByFarmer((prev) => ({ ...prev, [f.id]: previous }));
                              setError(getApiErrorMessage(e, 'Failed to update farmer compliance status.'));
                            }
                          }}
                          style={{
                            fontFamily: 'IBM Plex Sans, sans-serif',
                            backgroundColor: complianceModeByFarmer[f.id] === 'needs-follow-up' ? '#FEF3C7' : 'transparent',
                            color: complianceModeByFarmer[f.id] === 'needs-follow-up' ? '#B45309' : '#64748B',
                          }}
                        >
                          Needs follow-up
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </TableScroll>
        </div>
      ) : null}

      {!loading && activeTab === 'kb' ? (
        <div className="rounded-lg border p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Knowledge Base Management</h3>
            <div className="ml-auto flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
              <Search className="h-4 w-4" style={{ color: '#717182' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search KB title, category, tags..."
                className="bg-transparent text-sm outline-none"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {filteredKb.slice(0, 20).map((k) => (
              <div key={k.id} className="rounded-lg border px-4 py-3 flex items-center gap-3" style={{ borderColor: '#E0DDD6' }}>
                <BookOpen className="h-4 w-4" style={{ color: '#2D6A4F' }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                    {k.title}
                  </p>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {k.category_name || 'Uncategorized'} · {k.severity || 'medium'} · {(k.tags || []).join(', ') || 'no tags'}
                  </p>
                </div>
                <a href={`/knowledge-base/${k.id}`} className="text-xs underline" style={{ color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Open
                </a>
                <div className="flex items-center gap-2">
                  <input
                    value={regionalAlertDrafts[k.id] || ''}
                    onChange={(e) =>
                      setRegionalAlertDrafts((prev) => ({
                        ...prev,
                        [k.id]: e.target.value,
                      }))
                    }
                    placeholder="Regional alert note"
                    className="rounded border px-2 py-1 text-xs"
                    style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  />
                  <button
                    className="rounded px-2 py-1 text-xs"
                    style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                    onClick={async () => {
                      const alert = (regionalAlertDrafts[k.id] || '').trim();
                      if (!alert) return;
                      try {
                        await addKnowledgeRegionalAlert({
                          entryId: k.id,
                          county: 'Kiambu',
                          alert,
                          active: true,
                        });
                        setRegionalAlertDrafts((prev) => ({ ...prev, [k.id]: '' }));
                      } catch (e: unknown) {
                        setError(getApiErrorMessage(e, 'Failed to save regional alert.'));
                      }
                    }}
                  >
                    Add Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!loading && activeTab === 'audit' ? (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
          <div className="border-b px-4 py-3 sm:px-6 sm:py-4" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Scouting Audit Log</h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Flags entries for potential speed scouting / missing media and supports GPS quality review.
            </p>
          </div>
          <TableScroll>
            <table className="w-full min-w-[720px]">
              <thead>
                <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                  {['Report', 'Scout', 'Block', 'County', 'Timestamp', 'Audit Flag'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditRows.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i === auditRows.length - 1 ? 'none' : '1px solid #E0DDD6' }}>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                      {r.id}
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      {r.scout}
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      {r.block}
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <MapPin className="inline mr-1 h-3 w-3" />
                      {r.county}
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      <Clock3 className="inline mr-1 h-3 w-3" />
                      {r.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          backgroundColor: r.flag === 'OK' ? '#DCFCE7' : '#FEF3C7',
                          color: r.flag === 'OK' ? '#15803D' : '#B45309',
                        }}
                      >
                        {r.flag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </div>
      ) : null}

      {activeTriageModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (triageActionLoading) return;
            setActiveTriageModal(null);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-lg border p-5"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
              {activeTriageModal.action === 'review' ? 'Review Case Details' : 'Confirm Identification'}
            </h3>
            <p className="mb-4 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Validate this farmer report before publishing advisory updates.
            </p>

            <div className="mb-4 grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-2" style={{ borderColor: '#E0DDD6' }}>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>Farmer:</strong> {activeTriageModal.report.farmerName || 'Unknown'}</p>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>Farm (app):</strong> {farmSnapshotFromReport(activeTriageModal.report).farmName || activeTriageModal.report.farmName || '—'}</p>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>Location (app):</strong> {farmSnapshotFromReport(activeTriageModal.report).location || activeTriageModal.report.reportLocation || '—'}</p>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>Block:</strong> {mobileBlockLineFromReport(activeTriageModal.report) || activeTriageModal.report.blockId}</p>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>County:</strong> {activeTriageModal.report.county}</p>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>Reported finding:</strong> {activeTriageModal.report.finding || 'Unknown'}</p>
              {activeTriageModal.report.triageLabel ? (
                <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>Prior diagnosis:</strong> {activeTriageModal.report.triageLabel}</p>
              ) : null}
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}><strong>Submitted:</strong> {activeTriageModal.report.timestamp}</p>
            </div>

            <div className="mb-5 rounded-lg border p-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
              <p className="mb-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                Knowledge base linkage
              </p>
              {triageKbLoading ? (
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Loading contextual guides...
                </p>
              ) : triageKbLinks.length > 0 ? (
                <div className="space-y-1">
                  {triageKbLinks.slice(0, 3).map((link) => (
                    <div key={link.id} className="flex items-center justify-between gap-2">
                      <a
                        href={`/knowledge-base/${link.id}`}
                        className="block text-sm underline"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
                      >
                        {link.title}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setTriageDiagnosisDraft(link.title || '');
                          setTriageProtocolDraft(
                            link.active_use_cases || 'Use integrated pest management protocol and monitor after 7 days.'
                          );
                        }}
                        className="rounded border px-2 py-1 text-xs"
                        style={{
                          borderColor: '#E0DDD6',
                          color: '#1B4332',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        Use KB Suggestion
                      </button>
                    </div>
                  ))}
                </div>
              ) : activeTriageModal.fallbackKb ? (
                <a
                  href={`/knowledge-base/${activeTriageModal.fallbackKb.id}`}
                  className="text-sm underline"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}
                >
                  {activeTriageModal.fallbackKb.title}
                </a>
              ) : (
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  No direct knowledge article match found.
                </p>
              )}
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg border p-3" style={{ borderColor: '#E0DDD6' }}>
              <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                <span className="mb-1 block font-semibold">Diagnosis (editable)</span>
                <input
                  type="text"
                  value={triageDiagnosisDraft}
                  onChange={(e) => setTriageDiagnosisDraft(e.target.value)}
                  disabled={triageActionLoading}
                  className="w-full rounded border px-3 py-2"
                  style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  placeholder="Enter confirmed diagnosis"
                />
              </label>
              <label className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                <span className="mb-1 block font-semibold">Advisory protocol (editable)</span>
                <textarea
                  value={triageProtocolDraft}
                  onChange={(e) => setTriageProtocolDraft(e.target.value)}
                  disabled={triageActionLoading}
                  rows={3}
                  className="w-full rounded border px-3 py-2"
                  style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  placeholder="Enter management protocol to send to farmer"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTriageModal(null)}
                disabled={triageActionLoading}
                className="rounded border px-4 py-2 text-sm"
                style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleTriageModalSubmit()}
                disabled={triageActionLoading}
                className="rounded px-4 py-2 text-sm"
                style={{
                  backgroundColor: activeTriageModal.action === 'review' ? '#F59E0B' : '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  opacity: triageActionLoading ? 0.6 : 1,
                }}
              >
                {triageActionLoading
                  ? 'Saving...'
                  : activeTriageModal.action === 'review'
                    ? 'Review and Confirm'
                    : 'Confirm Identification'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

