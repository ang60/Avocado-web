import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { Layout } from './Layout';
import { PageLoader } from './PageLoader';

/**
 * Root shell: sidebar/topbar/footer stay mounted; only the outlet swaps on navigation
 * (client-side, no full document reload).
 */
export function AppShell() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}
