import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '../context/SidebarContext';

const SIDEBAR_WIDTH_PX = 240;

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isCollapsed } = useSidebar();
  const contentOffset = isCollapsed ? 0 : SIDEBAR_WIDTH_PX;
  const contentWidth =
    contentOffset === 0 ? '100%' : `calc(100% - ${SIDEBAR_WIDTH_PX}px)`;

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ backgroundColor: '#F7F4EF' }}
    >
      <Sidebar />
      <TopBar />
      
      {/* Main: must not be 100% width + margin-left or it overflows the viewport */}
      <main
        className="pt-20 pb-8 pl-6 pr-2 sm:pr-3 md:pr-4 flex-1 transition-all duration-300 min-w-0 box-border max-w-full"
        style={{
          marginLeft: contentOffset,
          width: contentWidth,
          maxWidth: contentWidth,
        }}
      >
        <div className="w-full min-w-0 max-w-full">
          {children}
        </div>
      </main>

      <footer
        className="py-6 pl-6 pr-2 sm:pr-3 md:pr-4 border-t text-center transition-all duration-300 min-w-0 box-border max-w-full"
        style={{
          backgroundColor: '#353535',
          borderColor: '#E0DDD6',
          fontFamily: 'IBM Plex Sans, sans-serif',
          color: '#F7F4EF',
          fontSize: '14px',
          marginLeft: contentOffset,
          width: contentWidth,
          maxWidth: contentWidth,
        }}
      >
        © Copyright 2026. All rights reserved. Strathmore University Agri-Food Innovation Centre (SAFIC)
      </footer>
    </div>
  );
}