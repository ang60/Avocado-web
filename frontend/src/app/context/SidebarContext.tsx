import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

interface SidebarContextType {
  /** Desktop: sidebar rail expanded (labels) vs icon-only */
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  /** Viewport is mobile — main content is full width; nav is a drawer */
  isMobile: boolean;
  mobileNavOpen: boolean;
  setMobileNavOpen: (value: boolean) => void;
  closeMobileNav: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      const m = mq.matches;
      setIsMobile(m);
      if (!m) setMobileNavOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isMobile,
        mobileNavOpen,
        setMobileNavOpen,
        closeMobileNav,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
