#!/usr/bin/env node
/**
 * Converts src/app/data/KEN_adm2/KEN_adm2.{shp,dbf,prj,shx} → src/app/data/KEN_adm2.json
 * for the dashboard Area Risk map. Re-run after updating the shapefile.
 *
 *   pnpm run build:ken-adm2
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { combine, parseShp, parseDbf } from 'shpjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dir = path.join(root, 'src/app/data/KEN_adm2');
const outPath = path.join(root, 'src/app/data/KEN_adm2.json');

const required = ['KEN_adm2.shp', 'KEN_adm2.dbf', 'KEN_adm2.prj'];
for (const f of required) {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) {
    console.error(`Missing ${p}. Place the full KEN_adm2 shapefile set in src/app/data/KEN_adm2/`);
    process.exit(1);
  }
}

const shp = fs.readFileSync(path.join(dir, 'KEN_adm2.shp'));
const dbf = fs.readFileSync(path.join(dir, 'KEN_adm2.dbf'));
const prj = fs.readFileSync(path.join(dir, 'KEN_adm2.prj'), 'utf8');

const geoms = parseShp(shp, prj);
const props = parseDbf(dbf);
const fc = combine([geoms, props]);

fs.writeFileSync(outPath, JSON.stringify(fc), 'utf8');
console.log(`Wrote ${fc.features.length} features → ${outPath}`);
