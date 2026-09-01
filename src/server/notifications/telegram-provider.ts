import "server-only";
import type {
  ApplicationNotificationPayload,
  NotificationProvider,
  NotificationResult,
} from "./types";

const TELEGRAM_API_TIMEOUT_MS = 8000;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Кому пинговать в чате при новой заявке — список @юзернеймов через
 * запятую в TELEGRAM_PING_USERNAMES (необязательно). Обычный текст
 * "@username" в сообщении Telegram и так подсвечивается кликабельно и
 * присылает уведомление тому пользователю, если бот с ним знаком по
 * этому чату — отдельного API для "пинга" не нужно.
 */
function pingUsernames(): string[] {
  const raw = process.env.TELEGRAM_PING_USERNAMES;
  if (!raw) return [];
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u) => (u.startsWith("@") ? u : `@${u}`));
}

function buildMessage(payload: ApplicationNotificationPayload): string {
  const service = payload.serviceTitle ?? "не указана";

  const lines = [
    `🆕 <b>Новая заявка (${payload.source === "quiz" ? "квиз" : "форма"})</b>`,
    `Имя: <code>${escapeHtml(payload.name)}</code>`,
    payload.phone ? `Телефон: ${escapeHtml(payload.phone)}` : null,
    payload.telegram ? `Telegram: ${escapeHtml(payload.telegram)}` : null,
    payload.email ? `Email: ${escapeHtml(payload.email)}` : null,
    `Услуга: <code>${escapeHtml(service)}</code>`,
    payload.message ? `\nСообщение:\n<pre>${escapeHtml(payload.message)}</pre>` : null,
  ].filter(Boolean);

  const ping = pingUsernames();
  if (ping.length > 0) {
    lines.push("", ping.join(" "));
  }

  return lines.join("\n");
}

/**
 * Уведомление о заявке через Telegram Bot API.
 *
 * TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID читаются только на сервере
 * (server-only) и никогда не попадают в клиентский бандл, логи или
 * тела ответов. При отсутствии конфигурации провайдер считается
 * неактивным — приложение продолжает работать (graceful degradation).
 */
export class TelegramNotificationProvider implements NotificationProvider {
  readonly name = "telegram";

  isConfigured(): boolean {
    return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  }

  async notifyNewApplication(payload: ApplicationNotificationPayload): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "provider not configured" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TELEGRAM_API_TIMEOUT_MS);

    try {
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: buildMessage(payload),
          parse_mode: "HTML",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // Не логируем тело ответа целиком — оно может содержать chat_id.
        console.error(`[telegram] sendMessage failed: HTTP ${response.status}`);
        return { success: false, error: `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.error("[telegram] notification failed:", message);
      return { success: false, error: message };
    } finally {
      clearTimeout(timeout);
    }
  }
}
