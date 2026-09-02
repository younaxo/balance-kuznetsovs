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
} from "lucide-react";

/**
 * Единый источник пунктов навигации админки — используется и десктопным
 * сайдбаром (admin-shell.tsx), и мобильным меню (admin-mobile-nav.tsx),
 * чтобы список разделов не расходился между ними.
 */
export const ADMIN_NAV = [
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
