"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { ServiceRepository } from "@/server/services/repository";
import { z } from "zod";
import type { AdminActionState } from "@/server/admin/action-state";
import { ILLUSTRATION_KEYS } from "@/components/icons/legal-illustrations";

const upsertSchema = z.object({
  id: z.uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(2000),
  ctaLabel: z.string().trim().min(1).max(100),
  illustration: z.enum(ILLUSTRATION_KEYS),
  order: z.coerce.number().int().default(0),
  isPublished: z.coerce.boolean(),
});

export async function upsertServiceAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const parsed = upsertSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    ctaLabel: formData.get("ctaLabel") || "Заказать услугу",
    illustration: formData.get("illustration") || "contract",
    order: formData.get("order") || 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { id, ...data } = parsed.data;
  if (id) {
    await ServiceRepository.update(id, data);
  } else {
    await ServiceRepository.create(data);
  }
  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteServiceAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false, error: "Некорректный id" };

  await ServiceRepository.remove(id);
  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
  return { ok: true };
}
