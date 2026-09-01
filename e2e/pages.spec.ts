import { test, expect } from "@playwright/test";

const PAGES: { path: string; heading: string | RegExp }[] = [
  { path: "/services", heading: "Наши услуги" },
  { path: "/152-fz", heading: /152-ФЗ/ },
  { path: "/trademarks", heading: /товарных знаков/i },
  { path: "/prices", heading: "Стоимость наших услуг" },
  { path: "/reviews", heading: "Отзывы клиентов" },
  { path: "/contacts", heading: "Контакты" },
  { path: "/privacy", heading: /персональных данных/i },
  { path: "/confidentiality", heading: /конфиденциальности/i },
  { path: "/offer", heading: /оферта/i },
  { path: "/personal-data-consent", heading: /Согласие/ },
  { path: "/cookies", heading: /cookie/i },
  { path: "/terms", heading: /соглашение/i },
];

for (const { path, heading } of PAGES) {
  test(`${path} открывается и содержит заголовок`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
    // Первая компиляция маршрута в dev-режиме (Turbopack) под параллельной
    // нагрузкой нескольких воркеров может занимать больше стандартных 5с —
    // это особенность dev-сервера, не production (см. `next build` в отчёте).
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading, {
      timeout: 15_000,
    });
  });
}

test("несуществующая страница показывает кастомную 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist-xyz");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Страница не найдена")).toBeVisible();
});
