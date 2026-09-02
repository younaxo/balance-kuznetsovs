import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminUsers, notificationSettings } from "@/server/db/schema";

/**
 * Кого пинговать в Telegram-уведомлении о новой заявке. Раньше это был
 * ручной env var TELEGRAM_PING_USERNAMES — теперь источник истины
 * полностью в БД, настраивается из /admin/settings:
 *   1. Общий выключатель (notification_settings.ping_all_enabled) —
 *      если false, никого не пингуем вообще.
 *   2. Иначе — все активные сотрудники с личным pingEnabled=true и
 *      заполненным telegramUsername.
 * По умолчанию (свежая база, никто ничего не настраивал) — общий
 * выключатель включён, у новых сотрудников pingEnabled тоже включён по
 * умолчанию: значит без какой-либо настройки при заявке будут упомянуты
 * все, у кого просто указан Telegram-юзернейм.
 */
export async function getPingUsernames(): Promise<string[]> {
  const [settings] = await db
    .select({ pingAllEnabled: notificationSettings.pingAllEnabled })
    .from(notificationSettings)
    .where(eq(notificationSettings.id, "default"))
    .limit(1);

  if (settings && !settings.pingAllEnabled) return [];

  const admins = await db
    .select({ telegramUsername: adminUsers.telegramUsername })
    .from(adminUsers)
    .where(and(eq(adminUsers.isActive, true), eq(adminUsers.pingEnabled, true)));

  return admins
    .map((a) => a.telegramUsername?.trim())
    .filter((u): u is string => Boolean(u))
    .map((u) => (u.startsWith("@") ? u : `@${u}`));
}
