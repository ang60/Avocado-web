import { useEffect, useMemo, useState, type ComponentType, type CSSProperties } from 'react';
import { Shield, TrendingUp, AlertTriangle, FileText, Scale, History } from 'lucide-react';
import { fetchKephisQuarantineBlocks, fetchKephisAlerts } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';
import { AppLink } from '../components/AppLink';

export function KEPHISHome() {
  const [restrictedBlocks, setRestrictedBlocks] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchKephisQuarantineBlocks(), fetchKephisAlerts()])
      .then(([blocks, alerts]) => {
        if (cancelled) return;
        setTotalBlocks(blocks.length);
        setRestrictedBlocks(blocks.filter((b) => b.kephisStatus === 'gated').length);
        setActiveAlerts(alerts.length);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(getApiErrorMessage(e, 'Could not load KEPHIS home metrics.'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const exportReadyRate = useMemo(() => {
    if (!totalBlocks) return 0;
    return Math.max(0, Math.round(((totalBlocks - restrictedBlocks) / totalBlocks) * 100));
  }, [restrictedBlocks, totalBlocks]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="mb-1 text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          KEPHIS Dashboard Home
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          National command center overview and quick actions
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Metric title="Global Export Status" value={`${exportReadyRate}%`} icon={TrendingUp} color="#2D6A4F" />
        <Metric title="Restricted Blocks" value={String(restrictedBlocks)} icon={Shield} color="#C0392B" />
        <Metric title="Active Alerts" value={String(activeAlerts)} icon={AlertTriangle} color="#F39C12" />
        <Metric title="Registered Blocks" value={String(totalBlocks)} icon={Scale} color="#1B4332" />
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border p-3 text-sm" style={{ borderColor: '#E0DDD6', color: '#b45309' }}>
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink to="/kephis-quarantine" title="Quarantine Management" description="Manage movement restrictions and statuses" icon={Shield} />
        <QuickLink to="/kephis-quarantine/risk-intelligence" title="Risk Intelligence" description="Inspect clusters and pressure trends" icon={TrendingUp} />
        <QuickLink to="/kephis-quarantine/alerts" title="Alerts" description="Review real-time threshold violations" icon={AlertTriangle} />
        <QuickLink to="/kephis-quarantine/chain-of-custody" title="Chain of Custody" description="Audit full action timelines by block" icon={History} />
        <QuickLink to="/kephis-quarantine/threshold-settings" title="Threshold Settings" description="View and update national pest limits" icon={Scale} />
        <QuickLink to="/kephis-quarantine/export-reports" title="Export Reports" description="Download official compliance reports" icon={FileText} />
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  color: string;
}) {
  return (
    <div className="rounded-lg border-2 p-5" style={{ borderColor: color, backgroundColor: '#FFFFFF' }}>
      <div className="mb-2 flex items-center justify-between">
        <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', fontSize: '13px' }}>{title}</span>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
}) {
  return (
    <AppLink
      to={to}
      className="rounded-lg border p-4 transition-all hover:shadow-sm"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', textDecoration: 'none' }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: '#2D6A4F' }} />
        <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>{title}</span>
      </div>
      <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
        {description}
      </p>
    </AppLink>
  );
}
