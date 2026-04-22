import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Activity,
  Map as MapIcon,
  Bell,
  BookOpen,
  Users,
  Settings,
  ClipboardCheck,
  Phone,
  Search,
  Menu,
  X,
  Shield,
  Building2,
  Package,
  TrendingUp,
  History as HistoryIcon,
} from 'lucide-react';
import { useLocation } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import { AppLink } from './AppLink';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { useSidebar } from '../context/SidebarContext';
import { OptimizedImage } from './OptimizedImage';
import { getAuthUser, subscribeAuth } from '../auth';
import { hasAppAccess } from '../rbac';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  /** accounts.AppPermission.name — see backend migration 0012 */
  permission: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'nav.dashboard' },
  { name: 'Scouting Reports', icon: FileText, path: '/scouting-reports', permission: 'nav.scouting' },
  { name: 'Case Management', icon: FolderOpen, path: '/case-management', permission: 'nav.cases' },
  { name: 'Outbreak Monitoring', icon: Activity, path: '/outbreak-monitoring', permission: 'nav.outbreak' },
  { name: 'KEPHIS', icon: Shield, path: '/kephis-quarantine', permission: 'nav.kephis' },
  { name: 'HCDA', icon: Building2, path: '/hcda-registry', permission: 'nav.hcda' },
  { name: 'Exporter', icon: Package, path: '/exporter', permission: 'nav.exporter' },
  { name: 'Alerts', icon: Bell, path: '/alerts', permission: 'nav.alerts' },
  { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base', permission: 'nav.knowledge' },
  { name: 'Symptom Codebook', icon: Phone, path: '/symptom-codebook', permission: 'nav.symptom_codebook' },
  { name: 'Farmers', icon: Users, path: '/farmers', permission: 'nav.farmers' },
  { name: 'Reports', icon: ClipboardCheck, path: '/compliance-hub', permission: 'nav.reports' },
  { name: 'Admin', icon: Settings, path: '/admin', permission: 'nav.admin' },
];

const kephisNavItems: NavItem[] = [
  { name: 'Dashboard Home', icon: LayoutDashboard, path: '/dashboard', permission: 'nav.kephis' },
  { name: 'Quarantine Management', icon: Shield, path: '/kephis-quarantine', permission: 'nav.kephis' },
  { name: 'Risk Intelligence', icon: TrendingUp, path: '/kephis-quarantine/risk-intelligence', permission: 'nav.kephis' },
  { name: 'Alerts', icon: Bell, path: '/kephis-quarantine/alerts', permission: 'nav.kephis' },
  { name: 'China Export Farm IDs', icon: ClipboardCheck, path: '/kephis-quarantine/china-farm-ids', permission: 'nav.kephis' },
  { name: 'Chain of Custody', icon: HistoryIcon, path: '/kephis-quarantine/chain-of-custody', permission: 'nav.kephis' },
  { name: 'Threshold Settings', icon: Settings, path: '/kephis-quarantine/threshold-settings', permission: 'nav.kephis' },
  { name: 'Export Reports', icon: ClipboardCheck, path: '/kephis-quarantine/export-reports', permission: 'nav.kephis' },
];

/** Exporter: supply chain + operational visibility (matches backend Exporter role perms). */
const exporterNavItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'nav.dashboard' },
  { name: 'Supply base', icon: Package, path: '/exporter', permission: 'nav.exporter' },
  { name: 'Scouting Reports', icon: FileText, path: '/scouting-reports', permission: 'nav.scouting' },
  { name: 'Case Management', icon: FolderOpen, path: '/case-management', permission: 'nav.cases' },
  { name: 'Outbreak Monitoring', icon: Activity, path: '/outbreak-monitoring', permission: 'nav.outbreak' },
  { name: 'Farmers', icon: Users, path: '/farmers', permission: 'nav.farmers' },
  { name: 'Alerts', icon: Bell, path: '/alerts', permission: 'nav.alerts' },
  { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base', permission: 'nav.knowledge' },
  { name: 'Symptom Codebook', icon: Phone, path: '/symptom-codebook', permission: 'nav.symptom_codebook' },
  { name: 'Reports', icon: ClipboardCheck, path: '/compliance-hub', permission: 'nav.reports' },
];

