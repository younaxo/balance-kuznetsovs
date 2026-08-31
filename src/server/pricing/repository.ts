import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { priceItems } from "@/server/db/schema";

export type PriceItem = typeof priceItems.$inferSelect;
export type NewPriceItem = typeof priceItems.$inferInsert;

export const PriceRepository = {
  async listPublished(): Promise<PriceItem[]> {
    return db
      .select()
      .from(priceItems)
      .where(eq(priceItems.isPublished, true))
      .orderBy(asc(priceItems.order));
  },

  async listAll(): Promise<PriceItem[]> {
    return db.select().from(priceItems).orderBy(asc(priceItems.order));
  },

  async create(data: NewPriceItem): Promise<PriceItem> {
    const [row] = await db.insert(priceItems).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<NewPriceItem>): Promise<void> {
    await db
      .update(priceItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(priceItems.id, id));
  },

  async remove(id: string): Promise<void> {
    await db.delete(priceItems).where(eq(priceItems.id, id));
  },
};

export function formatPriceFromKopecks(kopecks: number): string {
  const rubles = Math.round(kopecks / 100);
  return `от ${new Intl.NumberFormat("ru-RU").format(rubles)} ₽`;
}
