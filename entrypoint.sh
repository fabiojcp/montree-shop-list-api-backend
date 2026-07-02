#!/bin/sh
set -e

cat <<EOF > /app/.env
TZ=${TZ:-UTC}
PORT=${PORT:-3333}
HOST=${HOST:-0.0.0.0}
NODE_ENV=${NODE_ENV:-production}
LOG_LEVEL=${LOG_LEVEL:-info}
APP_KEY=${APP_KEY}
APP_URL=${APP_URL}
GITHUB_API_URL=${GITHUB_API_URL:-https://api.github.com/users}
LIMITER_STORE=${LIMITER_STORE:-database}
EOF

echo "Generated .env file"
echo "=== .env ==="
cat /app/.env
echo "============"

node build/ace.js migration:run --force
node build/bin/server.js
