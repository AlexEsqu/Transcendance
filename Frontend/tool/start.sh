#!/bin/bash

# super useful debug flag
set -e

# move to correct directory (not necessary if WORKDIR set)
cd /app

# install or check all JS packages are correctly installed
npm install

# build JS project using the JS package manager
npm run build

# # replacing main process with npm run start
# npm run start

# for developpment: live reload
npm run dev
