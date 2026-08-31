import { z } from "zod";

/**
 * Публичная конфигурация окружения — только переменные с префиксом
 * NEXT_PUBLIC_*, безопасные для клиентского бандла. Никаких секретов
 * или имён серверных переменных в этом файле быть не должно —
 * см. src/lib/env.server.ts для серверной части.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_YANDEX_METRICA_ID: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
});

function parseClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_YANDEX_METRICA_ID: process.env.NEXT_PUBLIC_YANDEX_METRICA_ID,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  });
  if (!parsed.success) {
    throw new Error("Некорректная конфигурация публичных переменных окружения (.env)");
  }
  return parsed.data;
}

export const clientEnv = parseClientEnv();
