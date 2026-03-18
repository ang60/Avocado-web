import { Layout } from '../components/Layout';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, MapPin, Clock, Users, FileText, Eye } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KenyaHeatMap } from '../components/KenyaHeatMap';
import { TriageCaseModal } from '../components/TriageCaseModal';
import { ScoutingRecordModal } from '../components/ScoutingRecordModal';
import { useState, useEffect } from 'react';
import { fetchDashboard } from '../api/placeholderApi';
import type { DashboardPayload } from '../api/types';

const METRIC_ICONS = {
  activity: Activity,
  alert: AlertTriangle,
  check: CheckCircle,
  clock: Clock,
} as const;

export function Dashboard() {
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
      <Layout>
        <div className="p-8 rounded-lg border text-center" style={{ borderColor: '#E0DDD6' }}>
          <p style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>{loadError}</p>
          <p className="text-sm mt-2" style={{ color: '#717182' }}>
            Using placeholder API — check console or run again.
          </p>
        </div>
      </Layout>
    );
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-lg" />
        </div>
      </Layout>
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
    <Layout>
      <header className="mb-8">
        <h1 
          className="text-4xl mb-2" 
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 min-w-0 max-w-full [&>*]:min-w-0">
        {metrics.map((m) => {
          const Icon = METRIC_ICONS[m.icon];
          return (
            <div
              key={m.label}
              className="p-6 rounded-lg border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {m.label}
                  </p>
                  <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                    {m.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: m.iconBg }}
                >
                  <Icon className="w-6 h-6" style={{ color: m.iconColor }} />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 min-w-0 max-w-full [&>*]:min-w-0">
        {/* Weekly Scouting Compliance */}
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="mb-4">
            <h3 className="mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Weekly Scouting Compliance
            </h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Target: {complianceSummary.target}% | Current: {complianceSummary.current}%
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
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

        {/* Area Risk Monitoring - Kenya Heat Map */}
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="mb-4">
            <h3 className="mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Area Risk Monitoring
            </h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Hover over counties for detailed information
            </p>
          </div>
          <KenyaHeatMap />
        </div>
      </div>

      {/* Agronomist Triage Queue */}
      <div 
        className="rounded-lg border overflow-hidden mb-8"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <div>
            <h3 className="mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Agronomist Triage Queue
            </h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              High-priority cases requiring immediate review
            </p>
          </div>
          <div 
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: '#FEE2E2', color: '#DC2626', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            {triageQueue.length} pending
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Priority
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Case ID
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Farm / Location
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Severity
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Issue
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Scout
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Wait Time
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
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
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    {item.id}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    <div>
                      <div>{item.farm}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        {item.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {item.pest}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {item.scout}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: item.submittedHours > 6 ? '#DC2626' : '#717182' 
                      }}
                    >
                      {item.submittedHours}h
                    </span>
                  </td>
                  <td className="px-6 py-4">
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
        </div>
      </div>

      {/* Recent Scouting Records */}
      <div 
        className="rounded-lg border overflow-hidden mb-8"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <div>
            <h3 className="mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Recent Scouting Records
            </h3>
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Latest field inspections and reports
            </p>
          </div>
          <div 
            className="px-3 py-1 rounded"
            style={{ backgroundColor: '#74C69D20', color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            Today: {recentScoutingRecords.filter((r) => r.date === todayLabel).length} reports
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Record ID
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Scout
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Farm / Location
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Date & Time
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Blocks
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Issues Found
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
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
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    {record.id}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {record.scout}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    <div>
                      <div>{record.farm}</div>
                      <div className="text-xs" style={{ color: '#717182' }}>
                        {record.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    <div>
                      <div>{record.date}</div>
                      <div className="text-xs">{record.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {record.blocksInspected}
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
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
        </div>
      </div>

      {/* Charts Row 2: Case Trends & Pest Distribution */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Case Trends */}
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Case Trends (Last 8 Weeks)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
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

        {/* Pest Distribution */}
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Pest & Disease Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pestDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
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

      {/* Modals */}
      <TriageCaseModal 
        caseData={selectedTriageCase}
        onClose={() => setSelectedTriageCase(null)}
      />
      
      <ScoutingRecordModal 
        recordData={selectedScoutingRecord}
        onClose={() => setSelectedScoutingRecord(null)}
      />
    </Layout>
  );
}