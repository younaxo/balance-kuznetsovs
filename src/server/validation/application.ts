import { z } from "zod";
import { SERVICE_SLUGS } from "@/domain/services";

/**
 * Серверная валидация заявки — обязательна независимо от клиентской.
 * Любые данные из формы/квиза считаются недоверенными.
 */

// Достаточно либеральный формат телефона: цифры, пробелы, +, -, (), от 10 знаков.
const phoneRegex = /^[+()\-\s\d]{10,25}$/;
// Telegram/MAX-юзернейм: латиница/цифры/подчёркивание, 3-64 символа, опциональный @.
const handleRegex = /^@?[a-zA-Z0-9_]{3,64}$/;

const trimmedString = (max: number) => z.string().trim().max(max);

export const applicationBaseSchema = z.object({
  name: trimmedString(200).min(2, "Укажите имя"),
  phone: trimmedString(25).regex(phoneRegex, "Некорректный телефон").optional().or(z.literal("")),
  telegram: trimmedString(100)
    .regex(handleRegex, "Некорректный Telegram/MAX")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Некорректный email").max(255).optional().or(z.literal("")),
  serviceSlug: z.enum(SERVICE_SLUGS).optional(),
  message: trimmedString(4000).optional().or(z.literal("")),
  consent: z.literal(true, "Необходимо согласие на обработку персональных данных"),
  // Honeypot: настоящие пользователи это поле не видят и не заполняют.
  website: z.string().max(0, "Спам-проверка не пройдена").optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
});

export const applicationSchema = applicationBaseSchema.refine(
  (data) => Boolean(data.phone || data.telegram || data.email),
  {
    error: "Укажите хотя бы один способ связи: телефон, Telegram/MAX или email",
    path: ["phone"],
  },
);

export type ApplicationInput = z.infer<typeof applicationSchema>;

// --- Квиз «Рассчитать стоимость» ------------------------------------------

export const quizAnswersSchema = z.object({
  // "consultation" — отдельное значение для варианта «Пока не знаю» в квизе,
  // это не реальная услуга из каталога, поэтому не входит в SERVICE_SLUGS.
  serviceSlug: z.enum([...SERVICE_SLUGS, "consultation"]).optional(),
  entityType: z.enum(["individual", "sole_proprietor", "llc", "other"]).optional(),
  taskDescription: trimmedString(2000).optional().or(z.literal("")),
  hasExistingDocuments: z.enum(["yes", "no", "not_sure"]).optional(),
  urgency: z.enum(["urgent", "standard", "flexible"]).optional(),
  preferredContact: z.enum(["phone", "telegram", "email"]).optional(),
});

export const quizSubmissionSchema = applicationBaseSchema
  .omit({ serviceSlug: true, message: true })
  .extend({
    quizAnswers: quizAnswersSchema,
  })
  .refine((data) => Boolean(data.phone || data.telegram || data.email), {
    error: "Укажите хотя бы один способ связи: телефон, Telegram/MAX или email",
    path: ["phone"],
  });

export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
