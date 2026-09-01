import { test, expect } from "@playwright/test";

test.describe("Главная страница", () => {
  test("открывается и показывает ключевой контент", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Разработка юридических документов",
    );
    await expect(page.getByText("С какими задачами к нам обращаются?")).toBeVisible();
    await expect(page.getByText("Наши услуги")).toBeVisible();
  });

  test("нет ошибок в консоли и сети при загрузке", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    const failedRequests: string[] = [];
    page.on("requestfailed", (req) => {
      // Next.js Link-префетч (RSC-запросы с ?_rsc=) сам отменяет "лишние"
      // запросы при новой навигации/повторном ховере — net::ERR_ABORTED
      // это ожидаемая отмена, а не реальный сбой сети, и не должна валить тест.
      if (req.failure()?.errorText === "net::ERR_ABORTED") return;
      failedRequests.push(req.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(consoleErrors, `Console errors: ${consoleErrors.join("\n")}`).toEqual([]);
    expect(failedRequests, `Failed requests: ${failedRequests.join("\n")}`).toEqual([]);
  });

  test("десктопная навигация в шапке ведёт на нужные страницы", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByRole("link", { name: "Услуги" }).first().click();
    await expect(page).toHaveURL(/\/services$/);
  });

  test("мобильное меню открывается, показывает навигацию и закрывается", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Открыть меню" }).click();
    const nav = page.getByRole("navigation", { name: "Основная навигация" }).last();
    await expect(nav.getByRole("link", { name: /Отзывы/ })).toBeVisible();
    await page.getByRole("button", { name: "Закрыть меню" }).click();
    await expect(page.getByRole("button", { name: "Закрыть меню" })).toBeHidden();
  });
});
