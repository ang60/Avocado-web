import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { countyKeyFromName2 } from './kenyaMapShared';

/** Farmers regional map uses the same county boundaries as the Dashboard heat map (KEN_adm2.json, WGS84). */
const COUNTY_GEO_URL = `${(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')}geo/KEN_adm2.json`;

const NO_FARMERS_COLOR = '#0f0f0f';
const STROKE_COLOR = '#64748b';
const MAP_BG = '#e2e8f0';

function farmerChoroplethFill(count: number, maxCount: number): string {
  if (count <= 0) return NO_FARMERS_COLOR;
  const t = Math.min(1, count / Math.max(maxCount, 1));
  // Light mint -> deep AvoGuard green
  const r = Math.round(226 - t * 200);
  const g = Math.round(232 - t * 80);
  const b = Math.round(239 - t * 139);
  const r2 = Math.round(45 + t * 58);
  const g2 = Math.round(106 + t * 50);
  const b2 = Math.round(79 + t * 40);
  return `rgb(${Math.round(r * (1 - t) + r2 * t)},${Math.round(g * (1 - t) + g2 * t)},${Math.round(b * (1 - t) + b2 * t)})`;
}

type GeoFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, unknown>>;

const WIDTH = 320;
const HEIGHT = 200;
const PADDING = 10;

export interface KenyaFarmerRegionalMapProps {
  /** County name -> registered farmer count (keys should match GeoJSON NAME_2) */
  farmerCountByCounty: Record<string, number>;
}

export function KenyaFarmerRegionalMap({ farmerCountByCounty }: KenyaFarmerRegionalMapProps) {
  const [hovered, setHovered] = useState<{ county: string; count: number } | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const [geoCollection, setGeoCollection] = useState<
    GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, unknown>> | null
  >(null);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(COUNTY_GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error('bad status');
        const ct = r.headers.get('content-type') || '';
        if (ct.includes('text/html')) throw new Error('html');
        return r.json();
      })
      .then((data) => {
        if (!cancelled && data?.type === 'FeatureCollection' && Array.isArray(data?.features) && data.features.length) {
          setGeoCollection(data);
        } else if (!cancelled) {
          setGeoError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setGeoError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(farmerCountByCounty)),
    [farmerCountByCounty]
  );

  const paths = useMemo(() => {
    const collection = geoCollection;
    if (!collection?.features?.length) return [];

    const projection = geoMercator().fitExtent(
      [
        [PADDING, PADDING],
        [WIDTH - PADDING, HEIGHT - PADDING],
      ],
      collection as GeoJSON.GeoJSON
    );

    const pathGenerator = geoPath().projection(projection);

    return collection.features
      .map((feature, index) => {
        const f = feature as GeoFeature;
        const pathD = pathGenerator(f);
        const countyKey = countyKeyFromName2(f.properties);
        const count = countyKey ? farmerCountByCounty[countyKey] ?? 0 : 0;
        const fill = countyKey ? farmerChoroplethFill(count, maxCount) : NO_FARMERS_COLOR;

        return {
          key: `${countyKey || 'x'}-${index}`,
          pathD,
          fill,
          countyKey,
          count,
        };
      })
      .filter((p): p is typeof p & { pathD: string } => p.pathD != null && p.pathD.length > 0);
  }, [farmerCountByCounty, maxCount, geoCollection]);

  return (
    <div className="relative w-full min-w-0 max-w-full mb-6">
      <div
        className="relative w-full rounded-lg border border-slate-300 overflow-hidden"
        style={{ backgroundColor: MAP_BG }}
        onPointerMove={(e) => {
          if (!hovered) return;
          if (e.pointerType === 'touch') return;
          setTooltip({ x: e.clientX, y: e.clientY });
        }}
        onPointerLeave={() => setHovered(null)}
      >
        {!geoCollection && !geoError && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center text-xs"
            style={{ backgroundColor: 'rgba(226,232,240,0.9)', color: '#64748b', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            Loading regional map...
          </div>
        )}

        {geoError && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 p-2 text-center text-xs"
            style={{ backgroundColor: '#fef2f2', color: '#991b1b', fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <span>Map data failed to load.</span>
            <span className="text-[10px] opacity-90 break-all max-w-full">
              Ensure <code className="bg-white px-1 rounded">/geo/KEN_adm2.json</code> is deployed.
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto block max-h-[200px] touch-pan-y"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Kenya farmers by county"
        >
          <rect width={WIDTH} height={HEIGHT} fill={MAP_BG} />

          {paths.map(({ key, pathD, fill, countyKey, count }) => (
            <path
              key={key}
              d={pathD}
              fill={fill}
              stroke={count > 0 ? 'rgba(255,255,255,0.25)' : STROKE_COLOR}
              strokeWidth={0.35}
              className="cursor-pointer hover:opacity-90"
              onPointerEnter={(e) => {
                if (e.pointerType === 'touch') return;
                if (!countyKey) return;
                setHovered({ county: countyKey, count: farmerCountByCounty[countyKey] ?? 0 });
                setTooltip({ x: e.clientX, y: e.clientY });
              }}
              onPointerDown={(e) => {
                if (!countyKey) return;
                setHovered({ county: countyKey, count: farmerCountByCounty[countyKey] ?? 0 });
                setTooltip({ x: e.clientX, y: e.clientY });
              }}
            />
          ))}
        </svg>
      </div>

      {hovered && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg border shadow-lg pointer-events-none text-sm w-auto max-w-[80vw]"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
            left: tooltip.x + 12,
            top: tooltip.y - 8,
            transform: 'translateY(-100%)',
            fontFamily: 'IBM Plex Sans, sans-serif',
            color: '#1B4332',
          }}
        >
          <span className="font-medium">{hovered.county}</span>
          <span className="text-[#717182]"> — </span>
          <span>
            {hovered.count} farmer{hovered.count !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div
        className="flex items-center justify-center gap-4 mt-2 text-[10px]"
        style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
      >
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: NO_FARMERS_COLOR }} />
          None
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: farmerChoroplethFill(1, maxCount) }} />
          Fewer
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: farmerChoroplethFill(maxCount, maxCount) }} />
          More
        </span>
      </div>
    </div>
  );
}
