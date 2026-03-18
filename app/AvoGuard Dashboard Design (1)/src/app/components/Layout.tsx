import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '../context/SidebarContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F4EF' }}>
      <Sidebar />
      <TopBar />
      
      {/* Main Content Area */}
      <main 
        className="pt-20 p-8 flex-1 transition-all duration-300" 
        style={{
          marginLeft: isCollapsed ? '72px' : '240px',
        }}
      >
        <div className="max-w-[1200px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="py-6 px-8 border-t text-center transition-all duration-300"
        style={{ 
          backgroundColor: '#353535',
          borderColor: '#E0DDD6',
          fontFamily: 'IBM Plex Sans, sans-serif',
          color: '#F7F4EF',
          fontSize: '14px',
          marginLeft: isCollapsed ? '72px' : '240px',
        }}
      >
        © Copyright 2026. All rights reserved. Strathmore University Agri-Food Innovation Centre (SAFIC)
      </footer>
    </div>
  );
}