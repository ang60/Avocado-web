import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '../context/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isCollapsed, isMobile } = useSidebar();
  const marginLeft = isMobile ? '0px' : isCollapsed ? '72px' : '240px';

  return (
    <div
      className="flex h-dvh min-h-0 flex-col overflow-hidden"
      style={{ backgroundColor: '#F7F4EF' }}
    >
      <Sidebar />
      <TopBar />

      {/* Main: fills viewport under top bar; inner scroll so footer stays visible */}
      <main
        className="flex min-h-0 flex-1 flex-col pt-[4.25rem] transition-all duration-300 sm:pt-20"
        style={{ marginLeft }}
      >
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="mx-auto min-w-0 w-full max-w-[min(100%,1920px)] px-3 py-3 sm:px-5 sm:py-4">
            {children}
          </div>
        </div>
      </main>

      <footer
        className="flex-shrink-0 border-t px-2 py-2.5 text-center text-xs leading-snug transition-all duration-300 sm:px-4 sm:py-3 sm:text-sm"
        style={{
          backgroundColor: '#353535',
          borderColor: '#E0DDD6',
          fontFamily: 'IBM Plex Sans, sans-serif',
          color: '#F7F4EF',
          marginLeft,
        }}
      >
        © Copyright 2026. All rights reserved. Strathmore University Agri-Food Innovation Centre (SAFIC)
      </footer>
    </div>
  );
}
