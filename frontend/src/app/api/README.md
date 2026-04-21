# Placeholder API

Simulates backend calls with a short delay so the UI behaves like production.

| Function | Used by |
|----------|---------|
| `fetchDashboard()` | Dashboard |
| `fetchScoutingFeed()` | Scouting Reports |
| `fetchNavbarUser()` | TopBar |
| `fetchNotifications()` | TopBar |
| `searchGlobal(query)` | TopBar search |
| `fetchCaseManagement()` | Case Management |
| `fetchOutbreakMonitoring()` | Outbreak Monitoring |
| `fetchAlerts()` | Alerts |
| `fetchSymptomCodebook()` | Symptom Codebook |
| `fetchFarmersList()` | Farmers registry |
| `fetchComplianceFarmers()` | Compliance Hub (phytosanitary table) |
| `fetchKnowledgeBaseList()` | Knowledge Base (articles + categories) |
| `fetchAdmin()` | Admin |
| `fetchFarmerDetail(farmerId)` | Farmer detail |
| `fetchCaseDetail(caseId)` | Case detail |
| `fetchKBArticle(articleId)` | KB article detail body |
| `generateComplianceReport(params)` | Compliance Hub — builds payload + triggers download client-side |

**App modules (pages):** KEPHIS Quarantine (`/kephis-quarantine`), HCDA Registry (`/hcda-registry`), Exporter Consignment Hub (`/exporter`) — see `HCDA_REGISTRY_GUIDE.md`, `KEPHIS_QUARANTINE_GUIDE.md`, `REGULATORY_DASHBOARDS_SUMMARY.md`.

**Data lives in** `placeholderData/` — edit those files to change mock responses.

**Later:** replace `placeholderApi.ts` with real `fetch(baseUrl + '/api/...')` (keep the same function names and types in `types.ts`).

**Env (optional):** `VITE_PLACEHOLDER_API_DELAY_MS` — default ~380ms.
