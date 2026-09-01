"use client";

/**
 * Клиентское чтение/запись согласия на cookie (согласуется с сервером —
 * src/server/consent/cookies.ts). Cookie bk_consent намеренно НЕ
 * HttpOnly, чтобы баннер согласия мог прочитать его без лишнего запроса.
 *
 * По решению владельца баннер должен появляться заново при каждом новом
 * визите, а не запоминаться на год, как обычно делают — поэтому cookie
 * НЕ имеет max-age/expires: это классическая session-cookie, браузер
 * сам удаляет её при полном закрытии (не просто вкладки — именно
 * браузера/профиля). Пока браузер не закрыт — баннер повторно не
 * всплывает при переходах по сайту и перезагрузках, а после
 * перезапуска браузера — снова спросит.
 */

const COOKIE_NAME = "bk_consent";
export const CONSENT_CHANGE_EVENT = "bk-consent-change";

export interface ConsentState {
  analytics: boolean;
}

export function readStoredConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as ConsentState;
    return { analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
}

/**
 * Немедленно (синхронно) выставляет cookie на клиенте и уведомляет
 * подписчиков (useConsent/useSyncExternalStore) — баннер скрывается без
 * ожидания сетевого ответа. Серверный запрос уходит следом фоном и
 * отвечает за авторитетную запись cookie (см. src/server/consent/cookies.ts)
 * и запись в consent_records; его провал не блокирует UI.
 */
export function submitConsent(analytics: boolean): void {
  // Без max-age/expires — session cookie, см. комментарий в шапке файла.
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify({ analytics }))}; path=/; SameSite=Lax`;

  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: { analytics } }),
  );

  fetch("/api/consent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analytics }),
  }).catch(() => {
    // cookie уже выставлена на клиенте — баннер повторно не появится
    // даже если запись consent_records на сервере не удалась.
  });
}
