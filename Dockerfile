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

ENV TZ=UTC
ENV PORT=3333
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV GITHUB_API_URL=https://api.github.com/users
ENV LIMITER_STORE=database

EXPOSE 3333

CMD sh -c ' \
  echo "TZ=$TZ" > /app/.env && \
  echo "PORT=$PORT" >> /app/.env && \
  echo "HOST=$HOST" >> /app/.env && \
  echo "NODE_ENV=$NODE_ENV" >> /app/.env && \
  echo "LOG_LEVEL=$LOG_LEVEL" >> /app/.env && \
  echo "APP_KEY=$APP_KEY" >> /app/.env && \
  echo "APP_URL=$APP_URL" >> /app/.env && \
  echo "GITHUB_API_URL=$GITHUB_API_URL" >> /app/.env && \
  echo "LIMITER_STORE=$LIMITER_STORE" >> /app/.env && \
  echo "--- .env ---" && cat /app/.env && echo "---" && \
  node build/ace.js migration:run --force && \
  node build/bin/server.js'
