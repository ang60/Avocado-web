import { Activity, AlertTriangle, ArrowRight, MapPin, Sprout, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppLink } from '../components/AppLink';
import { KenyaHeatMap, type HeatMapRiskLevel, type KenyaHeatMapTooltipOverride } from '../components/KenyaHeatMap';
import { TableScroll } from '../components/TableScroll';
import { fetchHcdaCountyOverview, type HcdaCountyOverviewDto, type HcdaCountyRowDto } from '../api/realApi';
import { getApiErrorMessage } from '../api/errors';
import { getAuthUser } from '../auth';
import { useIsNarrowPhone } from '../hooks/useMediaQuery';

const WINDOW_DAYS = 30;

function hcdaDangerToHeatRisk(row: HcdaCountyRowDto): HeatMapRiskLevel | null {
  if (row.farmerCount <= 0 && row.scoutingRecordsInWindow <= 0) return null;
  const v = (row.dangerLevel || 'low').toLowerCase();
  if (v === 'high') return 'critical';
  if (v === 'elevated') return 'high';
  if (v === 'watch') return 'medium';
  return 'low';
}

function dangerLabel(level: string) {
  const v = (level || 'low').toLowerCase();
  const map: Record<string, string> = {
    high: 'High',
    elevated: 'Elevated',
    watch: 'Watch',
    low: 'Low',
  };
  return map[v] || level || 'Low';
}

