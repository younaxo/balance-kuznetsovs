import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/server/db/client";
import { trackedDestinations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { resolveTrackedDestination } from "@/server/redirects/repository";

describe("resolveTrackedDestination — allowlist редиректов (интеграция с БД)", () => {
  beforeAll(async () => {
    await db.insert(trackedDestinations).values([
      {
        slug: "test-active",
        label: "Активная ссылка",
        url: "https://example.com/promo",
        isActive: true,
      },
      {
        slug: "test-inactive",
        label: "Отключённая ссылка",
        url: "https://example.com/old",
        isActive: false,
      },
    ]);
  });

  afterAll(async () => {
    await db.delete(trackedDestinations).where(eq(trackedDestinations.slug, "test-active"));
    await db.delete(trackedDestinations).where(eq(trackedDestinations.slug, "test-inactive"));
  });

  it("резолвит активный slug в зарегистрированный URL", async () => {
    const url = await resolveTrackedDestination("test-active");
    expect(url).toBe("https://example.com/promo");
  });

  it("возвращает null для неактивной записи", async () => {
    const url = await resolveTrackedDestination("test-inactive");
    expect(url).toBeNull();
  });

  it("возвращает null для незарегистрированного slug", async () => {
    const url = await resolveTrackedDestination("does-not-exist-anywhere");
    expect(url).toBeNull();
  });

  it("возвращает null для slug с недопустимыми символами (защита от инъекции в путь)", async () => {
    const url = await resolveTrackedDestination("../../etc/passwd");
    expect(url).toBeNull();
  });
});
