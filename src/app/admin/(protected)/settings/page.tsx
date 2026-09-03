import { eq } from "drizzle-orm";
import { getCurrentAdmin, listSessionsForUser, getCurrentSessionId } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { adminUsers, notificationSettings } from "@/server/db/schema";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { RevokeSessionForm } from "@/components/admin/revoke-session-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  createAdminUserAction,
  toggleAdminUserActiveAction,
  updateOwnPingSettingsAction,
  updateGlobalPingSettingAction,
  toggleEmployeePingAction,
} from "./actions";

export const metadata = {};

export default async function AdminSettingsPage() {
  const session = await getCurrentAdmin();
  if (!session) return null;

  const [sessions, currentSessionId] = await Promise.all([
    listSessionsForUser(session.adminUser.id),
    getCurrentSessionId(),
  ]);

  const employees = session.adminUser.role === "owner" ? await db.select().from(adminUsers) : [];

  const [globalPing] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.id, "default"))
    .limit(1);
  const pingAllEnabled = globalPing?.pingAllEnabled ?? true;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Настройки</h1>
        <p className="text-muted-foreground mt-1 text-sm">{session.adminUser.email}</p>
      </div>

      <section className="border-border bg-surface max-w-sm rounded-lg border p-6">
        <h2 className="font-medium">Смена пароля</h2>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="border-border bg-surface max-w-sm rounded-lg border p-6">
        <h2 className="font-medium">Telegram-упоминания</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Ваш юзернейм, чтобы бот упоминал вас в чате при новой заявке.
        </p>
        <AdminForm action={updateOwnPingSettingsAction} className="mt-4 grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Telegram-юзернейм</span>
            <input
              name="telegramUsername"
              defaultValue={session.adminUser.telegramUsername ?? ""}
              placeholder="@username"
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="pingEnabled" defaultChecked={session.adminUser.pingEnabled} />
            Упоминать меня при новой заявке
          </label>
          <AdminSubmitButton pendingLabel="Сохранение…" className="w-fit">
            Сохранить
          </AdminSubmitButton>
        </AdminForm>

        {session.adminUser.role === "owner" && (
          <div className="border-border mt-6 border-t pt-5">
            <AdminForm action={updateGlobalPingSettingAction}>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="pingAllEnabled" defaultChecked={pingAllEnabled} />
                Упоминать всех при новой заявке (общий выключатель)
              </label>
              <AdminSubmitButton pendingLabel="Сохранение…" className="mt-3 w-fit">
                Сохранить
              </AdminSubmitButton>
            </AdminForm>
          </div>
        )}
      </section>

      <section className="border-border bg-surface max-w-xl rounded-lg border p-6">
        <h2 className="font-medium">Активные сессии</h2>
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
                  <RevokeSessionForm
                    sessionId={s.id}
                    deviceLabel={s.userAgent ? shortenUserAgent(s.userAgent) : "Это устройство"}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {session.adminUser.role === "owner" && (
        <section className="border-border bg-surface max-w-xl rounded-lg border p-6">
          <h2 className="font-medium">Сотрудники</h2>

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
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {e.telegramUsername ? e.telegramUsername : "Telegram не указан"} ·{" "}
                    {e.pingEnabled ? "упоминание включено" : "упоминание выключено"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AdminForm action={toggleEmployeePingAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="nextPingEnabled" value={String(!e.pingEnabled)} />
                    <AdminSubmitButton variant="ghost" pendingLabel="…">
                      {e.pingEnabled ? "Не упоминать" : "Упоминать"}
                    </AdminSubmitButton>
                  </AdminForm>
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
                </div>
              </li>
            ))}
          </ul>

          <div className="border-border mt-6 border-t pt-6">
            <h3 className="text-sm font-medium">Добавить сотрудника</h3>
            <AdminForm action={createAdminUserAction} resetOnSuccess className="mt-3 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Email сотрудника</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="mail@example.com"
                    required
                    className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium">Пароль сотрудника</span>
                  <input
                    name="password"
                    type="password"
                    placeholder="от 10 символов"
                    minLength={10}
                    required
                    className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Роль</span>
                <Select name="role" defaultValue="editor">
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Редактор</SelectItem>
                    <SelectItem value="owner">Владелец</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Ваш пароль (подтверждение)</span>
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="чтобы подтвердить, что это точно вы"
                  required
                  className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
                />
              </label>
              <AdminSubmitButton pendingLabel="Добавление…" className="ml-auto">
                Добавить
              </AdminSubmitButton>
            </AdminForm>
          </div>
        </section>
      )}
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
