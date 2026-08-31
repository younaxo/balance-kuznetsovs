import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@balance-kuznetsovs.local";
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD ?? "ChangeMe12345Secure";

test.describe("Админ-панель", () => {
  test("неавторизованный доступ к /admin закрыт редиректом на логин", async ({ page }) => {
    const response = await page.goto("/admin");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("вход с неверным паролем показывает общую ошибку", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Пароль").fill("definitely-wrong-password");
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page.getByText("Неверный email или пароль.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("вход с верными данными открывает дашборд", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Пароль").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Дашборд" })).toBeVisible();
  });

  test("список заявок открывается после входа", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Пароль").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("navigation").getByRole("link", { name: "Заявки", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/applications$/);
    await expect(page.getByRole("heading", { name: "Заявки" })).toBeVisible();
  });

  test("выход завершает сессию и закрывает доступ к /admin", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Пароль").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByRole("button", { name: "Выйти" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
