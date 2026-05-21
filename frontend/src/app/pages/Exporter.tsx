import { AlertTriangle, CheckCircle, Clock, Leaf, MapPin, Package, Sprout } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppLink } from '../components/AppLink';
import { TableScroll } from '../components/TableScroll';
import { fetchFarmersList } from '../api/realApi';
import type { FarmerListRow } from '../api/types';
import { getApiErrorMessage } from '../api/errors';

type RiskLevel = 'high' | 'medium' | 'low' | 'clean' | 'unknown';
type Cadence = 'on_track' | 'due' | 'attention';

export interface SupplyFarmRow {
  id: string;
  blockId: string;
  farmerName: string;
  county: string;
  acreage: number;
  estimatedVolume: number;
  risk: RiskLevel;
  finding: string;
  lastScoutDate: string | null;
  scoutName: string;
  cadence: Cadence;
  phone: string;
  location: string;
  /** One-line summary from mobile app farm registration when present */
  appOnboardingSummary?: string;
}

function shortBlockId(id: string): string {
  const s = String(id).replace(/-/g, '');
  return `BLK-${s.slice(0, 8).toUpperCase()}`;
}

function mapApiStatusToRisk(status: string | undefined): RiskLevel {
  const v = (status || '').toLowerCase();
  if (v.includes('high')) return 'high';
  if (v.includes('medium')) return 'medium';
  if (v.includes('low')) return 'low';
  if (v.includes('no-pest') || v === 'clean') return 'clean';
  return 'unknown';
}

