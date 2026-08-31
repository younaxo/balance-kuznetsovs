"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { ApplicationRepository } from "@/server/applications/repository";
import { applicationStatusUpdateSchema } from "@/server/validation/admin";
import type { AdminActionState } from "@/server/admin/action-state";

export async function updateApplicationStatusAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  // Server Actions уже защищены от CSRF проверкой Origin на уровне Next.js,
  // но повторная проверка авторизации здесь обязательна (defense in depth) —
  // Proxy можно случайно обойти рефакторингом маршрутов, а этот код — нет.
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const parsed = applicationStatusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, error: "Некорректные данные" };

  await ApplicationRepository.updateStatus(parsed.data.id, parsed.data.status);
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${parsed.data.id}`);
  revalidatePath("/admin");
  return { ok: true };
}
