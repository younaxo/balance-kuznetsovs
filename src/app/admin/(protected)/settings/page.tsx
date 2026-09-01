import { getCurrentAdmin, listSessionsForUser, getCurrentSessionId } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { adminUsers } from "@/server/db/schema";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { revokeSessionAction, createAdminUserAction, toggleAdminUserActiveAction } from "./actions";

export const metadata = { title: "Настройки" };

export default async function AdminSettingsPage() {
  const session = await getCurrentAdmin();
  if (!session) return null;

  const [sessions, currentSessionId] = await Promise.all([
    listSessionsForUser(session.adminUser.id),
    getCurrentSessionId(),
  ]);

  const employees = session.adminUser.role === "owner" ? await db.select().from(adminUsers) : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Настройки</h1>
        <p className="text-muted-foreground mt-1 text-sm">{session.adminUser.email}</p>
      </div>

      <section className="border-border bg-surface max-w-sm rounded-lg border p-6">
        <h2 className="font-medium">Смена пароля</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Смените пароль — и все остальные ваши сессии сразу же завершатся.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="border-border bg-surface max-w-xl rounded-lg border p-6">
        <h2 className="font-medium">Активные сессии</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Все устройства, с которых сейчас открыт вход в админку под вашей учёткой.
        </p>
        <ul className="divide-border mt-4 flex flex-col divide-y">
          {sessions.map((s) => {
            const isCurrent = s.id === currentSessionId;
            return (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {s.userAgent ? shortenUserAgent(s.userAgent) : "Неизвестное устройство"}{" "}
                    {isCurrent && <span className="text-accent text-xs">· эта сессия</span>}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Вход:{" "}
                    {new Intl.DateTimeFormat("ru-RU", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(s.createdAt)}
                  </p>
                </div>
                {!isCurrent && (
                  <AdminForm action={revokeSessionAction}>
                    <input type="hidden" name="sessionId" value={s.id} />
                    <AdminSubmitButton variant="destructive" pendingLabel="Завершение…">
                      Завершить
                    </AdminSubmitButton>
                  </AdminForm>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {session.adminUser.role === "owner" && (
        <section className="border-border bg-surface max-w-xl rounded-lg border p-6">
          <h2 className="font-medium">Сотрудники</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            У кого есть свой вход в админку. Выключить доступ можно в любой момент — учётка
            останется, просто перестанет пускать.
          </p>

          <ul className="divide-border mt-4 flex flex-col divide-y">
            {employees.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {e.email}{" "}
                    <span className="text-muted-foreground text-xs">
                      · {e.role === "owner" ? "владелец" : "редактор"}
                      {!e.isActive && " · выключен"}
                    </span>
                  </p>
                </div>
                <AdminForm action={toggleAdminUserActiveAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="nextActive" value={String(!e.isActive)} />
                  <AdminSubmitButton
                    variant={e.isActive ? "destructive" : "ghost"}
                    pendingLabel="Сохранение…"
                  >
                    {e.isActive ? "Выключить" : "Включить"}
                  </AdminSubmitButton>
                </AdminForm>
              </li>
            ))}
          </ul>

          <div className="border-border mt-6 border-t pt-6">
            <h3 className="text-sm font-medium">Добавить сотрудника</h3>
            <AdminForm action={createAdminUserAction} resetOnSuccess className="mt-3 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Пароль (от 12 символов)"
                  minLength={12}
                  required
                  className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <Select name="role" defaultValue="editor">
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Редактор</SelectItem>
                    <SelectItem value="owner">Владелец</SelectItem>
                  </SelectContent>
                </Select>
                <AdminSubmitButton pendingLabel="Добавление…" className="ml-auto">
                  Добавить
                </AdminSubmitButton>
              </div>
            </AdminForm>
          </div>
        </section>
      )}

      <section className="border-border-strong text-muted-foreground max-w-sm rounded-lg border border-dashed p-6 text-sm">
        Двухфакторная аутентификация (2FA) пока не подключена. Схема таблиц (admin_users/
        admin_sessions) готова к её добавлению без переделки.
      </section>
    </div>
  );
}

function shortenUserAgent(ua: string): string {
  // Простой, без библиотек: вытаскиваем узнаваемое имя браузера/ОС из
  // строки User-Agent, не показывая её целиком (она длинная и нечитаемая).
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua) && !/Chrome\//.test(ua)
          ? "Safari"
          : "Браузер";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser}, ${os}` : browser;
}
