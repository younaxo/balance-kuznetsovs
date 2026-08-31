"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  getCurrentAdmin,
  invalidateAllSessionsForUser,
  createSession,
  setSessionCookie,
} from "@/server/auth/session";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { db } from "@/server/db/client";
import { adminUsers } from "@/server/db/schema";
import { getClientIp, hashIp } from "@/server/security/ip";
import { headers } from "next/headers";

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(12, "Новый пароль должен быть не короче 12 символов"),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await getCurrentAdmin();
  if (!session) return { error: "Требуется авторизация" };

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте поля" };
  }

  const validCurrent = await verifyPassword(
    session.adminUser.passwordHash,
    parsed.data.currentPassword,
  );
  if (!validCurrent) {
    return { error: "Текущий пароль неверен" };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await db
    .update(adminUsers)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(adminUsers.id, session.adminUser.id));

  // Инвалидируем все сессии (включая текущую) и выдаём новую — так
  // смена пароля гарантированно "выкидывает" все другие активные входы.
  await invalidateAllSessionsForUser(session.adminUser.id);

  const headerList = await headers();
  const ipHash = hashIp(getClientIp(headerList));
  const { token, expiresAt } = await createSession({
    adminUserId: session.adminUser.id,
    ipHash,
    userAgent: headerList.get("user-agent") ?? undefined,
  });
  await setSessionCookie(token, expiresAt);

  return { success: true };
}
