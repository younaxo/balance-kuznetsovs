import { describe, it, expect, afterEach, vi } from "vitest";

/**
 * Регрессия: сборка Docker-образов migrate/seed падала с "Некорректная
 * конфигурация публичных переменных окружения (.env)", потому что
 * ARG без значения превращается в ENV VAR="" (пустая строка), а не в
 * отсутствие переменной — z.string().url().optional() пустую строку
 * не пропускает. См. Dockerfile + src/lib/env.client.ts.
 */
describe("clientEnv", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    vi.resetModules();
  });

  it("не падает, если NEXT_PUBLIC_SITE_URL — пустая строка (Docker ARG без значения)", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "";
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "";
    vi.resetModules();
    const { clientEnv } = await import("@/lib/env.client");
    expect(clientEnv.NEXT_PUBLIC_SITE_URL).toBe("");
  });

  it("принимает нормальный валидный URL", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://test-bk.aspectvisuals.su";
    vi.resetModules();
    const { clientEnv } = await import("@/lib/env.client");
    expect(clientEnv.NEXT_PUBLIC_SITE_URL).toBe("https://test-bk.aspectvisuals.su");
  });
});
