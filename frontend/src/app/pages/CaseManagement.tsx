import { AppLink } from '../components/AppLink';
import { KPICards } from '../components/KPICards';
import { CaseTableEnhanced } from '../components/CaseTableEnhanced';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/errors';
import { fetchCaseManagement } from '../api/realApi';
import type { CaseManagementPayload } from '../api/types';
import { getAuthUser } from '../auth';

export function CaseManagement() {
  const [data, setData] = useState<CaseManagementPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const roleName = getAuthUser()?.role_details?.role_name ?? getAuthUser()?.role?.role_name ?? '';
  const isAgronomist = roleName === 'Agronomist';

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

  const reinspectionRequests = data.cases.filter((c) => {
    const notes = String(c.notes ?? '');
    return /re-?\s*inspection/i.test(notes) || /reinspection/i.test(notes);
  });
  const hasReinspection = reinspectionRequests.length > 0;

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
          {isAgronomist
            ? 'Review and resolve your assigned pest & disease cases'
            : 'Monitor and manage pest and disease cases across all farms'}
        </p>
      </header>
      <KPICards kpis={data.kpis} />
      <div
        className="mb-4 rounded-lg border p-4 shadow-sm"
        style={
          hasReinspection
            ? { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' }
            : { borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }
        }
      >
        <p
          className="mb-2 text-sm font-semibold"
          style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
        >
          {hasReinspection ? 'Re-inspection requested' : 'What to do next'}
        </p>
        {hasReinspection ? (
          <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}>
            <p className="text-sm">
              A farmer has requested re-inspection. Review the case(s) below and confirm the next steps:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {reinspectionRequests.slice(0, 6).map((c) => (
                <AppLink
                  key={c.id}
                  to={`/case-management/${c.id}`}
                  className="rounded-lg border px-3 py-2 text-xs"
                  style={{
                    borderColor: '#F59E0B',
                    color: '#92400E',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  {c.farm} · {c.block}
                </AppLink>
              ))}
            </div>
          </div>
        ) : (
          <ol
            className="list-inside list-decimal space-y-1.5 text-sm"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#374151' }}
          >
            <li>
              Click a case row to open <strong>case detail</strong>: review symptoms, confirm diagnosis, and record
              advisories{isAgronomist ? ' to close the case.' : ' or follow-up.'}
            </li>
            <li>
              Use the{' '}
              <AppLink to="/dashboard" className="underline" style={{ color: '#2D6A4F' }}>
                Dashboard
              </AppLink>{' '}
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
        )}
      </div>
      <CaseTableEnhanced cases={data.cases} />
    </>
  );
}
