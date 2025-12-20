FROM node:22

WORKDIR /app

COPY package*.json  tsconfig.json ./

# 
RUN npm ci

COPY ./src/ ./src/
