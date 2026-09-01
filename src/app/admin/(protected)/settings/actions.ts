"use server";

import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  getCurrentAdmin,
  invalidateAllSessionsForUser,
  invalidateSessionById,
  createSession,
  setSessionCookie,
} from "@/server/auth/session";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { db } from "@/server/db/client";
import { adminUsers, adminSessions } from "@/server/db/schema";
import { getClientIp, hashIp } from "@/server/security/ip";
import { headers } from "next/headers";
import type { AdminActionState } from "@/server/admin/action-state";

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

/** Завершить одну сессию из списка "активные сессии" в настройках. */
export async function revokeSessionAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getCurrentAdmin();
  if (!session) return { ok: false, error: "Unauthorized" };

  // Завершение чужой (или своей же) сессии — чувствительное действие,
  // просим подтвердить текущим паролем (защита на случай, если админку
  // на секунду оставили открытой без присмотра).
  const password = formData.get("password");
  if (typeof password !== "string" || !password) {
    return { ok: false, error: "Введите пароль для подтверждения" };
  }
  if (!(await verifyPassword(session.adminUser.passwordHash, password))) {
    return { ok: false, error: "Неверный пароль" };
  }

  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string") return { ok: false, error: "Некорректный id сессии" };

  // Сессия обязательно должна принадлежать текущему пользователю — иначе
  // можно было бы подставить чужой id и завершить сессию другого админа.
  const [row] = await db
    .select({ adminUserId: adminSessions.adminUserId })
    .from(adminSessions)
    .where(eq(adminSessions.id, sessionId))
    .limit(1);
  if (!row || row.adminUserId !== session.adminUser.id) {
    return { ok: false, error: "Сессия не найдена" };
  }

  await invalidateSessionById(sessionId);
  revalidatePath("/admin/settings");
  return { ok: true };
}

const employeeSchema = z.object({
  email: z.email("Некорректный email"),
  password: z.string().min(12, "Пароль должен быть не короче 12 символов"),
  role: z.enum(["owner", "editor"]),
  confirmPassword: z.string().min(1, "Введите пароль для подтверждения"),
});

/** Добавить нового сотрудника с доступом в админку. Только для owner. */
export async function createAdminUserAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getCurrentAdmin();
  if (!session || session.adminUser.role !== "owner") {
    return { ok: false, error: "Добавлять сотрудников может только владелец аккаунта" };
  }

  const parsed = employeeSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "editor",
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля" };
  }

  // Добавление нового человека с доступом в админку — чувствительное
  // действие, просим подтвердить СВОИМ текущим паролем.
  if (!(await verifyPassword(session.adminUser.passwordHash, parsed.data.confirmPassword))) {
    return { ok: false, error: "Неверный пароль" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "Такой email уже зарегистрирован" };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.insert(adminUsers).values({ email, passwordHash, role: parsed.data.role });

  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Включить/выключить доступ сотрудника. Только для owner. */
export async function toggleAdminUserActiveAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await getCurrentAdmin();
  if (!session || session.adminUser.role !== "owner") {
    return { ok: false, error: "Управлять сотрудниками может только владелец аккаунта" };
  }

  const id = formData.get("id");
  const nextActive = formData.get("nextActive") === "true";
  if (typeof id !== "string") return { ok: false, error: "Некорректный id" };

  if (id === session.adminUser.id && !nextActive) {
    return { ok: false, error: "Нельзя выключить самого себя" };
  }

  if (!nextActive) {
    // Не даём выключить последнего активного владельца — иначе управлять
    // сотрудниками станет некому.
    const owners = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(
        and(eq(adminUsers.role, "owner"), eq(adminUsers.isActive, true), ne(adminUsers.id, id)),
      );
    const target = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    if (target[0]?.role === "owner" && owners.length === 0) {
      return { ok: false, error: "Нельзя выключить последнего владельца аккаунта" };
    }
  }

  await db.update(adminUsers).set({ isActive: nextActive }).where(eq(adminUsers.id, id));
  if (!nextActive) await invalidateAllSessionsForUser(id);

  revalidatePath("/admin/settings");
  return { ok: true };
}
