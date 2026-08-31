"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { ApplicationRepository } from "@/server/applications/repository";
import { applicationStatusUpdateSchema } from "@/server/validation/admin";

export async function updateApplicationStatusAction(formData: FormData): Promise<void> {
  // Server Actions уже защищены от CSRF проверкой Origin на уровне Next.js,
  // но повторная проверка авторизации здесь обязательна (defense in depth) —
  // Proxy можно случайно обойти рефакторингом маршрутов, а этот код — нет.
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");

  const parsed = applicationStatusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("Некорректные данные");

  await ApplicationRepository.updateStatus(parsed.data.id, parsed.data.status);
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${parsed.data.id}`);
  revalidatePath("/admin");
}
