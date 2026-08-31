import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 6000;

/**
 * Проверка Cloudflare Turnstile. Если TURNSTILE_SECRET_KEY не задан —
 * функция считает проверку пройденной (turnstile отключён на этом
 * окружении, например локальная разработка), чтобы форма продолжала
 * работать без ключей. В production рекомендуется задать ключи.
 *
 * Читает process.env напрямую (а не общий serverEnv) — это осознанное
 * решение ради тестируемости (юнит-тесты переключают ключ в рантайме)
 * и не влияет на безопасность: значение всё равно server-only.
 */
export async function verifyTurnstile(token: string | undefined): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true;
  if (!token) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.error("[turnstile] verification failed:", error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
