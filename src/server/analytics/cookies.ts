import "server-only";
import { cookies } from "next/headers";
import { isProduction } from "@/lib/env.server";
import type { UtmSnapshot } from "./utm";

/**
 * First-party аналитика хранит три небольших нечувствительных cookie:
 *  - bk_sid  — анонимный идентификатор сессии (uuid, без связи с личностью);
 *  - bk_ft   — снимок first-touch UTM + посадочной страницы (пишется один раз);
 *  - bk_lt   — снимок last-touch UTM (перезаписывается при новом визите с метками).
 *
 * Ни одна из них не хранит email/телефон/токены и не используется для
 * восстановления личности пользователя.
 */

const SID_COOKIE = "bk_sid";
const FT_COOKIE = "bk_ft";
const LT_COOKIE = "bk_lt";

const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 180; // 180 дней
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

export interface TouchSnapshot extends UtmSnapshot {
  path: string;
}

function baseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getSessionIdCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SID_COOKIE)?.value ?? null;
}

export async function setSessionIdCookie(sessionId: string): Promise<void> {
  const store = await cookies();
  store.set(SID_COOKIE, sessionId, baseCookieOptions(SESSION_MAX_AGE));
}

export async function getFirstTouchCookie(): Promise<TouchSnapshot | null> {
  const store = await cookies();
  const raw = store.get(FT_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TouchSnapshot;
  } catch {
    return null;
  }
}

export async function setFirstTouchCookie(snapshot: TouchSnapshot): Promise<void> {
  const store = await cookies();
  store.set(FT_COOKIE, JSON.stringify(snapshot), baseCookieOptions(ATTRIBUTION_MAX_AGE));
}

export async function getLastTouchCookie(): Promise<TouchSnapshot | null> {
  const store = await cookies();
  const raw = store.get(LT_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TouchSnapshot;
  } catch {
    return null;
  }
}

export async function setLastTouchCookie(snapshot: TouchSnapshot): Promise<void> {
  const store = await cookies();
  store.set(LT_COOKIE, JSON.stringify(snapshot), baseCookieOptions(ATTRIBUTION_MAX_AGE));
}
