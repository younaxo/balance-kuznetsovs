import "server-only";

/**
 * Защита от CSRF для Route Handlers, изменяющих состояние (POST/PUT/DELETE).
 *
 * Next.js Server Actions уже проверяют заголовок Origin автоматически,
 * но у нас также есть обычные Route Handlers (/api/*), для которых
 * нужна собственная проверка. Подход: сравниваем Origin запроса
 * с ожидаемым origin сайта. Это надёжнее CSRF-токена в связке с
 * cookie SameSite=Lax и не требует хранения токена на клиенте.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Некоторые безопасные клиенты (curl, server-to-server) не шлют Origin —
  // для API, доступных только из браузера, это повод отклонить запрос.
  if (!origin) return false;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}
