import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/admin/logout-action";
import { Logo } from "@/components/brand/logo";
import { ADMIN_NAV } from "./admin-nav-items";
import { AdminMobileNav } from "./admin-mobile-nav";

/**
 * Каркас админ-панели: утилитарный, быстрый, клавиатурно-дружелюбный.
 * Меньше анимаций, чем на публичном сайте — приоритет ясности и скорости.
 */
export function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string;
}) {
  return (
    <div className="bg-muted/30 flex min-h-screen">
      <aside className="border-border bg-surface hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="border-border border-b p-5">
          <Logo height={32} />
          <p className="text-muted-foreground mt-2 text-xs">Дашборд</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/80 hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-border border-t p-3">
          <p className="text-muted-foreground truncate px-3 py-1 text-xs">{adminEmail}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-foreground/80 hover:bg-muted hover:text-foreground flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
            >
              <LogOut className="size-4" />
              Выйти
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <AdminMobileNav adminEmail={adminEmail} />
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
