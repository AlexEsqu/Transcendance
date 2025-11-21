# FROM debian:bookworm
FROM node:22

RUN	apt update

# Set up a working directory to avoid a "idealTree" error
WORKDIR /app

COPY ./package.json ./package.json
COPY ./src/ ./src/
COPY ./tsconfig.json ./tsconfig.json

RUN npm install

# copy and chmod script to be executed at runtime
COPY ./tool/start.sh /usr/bin/start.sh
RUN chmod 777 /usr/bin/start.sh

EXPOSE 8080

# set the basis on which the Dockercompose command will be run
ENTRYPOINT ["npm", "run"]
