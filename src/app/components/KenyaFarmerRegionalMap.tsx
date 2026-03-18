import { useState, useMemo } from 'react';
import { geoPath, geoTransform } from 'd3-geo';
import kenyaLocationGeo from '../data/Location.json';
import {
  countyKeyFromName2,
  extendBoundsFromGeometry,
} from './kenyaMapShared';

const NO_FARMERS_COLOR = '#0f0f0f';
const STROKE_COLOR = '#64748b';
const MAP_BG = '#e2e8f0';

function farmerChoroplethFill(count: number, maxCount: number): string {
  if (count <= 0) return NO_FARMERS_COLOR;
  const t = Math.min(1, count / Math.max(maxCount, 1));
  // Light mint → deep AvoGuard green
  const r = Math.round(226 - t * 200);
  const g = Math.round(232 - t * 80);
  const b = Math.round(239 - t * 139);
  const r2 = Math.round(45 + t * 58);
  const g2 = Math.round(106 + t * 50);
  const b2 = Math.round(79 + t * 40);
  return `rgb(${Math.round(r * (1 - t) + r2 * t)},${Math.round(g * (1 - t) + g2 * t)},${Math.round(b * (1 - t) + b2 * t)})`;
}

type GeoFeature = {
  type: string;
  properties: Record<string, unknown>;
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
};

const WIDTH = 320;
const HEIGHT = 200;
const PADDING = 10;

export interface KenyaFarmerRegionalMapProps {
  /** County name → registered farmer count (keys should match farmer `county` / GeoJSON NAME_2) */
  farmerCountByCounty: Record<string, number>;
}

export function KenyaFarmerRegionalMap({ farmerCountByCounty }: KenyaFarmerRegionalMapProps) {
  const [hovered, setHovered] = useState<{ county: string; count: number } | null>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(farmerCountByCounty)),
    [farmerCountByCounty]
  );

  const paths = useMemo(() => {
    const collection = kenyaLocationGeo as { type: string; features: GeoFeature[] };
    const features = collection.features;
    if (!features?.length) return [];

    const bounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    };
    for (const feature of features) {
      extendBoundsFromGeometry(bounds, feature.geometry);
    }
    const spanX = bounds.maxX - bounds.minX;
    const spanY = bounds.maxY - bounds.minY;
    if (!(spanX > 0 && spanY > 0)) return [];

    const innerW = WIDTH - 2 * PADDING;
    const innerH = HEIGHT - 2 * PADDING;
    const scale = Math.min(innerW / spanX, innerH / spanY);
    const offsetX = PADDING + (innerW - scale * spanX) / 2 - scale * bounds.minX;
    const offsetY = PADDING + (innerH - scale * spanY) / 2 + scale * bounds.maxY;

    const projection = geoTransform({
      point(x: number, y: number) {
        this.stream.point(offsetX + x * scale, offsetY - y * scale);
      },
    });
    const pathGenerator = geoPath().projection(projection);

    return features
      .map((feature, index) => {
        const pathD = pathGenerator(feature as Parameters<typeof pathGenerator>[0]);
        const countyKey = countyKeyFromName2(feature.properties);
        const count = countyKey ? farmerCountByCounty[countyKey] ?? 0 : 0;
        const fill = countyKey
          ? farmerChoroplethFill(count, maxCount)
          : NO_FARMERS_COLOR;
        return {
          key: `${countyKey || 'x'}-${index}`,
          pathD,
          fill,
          countyKey,
          count,
        };
      })
      .filter((p): p is typeof p & { pathD: string } => p.pathD != null && p.pathD.length > 0);
  }, [farmerCountByCounty, maxCount]);

  return (
    <div className="relative w-full min-w-0 max-w-full mb-6">
      <div
        className="w-full rounded-lg border border-slate-300 overflow-hidden"
        style={{ backgroundColor: MAP_BG }}
        onMouseMove={(e) => {
          if (hovered) setTooltip({ x: e.clientX, y: e.clientY });
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto block max-h-[200px]"
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
              onMouseEnter={(e) => {
                if (!countyKey) return;
                setHovered({
                  county: countyKey,
                  count: farmerCountByCounty[countyKey] ?? 0,
                });
                setTooltip({ x: e.clientX, y: e.clientY });
              }}
            />
          ))}
        </svg>
      </div>

      {hovered && (
        <div
          className="fixed z-50 px-3 py-2 rounded-lg border shadow-lg pointer-events-none text-sm"
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
          <span>{hovered.count} farmer{hovered.count !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-2 text-[10px]" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
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
