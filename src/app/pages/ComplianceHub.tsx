import { Layout } from '../components/Layout';
import { useState, useEffect } from 'react';
import {
  fetchComplianceFarmers,
  generateComplianceReport,
  type GeneratedReportPayload,
} from '../api/placeholderApi';
import { AppToast } from '../components/AppToast';
import type { ComplianceFarmerRow } from '../api/types';
import { useNavigate } from 'react-router';
import { 
  Download, CheckCircle, AlertCircle, XCircle, 
  Smartphone, Phone, Mail, FileText, Activity, Clock,
  MapPin, TrendingUp, BarChart3, Users, Shield, Zap,
  Calendar, Filter, ChevronDown
} from 'lucide-react';

type ReportType = 
  | 'phytosanitary' 
  | 'area-risk' 
  | 'ipm-audit' 
  | 'farmer-ranking' 
  | 'system-adoption'
  | 'agronomist-efficiency';

type ExportFormat = 'pdf' | 'excel' | 'json';

function downloadComplianceExport(p: GeneratedReportPayload) {
  const header = [
    `AvoGuard — ${p.reportTitle}`,
    `Generated: ${p.generatedAt}`,
    `Date range: ${p.dateRange} | Region: ${p.region}`,
    '',
    ...p.summaryLines,
    '',
  ].join('\n');
  let content: string;
  let mime: string;
  let ext: string;
  if (p.format === 'json') {
    content = JSON.stringify(p, null, 2);
    mime = 'application/json';
    ext = 'json';
  } else if (p.format === 'excel') {
    content = 'Farmer ID,Included\n' + p.farmerIds.map((id) => `${id},yes`).join('\n');
    mime = 'text/csv;charset=utf-8';
    ext = 'csv';
  } else {
    content =
      header +
      '---\n(PDF export would attach certified documents; this is a text summary for demo.)\n\n' +
      p.farmerIds.map((id) => `- ${id}`).join('\n');
    mime = 'text/plain;charset=utf-8';
    ext = 'txt';
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `avoguard-${p.reportType}-${new Date().toISOString().slice(0, 10)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

interface ReportCard {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'phytosanitary',
    title: 'Phytosanitary Export Certificate',
    description: 'Export compliance documentation and traceability records',
    icon: Shield,
    color: '#2D6A4F',
  },
  {
    id: 'area-risk',
    title: 'Regional Cluster Analysis',
    description: 'Geo-cluster detection and outbreak velocity tracking',
    icon: MapPin,
    color: '#C0392B',
  },
  {
    id: 'ipm-audit',
    title: 'IPM Advisory Audit',
    description: 'Chemical guidance approval trail and PHI verification',
    icon: Shield,
    color: '#1E40AF',
  },
  {
    id: 'farmer-ranking',
    title: 'Farmer Compliance Ranking',
    description: 'Scouting consistency and minimum viable weekly records',
    icon: Users,
    color: '#2D6A4F',
  },
  {
    id: 'system-adoption',
    title: 'System Adoption (USSD vs App)',
    description: 'Digital channel performance and engagement metrics',
    icon: Smartphone,
    color: '#D97706',
  },
  {
    id: 'agronomist-efficiency',
    title: 'Agronomist Efficiency Report',
    description: 'Case triage times and resolution performance',
    icon: Zap,
    color: '#7C3AED',
  },
];

function ScoutingHistoryDots({ history }: { history: [boolean, boolean, boolean, boolean] }) {
  return (
    <div className="flex items-center gap-1">
      {history.map((completed, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: completed ? '#74C69D' : '#D1D5DB',
          }}
          title={`Week ${index + 1}: ${completed ? 'Completed' : 'Missing'}`}
        />
      ))}
    </div>
  );
}

function RiskLevelBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { label: 'High', bg: '#FEE2E2', text: '#C0392B' },
    medium: { label: 'Medium', bg: '#FEF3C7', text: '#D97706' },
    low: { label: 'Low', bg: '#DCFCE7', text: '#15803D' },
  };

  const { label, bg, text } = config[level];

  return (
    <span
      className="px-3 py-1 rounded text-xs"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: 'IBM Plex Sans, sans-serif',
        borderRadius: '8px',
        fontWeight: '600',
      }}
    >
      {label}
    </span>
  );
}

function SubmissionModeIcon({ mode }: { mode: 'app' | 'ussd' }) {
  const Icon = mode === 'app' ? Smartphone : Phone;
  const color = mode === 'app' ? '#1E40AF' : '#D97706';
  const bg = mode === 'app' ? '#DBEAFE' : '#FEF3C7';
  const label = mode === 'app' ? 'App' : 'USSD';

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
        {label}
      </span>
    </div>
  );
}

function ReportStatusPill({ status }: { status: 'incomplete' | 'pending-approval' | 'export-ready' }) {
  const config = {
    'incomplete': { label: 'Incomplete', bg: '#FEE2E2', text: '#C0392B', icon: XCircle },
    'pending-approval': { label: 'Pending Approval', bg: '#FEF3C7', text: '#D97706', icon: Clock },
    'export-ready': { label: 'Export Ready', bg: '#DCFCE7', text: '#15803D', icon: CheckCircle },
  };

  const { label, bg, text, icon: Icon } = config[status];

  return (
    <span
      className="px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit"
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: 'IBM Plex Sans, sans-serif',
        borderRadius: '8px',
        fontWeight: '600',
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export function ComplianceHub() {
  const navigate = useNavigate();
  const [complianceFarmers, setComplianceFarmers] = useState<ComplianceFarmerRow[]>([]);
  const [complianceFarmersLoading, setComplianceFarmersLoading] = useState(true);
  const [complianceFarmersError, setComplianceFarmersError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchComplianceFarmers()
      .then((data) => {
        if (!cancelled) {
          setComplianceFarmers(data);
          setComplianceFarmersError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setComplianceFarmersError('Could not load compliance farmers.');
      })
      .finally(() => {
        if (!cancelled) setComplianceFarmersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [dateRange, setDateRange] = useState('last-30-days');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [lastGeneratedReport, setLastGeneratedReport] = useState<GeneratedReportPayload | null>(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [complianceToast, setComplianceToast] = useState<string | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedFarmers(complianceFarmers.map(f => f.id));
    } else {
      setSelectedFarmers([]);
    }
  };

  const handleSelectFarmer = (farmerId: string) => {
    if (selectedFarmers.includes(farmerId)) {
      setSelectedFarmers(selectedFarmers.filter(id => id !== farmerId));
    } else {
      setSelectedFarmers([...selectedFarmers, farmerId]);
    }
  };

  const handleGenerateReport = () => {
    if (!selectedReport) return;
    const card = reportCards.find((r) => r.id === selectedReport);
    const ids =
      selectedFarmers.length > 0 ? selectedFarmers : complianceFarmers.map((f) => f.id);
    const inScope = complianceFarmers.filter((f) => ids.includes(f.id));
    const exportReady = inScope.filter((f) => f.reportStatus === 'export-ready').length;
    setReportGenerating(true);
    generateComplianceReport({
      reportType: selectedReport,
      reportTitle: card?.title ?? selectedReport,
      format: exportFormat,
      dateRange,
      region: selectedRegion,
      farmerIds: ids,
      summaryLines: [
        `Records in file: ${inScope.length}`,
        `Export-ready rows: ${exportReady}`,
        `Report type: ${selectedReport}`,
      ],
    })
      .then((payload) => {
        setLastGeneratedReport(payload);
        downloadComplianceExport(payload);
        setComplianceToast('Report generated — download started.');
        window.setTimeout(() => setComplianceToast(null), 5000);
      })
      .catch(() => {
        setComplianceToast('Report generation failed. Try again.');
        window.setTimeout(() => setComplianceToast(null), 5000);
      })
      .finally(() => setReportGenerating(false));
  };

  const handleEmailReports = () => {
    if (selectedFarmers.length > 0) {
      setComplianceToast(
        `Queued compliance package for ${selectedFarmers.length} farmer(s) — exporter will receive email shortly.`
      );
      window.setTimeout(() => setComplianceToast(null), 5000);
    } else {
      setComplianceToast('Select at least one farmer to email reports.');
      window.setTimeout(() => setComplianceToast(null), 4000);
    }
  };

  // If no report selected, show selection interface
  if (!selectedReport) {
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
            Report Generation
          </h1>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Select a report type to generate strategic insights and compliance documentation
          </p>
        </header>

        {/* Report Type Selection Cards */}
        <div className="grid grid-cols-3 gap-6">
          {reportCards.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className="p-6 rounded-lg border text-left transition-all hover:shadow-lg hover:scale-105"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0DDD6',
                  borderRadius: '8px',
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${report.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <h3 
                  className="mb-2"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#1B4332',
                    fontWeight: '600',
                    fontSize: '16px',
                  }}
                >
                  {report.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                    lineHeight: '1.5',
                  }}
                >
                  {report.description}
                </p>
              </button>
            );
          })}
        </div>
      </Layout>
    );
  }

  const currentReport = reportCards.find(r => r.id === selectedReport);

  return (
    <Layout>
      {complianceToast && (
        <AppToast
          message={complianceToast}
          variant={complianceToast.startsWith('Select') || complianceToast.includes('failed') ? 'info' : 'success'}
          onDismiss={() => setComplianceToast(null)}
        />
      )}
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => setSelectedReport(null)}
            className="text-sm mb-3 hover:opacity-70 transition-opacity flex items-center gap-2"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F', fontWeight: '600' }}
          >
            ← Back to Report Selection
          </button>
          <h1 
            className="text-4xl mb-2" 
            style={{ 
              fontFamily: 'DM Serif Display, serif',
              color: '#1B4332'
            }}
          >
            {currentReport?.title}
          </h1>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            {currentReport?.description}
          </p>
        </div>
      </div>

      {lastGeneratedReport && lastGeneratedReport.reportType === selectedReport && (
        <div
          className="mb-6 p-4 rounded-lg border flex flex-wrap items-center justify-between gap-4"
          style={{ backgroundColor: '#E8F5E9', borderColor: '#74C69D' }}
        >
          <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            <strong>Latest export</strong> — {new Date(lastGeneratedReport.generatedAt).toLocaleString()} (
            {lastGeneratedReport.format.toUpperCase()})
          </div>
          <button
            type="button"
            onClick={() => downloadComplianceExport(lastGeneratedReport)}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: '#2D6A4F',
              color: '#FFFFFF',
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontWeight: 600,
            }}
          >
            <Download className="w-4 h-4" />
            Download again
          </button>
        </div>
      )}

      {/* Filter Options Panel */}
      <div 
        className="p-6 rounded-lg border mb-8"
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderColor: '#E0DDD6', 
          borderRadius: '8px',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" style={{ color: '#2D6A4F' }} />
          <h3 
            style={{ 
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: '#1B4332',
              fontWeight: '600',
            }}
          >
            Report Filters
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Date Range */}
          <div>
            <label 
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Date Range
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#717182' }} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border outline-none text-sm appearance-none"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  borderRadius: '8px',
                  color: '#1B4332',
                }}
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-90-days">Last 90 Days</option>
                <option value="this-quarter">This Quarter</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#717182' }} />
            </div>
          </div>

          {/* Region/Ward Selector */}
          <div>
            <label 
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Region/Ward
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#717182' }} />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border outline-none text-sm appearance-none"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  borderRadius: '8px',
                  color: '#1B4332',
                }}
              >
                <option value="all">All Regions</option>
                <option value="muranga">Murang'a County</option>
                <option value="kiambu">Kiambu County</option>
                <option value="nyeri">Nyeri County</option>
                <option value="meru">Meru County</option>
                <option value="embu">Embu County</option>
                <option value="bungoma">Bungoma County</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#717182' }} />
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label 
              className="block text-xs uppercase tracking-wider mb-2"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
            >
              Export Format
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#717182' }} />
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border outline-none text-sm appearance-none"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  borderRadius: '8px',
                  color: '#1B4332',
                }}
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="json">JSON (API Integration)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#717182' }} />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={reportGenerating}
              className="w-full px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              <Download className="w-4 h-4" />
              {reportGenerating ? 'Generating…' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content - Render based on selected report type */}
      {complianceFarmersError && (
        <div
          className="mb-4 p-4 rounded-lg border"
          style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {complianceFarmersError}
        </div>
      )}
      {selectedReport === 'phytosanitary' && complianceFarmersLoading && (
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading compliance data…</p>
      )}
      {selectedReport === 'phytosanitary' && !complianceFarmersLoading && (
        <PhytosanitaryReport
          farmers={complianceFarmers}
          selectedFarmers={selectedFarmers}
          onSelectAll={handleSelectAll}
          onSelectFarmer={handleSelectFarmer}
          onEmailReports={handleEmailReports}
        />
      )}

      {selectedReport === 'area-risk' && <AreaRiskReport />}
      {selectedReport === 'ipm-audit' && <IPMAuditReport />}
      {selectedReport === 'farmer-ranking' && <FarmerRankingReport />}
      {selectedReport === 'system-adoption' && <SystemAdoptionReport />}
      {selectedReport === 'agronomist-efficiency' && <AgronomistEfficiencyReport />}
    </Layout>
  );
}

// Phytosanitary Export Certificate Report
function PhytosanitaryReport({ 
  farmers, 
  selectedFarmers, 
  onSelectAll, 
  onSelectFarmer,
  onEmailReports 
}: { 
  farmers: ComplianceFarmerRow[];
  selectedFarmers: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectFarmer: (id: string) => void;
  onEmailReports: () => void;
}) {
  const navigate = useNavigate();
  
  const exportReadyCount = farmers.filter(f => f.reportStatus === 'export-ready').length;
  const exportReadyPercentage =
    farmers.length > 0 ? Math.round((exportReadyCount / farmers.length) * 100) : 0;
  const pendingLogsCount = farmers.filter(f => f.reportStatus === 'incomplete').length;
  const activeOutbreaksCount = farmers.filter(f => f.riskLevel === 'high').length;

  return (
    <>
      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Export Ready
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {exportReadyPercentage}%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
            {exportReadyCount} of {farmers.length} farmers
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D97706' }}
            >
              <FileText className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Pending Logs
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {pendingLogsCount}
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
            Requires completion
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#C0392B' }}
            >
              <Activity className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Active Outbreaks
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {activeOutbreaksCount}
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#C0392B' }}>
            High risk cases
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Avg. PHI Adherence
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            98%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
            Pre-harvest interval
          </p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedFarmers.length > 0 && (
        <div 
          className="mb-6 p-4 rounded-lg border flex items-center justify-between"
          style={{ 
            backgroundColor: '#2D6A4F', 
            borderColor: '#2D6A4F', 
            borderRadius: '8px',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#FFFFFF', fontWeight: '600' }}>
              {selectedFarmers.length} farmer{selectedFarmers.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Generating export batch PDF...')}
              className="px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#2D6A4F',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              <Download className="w-4 h-4" />
              Generate Export Batch (PDF)
            </button>
            <button
              onClick={onEmailReports}
              className="px-4 py-2 rounded-lg border transition-colors hover:bg-white/10 flex items-center gap-2"
              style={{
                borderColor: '#FFFFFF',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              <Mail className="w-4 h-4" />
              Email Reports to Exporter
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E0DDD6',
          borderRadius: '8px',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedFarmers.length === farmers.length}
                    onChange={onSelectAll}
                    style={{ accentColor: '#2D6A4F' }}
                  />
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Farmer & ID
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Scouting History
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Risk Level
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Submission Mode
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Report Status
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer, index) => (
                <tr 
                  key={farmer.id}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== farmers.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFarmers.includes(farmer.id)}
                      onChange={() => onSelectFarmer(farmer.id)}
                      style={{ accentColor: '#2D6A4F' }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p 
                        className="text-sm mb-1" 
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif', 
                          color: '#1B4332',
                          fontWeight: '600',
                        }}
                      >
                        {farmer.name}
                      </p>
                      <p 
                        className="text-xs mb-1" 
                        style={{ 
                          fontFamily: 'IBM Plex Mono, monospace', 
                          color: '#2D6A4F',
                          fontWeight: '500',
                        }}
                      >
                        {farmer.id}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {farmer.farmName}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {farmer.location}, {farmer.county}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ScoutingHistoryDots history={farmer.scoutingHistory} />
                    <p className="text-xs mt-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      {farmer.scoutingHistory.filter(Boolean).length}/4 weeks
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <RiskLevelBadge level={farmer.riskLevel} />
                  </td>
                  <td className="px-6 py-4">
                    <SubmissionModeIcon mode={farmer.submissionMode} />
                  </td>
                  <td className="px-6 py-4">
                    <ReportStatusPill status={farmer.reportStatus} />
                    <p className="text-xs mt-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                      Updated: {farmer.lastUpdate}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/farmers/${farmer.id}`)}
                      className="px-3 py-1 rounded-lg border transition-colors hover:bg-gray-50 text-xs"
                      style={{
                        borderColor: '#E0DDD6',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Area Risk & Cluster Detection Report
function AreaRiskReport() {
  const clusterData = [
    { county: 'Murang\'a', ward: 'Kangema', activeCases: 8, spreadVelocity: '+3 farms/week', riskLevel: 'high' },
    { county: 'Kiambu', ward: 'Tigoni', activeCases: 5, spreadVelocity: '+1 farm/week', riskLevel: 'medium' },
    { county: 'Nyeri', ward: 'Nyeri Central', activeCases: 2, spreadVelocity: 'Stable', riskLevel: 'low' },
    { county: 'Meru', ward: 'Meru Town', activeCases: 1, spreadVelocity: 'Stable', riskLevel: 'low' },
    { county: 'Bungoma', ward: 'Bungoma East', activeCases: 6, spreadVelocity: '+2 farms/week', riskLevel: 'high' },
  ];

  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#C0392B' }}
            >
              <Activity className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Active Clusters
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            5
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#C0392B' }}>
            Geo-detected outbreaks
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D97706' }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Avg Spread Velocity
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            +2.1
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
            farms/week
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <MapPin className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Broadcast Alerts Sent
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            142
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
            Last 30 days
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1E40AF' }}
            >
              <Users className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Farmers in High-Risk Zones
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            28
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF' }}>
            Requires monitoring
          </p>
        </div>
      </div>

      {/* Cluster Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E0DDD6',
          borderRadius: '8px',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  County & Ward
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Active Cases
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Spread Velocity
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Risk Level
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {clusterData.map((cluster, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== clusterData.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p 
                        className="text-sm mb-1" 
                        style={{ 
                          fontFamily: 'IBM Plex Sans, sans-serif', 
                          color: '#1B4332',
                          fontWeight: '600',
                        }}
                      >
                        {cluster.county}
                      </p>
                      <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        {cluster.ward}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p 
                      className="text-sm" 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: '#1B4332',
                        fontWeight: '600',
                      }}
                    >
                      {cluster.activeCases}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p 
                      className="text-sm" 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: cluster.spreadVelocity === 'Stable' ? '#15803D' : '#C0392B',
                        fontWeight: '600',
                      }}
                    >
                      {cluster.spreadVelocity}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <RiskLevelBadge level={cluster.riskLevel as 'high' | 'medium' | 'low'} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="px-3 py-1 rounded-lg border transition-colors hover:bg-gray-50 text-xs"
                      style={{
                        borderColor: '#E0DDD6',
                        color: '#2D6A4F',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      Send Area Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// IPM Advisory Audit Report
function IPMAuditReport() {
  const auditData = [
    { caseId: 'CSE-1024', pest: 'False Codling Moth', ipmResolution: 'Chemical', approved: true, phiRecorded: true, agronomist: 'Dr. James Kariuki' },
    { caseId: 'CSE-1018', pest: 'Avocado Thrips', ipmResolution: 'Biological', approved: true, phiRecorded: false, agronomist: 'Dr. Sarah Mwangi' },
    { caseId: 'CSE-1012', pest: 'Fruit Fly', ipmResolution: 'Cultural', approved: true, phiRecorded: false, agronomist: 'Dr. James Kariuki' },
    { caseId: 'CSE-1009', pest: 'Root Rot', ipmResolution: 'Chemical', approved: true, phiRecorded: true, agronomist: 'Dr. John Maina' },
    { caseId: 'CSE-1005', pest: 'Scale Insects', ipmResolution: 'Biological', approved: true, phiRecorded: false, agronomist: 'Dr. Sarah Mwangi' },
  ];

  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#15803D' }}
            >
              <Shield className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            IPM Resolution Rate
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            68%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D' }}>
            Biological/Cultural controls
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D97706' }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Chemical Interventions
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            32%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
            Agronomist approved
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            PHI Compliance
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            100%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
            All recorded
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1E40AF' }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Approval Rate
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            100%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF' }}>
            Governance trail complete
          </p>
        </div>
      </div>

      {/* Audit Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E0DDD6',
          borderRadius: '8px',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Case ID
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Pest/Disease
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  IPM Resolution
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Approved By
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  PHI Recorded
                </th>
              </tr>
            </thead>
            <tbody>
              {auditData.map((item, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== auditData.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <p 
                      style={{ 
                        fontFamily: 'IBM Plex Mono, monospace', 
                        color: '#2D6A4F',
                        fontWeight: '600',
                        fontSize: '14px',
                      }}
                    >
                      {item.caseId}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p 
                      className="text-sm" 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: '#1B4332',
                        fontWeight: '600',
                      }}
                    >
                      {item.pest}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded text-xs"
                      style={{
                        backgroundColor: item.ipmResolution === 'Chemical' ? '#FEF3C7' : '#DCFCE7',
                        color: item.ipmResolution === 'Chemical' ? '#D97706' : '#15803D',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderRadius: '8px',
                        fontWeight: '600',
                      }}
                    >
                      {item.ipmResolution}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p 
                      className="text-sm" 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: '#1B4332',
                      }}
                    >
                      {item.agronomist}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {item.phiRecorded ? (
                      <CheckCircle className="w-5 h-5" style={{ color: '#15803D' }} />
                    ) : (
                      <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Farmer Compliance Ranking Report
function FarmerRankingReport() {
  const rankingData = [
    { rank: 1, name: 'David Kipchirchir', county: 'Kiambu', scoutingConsistency: 100, cleanBlocks: 95, mvwr: 100 },
    { rank: 2, name: 'Faith Njeri', county: 'Meru', scoutingConsistency: 100, cleanBlocks: 92, mvwr: 100 },
    { rank: 3, name: 'Mary Wambui', county: 'Nyeri', scoutingConsistency: 100, cleanBlocks: 88, mvwr: 100 },
    { rank: 4, name: 'Peter Mwangi', county: 'Murang\'a', scoutingConsistency: 100, cleanBlocks: 75, mvwr: 100 },
    { rank: 5, name: 'John Kimani', county: 'Kiambu', scoutingConsistency: 75, cleanBlocks: 80, mvwr: 75 },
  ];

  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Avg Scouting Consistency
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            91%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
            Weekly compliance
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#15803D' }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Clean Blocks
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            86%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D' }}>
            No pest detected
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1E40AF' }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            MVWR Completion
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            95%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF' }}>
            Minimum viable records
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D97706' }}
            >
              <Users className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Needs Training
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            3
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
            Below 80% threshold
          </p>
        </div>
      </div>

      {/* Ranking Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E0DDD6',
          borderRadius: '8px',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '1px solid #E0DDD6' }}>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Rank
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Farmer Name
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  County
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Scouting Consistency
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  Clean Blocks %
                </th>
                <th 
                  className="text-left px-6 py-4 text-xs uppercase tracking-wider"
                  style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                >
                  MVWR Completion
                </th>
              </tr>
            </thead>
            <tbody>
              {rankingData.map((farmer, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-50/50 transition-colors"
                  style={{ borderBottom: index !== rankingData.length - 1 ? '1px solid #E0DDD6' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: farmer.rank <= 3 ? '#2D6A4F' : '#F7F4EF',
                        color: farmer.rank <= 3 ? '#FFFFFF' : '#1B4332',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        fontWeight: '600',
                      }}
                    >
                      {farmer.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p 
                      className="text-sm" 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: '#1B4332',
                        fontWeight: '600',
                      }}
                    >
                      {farmer.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p 
                      className="text-sm" 
                      style={{ 
                        fontFamily: 'IBM Plex Sans, sans-serif', 
                        color: '#717182',
                      }}
                    >
                      {farmer.county}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E0DDD6' }}>
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${farmer.scoutingConsistency}%`,
                            backgroundColor: farmer.scoutingConsistency >= 90 ? '#74C69D' : farmer.scoutingConsistency >= 75 ? '#D97706' : '#C0392B',
                          }}
                        />
                      </div>
                      <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                        {farmer.scoutingConsistency}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E0DDD6' }}>
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${farmer.cleanBlocks}%`,
                            backgroundColor: '#74C69D',
                          }}
                        />
                      </div>
                      <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                        {farmer.cleanBlocks}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#E0DDD6' }}>
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${farmer.mvwr}%`,
                            backgroundColor: farmer.mvwr >= 90 ? '#74C69D' : farmer.mvwr >= 75 ? '#D97706' : '#C0392B',
                          }}
                        />
                      </div>
                      <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: '600' }}>
                        {farmer.mvwr}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// System Adoption Report
function SystemAdoptionReport() {
  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1E40AF' }}
            >
              <Smartphone className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Smartphone App
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            62%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF' }}>
            7 farmers using app
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D97706' }}
            >
              <Phone className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            USSD/SMS
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            38%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
            5 farmers using USSD
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#15803D' }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            SMS Delivery Success
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            97%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D' }}>
            Last 1000 messages
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Avg Time-to-Submission
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            4.2h
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
            After SMS reminder
          </p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div 
        className="p-12 rounded-lg border text-center"
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderColor: '#E0DDD6', 
          borderRadius: '8px',
        }}
      >
        <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: '#2D6A4F', opacity: 0.3 }} />
        <h3 
          className="mb-2"
          style={{ 
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: '#1B4332',
            fontWeight: '600',
          }}
        >
          Channel Performance Visualization
        </h3>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Interactive charts showing submission trends by channel over time
        </p>
      </div>
    </>
  );
}

// Agronomist Efficiency Report
function AgronomistEfficiencyReport() {
  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              <Zap className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Avg Time to Triage
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            2.4h
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#2D6A4F' }}>
            From submission to review
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#15803D' }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Case Closure Rate
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            87%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#15803D' }}>
            Within 7 days
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1E40AF' }}
            >
              <Activity className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Active Cases in Queue
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            12
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1E40AF' }}>
            Current workload
          </p>
        </div>

        <div 
          className="p-6 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D97706' }}
            >
              <Clock className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </div>
          </div>
          <p className="text-xs uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Follow-up Adherence
          </p>
          <p className="text-3xl mb-1" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            92%
          </p>
          <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#D97706' }}>
            Scheduled visits completed
          </p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div 
        className="p-12 rounded-lg border text-center"
        style={{ 
          backgroundColor: '#FFFFFF', 
          borderColor: '#E0DDD6', 
          borderRadius: '8px',
        }}
      >
        <TrendingUp className="w-16 h-16 mx-auto mb-4" style={{ color: '#2D6A4F', opacity: 0.3 }} />
        <h3 
          className="mb-2"
          style={{ 
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: '#1B4332',
            fontWeight: '600',
          }}
        >
          Agronomist Performance Dashboard
        </h3>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Case resolution trends and workload distribution by agronomist
        </p>
      </div>
    </>
  );
}
