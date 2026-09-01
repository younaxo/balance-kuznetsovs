import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import * as schema from "../src/server/db/schema";
import { SERVICES } from "../src/domain/services";

/**
 * Безопасный bootstrap первого администратора и базового контента.
 *
 * Запуск: `npm run seed:admin`.
 *
 * ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD читаются ТОЛЬКО этим скриптом —
 * в самом приложении их нет. Пароль сохраняется исключительно как
 * Argon2id-хеш, ничего в открытом виде в БД не попадает. Скрипт
 * идемпотентен: повторный запуск не создаст дубликатов и не перезапишет
 * то, что администратор уже отредактировал через панель.
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL не задан.");

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client, { schema });

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) {
      throw new Error("ADMIN_INITIAL_PASSWORD должен быть не короче 12 символов.");
    }

    const existing = await db
      .select({ id: schema.adminUsers.id })
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.email, adminEmail))
      .limit(1);

    if (existing.length === 0) {
      const passwordHash = await hash(adminPassword, {
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      await db.insert(schema.adminUsers).values({
        email: adminEmail,
        passwordHash,
        role: "owner",
      });
      console.log(`Создан администратор: ${adminEmail}`);
    } else {
      console.log(`Администратор ${adminEmail} уже существует — пропускаю.`);
    }
  } else {
    console.log("ADMIN_EMAIL/ADMIN_INITIAL_PASSWORD не заданы — администратор не создаётся.");
  }

  // Пустая строка настроек контактов (публичный сайт скрывает поля,
  // пока они не заполнены через /admin/contacts).
  await db
    .insert(schema.contactSettings)
    .values({ id: "default" })
    .onConflictDoNothing({ target: schema.contactSettings.id });

  // Ключи контентных блоков — сидируются пустыми и неопубликованными,
  // чтобы админка сразу показывала все ожидаемые разделы.
  const CONTENT_KEYS = [
    "why_us",
    "service_includes",
    "risks_without_documents",
    "guarantees",
    "company_stats",
    "faq",
    "cases",
  ];
  for (const key of CONTENT_KEYS) {
    await db
      .insert(schema.contentBlocks)
      .values({ key, isPublished: false })
      .onConflictDoNothing({ target: schema.contentBlocks.key });
  }

  // Пять базовых услуг из ТЗ — сидируются один раз дословным текстом.
  // Дальше редактируются из /admin/services; повторный запуск скрипта
  // их не перезаписывает (onConflictDoNothing по slug).
  for (const service of SERVICES) {
    await db
      .insert(schema.services)
      .values({
        slug: service.slug,
        order: service.order,
        title: service.title,
        summary: service.summary,
        ctaLabel: service.ctaLabel,
        illustration: service.illustration,
        isPublished: true,
      })
      .onConflictDoNothing({ target: schema.services.slug });
  }

  // Команда: имена предоставлены владельцем (2026-09-01), фото — нет.
  // По его решению карточка содержит только ФИО, без выдуманных
  // должностей/стажа. Сидируется один раз; дальше правится из /admin/team.
  const TEAM = ["Дмитрий Александрович Кузнецов", "София Максимовна Кузнецова-Морева"];
  for (const [index, fullName] of TEAM.entries()) {
    const existing = await db
      .select({ id: schema.teamMembers.id })
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.fullName, fullName))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(schema.teamMembers).values({ fullName, order: index, isPublished: true });
    }
  }

  console.log("Сидирование базового контента завершено.");
  await client.end();
}

main().catch((error) => {
  console.error("Ошибка сидирования:", error);
  process.exit(1);
});
