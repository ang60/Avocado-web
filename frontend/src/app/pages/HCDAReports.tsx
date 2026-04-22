import { BarChart3, Copy, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppLink } from '../components/AppLink';
import { TableScroll } from '../components/TableScroll';
import { fetchHcdaCountyOverview, type HcdaCountyOverviewDto, type HcdaCountyRowDto } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';
import { getAuthUser } from '../auth';

const WINDOW_DAYS = 30;

function buildAdvisoryTemplate(data: HcdaCountyOverviewDto, primaryCounty: string): string {
  const lines: string[] = [];
  lines.push(`County extension advisory (draft) — AvoGuard, last ${data.windowDays} days`);
  lines.push('');
  lines.push(
    'Use this text in ward meetings, farmer groups, or your county SMS/WhatsApp broadcast. It is generated from',
    'aggregated scouting signals only (no individual farm names).',
  );
  lines.push('');
  if (primaryCounty) {
    lines.push(`Primary county context: ${primaryCounty}.`);
    lines.push('');
  }

  const hot = [...data.counties]
    .filter((c) => c.farmerCount > 0 || c.scoutingRecordsInWindow > 0)
    .filter((c) => ['watch', 'elevated', 'high'].includes((c.dangerLevel || '').toLowerCase()))
    .sort((a, b) => b.scoutingRecordsInWindow - a.scoutingRecordsInWindow);

  const topByPest = [...data.counties]
    .filter((c) => (c.pestOfConcern || '').trim() || (c.topPests?.length ?? 0) > 0)
    .sort((a, b) => b.scoutingRecordsInWindow - a.scoutingRecordsInWindow)
    .slice(0, 6);

  if (hot.length === 0 && topByPest.length === 0) {
    lines.push('No elevated county bands or dominant pest labels in this window. Reinforce routine scouting and hygiene messaging.');
    return lines.join('\n');
  }

  if (hot.length) {
    lines.push('Counties with elevated pressure (review messaging):');
    for (const c of hot.slice(0, 8)) {
      const pest = c.pestOfConcern || c.topPests?.[0]?.label || 'general pest vigilance';
      lines.push(
        `• ${c.county}: danger band ${(c.dangerLevel || 'low').toLowerCase()}; pest signal: ${pest}; scouting records: ${c.scoutingRecordsInWindow}.`,
      );
    }
    lines.push('');
  }

  if (topByPest.length) {
    lines.push('Suggested group talking points (by scouting volume / pest labels):');
    for (const c of topByPest) {
      const pests = (c.topPests || [])
        .slice(0, 3)
        .map((p) => `${p.label} (${p.recordCount})`)
        .join('; ');
      lines.push(
        `• ${c.county}: emphasize field checks for ${c.pestOfConcern || 'key pests observed in reports'}${pests ? ` — ${pests}` : ''}.`,
      );
    }
    lines.push('');
  }

  lines.push('Closing: remind groups to log observations in AvoGuard so the next county roll-up stays current.');
  return lines.join('\n');
}

