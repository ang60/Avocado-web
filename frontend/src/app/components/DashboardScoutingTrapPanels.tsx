import { useState } from 'react';
import { TableScroll } from './TableScroll';
import { ScoutingRecordModal } from './ScoutingRecordModal';
import type { RecentScoutingRecord, RecentTrapActivityRow } from '../api/types';

export type DashboardScoutingTrapPanelsProps = {
  recentScoutingRecords: RecentScoutingRecord[];
  recentTrapActivity?: RecentTrapActivityRow[];
  todayDateKey?: string;
  /** Optional subtitle under "Recent Scouting Records" */
  description?: string;
};

function scoutingStatusLabel(record: RecentScoutingRecord) {
  if (record.source === 'mobile_app') {
    return record.issuesFound > 0 ? 'Flagged' : 'Clear';
  }
  if (record.status === 'detected') return 'Detected';
  return 'Clean';
}

function ellipsize(s: string | undefined, max: number): string {
  const t = (s ?? '').trim();
  if (!t) return '—';
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export function DashboardScoutingTrapPanels({
  recentScoutingRecords,
  recentTrapActivity = [],
  todayDateKey,
  description = 'Field registry and smartphone weekly scouting (merged by recency)',
}: DashboardScoutingTrapPanelsProps) {
  const [selectedScoutingRecord, setSelectedScoutingRecord] = useState<RecentScoutingRecord | null>(null);
  const todayReportsCount = recentScoutingRecords.filter((r) => r.date === (todayDateKey || '')).length;

  return (
    <>
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
              Recent Scouting Records
            </h3>
            <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              {description}
            </p>
          </div>
          <div
            className="w-fit flex-shrink-0 rounded px-3 py-1 text-xs sm:text-sm"
            style={{ backgroundColor: '#74C69D20', color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            Today: {todayReportsCount} reports
          </div>
        </div>

        <TableScroll className="-mx-1 px-1 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[1420px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                {[
                  'Source',
                  'Record ID',
                  'Scout',
                  'Farm / Location',
                  'Date & Time',
                  'Block',
                  'Variety',
                  'Traps',
                  'Pests',
                  'Diseases',
                  'App farm & place',
                  'Beneficials',
                  'Disease context / GPS',
                  'Summary',
                  'Issues',
                  'Status',
                  'Action',
                ].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentScoutingRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50/50"
                  style={{ borderBottom: index !== recentScoutingRecords.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide sm:text-xs"
                      style={{
                        backgroundColor: (record.source || 'registry') === 'mobile_app' ? '#E0F2FE' : '#F7F4EF',
                        color: (record.source || 'registry') === 'mobile_app' ? '#0369A1' : '#1B4332',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                      }}
                    >
                      {(record.source || 'registry') === 'mobile_app' ? 'App' : 'Registry'}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    {record.recordCode || record.id}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {record.scout}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    <div>
                      <div>{record.farm}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        {record.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    <div>
                      <div>{record.date}</div>
                      <div className="text-xs">{record.time}</div>
                    </div>
                  </td>
                  <td
                    className="max-w-[160px] px-3 py-2 text-sm sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                    title={[record.blockName, record.mobileBlockLine].filter(Boolean).join(' · ')}
                  >
                    <div className="truncate">{record.blockName || '—'}</div>
                    {record.mobileBlockLine ? (
                      <div className="truncate text-xs" style={{ color: '#717182' }} title={record.mobileBlockLine}>
                        App: {ellipsize(record.mobileBlockLine, 48)}
                      </div>
                    ) : null}
                  </td>
                  <td
                    className="max-w-[100px] px-3 py-2 text-xs sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={record.variety}
                  >
                    {ellipsize(record.variety, 36)}
                  </td>
                  <td
                    className="max-w-[140px] px-3 py-2 text-xs sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={record.trapSummary}
                  >
                    {ellipsize(record.trapSummary, 56)}
                  </td>
                  <td
                    className="max-w-[140px] px-3 py-2 text-xs sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={record.pestSummary}
                  >
                    {ellipsize(record.pestSummary, 56)}
                  </td>
                  <td
                    className="max-w-[120px] px-3 py-2 text-xs sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={record.diseaseSummary}
                  >
                    {ellipsize(record.diseaseSummary, 48)}
                  </td>
                  <td
                    className="max-w-[140px] px-3 py-2 text-xs sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={[record.farmNameAsSubmitted, record.submissionLocation].filter(Boolean).join(' · ')}
                  >
                    {record.farmNameAsSubmitted ? (
                      <div className="truncate" title={record.farmNameAsSubmitted}>
                        {ellipsize(record.farmNameAsSubmitted, 44)}
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: '#94A3B8' }}>
                        —
                      </div>
                    )}
                    {record.submissionLocation ? (
                      <div className="truncate text-xs" style={{ color: '#717182' }} title={record.submissionLocation}>
                        {ellipsize(record.submissionLocation, 40)}
                      </div>
                    ) : null}
                  </td>
                  <td
                    className="max-w-[120px] px-3 py-2 text-xs sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={record.beneficialSummary}
                  >
                    {ellipsize(record.beneficialSummary, 52)}
                  </td>
                  <td
                    className="max-w-[140px] px-3 py-2 text-xs sm:px-6 sm:py-4"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={[record.diseaseMetaSummary, record.gpsSummary].filter(Boolean).join(' · ')}
                  >
                    {record.diseaseMetaSummary ? (
                      <div className="line-clamp-2" title={record.diseaseMetaSummary}>
                        {record.diseaseMetaSummary}
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: '#94A3B8' }}>
                        —
                      </div>
                    )}
                    {record.gpsSummary ? (
                      <div className="mt-0.5 truncate font-mono text-[10px]" style={{ color: '#64748b' }} title={record.gpsSummary}>
                        {ellipsize(record.gpsSummary, 36)}
                      </div>
                    ) : null}
                  </td>
                  <td
                    className="max-w-[200px] px-3 py-2 text-xs sm:px-6 sm:py-4 sm:text-sm"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
                    title={record.findingSummary}
                  >
                    {ellipsize(record.findingSummary, 72)}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <span
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        backgroundColor: record.issuesFound > 0 ? '#FEF3C7' : '#74C69D20',
                        color: record.issuesFound > 0 ? '#D97706' : '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {record.issuesFound}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <span
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        backgroundColor: '#74C69D20',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {scoutingStatusLabel(record)}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <button
                      type="button"
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        backgroundColor: '#74C69D20',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                      onClick={() => setSelectedScoutingRecord(record)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </div>

      {recentTrapActivity.length > 0 ? (
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
                Trap activity (mobile)
              </h3>
              <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Latest trap checks logged from the farmer app
              </p>
            </div>
          </div>
          <TableScroll className="-mx-1 px-1 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                  {['Trap', 'Count', 'Farm / County', 'Logged'].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrapActivity.map((row, index) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: index !== recentTrapActivity.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                  >
                    <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      {row.trapName}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
                      {row.numberOfTraps}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                      <div>{row.farm}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        {row.county || row.location}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {row.date} {row.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </div>
      ) : null}

      <ScoutingRecordModal recordData={selectedScoutingRecord} onClose={() => setSelectedScoutingRecord(null)} />
    </>
  );
}
