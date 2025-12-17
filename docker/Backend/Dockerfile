FROM node:18

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000

ENV ADDRESS=0.0.0.0
ENV PORT=3000

CMD ["npm", "start"]
