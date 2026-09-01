import { test, expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Заранее проставляет cookie согласия — тесты ниже проверяют конкретные
 * вещи (клавиатурную навигацию, контраст), а не сам cookie-баннер
 * (для него есть отдельный тест), поэтому не хотим, чтобы клик по
 * баннеру и связанный с ним сброс фокуса влиял на остальные проверки.
 */
async function acceptConsentCookie(context: BrowserContext) {
  await context.addCookies([
    {
      name: "bk_consent",
      value: encodeURIComponent(JSON.stringify({ analytics: false })),
      url: "http://localhost:3000",
    },
  ]);
}

test.describe("Доступность", () => {
  test("cookie-баннер согласия появляется и работает", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");
    const banner = page.getByRole("dialog", { name: "Настройки cookie" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Только необходимые" }).click();
    await expect(banner).toBeHidden();

    // В той же сессии (вкладке) — при перезагрузке баннер не должен
    // показываться повторно. По решению владельца согласие теперь
    // хранится в session cookie (без max-age): новую сессию/визит браузер
    // определяет сам при следующем полном запуске — это Playwright'ом не
    // симулируется без реального перезапуска браузера, поэтому здесь
    // проверяем именно "не всплывает повторно в рамках той же сессии".
    await page.reload();
    await expect(page.getByRole("dialog", { name: "Настройки cookie" })).toBeHidden();
  });

  test("клавиатурная навигация: skip-link, меню, фокус", async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await acceptConsentCookie(context);
    await page.goto("/");

    await page.keyboard.press("Tab");
    await expect(page.getByText("Перейти к содержанию")).toBeFocused();

    await page.getByRole("button", { name: "Оставить заявку" }).first().focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Оставить заявку" });
    await expect(dialog).toBeVisible();

    // Escape закрывает диалог (focus trap/keyboard handling из Radix Dialog).
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("автоматическая проверка доступности главной страницы (axe-core)", async ({
    page,
    context,
  }) => {
    await acceptConsentCookie(context);
    await page.goto("/");
    // Даём mount-анимациям Hero (fade-in) полностью завершиться — иначе
    // axe иногда ловит промежуточный кадр перехода как "недостаточный контраст".
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      seriousOrCritical,
      JSON.stringify(
        seriousOrCritical.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length })),
        null,
        2,
      ),
    ).toEqual([]);
  });

  test("автоматическая проверка доступности формы заявки (axe-core)", async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await acceptConsentCookie(context);
    await page.goto("/");
    // См. комментарий в предыдущем тесте — ждём завершения mount-анимаций Hero.
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Оставить заявку" }).first().click();
    await expect(page.getByRole("dialog", { name: "Оставить заявку" })).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(seriousOrCritical).toEqual([]);
  });
});
