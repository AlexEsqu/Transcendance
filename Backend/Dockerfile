FROM node:22

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN mkdir -p /tmp/certs
RUN mkdir -p /app/data
RUN mkdir -p /uploads/avatars

RUN if [ ! -f /tmp/certs/server.key ] || [ ! -f /tmp/certs/server.crt ]; then \
        echo "Generating SSL certificates..."; \
        openssl req -nodes -x509 -newkey rsa:4096 -days 365 \
        -keyout /tmp/certs/server.key \
        -out /tmp/certs/server.crt \
        -subj "/C=FR/ST=Ile de France/L=Paris/O=42Paris/OU=Education/CN=lasablon.42.fr/emailAddress=lasablon@student.42.fr"; \
    else \
        echo "Certificates already exist, skipping."; \
    fi

ENV ADDRESS=0.0.0.0
ENV PORT=8443
ENV SQLITE_PATH=/app/data/database.db
ENV AVATARS_UPLOAD_PATH=/app/uploads/avatars/
ENV DOMAIN_NAME=https://localhost:8443/

RUN chmod +x scripts/entrypoint.sh
ENTRYPOINT ["./scripts/entrypoint.sh"]
