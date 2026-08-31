/**
 * Безопасные внешние редиректы (/go/:slug).
 *
 * Модуль намеренно разделён на две части:
 *  - `isSafeExternalUrl` — чистая функция без побочных эффектов,
 *    полностью юнит-тестируемая, без обращения к БД;
 *  - `resolveTrackedDestination` — серверная часть с обращением к
 *    таблице `tracked_destinations` (allowlist).
 *
 * Важно: slug НИКОГДА не принимает произвольный URL от пользователя
 * (никаких /go?url=...). Единственный источник URL — заранее
 * зарегистрированная запись в БД по ключу slug.
 */

const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

/**
 * Проверяет, что строка — это абсолютный http(s)-URL без опасных схем
 * (javascript:, data:, vbscript:, file:) и без protocol-relative формы
 * (`//evil.example`), которую браузер трактует как абсолютный URL.
 */
export function isSafeExternalUrl(candidate: string): boolean {
  const trimmed = candidate.trim();
  if (!trimmed) return false;

  // Явно отсекаем protocol-relative URL — `new URL('//x', base)` их
  // "чинит" в абсолютный, поэтому их нужно поймать до парсинга.
  if (trimmed.startsWith("//")) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return false;
  if (!parsed.hostname) return false;

  return true;
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}
