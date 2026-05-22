#!/usr/bin/env bash
# Build the AvoGuard SPA for https://avoguard.cognitron.co.ke and optionally reload Apache.
#
# On the Cognitron server (DocumentRoot = frontend/dist):
#   cd /var/www/Avocado-web/frontend
#   ./scripts/deploy-cognitron.sh --reload-apache
#
# From your laptop (build only; copy dist to the server yourself):
#   ./scripts/deploy-cognitron.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RELOAD_APACHE=false
for arg in "$@"; do
  case "$arg" in
    --reload-apache) RELOAD_APACHE=true ;;
    -h|--help)
      echo "Usage: $0 [--reload-apache]"
      echo "  Builds frontend/dist with VITE_API_BASE_URL=https://avoguard.cognitron.co.ke"
      echo "  Ensure Apache ProxyPass /api is enabled (deploy/apache-avoguard-api-proxy.conf)."
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ -f .env.local ]]; then
  echo "Warning: .env.local is present; it can affect vite build. Remove or rename it for production builds." >&2
fi

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://avoguard.cognitron.co.ke}"
echo "Building for ${VITE_API_BASE_URL} → ${ROOT}/dist"

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

npm run build

echo "Done. Static files: ${ROOT}/dist"
echo "Apache DocumentRoot should point here (see deploy/apache-avoguard.cognitron.conf)."

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
