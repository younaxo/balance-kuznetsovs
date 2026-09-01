import "server-only";
import { cookies } from "next/headers";
import { isProduction } from "@/lib/env.server";
import { db } from "@/server/db/client";
import { consentRecords } from "@/server/db/schema";

/**
 * Consent Manager: минимум две категории — Necessary (всегда включена,
 * сайт не может работать без неё — например, cookie сессии администратора
 * или cookie самого consent-выбора) и Analytics (first-party аналитика
 * переходов). Пока пользователь не дал согласие,
 * никакие analytics-cookie не создаются и события не пишутся в БД.
 *
 * bk_consent — session cookie (без maxAge): по решению владельца баннер
 * должен спрашивать заново в каждой новой сессии, а не запоминаться на
 * год. Браузер сам удаляет такую cookie при полном закрытии.
 */

const CONSENT_COOKIE = "bk_consent";

export interface ConsentState {
  analytics: boolean;
}

export async function getConsent(): Promise<ConsentState | null> {
  const store = await cookies();
  const raw = store.get(CONSENT_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    return { analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
}

export async function setConsent(analytics: boolean, sessionId: string | null): Promise<void> {
  const store = await cookies();
  store.set(CONSENT_COOKIE, JSON.stringify({ analytics }), {
    httpOnly: false, // читается клиентским баннером, чтобы не показывать его повторно
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    // без maxAge — session cookie, см. комментарий в шапке файла
  });

  await db.insert(consentRecords).values({
    sessionId: sessionId ?? undefined,
    analyticsAccepted: analytics,
  });
}
