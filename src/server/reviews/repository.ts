import "server-only";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/server/db/client";
import { reviews } from "@/server/db/schema";

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export const ReviewRepository = {
  async listPublished(limit?: number): Promise<Review[]> {
    const query = db
      .select()
      .from(reviews)
      .where(eq(reviews.isPublished, true))
      .orderBy(reviews.order, desc(reviews.reviewedAt));
    return limit ? query.limit(limit) : query;
  },

  async listAll(): Promise<Review[]> {
    return db.select().from(reviews).orderBy(desc(reviews.createdAt));
  },

  async create(data: NewReview): Promise<Review> {
    const [row] = await db.insert(reviews).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<NewReview>): Promise<void> {
    await db
      .update(reviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(reviews.id, id));
  },

  async setPublished(id: string, isPublished: boolean): Promise<void> {
    await db.update(reviews).set({ isPublished, updatedAt: new Date() }).where(eq(reviews.id, id));
  },

  async findExisting(sourceUrl: string, authorName: string): Promise<Review | null> {
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.sourceUrl, sourceUrl), eq(reviews.authorName, authorName)))
      .limit(1);
    return rows[0] ?? null;
  },
};
