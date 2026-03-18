/** Normalize GeoJSON county name (NAME_2 or shapeName) to app county keys */
export function countyKeyFromName2(properties: Record<string, unknown>): string {
  const raw =
    (typeof properties.NAME_2 === 'string' ? properties.NAME_2.trim() : '') ||
    (typeof properties.shapeName === 'string' ? properties.shapeName.trim() : '');
  if (!raw) return '';
  if (raw === 'Trans-Nzoia') return 'Trans Nzoia';
  return raw;
}

export type GeoRing = [number, number][];

export function extendBoundsFromRing(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  ring: GeoRing
): void {
  for (const [x, y] of ring) {
    bounds.minX = Math.min(bounds.minX, x);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxY = Math.max(bounds.maxY, y);
  }
}

export function extendBoundsFromGeometry(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): void {
  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      extendBoundsFromRing(bounds, ring as GeoRing);
    }
    return;
  }
  for (const polygon of geometry.coordinates) {
    for (const ring of polygon) {
      extendBoundsFromRing(bounds, ring as GeoRing);
    }
  }
}
