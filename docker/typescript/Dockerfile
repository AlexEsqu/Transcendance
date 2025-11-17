FROM debian:bookworm


# SET UP

RUN	apt update

# Set up a working directory to avoid a "idealTree" error
WORKDIR /usr/app

# Set up the required directory architecture
RUN mkdir dist public src

# copy in the actual code
COPY ./src/app.ts src/app.ts

# copy in an index html file
COPY ./public/index.html public/index.html


# INSTALLING JAVASCRIPT AND BABYLON.JS

# install Javascript package manager, with -y flag to skip the questionnaire
RUN apt install npm -y

# install Node.js, Javascript default runtime environment
RUN apt install nodejs

# install tsc, Typescript interpreter
RUN npm install -g typescript

# initialize Javascript package manager, with -y flag to skip the questionnaire
RUN	npm init -y

# install Babylon.js for game visuals
RUN	npm install --save-dev @babylonjs/core
RUN	npm install --save-dev @babylonjs/inspector

# initialize a Typescript project, creating a default tsconfig.json
RUN tsc --init

# replace config with custom config stored in conf
COPY conf/tsconfig.json ./tsconfig.json


# INSTALLING WEBPACK

# install webpack
RUN npm install --save-dev typescript webpack ts-loader webpack-cli

# place a configuration file
COPY conf/webpack.config.js ./webpack.config.js

# dowload necessary plugins
RUN	npm install --save-dev html-webpack-plugin
RUN	npm install --save-dev webpack-dev-server


# BUNDLING TO RUN LOCALLY

COPY ./conf/package.json ./package.json


# RUN NPM TO ACCESS ONLINE

# copy script to be executed at runtime
COPY ./tool/start.sh /usr/app/start.sh
RUN chmod 777 start.sh

EXPOSE 8080

# access at localhost:8080
CMD ["./start.sh"]
