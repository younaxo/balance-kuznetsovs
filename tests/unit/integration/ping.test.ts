import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { db } from "@/server/db/client";
import { adminUsers, notificationSettings } from "@/server/db/schema";
import { getPingUsernames } from "@/server/notifications/ping";

/**
 * Интеграционные тесты — реальная тестовая БД (см. application-service.test.ts).
 */
describe("getPingUsernames (интеграция с БД)", () => {
  beforeEach(async () => {
    await db.delete(adminUsers);
    await db.delete(notificationSettings);
  });

  afterAll(async () => {
    await db.delete(adminUsers);
    await db.delete(notificationSettings);
  });

  it("по умолчанию (никто ничего не настраивал) упоминает всех активных с указанным юзернеймом", async () => {
    await db.insert(adminUsers).values([
      {
        email: "a@example.com",
        passwordHash: "x",
        telegramUsername: "alice",
      },
      {
        email: "b@example.com",
        passwordHash: "x",
        telegramUsername: "@bob",
      },
      {
        email: "c@example.com",
        passwordHash: "x",
        telegramUsername: null, // без юзернейма — не упоминается
      },
    ]);

    const result = await getPingUsernames();
    expect(result.sort()).toEqual(["@alice", "@bob"]);
  });

  it("не упоминает неактивных сотрудников", async () => {
    await db.insert(adminUsers).values({
      email: "inactive@example.com",
      passwordHash: "x",
      telegramUsername: "inactive",
      isActive: false,
    });

    expect(await getPingUsernames()).toEqual([]);
  });

  it("не упоминает сотрудника, лично выключившего упоминания", async () => {
    await db.insert(adminUsers).values({
      email: "quiet@example.com",
      passwordHash: "x",
      telegramUsername: "quiet",
      pingEnabled: false,
    });

    expect(await getPingUsernames()).toEqual([]);
  });

  it("общий выключатель отключает упоминания для всех, даже если у кого-то личный тумблер включён", async () => {
    await db.insert(adminUsers).values({
      email: "someone@example.com",
      passwordHash: "x",
      telegramUsername: "someone",
      pingEnabled: true,
    });
    await db.insert(notificationSettings).values({ id: "default", pingAllEnabled: false });

    expect(await getPingUsernames()).toEqual([]);
  });

  it("включение общего выключателя обратно возвращает упоминания", async () => {
    await db.insert(adminUsers).values({
      email: "someone2@example.com",
      passwordHash: "x",
      telegramUsername: "someone2",
    });
    await db.insert(notificationSettings).values({ id: "default", pingAllEnabled: true });

    expect(await getPingUsernames()).toEqual(["@someone2"]);
  });
});
