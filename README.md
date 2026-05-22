# Avocado-web

This workspace contains **three applications** that share one Django API:

| Part | Folder | Stack | Role |
|------|--------|--------|------|
| **API** | `avo_guard_backend/` | Django | REST API, auth, SMS, mobile sync, admin |
| **Dashboard** | `frontend/` | Vite + React | SPA for agronomists, admin, compliance, etc. |
| **Mobile app** | `Avocado-Pest-and-Disease-Scouting-Alerting-and-Advisory-Tool/` | Android | Farmer scouting, farms, blocks, alerts |

The dashboard and mobile app are HTTP clients only. Point both at the same API base URL.

The legacy Django tree was merged into `avo_guard_backend/` and moved to `backend.archived/` (do not run it on port 8000).

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
   npm run dev
   ```

   The client uses `VITE_API_BASE_URL` (see `frontend/src/app/api/client.ts`). **Production API:** `https://avo-guard.vercel.app` (set in `frontend/.env.production`). Do not point the SPA at `https://avoguard.cognitron.co.ke` unless `/api` is proxied to Django — otherwise login POST returns *Method POST not allowed*. For local Django, copy `frontend/.env.local.example` to `frontend/.env.local` (remove that file before `npm run build`).

3. **Android app** — production `BASE_URL` is `https://avo-guard.vercel.app` in `Constants.java`. For local testing, point it at the same host as `VITE_API_BASE_URL` (e.g. `http://10.0.2.2:8000` on emulator).

4. **Environment** — Django loads, in order: optional monorepo-root `.env` when `../frontend` exists, then `avo_guard_backend/.env` (overrides), then the process cwd. Put API secrets in `avo_guard_backend/.env` when the API runs alone.

## Production dashboard (cognitron)

**Canonical UI:** `https://avoguard.cognitron.co.ke` — Apache serves `frontend/dist`. The API stays on **`https://avo-guard.vercel.app`**; Apache proxies `/api` on cognitron to Vercel (see `frontend/deploy/apache-avoguard-api-proxy.conf`).

**One-time on the Cognitron server:**

```bash
sudo a2enmod headers proxy proxy_http ssl
sudo cp /var/www/Avocado-web/frontend/deploy/apache-avoguard-api-proxy.conf /etc/apache2/conf-available/avoguard-api-proxy.conf
sudo a2enconf avoguard-api-proxy
sudo apache2ctl configtest && sudo systemctl reload apache2
chmod +x /var/www/Avocado-web/frontend/scripts/deploy-cognitron.sh
```

**After every frontend change:**

```bash
cd /var/www/Avocado-web
git pull
cd frontend
./scripts/deploy-cognitron.sh --reload-apache
```

Or from your machine: `cd frontend && npm run build:cognitron`, then copy `dist/` to the server. Optional CI: GitHub Actions workflow `.github/workflows/deploy-cognitron.yml` (set `COGNITRON_*` secrets).

If the API is called **directly** from the browser at `avo-guard.vercel.app` (no Apache proxy), build with `npm run build:vercel-api` and add `https://avoguard.cognitron.co.ke` to Django **`CORS_ALLOWED_ORIGINS`** on Vercel.

`avo-guard-frontend.vercel.app` is a separate Vercel SPA deploy; pushing to Git does **not** update cognitron unless you run the steps above or enable the workflow.

## Deploy separately

- **API**: WSGI on Vercel (`https://avo-guard.vercel.app`) or self-hosted. Set `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (include cognitron if not using `/api` proxy).
- **Frontend (cognitron)**: `npm run build:cognitron` → `frontend/dist` + Apache proxy for `/api`.
- **Mobile**: `Constants.BASE_URL` = `https://avo-guard.vercel.app` (API host, not the SPA URL).

No build-time coupling between clients beyond the API base URL and auth.

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
