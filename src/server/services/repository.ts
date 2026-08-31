import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { services } from "@/server/db/schema";

export type ExtraService = typeof services.$inferSelect;

/**
 * Дополнительные услуги сверх пяти базовых из ТЗ (см. src/domain/services.ts).
 * Их текст пишет сам администратор через /admin/services — в отличие от
 * базовых пяти, здесь нет ограничения "не менять тексты", так как текст
 * заводит сам владелец продукта.
 */
export async function listPublishedExtraServices(): Promise<ExtraService[]> {
  return db
    .select()
    .from(services)
    .where(eq(services.isPublished, true))
    .orderBy(asc(services.order));
}
