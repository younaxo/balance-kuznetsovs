"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { TeamRepository } from "@/server/team/repository";
import { z } from "zod";
import type { AdminActionState } from "@/server/admin/action-state";

const upsertSchema = z.object({
  id: z.uuid().optional(),
  fullName: z.string().trim().min(1).max(200),
  // Имя файла в public/team/ — файл кладётся на сервер вручную (см.
  // README, раздел «Фото команды»), поле здесь только запоминает имя.
  photoFilename: z
    .string()
    .trim()
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, "Только латиница, цифры, точка, дефис и подчёркивание")
    .optional()
    .or(z.literal("")),
  order: z.coerce.number().int().default(0),
  isPublished: z.coerce.boolean(),
});

export async function upsertTeamMemberAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const parsed = upsertSchema.safeParse({
    id: formData.get("id") || undefined,
    fullName: formData.get("fullName"),
    photoFilename: formData.get("photoFilename") || "",
    order: formData.get("order") || 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { id, photoFilename, ...rest } = parsed.data;
  const data = { ...rest, photoFilename: photoFilename || null };
  if (id) {
    await TeamRepository.update(id, data);
  } else {
    await TeamRepository.create(data);
  }
  revalidatePath("/admin/team");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTeamMemberAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false, error: "Некорректный id" };

  await TeamRepository.remove(id);
  revalidatePath("/admin/team");
  revalidatePath("/", "layout");
  return { ok: true };
}
