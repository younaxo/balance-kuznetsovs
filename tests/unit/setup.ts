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
