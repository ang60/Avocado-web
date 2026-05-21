'use client';

import { SidebarProvider } from '../src/app/context/SidebarContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
