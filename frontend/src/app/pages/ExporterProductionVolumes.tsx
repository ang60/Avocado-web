import { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { createProductionVolume, listProductionVolumes } from '../api/realApi';
import type { ProductionVolumeSubmission } from '../api/types';
import { getApiErrorMessage } from '../api/errors';
import { listIebcCounties, listIebcWards, resolveIebcCounty } from '../data/iebcLocations';

export function ExporterProductionVolumes() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState<ProductionVolumeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [county, setCounty] = useState('');
  const [ward, setWard] = useState('');
  const [village, setVillage] = useState('');
  const [tonnage, setTonnage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const countyOptions = useMemo(() => listIebcCounties(), []);
  const wardOptions = useMemo(() => listIebcWards(county), [county]);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await listProductionVolumes({ year, month });
      setRows(data);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Could not load submissions.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const total = useMemo(() => rows.reduce((acc, r) => acc + (Number(r.tonnage_mt) || 0), 0), [rows]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ECFDF3' }}>
            <TrendingUp className="h-5 w-5" style={{ color: '#2D6A4F' }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Production Volumes
            </h1>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Submit volumes by ward/county for your supply base.
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
          <div className="rounded-lg border p-3 flex items-center gap-3 md:col-span-2" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
            <BarChart3 className="h-5 w-5" style={{ color: '#2D6A4F' }} />
            <div>
              <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Your submissions total</div>
              <div className="text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {total.toFixed(2)} mt
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
        <h2 className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
          New submission
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={county}
            onChange={(e) => {
              setCounty(e.target.value);
              setWard('');
            }}
            className="w-full rounded-lg px-3 py-2 border"
            style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <option value="">Select county</option>
            {countyOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            disabled={!county}
            className="w-full rounded-lg px-3 py-2 border"
            style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <option value="">{county ? 'Select ward' : 'Select county first'}</option>
            {wardOptions.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Village (optional)"
            className="w-full rounded-lg px-3 py-2 border" style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }} />
          <input value={tonnage} onChange={(e) => setTonnage(e.target.value)} placeholder="Tonnage (mt)"
            className="w-full rounded-lg px-3 py-2 border" style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }} />
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
          className="mt-3 w-full rounded-lg px-3 py-2 border" rows={3}
          style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }} />

        {error ? (
          <div className="mt-3 rounded-md border px-3 py-2 text-xs" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {error}
          </div>
        ) : null}

        <button
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            setError(null);
            try {
              await createProductionVolume({
                year,
                month,
                county: resolveIebcCounty(county).trim(),
                ward: ward.trim(),
                village: village.trim(),
                tonnage_mt: Number(tonnage),
                notes,
              });
              setCounty('');
              setWard('');
              setVillage('');
              setTonnage('');
              setNotes('');
              await reload();
            } catch (e: unknown) {
              setError(getApiErrorMessage(e, 'Could not submit volume.'));
            } finally {
              setSubmitting(false);
            }
          }}
          className="mt-4 w-full rounded-xl py-2.5 text-white transition disabled:opacity-60"
          style={{ background: 'linear-gradient(90deg, #4fa36c, #3c8f5a)', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
        <div className="px-5 py-4 border-b" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Your submissions
          </h2>
        </div>
        {loading ? (
          <div className="p-5 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Area</th>
                <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Tonnage</th>
                <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #E0DDD6' }}>
                  <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {[r.county, r.ward, r.village].filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {Number(r.tonnage_mt).toFixed(2)} mt
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {r.status}
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

