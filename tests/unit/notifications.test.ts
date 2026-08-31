import { describe, it, expect, vi, afterEach } from "vitest";
import { TelegramNotificationProvider } from "@/server/notifications/telegram-provider";
import { EmailNotificationProvider } from "@/server/notifications/email-provider";

const basePayload = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Иван Иванов",
  phone: "+79001234567",
  telegram: null,
  email: null,
  serviceSlug: null,
  serviceTitle: null,
  message: null,
  source: "form" as const,
  createdAt: new Date(),
};

describe("TelegramNotificationProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
  });

  it("считается неактивным без токена/chat_id и не делает сетевых вызовов", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const provider = new TelegramNotificationProvider();
    expect(provider.isConfigured()).toBe(false);

    const result = await provider.notifyNewApplication(basePayload);
    expect(result.success).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("не выбрасывает исключение при сбое сети — возвращает success: false", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "12345";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const provider = new TelegramNotificationProvider();
    const result = await provider.notifyNewApplication(basePayload);
    expect(result.success).toBe(false);
    expect(result.error).toContain("network down");
  });

  it("возвращает success: true при успешном ответе Telegram API", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "12345";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );

    const provider = new TelegramNotificationProvider();
    const result = await provider.notifyNewApplication(basePayload);
    expect(result.success).toBe(true);
  });
});

describe("EmailNotificationProvider", () => {
  afterEach(() => {
    for (const key of [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "SMTP_FROM",
      "APPLICATION_EMAIL_TO",
    ]) {
      delete process.env[key];
    }
  });

  it("считается неактивным без полного набора SMTP-переменных", () => {
    process.env.SMTP_HOST = "smtp.example.com";
    const provider = new EmailNotificationProvider();
    expect(provider.isConfigured()).toBe(false);
  });

  it("не выбрасывает исключение и возвращает success: false, если провайдер не настроен", async () => {
    const provider = new EmailNotificationProvider();
    const result = await provider.notifyNewApplication(basePayload);
    expect(result.success).toBe(false);
  });
});
