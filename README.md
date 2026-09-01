# БАЛАНС КУЗНЕЦОВЫ

Сайт юридической компании «Баланс Кузнецовы»: юридические документы,
защита персональных данных (152-ФЗ), регистрация товарных знаков,
договоры под ключ, взыскание задолженности. Публичный сайт + панель
управления заявками/контентом/аналитикой.

Архитектурные решения и почему выбран именно такой стек — в
[DECISIONS.md](./DECISIONS.md).

## Стек

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4** — CSS-first конфигурация, кастомная дизайн-система
- **PostgreSQL** + **Drizzle ORM** (миграции, типобезопасные запросы)
- **Zod** — серверная валидация всех входных данных
- **Radix UI** — доступные примитивы (Dialog, Label)
- **Motion** — scroll-reveal и микроанимации с уважением `prefers-reduced-motion`
- **Argon2id** (`@node-rs/argon2`) — хеширование паролей администратора
- **Vitest** — unit/интеграционные тесты, **Playwright** — E2E
- **nodemailer** — SMTP-уведомления, **Telegram Bot API** — уведомления в Telegram

## Структура проекта

```
src/
  app/
    (public)/         публичные страницы (используют SiteHeader/Footer)
    admin/
      (protected)/    защищённая часть админки (guard + AdminShell)
      login/          страница входа (вне guard)
    api/              Route Handlers (заявки, квиз, аналитика, consent)
    go/[slug]/        безопасный трекнутый редирект (allowlist)
  components/
    ui/               низкоуровневые примитивы (Button, Input, Dialog...)
    layout/            header, footer, мобильное меню
    sections/          секции публичных страниц
    forms/, quiz/      форма заявки, квиз "рассчитать стоимость"
    analytics/         TrackedLink/TrackedButton/AnalyticsProvider
    admin/             компоненты панели управления
  domain/              доменные константы (услуги, задачи, процесс — тексты из ТЗ)
  server/
    db/                схема Drizzle, клиент, миграции
    auth/              пароли, сессии, логин
    applications/       репозиторий + сервис заявок
    notifications/      Telegram/Email провайдеры
    analytics/          события, атрибуция, отчётность
    security/           rate limiting, redirect allowlist, IP-хеширование
    validation/          Zod-схемы
  lib/                 env-конфигурация (server/client раздельно), утилиты
scripts/
  seed-admin.ts        безопасный bootstrap администратора и базового контента
e2e/                   Playwright-тесты
tests/unit/            Vitest unit + интеграционные тесты
```

## Требования

- Node.js 22+
- PostgreSQL 16+ (локально или через Docker)
- npm

## Локальный запуск

```bash
npm install
cp .env.example .env
# заполните .env — см. раздел "Переменные окружения" ниже

# поднять PostgreSQL (пример через Docker):
docker run -d --name bk-postgres \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=balance_kuznetsovs -p 5432:5432 postgres:16-alpine

npm run db:generate   # сгенерировать SQL-миграции из схемы (уже сгенерированы в репозитории)
npm run db:migrate    # применить миграции
npm run seed:admin    # создать первого администратора (см. ADMIN_EMAIL/ADMIN_INITIAL_PASSWORD)

npm run dev           # http://localhost:3000
```

Админка: `http://localhost:3000/admin/login`.

## Переменные окружения

Полный список — в [.env.example](./.env.example). Кратко:

