import { test, expect } from "@playwright/test";

test.describe("Квиз «Рассчитать стоимость»", () => {
  test("можно пройти все шаги и отправить заявку", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const cookieBanner = page.getByRole("dialog", { name: "Настройки cookie" });
    if (await cookieBanner.isVisible().catch(() => false)) {
      await cookieBanner.getByRole("button", { name: "Только необходимые" }).click();
    }

    await page.getByRole("button", { name: "Рассчитать стоимость" }).first().click();
    await expect(page.getByRole("dialog", { name: "Рассчитать стоимость" })).toBeVisible();

    const dialog = page.getByRole("dialog", { name: "Рассчитать стоимость" });

    // Шаг 1: услуга
    await dialog.getByRole("button", { name: "Регистрация товарных знаков" }).click();
    await dialog.getByRole("button", { name: "Далее" }).click();

    // Шаг 2: кто вы
    await dialog.getByRole("button", { name: "ИП", exact: true }).click();
    await dialog.getByRole("button", { name: "Далее" }).click();

    // Шаг 3: описание задачи (необязательно)
    await dialog.getByRole("button", { name: "Далее" }).click();

    // Шаг 4: документы
    await dialog.getByRole("button", { name: "Нет", exact: true }).click();
    await dialog.getByRole("button", { name: "Далее" }).click();

    // Шаг 5: срочность
    await dialog.getByRole("button", { name: "Сроки гибкие" }).click();
    await dialog.getByRole("button", { name: "Далее" }).click();

    // Шаг 6: способ связи
    await dialog.getByRole("button", { name: "Телефон", exact: true }).click();
    await dialog.getByRole("button", { name: "Далее" }).click();

    // Шаг 7: контакты
    await page.getByLabel("Имя*").fill("Квиз Тестов");
    await page.getByLabel("Телефон*").fill("+7 900 111-22-33");
    await page.getByLabel("Email*").fill("quiz-test@example.com");
    await page.getByLabel(/обработку персональных данных/).check();

    await page.getByRole("button", { name: "Отправить" }).click();
    await expect(page.getByText("Заявка получена")).toBeVisible({ timeout: 10_000 });
    // Никакой "нарисованной" оценки стоимости — только честное сообщение.
    await expect(page.getByText(/от \d+\s*₽/)).toHaveCount(0);
  });
});
