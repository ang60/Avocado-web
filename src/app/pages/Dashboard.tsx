import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, MapPin, Clock, Users, FileText, Eye } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KenyaHeatMap } from '../components/KenyaHeatMap';
import { TriageCaseModal } from '../components/TriageCaseModal';
import { ScoutingRecordModal } from '../components/ScoutingRecordModal';
import { useState, useEffect } from 'react';
import { fetchDashboard } from '../api/placeholderApi';
import { useIsNarrowPhone } from '../hooks/useMediaQuery';
import { TableScroll } from '../components/TableScroll';
import type { DashboardPayload } from '../api/types';

const METRIC_ICONS = {
  activity: Activity,
  alert: AlertTriangle,
  check: CheckCircle,
  clock: Clock,
} as const;

export function Dashboard() {
  const narrowPhone = useIsNarrowPhone();
  const chartHeight = narrowPhone ? 220 : 280;
  const pieOuterRadius = narrowPhone ? 62 : 90;
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTriageCase, setSelectedTriageCase] = useState(null);
  const [selectedScoutingRecord, setSelectedScoutingRecord] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load dashboard data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <>
        <div className="p-8 rounded-lg border text-center" style={{ borderColor: '#E0DDD6' }}>
          <p style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>{loadError}</p>
          <p className="text-sm mt-2" style={{ color: '#717182' }}>
            Using placeholder API — check console or run again.
          </p>
        </div>
      </>
    );
  }

  if (loading || !data) {
    return (
      <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-lg" />
        </div>
      </>
    );
  }

  const {
    metrics,
    weeklyComplianceData,
    weeklyTrends,
    pestDistribution,
    triageQueue,
    recentScoutingRecords,
    complianceSummary,
    todayLabel,
  } = data;

  return (
    <>
      <header className="mb-4 md:mb-5">
        <h1 
          className="mb-1 text-2xl sm:text-3xl" 
          style={{ 
            fontFamily: 'DM Serif Display, serif',
            color: '#1B4332'
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Real-time overview of avocado pest and disease monitoring across Kenya
        </p>
      </header>

      {/* Key Metrics (placeholder API) */}
      <div className="mb-4 grid min-w-0 max-w-full grid-cols-2 gap-3 sm:mb-5 sm:gap-4 lg:grid-cols-4 lg:gap-6 [&>*]:min-w-0">
        {metrics.map((m) => {
          const Icon = METRIC_ICONS[m.icon];
          return (
            <div
              key={m.label}
              className="rounded-lg border p-3 sm:p-4 md:p-6"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="mb-2 flex items-start justify-between gap-2 sm:mb-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {m.label}
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                    {m.value}
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12"
                  style={{ backgroundColor: m.iconBg }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: m.iconColor }} />
                </div>
              </div>
              {m.sublabel ? (
                <div className="flex items-center gap-1 text-sm">
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>{m.sublabel}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm">
                  {m.trendUp ? (
                    <TrendingUp className="w-4 h-4" style={{ color: '#74C69D' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4" style={{ color: '#74C69D' }} />
                  )}
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#74C69D' }}>
                    {m.trendPercent}%
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>{m.trendVs}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Weekly Compliance & Area Risk Map */}
      <div className="mb-4 grid min-w-0 max-w-full grid-cols-1 gap-4 sm:mb-5 lg:grid-cols-2 lg:gap-6 [&>*]:min-w-0">
        {/* Weekly Scouting Compliance */}
        <div 
          className="min-w-0 rounded-lg border p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="mb-2 sm:mb-4">
            <h3 className="mb-1 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Weekly Scouting Compliance
            </h3>
            <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Target: {complianceSummary.target}% | Current: {complianceSummary.current}%
            </p>
          </div>
          <div className="min-h-[220px] w-full min-w-0 sm:min-h-[280px]">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={weeklyComplianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD6" />
              <XAxis 
                dataKey="week" 
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px' }}
                tick={{ fill: '#717182' }}
              />
              <YAxis 
                domain={[80, 100]} 
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px' }}
                tick={{ fill: '#717182' }}
              />
              <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: '8px' }} />
              <Line key="compliance-line" type="monotone" dataKey="compliance" stroke="#2D6A4F" strokeWidth={3} name="Compliance %" dot={{ fill: '#2D6A4F', r: 4 }} />
              <Line key="target-line" type="monotone" dataKey="target" stroke="#D97706" strokeWidth={2} strokeDasharray="5 5" name="Target %" />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Area Risk Monitoring - Kenya Heat Map */}
        <div 
          className="min-w-0 rounded-lg border p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="mb-2 sm:mb-4">
            <h3 className="mb-1 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Area Risk Monitoring
            </h3>
            <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Hover over counties for detailed information
            </p>
          </div>
          <KenyaHeatMap />
        </div>
      </div>

      {/* Agronomist Triage Queue */}
      <div 
        className="mb-4 overflow-hidden rounded-lg border sm:mb-5"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <div className="flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <div className="min-w-0">
            <h3 className="mb-0.5 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Agronomist Triage Queue
            </h3>
            <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              High-priority cases requiring immediate review
            </p>
          </div>
          <div 
            className="w-fit flex-shrink-0 rounded-full px-3 py-1 text-xs sm:text-sm"
            style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            {triageQueue.length} pending
          </div>
        </div>
        
        <TableScroll className="-mx-1 px-1 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Case ID
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Farm / Location
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Severity
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Issue
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Scout
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Wait Time
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {triageQueue.map((item, index) => (
                <tr 
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  style={{ borderBottom: index !== triageQueue.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ 
                        backgroundColor: item.priority === 1 ? '#DC2626' : item.priority === 2 ? '#D97706' : '#FBBF24',
                        color: '#FFFFFF',
                        fontFamily: 'DM Serif Display, serif',
                      }}
                    >
                      {item.priority}
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    {item.id}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    <div>
                      <div>{item.farm}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        {item.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: item.severity === 'high' ? '#FEE2E2' : '#FEF3C7',
                        color: item.severity === 'high' ? '#DC2626' : '#D97706',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {item.pest}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {item.scout}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: item.submittedHours > 6 ? '#DC2626' : '#717182' 
                      }}
                    >
                      {item.submittedHours}h
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <button
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: '#74C69D20',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                      onClick={() => setSelectedTriageCase(item)}
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

      {/* Recent Scouting Records */}
      <div 
        className="mb-4 overflow-hidden rounded-lg border sm:mb-5"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <div className="flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <div className="min-w-0">
            <h3 className="mb-0.5 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Recent Scouting Records
            </h3>
            <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Latest field inspections and reports
            </p>
          </div>
          <div 
            className="w-fit flex-shrink-0 rounded px-3 py-1 text-xs sm:text-sm"
            style={{ backgroundColor: '#74C69D20', color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            Today: {recentScoutingRecords.filter((r) => r.date === todayLabel).length} reports
          </div>
        </div>
        
        <TableScroll className="-mx-1 px-1 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Record ID
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Scout
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Farm / Location
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Date & Time
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Blocks
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Issues Found
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Status
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider sm:px-6 sm:py-4 sm:text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentScoutingRecords.map((record, index) => (
                <tr 
                  key={record.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  style={{ borderBottom: index !== recentScoutingRecords.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    {record.id}
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
                  <td className="px-3 py-2 sm:px-6 sm:py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {record.blocksInspected}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
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
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: '#74C69D20',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      Completed
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <button
                      className="px-3 py-1 rounded-full text-xs"
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

      {/* Charts Row 2: Case Trends & Pest Distribution */}
      <div className="mb-4 grid grid-cols-1 gap-4 min-w-0 sm:mb-5 md:grid-cols-2 md:gap-6">
        {/* Case Trends */}
        <div 
          className="min-w-0 rounded-lg border p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <h3 className="mb-2 text-sm sm:mb-4 sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Case Trends (Last 8 Weeks)
          </h3>
          <div className="min-h-[220px] w-full min-w-0 sm:min-h-[280px]">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD6" />
              <XAxis 
                dataKey="week" 
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px' }}
                tick={{ fill: '#717182' }}
              />
              <YAxis 
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px' }}
                tick={{ fill: '#717182' }}
              />
              <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: '8px' }} />
              <Area key="cases-area" type="monotone" dataKey="cases" stackId="1" stroke="#DC2626" fill="#FEE2E2" name="New Cases" />
              <Area key="resolved-area" type="monotone" dataKey="resolved" stackId="2" stroke="#2D6A4F" fill="#74C69D" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Pest Distribution */}
        <div 
          className="min-w-0 rounded-lg border p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <h3 className="mb-2 text-sm sm:mb-4 sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Pest & Disease Distribution
          </h3>
          <div className="min-h-[220px] w-full min-w-0 sm:min-h-[280px]">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={pestDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={narrowPhone ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={pieOuterRadius}
                fill="#8884d8"
                dataKey="value"
              >
                {pestDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TriageCaseModal 
        caseData={selectedTriageCase}
        onClose={() => setSelectedTriageCase(null)}
      />
      
      <ScoutingRecordModal 
        recordData={selectedScoutingRecord}
        onClose={() => setSelectedScoutingRecord(null)}
      />
    </>
  );
}