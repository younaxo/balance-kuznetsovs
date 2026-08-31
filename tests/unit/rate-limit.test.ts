import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, __resetRateLimiterForTests } from "@/server/security/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    __resetRateLimiterForTests();
  });

  it("разрешает запросы в пределах лимита", () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit("key-a", { limit: 5, windowMs: 60_000 });
      expect(result.allowed).toBe(true);
    }
  });

  it("блокирует запрос сверх лимита", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("key-b", { limit: 5, windowMs: 60_000 });
    }
    const result = checkRateLimit("key-b", { limit: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("не влияет на другие ключи (rate limit изолирован по ключу/IP)", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("key-c", { limit: 5, windowMs: 60_000 });
    }
    const other = checkRateLimit("key-d", { limit: 5, windowMs: 60_000 });
    expect(other.allowed).toBe(true);
  });

  it("сбрасывает лимит после истечения окна", async () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("key-e", { limit: 3, windowMs: 50 });
    }
    expect(checkRateLimit("key-e", { limit: 3, windowMs: 50 }).allowed).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 70));
    expect(checkRateLimit("key-e", { limit: 3, windowMs: 50 }).allowed).toBe(true);
  });
});
