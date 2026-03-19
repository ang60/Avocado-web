'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '../src/app/context/SidebarContext';

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/scouting-reports': 'Scouting Reports',
  '/case-management': 'Case Management',
  '/outbreak-monitoring': 'Outbreak Monitoring',
  '/kephis-quarantine': 'KEPHIS Quarantine',
  '/hcda-registry': 'HCDA Registry',
  '/alerts': 'Alerts',
  '/knowledge-base': 'Knowledge Base',
  '/symptom-codebook': 'Symptom Codebook',
  '/farmers': 'Farmers',
  '/compliance-hub': 'Reports',
  '/admin': 'Admin',
};

const caseNames: Record<string, string> = {
  'CSE-1024': 'CSE-1024 - Kangema Avocado Growers',
  'CSE-1023': 'CSE-1023 - Meru Central Farm',
  'CSE-1022': 'CSE-1022 - Kiambu Highlands Estate',
};

const farmerNames: Record<string, string> = {
  'FRM-1024': 'Jane Wanjiku - FRM-1024',
  'FRM-1023': 'Peter Kamau - FRM-1023',
  'FRM-1022': 'Grace Akinyi - FRM-1022',
};

const articleNames: Record<string, string> = {
  'KB-001': 'Avocado Thrips (Scirtothrips perseae)',
  'KB-002': 'Phytophthora Root Rot',
  'KB-003': 'Persea Mite (Oligonychus perseae)',
};

export function TopBar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const generateBreadcrumbs = () => {
    if (!pathname) return [];
    
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Dashboard', path: '/' }];

    if (paths.length === 0) return breadcrumbs;

    let currentPath = '';
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      if (segment.startsWith('CSE-')) {
        breadcrumbs.push({
          name: caseNames[segment] || segment,
          path: currentPath,
        });
      } else if (segment.startsWith('FRM-')) {
        breadcrumbs.push({
          name: farmerNames[segment] || segment,
          path: currentPath,
        });
      } else if (segment.startsWith('KB-')) {
        breadcrumbs.push({
          name: articleNames[segment] || segment,
          path: currentPath,
        });
      } else {
        breadcrumbs.push({
          name: routeNames[currentPath] || segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          path: currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header 
      className="sticky top-0 z-30 px-8 py-4 border-b transition-all duration-300"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: '#E0DDD6',
        marginLeft: isCollapsed ? '0px' : '240px',
      }}
    >
      <nav className="flex items-center gap-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4" style={{ color: '#717182' }} />
            )}
            {index === breadcrumbs.length - 1 ? (
              <span style={{ color: '#1B4332' }}>{crumb.name}</span>
            ) : (
              <Link 
                href={crumb.path}
                className="hover:underline transition-colors"
                style={{ color: '#717182', textDecoration: 'none' }}
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}