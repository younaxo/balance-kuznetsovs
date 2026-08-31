import "server-only";
import { createHmac } from "node:crypto";
import { serverEnv } from "@/lib/env.server";

/**
 * IP-адрес клиента используется ТОЛЬКО для серверного rate limiting
 * (защита от брутфорса и спама) — он никогда не сохраняется в открытом
 * виде и никогда не используется для маркетинговой аналитики.
 *
 * Приложение разворачивается за обратным прокси (nginx/Docker), поэтому
 * реальный адрес приходит в заголовке X-Forwarded-For. Берём первый
 * адрес из цепочки.
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Соленый HMAC-хеш IP-адреса. Соль (ANALYTICS_IP_HASH_SALT) хранится
 * только на сервере — восстановить исходный IP по хешу невозможно.
 */
export function hashIp(ip: string): string {
  const salt = serverEnv.ANALYTICS_IP_HASH_SALT ?? serverEnv.SESSION_SECRET;
  return createHmac("sha256", salt).update(ip).digest("hex");
}
