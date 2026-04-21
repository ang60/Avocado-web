import { Layout } from '../components/Layout';
import { AlertTriangle, TrendingUp, MapPin, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const outbreakTrends = [
  { date: 'Mar 1', thrips: 12, rootRot: 5, mites: 8, anthracnose: 3 },
  { date: 'Mar 3', thrips: 15, rootRot: 6, mites: 10, anthracnose: 4 },
  { date: 'Mar 5', thrips: 18, rootRot: 7, mites: 12, anthracnose: 5 },
  { date: 'Mar 7', thrips: 22, rootRot: 8, mites: 15, anthracnose: 6 },
  { date: 'Mar 9', thrips: 19, rootRot: 9, mites: 14, anthracnose: 7 },
  { date: 'Mar 11', thrips: 24, rootRot: 10, mites: 16, anthracnose: 8 },
  { date: 'Mar 13', thrips: 28, rootRot: 11, mites: 18, anthracnose: 9 },
  { date: 'Mar 15', thrips: 25, rootRot: 12, mites: 17, anthracnose: 10 },
];

const activeOutbreaks = [
  {
    id: 'OUT-089',
    pest: 'Avocado Thrips',
    severity: 'critical',
    location: 'Murang\'a County',
    farmsAffected: 12,
    casesLinked: 45,
    firstDetected: 'Feb 28, 2026',
    trend: 'increasing',
  },
  {
    id: 'OUT-088',
    pest: 'Phytophthora Root Rot',
    severity: 'high',
    location: 'Kiambu County',
    farmsAffected: 8,
    casesLinked: 28,
    firstDetected: 'Mar 2, 2026',
    trend: 'stable',
  },
  {
    id: 'OUT-087',
    pest: 'Persea Mite',
    severity: 'medium',
    location: 'Meru County',
    farmsAffected: 6,
    casesLinked: 19,
    firstDetected: 'Mar 5, 2026',
    trend: 'decreasing',
  },
  {
    id: 'OUT-086',
    pest: 'Anthracnose',
    severity: 'medium',
    location: 'Nyeri County',
    farmsAffected: 4,
    casesLinked: 14,
    firstDetected: 'Mar 8, 2026',
    trend: 'increasing',
  },
];

// Heat map data for Kenyan counties
const countyHeatMapData = [
  { county: 'Murang\'a', intensity: 85, cases: 45, color: '#DC2626' },
  { county: 'Kiambu', intensity: 68, cases: 28, color: '#D97706' },
  { county: 'Meru', intensity: 42, cases: 19, color: '#FBBF24' },
  { county: 'Nyeri', intensity: 38, cases: 14, color: '#74C69D' },
  { county: 'Bungoma', intensity: 25, cases: 8, color: '#9CA3AF' },
  { county: 'Kakamega', intensity: 18, cases: 5, color: '#D1D5DB' },
  { county: 'Trans Nzoia', intensity: 15, cases: 4, color: '#E5E7EB' },
  { county: 'Embu', intensity: 12, cases: 3, color: '#F3F4F6' },
];

export function OutbreakMonitoring() {
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
          Outbreak Monitoring
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Track and analyze pest and disease outbreak patterns
        </p>
      </header>

      {/* Alert Banner */}
      <div 
        className="p-4 rounded-lg border mb-8 flex items-center gap-3"
        style={{ backgroundColor: '#FEE2E2', borderColor: '#DC2626', borderRadius: '8px' }}
      >
        <AlertTriangle className="w-5 h-5" style={{ color: '#DC2626' }} />
        <div>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#DC2626' }}>
            <strong>Critical Outbreak Alert:</strong> Avocado Thrips outbreak in Murang\'a County showing rapid spread. 12 farms affected.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" style={{ color: '#DC2626' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Active Outbreaks
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            23
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#DC2626' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Critical
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            4
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Regions Affected
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            8
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Avg. Response Time
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            18h
          </p>
        </div>
      </div>

      {/* Outbreak Trends Chart */}
      <div 
        className="p-6 rounded-lg border mb-8"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <h3 className="mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
          Outbreak Trends Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={outbreakTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD6" />
            <XAxis dataKey="date" style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px' }} />
            <YAxis style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px' }} />
            <Tooltip contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontFamily: 'IBM Plex Sans, sans-serif' }} />
            <Line type="monotone" dataKey="thrips" stroke="#DC2626" strokeWidth={2} name="Avocado Thrips" />
            <Line type="monotone" dataKey="rootRot" stroke="#D97706" strokeWidth={2} name="Root Rot" />
            <Line type="monotone" dataKey="mites" stroke="#2D6A4F" strokeWidth={2} name="Persea Mite" />
            <Line type="monotone" dataKey="anthracnose" stroke="#74C69D" strokeWidth={2} name="Anthracnose" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* County Heat Map */}
      <div 
        className="p-6 rounded-lg border mb-8"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <div className="mb-6">
          <h3 className="mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            County Outbreak Heat Map
          </h3>
          <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Intensity of outbreak activity across avocado-growing counties
          </p>
        </div>

        {/* Heat Map Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {countyHeatMapData.map((county) => (
            <div
              key={county.county}
              className="p-6 rounded-lg border transition-all hover:shadow-md cursor-pointer"
              style={{
                backgroundColor: county.color,
                borderColor: '#E0DDD6',
                borderRadius: '8px',
              }}
            >
              <div className="mb-3">
                <h4 
                  className="mb-1" 
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif', 
                    color: county.intensity > 50 ? '#FFFFFF' : '#1B4332',
                  }}
                >
                  {county.county}
                </h4>
                <p 
                  className="text-xs" 
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif', 
                    color: county.intensity > 50 ? '#FFFFFF' : '#717182',
                  }}
                >
                  County
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span 
                    className="text-2xl" 
                    style={{ 
                      fontFamily: 'DM Serif Display, serif', 
                      color: county.intensity > 50 ? '#FFFFFF' : '#1B4332',
                    }}
                  >
                    {county.cases}
                  </span>
                  <span 
                    className="text-xs" 
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif', 
                      color: county.intensity > 50 ? '#FFFFFF' : '#717182',
                    }}
                  >
                    cases
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="flex-1 h-1.5 rounded-full overflow-hidden" 
                    style={{ backgroundColor: county.intensity > 50 ? '#FFFFFF40' : '#E0DDD6' }}
                  >
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${county.intensity}%`,
                        backgroundColor: county.intensity > 50 ? '#FFFFFF' : '#DC2626',
                      }}
                    />
                  </div>
                  <span 
                    className="text-xs" 
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif', 
                      color: county.intensity > 50 ? '#FFFFFF' : '#717182',
                    }}
                  >
                    {county.intensity}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 pt-6 border-t" style={{ borderColor: '#E0DDD6' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }} />
            <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Critical (70-100%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D97706' }} />
            <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              High (50-69%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FBBF24' }} />
            <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Medium (30-49%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#74C69D' }} />
            <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Low (0-29%)
            </span>
          </div>
        </div>
      </div>

      {/* Active Outbreaks Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <div className="px-6 py-4 border-b" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Active Outbreak Events
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Outbreak ID
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Pest/Disease
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Severity
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Location
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Farms
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Cases
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                First Detected
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {activeOutbreaks.map((outbreak, index) => {
              const severityConfig = {
                critical: { bg: '#FEE2E2', text: '#DC2626' },
                high: { bg: '#FEF3C7', text: '#D97706' },
                medium: { bg: '#E0E7FF', text: '#4338CA' },
              };
              const severity = severityConfig[outbreak.severity as keyof typeof severityConfig];

              const trendConfig = {
                increasing: { icon: '↑', color: '#DC2626' },
                stable: { icon: '→', color: '#D97706' },
                decreasing: { icon: '↓', color: '#74C69D' },
              };
              const trend = trendConfig[outbreak.trend as keyof typeof trendConfig];

              return (
                <tr 
                  key={outbreak.id}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== activeOutbreaks.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                    {outbreak.id}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {outbreak.pest}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: severity.bg,
                        color: severity.text,
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                      }}
                    >
                      {outbreak.severity.charAt(0).toUpperCase() + outbreak.severity.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                    {outbreak.location}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {outbreak.farmsAffected}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {outbreak.casesLinked}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    {outbreak.firstDetected}
                  </td>
                  <td className="px-6 py-4">
                    <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: trend.color }}>
                      {trend.icon} {outbreak.trend.charAt(0).toUpperCase() + outbreak.trend.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}