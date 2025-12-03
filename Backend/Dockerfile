FROM node:22

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .


RUN mkdir -p /tmp/certs
RUN mkdir -p /app/data
RUN mkdir -p /uploads/avatars

RUN openssl req -nodes -x509 -newkey rsa:4096 -days 365 -keyout /tmp/certs/server.key -out  /tmp/certs/server.crt -subj "/C=FR/ST=Ile de France/L=Paris/O=42Paris/OU=Education/CN=lasablon.42.fr/emailAddress=lasablon@student.42.fr"

RUN node scripts/init-db.js

ENV ADDRESS=0.0.0.0
ENV PORT=8443
ENV SQLITE_PATH=/app/data/database.db
ENTRYPOINT ["npm", "run"]
