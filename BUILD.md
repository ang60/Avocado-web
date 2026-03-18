# Production build

## What’s in the bundle

- **No multi‑MB GeoJSON in JS.** `KEN_adm2.json` and `Location.json` live under **`public/geo/`** and are copied to **`dist/geo/`**. They load at runtime when users open the Dashboard heat map or Farmers regional map.
- **Route code splitting:** each major page is a separate chunk; initial load only pulls the shell + the route you open.
- **Charts:** Recharts (and d3-geo) are split into their own chunks so pages without charts don’t pay that cost up front.

## Deploy

Ship the whole **`dist/`** folder, including **`dist/geo/`**. If maps show errors, ensure those JSON files are deployed alongside the app (same origin).

## Regenerating county map data

After updating the KEN_adm2 shapefile:

```bash
pnpm run build:ken-adm2
```

This writes `src/app/data/KEN_adm2.json` **and** `public/geo/KEN_adm2.json`. For `Location.json`, copy your generated file to **`public/geo/Location.json`** (Farmers map).
