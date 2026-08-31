import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Ограничиваем воркеров: next dev (Turbopack) под большой параллельной
  // нагрузкой от многих воркеров периодически отдавал сетевые сбои —
  // с 4 воркерами локальный dev-сервер стабилен.
  workers: process.env.CI ? 1 : 4,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Детерминированные тесты: сайт уважает prefers-reduced-motion
    // (см. MotionProvider/globals.css), поэтому здесь анимации отключены —
    // это также автоматически проверяет, что reduced-motion реально работает.
    contextOptions: {
      reducedMotion: "reduce",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // В CI гоняем собранный production-сервер (быстрее и стабильнее под
    // параллельными воркерами, чем Turbopack dev) — сборка уже выполнена
    // отдельным шагом workflow до запуска тестов.
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Turnstile отключаем именно для сервера, который поднимает Playwright:
    // виджет — реальный вызов к Cloudflare, и тесты не должны зависеть от
    // сети/тайминга ответа стороннего сервиса. verifyTurnstile() без
    // TURNSTILE_SECRET_KEY считает проверку пройденной автоматически.
    env: {
      TURNSTILE_SECRET_KEY: "",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
    },
  },
});
