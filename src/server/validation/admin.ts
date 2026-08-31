import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Некорректный email").max(255),
  password: z.string().min(1, "Введите пароль").max(200),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const applicationStatusUpdateSchema = z.object({
  id: z.uuid(),
  status: z.enum(["new", "in_progress", "completed", "archived"]),
});

export const reviewUpsertSchema = z.object({
  id: z.uuid().optional(),
  authorName: z.string().trim().min(1).max(200),
  text: z.string().trim().min(1).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
  source: z.enum(["avito", "manual"]),
  sourceUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  reviewedAt: z.string().datetime().optional().or(z.literal("")),
  isPublished: z.boolean(),
});

export const priceItemUpsertSchema = z.object({
  id: z.uuid().optional(),
  serviceSlug: z.string().trim().max(100).optional().or(z.literal("")),
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priceFromKopecks: z.number().int().positive().optional(),
  unit: z.string().trim().max(100).optional().or(z.literal("")),
  order: z.number().int().default(0),
  isPublished: z.boolean(),
});

export const contactSettingsUpdateSchema = z.object({
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  telegram: z.string().trim().max(150).optional().or(z.literal("")),
  maxMessenger: z.string().trim().max(150).optional().or(z.literal("")),
  address: z.string().trim().max(1000).optional().or(z.literal("")),
  workingHours: z.string().trim().max(255).optional().or(z.literal("")),
  operatorFullName: z.string().trim().max(1000).optional().or(z.literal("")),
  operatorInn: z.string().trim().max(20).optional().or(z.literal("")),
  operatorOgrn: z.string().trim().max(20).optional().or(z.literal("")),
  operatorAddress: z.string().trim().max(1000).optional().or(z.literal("")),
});
