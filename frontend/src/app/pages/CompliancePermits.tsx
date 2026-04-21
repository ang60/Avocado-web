import { AlertCircle, QrCode } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../api/errors';
import {
  fetchHcdaFarmers,
  fetchHcdaStatistics,
  openHcdaPdfExport,
  type HcdaFarmerDto,
  type HcdaStatisticsDto,
} from '../api/realApi';
import { getAuthUser } from '../auth';

export function CompliancePermits() {
  const [records, setRecords] = useState<HcdaFarmerDto[]>([]);
  const [stats, setStats] = useState<HcdaStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getAuthUser();

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchHcdaFarmers(), fetchHcdaStatistics()])
      .then(([rows, summary]) => {
        if (cancelled) return;
        setRecords(rows);
        setStats(summary);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load compliance records.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const myRecord = useMemo(() => {
    const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim().toLowerCase();
    if (!fullName) return records[0] ?? null;
    return (
      records.find((r) => r.farmerName.trim().toLowerCase() === fullName) ??
      records.find((r) => r.county?.toLowerCase() === (user?.county ?? '').toLowerCase()) ??
      records[0] ??
      null
    );
  }, [records, user]);

  const expiryBadge = myRecord?.globalGAPStatus?.toLowerCase() === 'compliant' ? 'On Track' : 'Renewal Due';

  return (
    <>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
            Compliance & Permits
          </h1>
          <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#455A64' }}>
            Document hub and permit generation for audit readiness.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          <AlertCircle className="h-3 w-3" /> {expiryBadge}
        </span>
      </header>

      {error ? (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm" style={{ color: '#92400E', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-lg border bg-white p-4 lg:col-span-2" style={{ borderColor: '#E0DDD6' }}>
          <h3 className="mb-3 text-base font-semibold" style={{ color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Document Vault
          </h3>
          <div className="space-y-2">
            <div className="rounded border p-3" style={{ borderColor: '#E0DDD6' }}>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                HCDA License: {myRecord ? myRecord.hcdaRegNumber : loading ? 'Loading...' : 'No record'}
              </p>
            </div>
            <div className="rounded border p-3" style={{ borderColor: '#E0DDD6' }}>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                GlobalGAP Certificate: {myRecord?.globalGAPStatus ?? (loading ? 'Loading...' : 'Unknown')}
                {myRecord ? ` (Expiry: ${myRecord.globalGAPExpiry})` : ''}
              </p>
            </div>
            <div className="rounded border p-3" style={{ borderColor: '#E0DDD6' }}>
              <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                Audit readiness: {stats ? `${stats.globalgap_compliant.percentage}% compliant` : loading ? 'Loading...' : 'Unavailable'}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4" style={{ borderColor: '#E0DDD6' }}>
          <h3 className="mb-3 text-base font-semibold" style={{ color: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Digital Permit Preview
          </h3>
          <div className="rounded border p-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#F8FAFC' }}>
            <p className="text-sm" style={{ color: '#455A64', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Active clearance: {myRecord ? `${myRecord.farmerName} • ${myRecord.county}` : 'No clearance record yet.'}
            </p>
            <div className="my-3 flex h-24 items-center justify-center rounded border" style={{ borderColor: '#CBD5E1' }}>
              <QrCode className="h-12 w-12" style={{ color: '#2E7D32' }} />
            </div>
            <button
              onClick={openHcdaPdfExport}
              className="w-full rounded-lg px-3 py-2 text-sm text-white"
              style={{ backgroundColor: '#2E7D32', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              Generate Digital Movement Permit
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

