import { describe, it, expect } from "vitest";
import { applicationSchema, quizSubmissionSchema } from "@/server/validation/application";

describe("applicationSchema", () => {
  const base = {
    name: "Иван Иванов",
    consent: true as const,
    website: "",
  };

  it("отклоняет заявку без согласия", () => {
    const result = applicationSchema.safeParse({ ...base, consent: false, phone: "+79001234567" });
    expect(result.success).toBe(false);
  });

  it("отклоняет заявку без единого способа связи", () => {
    const result = applicationSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it("принимает заявку с одним телефоном", () => {
    const result = applicationSchema.safeParse({ ...base, phone: "+7 900 123-45-67" });
    expect(result.success).toBe(true);
  });

  it("принимает заявку только с email", () => {
    const result = applicationSchema.safeParse({ ...base, email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("отклоняет некорректный email", () => {
    const result = applicationSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("принимает произвольный корректно оформленный serviceSlug (услуги полностью управляются из админки)", () => {
    const result = applicationSchema.safeParse({
      ...base,
      phone: "+79001234567",
      serviceSlug: "totally-made-up-service",
    });
    expect(result.success).toBe(true);
  });

  it("отклоняет serviceSlug некорректного формата (не latin/цифры/дефис)", () => {
    const result = applicationSchema.safeParse({
      ...base,
      phone: "+79001234567",
      serviceSlug: "Некорректный Slug!",
    });
    expect(result.success).toBe(false);
  });

  it("отклоняет заполненное honeypot-поле (спам-бот)", () => {
    const result = applicationSchema.safeParse({
      ...base,
      phone: "+79001234567",
      website: "http://spam.example",
    });
    expect(result.success).toBe(false);
  });

  it("отклоняет слишком длинное сообщение (защита от oversized payload)", () => {
    const result = applicationSchema.safeParse({
      ...base,
      phone: "+79001234567",
      message: "a".repeat(5000),
    });
    expect(result.success).toBe(false);
  });

  it("не падает и просто хранит script-подобный ввод как обычный текст", () => {
    const result = applicationSchema.safeParse({
      ...base,
      phone: "+79001234567",
      message: "<script>alert(1)</script>",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toContain("<script>");
    }
  });
});

describe("quizSubmissionSchema", () => {
  it("принимает валидный ответ квиза с consultation-заглушкой услуги", () => {
    const result = quizSubmissionSchema.safeParse({
      name: "Пётр",
      phone: "+79001234567",
      consent: true,
      website: "",
      quizAnswers: { serviceSlug: "consultation", urgency: "urgent" },
    });
    expect(result.success).toBe(true);
  });

  it("отклоняет квиз без контактов", () => {
    const result = quizSubmissionSchema.safeParse({
      name: "Пётр",
      consent: true,
      website: "",
      quizAnswers: {},
    });
    expect(result.success).toBe(false);
  });
});
