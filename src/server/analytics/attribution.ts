import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { attributions, analyticsSessions } from "@/server/db/schema";
import { getFirstTouchCookie, getLastTouchCookie, getSessionIdCookie } from "./cookies";

/**
 * Снимает first-touch/last-touch атрибуцию из cookie (см. cookies.ts)
 * и привязывает её к только что созданной заявке. Вызывается из
 * ApplicationService сразу после сохранения заявки в БД.
 *
 * Если пользователь не давал согласие на аналитику — cookie отсутствуют,
 * и в этом случае атрибуция просто не создаётся (заявка при этом уже
 * успешно сохранена и не теряется).
 */
export async function attachAttribution(applicationId: string, ctaSource?: string): Promise<void> {
  try {
    const [firstTouch, lastTouch, sessionId] = await Promise.all([
      getFirstTouchCookie(),
      getLastTouchCookie(),
      getSessionIdCookie(),
    ]);

    if (!firstTouch && !lastTouch && !sessionId && !ctaSource) return;

    // Cookie сессии может пережить саму запись в analytics_sessions
    // (ручная очистка в разработке, будущая retention-политика) —
    // проверяем существование, иначе вставка упадёт на foreign key.
    const sessionExists = sessionId
      ? Boolean(
          (
            await db
              .select({ id: analyticsSessions.id })
              .from(analyticsSessions)
              .where(eq(analyticsSessions.id, sessionId))
              .limit(1)
          )[0],
        )
      : false;

    await db.insert(attributions).values({
      applicationId,
      sessionId: sessionExists ? sessionId! : undefined,
      firstTouchUtmSource: firstTouch?.utmSource ?? undefined,
      firstTouchUtmMedium: firstTouch?.utmMedium ?? undefined,
      firstTouchUtmCampaign: firstTouch?.utmCampaign ?? undefined,
      firstTouchLandingPath: firstTouch?.path ?? undefined,
      lastTouchUtmSource: lastTouch?.utmSource ?? undefined,
      lastTouchUtmMedium: lastTouch?.utmMedium ?? undefined,
      lastTouchUtmCampaign: lastTouch?.utmCampaign ?? undefined,
      lastTouchPath: lastTouch?.path ?? undefined,
      ctaSource,
    });
  } catch (error) {
    console.error("[attribution] не удалось сохранить атрибуцию", error);
  }
}
