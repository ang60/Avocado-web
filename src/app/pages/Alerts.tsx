import { Bell, AlertTriangle, Info, CheckCircle, Clock, Map, FileText, Users, Settings, X, MapPin, TrendingUp, Eye, Radio, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const alerts = [
  {
    id: 'ALT-1245',
    type: 'biological',
    severity: 'critical',
    title: 'Critical Outbreak Alert: Avocado Thrips',
    message: 'Outbreak spreading rapidly in Murang\'a County. Immediate action required for 12 affected farms within 5km cluster radius.',
    timestamp: '2 hours ago',
    read: false,
    category: 'outbreak',
    affectedFarmers: [
      { id: 'FRM-234', name: 'Peter Kamau', initials: 'PK' },
      { id: 'FRM-198', name: 'Grace Njeri', initials: 'GN' },
      { id: 'FRM-156', name: 'John Mwangi', initials: 'JM' },
      { id: 'FRM-167', name: 'Mary Wanjiru', initials: 'MW' },
    ],
    geoCluster: {
      county: 'Murang\'a',
      radius: '5km',
      centerPoint: 'Kangema Trading Center',
      affectedFarms: 12,
    },
    primaryAction: {
      label: 'View Heatmap',
      route: '/outbreak-monitoring',
      icon: 'map',
    },
    secondaryAction: {
      label: 'Review Cases',
      route: '/case-management',
    },
  },
  {
    id: 'ALT-1244',
    type: 'compliance',
    severity: 'warning',
    title: 'High Severity Case Threshold Exceeded',
    message: 'Number of high severity cases has exceeded weekly threshold (7 cases). Review urgently needed.',
    timestamp: '4 hours ago',
    read: false,
    category: 'threshold',
    primaryAction: {
      label: 'Generate Report',
      route: '/compliance-hub',
      icon: 'report',
    },
    secondaryAction: {
      label: 'View Dashboard',
      route: '/',
    },
  },
  {
    id: 'ALT-1243',
    type: 'compliance',
    severity: 'warning',
    title: 'Pending Advisory Review',
    message: '5 cases are pending advisory issuance for more than 48 hours. Action needed.',
    timestamp: '6 hours ago',
    read: false,
    category: 'pending',
    affectedFarmers: [
      { id: 'FRM-089', name: 'David Kariuki', initials: 'DK' },
      { id: 'FRM-123', name: 'Sarah Akinyi', initials: 'SA' },
      { id: 'FRM-145', name: 'James Ochieng', initials: 'JO' },
    ],
    primaryAction: {
      label: 'Go to Triage',
      route: '/case-management',
      icon: 'triage',
    },
    secondaryAction: {
      label: 'Dismiss',
      route: null,
    },
  },
  {
    id: 'ALT-1242',
    type: 'biological',
    severity: 'critical',
    title: 'New Pest Detection: Spotted Wing Drosophila',
    message: 'First detection in Meru County. Quarantine protocols initiated. 3 farms under monitoring.',
    timestamp: '1 day ago',
    read: true,
    category: 'detection',
    geoCluster: {
      county: 'Meru',
      radius: '3km',
      centerPoint: 'Nkubu Township',
      affectedFarms: 3,
    },
    primaryAction: {
      label: 'View Heatmap',
      route: '/outbreak-monitoring',
      icon: 'map',
    },
    secondaryAction: {
      label: 'View KB Article',
      route: '/knowledge-base/KB-052',
    },
  },
  {
    id: 'ALT-1241',
    type: 'system',
    severity: 'info',
    title: 'New Scouting Reports Available',
    message: '24 new scouting reports submitted today. 3 require immediate review.',
    timestamp: '1 day ago',
    read: true,
    category: 'report',
    primaryAction: {
      label: 'Review Reports',
      route: '/scouting-reports',
      icon: 'report',
    },
    secondaryAction: {
      label: 'Mark as Read',
      route: null,
    },
  },
  {
    id: 'ALT-1240',
    type: 'system',
    severity: 'success',
    title: 'Case Resolution Milestone',
    message: 'Congratulations! Your team has maintained 87% resolution rate for 4 consecutive weeks.',
    timestamp: '2 days ago',
    read: true,
    category: 'milestone',
    primaryAction: {
      label: 'View Analytics',
      route: '/',
      icon: 'analytics',
    },
    secondaryAction: {
      label: 'Dismiss',
      route: null,
    },
  },
  {
    id: 'ALT-1239',
    type: 'compliance',
    severity: 'warning',
    title: 'Overdue Scouting Inspections',
    message: '8 farms have not submitted scouting reports in 14+ days. Compliance check required.',
    timestamp: '2 days ago',
    read: true,
    category: 'overdue',
    primaryAction: {
      label: 'View Farmers',
      route: '/farmers',
      icon: 'users',
    },
    secondaryAction: {
      label: 'Send Reminders',
      route: null,
    },
  },
  {
    id: 'ALT-1238',
    type: 'system',
    severity: 'info',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance on March 18, 2026 from 2:00 AM to 4:00 AM EAT.',
    timestamp: '3 days ago',
    read: true,
    category: 'system',
    primaryAction: {
      label: 'View Details',
      route: null,
      icon: 'info',
    },
    secondaryAction: {
      label: 'Dismiss',
      route: null,
    },
  },
];

export function Alerts() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showConfigureRules, setShowConfigureRules] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const unreadCount = alerts.filter(a => !a.read && !dismissedAlerts.includes(a.id)).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !dismissedAlerts.includes(a.id)).length;
  const biologicalCount = alerts.filter(a => a.type === 'biological' && !dismissedAlerts.includes(a.id)).length;
  const complianceCount = alerts.filter(a => a.type === 'compliance' && !dismissedAlerts.includes(a.id)).length;

  const getAlertTypeConfig = (type: string) => {
    const configs = {
      biological: {
        label: 'Biological Alerts',
        color: '#DC2626',
        bg: '#FEE2E2',
        description: 'Outbreaks, severity escalations, or new pest detections',
      },
      compliance: {
        label: 'Compliance Alerts',
        color: '#D97706',
        bg: '#FEF3C7',
        description: 'Overdue scouting or missing logs',
      },
      system: {
        label: 'System Alerts',
        color: '#1E40AF',
        bg: '#DBEAFE',
        description: 'Maintenance or milestones',
      },
    };
    return configs[type as keyof typeof configs] || configs.system;
  };

  const getSeverityConfig = (severity: string) => {
    const configs = {
      critical: {
        border: '#DC2626',
        iconColor: '#DC2626',
        pulse: true,
      },
      warning: {
        border: '#D97706',
        iconColor: '#D97706',
        pulse: false,
      },
      info: {
        border: '#1E40AF',
        iconColor: '#1E40AF',
        pulse: false,
      },
      success: {
        border: '#2D6A4F',
        iconColor: '#74C69D',
        pulse: false,
      },
    };
    return configs[severity as keyof typeof configs] || configs.info;
  };

  const getActionIcon = (iconType: string | undefined) => {
    switch (iconType) {
      case 'map':
        return Map;
      case 'report':
        return FileText;
      case 'triage':
        return Users;
      case 'users':
        return Users;
      case 'analytics':
        return TrendingUp;
      case 'info':
        return Info;
      default:
        return Eye;
    }
  };

  const handleMarkAllRead = () => {
    // In a real app, this would update the backend
    console.log('Mark all as read');
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const handlePrimaryAction = (action: any) => {
    if (action.route) {
      navigate(action.route);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (dismissedAlerts.includes(alert.id)) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !alert.read;
    return alert.type === selectedFilter;
  });

  const visibleAlerts = filteredAlerts;

  return (
    <>
      {/* Header */}
      <header className="mb-4 md:mb-5">
        <div className="mb-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 
              className="mb-1 text-2xl sm:text-3xl" 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                color: '#1B4332'
              }}
            >
              Alert Command Center
            </h1>
            <p className="text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6' }}>
              Case-action alerts with geo-cluster detection and severity escalation
            </p>
          </div>
          <div className="flex min-w-0 w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-shrink-0 sm:gap-3">
            <button
              onClick={handleMarkAllRead}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all hover:shadow-md sm:w-auto"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
                color: '#1B4332',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read
            </button>
            <button
              onClick={() => setShowConfigureRules(true)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-4 py-3 transition-all hover:shadow-md sm:w-auto"
              style={{ 
                backgroundColor: '#2D6A4F',
                color: '#F7F4EF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderRadius: '8px',
              }}
            >
              <Settings className="w-4 h-4" />
              Configure Rules
            </button>
          </div>
        </div>
      </header>

      {/* Summary Metrics — single column on narrow phones to avoid clipped cards */}
      <div className="mb-4 grid min-w-0 grid-cols-1 gap-3 sm:mb-5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Total
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {alerts.length - dismissedAlerts.length}
          </p>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#DC2626', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" style={{ color: '#DC2626' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Critical
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#DC2626' }}>
            {criticalCount}
          </p>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: '#2D6A4F' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Unread
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {unreadCount}
          </p>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#DC2626', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4" style={{ color: '#DC2626' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Biological
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {biologicalCount}
          </p>
        </div>

        <div 
          className="p-4 rounded-lg border"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#D97706', borderRadius: '8px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4" style={{ color: '#D97706' }} />
            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              Compliance
            </span>
          </div>
          <p className="text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            {complianceCount}
          </p>
        </div>
      </div>

      {/* Filter Tabs — horizontal scroll on small screens so no tab is clipped */}
      <div
        className="-mx-1 mb-6 flex min-w-0 gap-1 overflow-x-auto border-b px-1 pb-px touch-pan-x overscroll-x-contain [-webkit-overflow-scrolling:touch] sm:mx-0 sm:gap-2 sm:px-0"
        style={{ borderColor: '#E0DDD6' }}
      >
        <button
          onClick={() => setSelectedFilter('all')}
          className="relative shrink-0 whitespace-nowrap px-3 py-3 transition-colors sm:px-4"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: selectedFilter === 'all' ? '#1B4332' : '#717182',
            fontWeight: selectedFilter === 'all' ? 600 : 400,
            borderBottom: selectedFilter === 'all' ? '3px solid #2D6A4F' : 'none',
          }}
        >
          All Alerts ({alerts.length - dismissedAlerts.length})
        </button>
        <button
          onClick={() => setSelectedFilter('unread')}
          className="relative shrink-0 whitespace-nowrap px-3 py-3 transition-colors sm:px-4"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: selectedFilter === 'unread' ? '#1B4332' : '#717182',
            fontWeight: selectedFilter === 'unread' ? 600 : 400,
            borderBottom: selectedFilter === 'unread' ? '3px solid #2D6A4F' : 'none',
          }}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setSelectedFilter('biological')}
          className="relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 transition-colors sm:px-4"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: selectedFilter === 'biological' ? '#1B4332' : '#717182',
            fontWeight: selectedFilter === 'biological' ? 600 : 400,
            borderBottom: selectedFilter === 'biological' ? '3px solid #DC2626' : 'none',
          }}
        >
          <Radio className="w-4 h-4" style={{ color: '#DC2626' }} />
          Biological ({biologicalCount})
        </button>
        <button
          onClick={() => setSelectedFilter('compliance')}
          className="relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 transition-colors sm:px-4"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: selectedFilter === 'compliance' ? '#1B4332' : '#717182',
            fontWeight: selectedFilter === 'compliance' ? 600 : 400,
            borderBottom: selectedFilter === 'compliance' ? '3px solid #D97706' : 'none',
          }}
        >
          <CheckCircle className="w-4 h-4" style={{ color: '#D97706' }} />
          Compliance ({complianceCount})
        </button>
        <button
          onClick={() => setSelectedFilter('system')}
          className="relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 transition-colors sm:px-4"
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: selectedFilter === 'system' ? '#1B4332' : '#717182',
            fontWeight: selectedFilter === 'system' ? 600 : 400,
            borderBottom: selectedFilter === 'system' ? '3px solid #1E40AF' : 'none',
          }}
        >
          <Info className="w-4 h-4" style={{ color: '#1E40AF' }} />
          System
        </button>
      </div>

      {/* Alerts List */}
      {visibleAlerts.length === 0 ? (
        <div 
          className="p-12 rounded-lg border text-center"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6', borderRadius: '8px' }}
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#74C69D20' }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: '#2D6A4F' }} />
          </div>
          <h3 className="mb-2" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332', fontSize: '24px' }}>
            No alerts today
          </h3>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            The rules engine will notify you when thresholds are met.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleAlerts.map((alert) => {
            const severityConfig = getSeverityConfig(alert.severity);
            const typeConfig = getAlertTypeConfig(alert.type);
            const ActionIcon = getActionIcon(alert.primaryAction.icon);

            return (
              <div 
                key={alert.id}
                className="rounded-lg border transition-all hover:shadow-lg relative overflow-hidden"
                style={{
                  backgroundColor: alert.read ? '#FFFFFF' : '#FAFDF8',
                  borderColor: severityConfig.border,
                  borderRadius: '8px',
                  borderLeftWidth: '4px',
                  borderLeftColor: severityConfig.border,
                }}
              >
                {/* Pulse animation for critical alerts */}
                {severityConfig.pulse && !alert.read && (
                  <div 
                    className="absolute top-4 left-4 w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: '#DC2626' }}
                  />
                )}

                <div className="min-w-0 p-4 sm:p-6">
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                    {/* Icon */}
                    <div 
                      className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg sm:mt-0"
                      style={{ backgroundColor: typeConfig.bg }}
                    >
                      {alert.type === 'biological' ? (
                        <Radio className="w-6 h-6" style={{ color: severityConfig.iconColor }} />
                      ) : alert.type === 'compliance' ? (
                        <AlertTriangle className="w-6 h-6" style={{ color: severityConfig.iconColor }} />
                      ) : (
                        <Info className="w-6 h-6" style={{ color: severityConfig.iconColor }} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
                          <h3
                            className="min-w-0 break-words text-base sm:text-lg"
                            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}
                          >
                            {alert.title}
                          </h3>
                          {!alert.read && (
                            <div 
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: '#2D6A4F' }}
                            />
                          )}
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:pl-2">
                          <span
                            className="text-sm whitespace-nowrap"
                            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
                          >
                            {alert.timestamp}
                          </span>
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="shrink-0 rounded p-2 transition-colors hover:bg-gray-100"
                            style={{ color: '#717182' }}
                            title="Dismiss"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="mb-4 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6' }}>
                        {alert.message}
                      </p>

                      {/* Geo-Cluster Context (for outbreak alerts) */}
                      {alert.geoCluster && (
                        <div 
                          className="mb-4 min-w-0 rounded-lg border p-3 sm:p-4"
                          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
                        >
                          <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-start">
                            <div 
                              className="mx-auto flex h-24 w-full max-w-[12rem] shrink-0 items-center justify-center rounded border sm:mx-0 sm:h-24 sm:w-24 sm:max-w-none"
                              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                            >
                              <div className="text-center">
                                <MapPin className="mx-auto mb-1 h-8 w-8" style={{ color: '#DC2626' }} />
                                <p className="text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#717182' }}>
                                  {alert.geoCluster.radius}
                                </p>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                Geo-Cluster Detection
                              </h4>
                              <div className="grid min-w-0 grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                <div className="min-w-0">
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>County</p>
                                  <p className="break-words" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                    {alert.geoCluster.county}
                                  </p>
                                </div>
                                <div className="min-w-0">
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Cluster Radius</p>
                                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332', fontWeight: 600 }}>
                                    {alert.geoCluster.radius}
                                  </p>
                                </div>
                                <div className="min-w-0 sm:col-span-2">
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Center Point</p>
                                  <p className="break-words" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                    {alert.geoCluster.centerPoint}
                                  </p>
                                </div>
                                <div className="min-w-0">
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Affected Farms</p>
                                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#DC2626', fontWeight: 600 }}>
                                    {alert.geoCluster.affectedFarms}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Affected Farmers Avatar Group */}
                      {alert.affectedFarmers && alert.affectedFarmers.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                            Affected Farmers ({alert.affectedFarmers.length})
                          </p>
                          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-0">
                            {alert.affectedFarmers.slice(0, 4).map((farmer, index) => (
                              <div
                                key={farmer.id}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 sm:-ml-2 first:sm:ml-0"
                                style={{
                                  backgroundColor: '#2D6A4F',
                                  borderColor: '#FFFFFF',
                                  color: '#F7F4EF',
                                  fontFamily: 'IBM Plex Sans, sans-serif',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  zIndex: 10 - index,
                                }}
                                title={farmer.name}
                              >
                                {farmer.initials}
                              </div>
                            ))}
                            {alert.affectedFarmers.length > 4 && (
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-full border-2 sm:-ml-2"
                                style={{
                                  backgroundColor: '#E0DDD6',
                                  borderColor: '#FFFFFF',
                                  color: '#1B4332',
                                  fontFamily: 'IBM Plex Sans, sans-serif',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                              >
                                +{alert.affectedFarmers.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Footer */}
                      <div
                        className="flex min-w-0 flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
                        style={{ borderColor: '#E0DDD6' }}
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span 
                            className="rounded px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: typeConfig.bg,
                              color: typeConfig.color,
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            {typeConfig.label.replace(' Alerts', '')}
                          </span>
                          <span 
                            className="rounded px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: '#E0DDD6',
                              color: '#1B4332',
                              fontFamily: 'IBM Plex Mono, monospace',
                              borderRadius: '4px',
                            }}
                          >
                            {alert.id}
                          </span>
                        </div>

                        <div className="flex min-w-0 w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                          {/* Secondary Action */}
                          {alert.secondaryAction.route !== null && (
                            <button
                              onClick={() => alert.secondaryAction.route ? navigate(alert.secondaryAction.route) : handleDismiss(alert.id)}
                              className="min-h-[40px] w-full rounded-lg border px-4 py-2 text-sm transition-colors sm:w-auto"
                              style={{ 
                                backgroundColor: '#FFFFFF',
                                borderColor: '#E0DDD6',
                                color: '#1B4332',
                                fontFamily: 'IBM Plex Sans, sans-serif',
                              }}
                            >
                              {alert.secondaryAction.label}
                            </button>
                          )}
                          
                          {/* Primary Action */}
                          <button
                            onClick={() => handlePrimaryAction(alert.primaryAction)}
                            className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition-all hover:shadow-md sm:w-auto"
                            style={{ 
                              backgroundColor: '#2D6A4F',
                              color: '#F7F4EF',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              borderRadius: '8px',
                              fontWeight: 600,
                            }}
                          >
                            <ActionIcon className="w-4 h-4" />
                            {alert.primaryAction.label}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Configure Rules Modal */}
      {showConfigureRules && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfigureRules(false)}
        >
          <div 
            className="rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            style={{ backgroundColor: '#F7F4EF', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
              style={{ backgroundColor: '#1B4332', borderColor: '#2D6A4F' }}
            >
              <h2 style={{ fontFamily: 'DM Serif Display, serif', color: '#F7F4EF', fontSize: '24px' }}>
                Alert Rules Configuration
              </h2>
              <button
                onClick={() => setShowConfigureRules(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: '#F7F4EF' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6', marginBottom: '24px' }}>
                Configure severity thresholds, geo-cluster detection rules, and SMS fallback settings for critical alerts.
              </p>
              
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                >
                  <h3 className="mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                    Severity Escalation Threshold
                  </h3>
                  <p className="text-sm mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Trigger alert when high severity cases exceed:
                  </p>
                  <input
                    type="number"
                    defaultValue="7"
                    className="w-full px-4 py-2 rounded border"
                    style={{ 
                      borderColor: '#E0DDD6',
                      fontFamily: 'IBM Plex Mono, monospace',
                      color: '#1B4332',
                    }}
                  />
                </div>

                <div 
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                >
                  <h3 className="mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                    Geo-Cluster Detection Radius
                  </h3>
                  <p className="text-sm mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                    Define cluster when cases occur within:
                  </p>
                  <select
                    defaultValue="5"
                    className="w-full px-4 py-2 rounded border"
                    style={{ 
                      borderColor: '#E0DDD6',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      color: '#1B4332',
                    }}
                  >
                    <option value="3">3 km radius</option>
                    <option value="5">5 km radius</option>
                    <option value="10">10 km radius</option>
                    <option value="15">15 km radius</option>
                  </select>
                </div>

                <div 
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                        SMS Fallback for Critical Alerts
                      </h3>
                      <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                        Send SMS notification for critical biological alerts
                      </p>
                    </div>
                    <label className="relative inline-block w-14 h-8">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div 
                        className="w-14 h-8 rounded-full peer peer-checked:bg-green-600 transition-colors cursor-pointer"
                        style={{ backgroundColor: '#E0DDD6' }}
                      />
                      <div 
                        className="absolute left-1 top-1 w-6 h-6 rounded-full bg-white transition-transform peer-checked:translate-x-6"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer with Buttons */}
            <div 
              className="px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0"
              style={{ 
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
              }}
            >
              <button
                onClick={() => setShowConfigureRules(false)}
                className="px-6 py-3 rounded-lg transition-colors border"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E0DDD6',
                  color: '#1B4332',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfigureRules(false)}
                className="px-6 py-3 rounded-lg transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: '#2D6A4F',
                  color: '#F7F4EF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}