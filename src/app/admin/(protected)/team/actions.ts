"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { TeamRepository } from "@/server/team/repository";
import { saveTeamPhoto } from "@/server/team/photo";
import { z } from "zod";
import type { AdminActionState } from "@/server/admin/action-state";

const upsertSchema = z.object({
  id: z.uuid().optional(),
  fullName: z.string().trim().min(1).max(200),
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
    order: formData.get("order") || 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  // Фото — необязательное: если новый файл не выбрали, сохраняем то, что
  // уже было (existingPhotoFilename прилетает скрытым полем из формы).
  // Если нажали "убрать фото" — обнуляем, даже если файл тоже не выбрали.
  const photo = formData.get("photo");
  const existingPhotoFilename = formData.get("existingPhotoFilename");
  const removePhoto = formData.get("removePhoto") === "on";

  let photoFilename: string | null =
    typeof existingPhotoFilename === "string" && existingPhotoFilename
      ? existingPhotoFilename
      : null;

  if (removePhoto) {
    photoFilename = null;
  } else if (photo instanceof File && photo.size > 0) {
    try {
      photoFilename = await saveTeamPhoto(photo);
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось загрузить фото",
      };
    }
  }

  const { id, ...rest } = parsed.data;
  const data = { ...rest, photoFilename };
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