| Группа | Переменные | Назначение |
| --- | --- | --- |
| БД | `DATABASE_URL` | строка подключения PostgreSQL |
| Сессии | `SESSION_SECRET` | случайная строка ≥32 символов |
| Bootstrap администратора | `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` | только для `npm run seed:admin`, потом можно удалить из `.env` |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | уведомления о заявках в Telegram |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `APPLICATION_EMAIL_TO` | уведомления о заявках на email |
| Turnstile | `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | антиспам-виджет Cloudflare (опционально) |
| Аналитика | `ANALYTICS_IP_HASH_SALT` | соль хеширования IP для rate limiting |
| Прочее | `NEXT_PUBLIC_SITE_URL` | публичный адрес сайта (canonical/OG) |

Каждая интеграция (Telegram/SMTP/Turnstile) **опциональна** —
если переменные не заданы, соответствующая функциональность просто не
активируется, приложение не падает.

## База данных и миграции

```bash
npm run db:generate   # сгенерировать миграцию после изменения src/server/db/schema.ts
npm run db:migrate    # применить миграции к DATABASE_URL
npm run db:studio     # drizzle-kit studio — визуальный просмотр БД
```

Домены таблиц: `admin_users`/`admin_sessions`/`login_attempts` (auth),
`applications` (заявки), `services`/`price_items`/`reviews`/
`contact_settings`/`content_blocks` (контент), `analytics_sessions`/
`analytics_events`/`tracked_destinations`/`attributions`/
`consent_records` (аналитика и атрибуция).

## Bootstrap администратора

```bash
npm run seed:admin
```

Скрипт идемпотентен: если пользователь с `ADMIN_EMAIL` уже существует —
ничего не создаётся повторно. Пароль хранится только как Argon2id-хеш.
После первого запуска `ADMIN_EMAIL`/`ADMIN_INITIAL_PASSWORD` можно убрать
из `.env` — они нигде не используются в рантайме приложения, только
этим скриптом. Смена пароля — в `/admin/settings` после входа.

## Telegram-уведомления

1. Создайте бота через [@BotFather](https://t.me/BotFather), получите токен.
2. Узнайте `chat_id` получателя (например, через `@userinfobot` или
   `getUpdates` Bot API).
3. Заполните `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` в `.env`.

Без этих переменных Telegram-уведомления просто не отправляются —
заявка всё равно сохраняется в БД.

## Email-уведомления (SMTP)

Заполните `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`/
`APPLICATION_EMAIL_TO` в `.env`. Поддерживается любой стандартный SMTP
(порт 465 — implicit TLS, остальные — STARTTLS).

## Cloudflare Turnstile

Задайте `TURNSTILE_SECRET_KEY` (сервер) и `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
(клиент), чтобы включить проверку формы заявки/квиза. Без ключей
серверная проверка (`verifyTurnstile`) автоматически считается
пройденной — форма продолжает работать в разработке без Turnstile.
Виджет на клиенте пока не отрисован (архитектура готова: заготовлено
поле `turnstileToken` в схемах и серверная проверка) — интеграция
клиентского виджета делается по мере получения реальных ключей.

## Архитектура аналитики

