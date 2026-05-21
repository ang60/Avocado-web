import { useState, useMemo, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { geoMercator, geoPath, geoContains } from 'd3-geo';
import { countyKeyFromName2 } from './kenyaMapShared';

/** Loaded from `/geo/KEN_adm2.json` at runtime — not bundled (multi‑MB). */
const GEO_URL = `${(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')}geo/KEN_adm2.json`;

export type HeatMapRiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type KenyaHeatMapTooltipOverride = Record<
  string,
  { lines: Array<{ label: string; value: string }> }
>;

export type KenyaHeatMapProps = {
  /** When set, these counties use API-driven colours instead of built-in demo data. */
  countyRiskOverride?: Record<string, HeatMapRiskLevel>;
  /** Optional per-county tooltip rows (e.g. HCDA surveillance metrics). */
  countyTooltipOverride?: KenyaHeatMapTooltipOverride;
};

interface CountyData {
  name: string;
  cases: number;
  riskLevel: HeatMapRiskLevel;
  farms: number;
  activeOutbreaks: number;
}

const countyData: Record<string, CountyData> = {
  "Murang'a": { name: "Murang'a County", cases: 45, riskLevel: 'critical', farms: 24, activeOutbreaks: 3 },
  Kiambu: { name: 'Kiambu County', cases: 28, riskLevel: 'high', farms: 18, activeOutbreaks: 2 },
  Meru: { name: 'Meru County', cases: 19, riskLevel: 'medium', farms: 12, activeOutbreaks: 1 },
  Nyeri: { name: 'Nyeri County', cases: 14, riskLevel: 'medium', farms: 9, activeOutbreaks: 1 },
  Embu: { name: 'Embu County', cases: 8, riskLevel: 'low', farms: 6, activeOutbreaks: 0 },
  Bungoma: { name: 'Bungoma County', cases: 12, riskLevel: 'low', farms: 8, activeOutbreaks: 1 },
  Kakamega: { name: 'Kakamega County', cases: 6, riskLevel: 'low', farms: 4, activeOutbreaks: 0 },
  'Trans Nzoia': { name: 'Trans Nzoia County', cases: 5, riskLevel: 'low', farms: 3, activeOutbreaks: 0 },
};

const riskColors = {
  critical: '#DC2626',
  high: '#D97706',
  medium: '#FBBF24',
  low: '#74C69D',
};

const NO_DATA_COLOR = '#1e293b';
const MAP_CANVAS_BG = '#e2e8f0';
const PADDING = 10;

type GeoFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, unknown>>;

function getFillForCounty(countyKey: string, countyRiskOverride?: Record<string, HeatMapRiskLevel>): string {
  const override = countyRiskOverride?.[countyKey];
  if (override) return riskColors[override];
  const data = countyData[countyKey];
  if (data) return riskColors[data.riskLevel];
  return NO_DATA_COLOR;
}

export function KenyaHeatMap(props?: KenyaHeatMapProps) {
  const { countyRiskOverride, countyTooltipOverride } = props ?? {};
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 640, h: 400 });
  const [hoveredCountyKey, setHoveredCountyKey] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const [geoStatus, setGeoStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const [geoCollection, setGeoCollection] = useState<GeoJSON.FeatureCollection<
    GeoJSON.Polygon | GeoJSON.MultiPolygon,
    Record<string, unknown>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error('bad status');
        return r.json();
      })
      .then((data) => {
        if (!cancelled && data?.features?.length) {
          setGeoCollection(data);
          setGeoStatus('ready');
        } else if (!cancelled) setGeoStatus('error');
      })
      .catch(() => {
        if (!cancelled) setGeoStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { collection, featureRows } = useMemo(() => {
    const collectionInner = (geoCollection ?? {
      type: 'FeatureCollection' as const,
      features: [],
    }) as GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, unknown>>;
    const rows = (collectionInner.features || []).map((feature, i) => {
      const countyKey = countyKeyFromName2(feature.properties as Record<string, unknown>);
      return {
        feature: feature as GeoFeature,
        countyKey,
        fill: countyKey ? getFillForCounty(countyKey, countyRiskOverride) : NO_DATA_COLOR,
        key: `${countyKey || 'c'}-${i}`,
      };
    });
    return { collection: collectionInner, featureRows: rows };
  }, [geoCollection, countyRiskOverride]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = Math.floor(el.clientWidth);
      if (w < 1) return;
      const h = Math.max(280, Math.round(w * 0.56));
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(el);
    const w = Math.floor(el.clientWidth);
    if (w > 0) setSize({ w, h: Math.max(280, Math.round(w * 0.56)) });
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (geoStatus !== 'ready') return;
    const el = wrapRef.current;
    if (!el) return;
    // Some flex layouts report 0×0 on first paint; re-measure after geo is ready.
    const w = Math.floor(el.clientWidth);
    if (w < 1) return;
    const h = Math.max(280, Math.round(w * 0.56));
    setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
  }, [geoStatus]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !collection.features?.length || size.w < 1) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { w, h } = size;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const projection = geoMercator().fitExtent(
      [
        [PADDING, PADDING],
        [w - PADDING, h - PADDING],
      ],
      collection as GeoJSON.GeoJSON
    );
    const pathToD = geoPath().projection(projection);

    ctx.fillStyle = MAP_CANVAS_BG;
    ctx.fillRect(0, 0, w, h);

    for (const { feature, countyKey, fill } of featureRows) {
      const hasData =
        countyKey &&
        (countyData[countyKey] || (countyRiskOverride && countyKey in countyRiskOverride));
      const isHover = countyKey && countyKey === hoveredCountyKey;
      const d = pathToD(feature as GeoFeature);
      if (!d || d.length < 2) continue;
      let p2d: Path2D;
      try {
        p2d = new Path2D(d);
      } catch {
        continue;
      }
      ctx.fillStyle = fill;
      ctx.fill(p2d);
      ctx.strokeStyle = isHover ? '#ffffff' : hasData ? 'rgba(255,255,255,0.85)' : 'rgba(148, 163, 184, 0.95)';
      ctx.lineWidth = isHover ? 2 : hasData ? 1.4 : 1;
      ctx.lineJoin = 'round';
      ctx.stroke(p2d);
    }
  }, [collection, featureRows, size.w, size.h, hoveredCountyKey, countyRiskOverride]);

  useLayoutEffect(() => {
    draw();
  }, [draw]);

  const mapProjection = useMemo(() => {
    if (size.w < 1 || !collection.features?.length) return null;
    return geoMercator().fitExtent(
      [
        [PADDING, PADDING],
        [size.w - PADDING, size.h - PADDING],
      ],
      collection as GeoJSON.GeoJSON
    );
  }, [collection, size.w, size.h]);

  const pickCounty = useCallback(
    (clientX: number, clientY: number): string | null => {
      const canvas = canvasRef.current;
      const proj = mapProjection;
      if (!canvas || !proj) return null;
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * size.w;
      const y = ((clientY - rect.top) / rect.height) * size.h;
      const inv = proj.invert([x, y]);
      if (!inv || !Number.isFinite(inv[0]) || !Number.isFinite(inv[1])) return null;
      const [lon, lat] = inv;
      for (let i = featureRows.length - 1; i >= 0; i--) {
        const { feature, countyKey } = featureRows[i];
        if (!countyKey) continue;
        try {
          if (geoContains(feature, [lon, lat])) return countyKey;
        } catch {
          /* ignore */
        }
      }
      return null;
    },
    [featureRows, size.w, size.h, mapProjection]
  );

  const handlePointer = (clientX: number, clientY: number) => {
    const next = pickCounty(clientX, clientY);
    setHoveredCountyKey((prev) => (prev === next ? prev : next));
    setTooltip({ x: clientX, y: clientY });
  };

  const hoveredData = hoveredCountyKey ? countyData[hoveredCountyKey] : null;
  const hoveredTipOverride =
    hoveredCountyKey && countyTooltipOverride ? countyTooltipOverride[hoveredCountyKey] : undefined;

  return (
    <div className="relative w-full min-w-0 max-w-full">
      <div
        ref={wrapRef}
        className="relative min-h-[220px] w-full min-w-0 max-w-full overflow-hidden rounded border border-slate-300 sm:min-h-[280px] md:min-h-[320px]"
        style={{ backgroundColor: MAP_CANVAS_BG }}
      >
        {geoStatus === 'loading' && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(226, 232, 240, 0.92)' }}
          >
            <span className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#64748b' }}>
              Loading map…
            </span>
          </div>
        )}
        {geoStatus === 'error' && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
            style={{ backgroundColor: '#fef2f2' }}
          >
            <p className="text-sm text-center max-w-md" style={{ color: '#991b1b', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Map data not found. Ensure <code className="text-xs bg-white px-1 rounded">public/geo/KEN_adm2.json</code> exists
              (run <code className="text-xs bg-white px-1 rounded">pnpm run build:ken-adm2</code> after placing shapefiles).
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block w-full max-w-full cursor-crosshair touch-pan-y"
          role="img"
          aria-label="Kenya area risk map by county"
          onPointerMove={(e) => {
            // On touch devices, let the browser handle gestures (we update on tap).
            if (e.pointerType === 'touch') return;
            handlePointer(e.clientX, e.clientY);
          }}
          onPointerDown={(e) => handlePointer(e.clientX, e.clientY)}
          onPointerLeave={() => setHoveredCountyKey(null)}
        />
      </div>

      {hoveredCountyKey && (
        <div
          className="fixed z-50 p-3 sm:p-4 rounded-lg border shadow-lg pointer-events-none w-auto max-w-[80vw]"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
            borderRadius: '8px',
            left: tooltip.x + 16,
            top: tooltip.y - 8,
            minWidth: '160px',
            maxWidth: '80vw',
            transform: 'translateY(-100%)',
          }}
        >
          <h4 className="font-medium mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
            {hoveredData ? hoveredData.name : `${hoveredCountyKey} County`}
          </h4>
          {hoveredTipOverride ? (
            <div className="space-y-1 text-sm">
              {hoveredTipOverride.lines.map((line) => (
                <div key={line.label} className="flex justify-between gap-4">
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>{line.label}:</span>
                  <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{line.value}</span>
                </div>
              ))}
            </div>
          ) : hoveredData ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Cases:</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{hoveredData.cases}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Farms:</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{hoveredData.farms}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Active Outbreaks:</span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>{hoveredData.activeOutbreaks}</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: '#E0DDD6' }}>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Risk Level:</span>
                <span
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: `${riskColors[hoveredData.riskLevel]}20`,
                    color: riskColors[hoveredData.riskLevel],
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderRadius: '4px',
                  }}
                >
                  {hoveredData.riskLevel.charAt(0).toUpperCase() + hoveredData.riskLevel.slice(1)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
              No risk data
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: riskColors.critical }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: riskColors.high }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: riskColors.medium }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: riskColors.low }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded shrink-0" style={{ backgroundColor: NO_DATA_COLOR }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>No data</span>
        </div>
      </div>
    </div>
  );
}
