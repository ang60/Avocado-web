import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, ShieldAlert } from 'lucide-react';
import { fetchKephisAlerts, type KephisAlertRow } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';
import { TableScroll } from '../components/TableScroll';

export function KEPHISAlerts() {
  const [rows, setRows] = useState<KephisAlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchKephisAlerts()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load KEPHIS alerts.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const criticalCount = useMemo(() => rows.filter((r) => r.severity === 'critical').length, [rows]);
  const warningCount = useMemo(() => rows.filter((r) => r.severity === 'warning').length, [rows]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1
          className="mb-1"
          style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)', color: '#1B4332' }}
        >
          KEPHIS Alerts
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '16px', color: '#717182', margin: 0 }}>
          Real-time threshold and outbreak notifications
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border-2 p-5" style={{ borderColor: '#C0392B', backgroundColor: '#FFFFFF' }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Critical Alerts</span>
            <ShieldAlert className="h-5 w-5" style={{ color: '#C0392B' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#C0392B' }}>{criticalCount}</p>
        </div>
        <div className="rounded-lg border-2 p-5" style={{ borderColor: '#F39C12', backgroundColor: '#FFFFFF' }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Warning Alerts</span>
            <AlertTriangle className="h-5 w-5" style={{ color: '#F39C12' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#F39C12' }}>{warningCount}</p>
        </div>
        <div className="rounded-lg border-2 p-5" style={{ borderColor: '#2D6A4F', backgroundColor: '#FFFFFF' }}>
          <div className="mb-2 flex items-center justify-between">
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Total Active Alerts</span>
            <Bell className="h-5 w-5" style={{ color: '#2D6A4F' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: '#2D6A4F' }}>{rows.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
        <TableScroll>
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '2px solid #E0DDD6' }}>
                {['Severity', 'Block', 'Farm', 'County', 'Pest', 'Capture Rate', 'Threshold', 'Status', 'Inspector'].map((h) => (
                  <th
                    key={h}
                    className="p-3 text-left text-xs font-semibold uppercase"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #E0DDD6', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FCFBF8' }}>
                  <td className="p-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: row.severity === 'critical' ? '#C0392B' : '#F39C12',
                        color: '#FFFFFF',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                      }}
                    >
                      {row.severity === 'critical' ? 'Critical' : 'Warning'}
                    </span>
                  </td>
                  <td className="p-3" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}>{row.blockId}</td>
                  <td className="p-3">{row.farmName}</td>
                  <td className="p-3">{row.county}</td>
                  <td className="p-3">{row.pestType}</td>
                  <td className="p-3" style={{ color: '#C0392B', fontWeight: 600 }}>{row.captureRate.toFixed(1)}</td>
                  <td className="p-3">{row.threshold.toFixed(1)}</td>
                  <td className="p-3">{row.kephisStatus}</td>
                  <td className="p-3">{row.inspector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        {loading ? <p className="p-4 text-sm" style={{ color: '#717182' }}>Loading alerts...</p> : null}
        {!loading && error ? <p className="p-4 text-sm" style={{ color: '#b45309' }}>{error}</p> : null}
        {!loading && !error && rows.length === 0 ? (
          <p className="p-6 text-sm" style={{ color: '#717182' }}>No active alerts right now.</p>
        ) : null}
      </div>
    </div>
  );
}
