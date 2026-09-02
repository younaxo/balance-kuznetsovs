import "server-only";
import nodemailer from "nodemailer";
import type {
  ApplicationNotificationPayload,
  NotificationProvider,
  NotificationResult,
} from "./types";

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Человекочитаемые подписи для ответов квиза — см. те же значения в
// telegram-provider.ts и quizAnswersSchema (server/validation/application.ts).
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

function buildEmailHtml(payload: ApplicationNotificationPayload): string {
  const service = payload.serviceTitle ?? "не указана";
  const quizAnswers = payload.source === "quiz" ? payload.quizAnswers : null;

  const rows: [string, string | null][] = [
    ["Источник", payload.source === "quiz" ? "Квиз" : "Форма"],
    ["Имя", payload.name],
    ["Телефон", payload.phone],
    [payload.messengerType === "max" ? "MAX" : "Telegram", payload.telegram],
    ["Email", payload.email],
    ["Услуга", service],
    [
      "Кто обращается",
      quizAnswers?.entityType ? (ENTITY_TYPE_LABELS[String(quizAnswers.entityType)] ?? null) : null,
    ],
    [
      "Документы уже есть",
      quizAnswers?.hasExistingDocuments
        ? (HAS_DOCUMENTS_LABELS[String(quizAnswers.hasExistingDocuments)] ?? null)
        : null,
    ],
    [
      "Срочность",
      quizAnswers?.urgency ? (URGENCY_LABELS[String(quizAnswers.urgency)] ?? null) : null,
    ],
    [
      "Предпочтительная связь",
      quizAnswers?.preferredContact
        ? (PREFERRED_CONTACT_LABELS[String(quizAnswers.preferredContact)] ?? null)
        : null,
    ],
    ["Сообщение", payload.message],
  ];

  const rowsHtml = rows
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;">${escapeHtml(label)}</td><td>${escapeHtml(value ?? "")}</td></tr>`,
    )
    .join("");

  return `<div style="font-family:sans-serif;font-size:14px;color:#111;">
    <h2 style="margin:0 0 12px;">Новая заявка — БАЛАНС КУЗНЕЦОВЫ</h2>
    <table>${rowsHtml}</table>
  </div>`;
}

/**
 * Уведомление о заявке через SMTP. Все учётные данные читаются только
 * из окружения (server-only) и никогда не логируются целиком.
 */
export class EmailNotificationProvider implements NotificationProvider {
  readonly name = "email";

  isConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM &&
      process.env.APPLICATION_EMAIL_TO,
    );
  }

  async notifyNewApplication(payload: ApplicationNotificationPayload): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return { success: false, error: "provider not configured" };
    }

    try {
      const port = Number(process.env.SMTP_PORT);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        connectionTimeout: 8000,
        socketTimeout: 8000,
      });

      await transport.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.APPLICATION_EMAIL_TO,
        subject: `Новая заявка: ${payload.name}`,
        html: buildEmailHtml(payload),
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      console.error("[email] notification failed:", message);
      return { success: false, error: message };
    }
  }
}
