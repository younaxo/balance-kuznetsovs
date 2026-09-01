import "server-only";
import { TelegramNotificationProvider } from "./telegram-provider";
import { EmailNotificationProvider } from "./email-provider";
import { NotificationLogRepository } from "./log-repository";
import type { ApplicationNotificationPayload, NotificationProvider } from "./types";

const providers: NotificationProvider[] = [
  new TelegramNotificationProvider(),
  new EmailNotificationProvider(),
];

export interface DispatchResult {
  telegram?: boolean;
  email?: boolean;
}

/**
 * Рассылает уведомление о заявке во все настроенные каналы независимо
 * друг от друга (Promise.allSettled) — сбой одного провайдера не влияет
 * на другой. Заявка к этому моменту уже сохранена в БД, поэтому эта
 * функция не может привести к потере данных заявки.
 */
export async function dispatchApplicationNotifications(
  payload: ApplicationNotificationPayload,
): Promise<DispatchResult> {
  const result: DispatchResult = {};

  const settled = await Promise.allSettled(
    providers
      .filter((p) => p.isConfigured())
      .map(async (provider) => ({
        name: provider.name,
        outcome: await provider.notifyNewApplication(payload),
      })),
  );

  for (const item of settled) {
    if (item.status !== "fulfilled") {
      console.error("[notifications] provider threw:", item.reason);
      continue;
    }
    const { name, outcome } = item.value;
    if (name === "telegram") result.telegram = outcome.success;
    if (name === "email") result.email = outcome.success;

    if (name === "telegram" || name === "email") {
      await NotificationLogRepository.log({
        channel: name,
        success: outcome.success,
        errorMessage: outcome.error,
        applicationId: payload.id,
      });
    }
  }

  return result;
}
