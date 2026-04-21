import { Layout } from '../components/Layout';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, MapPin, Clock, Users, FileText, Eye } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KenyaHeatMap } from '../components/KenyaHeatMap';
import { TriageCaseModal } from '../components/TriageCaseModal';
import { ScoutingRecordModal } from '../components/ScoutingRecordModal';
import { useState } from 'react';

const weeklyTrends = [
  { week: 'Week 1', cases: 12, resolved: 8 },
  { week: 'Week 2', cases: 15, resolved: 11 },
  { week: 'Week 3', cases: 18, resolved: 14 },
  { week: 'Week 4', cases: 22, resolved: 16 },
  { week: 'Week 5', cases: 19, resolved: 18 },
  { week: 'Week 6', cases: 25, resolved: 20 },
  { week: 'Week 7', cases: 28, resolved: 22 },
  { week: 'Week 8', cases: 24, resolved: 21 },
];

const weeklyComplianceData = [
  { week: 'Week 1', compliance: 92, target: 95 },
  { week: 'Week 2', compliance: 88, target: 95 },
  { week: 'Week 3', compliance: 94, target: 95 },
  { week: 'Week 4', compliance: 91, target: 95 },
  { week: 'Week 5', compliance: 96, target: 95 },
  { week: 'Week 6', compliance: 89, target: 95 },
  { week: 'Week 7', compliance: 93, target: 95 },
  { week: 'Week 8', compliance: 95, target: 95 },
];

const pestDistribution = [
  { name: 'Avocado Thrips', value: 145, color: '#DC2626' },
  { name: 'Phytophthora Root Rot', value: 98, color: '#D97706' },
  { name: 'Persea Mite', value: 76, color: '#2D6A4F' },
  { name: 'Anthracnose', value: 54, color: '#74C69D' },
  { name: 'Other', value: 42, color: '#E0DDD6' },
];

const triageQueue = [
  {
    id: 'CSE-1024',
    farm: 'Kangema Avocado Growers',
    location: 'Murang\'a County',
    severity: 'high',
    pest: 'Avocado Thrips',
    scout: 'Jane Wambui',
    submittedHours: 2,
    priority: 1,
  },
  {
    id: 'CSE-1020',
    farm: 'Kiambu Highland Farms',
    location: 'Kiambu County',
    severity: 'high',
    pest: 'Anthracnose',
    scout: 'Grace Achieng',
    submittedHours: 4,
    priority: 2,
  },
  {
    id: 'CSE-1023',
    farm: 'Gatanga Green Farms',
    location: 'Murang\'a County',
    severity: 'high',
    pest: 'Root Rot',
    scout: 'Samuel Omondi',
    submittedHours: 8,
    priority: 3,
  },
  {
    id: 'CSE-1022',
    farm: 'Tigoni Avocado Estates',
    location: 'Kiambu County',
    severity: 'medium',
    pest: 'Persea Mite',
    scout: 'Mary Akinyi',
    submittedHours: 12,
    priority: 4,
  },
];

const recentScoutingRecords = [
  {
    id: 'SCT-2045',
    scout: 'Jane Wambui',
    farm: 'Kangema Avocado Growers',
    location: 'Murang\'a County',
    date: 'Mar 15, 2026',
    time: '14:30',
    blocksInspected: 3,
    issuesFound: 2,
    status: 'completed',
  },
  {
    id: 'SCT-2044',
    scout: 'Peter Mwangi',
    farm: 'Nyeri Valley Growers',
    location: 'Nyeri County',
    date: 'Mar 15, 2026',
    time: '12:15',
    blocksInspected: 2,
    issuesFound: 0,
    status: 'completed',
  },
  {
    id: 'SCT-2043',
    scout: 'Grace Achieng',
    farm: 'Kiambu Highland Farms',
    location: 'Kiambu County',
    date: 'Mar 15, 2026',
    time: '10:45',
    blocksInspected: 4,
    issuesFound: 3,
    status: 'completed',
  },
  {
    id: 'SCT-2042',
    scout: 'Samuel Omondi',
    farm: 'Gatanga Green Farms',
    location: 'Murang\'a County',
    date: 'Mar 15, 2026',
    time: '09:20',
    blocksInspected: 2,
    issuesFound: 1,
    status: 'completed',
  },
  {
    id: 'SCT-2041',
    scout: 'Mary Akinyi',
    farm: 'Tigoni Avocado Estates',
    location: 'Kiambu County',
    date: 'Mar 14, 2026',
    time: '16:00',
    blocksInspected: 5,
    issuesFound: 2,
    status: 'completed',
  },
];

export function Dashboard() {
  const [selectedTriageCase, setSelectedTriageCase] = useState(null);
  const [selectedScoutingRecord, setSelectedScoutingRecord] = useState(null);

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

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Total Cases
              </p>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                415
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#74C69D20' }}>
              <Activity className="w-6 h-6" style={{ color: '#2D6A4F' }} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4" style={{ color: '#74C69D' }} />
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#74C69D' }}>12%</span>
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>vs last month</span>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Active Outbreaks
              </p>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                23
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: '#DC2626' }} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown className="w-4 h-4" style={{ color: '#74C69D' }} />
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#74C69D' }}>8%</span>
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>vs last month</span>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Scouting Compliance
              </p>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                95%
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#74C69D20' }}>
              <CheckCircle className="w-6 h-6" style={{ color: '#74C69D' }} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4" style={{ color: '#74C69D' }} />
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#74C69D' }}>2%</span>
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>vs last week</span>
          </div>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Pending Reviews
              </p>
              <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
                12
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
              <Clock className="w-6 h-6" style={{ color: '#D97706' }} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Avg. wait: </span>
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>6.2 hrs</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Weekly Compliance & Area Risk Map */}
      <div className="grid grid-cols-2 gap-6 mb-8">
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
              Target: 95% | Current: 95%
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
            Today: {recentScoutingRecords.filter(r => r.date === 'Mar 15, 2026').length} reports
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