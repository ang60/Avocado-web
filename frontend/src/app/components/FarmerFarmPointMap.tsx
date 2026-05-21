import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';

const GEO_URL = `${(import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')}geo/KEN_adm2.json`;
const WIDTH = 700;
const HEIGHT = 340;
const PADDING = 16;

type GeoFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, unknown>>;

type LatLng = { lat: number; lng: number };

export function FarmerFarmPointMap({
  lat,
  lng,
  blockBoundaryPoints,
  polygonStyle,
}: {
  lat?: number | null;
  lng?: number | null;
  blockBoundaryPoints?: Array<LatLng> | null;
  polygonStyle?: { fill: string; stroke: string };
}) {
  const [geoCollection, setGeoCollection] = useState<
    GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, Record<string, unknown>> | null
  >(null);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error('bad status');
        return r.json();
      })
      .then((data) => {
        if (!cancelled && data?.type === 'FeatureCollection' && Array.isArray(data?.features)) {
          setGeoCollection(data);
        }
      })
      .catch(() => {
        if (!cancelled) setGeoError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const projection = useMemo(() => {
    if (!geoCollection?.features?.length) return null;
    return geoMercator().fitExtent(
      [
        [PADDING, PADDING],
        [WIDTH - PADDING, HEIGHT - PADDING],
      ],
      geoCollection as GeoJSON.GeoJSON,
    );
  }, [geoCollection]);

  const paths = useMemo(() => {
    if (!projection || !geoCollection?.features?.length) return [];
    const pathGenerator = geoPath().projection(projection);
    return geoCollection.features
      .map((f, i) => {
        const d = pathGenerator(f as GeoFeature);
        if (!d) return null;
        return { key: `f-${i}`, d };
      })
      .filter((v): v is { key: string; d: string } => Boolean(v));
  }, [geoCollection, projection]);

  const pointXY = useMemo(() => {
    if (!projection || lat == null || lng == null) return null;
    const p = projection([lng, lat]);
    if (!p) return null;
    return { x: p[0], y: p[1] };
  }, [projection, lat, lng]);

  const projectedBoundaryPoints = useMemo(() => {
    if (!projection || !blockBoundaryPoints || !blockBoundaryPoints.length) return [];
    return blockBoundaryPoints
      .map((pt) => {
        const rawLat = (pt as any)?.lat;
        const rawLng = (pt as any)?.lng;
        const latNum = rawLat === '' || rawLat == null ? NaN : Number(rawLat);
        const lngNum = rawLng === '' || rawLng == null ? NaN : Number(rawLng);
        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;
        const p = projection([lngNum, latNum]);
        if (!p) return null;
        return { x: p[0], y: p[1] };
      })
      .filter((v): v is { x: number; y: number } => Boolean(v));
  }, [projection, blockBoundaryPoints]);

  const blockPolygonPoints = useMemo(() => {
    if (!projectedBoundaryPoints || projectedBoundaryPoints.length < 3) return null;
    return projectedBoundaryPoints.map((pt) => `${pt.x},${pt.y}`).join(' ');
  }, [projectedBoundaryPoints]);

  const safePolygonStyle = polygonStyle ?? { fill: 'rgba(245, 158, 11, 0.18)', stroke: '#D97706' };

  const zoom = pointXY ? 3.2 : 1;
  const tx = pointXY ? WIDTH / 2 - pointXY.x * zoom : 0;
  const ty = pointXY ? HEIGHT / 2 - pointXY.y * zoom : 0;

  return (
    <div className="relative overflow-hidden rounded-lg border" style={{ borderColor: '#E0DDD6', backgroundColor: '#e2e8f0' }}>
      {!geoCollection && !geoError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm" style={{ color: '#64748B', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Loading map...
        </div>
      ) : null}
      {geoError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm" style={{ color: '#991B1B', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Map data unavailable.
        </div>
      ) : null}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block h-[340px] w-full">
        <rect width={WIDTH} height={HEIGHT} fill="#e2e8f0" />
        <g transform={`translate(${tx}, ${ty}) scale(${zoom})`}>
          {paths.map((p) => (
            <path key={p.key} d={p.d} fill="#d1d5db" stroke="#94a3b8" strokeWidth={0.6 / zoom} />
          ))}
          {blockPolygonPoints ? (
            <polygon
              points={blockPolygonPoints}
              fill={safePolygonStyle.fill}
              stroke={safePolygonStyle.stroke}
              strokeWidth={2 / zoom}
            />
          ) : null}
          {projectedBoundaryPoints.length
            ? projectedBoundaryPoints.map((pt, idx) => (
                <circle
                  key={`bp-${idx}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={8 / zoom}
                  fill={safePolygonStyle.stroke}
                  opacity={0.85}
                />
              ))
            : null}
          {pointXY ? <circle cx={pointXY.x} cy={pointXY.y} r={5 / zoom} fill="#DC2626" stroke="#fff" strokeWidth={1 / zoom} /> : null}
        </g>
      </svg>
      <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs" style={{ color: '#1B4332', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        {pointXY ? 'Zoomed to farm GPS point' : 'Farm GPS not available'}
      </div>
    </div>
  );
}

