FROM node:22

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN mkdir -p /tmp/certs
RUN mkdir -p /app/data
RUN mkdir -p /uploads/avatars

ENV ADDRESS=0.0.0.0
ENV PORT=3000
ENV SQLITE_PATH=/app/data/database.db
ENV AVATARS_UPLOAD_PATH=/app/uploads/avatars

ENV FT_OAUTH_URL=https://api.intra.42.fr/oauth/authorize
ENV ACCESS_TOKEN_LIFETIME_IN_MINUTES=10
RUN chmod +x scripts/entrypoint.sh
ENTRYPOINT ["./scripts/entrypoint.sh"]
