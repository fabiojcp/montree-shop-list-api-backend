FROM node:24-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN node ace build

RUN npm ci --omit=dev

FROM node:24-alpine AS runtime

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/tmp

EXPOSE 3333

CMD sh -c "node build/ace.js migration:run --force && node build/bin/server.js"
