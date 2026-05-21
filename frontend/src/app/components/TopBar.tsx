import { Search, ChevronRight, Bell, Settings, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { AppLink } from './AppLink';
import { useEffect, useMemo, useRef, useState } from 'react';
import { clearAuthSession, getAuthUser, subscribeAuth } from '../auth';
import { useSidebar } from '../context/SidebarContext';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/scouting-reports': 'Scouting Reports',
  '/case-management': 'Case Management',
  '/outbreak-monitoring': 'Outbreak Monitoring',
  '/kephis-quarantine': 'KEPHIS',
  '/kephis-quarantine/risk-intelligence': 'Risk Intelligence',
  '/kephis-quarantine/alerts': 'KEPHIS Alerts',
  '/kephis-quarantine/china-farm-ids': 'China Export Farm IDs',
  '/kephis-quarantine/chain-of-custody': 'Chain of Custody',
  '/kephis-quarantine/threshold-settings': 'Threshold Settings',
  '/kephis-quarantine/export-reports': 'Export Reports',
  '/kephis-quarantine/surveillance': 'KEPHIS',
  '/kephis-quarantine/incidents': 'KEPHIS',
  '/kephis-quarantine/traceability': 'KEPHIS',
  '/kephis-quarantine/standards': 'KEPHIS',
  '/kephis-quarantine/human-audit': 'KEPHIS',
  '/hcda-registry': 'HCDA',
  '/hcda-reports': 'HCDA Reports',
  '/exporter': 'Supply base',
  '/alerts': 'Alerts',
  '/knowledge-base': 'Knowledge Base',
  '/symptom-codebook': 'Symptom Codebook',
  '/farmers': 'Farmers',
  '/compliance-hub': 'Reports',
  '/agronomist-reports': 'Agronomist Reports',
  '/admin': 'Admin',
};

// Mock data for breadcrumb display names
const caseNames: Record<string, string> = {
  'CSE-1024': 'CSE-1024 - Kangema Avocado Growers',
  'CSE-1020': 'CSE-1020 - Kiambu Highland Farms',
  'CSE-1023': 'CSE-1023 - Gatanga Green Farms',
};

const farmerNames: Record<string, string> = {
  'FRM-1024': 'Peter Mwangi - Kangema Avocado Growers',
  'FRM-1025': 'Mary Njeri - Kiambu Highland Farms',
};

