import "server-only";
import { z } from "zod";

/**
 * Серверная конфигурация окружения. Файл импортирует "server-only" —
 * попытка подключить его из клиентского компонента приведёт к ошибке
 * сборки, а не к тихой утечке имён/логики валидации секретов в
 * клиентский бандл (именно так раньше ломался общий src/lib/env.ts,
 * когда его по ошибке тянул клиентский компонент — см. DECISIONS.md).
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL обязателен для работы с PostgreSQL"),

  SESSION_SECRET: z.string().min(32, "SESSION_SECRET должен быть длиной не менее 32 символов"),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_INITIAL_PASSWORD: z.string().min(12).optional(),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  APPLICATION_EMAIL_TO: z.string().optional(),

  TURNSTILE_SECRET_KEY: z.string().optional(),

  ANALYTICS_IP_HASH_SALT: z.string().optional(),
});

function parseServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Некорректная конфигурация окружения (.env):\n${issues}\n\nСмотрите .env.example.`,
    );
  }
  return parsed.data;
}

export const serverEnv = parseServerEnv();
export const isProduction = serverEnv.NODE_ENV === "production";
