#!/usr/bin/env bash
# Build the AvoGuard SPA for https://avoguard.cognitron.co.ke and optionally reload Apache.
#
# On the Cognitron server (DocumentRoot = frontend/dist):
#   cd /var/www/Avocado-web && git pull
#   cd frontend && ./scripts/deploy-cognitron.sh --reload-apache
#
# After deploy, sidebar should show "Version 2.1.5 · <git-sha>" (not "2.1.4").

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RELOAD_APACHE=false
for arg in "$@"; do
  case "$arg" in
    --reload-apache) RELOAD_APACHE=true ;;
    -h|--help)
      echo "Usage: $0 [--reload-apache]"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

RESTORE_ENV_LOCAL=""
if [[ -f .env.local ]]; then
  RESTORE_ENV_LOCAL=1
  mv .env.local .env.local.off-deploy
  echo "Renamed .env.local → .env.local.off-deploy for this build (dev proxy must not affect production bundle)."
fi
cleanup() {
  if [[ -n "$RESTORE_ENV_LOCAL" && -f .env.local.off-deploy ]]; then
    mv .env.local.off-deploy .env.local
  fi
}
trap cleanup EXIT

REPO_ROOT="$(cd "$ROOT/.." && pwd)"
if command -v git >/dev/null 2>&1 && git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  export VITE_BUILD_LABEL="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
else
  export VITE_BUILD_LABEL="$(date -u +%Y%m%d)"
fi

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://avoguard.cognitron.co.ke}"
echo "Building cognitron bundle: API=${VITE_API_BASE_URL} label=${VITE_BUILD_LABEL}"

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

npm run build:cognitron

if ! grep -rq 'isReviewStatusNew' dist/assets/*.js 2>/dev/null; then
  echo "ERROR: dist does not contain scouting review fix (isReviewStatusNew). Build failed validation." >&2
  exit 1
fi

echo "OK: dist validated (scouting review fix present)."
echo "Files: ${ROOT}/dist"
echo "On cognitron, sidebar must show: Version 2.1.5 · ${VITE_BUILD_LABEL}"
echo "If the site still shows 2.1.4, Apache is serving an old dist or DocumentRoot is wrong."

if [[ "$RELOAD_APACHE" == true ]]; then
  if command -v apache2ctl >/dev/null 2>&1; then
    sudo apache2ctl configtest
    sudo systemctl reload apache2
    echo "Apache reloaded."
  else
    echo "apache2ctl not found; reload the web server manually." >&2
    exit 1
  fi
fi
