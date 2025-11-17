FROM debian:bookworm

RUN	apt update

# Set up a working directory to avoid a "idealTree" error
WORKDIR /usr/app


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

# place a configuration file
COPY conf/webpack.config.js ./

# dowload necessary plugins
RUN	npm install --save-dev html-webpack-plugin
RUN	npm install --save-dev webpack-dev-server



# COPYING CODE FILES

COPY ./code /usr/app



# BUNDLING TO RUN LOCALLY

#






# build JS project using the JS package manager
RUN npm run build

CMD ["npm run start"]
