#!/bin/bash

# super useful debug flag
set -e

# build JS project using the JS package manager
npm run build

# replacing main process with npm run start
exec npm run start
