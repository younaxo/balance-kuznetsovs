import "dotenv/config";

// Тестовое окружение: если DATABASE_URL/SESSION_SECRET не заданы явно
// через .env, подставляем безопасные значения по умолчанию для CI —
// интеграционные тесты, которым реально нужна БД, дополнительно
// проверяют доступность DATABASE_URL_TEST в своём describe/beforeAll.
// NODE_ENV уже выставлен в "test" самим Vitest — переопределять не нужно.
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET ?? "test-session-secret-please-override-me-1234567890";
process.env.ANALYTICS_IP_HASH_SALT = process.env.ANALYTICS_IP_HASH_SALT ?? "test-salt";
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5433/balance_kuznetsovs_test";

// Тесты не должны зависеть от сети/Cloudflare: verifyTurnstile() коротко
// замыкается на `true`, только если TURNSTILE_SECRET_KEY не задан. Если
// разработчик прописал в своём .env реальные (или тестовые) ключи
// Cloudflare для ручной проверки формы в браузере — юнит/интеграционные
// тесты всё равно должны оставаться детерминированными и офлайн.
delete process.env.TURNSTILE_SECRET_KEY;

// То же самое для Telegram/SMTP: разработчик может держать в .env реальные
// боевые данные для ручной проверки уведомлений — тесты "провайдер
// неактивен без настроек" должны оставаться истинными независимо от
// того, что лежит в локальном .env.
delete process.env.TELEGRAM_BOT_TOKEN;
delete process.env.TELEGRAM_CHAT_ID;
delete process.env.SMTP_HOST;
delete process.env.SMTP_USER;
delete process.env.SMTP_PASS;
