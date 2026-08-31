/**
 * Блок «С какими задачами к нам обращаются?» — тексты дословно из ТЗ.
 */

export interface TaskCardDefinition {
  title: string;
  text: string;
  illustration: "contract" | "website-documents" | "personal-data" | "trademark" | "claim";
}

export const CLIENT_TASKS: readonly TaskCardDefinition[] = [
  {
    title: "Заключение сделок",
    text: "Нужен надежный договор (поставка, подряд, услуги, аренда, займ, NDA), защищающий ваши финансовые интересы.",
    illustration: "contract",
  },
  {
    title: "Запуск сайта или онлайн-магазина",
    text: "Требуется юридическая «обвязка» веб-ресурса (оферта, политика конфиденциальности, согласия).",
    illustration: "website-documents",
  },
  {
    title: "Требования 152-ФЗ и Роскомнадзора",
    text: "Нужно подать уведомление в Роскомнадзор и подготовить внутренний комплект документов по ПДн.",
    illustration: "personal-data",
  },
  {
    title: "Защита бренда",
    text: "Необходимо зарегистрировать товарный знак, логотип или название в Роспатенте.",
    illustration: "trademark",
  },
  {
    title: "Нарушение обязательств контрагентом",
    text: "Задержка оплаты, неисполнение договора — требуется составление претензий и исков.",
    illustration: "claim",
  },
] as const;
