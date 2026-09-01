import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { teamMembers } from "@/server/db/schema";

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

/**
 * Репозиторий команды/специалистов. По запросу клиента карточка
 * содержит только ФИО и (опционально) фото — никаких выдуманных
 * должностей/стажа/статистики. Полностью управляется из /admin/team.
 */
export const TeamRepository = {
  async listPublished(): Promise<TeamMember[]> {
    return db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.isPublished, true))
      .orderBy(asc(teamMembers.order));
  },

  async listAll(): Promise<TeamMember[]> {
    return db.select().from(teamMembers).orderBy(asc(teamMembers.order));
  },

  async create(data: NewTeamMember): Promise<TeamMember> {
    const [row] = await db.insert(teamMembers).values(data).returning();
    return row;
  },

  async update(id: string, data: Partial<NewTeamMember>): Promise<void> {
    await db
      .update(teamMembers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teamMembers.id, id));
  },

  async remove(id: string): Promise<void> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
  },
};
