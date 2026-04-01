import { AppLink } from '../components/AppLink';
import { KPICards } from '../components/KPICards';
import { CaseTableEnhanced } from '../components/CaseTableEnhanced';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/errors';
import { fetchCaseManagement } from '../api/realApi';
import type { CaseManagementPayload } from '../api/types';

export function CaseManagement() {
  const [data, setData] = useState<CaseManagementPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCaseManagement()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load case management data.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-lg" />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <header className="mb-4 md:mb-5">
          <h1
            className="mb-1 text-2xl sm:text-3xl"
            style={{
              fontFamily: 'DM Serif Display, serif',
              color: '#1B4332',
            }}
          >
            Case Management
          </h1>
        </header>
        <div className="p-8 rounded-lg border text-center" style={{ borderColor: '#E0DDD6' }}>
          <p style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {error ?? 'No data available.'}
          </p>
          <p className="text-sm mt-2" style={{ color: '#717182' }}>
            Check that the API is running and you are signed in with a role that can view cases.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="mb-4 md:mb-5">
        <h1 
          className="mb-1 text-2xl sm:text-3xl" 
          style={{ 
            fontFamily: 'DM Serif Display, serif',
            color: '#1B4332'
          }}
        >
          Case Management
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Monitor and manage pest and disease cases across all farms
        </p>
      </header>
      <KPICards kpis={data.kpis} />
      <div
        className="mb-4 rounded-lg border p-4"
        style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}
      >
        <p
          className="mb-2 text-sm font-semibold"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
        >
          What to do next
        </p>
        <ol
          className="list-inside list-decimal space-y-1.5 text-sm"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
        >
          <li>
            Click a case row to open <strong>case detail</strong>: review symptoms, confirm diagnosis, and record
            advisories or follow-up.
          </li>
          <li>
            Use the <AppLink to="/dashboard" className="underline" style={{ color: '#2D6A4F' }}>Dashboard</AppLink>{' '}
            triage list for the newest open cases.
          </li>
          <li>
            New field submissions live under{' '}
            <AppLink to="/scouting-reports" className="underline" style={{ color: '#2D6A4F' }}>
              Scouting Reports
            </AppLink>
            — escalate to a case when a finding needs agronomist action.
          </li>
        </ol>
      </div>
      <CaseTableEnhanced cases={data.cases} />
    </>
  );
}
