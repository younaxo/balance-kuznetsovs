export interface ApplicationNotificationPayload {
  id: string;
  name: string;
  phone: string | null;
  telegram: string | null;
  email: string | null;
  serviceSlug: string | null;
  /** Человекочитаемое название услуги — резолвится из БД до вызова
   *  провайдера, чтобы форматтеры уведомлений оставались синхронными
   *  и не зависели от репозитория услуг. */
  serviceTitle: string | null;
  message: string | null;
  source: "form" | "quiz";
  /** Ответы квиза «Рассчитать стоимость» — заполнено только при source: "quiz". */
  quizAnswers: Record<string, unknown> | null;
  createdAt: Date;
}

export interface NotificationResult {
  success: boolean;
  error?: string;
}

/**
 * Общий контракт провайдера уведомлений о новой заявке. Реализации
 * (Telegram, SMTP) не должны выбрасывать исключения наружу — любая
 * ошибка перехватывается внутри и превращается в `{ success: false }`,
 * чтобы сбой одного канала не мешал остальным и не ронял сохранение заявки.
 */
export interface NotificationProvider {
  readonly name: string;
  isConfigured(): boolean;
  notifyNewApplication(payload: ApplicationNotificationPayload): Promise<NotificationResult>;
}
