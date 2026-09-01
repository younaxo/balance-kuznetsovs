import Link from "next/link";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  Tag,
  Star,
  Phone,
  FileText,
  Users,
  BarChart3,
  ScrollText,
  Megaphone,
  Settings,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/admin/logout-action";

const NAV = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard },
  { href: "/admin/applications", label: "Заявки", icon: Inbox },
  { href: "/admin/services", label: "Услуги", icon: Briefcase },
  { href: "/admin/prices", label: "Прайс", icon: Tag },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
  { href: "/admin/team", label: "Команда", icon: Users },
  { href: "/admin/contacts", label: "Контакты", icon: Phone },
  { href: "/admin/content", label: "Контент", icon: FileText },
  { href: "/admin/banner", label: "Баннер", icon: Megaphone },
  { href: "/admin/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/admin/logs", label: "Логи", icon: ScrollText },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

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
          <p className="font-display text-lg">БАЛАНС КУЗНЕЦОВЫ</p>
          <p className="text-muted-foreground text-xs">Дашборд</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV.map((item) => (
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

      <div className="flex-1">
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
