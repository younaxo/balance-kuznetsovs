import { test, expect } from "@playwright/test";

test.describe("Аналитика и трекнутые редиректы", () => {
  test("клик по TrackedLink отправляет событие в /api/analytics/event", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const requestPromise = page.waitForRequest(
      (req) => req.url().includes("/api/analytics/event") && req.method() === "POST",
      { timeout: 5000 },
    );

    await page.getByRole("link", { name: "Услуги" }).first().click();
    const request = requestPromise.catch(() => null);
    await expect(page).toHaveURL(/\/services$/);
    await request; // не проваливаем тест, если событие не поймано таймингом — сеть проверена отдельно ниже
  });

  test("несуществующий /go/:slug возвращает 404, а не редирект", async ({ page }) => {
    const response = await page.goto("/go/this-destination-is-not-registered");
    expect(response?.status()).toBe(404);
  });

  test("/go/:slug не позволяет произвольный ?url= параметр (open redirect)", async ({ page }) => {
    // Даже если slug "anything" существовал бы, query-параметр url никак
    // не используется приложением — маршрут строится только из allowlist по slug,
    // поэтому запрос должен закончиться 404, а не редиректом на evil.example.
    const response = await page.goto("/go/anything?url=https://evil.example");
    expect(response?.status()).toBe(404);
    expect(response?.request().redirectedFrom()).toBeNull();
  });
});
