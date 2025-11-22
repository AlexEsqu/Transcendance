FROM node:22

WORKDIR /app

# Install dependencies separately for better build caching
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Create a folder for the SQLite database file
RUN mkdir -p /app/data
RUN mkdir -p /tmp/certs

RUN openssl req -nodes -x509 -newkey rsa:4096 -days 365 -keyout /tmp/certs/server.key -out  /tmp/certs/server.crt -subj "/C=FR/ST=Ile de France/L=Paris/O=42Paris/OU=Education/CN=lasablon.42.fr/emailAddress=lasablon@student.42.fr"

ENV ADDRESS=0.0.0.0
ENV PORT=8443
ENV SQLITE_PATH=/app/data/database.db

ENTRYPOINT ["npm", "run"]
