import { Eye, Phone, Smartphone } from 'lucide-react';
import { Link } from 'react-router';
import type { ScoutingFeedItem } from '../api/types';
import { OptimizedImage } from './OptimizedImage';
import { TableScroll } from './TableScroll';
import {
  beneficialSummaryLine,
  diseaseLabelsFromReport,
  diseaseMetaSummaryLine,
  farmSnapshotFromReport,
  gpsLineFromPayload,
  mobileBlockLineFromReport,
  pestRowsFromReport,
  splitGalleryUrls,
  trapUseRows,
} from '../utils/scoutingPayloadDisplay';

export type RecentScoutingReportsTableProps = {
  items: ScoutingFeedItem[];
  /** Max rows to render (most recent first — caller should pre-sort). */
  maxRows?: number;
  title?: string;
  subtitle?: string;
  /** Show footer link to full scouting reports page */
  showFullFeedLink?: boolean;
};

function reviewBadge(reviewed: ScoutingFeedItem['reviewed']) {
  if (reviewed === 'new') return { label: 'New', bg: '#FEE2E2', color: '#B91C1C' };
  if (reviewed === 'under-review') return { label: 'Under review', bg: '#FEF3C7', color: '#B45309' };
  return { label: 'Reviewed', bg: '#DCFCE7', color: '#166534' };
}

