import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { fetchResolvedProduction } from '../api/realApi';
import type { ProductionResolvedRow } from '../api/types';
import { getApiErrorMessage } from '../api/errors';

export function HCDAMarketIntelligence() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [groupBy, setGroupBy] = useState<'county' | 'ward' | 'village'>('county');
  const [rows, setRows] = useState<ProductionResolvedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchResolvedProduction({ year, month, group_by: groupBy })
      .then((r) => {
        if (!cancelled) setRows(r);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load production overview.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month, groupBy]);

  const total = useMemo(() => rows.reduce((acc, r) => acc + (Number(r.resolved_tonnage_mt) || 0), 0), [rows]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ECFDF3' }}>
            <TrendingUp className="h-5 w-5" style={{ color: '#2D6A4F' }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Market Intelligence (HCDA)
            </h1>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Census-style production overview by region.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Year</label>
            <input
              value={year}
              onChange={(e) => setYear(Number(e.target.value || now.getFullYear()))}
              type="number"
              className="mt-1 w-full rounded-lg px-3 py-2 border"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
            />
          </div>
          <div>
            <label className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Month</label>
            <input
              value={month}
              onChange={(e) => setMonth(Number(e.target.value || now.getMonth() + 1))}
              type="number"
              min={1}
              max={12}
              className="mt-1 w-full rounded-lg px-3 py-2 border"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
            />
          </div>
          <div>
            <label className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Group by</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="mt-1 w-full rounded-lg px-3 py-2 border"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <option value="county">County</option>
              <option value="ward">Ward</option>
              <option value="village">Village</option>
            </select>
          </div>
          <div className="rounded-lg border p-3 flex items-center gap-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
            <BarChart3 className="h-5 w-5" style={{ color: '#2D6A4F' }} />
            <div>
              <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Total tonnage</div>
              <div className="text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {total.toFixed(2)} mt
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-md border px-3 py-2 text-xs" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
        <div className="px-5 py-4 border-b" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Resolved production volumes
          </h2>
        </div>
        {loading ? (
          <div className="p-5 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Area</th>
                <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Tonnage (mt)</th>
                <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Resolved from</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key.join('|')} style={{ borderBottom: '1px solid #E0DDD6' }}>
                  <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {r.key.filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {Number(r.resolved_tonnage_mt).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {r.resolved_from} ({r.status})
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-sm" colSpan={3} style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    No submissions yet for this period.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

