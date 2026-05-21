import { Calendar, Camera, Eye, RefreshCcw, Search, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { getApiErrorMessage } from '../api/errors';
import type { ScoutingFeedItem } from '../api/types';
import { fetchScoutingFeed, requestReinspectionFromScouting } from '../api/realApi';
import { diseaseLabelsFromReport, pestRowsFromReport, splitGalleryUrls, trapUseRows } from '../utils/scoutingPayloadDisplay';

function formatDateTime(value: string): { date: string; time: string } {
  if (!value) return { date: '—', time: '—' };
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
  const parts = value.split(',');
  if (parts.length >= 2) return { date: parts[0].trim(), time: parts.slice(1).join(',').trim() };
  return { date: value, time: '—' };
}

function extractPestType(finding: string): string {
  const f = (finding || '').toLowerCase();
  if (f.includes('codling')) return 'False Codling Moth';
  if (f.includes('fruit fly')) return 'Fruit Fly';
  if (f.includes('thrips')) return 'Thrips';
  if (f.includes('mite')) return 'Mites';
  return finding || 'Unknown';
}

export function FarmerScoutingReports() {
  const [rows, setRows] = useState<ScoutingFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockFilter, setBlockFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pestFilter, setPestFilter] = useState('');
  const [trendItem, setTrendItem] = useState<ScoutingFeedItem | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchScoutingFeed()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load scouting reports.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pestTypes = useMemo(
    () => Array.from(new Set(rows.map((r) => extractPestType(r.finding)).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [rows],
  );

  const filtered = useMemo(() => {
    const blockQ = blockFilter.trim().toLowerCase();
    const pestQ = pestFilter.trim().toLowerCase();
    return rows.filter((r) => {
      const blockOk = !blockQ || (r.blockId || '').toLowerCase().includes(blockQ);
      const pest = extractPestType(r.finding).toLowerCase();
      const pestOk = !pestQ || pest.includes(pestQ);
      const rowDate = formatDateTime(r.timestamp).date;
      const dateOk = !dateFilter || rowDate === new Date(dateFilter).toLocaleDateString();
      return blockOk && pestOk && dateOk;
    });
  }, [rows, blockFilter, pestFilter, dateFilter]);

  const trends = useMemo(() => {
    if (!trendItem) return [];
    return rows
      .filter((r) => r.blockId === trendItem.blockId || extractPestType(r.finding) === extractPestType(trendItem.finding))
      .slice(0, 5);
  }, [rows, trendItem]);

  return (
    <>
      <header className="mb-4 md:mb-5">
        <h1 className="mb-1 text-2xl sm:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Scouting Reports
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Field data logs with quick actions for re-inspection and trend checks.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="rounded-lg border bg-white px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
          <span className="mb-1 block text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Filter by Block ID
          </span>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" style={{ color: '#717182' }} />
            <input
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              placeholder="e.g. BLK-KMB-01"
              className="w-full bg-transparent text-sm outline-none"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
            />
          </div>
        </label>
        <label className="rounded-lg border bg-white px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
          <span className="mb-1 block text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Filter by Date
          </span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
          />
        </label>
        <label className="rounded-lg border bg-white px-3 py-2" style={{ borderColor: '#E0DDD6' }}>
          <span className="mb-1 block text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Filter by Pest Type
          </span>
          <select
            value={pestFilter}
            onChange={(e) => setPestFilter(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
          >
            <option value="">All pest types</option>
            {pestTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm" style={{ color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border bg-white p-5 text-sm" style={{ borderColor: '#E0DDD6', color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Loading scouting reports...
          </div>
        ) : null}
        {!loading && filtered.length === 0 ? (
          <div className="rounded-lg border bg-white p-5 text-sm" style={{ borderColor: '#E0DDD6', color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            No reports matched your filters.
          </div>
        ) : null}

        {filtered.map((item) => {
          const dt = formatDateTime(item.timestamp);
          const pestType = extractPestType(item.finding);
          const scouter = item.farmerName || 'Farm Manager';
          const thumb = splitGalleryUrls(item).images[0] || item.mediaPreview;
          const pests = pestRowsFromReport(item).slice(0, 3);
          const diseases = diseaseLabelsFromReport(item).slice(0, 3);
          const traps = trapUseRows(item).slice(0, 2);
          return (
            <article key={item.id} className="rounded-lg border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                    Findings: {item.finding || `Pest activity detected in ${item.blockId}`}
                  </p>
                  <p className="mt-1 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                    Block: {item.blockId} · Pest type: {pestType}
                  </p>
                  {(pests.length || diseases.length || traps.length) ? (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {traps.length ? (
                        <span className="rounded-full px-2 py-1" style={{ backgroundColor: '#F7F4EF', border: '1px solid #E0DDD6' }}>
                          Traps: {traps.map((t) => `${t.type}×${t.count}`).join(' · ')}
                        </span>
                      ) : null}
                      {pests.length ? (
                        <span className="rounded-full px-2 py-1" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}>
                          Pests: {pests.map((p) => (p.perTrap ? `${p.name}(${p.perTrap})` : p.name)).join(' · ')}
                        </span>
                      ) : null}
                      {diseases.length ? (
                        <span className="rounded-full px-2 py-1" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
                          Diseases: {diseases.join(' · ')}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {dt.date}, {dt.time}</span>
                    <span>Scouter: {scouter}</span>
                  </div>
                </div>
                <div className="h-20 w-full max-w-[140px] overflow-hidden rounded border bg-[#F7F4EF] md:w-[140px]" style={{ borderColor: '#E0DDD6' }}>
                  {thumb ? (
                    <img src={thumb} alt="Field evidence" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      <Camera className="mr-1 h-3 w-3" /> No photo
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/scouting-reports/${item.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: '#2D6A4F', color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setRequestingId(item.id);
                    try {
                      const res = await requestReinspectionFromScouting({
                        reportId: item.id,
                        case_title: `Re-inspection request: ${item.blockId}`,
                        severity: item.severity === 'high' ? 'high' : 'medium',
                        notes: `Farmer requested re-inspection for ${item.blockId} after scouting finding: ${item.finding}.`,
                      });
                      setRequestedIds((prev) => ({ ...prev, [item.id]: res.case_id }));
                    } catch (e: unknown) {
                      setError(getApiErrorMessage(e, 'Could not request re-inspection.'));
                    } finally {
                      setRequestingId(null);
                    }
                  }}
                  disabled={Boolean(requestedIds[item.id]) || requestingId === item.id}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-white"
                  style={{
                    backgroundColor: requestedIds[item.id] ? '#64748B' : '#2D6A4F',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    opacity: requestingId === item.id ? 0.8 : 1,
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {requestingId === item.id
                    ? 'Submitting...'
                    : requestedIds[item.id]
                      ? 'Re-inspection Requested'
                      : 'Request Re-inspection'}
                </button>
                <button
                  type="button"
                  onClick={() => setTrendItem(item)}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: '#2D6A4F', color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  <TrendingUp className="h-4 w-4" /> View Historical Trends
                </button>
              </div>
              {requestedIds[item.id] ? (
                <p className="mt-2 text-xs" style={{ color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Request submitted. Linked Case ID: {requestedIds[item.id]}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      {trendItem ? (
        <div className="mt-4 rounded-lg border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
          <h3 className="mb-2 text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Historical Trends — {trendItem.blockId}
          </h3>
          <div className="space-y-2">
            {trends.map((r) => {
              const dt = formatDateTime(r.timestamp);
              return (
                <div key={r.id} className="rounded border p-2 text-sm" style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
                  {dt.date}, {dt.time} — {r.finding}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

