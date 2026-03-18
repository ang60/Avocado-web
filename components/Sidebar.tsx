'use client';

import { LayoutDashboard, FileText, FolderOpen, Activity, Bell, BookOpen, Users, Settings, ClipboardCheck, Phone, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import avocadoLogo from '../src/imports/avocado_logo.svg';
import { useSidebar } from '../src/app/context/SidebarContext';

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
  { name: 'Alerts', icon: Bell, path: '/alerts' },
  { name: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base' },
  { name: 'Symptom Codebook', icon: Phone, path: '/symptom-codebook' },
  { name: 'Farmers', icon: Users, path: '/farmers' },
  { name: 'Reports', icon: ClipboardCheck, path: '/compliance-hub' },
  { name: 'Admin', icon: Settings, path: '/admin' },
];

export function Sidebar() {
  const pathname = usePathname();
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
        {/* Header */}
        <div 
          className="px-6 py-8 border-b flex items-center gap-3" 
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', minHeight: '96px' }}
        >
          <img 
            src={avocadoLogo} 
            alt="AvoGuard Logo" 
            className="w-8 h-8"
            style={{ flexShrink: 0 }}
          />
          <div className="overflow-hidden">
            <h1 
              className="text-xl whitespace-nowrap"
              style={{ 
                fontFamily: 'DM Serif Display, serif',
                color: '#FFFFFF',
              }}
            >
              AvoGuard
            </h1>
            <p 
              className="text-xs whitespace-nowrap"
              style={{ 
                fontFamily: 'IBM Plex Sans, sans-serif',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Pest & Disease Monitoring
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || 
                           (item.path !== '/' && pathname?.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 px-6 py-3 transition-colors"
                style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #74C69D' : '3px solid transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  textDecoration: 'none',
                }}
              >
                <Icon className="w-5 h-5" style={{ flexShrink: 0 }} />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t" 
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <p 
            className="text-xs text-center"
            style={{ 
              fontFamily: 'IBM Plex Sans, sans-serif',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            v2.4.1
          </p>
        </div>
      </aside>
    </>
  );
}
