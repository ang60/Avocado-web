# AvoGuard API (Django)

Standalone REST backend for the AvoGuard dashboard. The React app in `../frontend` (or another host) is only a client.

## Setup

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # if present; otherwise create .env from team docs
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Configuration highlights

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | Django secret |
| `DEBUG` | `0` in production |
| `ALLOWED_HOSTS` | Comma-separated hostnames |
| `DATABASE_URL` | Production DB (see `dj_database_url` in settings) |
| `CORS_ALLOWED_ORIGINS` | Required when `DEBUG` is off: comma-separated SPA origins (e.g. `https://app.example.com`) |

`.env` in this directory overrides a monorepo-root `.env` only when this tree sits next to a `frontend/` folder (see `avo_guard/settings.py`).

## After extracting this folder to its own repo

- Keep `manage.py` and `avo_guard/` at the project root of the new repo (or adjust `BASE_DIR` if you flatten paths).
- Ensure `CORS_ALLOWED_ORIGINS` matches wherever the SPA is hosted.
- No need for a sibling `frontend/` directory unless you still use a shared monorepo-root `.env`.
