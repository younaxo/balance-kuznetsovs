"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { contactSettings } from "@/server/db/schema";
import { contactSettingsUpdateSchema } from "@/server/validation/admin";

export async function updateContactSettingsAction(formData: FormData): Promise<void> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");

  const parsed = contactSettingsUpdateSchema.safeParse({
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
    telegram: formData.get("telegram") || "",
    maxMessenger: formData.get("maxMessenger") || "",
    address: formData.get("address") || "",
    workingHours: formData.get("workingHours") || "",
    operatorFullName: formData.get("operatorFullName") || "",
    operatorInn: formData.get("operatorInn") || "",
    operatorOgrn: formData.get("operatorOgrn") || "",
    operatorAddress: formData.get("operatorAddress") || "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Некорректные данные");

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
}
