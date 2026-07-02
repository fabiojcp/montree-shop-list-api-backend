FROM node:24-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN node ace build

RUN mkdir -p /app/tmp

EXPOSE 3333

CMD sh -c "node build/ace.js migration:run --force && node build/bin/server.js"
