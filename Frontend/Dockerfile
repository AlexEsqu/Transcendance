# FROM debian:bookworm
FROM node:22

RUN	apt update

# Set up a working directory to avoid a "idealTree" error
WORKDIR /app

COPY ./package.json ./package.json
COPY ./src/ ./src/
COPY ./tsconfig.json ./tsconfig.json
COPY ./vite.config.js ./vite.config.js

# install Javascript package manager, with -y flag to skip the questionnaire
# uses the package.json file in the volume to install required package
# RUN apt install npm -y
RUN npm install

# full install without a package.json (obsolete since we now have one !)

# INSTALLING JAVASCRIPT AND BABYLON.JS

# # install Node.js, Javascript default runtime environment
# RUN apt install nodejs

# # install tsc, Typescript interpreter
# RUN npm install -g typescript

# # # initialize Javascript package manager, with -y flag to skip the questionnaire
# # RUN	npm init -y

# # install Babylon.js for game visuals
# RUN	npm install --save-dev @babylonjs/core
# RUN	npm install --save-dev @babylonjs/inspector

# # initialize a Typescript project, creating a default tsconfig.json
# RUN tsc --init

# # replace config with custom config stored in conf
# COPY conf/tsconfig.json ./tsconfig.json

# INSTALLING WEBPACK

# # install webpack
# RUN npm install --save-dev typescript webpack ts-loader webpack-cli

# # place a configuration file
# COPY conf/webpack.config.js ./webpack.config.js

# # dowload necessary plugins
# RUN	npm install --save-dev html-webpack-plugin
# RUN	npm install --save-dev webpack-dev-server



# copy and chmod script to be executed at runtime
COPY ./tool/start.sh /usr/bin/start.sh
RUN chmod 777 /usr/bin/start.sh

EXPOSE 8080

# access at localhost:8080
CMD ["start.sh"]
