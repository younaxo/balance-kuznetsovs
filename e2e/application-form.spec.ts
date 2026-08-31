import { test, expect, type Page } from "@playwright/test";

async function dismissCookieBanner(page: Page) {
  const banner = page.getByRole("dialog", { name: "Настройки cookie" });
  if (await banner.isVisible().catch(() => false)) {
    await banner.getByRole("button", { name: "Только необходимые" }).click();
    await expect(banner).toBeHidden();
  }
}

test.describe("Форма заявки", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await dismissCookieBanner(page);
  });

  test("модалка открывается по CTA из шапки", async ({ page }) => {
    await page.getByRole("button", { name: "Оставить заявку" }).first().click();
    await expect(page.getByRole("dialog", { name: "Оставить заявку" })).toBeVisible();
  });

  test("показывает ошибки валидации при пустой отправке", async ({ page }) => {
    await page.getByRole("button", { name: "Оставить заявку" }).first().click();
    await page.getByLabel("Имя*").fill("А");
    await page.getByRole("button", { name: "Отправить заявку" }).click();
    // Без телефона/telegram/email и без согласия форма не должна уйти на сервер.
    await expect(page.getByText(/способ связи|согласие/i).first()).toBeVisible();
  });

  test("успешно отправляет валидную заявку", async ({ page }) => {
    await page.getByRole("button", { name: "Оставить заявку" }).first().click();

    await page.getByLabel("Имя*").fill("Плейрайт Тест");
    await page.getByLabel("Телефон").fill("+7 900 000-00-00");
    await page.getByLabel(/обработку персональных данных/).check();

    await page.getByRole("button", { name: "Отправить заявку" }).click();
    await expect(page.getByText("Заявка отправлена")).toBeVisible({ timeout: 10_000 });
  });

  test("honeypot-поле скрыто от клавиатурной навигации", async ({ page }) => {
    await page.getByRole("button", { name: "Оставить заявку" }).first().click();
    const honeypot = page.locator("#website");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});
