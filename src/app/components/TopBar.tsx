import { Search, ChevronRight, Bell, Settings, FileText, Sprout, User, LayoutDashboard } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSidebar } from '../context/SidebarContext';
import {
  fetchNavbarUser,
  fetchNotifications,
  searchGlobal,
} from '../api/placeholderApi';
import type { NavbarNotification, NavbarUser, SearchResultItem } from '../api/types';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/scouting-reports': 'Scouting Reports',
  '/case-management': 'Case Management',
  '/outbreak-monitoring': 'Outbreak Monitoring',
  '/kephis-quarantine': 'KEPHIS',
  '/hcda-registry': 'HCDA Registry',
  '/exporter': 'Exporter',
  '/alerts': 'Alerts',
  '/knowledge-base': 'Knowledge Base',
  '/symptom-codebook': 'Symptom Codebook',
  '/farmers': 'Farmers',
  '/compliance-hub': 'Reports',
  '/admin': 'Admin',
};

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

const defaultUser: NavbarUser = {
  name: '…',
  initials: '—',
  role: 'Loading',
};

function searchResultIcon(type: SearchResultItem['type']) {
  switch (type) {
    case 'case':
      return FileText;
    case 'farm':
      return Sprout;
    case 'page':
      return LayoutDashboard;
    default:
      return User;
  }
}

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<NavbarUser>(defaultUser);
  const [notifications, setNotifications] = useState<NavbarNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    fetchNavbarUser().then(setCurrentUser).catch(() =>
      setCurrentUser({ name: 'Guest', initials: 'G', role: 'User' })
    );
    fetchNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const runSearch = useCallback((q: string) => {
    searchGlobal(q).then(setSearchResults);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    searchTimer.current = setTimeout(() => {
      runSearch(searchQuery);
      setSearchOpen(true);
    }, 280);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery, runSearch]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ name: 'Home', path: '/' }];

    if (path === '/') {
      return breadcrumbs;
    }

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
      const currentPage = routeNames[path] || 'Unknown';
      breadcrumbs.push({ name: currentPage, path });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const pickSearchResult = (item: SearchResultItem) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(item.path);
  };

  return (
    <div
      className="fixed top-0 right-0 z-40 border-b transition-all duration-300"
      style={{
        left: isCollapsed ? '0px' : '240px',
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD6',
      }}
    >
      <div className="flex items-center justify-between pl-6 pr-2 sm:pr-3 md:pr-4 py-4 gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.path}-${index}`} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" style={{ color: '#717182' }} />}
              <Link
                to={crumb.path}
                className="text-sm transition-colors truncate max-w-[140px] sm:max-w-none"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: index === breadcrumbs.length - 1 ? '#1B4332' : '#717182',
                  fontWeight: index === breadcrumbs.length - 1 ? '500' : '400',
                  textDecoration: 'none',
                }}
              >
                {crumb.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex-1 max-w-md min-w-0 mx-2 sm:mx-4 relative">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10"
              style={{ color: '#717182' }}
            />
            <input
              type="text"
              placeholder="Search cases, farms, scouts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none focus:ring-2 transition-all"
              style={{
                fontFamily: 'IBM Plex Sans, sans-serif',
                borderColor: '#E0DDD6',
                backgroundColor: '#F7F4EF',
                borderRadius: '8px',
                color: '#1B4332',
              }}
              aria-autocomplete="list"
              aria-expanded={searchOpen}
            />
          </div>
          {searchOpen && searchQuery.trim() && (
            <div
              className="absolute left-0 right-0 top-full mt-1 rounded-lg border shadow-lg max-h-72 overflow-y-auto z-50"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E0DDD6',
                borderRadius: '8px',
              }}
            >
              {searchResults.length === 0 ? (
                <p className="px-4 py-3 text-sm" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  No matches (placeholder API)
                </p>
              ) : (
                <ul className="py-1">
                  {searchResults.map((item) => {
                    const Icon = searchResultIcon(item.type);
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickSearchResult(item)}
                        >
                          <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2D6A4F' }} />
                          <div className="min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                            >
                              {item.label}
                            </p>
                            <p className="text-xs truncate" style={{ color: '#717182' }}>
                              {item.sublabel}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ color: '#717182' }}
              aria-expanded={notifOpen}
              onClick={(e) => {
                e.stopPropagation();
                setNotifOpen((o) => !o);
              }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 min-w-[8px] h-2 px-0.5 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ backgroundColor: '#DC2626' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border shadow-xl z-50 overflow-hidden"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="px-4 py-2 border-b flex items-center justify-between gap-2"
                  style={{ borderColor: '#E0DDD6', color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}
                >
                  <span className="text-sm font-medium">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-xs font-medium shrink-0"
                      style={{ color: '#2D6A4F' }}
                      onClick={() =>
                        setNotifications((prev) => prev.map((x) => ({ ...x, unread: false })))
                      }
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          setNotifications((prev) =>
                            prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                          );
                      }}
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                        )
                      }
                      className="px-4 py-3 border-b last:border-0 hover:bg-slate-50 cursor-pointer text-left w-full"
                      style={{ borderColor: '#F7F4EF' }}
                    >
                      <p
                        className="text-sm font-medium flex items-center gap-2"
                        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
                      >
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#DC2626' }} />
                        )}
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#717182' }}>
                        {n.subtitle}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                        {n.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="button"
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block"
            style={{ color: '#717182' }}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-8 w-px hidden sm:block" style={{ backgroundColor: '#E0DDD6' }} />

          <div className="flex items-center gap-2 sm:gap-3 rounded-lg p-1 sm:p-2">
            <div className="hidden sm:block text-right">
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
              <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                {currentUser.role}
              </p>
            </div>
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: '600',
              }}
              title={currentUser.name}
            >
              <span className="text-xs sm:text-sm">{currentUser.initials}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