export function HCDAReports() {
  const user = getAuthUser();
  const primaryCounty = (user?.county ?? '').trim();

  const [data, setData] = useState<HcdaCountyOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [copyDone, setCopyDone] = useState(false);

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHcdaCountyOverview(WINDOW_DAYS)
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setDraft(buildAdvisoryTemplate(d, primaryCounty));
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load county data for reports.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [primaryCounty]);

  useEffect(() => {
    return reload();
  }, [reload]);

  const sortedCounties = useMemo(() => {
    return [...(data?.counties ?? [])].sort((a, b) => b.scoutingRecordsInWindow - a.scoutingRecordsInWindow);
  }, [data]);

  const resetTemplate = () => {
    if (data) setDraft(buildAdvisoryTemplate(data, primaryCounty));
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border p-6" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}>
        <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#991B1B' }}>
          {error}
        </p>
        <AppLink to="/hcda-registry" className="mt-3 inline-block text-sm font-medium text-[#2D6A4F] underline">
          Open county surveillance
        </AppLink>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-9 w-72 rounded bg-slate-200" />
        <div className="h-40 rounded-lg bg-slate-200" />
        <div className="h-64 rounded-lg bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="mb-5">
        <h1
          className="mb-1 text-2xl sm:text-3xl"
          style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
        >
          HCDA county reports
        </h1>
        <p className="max-w-3xl text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Summary tables and a <strong style={{ color: '#1B4332' }}>group advisory draft</strong> derived from county-level
          pest prevalence and danger bands. Pair with the{' '}
          <AppLink to="/hcda-registry" className="text-[#2D6A4F] underline font-medium">
            county surveillance
          </AppLink>{' '}
          page for filters and charts.
        </p>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Farmers on platform', value: data.totalFarmersUsingTool },
          { label: 'Scouting records (window)', value: data.totalScoutingRecordsInWindow },
          { label: 'Counties in data', value: data.counties.length },
          {
            label: 'Counties watch+',
            value: data.counties.filter((c) =>
              ['watch', 'elevated', 'high'].includes((c.dangerLevel || '').toLowerCase()),
            ).length,
          },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border p-4" style={{ borderColor: '#E0DDD6', backgroundColor: '#fff' }}>
            <p className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              {c.label}
            </p>
            <p className="mt-1 text-2xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
              {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="mb-6 rounded-lg border p-4 sm:p-5"
        style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" style={{ color: '#1B4332' }} />
            <h2 className="text-base font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              Group advisory draft (pest prevalence)
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm"
              style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
            >
              <RefreshCw className="h-4 w-4" />
              Reset from data
            </button>
            <button
              type="button"
              onClick={() => void copyDraft()}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white"
              style={{ backgroundColor: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              <Copy className="h-4 w-4" />
              {copyDone ? 'Copied' : 'Copy to clipboard'}
            </button>
          </div>
        </div>
        <textarea
          className="min-h-[220px] w-full rounded-lg border p-3 text-sm"
          style={{ borderColor: '#E0DDD6', fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck
        />
        <p className="mt-2 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          AvoGuard does not send bulk SMS or WhatsApp from here — use your official channels. Future work could log
          advisories by county or link to scheduled extension campaigns.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#fff' }}>
        <div className="border-b px-4 py-3" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
          <h2 className="text-sm font-semibold sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            County table (reporting window)
          </h2>
          <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Sorted by scouting volume. Cross-check pest names in the{' '}
            <AppLink to="/symptom-codebook" className="text-[#2D6A4F] underline">
              symptom codebook
            </AppLink>{' '}
            or{' '}
            <AppLink to="/knowledge-base" className="text-[#2D6A4F] underline">
              knowledge base
            </AppLink>
            .
          </p>
        </div>
        <TableScroll>
          <table className="min-w-full text-left text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <thead>
              <tr style={{ color: '#717182' }}>
                <th className="px-4 py-3 font-semibold">County</th>
                <th className="px-4 py-3 font-semibold">Records</th>
                <th className="px-4 py-3 font-semibold">Farmers</th>
                <th className="px-4 py-3 font-semibold">Danger</th>
                <th className="px-4 py-3 font-semibold">Pest of concern</th>
              </tr>
            </thead>
            <tbody>
              {sortedCounties.map((row: HcdaCountyRowDto) => (
                <tr key={row.county} className="border-t" style={{ borderColor: '#E0DDD6' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B4332' }}>
                    {row.county}
                  </td>
                  <td className="px-4 py-3">{row.scoutingRecordsInWindow.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.farmerCount.toLocaleString()}</td>
                  <td className="px-4 py-3 capitalize">{row.dangerLevel || '—'}</td>
                  <td className="px-4 py-3">{row.pestOfConcern ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </div>
    </div>
  );
}
