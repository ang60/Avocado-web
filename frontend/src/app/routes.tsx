import { lazy, type ComponentType } from 'react';
import { createBrowserRouter, redirect } from 'react-router';
import { getAuthUser, isAuthenticated } from './auth';
import { hasAppAccess } from './rbac';
import { AppShell } from './components/AppShell';

function requireAuthLoader() {
  if (!isAuthenticated()) {
    return redirect('/login');
  }
  return null;
}

function requireNavPermission(permission: string) {
  return () => {
    const gate = requireAuthLoader();
    if (gate) return gate;
    const u = getAuthUser();
    if (hasAppAccess(u, permission)) return null;
    if (hasAppAccess(u, 'nav.dashboard')) return redirect('/dashboard');
    return redirect('/no-access');
  };
}

function loginLoader() {
  if (isAuthenticated()) {
    return redirect('/dashboard');
  }
  return null;
}

function registerLoader() {
  if (isAuthenticated()) {
    return redirect('/dashboard');
  }
  return null;
}

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
    loader: loginLoader,
    Component: lazyRoute(() => import('./pages/Login'), 'Login'),
  },
  {
    path: '/register',
    loader: registerLoader,
    Component: lazyRoute(() => import('./pages/Register'), 'Register'),
  },
  {
    path: '/forgot-password',
    loader: loginLoader,
    Component: lazyRoute(() => import('./pages/ForgotPassword'), 'ForgotPassword'),
  },
  {
    path: '/reset-password',
    loader: loginLoader,
    Component: lazyRoute(() => import('./pages/ResetPassword'), 'ResetPassword'),
  },
  {
    path: '/logout',
    Component: lazyRoute(() => import('./pages/Logout'), 'Logout'),
  },
  {
    path: '/',
    loader: requireAuthLoader,
    Component: AppShell,
    children: [
      {
        index: true,
        loader: requireNavPermission('nav.dashboard'),
        Component: lazyRoute(() => import('./pages/Dashboard'), 'Dashboard'),
      },
      {
        path: 'dashboard',
        loader: requireNavPermission('nav.dashboard'),
        Component: lazyRoute(() => import('./pages/Dashboard'), 'Dashboard'),
      },
      {
        path: 'agronomist-reports',
        loader: requireNavPermission('nav.reports'),
        Component: lazyRoute(() => import('./pages/AgronomistReports'), 'AgronomistReports'),
      },
      {
        path: 'no-access',
        loader: requireAuthLoader,
        Component: lazyRoute(() => import('./pages/NoAccess'), 'NoAccess'),
      },
      {
        path: 'scouting-reports',
        loader: requireNavPermission('nav.scouting'),
        Component: lazyRoute(() => import('./pages/ScoutingReports'), 'ScoutingReports'),
      },
      {
        path: 'case-management',
        loader: requireNavPermission('nav.cases'),
        Component: lazyRoute(() => import('./pages/CaseManagement'), 'CaseManagement'),
      },
      {
        path: 'case-management/:caseId',
        loader: requireNavPermission('nav.cases'),
        Component: lazyRoute(() => import('./pages/CaseDetail'), 'CaseDetail'),
      },
      {
        path: 'outbreak-monitoring',
        loader: requireNavPermission('nav.outbreak'),
        Component: lazyRoute(() => import('./pages/OutbreakMonitoring'), 'OutbreakMonitoring'),
      },
      {
        path: 'kephis-quarantine',
        loader: requireNavPermission('nav.kephis'),
        Component: lazyRoute(() => import('./pages/KEPHISDashboard'), 'KEPHISDashboard'),
      },
      {
        path: 'kephis-quarantine/surveillance',
        loader: () => {
          const gate = requireNavPermission('nav.kephis')();
          if (gate) return gate;
          return redirect('/kephis-quarantine');
        },
        Component: lazyRoute(() => import('./pages/KEPHISDashboard'), 'KEPHISDashboard'),
      },
      {
        path: 'kephis-quarantine/incidents',
        loader: () => {
          const gate = requireNavPermission('nav.kephis')();
          if (gate) return gate;
          return redirect('/kephis-quarantine');
        },
        Component: lazyRoute(() => import('./pages/KEPHISDashboard'), 'KEPHISDashboard'),
      },
      {
        path: 'kephis-quarantine/traceability',
        loader: () => {
          const gate = requireNavPermission('nav.kephis')();
          if (gate) return gate;
          return redirect('/kephis-quarantine');
        },
        Component: lazyRoute(() => import('./pages/KEPHISDashboard'), 'KEPHISDashboard'),
      },
      {
        path: 'kephis-quarantine/standards',
        loader: () => {
          const gate = requireNavPermission('nav.kephis')();
          if (gate) return gate;
          return redirect('/kephis-quarantine');
        },
        Component: lazyRoute(() => import('./pages/KEPHISDashboard'), 'KEPHISDashboard'),
      },
      {
        path: 'kephis-quarantine/human-audit',
        loader: () => {
          const gate = requireNavPermission('nav.kephis')();
          if (gate) return gate;
          return redirect('/kephis-quarantine');
        },
        Component: lazyRoute(() => import('./pages/KEPHISDashboard'), 'KEPHISDashboard'),
      },
      {
        path: 'kephis-quarantine/export-reports',
        loader: requireNavPermission('nav.kephis'),
        Component: lazyRoute(() => import('./pages/KEPHISExportReports'), 'KEPHISExportReports'),
      },
      {
        path: 'kephis-quarantine/risk-intelligence',
        loader: requireNavPermission('nav.kephis'),
        Component: lazyRoute(() => import('./pages/KEPHISDashboard'), 'KEPHISDashboard'),
      },
      {
        path: 'kephis-quarantine/alerts',
        loader: requireNavPermission('nav.kephis'),
        Component: lazyRoute(() => import('./pages/KEPHISAlerts'), 'KEPHISAlerts'),
      },
      {
        path: 'kephis-quarantine/chain-of-custody',
        loader: requireNavPermission('nav.kephis'),
        Component: lazyRoute(() => import('./pages/KEPHISChainOfCustody'), 'KEPHISChainOfCustody'),
      },
      {
        path: 'kephis-quarantine/threshold-settings',
        loader: requireNavPermission('nav.kephis'),
        Component: lazyRoute(() => import('./pages/KEPHISThresholdSettings'), 'KEPHISThresholdSettings'),
      },
      {
        path: 'kephis-quarantine/china-farm-ids',
        loader: requireNavPermission('nav.kephis'),
        Component: lazyRoute(() => import('./pages/KEPHISChinaFarmIds'), 'KEPHISChinaFarmIds'),
      },
      {
        path: 'hcda-registry',
        loader: requireNavPermission('nav.hcda'),
        Component: lazyRoute(() => import('./pages/HCDARegistry'), 'HCDARegistry'),
      },
      {
        path: 'alerts',
        loader: requireNavPermission('nav.alerts'),
        Component: lazyRoute(() => import('./pages/Alerts'), 'Alerts'),
      },
      {
        path: 'knowledge-base',
        loader: requireNavPermission('nav.knowledge'),
        Component: lazyRoute(() => import('./pages/KnowledgeBase'), 'KnowledgeBase'),
      },
      {
        path: 'knowledge-base/:articleId',
        loader: requireNavPermission('nav.knowledge'),
        Component: lazyRoute(() => import('./pages/KBArticleDetail'), 'KBArticleDetail'),
      },
      {
        path: 'my-farm-blocks',
        loader: requireNavPermission('nav.scouting'),
        Component: lazyRoute(() => import('./pages/MyFarmBlocks'), 'MyFarmBlocks'),
      },
      {
        path: 'compliance-permits',
        loader: requireNavPermission('nav.reports'),
        Component: lazyRoute(() => import('./pages/CompliancePermits'), 'CompliancePermits'),
      },
      {
        path: 'symptom-codebook',
        loader: requireNavPermission('nav.symptom_codebook'),
        Component: lazyRoute(() => import('./pages/SymptomCodebook'), 'SymptomCodebook'),
      },
      {
        path: 'farmers',
        loader: requireNavPermission('nav.farmers'),
        Component: lazyRoute(() => import('./pages/Farmers'), 'Farmers'),
      },
      {
        path: 'farmers/:farmerId',
        loader: requireNavPermission('nav.farmers'),
        Component: lazyRoute(() => import('./pages/FarmerDetail'), 'FarmerDetail'),
      },
      {
        path: 'compliance-hub',
        loader: requireNavPermission('nav.reports'),
        Component: lazyRoute(() => import('./pages/ComplianceHub'), 'ComplianceHub'),
      },
      {
        path: 'admin',
        loader: requireNavPermission('nav.admin'),
        Component: lazyRoute(() => import('./pages/Admin'), 'Admin'),
      },
      {
        path: 'exporter',
        loader: requireNavPermission('nav.exporter'),
        Component: lazyRoute(() => import('./pages/Exporter'), 'Exporter'),
      },
    ],
  },
  {
    path: '*',
    loader: () => redirect('/dashboard'),
  },
]);
