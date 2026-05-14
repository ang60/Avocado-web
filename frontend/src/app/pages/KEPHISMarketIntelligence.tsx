import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Send, TrendingUp } from 'lucide-react';
import { createProductionVolume, dryRunBroadcast, fetchResolvedProduction, listBroadcastCampaigns, sendBroadcast } from '../api/realApi';
import type { BroadcastCampaign, ProductionResolvedRow } from '../api/types';
import { getApiErrorMessage } from '../api/errors';
import { listIebcCounties, listIebcWards, resolveIebcCounty } from '../data/iebcLocations';

function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

export function KEPHISMarketIntelligence() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [groupBy, setGroupBy] = useState<'county' | 'ward' | 'village'>('ward');

  const [resolved, setResolved] = useState<ProductionResolvedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prodCounty, setProdCounty] = useState('');
  const [prodWard, setProdWard] = useState('');
  const [prodVillage, setProdVillage] = useState('');
  const [tonnage, setTonnage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [broadcastCounty, setBroadcastCounty] = useState('');
  const [broadcastWard, setBroadcastWard] = useState('');
  const [broadcastVillage, setBroadcastVillage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastDryCount, setBroadcastDryCount] = useState<number | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);

  const countyOptions = useMemo(() => listIebcCounties(), []);
  const prodWardOptions = useMemo(() => listIebcWards(prodCounty), [prodCounty]);
  const broadcastWardOptions = useMemo(() => listIebcWards(broadcastCounty), [broadcastCounty]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchResolvedProduction({ year, month, group_by: groupBy })
      .then((rows) => {
        if (!cancelled) setResolved(rows);
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

  useEffect(() => {
    let cancelled = false;
    listBroadcastCampaigns()
      .then((rows) => {
        if (!cancelled) setCampaigns(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const totalTonnage = useMemo(
    () => resolved.reduce((acc, r) => acc + (Number(r.resolved_tonnage_mt) || 0), 0),
    [resolved]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ECFDF3' }}>
            <TrendingUp className="h-5 w-5" style={{ color: '#2D6A4F' }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Market Intelligence
            </h1>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Production forecasting and regional broadcasts (KEPHIS).
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
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="mt-1 w-full rounded-lg px-3 py-2 border"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {monthOptions().map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
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
              <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Resolved tonnage</div>
              <div className="text-lg font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {totalTonnage.toFixed(2)} mt
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Submit production volume
          </h2>
          <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            This creates a submission for the selected area and period.
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={prodCounty}
              onChange={(e) => {
                const c = e.target.value;
                setProdCounty(c);
                setProdWard('');
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
              value={prodWard}
              onChange={(e) => setProdWard(e.target.value)}
              disabled={!prodCounty}
              className="w-full rounded-lg px-3 py-2 border"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <option value="">{prodCounty ? 'Select ward' : 'Select county first'}</option>
              {prodWardOptions.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <input value={prodVillage} onChange={(e) => setProdVillage(e.target.value)} placeholder="Village (optional)"
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
                  county: resolveIebcCounty(prodCounty).trim(),
                  ward: prodWard.trim(),
                  village: prodVillage.trim(),
                  tonnage_mt: Number(tonnage),
                  notes,
                });
                const rows = await fetchResolvedProduction({ year, month, group_by: groupBy });
                setResolved(rows);
                setProdCounty('');
                setProdWard('');
                setProdVillage('');
                setTonnage('');
                setNotes('');
              } catch (e: unknown) {
                setError(getApiErrorMessage(e, 'Could not submit production volume.'));
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

        <div className="rounded-lg border p-5" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Regional SMS Broadcast
          </h2>
          <p className="text-xs mt-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Send an alert to all farmers in a County/Ward (Village optional).
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={broadcastCounty}
              onChange={(e) => {
                const c = e.target.value;
                setBroadcastCounty(c);
                setBroadcastWard('');
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
              value={broadcastWard}
              onChange={(e) => setBroadcastWard(e.target.value)}
              disabled={!broadcastCounty}
              className="w-full rounded-lg px-3 py-2 border"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <option value="">{broadcastCounty ? 'Select ward' : 'Select county first'}</option>
              {broadcastWardOptions.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <input value={broadcastVillage} onChange={(e) => setBroadcastVillage(e.target.value)} placeholder="Village (optional)"
              className="w-full rounded-lg px-3 py-2 border" style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }} />
          </div>
          <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Broadcast message…"
            className="mt-3 w-full rounded-lg px-3 py-2 border" rows={4}
            style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif' }} />

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              disabled={!broadcastMessage.trim() || broadcasting}
              onClick={async () => {
                try {
                  setBroadcasting(true);
                  const res = await dryRunBroadcast({ county: broadcastCounty, ward: broadcastWard, village: broadcastVillage, message: broadcastMessage });
                  setBroadcastDryCount(res.total_recipients);
                } catch (e: unknown) {
                  setError(getApiErrorMessage(e, 'Could not estimate recipients.'));
                } finally {
                  setBroadcasting(false);
                }
              }}
              className="rounded-lg px-4 py-2 border"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
            >
              Preview recipients
            </button>
            <div className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              {broadcastDryCount == null ? '—' : `${broadcastDryCount} recipients`}
            </div>
          </div>

          <button
            disabled={!broadcastMessage.trim() || broadcasting}
            onClick={async () => {
              setBroadcasting(true);
              setError(null);
              try {
                const created = await sendBroadcast({ county: broadcastCounty, ward: broadcastWard, village: broadcastVillage, message: broadcastMessage });
                setCampaigns((c) => [created, ...c].slice(0, 50));
                setBroadcastMessage('');
                setBroadcastDryCount(null);
              } catch (e: unknown) {
                setError(getApiErrorMessage(e, 'Could not send broadcast.'));
              } finally {
                setBroadcasting(false);
              }
            }}
            className="mt-4 w-full rounded-xl py-2.5 text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, #4fa36c, #3c8f5a)', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <Send className="h-4 w-4" />
            {broadcasting ? 'Sending…' : 'Send broadcast'}
          </button>
        </div>
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
              {resolved.map((r) => (
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
              {resolved.length === 0 ? (
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

      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
        <div className="px-5 py-4 border-b" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <h2 className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Recent broadcasts
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
              <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Area</th>
              <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Sent/Failed</th>
              <th className="px-5 py-3 text-left text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Message</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #E0DDD6' }}>
                <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                  {[c.county, c.ward, c.village].filter(Boolean).join(' / ') || '—'}
                </td>
                <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  {c.sent_count}/{c.failed_count}
                </td>
                <td className="px-5 py-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  {(c.message || '').slice(0, 80)}{(c.message || '').length > 80 ? '…' : ''}
                </td>
              </tr>
            ))}
            {campaigns.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-sm" colSpan={3} style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  No broadcasts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