export function RecentScoutingReportsTable({
  items,
  maxRows = 10,
  title = 'Recent scouting reports',
  subtitle = 'Latest mobile and field submissions in your scope.',
  showFullFeedLink = true,
}: RecentScoutingReportsTableProps) {
  const rows = items.slice(0, maxRows);

  return (
    <div
      className="mb-4 overflow-hidden rounded-lg border sm:mb-5"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
    >
      <div
        className="flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
        style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
      >
        <div className="min-w-0">
          <h3 className="mb-0.5 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            {title}
          </h3>
          <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            {subtitle}
          </p>
        </div>
        {showFullFeedLink ? (
          <Link
            to="/scouting-reports"
            className="w-fit flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs sm:text-sm"
            style={{ borderColor: '#2D6A4F', color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif', fontWeight: 600 }}
          >
            Open full feed
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="p-6 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          No scouting submissions yet.
        </p>
      ) : (
        <TableScroll className="-mx-1 px-1 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[1560px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                {[
                  'Source',
                  'Farmer & location',
                  'Variety',
                  'Traps',
                  'Pests',
                  'Diseases',
                  'App farm & place',
                  'Beneficials',
                  'Disease / GPS',
                  'Actions',
                  'Outcome',
                  'Challenges',
                  'Protocol',
                  'Pushed',
                  'Finding',
                  'Thumb',
                  'Time',
                  'Status',
                  '',
                ].map((h) => (
                  <th
                    key={h || 'action'}
                    className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-4 sm:py-3 sm:text-xs"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => {
                const st = reviewBadge(item.reviewed);
                const thumb = splitGalleryUrls(item).images[0] || item.mediaPreview;
                const traps = trapUseRows(item);
                const trapLine = traps.length
                  ? traps.map((t) => `${t.type} (×${t.count}${t.avg ? `, avg ${t.avg}` : ''})`).join(' · ')
                  : null;
                const pestLine = pestRowsFromReport(item)
                  .map((p) => (p.perTrap ? `${p.name} (${p.perTrap}/trap)` : p.name))
                  .join(' · ');
                const diseaseLine = diseaseLabelsFromReport(item).join(' · ');
                const appBlock = mobileBlockLineFromReport(item);
                const snap = farmSnapshotFromReport(item);
                const appFarmLine = (snap.farmName || '').trim();
                const appLocLine = (snap.location || '').trim();
                const benLine = beneficialSummaryLine(item);
                const disGps = [diseaseMetaSummaryLine(item), gpsLineFromPayload(item)].filter(Boolean).join(' · ');
                const actionsLine = (item.actionsTakenList || []).join(' · ');
                const outcomeLine = (item.outcomeList || []).join(' · ');
                const challengesRaw = item.rawPayload?.other_production_challenges;
                const challengesLine = Array.isArray(challengesRaw)
                  ? challengesRaw.map((x) => String(x).trim()).filter(Boolean).join(' · ')
                  : '';
                const protocolLine = (item.managementProtocol || '').trim();
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: index !== rows.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                    className="hover:bg-slate-50/60"
                  >
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase sm:text-xs"
                        style={{
                          backgroundColor: item.source === 'app' ? '#E0F2FE' : '#FFFBEB',
                          color: item.source === 'app' ? '#0369A1' : '#B45309',
                          fontFamily: 'IBM Plex Sans, sans-serif',
                        }}
                      >
                        {item.source === 'app' ? (
                          <>
                            <Smartphone className="h-3 w-3" /> App
                          </>
                        ) : (
                          <>
                            <Phone className="h-3 w-3" /> USSD
                          </>
                        )}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-3 py-2 sm:px-4 sm:py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <div className="font-semibold">{item.farmerName}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        Block {item.blockId} · {item.county}
                      </div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        Holding: {item.farmName}
                      </div>
                      {appBlock ? (
                        <div className="mt-0.5 truncate text-xs" style={{ color: '#455A64' }} title={appBlock}>
                          App block: {appBlock}
                        </div>
                      ) : null}
                    </td>
                    <td
                      className="max-w-[88px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={item.variety || ''}
                    >
                      {item.variety ? <span className="line-clamp-2">{item.variety}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[120px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={trapLine || ''}
                    >
                      {trapLine ? <span className="line-clamp-3">{trapLine}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[120px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={pestLine}
                    >
                      {pestLine ? <span className="line-clamp-3">{pestLine}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[100px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={diseaseLine}
                    >
                      {diseaseLine ? <span className="line-clamp-2">{diseaseLine}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[120px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={[appFarmLine, appLocLine].filter(Boolean).join(' · ')}
                    >
                      {appFarmLine || appLocLine ? (
                        <>
                          {appFarmLine ? <div className="line-clamp-2 font-medium">{appFarmLine}</div> : null}
                          {appLocLine ? (
                            <div className="line-clamp-2 text-[11px]" style={{ color: '#717182' }}>
                              {appLocLine}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td
                      className="max-w-[100px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={benLine}
                    >
                      {benLine ? <span className="line-clamp-2">{benLine}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[120px] px-3 py-2 text-[11px] sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={disGps}
                    >
                      {disGps ? <span className="line-clamp-2 font-mono">{disGps}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[100px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={actionsLine}
                    >
                      {actionsLine ? <span className="line-clamp-2">{actionsLine}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[88px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={outcomeLine}
                    >
                      {outcomeLine ? <span className="line-clamp-2">{outcomeLine}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[100px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={challengesLine}
                    >
                      {challengesLine ? <span className="line-clamp-2">{challengesLine}</span> : '—'}
                    </td>
                    <td
                      className="max-w-[120px] px-3 py-2 text-xs sm:px-4 sm:py-3"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                      title={protocolLine}
                    >
                      {protocolLine ? <span className="line-clamp-2">{protocolLine}</span> : '—'}
                    </td>
                    <td className="px-3 py-2 text-center text-xs sm:px-4 sm:py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
                      {item.pushedToFarmer ? 'Yes' : '—'}
                    </td>
                    <td className="max-w-[200px] px-3 py-2 text-sm sm:px-4 sm:py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <span className="line-clamp-3" title={item.finding}>
                        {item.finding}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      <div
                        className="h-12 w-14 overflow-hidden rounded border bg-[#F7F4EF]"
                        style={{ borderColor: '#E0DDD6' }}
                      >
                        {thumb ? (
                          <OptimizedImage src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px]" style={{ color: '#94A3B8' }}>
                            —
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm sm:px-4 sm:py-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {item.timestamp}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: st.bg, color: st.color, fontFamily: 'IBM Plex Sans, sans-serif' }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3">
                      <Link
                        to={`/scouting-reports/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors hover:bg-[#F7F4EF]"
                        style={{ borderColor: '#2D6A4F', color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableScroll>
      )}
    </div>
  );
}