function parseScoutDate(raw: string | null | undefined): Date | null {
  if (raw == null || String(raw).trim() === '') return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysSince(d: Date | null): number | null {
  if (!d) return null;
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return Math.floor((t.getTime() - x.getTime()) / (86400000));
}

function computeCadence(risk: RiskLevel, lastScout: Date | null): Cadence {
  if (risk === 'high' || risk === 'medium') return 'attention';
  const days = daysSince(lastScout);
  if (days === null || days > 14) return 'due';
  return 'on_track';
}

function mapFarmerToSupplyRow(r: FarmerListRow): SupplyFarmRow {
  const ls = r.lastScoutingResult;
  const lastScout = parseScoutDate(ls?.date);
  const risk = mapApiStatusToRisk(ls?.status);
  const m = r.mobileFarmFromApp;
  const acreageFromApp = m?.farmSize != null && m.farmSize > 0 ? m.farmSize : r.totalAcres;
  const bits: string[] = [];
  if (m) {
    const fn = (m.farmName || '').trim();
    const loc = (m.location || '').trim();
    if (fn) bits.push(fn);
    if (loc) bits.push(loc);
  }
  const meta: string[] = [];
  if (m && m.numberOfBlocks != null && m.numberOfBlocks > 0) meta.push(`${m.numberOfBlocks} blocks`);
  if (m && m.farmSize != null && m.farmSize > 0) meta.push(`${m.farmSize} ha`);
  const line1 = bits.join(' · ');
  const line2 = meta.join(' · ');
  const appOnboardingSummary = line1 || line2 ? [line1, line2].filter(Boolean).join(' — ') : undefined;
  return {
    id: r.id,
    blockId: r.farmerCode ? `BLK-${String(r.farmerCode).replace(/\s/g, '')}` : shortBlockId(r.id),
    farmerName: r.name,
    county: (r.county || '—').trim() || '—',
    acreage: acreageFromApp,
    estimatedVolume: Math.round(acreageFromApp * 1.2 * 10) / 10,
    risk,
    finding: (ls?.finding || '—').trim() || '—',
    lastScoutDate: ls?.date ? String(ls.date) : null,
    scoutName: (ls?.scoutName || '').trim(),
    cadence: computeCadence(risk, lastScout),
    phone: r.phone,
    location: r.location || '—',
    appOnboardingSummary,
  };
}

function riskBadgeStyle(risk: RiskLevel): { bg: string; text: string; label: string } {
  if (risk === 'high') return { bg: '#FEE2E2', text: '#991B1B', label: 'High' };
  if (risk === 'medium') return { bg: '#FFEDD5', text: '#C2410C', label: 'Medium' };
  if (risk === 'low') return { bg: '#FEF9C3', text: '#A16207', label: 'Low' };
  if (risk === 'clean') return { bg: '#DCFCE7', text: '#166534', label: 'Clean' };
  return { bg: '#F1F5F9', text: '#64748B', label: 'Unknown' };
}

function cadenceLabel(c: Cadence): string {
  if (c === 'attention') return 'Needs follow-up';
  if (c === 'due') return 'Scouting due';
  return 'On track';
}

export function Exporter() {
  const [rows, setRows] = useState<SupplyFarmRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState<string>('all');
  const [cadenceFilter, setCadenceFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFarmersList()
      .then((list) => {
        if (cancelled) return;
        setRows(list.map(mapFarmerToSupplyRow));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(e, 'Could not load your supply base.'));
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const countyOptions = useMemo(() => {
    const names = Array.from(new Set(rows.map((r) => r.county).filter((c) => c && c !== '—')));
    names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return names;
  }, [rows]);

  const countyRollup = useMemo(() => {
    const m = new Map<string, { farms: number; ha: number }>();
    for (const r of rows) {
      const c = r.county || '—';
      const cur = m.get(c) || { farms: 0, ha: 0 };
      cur.farms += 1;
      cur.ha += r.acreage;
      m.set(c, cur);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      if (countyFilter !== 'all' && r.county !== countyFilter) return false;
      if (cadenceFilter !== 'all' && r.cadence !== cadenceFilter) return false;
      if (!q) return true;
      return (
        r.blockId.toLowerCase().includes(q) ||
        r.farmerName.toLowerCase().includes(q) ||
        r.county.toLowerCase().includes(q) ||
        r.finding.toLowerCase().includes(q) ||
        (r.appOnboardingSummary || '').toLowerCase().includes(q)
      );
    });
  }, [rows, searchTerm, countyFilter, cadenceFilter]);

  const totalHa = rows.reduce((s, r) => s + r.acreage, 0);
  const countyCount = countyOptions.length;
  const onTrack = rows.filter((r) => r.cadence === 'on_track').length;
  const needsFollow = rows.filter((r) => r.cadence !== 'on_track').length;

  return (
    <div className="w-full">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
        <div>
          <h1
            className="mb-1 text-2xl sm:text-3xl"
            style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
          >
            Supply base & scouting health
          </h1>
          <p className="max-w-3xl text-sm sm:text-base" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Linked farmers across counties — latest field findings and scouting cadence. Use filters when your supply
            chain spans more than one county.
          </p>
        </div>
      </header>

      {loading ? (
        <p className="mb-4 text-sm text-gray-500" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Loading supply base…
        </p>
      ) : null}
      {error ? (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
          }}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="mb-4 grid min-w-0 grid-cols-2 gap-3 sm:mb-5 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm" style={{ borderColor: '#E0DDD6' }}>
          <div className="mb-2 flex items-center gap-2">
            <Leaf className="h-5 w-5" style={{ color: '#2D6A4F' }} />
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#717182' }}>
              Contracted area
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {totalHa.toFixed(1)} <span className="text-base font-normal text-gray-500">ha</span>
          </p>
          <p className="mt-1 text-xs" style={{ color: '#717182' }}>
            {rows.length} linked {rows.length === 1 ? 'farm' : 'farms'}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm" style={{ borderColor: '#E0DDD6' }}>
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-5 w-5" style={{ color: '#2D6A4F' }} />
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#717182' }}>
              Counties
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {countyCount}
          </p>
          <p className="mt-1 text-xs" style={{ color: '#717182' }}>
            With linked supply
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm" style={{ borderColor: '#E0DDD6' }}>
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" style={{ color: '#166534' }} />
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#717182' }}>
              Scouting on track
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: '#166534' }}>
            {onTrack}
          </p>
          <p className="mt-1 text-xs" style={{ color: '#717182' }}>
            Recent report &amp; no elevated risk
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm" style={{ borderColor: '#E0DDD6' }}>
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" style={{ color: '#C2410C' }} />
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#717182' }}>
              Follow-up
            </span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: '#C2410C' }}>
            {needsFollow}
          </p>
          <p className="mt-1 text-xs" style={{ color: '#717182' }}>
            Elevated risk or scouting overdue (&gt;14d)
          </p>
        </div>
      </div>

      {countyRollup.length > 0 ? (
        <div
          className="mb-4 flex flex-wrap gap-2 rounded-lg border bg-white p-4 shadow-sm sm:mb-5"
          style={{ borderColor: '#E0DDD6' }}
        >
          <span className="w-full text-xs font-semibold uppercase tracking-wide" style={{ color: '#717182' }}>
            By county
          </span>
          {countyRollup.map(([county, agg]) => (
            <span
              key={county}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: '#2D6A4F' }} />
              <strong>{county}</strong>
              <span style={{ color: '#717182' }}>
                {agg.farms} farms · {agg.ha.toFixed(1)} ha
              </span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm sm:mb-5" style={{ borderColor: '#E0DDD6' }}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative min-w-0 flex-1 max-w-md">
            <label className="sr-only">Search</label>
            <input
              type="search"
              placeholder="Search farmer, county, block, finding…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border py-2 pl-3 pr-3 text-sm"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderColor: '#E0DDD6', outline: 'none' }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#717182' }}>
              County
              <select
                value={countyFilter}
                onChange={(e) => setCountyFilter(e.target.value)}
                className="min-w-[10rem] rounded-lg border px-3 py-2 text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderColor: '#E0DDD6', color: '#1B4332' }}
                disabled={!rows.length}
              >
                <option value="all">All counties</option>
                {countyOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium" style={{ color: '#717182' }}>
              Cadence
              <select
                value={cadenceFilter}
                onChange={(e) => setCadenceFilter(e.target.value)}
                className="min-w-[10rem] rounded-lg border px-3 py-2 text-sm"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', borderColor: '#E0DDD6', color: '#1B4332' }}
              >
                <option value="all">All</option>
                <option value="on_track">On track</option>
                <option value="due">Scouting due</option>
                <option value="attention">Needs follow-up</option>
              </select>
            </label>
          </div>
        </div>
        <p className="mt-2 text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Showing {filteredRows.length} of {rows.length} farms
        </p>
      </div>

      <div className="min-w-0 overflow-hidden rounded-lg border bg-white shadow-sm" style={{ borderColor: '#E0DDD6' }}>
        <div
          className="flex items-center gap-2 border-b px-4 py-3"
          style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}
        >
          <Package className="h-5 w-5 shrink-0" style={{ color: '#1B4332' }} />
          <div>
            <h2 className="text-sm font-semibold sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Linked farmers
            </h2>
            <p className="text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Latest scouting outcome and whether a field visit is overdue (&gt;14 days without a logged report).
            </p>
          </div>
        </div>
        {!loading && rows.length === 0 && !error ? (
          <div className="p-10 text-center">
            <Sprout className="mx-auto mb-3 h-10 w-10" style={{ color: '#94A3B8' }} />
            <p className="text-sm font-medium" style={{ color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              No linked farmers yet
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              When your organisation links farmer accounts to your exporter entity, they will appear here with scouting
              summaries.
            </p>
          </div>
        ) : (
          <TableScroll>
            <table className="w-full min-w-[900px] text-left text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              <thead>
                <tr style={{ backgroundColor: '#1B4332' }}>
                  {(
                    [
                      ['block', 'Block'],
                      ['farmer', 'Farmer'],
                      ['county', 'County'],
                      ['ha', 'Ha'],
                      ['vol', 'Est. t'],
                      ['scout', 'Last scouted'],
                      ['find', 'Finding'],
                      ['risk', 'Risk'],
                      ['cadence', 'Cadence'],
                      ['act', ''],
                    ] as const
                  ).map(([key, label]) => (
                    <th key={key} className="p-3 text-xs font-semibold uppercase text-white">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r, index) => {
                  const badge = riskBadgeStyle(r.risk);
                  const scoutTs = parseScoutDate(r.lastScoutDate);
                  const days = daysSince(scoutTs);
                  return (
                    <tr
                      key={r.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F7F4EF',
                        borderBottom: '1px solid #E0DDD6',
                      }}
                    >
                      <td className="p-3 font-mono text-xs font-semibold" style={{ color: '#1B4332' }}>
                        {r.blockId}
                      </td>
                      <td className="p-3 font-medium" style={{ color: '#1B4332' }}>
                        <div>{r.farmerName}</div>
                        {r.appOnboardingSummary ? (
                          <p className="mt-1 max-w-[220px] text-[11px] leading-snug" style={{ color: '#64748B' }}>
                            {r.appOnboardingSummary}
                          </p>
                        ) : null}
                      </td>
                      <td className="p-3" style={{ color: '#475569' }}>
                        {r.county}
                      </td>
                      <td className="p-3 tabular-nums">{r.acreage.toFixed(1)}</td>
                      <td className="p-3 tabular-nums">{r.estimatedVolume.toFixed(1)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#475569' }}>
                          {scoutTs ? (
                            <>
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{scoutTs.toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                              {days !== null ? (
                                <span style={{ color: '#94A3B8' }}>({days}d ago)</span>
                              ) : null}
                            </>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>—</span>
                          )}
                        </div>
                        {r.scoutName ? (
                          <p className="mt-0.5 text-[11px]" style={{ color: '#94A3B8' }}>
                            Scout: {r.scoutName}
                          </p>
                        ) : null}
                      </td>
                      <td className="max-w-[200px] p-3 text-xs leading-snug" style={{ color: '#334155' }}>
                        {r.finding}
                      </td>
                      <td className="p-3">
                        <span
                          className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3 text-xs" style={{ color: '#475569' }}>
                        {cadenceLabel(r.cadence)}
                      </td>
                      <td className="p-3">
                        <AppLink
                          to={`/farmers/${r.id}`}
                          className="text-xs font-semibold text-[#2D6A4F] underline hover:no-underline"
                        >
                          Open profile
                        </AppLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>
        )}
      </div>
    </div>
  );
}
