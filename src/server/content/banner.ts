import "server-only";
import { db } from "@/server/db/client";
import { siteBanner } from "@/server/db/schema";

export type SiteBanner = typeof siteBanner.$inferSelect;

const EMPTY: SiteBanner = {
  id: "default",
  enabled: false,
  text: null,
  buttonLabel: null,
  buttonHref: null,
  imageFilename: null,
  updatedAt: new Date(0),
};

/**
 * Баннер владелец ещё не настроил — по умолчанию enabled=false, так
 * что публичный сайт просто не рендерит секцию, пока в /admin/banner
 * не заполнят и не включат её.
 */
export async function getSiteBanner(): Promise<SiteBanner> {
  const rows = await db.select().from(siteBanner).limit(1);
  return rows[0] ?? EMPTY;
}
