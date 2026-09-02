import "server-only";
import type { ApplicationInput, QuizSubmissionInput } from "@/server/validation/application";
import { ApplicationRepository, type Application } from "./repository";
import { dispatchApplicationNotifications } from "@/server/notifications";
import { attachAttribution } from "@/server/analytics/attribution";
import { ServiceRepository } from "@/server/services/repository";
import { checkRateLimit } from "@/server/security/rate-limit";
import { verifyTurnstile } from "@/server/security/turnstile";

export interface SubmitContext {
  ipHash: string;
  ctaSource?: string;
}

export type SubmitResult =
  | { ok: true; application: Application }
  | { ok: false; error: "rate_limited" | "spam_detected" | "captcha_failed" };

const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 }; // 5 заявок / 10 минут / IP

/**
 * Сервис приёма заявок. Гарантирует порядок:
 *   1. защита от спама (honeypot, rate limit, Turnstile);
 *   2. надёжное сохранение в PostgreSQL (ApplicationRepository);
 *   3. привязка UTM-атрибуции;
 *   4. рассылка уведомлений (Telegram, email) — best-effort, ошибка
 *      уведомления НЕ откатывает и не помечает заявку как неуспешную.
 */
export const ApplicationService = {
  async submitFromForm(input: ApplicationInput, ctx: SubmitContext): Promise<SubmitResult> {
    if (input.website) {
      // Honeypot сработал — тихо "принимаем" запрос, чтобы не подсказывать
      // боту, что его вычислили, но реально ничего не сохраняем.
      return { ok: false, error: "spam_detected" };
    }

    const rl = checkRateLimit(`application:${ctx.ipHash}`, RATE_LIMIT);
    if (!rl.allowed) {
      return { ok: false, error: "rate_limited" };
    }

    const captchaOk = await verifyTurnstile(input.turnstileToken);
    if (!captchaOk) {
      return { ok: false, error: "captcha_failed" };
    }

    const application = await ApplicationRepository.create({
      name: input.name,
      phone: input.phone || null,
      telegram: input.telegram || null,
      messengerType: input.messengerType,
      email: input.email || null,
      serviceSlug: input.serviceSlug || null,
      message: input.message || null,
      source: "form",
      consentGiven: input.consent,
      consentGivenAt: new Date(),
      ipHash: ctx.ipHash,
      turnstileVerified: Boolean(input.turnstileToken),
    });

    await afterCreate(application, ctx.ctaSource);
    return { ok: true, application };
  },

  async submitFromQuiz(input: QuizSubmissionInput, ctx: SubmitContext): Promise<SubmitResult> {
    if (input.website) {
      return { ok: false, error: "spam_detected" };
    }

    const rl = checkRateLimit(`application:${ctx.ipHash}`, RATE_LIMIT);
    if (!rl.allowed) {
      return { ok: false, error: "rate_limited" };
    }

    const captchaOk = await verifyTurnstile(input.turnstileToken);
    if (!captchaOk) {
      return { ok: false, error: "captcha_failed" };
    }

    const application = await ApplicationRepository.create({
      name: input.name,
      phone: input.phone || null,
      telegram: input.telegram || null,
      messengerType: input.messengerType,
      email: input.email || null,
      serviceSlug: input.quizAnswers.serviceSlug || null,
      message: input.quizAnswers.taskDescription || null,
      quizAnswers: input.quizAnswers,
      source: "quiz",
      consentGiven: input.consent,
      consentGivenAt: new Date(),
      ipHash: ctx.ipHash,
      turnstileVerified: Boolean(input.turnstileToken),
    });

    await afterCreate(application, ctx.ctaSource);
    return { ok: true, application };
  },
};

async function afterCreate(application: Application, ctaSource?: string) {
  await attachAttribution(application.id, ctaSource);

  const service = application.serviceSlug
    ? await ServiceRepository.findBySlug(application.serviceSlug)
    : null;

  const dispatch = await dispatchApplicationNotifications({
    id: application.id,
    name: application.name,
    phone: application.phone,
    telegram: application.telegram,
    messengerType: application.messengerType,
    email: application.email,
    serviceSlug: application.serviceSlug,
    serviceTitle: service?.title ?? null,
    message: application.message,
    source: application.source,
    quizAnswers: application.quizAnswers,
    createdAt: application.createdAt,
  });

  if (dispatch.telegram) {
    await ApplicationRepository.markNotified(application.id, "telegram");
  }
  if (dispatch.email) {
    await ApplicationRepository.markNotified(application.id, "email");
  }
}