Единая точка входа с клиента — `trackEvent()` / `<TrackedLink>` /
`<TrackedButton>` (`src/lib/analytics/client.ts`,
`src/components/analytics/*`), компоненты не обращаются к
`/api/analytics/event` напрямую. Сервер решает, писать ли событие в БД,
на основании cookie согласия (`bk_consent`). UTM-атрибуция — first-touch
(на сессию, один раз) и last-touch (обновляется на каждый визит с
метками) в отдельных cookie, привязывается к заявке в момент отправки
формы (таблица `attributions`). Подробности — в
[DECISIONS.md](./DECISIONS.md#аналитика-собственная-first-party-система--яндексметрика).

## Отзывы и Avito

Реальный профиль:
`https://www.avito.ru/user/f4883dd8791ff0dc85758741fd609cfb/profile`.

Легальная проверка (обычный HTTP-запрос, без обхода защиты) показала,
что публичная страница профиля закрыта antibot-firewall (QRATOR) —
ответ `HTTP 429` со страницей CAPTCHA «Доступ ограничен: проблема с
IP». Согласно требованиям проекта, обходить CAPTCHA/antibot-защиту
запрещено — автоматический импорт отзывов с Avito **не реализован**.

Вместо этого — `ReviewProvider`-абстракция
(`src/server/reviews/providers/`):

- `AvitoReviewProvider` — честно возвращает пустой список с описанием
  причины (используется как задел на случай появления легального
  способа получить отзывы, например официального API);
- `ManualReviewProvider` — ручной ввод отзыва через `/admin/reviews`
  (автор, текст, оценка, источник, ссылка, дата) с указанием источника
  `avito`/`manual`.

Пока отзывов нет — публичный сайт показывает честный empty state, без
выдуманных отзывов.

## Логотип

Единственное место, ссылающееся на файл ассета —
`src/components/brand/logo.tsx`. Текущий файл: `public/brand/logo.jpg`
(1280×470, оригинал, предоставленный владельцем). Чтобы заменить лого
(например, на версию с прозрачным фоном), достаточно положить новый
файл по тому же пути с тем же именем — весь сайт (header, footer,
admin login) подхватит его автоматически, без правок кода.

## Тесты

```bash
npm test              # Vitest: unit + интеграционные (нужен DATABASE_URL_TEST)
npm run test:watch    # Vitest в watch-режиме
npm run test:e2e      # Playwright E2E (поднимает dev-сервер сам, см. playwright.config.ts)
```

Интеграционные тесты (`tests/unit/integration/`) используют реальную
тестовую БД PostgreSQL — по умолчанию `DATABASE_URL_TEST` из `.env`,
либо `DATABASE_URL`. Перед первым запуском примените к ней миграции:

```bash
DATABASE_URL="$DATABASE_URL_TEST" npm run db:migrate
```

Playwright-тесты покрывают: главную страницу, навигацию (десктоп и
мобильное меню), все публичные страницы, форму заявки (валидация,
honeypot, успешная отправка), квиз (полное прохождение, честный финальный
экран без выдуманной цены), tracked-редиректы (защита от open redirect),
переключение темы, cookie-consent, клавиатурную навигацию,
автоматические проверки доступности (axe-core), отсутствие
горизонтального скролла на 10 брейкпоинтах (320–1920px), вход/выход из
админки, защиту `/admin` без авторизации.

## Production-сборка

```bash
npm run build
npm run start
```

## Docker

```bash
cp .env.example .env   # заполнить реальными значениями
docker compose -f docker-compose.example.yml up -d db
docker compose -f docker-compose.example.yml run --rm migrate
docker compose -f docker-compose.example.yml run --rm seed
docker compose -f docker-compose.example.yml up -d web
```

Или соберите образ отдельно: `docker build -t balance-kuznetsovs .`
Web-контейнер stateless — PostgreSQL вынесен в отдельный persistent
сервис (см. `docker-compose.example.yml`).

## CI

`.github/workflows/ci.yml`: format check → lint → typecheck →
миграции на тестовую БД → unit/интеграционные тесты → production build
→ (отдельным job) Playwright E2E с реальным PostgreSQL-сервисом.
Секретов в workflow нет — используются тестовые значения, заданные
прямо в файле workflow.

## Безопасность

Коротко (подробности — в финальном отчёте разработки и в коде):

- пароли — Argon2id, сессии — opaque-токен + SHA-256-хеш в БД, HttpOnly/
  Secure(prod)/SameSite=Lax cookie;
- rate limiting на логин (БД, по IP+email) и на заявки/квиз/аналитику
  (in-memory sliding window);
- CSRF — проверка `Origin` на Route Handlers, Server Actions защищены
  Next.js "из коробки";
- редиректы `/go/:slug` — только allowlist из БД, никаких open redirect
  через query-параметры;
- security headers (CSP, X-Frame-Options, Referrer-Policy,
  Permissions-Policy, HSTS в production) — `next.config.ts`;
- никаких секретов в клиентском бандле (`env.server.ts`/`env.client.ts`
  разделены на уровне сборки через `server-only`);
- вся пользовательская валидация — Zod на сервере, независимо от
  клиентской.

## Логотип, референсы и development credit

Логотип и референсы дизайна лежат в корне репозитория и в `references/`
— используются как исходные материалы разработки, не как часть
production-кода. Дизайн: KODVEN STUDIO. Разработка: younaxo
(https://profi.ru/).
