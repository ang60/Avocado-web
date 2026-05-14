# Avocado-web

This workspace contains **two independent applications** that talk over HTTP:

| Part | Stack | Role |
|------|--------|------|
| **Backend** | Django (`backend/`) | REST API, auth, SMS, admin |
| **Frontend** | Vite + React (`frontend/`) | SPA; no server-side business logic |

They can be developed side by side in one clone, or split into two repositories and deployed to different hosts.

## Run locally (monorepo)

1. **API** — from `backend/`:

   ```bash
   cd backend
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

3. **Environment** — Django loads, in order: optional monorepo-root `.env` only when `../frontend` exists, then `backend/.env` (overrides), then the process cwd. Put API secrets in `backend/.env` when the API is deployed alone.

## Deploy separately

- **Backend**: WSGI/ASGI app `avo_guard.wsgi:application`, `collectstatic`, database URL, `SECRET_KEY`, `DEBUG=0`, `ALLOWED_HOSTS`, and **`CORS_ALLOWED_ORIGINS`** listing every browser origin that will call the API (comma-separated). With `DEBUG` off, CORS is locked down; missing origins cause blocked browser requests.
- **Frontend**: Build static assets (`npm run build`) and serve from any static host or CDN. Set **`VITE_API_BASE_URL`** at build time to the public API base URL (no trailing slash).

No build-time coupling: the SPA only needs the API URL and valid cookies/CORS for session auth.

## Split into two Git repositories (optional)

If you want physically separate repos:

1. Create a new empty remote for the API (e.g. `Avocado-api`).
2. Use history-preserving extraction, for example:

   ```bash
   git subtree split -P backend -b split-backend
   git push split-backend-url split-backend:main
   ```

   Or `git filter-repo --path backend --path-rename backend:` for a root-level layout in the new repo (adjust paths and fix CI as needed).

3. Repeat for `frontend/` into a second remote.

After a split, copy any shared conventions (env var names, API paths) from this README into each repo’s own README.

More detail: `backend/README.md` and `frontend/README.md`.