/** HCDA: county surveillance first, then shared operational and reference areas (matches backend role perms). */
const hcdaNavItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'nav.dashboard' },
  { name: 'County surveillance', icon: Building2, path: '/hcda-registry', permission: 'nav.hcda' },
  { name: 'County reports', icon: ClipboardCheck, path: '/hcda-reports', permission: 'nav.hcda' },
  { name: 'Outbreak Monitoring', icon: Activity, path: '/outbreak-monitoring', permission: 'nav.outbreak' },
  { name: 'Alerts', icon: Bell, path: '/alerts', permission: 'nav.alerts' },
  { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base', permission: 'nav.knowledge' },
  { name: 'Symptom Codebook', icon: Phone, path: '/symptom-codebook', permission: 'nav.symptom_codebook' },
];

/** Agronomists: full dashboard tabs, plus a dedicated reports page. */
const agronomistNavItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'nav.dashboard' },
  { name: 'Triage Queue', icon: Search, path: '/dashboard?tab=triage', permission: 'nav.dashboard' },
  { name: 'My Farmers', icon: Users, path: '/dashboard?tab=my-farmers', permission: 'nav.dashboard' },
  { name: 'Trend Analytics', icon: Activity, path: '/dashboard?tab=analytics', permission: 'nav.dashboard' },
  { name: 'Knowledge Base', icon: BookOpen, path: '/dashboard?tab=kb', permission: 'nav.dashboard' },
  { name: 'Audit Logs', icon: FileText, path: '/dashboard?tab=audit', permission: 'nav.dashboard' },
  { name: 'Scouting Reports', icon: FileText, path: '/scouting-reports', permission: 'nav.scouting' },
  { name: 'Case Management', icon: FolderOpen, path: '/case-management', permission: 'nav.cases' },
  { name: 'Outbreak Monitoring', icon: Activity, path: '/outbreak-monitoring', permission: 'nav.outbreak' },
  { name: 'Alerts', icon: Bell, path: '/alerts', permission: 'nav.alerts' },
  { name: 'Symptom Codebook', icon: Phone, path: '/symptom-codebook', permission: 'nav.symptom_codebook' },
  { name: 'Reports', icon: ClipboardCheck, path: '/agronomist-reports', permission: 'nav.reports' },
];

function getNavItemsForRole(roleName?: string | null): NavItem[] {
  const normalized = (roleName || '').trim().toLowerCase();
  if (roleName === 'Farmer') {
    return farmerNavItems;
  }
  if (roleName === 'Agronomist') {
    return agronomistNavItems;
  }
  if (normalized.includes('kephis')) {
    return kephisNavItems;
  }
  if (normalized.includes('hcda')) {
    return hcdaNavItems;
  }
  return navItems;
}

const farmerNavItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'nav.dashboard' },
  { name: 'My Farm Blocks', icon: MapIcon, path: '/my-farm-blocks', permission: 'nav.scouting' },
  { name: 'Scouting Reports', icon: FileText, path: '/scouting-reports', permission: 'nav.scouting' },
  { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base', permission: 'nav.knowledge' },
  { name: 'Compliance & Permits', icon: ClipboardCheck, path: '/compliance-permits', permission: 'nav.reports' },
];

function SidebarNavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const [authEpoch, setAuthEpoch] = useState(0);
  useEffect(() => subscribeAuth(() => setAuthEpoch((e) => e + 1)), []);

  const visibleItems = useMemo(() => {
    const user = getAuthUser();
    const roleName = user?.role_details?.role_name || user?.role?.role_name || '';
    const source = getNavItemsForRole(roleName);
    return source.filter((item) => hasAppAccess(user, item.permission));
  }, [authEpoch]);

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3">
      <ul className="space-y-1 pb-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = (() => {
            const itemHasQuery = item.path.includes('?');
            if (item.path === '/') {
              return location.pathname === '/' || location.pathname === '/dashboard';
            }
            if (item.path === '/exporter') {
              return location.pathname === '/exporter';
            }
            if (itemHasQuery) {
              return `${location.pathname}${location.search}` === item.path;
            }
            return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          })();
          return (
            <li key={item.name}>
              <AppLink
                to={item.path}
                onClick={() => onNavigate?.()}
                className={`
                      w-full flex items-center gap-3 rounded-lg px-4 py-3 transition-all
                      ${
                        isActive
                          ? 'text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                      ${collapsed ? 'justify-center px-0' : ''}
                    `}
                style={{
                  backgroundColor: isActive ? '#2D6A4F' : 'transparent',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                }}
                title={collapsed ? item.name : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar() {
  const { isCollapsed, setIsCollapsed, isMobile, mobileNavOpen, closeMobileNav } = useSidebar();

  const desktopWidth = isCollapsed ? 72 : 240;

  return (
    <>
      {/* Desktop: collapse toggle */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 z-50 hidden rounded-lg p-2 transition-all hover:bg-white/10 md:flex"
        style={{
          left: isCollapsed ? '56px' : '224px',
          backgroundColor: '#2D6A4F',
        }}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <Menu className="h-5 w-5 text-white" /> : <X className="h-5 w-5 text-white" />}
      </button>

      {/* Mobile drawer backdrop */}
      {isMobile && (
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${
            mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden
          onClick={closeMobileNav}
        />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <aside
          className={`fixed left-0 top-0 z-50 flex h-dvh max-h-screen w-[min(88vw,300px)] flex-col border-r border-white/10 transition-transform duration-300 md:hidden ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: '#1B4332' }}
        >
          <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <OptimizedImage
                src={avocadoLogo}
                alt="AvoGuard"
                priority
                width={40}
                height={40}
                className="h-10 w-10 flex-shrink-0"
              />
              <div className="min-w-0">
                <h1
                  className="truncate text-xl text-white"
                  style={{ fontFamily: 'DM Serif Display, serif' }}
                >
                  AvoGuard
                </h1>
                <p
                  className="truncate text-xs opacity-75"
                  style={{ color: '#74C69D', fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  Pest & Disease Monitor
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMobileNav}
              className="flex-shrink-0 rounded-lg p-2 text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarNavLinks collapsed={false} onNavigate={closeMobileNav} />
          <div className="flex-shrink-0 border-t border-white/10 px-6 py-3">
            <p
              className="text-xs text-white/50"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              Version 2.1.4
            </p>
          </div>
        </aside>
      )}

      {/* Desktop sidebar rail */}
      <aside
        className="fixed left-0 top-0 z-30 hidden h-screen flex-col transition-all duration-300 md:flex"
        style={{
          backgroundColor: '#1B4332',
          width: desktopWidth,
          overflow: isCollapsed ? 'visible' : 'hidden',
        }}
      >
        <div className={`flex-shrink-0 py-6 ${isCollapsed ? 'px-3' : 'px-6'}`}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <OptimizedImage
                src={avocadoLogo}
                alt="AvoGuard"
                priority
                width={40}
                height={40}
                className="h-10 w-10 flex-shrink-0"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <OptimizedImage
                src={avocadoLogo}
                alt="AvoGuard"
                priority
                width={48}
                height={48}
                className="h-12 w-12 flex-shrink-0"
              />
              <div>
                <h1
                  className="whitespace-nowrap text-2xl text-white"
                  style={{ fontFamily: 'DM Serif Display, serif' }}
                >
                  AvoGuard
                </h1>
                <p
                  className="whitespace-nowrap text-xs opacity-75"
                  style={{ color: '#74C69D', fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  Pest & Disease Monitor
                </p>
              </div>
            </div>
          )}
        </div>

        <SidebarNavLinks collapsed={isCollapsed} />

        {!isCollapsed && (
          <div className="flex-shrink-0 border-t border-white/10 px-6 py-4">
            <p
              className="whitespace-nowrap text-xs text-white/50"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              Version 2.1.4
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
