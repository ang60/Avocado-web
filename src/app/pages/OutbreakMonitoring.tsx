import { Layout } from '../components/Layout';
import { AlertTriangle, TrendingUp, MapPin, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { fetchOutbreakMonitoring } from '../api/placeholderApi';
import type { OutbreakMonitoringPayload } from '../api/types';

export function OutbreakMonitoring() {
  const [data, setData] = useState<OutbreakMonitoringPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchOutbreakMonitoring()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load outbreak data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Layout>
        <div className="p-8 rounded-lg border text-center" style={{ borderColor: '#E0DDD6' }}>
          <p style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>{error}</p>
        </div>
      </Layout>
    );
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-72" />
          <div className="h-16 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-80 bg-slate-200 rounded-lg" />
        </div>
      </Layout>
    );
  }

  const { alertTitle, alertMessage, stats, outbreakTrends, countyHeatMap, activeOutbreaks } = data;

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-4xl mb-2" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Outbreak Monitoring
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Track and analyze pest and disease outbreak patterns
        </p>
      </header>

      <div
        className="p-4 rounded-lg border mb-8 flex items-center gap-3"
        style={{ backgroundColor: '#FEE2E2', borderColor: '#DC2626', borderRadius: '8px' }}
      >
        <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: '#DC2626' }} />
        <div>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#DC2626' }}>
            <strong>{alertTitle}:</strong> {alertMessage}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 min-w-0">
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
            {stats.activeOutbreaks}
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
            {stats.critical}
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
            {stats.regionsAffected}
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
            {stats.avgResponseTime}
          </p>
        </div>
      </div>

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {countyHeatMap.map((county) => (
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

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-6 border-t" style={{ borderColor: '#E0DDD6' }}>
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

      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
      >
        <div className="px-6 py-4 border-b" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>Active Outbreak Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                {['Outbreak ID', 'Pest/Disease', 'Severity', 'Location', 'Farms', 'Cases', 'First Detected', 'Trend'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider whitespace-nowrap"
                      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {activeOutbreaks.map((outbreak, index) => {
                const severityConfig = {
                  critical: { bg: '#FEE2E2', text: '#DC2626' },
                  high: { bg: '#FEF3C7', text: '#D97706' },
                  medium: { bg: '#E0E7FF', text: '#4338CA' },
                };
                const severity = severityConfig[outbreak.severity];
                const trendConfig = {
                  increasing: { icon: '↑', color: '#DC2626' },
                  stable: { icon: '→', color: '#D97706' },
                  decreasing: { icon: '↓', color: '#74C69D' },
                };
                const trend = trendConfig[outbreak.trend];
                return (
                  <tr
                    key={outbreak.id}
                    className="hover:bg-gray-50/50 transition-colors"
                    style={{ borderBottom: index !== activeOutbreaks.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
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
                    <td className="px-6 py-4 whitespace-nowrap" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
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
      </div>
    </Layout>
  );
}
