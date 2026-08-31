import "server-only";
import { db } from "@/server/db/client";
import { contactSettings } from "@/server/db/schema";

export type ContactSettings = typeof contactSettings.$inferSelect;

const EMPTY: ContactSettings = {
  id: "default",
  phone: null,
  email: null,
  telegram: null,
  maxMessenger: null,
  address: null,
  workingHours: null,
  operatorFullName: null,
  operatorInn: null,
  operatorOgrn: null,
  operatorAddress: null,
  updatedAt: new Date(0),
};

/**
 * Реальные контакты владелец ещё не предоставил — до тех пор все поля
 * приходят как null, и публичный UI обязан аккуратно скрывать
 * соответствующие блоки, а не подставлять выдуманные значения.
 */
export async function getContactSettings(): Promise<ContactSettings> {
  const rows = await db.select().from(contactSettings).limit(1);
  return rows[0] ?? EMPTY;
}
