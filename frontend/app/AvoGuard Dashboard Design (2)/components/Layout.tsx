'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useSidebar } from '../src/app/context/SidebarContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div 
        className="flex-1 flex flex-col transition-all duration-300" 
        style={{ 
          marginLeft: isCollapsed ? '0px' : '240px',
        }}
      >
        <TopBar />
        <main 
          className="flex-1" 
          style={{ 
            backgroundColor: '#F7F4EF', 
            padding: '32px',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
