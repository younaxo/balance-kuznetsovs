import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { analyticsEvents, analyticsSessions } from "@/server/db/schema";
import { getConsent } from "@/server/consent/cookies";
import {
  getFirstTouchCookie,
  getLastTouchCookie,
  getSessionIdCookie,
  setFirstTouchCookie,
  setLastTouchCookie,
  setSessionIdCookie,
} from "./cookies";
import { classifyDevice } from "./device";
import { hasAnyUtm, parseUtmParams, type UtmSnapshot } from "./utm";
import { z } from "zod";

/**
 * Централизованный слой записи событий first-party аналитики.
 * Единственная точка входа для Route Handler `/api/analytics/event` —
 * компоненты на клиенте никогда не пишут в БД напрямую, они вызывают
 * `trackEvent()` (см. src/components/analytics/analytics-provider.tsx),
 * который бьёт в этот Route Handler.
 */

export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "nav_click",
  "footer_click",
  "cta_click",
  "service_cta_click",
  "external_link_click",
  "telegram_click",
  "max_click",
  "email_click",
  "phone_click",
  "quiz_open",
  "quiz_step",
  "quiz_complete",
  "application_open",
  "application_submit",
  "tracked_redirect",
] as const;

export const analyticsEventSchema = z.object({
  eventType: z.enum(ANALYTICS_EVENT_TYPES),
  pathname: z.string().max(2000),
  sourceElement: z.string().max(200).optional(),
  destination: z.string().max(2000).optional(),
  search: z.string().max(2000).optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

export interface RecordEventContext {
  userAgent: string | null;
  referrer: string | null;
}

/**
 * Записывает событие. Если пользователь не дал согласие на аналитику —
 * функция тихо ничего не делает (не создаёт cookie, не пишет в БД) и
 * возвращает null. Ошибки не выбрасываются наружу вызывающему коду
 * (сбой аналитики не должен ронять страницу или заявку).
 */
export async function recordAnalyticsEvent(
  input: AnalyticsEventInput,
  ctx: RecordEventContext,
): Promise<{ sessionId: string } | null> {
  try {
    const consent = await getConsent();
    if (!consent?.analytics) return null;

    const utm = parseUtmParams(new URLSearchParams(input.search ?? ""));
    const sessionId = await ensureSession(input.pathname, ctx, utm);
    await maybeUpdateLastTouch(input.pathname, utm);

    await db.insert(analyticsEvents).values({
      sessionId,
      eventType: input.eventType,
      pathname: input.pathname,
      sourceElement: input.sourceElement,
      destination: input.destination,
      isConversion: input.eventType === "application_submit",
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      utmContent: utm.utmContent,
      utmTerm: utm.utmTerm,
    });

    await db
      .update(analyticsSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(analyticsSessions.id, sessionId));

    return { sessionId };
  } catch (error) {
    console.error("[analytics] не удалось записать событие", error);
    return null;
  }
}

async function ensureSession(
  pathname: string,
  ctx: RecordEventContext,
  utm: UtmSnapshot,
): Promise<string> {
  const existing = await getSessionIdCookie();
  if (existing) return existing;

  const [row] = await db
    .insert(analyticsSessions)
    .values({
      deviceCategory: classifyDevice(ctx.userAgent),
      landingPath: pathname,
      referrer: ctx.referrer,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      utmContent: utm.utmContent,
      utmTerm: utm.utmTerm,
    })
    .returning({ id: analyticsSessions.id });

  await setSessionIdCookie(row.id);

  if (hasAnyUtm(utm)) {
    await setFirstTouchCookie({ ...utm, path: pathname });
  }

  return row.id;
}

async function maybeUpdateLastTouch(pathname: string, utm: UtmSnapshot) {
  if (!hasAnyUtm(utm)) return;
  await setLastTouchCookie({ ...utm, path: pathname });

  const firstTouch = await getFirstTouchCookie();
  if (!firstTouch) {
    await setFirstTouchCookie({ ...utm, path: pathname });
  }
}

export { getFirstTouchCookie, getLastTouchCookie, getSessionIdCookie };
