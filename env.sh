#!/bin/sh

# Inject Docker environment variables into the static React build
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:5000}",
  VITE_JANUS_WS_URL: "${VITE_JANUS_WS_URL:-ws://localhost:8188}",
  VITE_NODE_SERVER_URL: "${VITE_NODE_SERVER_URL:-http://localhost:3000}",
  VITE_MINIO_URL: "${VITE_MINIO_URL:-http://localhost:9000}"
};
EOF

echo "Environment configuration generated for React:"
cat /usr/share/nginx/html/env-config.js

# Execute the main container command (e.g. nginx -g "daemon off;")
exec "$@"
