import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { notificationLogs, applications } from "@/server/db/schema";

export type NotificationLog = typeof notificationLogs.$inferSelect;

/**
 * Лог попыток доставки уведомлений (Telegram/email) — для /admin/logs.
 * Пишется независимо от того, дошла ли сама заявка (та уже сохранена в
 * БД к этому моменту) — это отдельный, чисто диагностический журнал.
 */
export const NotificationLogRepository = {
  async log(entry: {
    channel: "telegram" | "email";
    success: boolean;
    errorMessage?: string | null;
    applicationId?: string | null;
  }): Promise<void> {
    try {
      await db.insert(notificationLogs).values({
        channel: entry.channel,
        success: entry.success,
        errorMessage: entry.errorMessage ?? null,
        applicationId: entry.applicationId ?? null,
      });
    } catch (error) {
      // запись лога — best-effort, сама заявка уже сохранена и не должна
      // пострадать, даже если журналирование почему-то не удалось
      console.error("[notification-logs] не удалось записать лог:", error);
    }
  },

  async listRecent(limit = 100): Promise<(NotificationLog & { applicationName: string | null })[]> {
    const rows = await db
      .select({
        id: notificationLogs.id,
        channel: notificationLogs.channel,
        success: notificationLogs.success,
        errorMessage: notificationLogs.errorMessage,
        applicationId: notificationLogs.applicationId,
        createdAt: notificationLogs.createdAt,
        applicationName: applications.name,
      })
      .from(notificationLogs)
      .leftJoin(applications, eq(notificationLogs.applicationId, applications.id))
      .orderBy(desc(notificationLogs.createdAt))
      .limit(limit);
    return rows;
  },
};
