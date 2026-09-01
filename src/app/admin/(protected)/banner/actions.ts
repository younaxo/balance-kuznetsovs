"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { siteBanner } from "@/server/db/schema";
import { saveBannerImage } from "@/server/content/banner-image";
import { z } from "zod";
import type { AdminActionState } from "@/server/admin/action-state";

const schema = z.object({
  enabled: z.coerce.boolean(),
  text: z.string().trim().max(500).optional().or(z.literal("")),
  buttonLabel: z.string().trim().max(100).optional().or(z.literal("")),
  buttonHref: z.string().trim().max(2000).optional().or(z.literal("")),
});

// Имя файла — только то, что реально мог сгенерировать saveBannerImage()
// (uuid + расширение). existingImageFilename приходит скрытым полем из
// формы и в теории может быть подменено на клиенте — без этой проверки
// туда можно было бы протащить "../../что-угодно" и получить path
// traversal в <img src> на публичном сайте (site-banner.tsx).
const safeFilenameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9._-]+$/, "Некорректное имя файла")
  .max(255);

export async function updateSiteBannerAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const parsed = schema.safeParse({
    enabled: formData.get("enabled") === "on",
    text: formData.get("text") || "",
    buttonLabel: formData.get("buttonLabel") || "",
    buttonHref: formData.get("buttonHref") || "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const image = formData.get("image");
  const existingImageFilenameRaw = formData.get("existingImageFilename");
  const removeImage = formData.get("removeImage") === "on";

  let imageFilename: string | null = null;
  if (typeof existingImageFilenameRaw === "string" && existingImageFilenameRaw) {
    const existingCheck = safeFilenameSchema.safeParse(existingImageFilenameRaw);
    if (!existingCheck.success) {
      return { ok: false, error: "Некорректное имя файла иконки" };
    }
    imageFilename = existingCheck.data;
  }

  if (removeImage) {
    imageFilename = null;
  } else if (image instanceof File && image.size > 0) {
    try {
      imageFilename = await saveBannerImage(image);
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось загрузить изображение",
      };
    }
  }

  const { enabled, text, buttonLabel, buttonHref } = parsed.data;
  await db
    .insert(siteBanner)
    .values({
      id: "default",
      enabled,
      text: text || null,
      buttonLabel: buttonLabel || null,
      buttonHref: buttonHref || null,
      imageFilename,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteBanner.id,
      set: {
        enabled,
        text: text || null,
        buttonLabel: buttonLabel || null,
        buttonHref: buttonHref || null,
        imageFilename,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/banner");
  revalidatePath("/", "layout");
  return { ok: true };
}
