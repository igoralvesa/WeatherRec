#!/bin/sh
set -e

# Get API URL from environment variable or use default
API_URL=${VITE_API_URL:-http://localhost:3000}

# Replace the API URL in env-config.js at runtime
cat > /usr/share/nginx/html/env-config.js << EOF
// This file is generated at runtime by Docker entrypoint
window.__ENV__ = {
  VITE_API_URL: '${API_URL}'
};
EOF

# Start nginx
exec nginx -g "daemon off;"

