export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Услуги", href: "/services" },
  { label: "Прайс", href: "/prices" },
  { label: "Роскомнадзор (152-ФЗ)", href: "/152-fz" },
  { label: "Товарные знаки", href: "/trademarks" },
  { label: "Отзывы", href: "/reviews" },
  { label: "Контакты", href: "/contacts" },
] as const;
