import { TrendingUp, TrendingDown, MapPin, Filter, Download, AlertTriangle, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const generateSparklineData = (trend: 'up' | 'down' | 'stable') => {
  const baseValues = trend === 'up' 
    ? [10, 12, 15, 18, 22, 28, 35]
    : trend === 'down'
    ? [35, 28, 22, 18, 15, 12, 10]
    : [20, 21, 19, 20, 22, 21, 20];
  
  return baseValues.map((value, index) => ({ day: index + 1, value }));
};

interface ExporterCompliance {
  id: string;
  exporterName: string;
  farmerCount: number;
  restrictedBlocks: number;
  riskScore: number;
  county: string;
}

const exporterComplianceData: ExporterCompliance[] = [
  { id: '1', exporterName: 'Vegpro Kenya Ltd', farmerCount: 142, restrictedBlocks: 8, riskScore: 85, county: 'Kiambu' },
  { id: '2', exporterName: 'FreshPack Exporters', farmerCount: 98, restrictedBlocks: 2, riskScore: 22, county: "Murang'a" },
  { id: '3', exporterName: 'Avocado Direct Ltd', farmerCount: 67, restrictedBlocks: 0, riskScore: 8, county: 'Nyeri' },
  { id: '4', exporterName: 'Kakuzi PLC', farmerCount: 210, restrictedBlocks: 12, riskScore: 92, county: "Murang'a" },
  { id: '5', exporterName: 'Meru Premium Exports', farmerCount: 45, restrictedBlocks: 1, riskScore: 15, county: 'Meru' },
  { id: '6', exporterName: 'Limuru Green Gold', farmerCount: 78, restrictedBlocks: 5, riskScore: 58, county: 'Kiambu' },
  { id: '7', exporterName: 'Nyeri Valley Orchards', farmerCount: 89, restrictedBlocks: 0, riskScore: 5, county: 'Nyeri' },
  { id: '8', exporterName: 'Embu Fresh Produce', farmerCount: 56, restrictedBlocks: 3, riskScore: 42, county: 'Embu' },
];

const infectionClusters = [
  { county: "Murang'a", intensity: 'high', farmerCount: 320, pestCount: 45 },
  { county: 'Kiambu', intensity: 'high', farmerCount: 280, pestCount: 38 },
  { county: 'Nyeri', intensity: 'low', farmerCount: 156, pestCount: 4 },
  { county: 'Meru', intensity: 'medium', farmerCount: 90, pestCount: 12 },
  { county: 'Embu', intensity: 'medium', farmerCount: 102, pestCount: 15 },
];

export function KEPHISRiskIntelTab() {
  const [selectedCounty, setSelectedCounty] = useState<string>('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedExporter, setSelectedExporter] = useState<ExporterCompliance | null>(null);

  const filteredExporters = selectedCounty === 'all' 
    ? exporterComplianceData 
    : exporterComplianceData.filter(e => e.county === selectedCounty);

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#C0392B';
    if (score >= 40) return '#F39C12';
    return '#2D6A4F';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const handleViewExporter = (exporter: ExporterCompliance) => {
    setSelectedExporter(exporter);
    setViewModalOpen(true);
  };

  // Mock data for detailed view
  const getExporterDetails = (exporter: ExporterCompliance) => {
    const complianceHistory = [
      { month: 'Jan', score: 78 },
      { month: 'Feb', score: 82 },
      { month: 'Mar', score: exporter.riskScore },
    ];

    return {
      contactPerson: 'Sarah Kamau',
      phone: '+254 712 345 678',
      email: `contact@${exporter.exporterName.toLowerCase().replace(/\s+/g, '')}.co.ke`,
      activeFarmers: exporter.farmerCount,
      compliantFarmers: Math.floor(exporter.farmerCount * (1 - exporter.riskScore / 100)),
      nonCompliantFarmers: Math.ceil(exporter.farmerCount * (exporter.riskScore / 100)),
      totalBlocks: exporter.farmerCount + exporter.restrictedBlocks,
      clearedBlocks: exporter.farmerCount,
      restrictedBlocks: exporter.restrictedBlocks,
      complianceHistory,
      recentActivity: [
        { date: '2026-03-15', action: 'Farmer audit completed', status: 'completed' },
        { date: '2026-03-12', action: 'Block BLK-KMB-089 flagged', status: 'alert' },
        { date: '2026-03-10', action: 'Compliance report submitted', status: 'completed' },
      ],
    };
  };

  return (
    <div>
      {/* Summary Cards with 7-Day Sparkline Trends */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Total Pest Detections */}
        <div 
          className="p-6 rounded-xl border shadow-sm"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p 
                className="text-sm mb-2"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Total Pest Detections
              </p>
              <p 
                className="mb-1"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: '42px',
                  color: '#C0392B',
                  lineHeight: '1',
                }}
              >
                287
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" style={{ color: '#C0392B' }} />
                <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#C0392B' }}>
                  +12% vs last week
                </span>
              </div>
            </div>
            <div style={{ width: '80px', height: '40px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateSparklineData('up')}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#C0392B" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Quarantine Zones */}
        <div 
          className="p-6 rounded-xl border shadow-sm"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p 
                className="text-sm mb-2"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Active Quarantine Zones
              </p>
              <p 
                className="mb-1"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: '42px',
                  color: '#F39C12',
                  lineHeight: '1',
                }}
              >
                31
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-3 h-3" style={{ color: '#2D6A4F' }} />
                <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
                  -5% vs last week
                </span>
              </div>
            </div>
            <div style={{ width: '80px', height: '40px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateSparklineData('down')}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#F39C12" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Affected Farmers */}
        <div 
          className="p-6 rounded-xl border shadow-sm"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p 
                className="text-sm mb-2"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Affected Farmers
              </p>
              <p 
                className="mb-1"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: '42px',
                  color: '#1B4332',
                  lineHeight: '1',
                }}
              >
                948
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" style={{ color: '#C0392B' }} />
                <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#C0392B' }}>
                  +8% vs last week
                </span>
              </div>
            </div>
            <div style={{ width: '80px', height: '40px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateSparklineData('up')}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1B4332" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Compliance Rate */}
        <div 
          className="p-6 rounded-xl border shadow-sm"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p 
                className="text-sm mb-2"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                Compliance Rate
              </p>
              <p 
                className="mb-1"
                style={{ 
                  fontFamily: 'DM Serif Display, serif',
                  fontSize: '42px',
                  color: '#2D6A4F',
                  lineHeight: '1',
                }}
              >
                87%
              </p>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                  Stable trend
                </span>
              </div>
            </div>
            <div style={{ width: '80px', height: '40px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateSparklineData('stable')}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2D6A4F" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Heatmap & Infection Density */}
      <div 
        className="p-6 rounded-xl border shadow-sm mb-8"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#E0DDD6',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                fontSize: '24px',
                color: '#1B4332',
                marginBottom: '4px',
              }}
            >
              Infection Density Heatmap
            </h2>
            <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '14px', color: '#717182' }}>
              Geographic distribution of pest detections across avocado-growing regions
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg border flex items-center gap-2 transition-all hover:bg-gray-50"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E0DDD6',
              color: '#1B4332',
              fontFamily: 'IBM Plex Sans, sans-serif',
            }}
          >
            <Download className="w-4 h-4" />
            Export Map
          </button>
        </div>

        {/* Simplified Heatmap Visualization */}
        <div className="grid grid-cols-5 gap-4">
          {infectionClusters.map((cluster, index) => (
            <div
              key={index}
              className="p-5 rounded-lg border-l-4 relative"
              style={{
                backgroundColor: cluster.intensity === 'high' 
                  ? 'rgba(192, 57, 43, 0.08)' 
                  : cluster.intensity === 'medium'
                  ? 'rgba(243, 156, 18, 0.08)'
                  : 'rgba(45, 106, 79, 0.08)',
                borderColor: cluster.intensity === 'high' 
                  ? '#C0392B' 
                  : cluster.intensity === 'medium'
                  ? '#F39C12'
                  : '#2D6A4F',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin 
                  className="w-5 h-5" 
                  style={{ 
                    color: cluster.intensity === 'high' 
                      ? '#C0392B' 
                      : cluster.intensity === 'medium'
                      ? '#F39C12'
                      : '#2D6A4F' 
                  }} 
                />
                <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                  {cluster.county}
                </h3>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Farmers
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                    {cluster.farmerCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Pest Cases
                  </p>
                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                    {cluster.pestCount}
                  </p>
                </div>
              </div>
              <div 
                className="absolute top-3 right-3 w-3 h-3 rounded-full"
                style={{
                  backgroundColor: cluster.intensity === 'high' 
                    ? '#C0392B' 
                    : cluster.intensity === 'medium'
                    ? '#F39C12'
                    : '#2D6A4F',
                  boxShadow: `0 0 12px ${cluster.intensity === 'high' ? '#C0392B' : cluster.intensity === 'medium' ? '#F39C12' : '#2D6A4F'}`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t" style={{ borderColor: '#E0DDD6' }}>
          <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Infection Density:
          </p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#C0392B' }} />
            <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              High (30+ cases)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F39C12' }} />
            <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Medium (10-29 cases)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#2D6A4F' }} />
            <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Low (&lt;10 cases)
            </span>
          </div>
        </div>
      </div>

      {/* Exporter Compliance Table */}
      <div 
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: '#E0DDD6',
        }}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}>
          <div>
            <h2 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                fontSize: '24px',
                color: '#1B4332',
                marginBottom: '4px',
              }}
            >
              Exporter Compliance Overview
            </h2>
            <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '14px', color: '#717182' }}>
              Risk assessment based on restricted blocks and farmer compliance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4" style={{ color: '#717182' }} />
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="px-4 py-2 rounded-lg border"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderColor: '#E0DDD6',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="all">All Counties</option>
              <option value="Murang'a">Murang'a</option>
              <option value="Kiambu">Kiambu</option>
              <option value="Nyeri">Nyeri</option>
              <option value="Meru">Meru</option>
              <option value="Embu">Embu</option>
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
              <th 
                className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontWeight: 600 }}
              >
                Exporter Name
              </th>
              <th 
                className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontWeight: 600 }}
              >
                County
              </th>
              <th 
                className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontWeight: 600 }}
              >
                Farmer Count
              </th>
              <th 
                className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontWeight: 600 }}
              >
                Restricted Blocks
              </th>
              <th 
                className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontWeight: 600 }}
              >
                Risk Score
              </th>
              <th 
                className="px-6 py-4 text-center text-xs uppercase tracking-wider"
                style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontWeight: 600, width: '120px' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExporters.map((exporter, index) => (
              <tr 
                key={exporter.id}
                className="hover:bg-gray-50/50 transition-colors"
                style={{ borderBottom: index !== filteredExporters.length - 1 ? '1px solid #E0DDD6' : 'none' }}
              >
                <td className="px-6 py-4">
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '14px', color: '#1B4332', fontWeight: 600 }}>
                    {exporter.exporterName}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '14px', color: '#717182' }}>
                    {exporter.county}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '14px', color: '#1B4332' }}>
                    {exporter.farmerCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {exporter.restrictedBlocks > 0 && (
                      <AlertTriangle className="w-4 h-4" style={{ color: '#C0392B' }} />
                    )}
                    <span 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        fontSize: '14px', 
                        color: exporter.restrictedBlocks > 0 ? '#C0392B' : '#2D6A4F',
                        fontWeight: exporter.restrictedBlocks > 0 ? '600' : '400',
                      }}
                    >
                      {exporter.restrictedBlocks}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {/* Risk Score Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#E0DDD6' }}>
                        <div 
                          className="h-full transition-all"
                          style={{ 
                            width: `${exporter.riskScore}%`,
                            backgroundColor: getRiskColor(exporter.riskScore),
                          }}
                        />
                      </div>
                      <span 
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif', 
                          fontSize: '13px', 
                          color: '#1B4332',
                          fontWeight: 600,
                          minWidth: '40px',
                        }}
                      >
                        {exporter.riskScore}%
                      </span>
                    </div>
                    {/* Risk Label */}
                    <span 
                      className="px-3 py-1 rounded-full text-xs inline-block"
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        backgroundColor: exporter.riskScore >= 70 ? '#C0392B' : exporter.riskScore >= 40 ? '#F39C12' : '#2D6A4F',
                        color: '#FFFFFF',
                        fontWeight: 700,
                      }}
                    >
                      {getRiskLabel(exporter.riskScore)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleViewExporter(exporter)}
                    className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all mx-auto"
                    style={{
                      backgroundColor: '#2D6A4F',
                      color: '#FFFFFF',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1B4332';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2D6A4F';
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Exporter Modal */}
      {viewModalOpen && selectedExporter && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-8 py-6 border-b flex items-center justify-between rounded-t-xl" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
              <div>
                <h2 
                  style={{ 
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: '28px',
                    color: '#1B4332',
                    marginBottom: '4px',
                  }}
                >
                  {selectedExporter.exporterName}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: '#717182' }} />
                    <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '14px', color: '#717182' }}>
                      {selectedExporter.county}
                    </span>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-xs"
                    style={{ 
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      backgroundColor: getRiskColor(selectedExporter.riskScore),
                      color: '#FFFFFF',
                      fontWeight: 700,
                    }}
                  >
                    {getRiskLabel(selectedExporter.riskScore)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 rounded-lg transition-all hover:bg-white/50"
                style={{ color: '#717182' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5" style={{ color: '#2D6A4F' }} />
                    <p className="text-xs uppercase tracking-wider" style={{ color: '#717182', fontWeight: 600 }}>
                      Active Farmers
                    </p>
                  </div>
                  <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: '#1B4332' }}>
                    {selectedExporter.farmerCount}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5" style={{ color: '#C0392B' }} />
                    <p className="text-xs uppercase tracking-wider" style={{ color: '#717182', fontWeight: 600 }}>
                      Restricted Blocks
                    </p>
                  </div>
                  <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: selectedExporter.restrictedBlocks > 0 ? '#C0392B' : '#2D6A4F' }}>
                    {selectedExporter.restrictedBlocks}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="w-5 h-5" style={{ color: getRiskColor(selectedExporter.riskScore) }} />
                    <p className="text-xs uppercase tracking-wider" style={{ color: '#717182', fontWeight: 600 }}>
                      Risk Score
                    </p>
                  </div>
                  <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: getRiskColor(selectedExporter.riskScore) }}>
                    {selectedExporter.riskScore}%
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6 p-6 rounded-lg" style={{ backgroundColor: '#F7F4EF' }}>
                <h3 
                  className="mb-4"
                  style={{ 
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: '20px',
                    color: '#1B4332',
                  }}
                >
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182', fontWeight: 600 }}>
                      Contact Person
                    </p>
                    <p style={{ color: '#1B4332', fontSize: '14px' }}>
                      {getExporterDetails(selectedExporter).contactPerson}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182', fontWeight: 600 }}>
                      Phone
                    </p>
                    <p style={{ color: '#1B4332', fontSize: '14px' }}>
                      {getExporterDetails(selectedExporter).phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182', fontWeight: 600 }}>
                      Email
                    </p>
                    <p style={{ color: '#1B4332', fontSize: '14px' }}>
                      {getExporterDetails(selectedExporter).email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Compliance Breakdown */}
              <div className="mb-6">
                <h3 
                  className="mb-4"
                  style={{ 
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: '20px',
                    color: '#1B4332',
                  }}
                >
                  Compliance Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(45, 106, 79, 0.05)', borderColor: '#2D6A4F' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182', fontWeight: 600 }}>
                      Compliant Farmers
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '24px', color: '#2D6A4F', fontWeight: 700 }}>
                      {getExporterDetails(selectedExporter).compliantFarmers}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(192, 57, 43, 0.05)', borderColor: '#C0392B' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182', fontWeight: 600 }}>
                      Non-Compliant
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '24px', color: '#C0392B', fontWeight: 700 }}>
                      {getExporterDetails(selectedExporter).nonCompliantFarmers}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#717182', fontWeight: 600 }}>
                      Total Blocks
                    </p>
                    <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '24px', color: '#1B4332', fontWeight: 700 }}>
                      {getExporterDetails(selectedExporter).totalBlocks}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mb-6">
                <h3 
                  className="mb-4"
                  style={{ 
                    fontFamily: 'DM Serif Display, serif',
                    fontSize: '20px',
                    color: '#1B4332',
                  }}
                >
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {getExporterDetails(selectedExporter).recentActivity.map((activity, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-4 rounded-lg border"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ 
                          backgroundColor: activity.status === 'completed' ? '#2D6A4F' : '#C0392B',
                          boxShadow: `0 0 8px ${activity.status === 'completed' ? '#2D6A4F' : '#C0392B'}`,
                        }}
                      />
                      <div className="flex-1">
                        <p style={{ color: '#717182', fontSize: '12px', marginBottom: '4px' }}>
                          {activity.date}
                        </p>
                        <p style={{ color: '#1B4332', fontSize: '14px', fontWeight: 600 }}>
                          {activity.action}
                        </p>
                      </div>
                      <span 
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: activity.status === 'completed' ? 'rgba(45, 106, 79, 0.1)' : 'rgba(192, 57, 43, 0.1)',
                          color: activity.status === 'completed' ? '#2D6A4F' : '#C0392B',
                          fontWeight: 600,
                        }}
                      >
                        {activity.status === 'completed' ? 'Completed' : 'Alert'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-8 py-4 border-t flex justify-end gap-3 rounded-b-xl" style={{ borderColor: '#E0DDD6' }}>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1B4332';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2D6A4F';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}