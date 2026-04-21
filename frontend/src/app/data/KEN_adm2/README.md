# KEN_adm2 shapefile (dashboard map)

Place the full **KEN_adm2** layer here:

- `KEN_adm2.shp` (required)
- `KEN_adm2.dbf` (required)
- `KEN_adm2.shx` (recommended)
- `KEN_adm2.prj` (required for correct coordinates)

After adding or replacing files, regenerate GeoJSON for the app:

```bash
pnpm run build:ken-adm2
```

This writes `../KEN_adm2.json`, which **Area Risk Monitoring** on the Dashboard uses.
