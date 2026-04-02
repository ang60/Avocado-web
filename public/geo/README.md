# Map GeoJSON (runtime assets)

These files are **not** bundled into JS — they load at runtime from `/geo/*.json` so production builds stay small.

- `KEN_adm2.json` — county/subcounty boundaries (Dashboard heat map)
- `Location.json` — farmer regional choropleth (Farmers page)

To refresh from source data, copy from `src/app/data/` after running your geo build scripts, or replace here directly.
