# syntax=docker/dockerfile:1
#
# Простой, немного менее "оптимальный по мегабайтам", но понятный и
# легко поддерживаемый образ (без standalone-трассировки зависимостей
# Next.js) — сознательный выбор в пользу простоты для этого проекта.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Значения ниже нужны ТОЛЬКО чтобы прошла build-time валидация окружения
# (см. src/lib/env.server.ts) — реальный конфиг задаётся при запуске
# контейнера переменными окружения, а не этими build-time плейсхолдерами.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV SESSION_SECRET="build-time-placeholder-not-used-in-runtime-00000000"
# NEXT_PUBLIC_* — другое дело: Next.js вклеивает их в клиентский бандл
# ПРЯМО ВО ВРЕМЯ `next build`, а не читает при старте контейнера — поэтому
# их нельзя просто положить в .env и передать через env_file в
# docker-compose (это работает только для серверных переменных). Нужно
# передать их как build args (см. docker-compose.example.yml).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src/server/db/migrations ./src/server/db/migrations
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Web-контейнер stateless: миграции/сидирование запускаются отдельной
# командой (см. docker-compose.example.yml: сервис migrate), не
# автоматически при старте web-контейнера.
CMD ["npm", "run", "start"]
