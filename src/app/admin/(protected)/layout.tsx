import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/server/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { robots: { index: false, follow: false } };

/**
 * Второй, "надёжный" рубеж защиты /admin (первый — proxy.ts, лёгкая
 * проверка наличия cookie). Здесь выполняется полноценная валидация
 * токена сессии с обращением к БД — так рекомендует Next.js docs
 * (auth должна проверяться внутри Server Component/Action, а не только
 * в Proxy).
 *
 * /admin/login вынесен за пределы этой route group ((protected)),
 * поэтому не оборачивается в этот layout и не участвует в редиректе.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminShell adminEmail={admin.adminUser.email}>{children}</AdminShell>;
}
