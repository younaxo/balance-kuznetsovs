"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { contactSettings } from "@/server/db/schema";
import { contactSettingsUpdateSchema } from "@/server/validation/admin";
import type { AdminActionState } from "@/server/admin/action-state";

export async function updateContactSettingsAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const parsed = contactSettingsUpdateSchema.safeParse({
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    telegram: formData.get("telegram") || "",
    maxMessenger: formData.get("maxMessenger") || "",
    address: formData.get("address") || "",
    workingHours: formData.get("workingHours") || "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value || null]),
  );

  await db
    .insert(contactSettings)
    .values({ id: "default", ...data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: contactSettings.id, set: { ...data, updatedAt: new Date() } });

  revalidatePath("/admin/contacts");
  // Контакты показываются в футере, который рендерится в корневом layout
  // на КАЖДОЙ странице — revalidatePath с type "layout" пересчитывает
  // весь сайт, а не только явно перечисленные маршруты.
  revalidatePath("/", "layout");
  return { ok: true };
}
