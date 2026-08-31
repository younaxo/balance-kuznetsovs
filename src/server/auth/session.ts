import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminSessions, adminUsers } from "@/server/db/schema";
import { isProduction } from "@/lib/env.server";

/**
 * Session-based аутентификация администратора (никаких JWT в localStorage).
 *
 * Схема (по образцу Lucia auth): клиенту выдаётся случайный opaque-токен
 * в HttpOnly cookie. В базе хранится только SHA-256 хеш этого токена —
 * компрометация БД не позволяет угнать активные сессии. Валидация — по
 * хешу входящего cookie.
 *
 * Sliding expiration: если до истечения сессии осталось меньше половины
 * срока жизни, при каждой валидации срок продлевается — активный
 * администратор не разлогинивается посреди работы, а неактивная сессия
 * всё равно истекает.
 */

export const SESSION_COOKIE_NAME = "bk_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 часов
const SESSION_RENEW_THRESHOLD_MS = SESSION_TTL_MS / 2;

function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface CreateSessionInput {
  adminUserId: string;
  ipHash?: string;
  userAgent?: string;
}

export async function createSession(input: CreateSessionInput) {
  const token = generateSessionToken();
  const sessionId = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(adminSessions).values({
    id: sessionId,
    adminUserId: input.adminUserId,
    expiresAt,
    ipHash: input.ipHash,
    userAgent: input.userAgent?.slice(0, 500),
  });

  return { token, expiresAt };
}

export interface SessionValidationResult {
  session: typeof adminSessions.$inferSelect;
  adminUser: typeof adminUsers.$inferSelect;
}

/** Проверяет токен сессии и возвращает пользователя, либо null. */
export async function validateSessionToken(token: string): Promise<SessionValidationResult | null> {
  const sessionId = hashToken(token);

  const rows = await db
    .select({ session: adminSessions, adminUser: adminUsers })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(eq(adminSessions.id, sessionId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (Date.now() >= row.session.expiresAt.getTime()) {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
    return null;
  }

  if (!row.adminUser.isActive) {
    return null;
  }

  const msLeft = row.session.expiresAt.getTime() - Date.now();
  if (msLeft < SESSION_RENEW_THRESHOLD_MS) {
    const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db
      .update(adminSessions)
      .set({ expiresAt: newExpiresAt })
      .where(eq(adminSessions.id, sessionId));
    row.session.expiresAt = newExpiresAt;
  }

  return row;
}

export async function invalidateSession(token: string): Promise<void> {
  const sessionId = hashToken(token);
  await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
}

export async function invalidateAllSessionsForUser(adminUserId: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.adminUserId, adminUserId));
}

// --- Cookie helpers (вызывать только из Server Action / Route Handler) ----

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getSessionTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? null;
}

/** Хелпер для Server Components/Actions: текущий администратор или null. */
export async function getCurrentAdmin(): Promise<SessionValidationResult | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;
  return validateSessionToken(token);
}
