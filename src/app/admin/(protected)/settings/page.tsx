import { getCurrentAdmin } from "@/server/auth/session";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const metadata = { title: "Настройки" };

export default async function AdminSettingsPage() {
  const session = await getCurrentAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Настройки</h1>
        <p className="text-muted-foreground mt-1 text-sm">{session?.adminUser.email}</p>
      </div>

      <section className="border-border bg-surface max-w-sm rounded-lg border p-6">
        <h2 className="font-medium">Смена пароля</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          При смене пароля все остальные активные сессии завершаются.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="border-border-strong text-muted-foreground max-w-sm rounded-lg border border-dashed p-6 text-sm">
        Двухфакторная аутентификация (2FA) пока не подключена. Архитектура сессий (таблица
        admin_users/admin_sessions) готова к добавлению 2FA без изменения существующей схемы.
      </section>
    </div>
  );
}
