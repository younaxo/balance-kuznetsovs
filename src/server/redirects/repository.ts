import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { trackedDestinations } from "@/server/db/schema";
import { isSafeExternalUrl, isValidSlug } from "@/server/security/redirect";

/**
 * Разрешает slug в проверенный внешний URL из allowlist-таблицы
 * `tracked_destinations`. Возвращает null для любого некорректного,
 * неизвестного, неактивного или небезопасного назначения — вызывающий
 * код (Route Handler /go/:slug) в этом случае обязан ответить 404,
 * а не пытаться редиректить "как есть".
 */
export async function resolveTrackedDestination(slug: string): Promise<string | null> {
  if (!isValidSlug(slug)) return null;

  const rows = await db
    .select()
    .from(trackedDestinations)
    .where(eq(trackedDestinations.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row || !row.isActive) return null;
  if (!isSafeExternalUrl(row.url)) return null;

  return row.url;
}
