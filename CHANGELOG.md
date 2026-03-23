# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CHANGELOG.md` — human-readable history of notable changes (update this file when you ship features or fixes).
- `.gitattributes` — consistent line endings for cross-platform collaboration.

### Changed

- **Mobile / responsive**
  - **HCDA Registry** — single-column layout on small screens; filters above table; improved horizontal table scroll; search/export stack on narrow viewports.
  - **Scouting Reports** — filter chips wrap; stacked submission cards below `lg`; desktop table row preserved from `lg`; mobile “select all” bar when column headers are hidden.
  - **Alerts** — single-column summary metrics on phones; horizontally scrollable filter tabs; stacked alert headers/footers; geo-cluster and farmer avatars adapt on small screens.
  - **Knowledge Base** — articles shown first on mobile; category pills in a horizontal scroll row; USSD lookup in a collapsible `<details>` on small screens; desktop keeps sticky sidebar; search + category filtering wired; article cards stack cleanly with full summary text.
- **Navigation / shell**
  - Breadcrumb labels for routes such as `/hcda-registry`, `/kephis-quarantine`, `/exporter` (via `TopBar` route map).
- **Authentication UI**
  - Added a dedicated `/login` page styled to match the provided mockup.
  - Added frontend auth guard routing: unauthenticated users are redirected to `/login`; authenticated users are redirected to `/dashboard`.
  - Added `src/app/auth.ts` with a frontend-only JWT-like token utility for current UI flow.
- **Shared UI**
  - `TableScroll` wrapper for wide tables on small screens (used where horizontal scroll is required).

### Notes for contributors

- After meaningful UI or behavior changes, add a bullet under `[Unreleased]` (or under a new dated version when you release).
- Run `pnpm run build` before committing when you touch app code.
