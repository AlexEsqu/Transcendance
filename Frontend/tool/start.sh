#!/bin/bash

# super useful debug flag
set -e

# move to correct directory (not necessary if WORKDIR set)
cd /app

# install dependencies if not present (since .gitignore the heavy node-modules)
if [ ! -d node_modules ]; then
  npm install
fi

# build JS project using the JS package manager
npm run build

# replacing main process with npm run start
exec npm run dev
