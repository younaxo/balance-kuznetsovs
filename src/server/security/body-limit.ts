/**
 * Безопасное чтение JSON-тела запроса с ограничением размера.
 * Next.js Route Handlers не ограничивают тело запроса самостоятельно —
 * без этой проверки клиент мог бы прислать произвольно большой payload.
 */
export async function readJsonBodySafely(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; data: unknown } | { ok: false; reason: "too_large" | "invalid_json" }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    return { ok: false, reason: "too_large" };
  }

  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}