export function HCDADashboard() {
  const narrowPhone = useIsNarrowPhone();
  const chartHeight = narrowPhone ? 220 : 260;
  const user = getAuthUser();
  const userCounty = (user?.county ?? '').trim();

  const [data, setData] = useState<HcdaCountyOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchHcdaCountyOverview(WINDOW_DAYS)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(e, 'Could not load HCDA county overview.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedByRecords = useMemo(() => {
    return [...(data?.counties ?? [])].sort((a, b) => b.scoutingRecordsInWindow - a.scoutingRecordsInWindow);
  }, [data]);

  const { countyRiskOverride, countyTooltipOverride } = useMemo(() => {
    const risk: Record<string, HeatMapRiskLevel> = {};
    const tips: KenyaHeatMapTooltipOverride = {};
    for (const row of data?.counties ?? []) {
      const heat = hcdaDangerToHeatRisk(row);
      if (!heat) continue;
      risk[row.county] = heat;
      tips[row.county] = {
        lines: [
          { label: 'Farmers on platform', value: row.farmerCount.toLocaleString() },
          { label: 'Scouting records (window)', value: row.scoutingRecordsInWindow.toLocaleString() },
          { label: 'Farmers scouting', value: row.distinctFarmersWithScouting.toLocaleString() },
          { label: 'Pest of concern', value: row.pestOfConcern ?? '—' },
          { label: 'Danger band', value: dangerLabel(row.dangerLevel) },
        ],
      };
    }
    return { countyRiskOverride: risk, countyTooltipOverride: tips };
  }, [data]);

  const barChartData = useMemo(() => {
    return sortedByRecords.slice(0, 10).map((c) => ({
      name: c.county.length > 12 ? `${c.county.slice(0, 11)}…` : c.county,
      fullName: c.county,
      records: c.scoutingRecordsInWindow,
    }));
  }, [sortedByRecords]);

  const countiesWithActivity = useMemo(() => {
    return (data?.counties ?? []).filter((c) => c.farmerCount > 0 || c.scoutingRecordsInWindow > 0).length;
  }, [data]);

  const urgentCountyCount = useMemo(() => {
    return (data?.counties ?? []).filter((c) => {
      const d = (c.dangerLevel || '').toLowerCase();
      const urgent = d === 'elevated' || d === 'high';
      return urgent && (c.farmerCount > 0 || c.scoutingRecordsInWindow > 0);
    }).length;
  }, [data]);

  const topCounty = sortedByRecords[0];

  const tableRows = useMemo(() => sortedByRecords.slice(0, 8), [sortedByRecords]);

  if (error) {
    return (
      <div className="rounded-lg border p-6 text-center" style={{ borderColor: '#E0DDD6' }}>
        <p style={{ color: '#b45309', fontFamily: 'IBM Plex Sans, sans-serif' }}>{error}</p>
        <p className="mt-2 text-sm" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Check that you are signed in and the API is reachable. Open{' '}
          <AppLink to="/hcda-registry" className="text-[#2D6A4F] underline font-medium">
            HCDA county surveillance
          </AppLink>{' '}
          for the full table once the connection works.
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-slate-200" />
          ))}
        </div>
        <div className="h-72 rounded-lg bg-slate-200" />
      </div>
    );
  }

  return (
    <>
      <header className="mb-4 md:mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="mb-1 text-2xl sm:text-3xl"
              style={{
                fontFamily: 'DM Serif Display, serif',
                color: '#1B4332',
              }}
            >
              HCDA dashboard
            </h1>
            <p className="max-w-3xl" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              County-level scouting signals and farmer participation on AvoGuard — aligned with extension and
              surveillance priorities. No farm-level registry is shown here.
            </p>
            {userCounty ? (
              <p className="mt-2 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#4B5563' }}>
                Your profile primary county: <strong style={{ color: '#1B4332' }}>{userCounty}</strong>. Figures below
                are national (all counties).
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <AppLink
              to="/hcda-registry"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95"
              style={{ backgroundColor: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              County surveillance
              <ArrowRight className="h-4 w-4" />
            </AppLink>
            <AppLink
              to="/hcda-reports"
              className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white"
              style={{ borderColor: '#2D6A4F', color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              County reports
              <ArrowRight className="h-4 w-4" />
            </AppLink>
          </div>
        </div>
      </header>

      <div className="mb-4 grid min-w-0 max-w-full grid-cols-2 gap-3 sm:mb-5 sm:gap-4 lg:grid-cols-4 lg:gap-6 [&>*]:min-w-0">
        {[
          {
            label: 'Farmers on platform',
            value: data.totalFarmersUsingTool.toLocaleString(),
            sub: 'Farmer accounts using the tool',
            icon: Users,
          },
          {
            label: 'Scouting records',
            value: data.totalScoutingRecordsInWindow.toLocaleString(),
            sub: `Last ${data.windowDays} days (all counties)`,
            icon: Activity,
          },
          {
            label: 'Counties with activity',
            value: countiesWithActivity.toLocaleString(),
            sub: 'Farmers or scouting in window',
            icon: MapPin,
          },
          {
            label: 'Counties elevated / high',
            value: urgentCountyCount.toLocaleString(),
            sub: 'Danger band (needs attention)',
            icon: AlertTriangle,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border p-3 sm:p-4 md:p-5"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
                {card.label}
              </p>
              <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(27, 67, 50, 0.08)' }}>
                <card.icon className="h-5 w-5 shrink-0" style={{ color: '#1B4332' }} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl" style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}>
              {card.value}
            </p>
            <p className="mt-1 text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {topCounty ? (
        <div
          className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 sm:mb-5"
          style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}
        >
          <Sprout className="h-5 w-5 shrink-0" style={{ color: '#1B4332' }} />
          <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            <span className="font-semibold">Highest scouting volume:</span> {topCounty.county} (
            {topCounty.scoutingRecordsInWindow.toLocaleString()} records
            {topCounty.pestOfConcern ? ` · ${topCounty.pestOfConcern}` : ''}).
          </p>
        </div>
      ) : null}

      <div className="mb-4 grid min-w-0 max-w-full grid-cols-1 gap-4 sm:mb-5 lg:grid-cols-2 lg:gap-6 [&>*]:min-w-0">
        <div
          className="min-w-0 rounded-lg border p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
        >
          <h3 className="mb-1 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Top counties by scouting volume
          </h3>
          <p className="mb-3 text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Last {data.windowDays} days — top 10
          </p>
          <div className="min-h-[220px] w-full min-w-0 sm:min-h-[260px]">
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={barChartData} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0DDD6" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#717182', fontSize: 11 }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fill: '#717182', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString(), 'Records']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                    return row?.fullName ?? '';
                  }}
                  contentStyle={{ fontFamily: 'IBM Plex Sans, sans-serif', borderRadius: 8 }}
                />
                <Bar dataKey="records" fill="#2D6A4F" name="Records" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="min-w-0 rounded-lg border p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
        >
          <h3 className="mb-1 text-sm sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            County pressure (HCDA danger band)
          </h3>
          <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Colours follow the HCDA band where there is farmer or scouting activity. Hover a county for details.
          </p>
          <div className="mt-3">
            <KenyaHeatMap countyRiskOverride={countyRiskOverride} countyTooltipOverride={countyTooltipOverride} />
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-lg border"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E0DDD6' }}
      >
        <div className="border-b px-4 py-3 sm:px-5" style={{ borderColor: '#E0DDD6', backgroundColor: '#F7F4EF' }}>
          <h3 className="text-sm font-semibold sm:text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            Snapshot — highest scouting counties
          </h3>
          <p className="text-xs sm:text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Full sortable table and filters are on the county surveillance page.
          </p>
        </div>
        <TableScroll className="-mx-1 px-1 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[560px] text-left text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <thead>
              <tr style={{ color: '#717182' }}>
                <th className="px-4 py-3 font-semibold">County</th>
                <th className="px-4 py-3 font-semibold">Farmers</th>
                <th className="px-4 py-3 font-semibold">Records</th>
                <th className="px-4 py-3 font-semibold">Danger</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.county} className="border-t" style={{ borderColor: '#E0DDD6' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1B4332' }}>
                    {row.county}
                    {userCounty && row.county.toLowerCase() === userCounty.toLowerCase() ? (
                      <span className="ml-2 text-xs font-normal text-[#2D6A4F]">(your county)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{row.farmerCount.toLocaleString()}</td>
                  <td className="px-4 py-3">{row.scoutingRecordsInWindow.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor:
                          (row.dangerLevel || '').toLowerCase() === 'high'
                            ? '#FEE2E2'
                            : (row.dangerLevel || '').toLowerCase() === 'elevated'
                              ? '#FFEDD5'
                              : (row.dangerLevel || '').toLowerCase() === 'watch'
                                ? '#FEF9C3'
                                : '#DCFCE7',
                        color: '#1B4332',
                      }}
                    >
                      {dangerLabel(row.dangerLevel)}
                    </span>
                  </td>
                </tr>
              ))}
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center" style={{ color: '#717182' }}>
                    No county data in this window yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </TableScroll>
      </div>
    </>
  );
}
