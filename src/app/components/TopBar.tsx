import { Search, ChevronRight, Bell, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router';
import { useState } from 'react';
import { useSidebar } from '../context/SidebarContext';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/scouting-reports': 'Scouting Reports',
  '/case-management': 'Case Management',
  '/outbreak-monitoring': 'Outbreak Monitoring',
  '/alerts': 'Alerts',
  '/knowledge-base': 'Knowledge Base',
  '/symptom-codebook': 'Symptom Codebook',
  '/farmers': 'Farmers',
  '/compliance-hub': 'Reports',
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
  const [searchQuery, setSearchQuery] = useState('');
  const { isCollapsed } = useSidebar();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    if (path === '/') {
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
  const currentUser = {
    name: 'Alice Omondi',
    initials: 'AO',
    role: 'Agronomist',
  };

  return (
    <div 
      className="fixed top-0 right-0 z-40 border-b transition-all duration-300"
      style={{ 
        left: isCollapsed ? '72px' : '240px',
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD6',
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="w-4 h-4" style={{ color: '#717182' }} />
              )}
              <Link
                to={crumb.path}
                className="text-sm transition-colors"
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

        {/* Search Bar */}
        <div className="mx-2 min-w-0 flex-1 max-w-md sm:mx-4">
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
        <div className="flex items-center gap-4">
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
            className="h-8 w-px"
            style={{ backgroundColor: '#E0DDD6' }}
          />

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div>
              <p 
                className="text-sm text-right"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#1B4332',
                  fontWeight: '500',
                }}
              >
                {currentUser.name}
              </p>
              <p 
                className="text-xs text-right"
                style={{ 
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: '#717182',
                }}
              >
                {currentUser.role}
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontFamily: 'IBM Plex Sans, sans-serif',
                fontWeight: '600',
              }}
            >
              <span className="text-sm">{currentUser.initials}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}