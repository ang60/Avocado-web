# Merged updates (`AvoGuard Dashboard Design (2)`)

The drop-in folder lives at:

`app/AvoGuard Dashboard Design (2)/`

It was merged into this Vite app as follows.

## Added

- `src/app/components/AddEntityModal.tsx` — Admin “add entity” flow
- `src/app/components/KEPHISRiskIntelTab.tsx` — KEPHIS risk intel tab
- `src/app/components/LinkExporterModal.tsx` — link farmer ↔ exporter
- `src/app/data/exporters.ts` — shared exporter list for the modal
- `src/imports/Web_1920_–_1.svg` — asset from the bundle (if present in source)

## Pages / components overwritten from the bundle

Next.js `'use client'` lines were stripped (this repo is Vite + React).

- Admin, Alerts, CaseDetail, CaseManagement, ComplianceHub, FarmerDetail, HCDARegistry, KBArticleDetail, **KEPHISQuarantine** (includes risk intel tab), KnowledgeBase, OutbreakMonitoring, ScoutingReports, SymptomCodebook, Exporter
- Shared: `CaseTableEnhanced`, `KPICards`, `Layout`, `Sidebar`, `TopBar`

## Intentionally **not** replaced (your project-specific work)

- **`Dashboard.tsx`** — still uses **`fetchDashboard`** / placeholder API (bundle used static data).
- **`KenyaHeatMap.tsx`** — kept your runtime geo + mobile pointer behaviour.
- **`SidebarContext.tsx`** — kept auto-collapse on small screens.
- **`KenyaFarmerRegionalMap.tsx`** — still loads **`/geo/KEN_adm2.json`**.

## Farmers page merge

- Kept **`fetchFarmersList`** / placeholder API.
- Added **View** + **Link exporter** actions and **`LinkExporterModal`**.
- Extended **`FarmerListRow`** with optional **`linkedExporter`**; sample links in `placeholderData/farmersListData.ts`.

## Routes

- Added **`/login`** → redirect to **`/dashboard`**
- Added **`/dashboard`** (same lazy Dashboard as `/`)
- Added **`*`** → redirect to **`/dashboard`** (matches bundle behaviour)
