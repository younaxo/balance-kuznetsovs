import { z } from "zod";

/**
 * Публичная конфигурация окружения — только переменные с префиксом
 * NEXT_PUBLIC_*, безопасные для клиентского бандла. Никаких секретов
 * или имён серверных переменных в этом файле быть не должно —
 * см. src/lib/env.server.ts для серверной части.
 */

// .optional().or(z.literal("")) — не только "переменной вовсе нет", но и
// "переменная объявлена пустой строкой" (Docker ARG без значения при
// сборке образов migrate/seed — они не получают build args, в отличие
// от web, см. Dockerfile — превращается именно в ENV VAR="", а не в
// отсутствие переменной; .url() иначе валит сборку на пустой строке).
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional().or(z.literal("")),
});

function parseClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });
  if (!parsed.success) {
    throw new Error("Некорректная конфигурация публичных переменных окружения (.env)");
  }
  return parsed.data;
}

export const clientEnv = parseClientEnv();
