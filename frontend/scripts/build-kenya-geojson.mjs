#!/usr/bin/env node
/**
 * Fetches 47 Kenya county GeoJSON files from Mondieki/kenya-counties-subcounties
 * and combines them into a single FeatureCollection for the dashboard map.
 * Run: node scripts/build-kenya-geojson.mjs
 */
const BASE = 'https://raw.githubusercontent.com/Mondieki/kenya-counties-subcounties/master/geojson';

// Filename (no .json) -> Display name (for tooltips/labels)
const COUNTY_NAMES = {
  baringo: 'Baringo',
  bomet: 'Bomet',
  bungoma: 'Bungoma',
  busia: 'Busia',
  'elgeyo-marakwet': 'Elgeyo-Marakwet',
  embu: 'Embu',
  garissa: 'Garissa',
  homabay: 'Homa Bay',
  isiolo: 'Isiolo',
  kajiado: 'Kajiado',
  kakamega: 'Kakamega',
  kericho: 'Kericho',
  kiambu: 'Kiambu',
  kilifi: 'Kilifi',
  kirinyaga: 'Kirinyaga',
  kisii: 'Kisii',
  kisumu: 'Kisumu',
  kitui: 'Kitui',
  kwale: 'Kwale',
  laikipia: 'Laikipia',
  lamu: 'Lamu',
  machakos: 'Machakos',
  makueni: 'Makueni',
  mandera: 'Mandera',
  marsabit: 'Marsabit',
  meru: 'Meru',
  migori: 'Migori',
  mombasa: 'Mombasa',
  muranga: "Murang'a",
  nairobi: 'Nairobi',
  nakuru: 'Nakuru',
  nandi: 'Nandi',
  narok: 'Narok',
  nyamira: 'Nyamira',
  nyandarua: 'Nyandarua',
  nyeri: 'Nyeri',
  samburu: 'Samburu',
  siaya: 'Siaya',
  'taita-taveta': 'Taita-Taveta',
  'tana-river': 'Tana River',
  'tharaka-nithi': 'Tharaka-Nithi',
  'trans-nzoia': 'Trans Nzoia',
  turkana: 'Turkana',
  'uasin-gishu': 'Uasin Gishu',
  vihiga: 'Vihiga',
  wajir: 'Wajir',
  'west-pokot': 'West Pokot',
};

function geometryCollectionToFeature(geomCollection, name) {
  if (geomCollection.type === 'GeometryCollection' && geomCollection.geometries?.length) {
    const first = geomCollection.geometries[0];
    return {
      type: 'Feature',
      properties: { name },
      geometry: first,
    };
  }
  return null;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function main() {
  const features = [];
  for (const [filename, displayName] of Object.entries(COUNTY_NAMES)) {
    try {
      const url = `${BASE}/${filename}.json`;
      const data = await fetchJson(url);
      const feature = geometryCollectionToFeature(data, displayName);
      if (feature) features.push(feature);
    } catch (e) {
      console.warn(`Skip ${filename}: ${e.message}`);
    }
  }

  const fc = {
    type: 'FeatureCollection',
    features,
  };

  const fs = await import('fs');
  const path = await import('path');
  const outDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'kenya-counties.geojson');
  fs.writeFileSync(outPath, JSON.stringify(fc), 'utf8');
  console.log(`Wrote ${features.length} counties to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
