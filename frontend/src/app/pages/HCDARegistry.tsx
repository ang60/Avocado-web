import { Activity, AlertTriangle, MapPin, Sprout, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { TableScroll } from '../components/TableScroll';
import { fetchHcdaCountyOverview, type HcdaCountyOverviewDto, type HcdaCountyRowDto } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';

function dangerBadge(level: string) {
  const v = (level || 'low').toLowerCase();
  const map: Record<string, { bg: string; text: string; label: string }> = {
    high: { bg: '#FEE2E2', text: '#B91C1C', label: 'High' },
    elevated: { bg: '#FFEDD5', text: '#C2410C', label: 'Elevated' },
    watch: { bg: '#FEF9C3', text: '#A16207', label: 'Watch' },
    low: { bg: '#DCFCE7', text: '#166534', label: 'Low' },
  };
  const c = map[v] || map.low;
  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: 'IBM Plex Sans, sans-serif' }}
    >
      {c.label}
    </span>
  );
}

export function HCDARegistry() {
  const [windowDays, setWindowDays] = useState(30);
  const [data, setData] = useState<HcdaCountyOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** `'all'` = show every county row from the API. */
  const [selectedCounty, setSelectedCounty] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHcdaCountyOverview(windowDays)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load county overview.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [windowDays]);

  const countyOptions = useMemo(() => {
    const rows = data?.counties ?? [];
    const names = Array.from(new Set(rows.map((r) => r.county).filter(Boolean)));
    names.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return names;
  }, [data]);

  useEffect(() => {
    if (!data?.counties?.length || selectedCounty === 'all') return;
    const names = new Set(data.counties.map((r) => r.county));
    if (!names.has(selectedCounty)) {
      setSelectedCounty('all');
    }
  }, [data, selectedCounty]);

  const filteredCounties = useMemo(() => {
    const rows = data?.counties ?? [];
    if (selectedCounty === 'all') return rows;
    return rows.filter((r) => r.county === selectedCounty);
  }, [data, selectedCounty]);

  const rowsForTable: HcdaCountyRowDto[] = filteredCounties;

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-5">
        <h1
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)',
            color: '#1B4332',
            margin: 0,
          }}
        >
          HCDA County Surveillance
        </h1>
        <p
          className="mt-2"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '15px',
            color: '#717182',
            margin: 0,
            maxWidth: '52rem',
          }}
        >
          County-level indicators for extension messaging: active farmers on the platform, scouting
          activity, pest pressure signals, and a simple danger band. No farm-level registry or
          compliance data is shown here.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide" style={{ color: '#717182' }}>
          Reporting window (days)
          <select
            value={windowDays}
            onChange={(e) => setWindowDays(Number(e.target.value))}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: '#E0DDD6', color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            {[7, 14, 30, 60, 90].map((d) => (
              <option key={d} value={d}>
                Last {d} days
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-xs uppercase tracking-wide" style={{ color: '#717182' }}>
          County
          <select
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: '#E0DDD6', color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}
            disabled={!data?.counties?.length}
          >
            <option value="all">All counties</option>
            {countyOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Loading county overview…
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

      {!loading && data ? (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Farmers on platform',
              value: data.totalFarmersUsingTool,
              sub: 'Active Farmer role',
              icon: Users,
            },
            {
              label: 'Scouting records (window)',
              value: data.totalScoutingRecordsInWindow,
              sub: `Last ${data.windowDays} days (all counties)`,
              icon: Activity,
            },
            {
              label: 'Counties represented',
              value: data.counties.filter((c) => c.farmerCount > 0 || c.scoutingRecordsInWindow > 0).length,
              sub: 'Farmers or scouting in window',
              icon: MapPin,
            },
            {
              label: 'Highest pressure (records)',
              value: data.counties[0]?.county ?? '—',
              sub:
                data.counties[0]?.pestOfConcern != null
                  ? `Pest of concern: ${data.counties[0].pestOfConcern}`
                  : 'No pest signals in window',
              icon: Sprout,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-lg border p-5"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  {card.label}
                </p>
                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(27, 67, 50, 0.08)' }}>
                  <card.icon className="h-5 w-5" style={{ color: '#1B4332' }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </p>
              <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-3 sm:px-5"
          style={{ borderColor: '#E0DDD6' }}
        >
          <AlertTriangle className="h-5 w-5" style={{ color: '#B45309' }} />
          <div>
            <p className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              County table
            </p>
            <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Use this for group advisories (county / ward roll-out). Ward breakdown can be added once ward is
              captured consistently on farmer profiles.
            </p>
          </div>
        </div>
        <TableScroll>
          <table className="min-w-full text-left text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <thead style={{ backgroundColor: '#F7F4EF', color: '#1B4332' }}>
              <tr>
                <th className="px-4 py-3 font-semibold">County</th>
                <th className="px-4 py-3 font-semibold">Farmers</th>
                <th className="px-4 py-3 font-semibold">Records</th>
                <th className="px-4 py-3 font-semibold">Farmers scouting</th>
                <th className="px-4 py-3 font-semibold">Pest of concern</th>
                <th className="px-4 py-3 font-semibold">Danger</th>
              </tr>
            </thead>
            <tbody>
              {rowsForTable.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center" style={{ color: '#717182' }}>
                    No county rows match your filter.
                  </td>
                </tr>
              ) : (
                rowsForTable.map((row) => (
                  <tr key={row.county} className="border-t" style={{ borderColor: '#E0DDD6' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#1B4332' }}>
                      {row.county}
                    </td>
                    <td className="px-4 py-3">{row.farmerCount.toLocaleString()}</td>
                    <td className="px-4 py-3">{row.scoutingRecordsInWindow.toLocaleString()}</td>
                    <td className="px-4 py-3">{row.distinctFarmersWithScouting.toLocaleString()}</td>
                    <td className="px-4 py-3" style={{ color: '#374151' }}>
                      {row.pestOfConcern ?? '—'}
                    </td>
                    <td className="px-4 py-3">{dangerBadge(row.dangerLevel)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableScroll>
      </div>

      {!loading && data && filteredCounties.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredCounties.slice(0, 4).map((c) => (
            <div key={`detail-${c.county}`} className="rounded-lg border p-4" style={{ borderColor: '#E0DDD6' }}>
              <p className="text-sm font-semibold" style={{ color: '#1B4332' }}>
                {c.county} — top pests
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: '#4B5563' }}>
                {(c.topPests || []).slice(0, 5).map((p) => (
                  <li key={p.label}>
                    {p.label}{' '}
                    <span style={{ color: '#717182' }}>({p.recordCount} records)</span>
                  </li>
                ))}
                {(c.topPests || []).length === 0 ? <li style={{ color: '#717182' }}>No pest labels in window.</li> : null}
              </ul>
              <p className="mt-3 text-sm font-semibold" style={{ color: '#1B4332' }}>
                Top diseases
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm" style={{ color: '#4B5563' }}>
                {(c.topDiseases || []).slice(0, 5).map((d) => (
                  <li key={d.label}>
                    {d.label}{' '}
                    <span style={{ color: '#717182' }}>({d.recordCount} records)</span>
                  </li>
                ))}
                {(c.topDiseases || []).length === 0 ? (
                  <li style={{ color: '#717182' }}>No disease labels in window.</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
