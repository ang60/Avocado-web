import { Users, FolderOpen, AlertTriangle, CheckCircle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
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

export function KPICards() {
  const kpis = [
    {
      title: 'Scouts This Week',
      value: '142',
      icon: Users,
      iconColor: '#2D6A4F',
      iconBg: '#74C69D20',
    },
    {
      title: 'Open Cases',
      value: '38',
      icon: FolderOpen,
      iconColor: '#2D6A4F',
      iconBg: '#74C69D20',
    },
    {
      title: 'High Severity',
      value: '7',
      icon: AlertTriangle,
      iconColor: '#DC2626',
      iconBg: '#FEE2E2',
    },
    {
      title: 'Compliance',
      value: '84%',
      icon: CheckCircle,
      iconColor: '#74C69D',
      iconBg: '#74C69D20',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}
