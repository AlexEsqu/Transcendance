#!/bin/sh
set -e

echo "Running DB initialization..."
node scripts/init-db.js

echo "Starting app with command: $@"
exec "$@"
