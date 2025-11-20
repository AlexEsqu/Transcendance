FROM node:22

WORKDIR /app

# Install dependencies separately for better build caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of your application
COPY . .

# Create a folder for the SQLite database file
RUN mkdir -p /app/data

ENV ADDRESS=0.0.0.0
ENV PORT=3000
ENV SQLITE_PATH=/app/data/database.db

ENTRYPOINT ["npm", "run"]
