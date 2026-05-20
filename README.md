# Avocado-web

This workspace contains **three applications** that share one Django API:

| Part | Folder | Stack | Role |
|------|--------|--------|------|
| **API** | `avo_guard_backend/` | Django | REST API, auth, SMS, mobile sync, admin |
| **Dashboard** | `frontend/` | Vite + React | SPA for agronomists, admin, compliance, etc. |
| **Mobile app** | `Avocado-Pest-and-Disease-Scouting-Alerting-and-Advisory-Tool/` | Android | Farmer scouting, farms, blocks, alerts |

The dashboard and mobile app are HTTP clients only. Point both at the same API base URL.

## Run locally (monorepo)

1. **API** — from `avo_guard_backend/`:

   ```bash
   cd avo_guard_backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

2. **SPA** — from `frontend/`:

   ```bash
   cd frontend
   npm install
   VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
   ```

   The client uses `VITE_API_BASE_URL` (see `frontend/src/app/api/client.ts`). Defaults to `http://localhost:8000` if unset.

3. **Android app** — set `BASE_URL` in `Avocado-Pest-and-Disease-Scouting-Alerting-and-Advisory-Tool/app/src/main/java/com/avocado/android/utils/Constants.java` to the same host (e.g. `http://10.0.2.2:8000` on emulator, or `http://<LAN-IP>:8000` on a device), rebuild, and install.

4. **Environment** — Django loads, in order: optional monorepo-root `.env` when `../frontend` exists, then `avo_guard_backend/.env` (overrides), then the process cwd. Put API secrets in `avo_guard_backend/.env` when the API runs alone.

## Deploy separately

- **API**: WSGI/ASGI app `avo_guard.wsgi:application`, `collectstatic`, database URL, `SECRET_KEY`, `DEBUG=0`, `ALLOWED_HOSTS`, and **`CORS_ALLOWED_ORIGINS`** listing every browser origin that will call the API (comma-separated). With `DEBUG` off, CORS is locked down; missing origins cause blocked browser requests.
- **Frontend**: Build static assets (`npm run build`) and serve from any static host or CDN. Set **`VITE_API_BASE_URL`** at build time to the public API base URL (no trailing slash).
- **Mobile**: Set `Constants.BASE_URL` to that same public API URL (not the SPA host unless the API is served there).

No build-time coupling between clients: they only need the API URL and valid auth.

## Split into two Git repositories (optional)

If you want physically separate repos:

1. Create a new empty remote for the API (e.g. `Avocado-api`).
2. Use history-preserving extraction, for example:

   ```bash
   git subtree split -P avo_guard_backend -b split-api
   git push split-api-url split-api:main
   ```

   Or `git filter-repo --path avo_guard_backend --path-rename avo_guard_backend:` for a root-level layout in the new repo (adjust paths and fix CI as needed).

3. Repeat for `frontend/` (and optionally the Android project) into other remotes.

After a split, copy any shared conventions (env var names, API paths) from this README into each repo’s own README.

More detail: `avo_guard_backend/README.md` and `frontend/README.md`.
