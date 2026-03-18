import { Layout } from '../components/Layout';
import { Bell, AlertTriangle, Info, CheckCircle, Clock, Map, FileText, Users, Settings, X, MapPin, TrendingUp, Eye, Radio, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchAlerts } from '../api/placeholderApi';
import type { PlaceholderAlert } from '../api/types';

export function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<PlaceholderAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showConfigureRules, setShowConfigureRules] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchAlerts()
      .then((data) => {
        if (!cancelled) {
          setAlerts(data);
          setAlertsError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setAlertsError('Could not load alerts.');
      })
      .finally(() => {
        if (!cancelled) setAlertsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const markAlertRead = (alertId: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const handlePrimaryAction = (alert: PlaceholderAlert, action: { route: string | null }) => {
    markAlertRead(alert.id);
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

  if (alertsLoading) {
    return (
      <Layout>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Loading alerts…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {alertsError && (
        <div
          className="mb-4 p-4 rounded-lg border"
          style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}
        >
          {alertsError}
        </div>
      )}
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 
              className="text-4xl mb-2" 
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                color: '#1B4332'
              }}
            >
              Alert Command Center
            </h1>
            <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6' }}>
              Case-action alerts with geo-cluster detection and severity escalation
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2 border"
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
              className="px-4 py-3 rounded-lg transition-all hover:shadow-md flex items-center gap-2"
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

      {/* Summary Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-8">
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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: '#E0DDD6' }}>
        <button
          onClick={() => setSelectedFilter('all')}
          className="px-4 py-3 transition-colors relative"
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
          className="px-4 py-3 transition-colors relative"
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
          className="px-4 py-3 transition-colors relative flex items-center gap-2"
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
          className="px-4 py-3 transition-colors relative flex items-center gap-2"
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
          className="px-4 py-3 transition-colors relative flex items-center gap-2"
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

                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center relative"
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
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <h3 style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontSize: '18px', fontWeight: 600 }}>
                            {alert.title}
                          </h3>
                          {!alert.read && (
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: '#2D6A4F' }}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                            {alert.timestamp}
                          </span>
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                            style={{ color: '#717182' }}
                            title="Dismiss"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182', lineHeight: '1.6', marginBottom: '16px' }}>
                        {alert.message}
                      </p>

                      {/* Geo-Cluster Context (for outbreak alerts) */}
                      {alert.geoCluster && (
                        <div 
                          className="p-4 rounded-lg mb-4 border"
                          style={{ backgroundColor: '#F7F4EF', borderColor: '#E0DDD6' }}
                        >
                          <div className="flex items-start gap-4">
                            <div 
                              className="w-24 h-24 rounded flex items-center justify-center border"
                              style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                            >
                              <div className="text-center">
                                <MapPin className="w-8 h-8 mx-auto mb-1" style={{ color: '#DC2626' }} />
                                <p className="text-xs" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#717182' }}>
                                  {alert.geoCluster.radius}
                                </p>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                Geo-Cluster Detection
                              </h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>County</p>
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                    {alert.geoCluster.county}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Cluster Radius</p>
                                  <p style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332', fontWeight: 600 }}>
                                    {alert.geoCluster.radius}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Center Point</p>
                                  <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332', fontWeight: 600 }}>
                                    {alert.geoCluster.centerPoint}
                                  </p>
                                </div>
                                <div>
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
                          <div className="flex items-center gap-2">
                            {alert.affectedFarmers.slice(0, 4).map((farmer, index) => (
                              <div
                                key={farmer.id}
                                className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                                style={{
                                  backgroundColor: '#2D6A4F',
                                  borderColor: '#FFFFFF',
                                  color: '#F7F4EF',
                                  fontFamily: 'IBM Plex Sans, sans-serif',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  marginLeft: index > 0 ? '-8px' : '0',
                                  zIndex: 10 - index,
                                }}
                                title={farmer.name}
                              >
                                {farmer.initials}
                              </div>
                            ))}
                            {alert.affectedFarmers.length > 4 && (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                                style={{
                                  backgroundColor: '#E0DDD6',
                                  borderColor: '#FFFFFF',
                                  color: '#1B4332',
                                  fontFamily: 'IBM Plex Sans, sans-serif',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  marginLeft: '-8px',
                                }}
                              >
                                +{alert.affectedFarmers.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Footer */}
                      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E0DDD6' }}>
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2 py-1 rounded text-xs"
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
                            className="px-2 py-1 rounded text-xs"
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

                        <div className="flex items-center gap-2">
                          {/* Secondary Action */}
                          {alert.secondaryAction.route !== null && (
                            <button
                              onClick={() => alert.secondaryAction.route ? navigate(alert.secondaryAction.route) : handleDismiss(alert.id)}
                              className="px-4 py-2 rounded-lg transition-colors border text-sm"
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
                            onClick={() => handlePrimaryAction(alert, alert.primaryAction)}
                            className="px-4 py-2 rounded-lg transition-all hover:shadow-md flex items-center gap-2 text-sm"
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
    </Layout>
  );
}