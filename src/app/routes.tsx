import { lazy, type ComponentType } from 'react';
import { createBrowserRouter, redirect } from 'react-router';
import { AppShell } from './components/AppShell';

function lazyRoute<T extends Record<string, ComponentType<object>>>(
  importer: () => Promise<T>,
  exportName: keyof T
) {
  const LazyComp = lazy(() =>
    importer().then((m) => ({ default: m[exportName] as ComponentType<object> }))
  );
  return function LazyRoute() {
    return <LazyComp />;
  };
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: lazyRoute(() => import('./pages/Login'), 'Login'),
  },
  {
    path: '/',
    Component: AppShell,
    children: [
      {
        index: true,
        Component: lazyRoute(() => import('./pages/Dashboard'), 'Dashboard'),
      },
      {
        path: 'dashboard',
        Component: lazyRoute(() => import('./pages/Dashboard'), 'Dashboard'),
      },
      {
        path: 'scouting-reports',
        Component: lazyRoute(() => import('./pages/ScoutingReports'), 'ScoutingReports'),
      },
      {
        path: 'case-management',
        Component: lazyRoute(() => import('./pages/CaseManagement'), 'CaseManagement'),
      },
      {
        path: 'case-management/:caseId',
        Component: lazyRoute(() => import('./pages/CaseDetail'), 'CaseDetail'),
      },
      {
        path: 'outbreak-monitoring',
        Component: lazyRoute(() => import('./pages/OutbreakMonitoring'), 'OutbreakMonitoring'),
      },
      {
        path: 'kephis-quarantine',
        Component: lazyRoute(() => import('./pages/KEPHISQuarantine'), 'KEPHISQuarantine'),
      },
      {
        path: 'hcda-registry',
        Component: lazyRoute(() => import('./pages/HCDARegistry'), 'HCDARegistry'),
      },
      {
        path: 'alerts',
        Component: lazyRoute(() => import('./pages/Alerts'), 'Alerts'),
      },
      {
        path: 'knowledge-base',
        Component: lazyRoute(() => import('./pages/KnowledgeBase'), 'KnowledgeBase'),
      },
      {
        path: 'knowledge-base/:articleId',
        Component: lazyRoute(() => import('./pages/KBArticleDetail'), 'KBArticleDetail'),
      },
      {
        path: 'symptom-codebook',
        Component: lazyRoute(() => import('./pages/SymptomCodebook'), 'SymptomCodebook'),
      },
      {
        path: 'farmers',
        Component: lazyRoute(() => import('./pages/Farmers'), 'Farmers'),
      },
      {
        path: 'farmers/:farmerId',
        Component: lazyRoute(() => import('./pages/FarmerDetail'), 'FarmerDetail'),
      },
      {
        path: 'compliance-hub',
        Component: lazyRoute(() => import('./pages/ComplianceHub'), 'ComplianceHub'),
      },
      {
        path: 'admin',
        Component: lazyRoute(() => import('./pages/Admin'), 'Admin'),
      },
      {
        path: 'exporter',
        Component: lazyRoute(() => import('./pages/Exporter'), 'Exporter'),
      },
    ],
  },
  {
    path: '*',
    loader: () => redirect('/dashboard'),
  },
]);
