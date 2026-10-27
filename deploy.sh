#!/usr/bin/env bash
# Run on the VPS: pulls the latest code from GitHub, rebuilds and restarts the site.
set -euo pipefail
cd /var/www/fuelwell
git fetch origin main
git reset --hard origin/main
npm ci --no-audit --no-fund
npm run build
pm2 restart fuelwell --update-env
echo "Deployed $(git rev-parse --short HEAD) at $(date)"
