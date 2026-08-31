import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { services } from "@/server/db/schema";
import type { IllustrationKey } from "@/components/icons/legal-illustrations";

export type Service = typeof services.$inferSelect;
export type NewService = Omit<typeof services.$inferInsert, "illustration"> & {
  illustration: IllustrationKey;
};

/**
 * Полноценный репозиторий услуг. Все услуги (включая изначальные пять
 * из ТЗ, засеянные scripts/seed-admin.ts дословным текстом) хранятся
 * в БД и редактируются из /admin/services — никакого read-only
 * подмножества, полностью управляется владельцем.
 */
export const ServiceRepository = {
  async listPublished(): Promise<Service[]> {
    return db
      .select()
      .from(services)
      .where(eq(services.isPublished, true))
      .orderBy(asc(services.order));
  },

  async listAll(): Promise<Service[]> {
    return db.select().from(services).orderBy(asc(services.order));
  },

  async findBySlug(slug: string): Promise<Service | null> {
    const rows = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
    return rows[0] ?? null;
  },

  async create(data: NewService): Promise<Service> {
    const [row] = await db.insert(services).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<NewService>): Promise<void> {
    await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, id));
  },

  async remove(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  },
};
