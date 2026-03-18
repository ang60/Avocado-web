import { Layout } from '../components/Layout';
import { KPICards } from '../components/KPICards';
import { CaseTableEnhanced } from '../components/CaseTableEnhanced';
import { useState, useEffect } from 'react';
import { fetchCaseManagement } from '../api/placeholderApi';
import type { CaseManagementPayload } from '../api/types';

export function CaseManagement() {
  const [data, setData] = useState<CaseManagementPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCaseManagement()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load case management data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Layout>
        <div className="p-8 rounded-lg border text-center" style={{ borderColor: '#E0DDD6' }}>
          <p style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>{error}</p>
        </div>
      </Layout>
    );
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-4xl mb-2" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
          Case Management
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Monitor and manage pest and disease cases across all farms
        </p>
      </header>
      <KPICards kpis={data.kpis} />
      <CaseTableEnhanced cases={data.cases} />
    </Layout>
  );
}
