import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, CheckCircle, Microscope } from 'lucide-react';
import { TableScroll } from '../components/TableScroll';
import { getApiErrorMessage } from '../api/errors';
import {
  fetchScoutingBlockOverview,
  fetchScoutingFeed,
  openKephisExportCsv,
  type ScoutingBlockOverviewRow,
} from '../api/realApi';
import type { ScoutingFeedItem } from '../api/types';

export function AgronomistReports() {
  const [feed, setFeed] = useState<ScoutingFeedItem[]>([]);
  const [blocks, setBlocks] = useState<ScoutingBlockOverviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchScoutingFeed(), fetchScoutingBlockOverview()])
      .then(([f, b]) => {
        if (cancelled) return;
        setFeed(f);
        setBlocks(b);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load reports.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const detected = feed.filter((r) => r.status === 'detected').length;
    const clean = feed.filter((r) => r.status === 'clean').length;
    const high = blocks.filter((b) => b.severity === 'high').length;
    return { totalReports: feed.length, detected, clean, highRiskBlocks: high, blocksTracked: blocks.length };
  }, [feed, blocks]);

  return (
    <div className="w-full">
      <header className="mb-4 md:mb-5">
        <h1 className="mb-1 text-2xl sm:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Agronomist Reports
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Scouting summaries and exportable regulatory views for your portfolio.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Scouting reports', value: summary.totalReports, icon: FileText, color: '#1B4332' },
          { label: 'Detections', value: summary.detected, icon: Microscope, color: '#D97706' },
          { label: 'Clean reports', value: summary.clean, icon: CheckCircle, color: '#2D6A4F' },
          { label: 'Blocks tracked', value: summary.blocksTracked, icon: FileText, color: '#717182' },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                {c.label}
              </p>
              <c.icon className="h-4 w-4" style={{ color: c.color }} />
            </div>
            <p className="text-2xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
        <h2 className="mb-2 text-lg" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
          Exports
        </h2>
        <p className="mb-3 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Download quarantine status (CSV) for blocks under national oversight.
        </p>
        <button
          type="button"
          onClick={openKephisExportCsv}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
          style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          <Download className="h-4 w-4" />
          Quarantine export (CSV)
        </button>
      </div>

      {loading ? (
        <div className="p-8 rounded-lg border" style={{ borderColor: '#E0DDD6' }}>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading report data…</p>
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border p-4" style={{ borderColor: '#D97706', backgroundColor: '#FFFBEB' }}>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#92400E' }}>{error}</p>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#FFFFFF' }}>
          <div className="border-b px-4 py-3" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
            <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Block scouting overview</h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Latest status per farm block ({summary.highRiskBlocks} high-severity)
            </p>
          </div>
          <TableScroll>
            <table className="w-full min-w-[880px]">
              <thead>
                <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                  {['Farmer', 'Block', 'County', 'Last scouted', 'Finding', 'Status', 'Severity'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase" style={{ color: '#717182' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blocks.map((row) => (
                  <tr key={`${row.block_id}-${row.farmer_id}`} style={{ borderBottom: '1px solid #E0DDD6' }}>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      {row.farmer_name}
                    </td>
                    <td className="px-4 py-3" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}>
                      {row.block_name}
                    </td>
                    <td className="px-4 py-3">{row.county}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#717182' }}>
                      {row.last_scouted_at ? new Date(row.last_scouted_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">{row.latest_finding || '—'}</td>
                    <td className="px-4 py-3 text-sm">{row.status}</td>
                    <td className="px-4 py-3 text-sm">{row.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
          {blocks.length === 0 ? (
            <p className="p-6 text-center text-sm" style={{ color: '#717182' }}>
              No block overview rows returned.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
