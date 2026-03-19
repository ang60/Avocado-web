import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Activity,
  Bell,
  BookOpen,
  Users,
  Settings,
  ClipboardCheck,
  Phone,
  Menu,
  X,
  Shield,
  Building2,
  Package,
} from 'lucide-react';
import { useLocation } from 'react-router';
import { AppLink } from './AppLink';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { useSidebar } from '../context/SidebarContext';
import { OptimizedImage } from './OptimizedImage';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Scouting Reports', icon: FileText, path: '/scouting-reports' },
  { name: 'Case Management', icon: FolderOpen, path: '/case-management' },
  { name: 'Outbreak Monitoring', icon: Activity, path: '/outbreak-monitoring' },
  { name: 'KEPHIS', icon: Shield, path: '/kephis-quarantine' },
  { name: 'HCDA', icon: Building2, path: '/hcda-registry' },
  { name: 'Exporter', icon: Package, path: '/exporter' },
  { name: 'Alerts', icon: Bell, path: '/alerts' },
  { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base' },
  { name: 'Symptom Codebook', icon: Phone, path: '/symptom-codebook' },
  { name: 'Farmers', icon: Users, path: '/farmers' },
  { name: 'Reports', icon: ClipboardCheck, path: '/compliance-hub' },
  { name: 'Admin', icon: Settings, path: '/admin' },
];

function SidebarNavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3">
      <ul className="space-y-1 pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/' || location.pathname === '/dashboard'
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
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
