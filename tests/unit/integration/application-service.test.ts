import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { db } from "@/server/db/client";
import { applications, loginAttempts } from "@/server/db/schema";
import { ApplicationService } from "@/server/applications/service";
import { __resetRateLimiterForTests } from "@/server/security/rate-limit";

/**
 * Интеграционные тесты — используют реальную тестовую БД PostgreSQL
 * (DATABASE_URL_TEST, применены те же миграции, что и в production).
 * Требуют запущенного docker-compose (см. README) или локального Postgres.
 */
describe("ApplicationService.submitFromForm (интеграция с БД)", () => {
  beforeAll(async () => {
    await db.delete(applications);
  });

  beforeEach(() => {
    __resetRateLimiterForTests();
  });

  afterAll(async () => {
    await db.delete(applications);
  });

  it("надёжно сохраняет валидную заявку в PostgreSQL", async () => {
    const result = await ApplicationService.submitFromForm(
      {
        name: "Интеграционный Тест",
        phone: "+79001112233",
        telegram: "",
        messengerType: "telegram" as const,
        email: "",
        message: "",
        consent: true,
        website: "",
      },
      { ipHash: "test-ip-hash-1" },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      const rows = await db.select().from(applications);
      expect(rows.some((r) => r.id === result.application.id)).toBe(true);
      expect(result.application.status).toBe("new");
    }
  });

  it("тихо отклоняет заявку с заполненным honeypot и НЕ сохраняет её", async () => {
    const before = (await db.select().from(applications)).length;

    const result = await ApplicationService.submitFromForm(
      {
        name: "Спам-бот",
        phone: "+79000000000",
        telegram: "",
        messengerType: "telegram" as const,
        email: "",
        message: "",
        consent: true,
        website: "http://spam.example",
      },
      { ipHash: "test-ip-hash-2" },
    );

    expect(result.ok).toBe(false);
    const after = (await db.select().from(applications)).length;
    expect(after).toBe(before);
  });

  it("применяет rate limit после нескольких быстрых заявок с одного IP", async () => {
    const ipHash = "test-ip-hash-rate-limit";
    let lastResult;
    for (let i = 0; i < 6; i++) {
      lastResult = await ApplicationService.submitFromForm(
        {
          name: `Заявка ${i}`,
          phone: "+79001112233",
          telegram: "",
          messengerType: "telegram" as const,
          email: "",
          message: "",
          consent: true,
          website: "",
        },
        { ipHash },
      );
    }

    expect(lastResult?.ok).toBe(false);
    if (!lastResult?.ok) {
      expect(lastResult?.error).toBe("rate_limited");
    }
  });
});

describe("Логин администратора — блокировка по попыткам (интеграция с БД)", () => {
  const identifierPrefix = "test-login-lockout";

  beforeAll(async () => {
    await db.delete(loginAttempts);
  });

  afterAll(async () => {
    await db.delete(loginAttempts);
  });

  it("блокирует после 5 неудачных попыток входа", async () => {
    const { loginAdmin, RATE_LIMITED_ERROR } = await import("@/server/auth/login");

    let lastResult;
    for (let i = 0; i < 6; i++) {
      lastResult = await loginAdmin({
        email: "nonexistent@example.com",
        password: "wrong-password",
        ipHash: identifierPrefix,
      });
    }

    expect(lastResult?.ok).toBe(false);
    if (!lastResult?.ok) {
      expect(lastResult?.error).toBe(RATE_LIMITED_ERROR);
    }
  });
});
