import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { adminUsers, loginAttempts } from "@/server/db/schema";
import { verifyPassword } from "./password";
import { createSession, setSessionCookie } from "./session";

/**
 * Логин администратора с защитой от брутфорса.
 *
 * Правила:
 *  - не более MAX_ATTEMPTS неудачных попыток на идентификатор
 *    за LOCKOUT_WINDOW_MS — иначе аккаунт временно блокируется;
 *  - идентификатор = hash(IP) + email, чтобы одна скомпрометированная
 *    учётная запись не блокировала весь офис за одним NAT-адресом,
 *    но и подбор пароля с разных IP по одному email тоже ловился;
 *  - ответ ВСЕГДА одинаковый на "нет такого пользователя" и "неверный
 *    пароль" — не даём энумерировать существующие email.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

export const GENERIC_LOGIN_ERROR = "Неверный email или пароль.";
export const RATE_LIMITED_ERROR = "Слишком много попыток входа. Попробуйте позже.";

export type LoginResult = { ok: true } | { ok: false; error: string };

function buildIdentifier(ipHash: string, email: string): string {
  return `${ipHash}:${email.trim().toLowerCase()}`;
}

async function isLockedOut(identifier: string): Promise<boolean> {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.identifier, identifier),
        eq(loginAttempts.succeeded, false),
        gt(loginAttempts.createdAt, since),
      ),
    );
  const failedCount = Number(rows[0]?.count ?? 0);
  return failedCount >= MAX_ATTEMPTS;
}

async function recordAttempt(identifier: string, succeeded: boolean) {
  await db.insert(loginAttempts).values({ identifier, succeeded });
}

export interface LoginInput {
  email: string;
  password: string;
  ipHash: string;
  userAgent?: string;
}

export async function loginAdmin(input: LoginInput): Promise<LoginResult> {
  const identifier = buildIdentifier(input.ipHash, input.email);

  if (await isLockedOut(identifier)) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }

  const rows = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, input.email.trim().toLowerCase()))
    .limit(1);
  const user = rows[0];

  if (!user || !user.isActive) {
    await recordAttempt(identifier, false);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const passwordValid = await verifyPassword(user.passwordHash, input.password);
  if (!passwordValid) {
    await recordAttempt(identifier, false);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  await recordAttempt(identifier, true);

  const { token, expiresAt } = await createSession({
    adminUserId: user.id,
    ipHash: input.ipHash,
    userAgent: input.userAgent,
  });
  await setSessionCookie(token, expiresAt);

  return { ok: true };
}
