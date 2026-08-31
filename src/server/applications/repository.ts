import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { applications } from "@/server/db/schema";

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type ApplicationStatus = Application["status"];

/**
 * Репозиторий заявок — единственное место, где выполняются SQL-запросы
 * к таблице `applications`. Сервисный слой (ApplicationService) и
 * admin-панель работают только через этот интерфейс.
 */
export const ApplicationRepository = {
  async create(data: NewApplication): Promise<Application> {
    const [row] = await db.insert(applications).values(data).returning();
    return row;
  },

  async findById(id: string): Promise<Application | null> {
    const rows = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return rows[0] ?? null;
  },

  async list(
    params: {
      status?: ApplicationStatus;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ items: Application[]; total: number }> {
    const { status, limit = 50, offset = 0 } = params;

    const whereClause = status ? eq(applications.status, status) : undefined;

    const [items, countRows] = await Promise.all([
      db
        .select()
        .from(applications)
        .where(whereClause)
        .orderBy(desc(applications.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(applications)
        .where(whereClause),
    ]);

    return { items, total: Number(countRows[0]?.count ?? 0) };
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<void> {
    await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id));
  },

  async markNotified(id: string, channel: "telegram" | "email"): Promise<void> {
    const field = channel === "telegram" ? "telegramNotifiedAt" : "emailNotifiedAt";
    await db
      .update(applications)
      .set({ [field]: new Date() })
      .where(eq(applications.id, id));
  },

  async countByStatus(): Promise<Record<string, number>> {
    const rows = await db
      .select({ status: applications.status, count: sql<number>`count(*)` })
      .from(applications)
      .groupBy(applications.status);
    return Object.fromEntries(rows.map((r) => [r.status, Number(r.count)]));
  },
};