const articleTitles: Record<string, string> = {
  'KB-045': 'Avocado Thrips: Identification and Management',
  'KB-044': 'Phytophthora Root Rot Prevention and Control',
  'KB-038': 'Scale Management',
  'KB-032': 'Fruit Fly Control',
  'KB-040': 'Anthracnose Disease Management',
  'KB-041': 'Understanding Persea Mite Biology and Behavior',
  'KB-033': 'Post-Harvest Disease Control',
  'KB-035': 'False Codling Moth Management',
  'KB-047': 'Nutrient Deficiency Diagnosis',
  'KB-051': 'Trunk Disease Management',
};

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileRev, setProfileRev] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { isCollapsed, isMobile, setMobileNavOpen } = useSidebar();

  useEffect(() => subscribeAuth(() => setProfileRev((n) => n + 1)), []);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [profileMenuOpen]);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    if (path === '/' || path === '/dashboard') {
      breadcrumbs.push({ name: 'Dashboard', path: '/dashboard' });
      return breadcrumbs;
    }

    // Handle nested routes
    if (path.startsWith('/case-management/')) {
      breadcrumbs.push({ name: 'Case Management', path: '/case-management' });
      const caseId = path.split('/')[2];
      if (caseId) {
        const caseName = caseNames[caseId] || caseId;
        breadcrumbs.push({ name: caseName, path });
      }
    } else if (path.startsWith('/knowledge-base/')) {
      breadcrumbs.push({ name: 'Knowledge Base', path: '/knowledge-base' });
      const articleId = path.split('/')[2];
      if (articleId) {
        const articleTitle = articleTitles[articleId] || articleId;
        breadcrumbs.push({ name: articleTitle, path });
      }
    } else if (path.startsWith('/farmers/')) {
      breadcrumbs.push({ name: 'Farmers', path: '/farmers' });
      const farmerId = path.split('/')[2];
      if (farmerId) {
        const farmerName = farmerNames[farmerId] || farmerId;
        breadcrumbs.push({ name: farmerName, path });
      }
    } else {
      // Handle simple routes
      const currentPage = routeNames[path] || 'Unknown';
      breadcrumbs.push({ name: currentPage, path });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentUser = useMemo(() => {
    const u = getAuthUser();
    if (!u) {
      return { name: 'User', initials: '—', role: '—', phone: '' };
    }
    const name =
      [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.phone_number || 'User';
    const ri = `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.trim();
    const initials = (ri || u.phone_number?.slice(-2) || '?').toUpperCase();
    const role = u.role_details?.role_name?.trim() || '—';
    const phone = (u.phone_number || '').trim();
    return { name, initials: initials.slice(0, 2), role, phone };
  }, [location.pathname, profileRev]);

  return (
    <div 
      className="fixed top-0 right-0 z-40 border-b transition-all duration-300"
      style={{ 
        left: isMobile ? 0 : isCollapsed ? '72px' : '240px',
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD6',
      }}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex-shrink-0 rounded-lg p-2 hover:bg-gray-100"
              style={{ color: '#1B4332' }}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          {/* Breadcrumbs */}
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" style={{ color: '#717182' }} />
                )}
                <AppLink
                  to={crumb.path}
                  className="max-w-[42vw] truncate text-xs transition-colors sm:max-w-none sm:text-sm"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: index === breadcrumbs.length - 1 ? '#1B4332' : '#717182',
                    fontWeight: index === breadcrumbs.length - 1 ? '500' : '400',
                    textDecoration: 'none',
                  }}
                >
                  {crumb.name}
                </AppLink>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar — hide on very small screens to save space */}
        <div className="mx-1 hidden min-w-0 max-w-md flex-1 sm:mx-4 sm:flex">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
              style={{ color: '#717182' }}
            />
            <input
              type="text"
              placeholder="Search cases, farms, scouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderColor: '#E0DDD6',
                backgroundColor: '#F7F4EF',
                borderRadius: '8px',
                color: '#1B4332',
              }}
            />
          </div>
        </div>

        {/* Right Section: Notifications, Settings, User */}
        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-3 md:gap-4">
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ color: '#717182' }}
          >
            <Bell className="w-5 h-5" />
            <span 
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: '#DC2626' }}
            />
          </button>

          {/* Settings */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ color: '#717182' }}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div 
            className="hidden h-8 w-px sm:block"
            style={{ backgroundColor: '#E0DDD6' }}
          />

          {/* User profile + account menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg p-1 transition-colors hover:bg-gray-50 sm:gap-3 sm:p-2"
              onClick={() => setProfileMenuOpen((o) => !o)}
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              <div className="hidden text-right sm:block">
                <p
                  className="text-sm"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#1B4332',
                    fontWeight: '500',
                  }}
                >
                  {currentUser.name}
                </p>
                {currentUser.phone ? (
                  <p
                    className="text-xs text-gray-500"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    {currentUser.phone}
                  </p>
                ) : null}
                <p
                  className="text-xs"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    color: '#717182',
                  }}
                >
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="hidden h-4 w-4 shrink-0 text-gray-500 sm:block" />
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10"
                style={{
                  backgroundColor: '#2D6A4F',
                  color: '#FFFFFF',
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  fontWeight: '600',
                }}
              >
                <span className="text-sm">{currentUser.initials}</span>
              </div>
            </button>

            {profileMenuOpen ? (
                <div
                  className="absolute right-0 z-50 mt-1 min-w-[200px] rounded-lg border bg-white py-1 shadow-lg"
                  style={{ borderColor: '#E0DDD6' }}
                  role="menu"
                >
                  <div className="border-b px-3 py-2 sm:hidden" style={{ borderColor: '#E0DDD6' }}>
                    <p className="text-sm font-medium text-[#1B4332]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {currentUser.name}
                    </p>
                    {currentUser.phone ? (
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                        {currentUser.phone}
                      </p>
                    ) : null}
                    <p className="text-xs text-[#717182]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                      {currentUser.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1B4332] hover:bg-[#F7F4EF]"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    onClick={() => {
                      clearAuthSession();
                      setProfileMenuOpen(false);
                      navigate('/login', { replace: true });
                    }}
                  >
                    Switch account (sign in as someone else)
                  </button>
                  <AppLink
                    to="/logout"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </AppLink>
                </div>
              ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}