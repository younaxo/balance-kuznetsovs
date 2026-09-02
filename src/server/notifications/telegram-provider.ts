import "server-only";
import { getPingUsernames } from "./ping";
import type {
  ApplicationNotificationPayload,
  NotificationProvider,
  NotificationResult,
} from "./types";

const TELEGRAM_API_TIMEOUT_MS = 8000;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Человекочитаемые подписи для ответов квиза «Рассчитать стоимость» —
// serviceSlug и taskDescription сюда не входят, они уже показаны через
// payload.serviceTitle/payload.message (совпадают по смыслу, дублировать
// незачем). См. quizAnswersSchema в server/validation/application.ts —
// значения enum'ов должны совпадать с теми, что описаны там.
const ENTITY_TYPE_LABELS: Record<string, string> = {
  individual: "Физическое лицо",
  sole_proprietor: "ИП",
  llc: "ООО",
  other: "Другое",
};
const HAS_DOCUMENTS_LABELS: Record<string, string> = {
  yes: "Да, есть",
  no: "Нет",
  not_sure: "Не уверен(а)",
};
const URGENCY_LABELS: Record<string, string> = {
  urgent: "Срочно",
  standard: "В обычном режиме",
  flexible: "Сроки гибкие",
};
const PREFERRED_CONTACT_LABELS: Record<string, string> = {
  phone: "Телефон",
  telegram: "Telegram",
  email: "Email",
};

function formatQuizAnswers(quizAnswers: Record<string, unknown> | null): string | null {
  if (!quizAnswers) return null;

  const lines = [
    quizAnswers.entityType
      ? `Кто обращается: ${ENTITY_TYPE_LABELS[String(quizAnswers.entityType)] ?? escapeHtml(String(quizAnswers.entityType))}`
      : null,
    quizAnswers.hasExistingDocuments
      ? `Документы уже есть: ${HAS_DOCUMENTS_LABELS[String(quizAnswers.hasExistingDocuments)] ?? escapeHtml(String(quizAnswers.hasExistingDocuments))}`
      : null,
    quizAnswers.urgency
      ? `Срочность: ${URGENCY_LABELS[String(quizAnswers.urgency)] ?? escapeHtml(String(quizAnswers.urgency))}`
      : null,
    quizAnswers.preferredContact
      ? `Предпочтительная связь: ${PREFERRED_CONTACT_LABELS[String(quizAnswers.preferredContact)] ?? escapeHtml(String(quizAnswers.preferredContact))}`
      : null,
  ].filter(Boolean);

  return lines.length > 0 ? lines.join("\n") : null;
}

// MAX — не Telegram: "@handle" там не настоящий Telegram-юзернейм, и
// если оставить его голым текстом, клиент Telegram всё равно подсветит
// его как кликабельное упоминание/ссылку на несуществующий (или чужой)
// telegram-аккаунт — вводит в заблуждение. <code> отключает разбор
// сущностей для этого куска и просто показывает моноширинный текст.
// Для реального Telegram-контакта, наоборот, кликабельное упоминание —
// это ровно то, что нужно, поэтому там оставляем как есть.
function formatContact(telegram: string, messengerType: "telegram" | "max"): string {
  return messengerType === "max"
    ? `MAX: <code>${escapeHtml(telegram)}</code>`
    : `Telegram: ${escapeHtml(telegram)}`;
}

function buildMessage(payload: ApplicationNotificationPayload, ping: string[]): string {
  const service = payload.serviceTitle ?? "не указана";
  const quizAnswers = payload.source === "quiz" ? formatQuizAnswers(payload.quizAnswers) : null;

  const lines = [
    `🆕 <b>Новая заявка (${payload.source === "quiz" ? "квиз" : "форма"})</b>`,
    `Имя: <code>${escapeHtml(payload.name)}</code>`,
    payload.phone ? `Телефон: ${escapeHtml(payload.phone)}` : null,
    payload.telegram ? formatContact(payload.telegram, payload.messengerType) : null,
    payload.email ? `Email: ${escapeHtml(payload.email)}` : null,
    `Услуга: <code>${escapeHtml(service)}</code>`,
    quizAnswers ? `\nОтветы квиза:\n${quizAnswers}` : null,
    payload.message ? `\nСообщение:\n<pre>${escapeHtml(payload.message)}</pre>` : null,
  ].filter(Boolean);

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
      const ping = await getPingUsernames();
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: buildMessage(payload, ping),
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
