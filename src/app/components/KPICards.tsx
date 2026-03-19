import type { ComponentType } from 'react';
import { Users, FolderOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import type { CaseManagementKpi } from '../api/types';

interface KPICardProps {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

function KPICard({ title, value, icon: Icon, iconColor, iconBg }: KPICardProps) {
  return (
    <div 
      className="rounded-lg p-6 border"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD6',
        borderRadius: '8px',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p 
            className="text-sm mb-2" 
            style={{ 
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: '#717182'
            }}
          >
            {title}
          </p>
          <p 
            className="text-3xl" 
            style={{ 
              fontFamily: 'DM Serif Display, serif',
              color: '#1B4332'
            }}
          >
            {value}
          </p>
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

const KPI_ICONS: Record<CaseManagementKpi['icon'], ComponentType<{ className?: string }>> = {
  users: Users,
  folder: FolderOpen,
  alert: AlertTriangle,
  check: CheckCircle,
};

export function KPICards({ kpis }: { kpis: CaseManagementKpi[] }) {
  return (
    <div className="mb-4 grid min-w-0 max-w-full grid-cols-2 gap-3 sm:mb-5 sm:gap-4 lg:grid-cols-4 lg:gap-6 [&>*]:min-w-0">
      {kpis.map((kpi, index) => {
        const Icon = KPI_ICONS[kpi.icon];
        return (
          <KPICard
            key={`${kpi.title}-${index}`}
            title={kpi.title}
            value={kpi.value}
            icon={Icon}
            iconColor={kpi.iconColor}
            iconBg={kpi.iconBg}
          />
        );
      })}
    </div>
  );
}
