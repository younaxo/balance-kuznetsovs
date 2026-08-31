import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/server/db/client";
import { adminUsers, adminSessions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/server/auth/password";
import { createSession, validateSessionToken, invalidateSession } from "@/server/auth/session";

describe("Сессии администратора (интеграция с БД)", () => {
  let userId: string;

  beforeAll(async () => {
    const hash = await hashPassword("Test-Password-123!");
    const [user] = await db
      .insert(adminUsers)
      .values({ email: "session-test@example.com", passwordHash: hash, role: "editor" })
      .returning();
    userId = user.id;
  });

  afterAll(async () => {
    await db.delete(adminSessions).where(eq(adminSessions.adminUserId, userId));
    await db.delete(adminUsers).where(eq(adminUsers.id, userId));
  });

  it("создаёт сессию и валидирует её по токену", async () => {
    const { token } = await createSession({ adminUserId: userId });
    const result = await validateSessionToken(token);
    expect(result?.adminUser.id).toBe(userId);
  });

  it("возвращает null для несуществующего/поддельного токена", async () => {
    const result = await validateSessionToken("this-token-does-not-exist-in-db");
    expect(result).toBeNull();
  });

  it("инвалидирует сессию — повторная валидация возвращает null", async () => {
    const { token } = await createSession({ adminUserId: userId });
    expect(await validateSessionToken(token)).not.toBeNull();

    await invalidateSession(token);
    expect(await validateSessionToken(token)).toBeNull();
  });

  it("не хранит сам токен в БД — только его хеш", async () => {
    const { token } = await createSession({ adminUserId: userId });
    const rows = await db.select().from(adminSessions).where(eq(adminSessions.adminUserId, userId));
    expect(rows.some((r) => r.id === token)).toBe(false);
  });
});
