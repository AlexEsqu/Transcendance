FROM node:22

WORKDIR /app

COPY package.json  package-lock.json* ./
# COPY tsconfig.json   ./tsconfig.json

# Install dependencies
RUN npm install

COPY src/ ./src/

# Compile TypeScript
# RUN npm run build

EXPOSE 4001

ENV PORT=4001
ENV ADDRESS=0.0.0.0

CMD ["npm", "start"]