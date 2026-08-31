import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Запуск миграций: `npm run db:migrate`.
 * Использует отдельное короткоживущее подключение (max: 1), как
 * рекомендует drizzle-orm для миграционных скриптов.
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL не задан в окружении.");
  }

  const migrationClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  console.log("Применяю миграции...");
  await migrate(db, { migrationsFolder: "./src/server/db/migrations" });
  console.log("Миграции успешно применены.");

  await migrationClient.end();
}

main().catch((error) => {
  console.error("Ошибка применения миграций:", error);
  process.exit(1);
});
