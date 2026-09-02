import { z } from "zod";

/**
 * Серверная валидация заявки — обязательна независимо от клиентской.
 * Любые данные из формы/квиза считаются недоверенными.
 */

// Услуги полностью редактируются из /admin/services (создаются, удаляются,
// переименовываются владельцем) — поэтому serviceSlug не завязан на
// статичный enum, а просто ограничен по формату/длине. Несуществующий
// slug не представляет угрозы (ApplicationService просто не найдёт
// подходящую услугу при формировании уведомления) — только данные.
const serviceSlugSchema = z
  .string()
  .trim()
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Некорректный идентификатор услуги");

// Достаточно либеральный формат телефона: цифры, пробелы, +, -, (), от 10 знаков.
const phoneRegex = /^[+()\-\s\d]{10,25}$/;
// Telegram-юзернейм: латиница/цифры/подчёркивание, 3-64 символа, опциональный @.
const handleRegex = /^@?[a-zA-Z0-9_]{3,64}$/;

const trimmedString = (max: number) => z.string().trim().max(max);

// Телефон и email — обязательные способы связи (по требованию владельца).
// Telegram остаётся полностью опциональным.
export const applicationBaseSchema = z.object({
  name: trimmedString(200).min(2, "Укажите имя"),
  phone: trimmedString(25).min(1, "Укажите телефон").regex(phoneRegex, "Некорректный телефон"),
  telegram: trimmedString(100)
    .regex(handleRegex, "Некорректный юзернейм")
    .optional()
    .or(z.literal("")),
  // К какому мессенджеру относится поле telegram — переключатель
  // "Telegram / MAX" в форме, значение самого хэндла в поле выше.
  messengerType: z.enum(["telegram", "max"]).default("telegram"),
  email: z.string().trim().min(1, "Укажите email").email("Некорректный email").max(255),
  serviceSlug: serviceSlugSchema.optional(),
  message: trimmedString(4000).optional().or(z.literal("")),
  consent: z.literal(true, "Необходимо согласие на обработку персональных данных"),
  // Honeypot: настоящие пользователи это поле не видят и не заполняют.
  website: z.string().max(0, "Спам-проверка не пройдена").optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
});

export const applicationSchema = applicationBaseSchema;

export type ApplicationInput = z.infer<typeof applicationSchema>;

// --- Квиз «Рассчитать стоимость» ------------------------------------------

export const quizAnswersSchema = z.object({
  serviceSlug: serviceSlugSchema.optional(),
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
  });

export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
