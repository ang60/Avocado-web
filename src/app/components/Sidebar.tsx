import { LayoutDashboard, FileText, FolderOpen, Activity, Bell, BookOpen, Users, Settings, ClipboardCheck, Phone, Menu, X, Shield, Building2, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import avocadoLogo from '../../imports/avocado_logo.svg';
import { useSidebar } from '../context/SidebarContext';

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

export function Sidebar() {
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 z-50 p-2 rounded-lg transition-all hover:bg-white/10"
        style={{
          left: isCollapsed ? '16px' : '224px',
          backgroundColor: '#2D6A4F',
        }}
      >
        {isCollapsed ? (
          <Menu className="w-5 h-5 text-white" />
        ) : (
          <X className="w-5 h-5 text-white" />
        )}
      </button>

      <aside 
        className="fixed left-0 top-0 h-screen flex flex-col transition-all duration-300" 
        style={{ 
          backgroundColor: '#1B4332',
          width: isCollapsed ? '0px' : '240px',
          overflow: 'hidden',
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div className="px-6 py-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src={avocadoLogo} 
              alt="AvoGuard Logo" 
              className="w-12 h-12 flex-shrink-0"
            />
            <div>
              <h1 className="text-2xl text-white whitespace-nowrap" style={{ fontFamily: 'DM Serif Display, serif' }}>
                AvoGuard
              </h1>
              <p className="text-xs opacity-75 whitespace-nowrap" style={{ color: '#74C69D', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Pest & Disease Monitor
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${isActive 
                        ? 'text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                    style={{
                      backgroundColor: isActive ? '#2D6A4F' : 'transparent',
                      fontFamily: 'IBM Plex Sans, sans-serif',
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Version */}
        <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
          <p className="text-xs text-white/50 whitespace-nowrap" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            v2.4.1
          </p>
        </div>
      </aside>
    </>
  );
}