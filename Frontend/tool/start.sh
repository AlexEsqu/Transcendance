#!/bin/bash

# super useful debug flag
set -e

# move to correct directory (not necessary if WORKDIR set)
cd /app

# build JS project using the JS package manager
npm run build

# # replacing main process with npm run start
# exec npm run start

# for developpment: live reload
npx webpack serve --config webpack.config.js --mode development --host 0.0.0.0 --port 8080 --hot
