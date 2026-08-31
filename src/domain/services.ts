/**
 * Единый источник правды по направлениям услуг компании.
 *
 * Тексты — дословно из технического задания владельца продукта.
 * Изменять формулировки самостоятельно нельзя (см. правило проекта
 * «не менять тексты» в CLAUDE.md / DECISIONS.md) — при необходимости
 * править текст нужно явно спросить владельца.
 *
 * Используется и в публичном UI, и в zod-валидации (`serviceSlug`),
 * и при первичном сидировании таблицы `services`.
 */

export interface ServiceDefinition {
  slug: string;
  order: number;
  title: string;
  summary: string;
  ctaLabel: string;
  /** Ключ иллюстрации из библиотеки src/components/icons/legal-illustrations.tsx */
  illustration: "personal-data" | "trademark" | "website-documents" | "contract" | "claim";
}

export const SERVICES: readonly ServiceDefinition[] = [
  {
    slug: "personal-data-152fz",
    order: 1,
    title: "Защита персональных данных (152-ФЗ)",
    summary:
      "Подготовка бизнеса к требованиям Роскомнадзора «под ключ». Формируем готовое уведомление для Роскомнадзора, приказы, политику ПДн, инструкции по безопасности в ИС, журналы учета обращений и акты классификации ИСПДн.",
    ctaLabel: "Заказать услугу",
    illustration: "personal-data",
  },
  {
    slug: "trademarks",
    order: 2,
    title: "Регистрация товарных знаков",
    summary:
      "Полное юридическое сопровождение процедуры защиты вашего бренда, логотипа или названия в Роспатенте. Предварительная проверка на уникальность, подготовка заявки и ведение делопроизводства до получения свидетельства.",
    ctaLabel: "Заказать услугу",
    illustration: "trademark",
  },
  {
    slug: "website-documents",
    order: 3,
    title: "Документы для сайтов и онлайн-продаж",
    summary:
      "Комплект юридических документов для сайтов и сервисов: публичные оферты, пользовательские соглашения, политика конфиденциальности, cookie-файлы, условия продажи/возврата и согласия на обработку ПДн.",
    ctaLabel: "Заказать услугу",
    illustration: "website-documents",
  },
  {
    slug: "contracts",
    order: 4,
    title: "Разработка договоров под ключ",
    summary:
      "Составление и аудит коммерческих договоров любой сложности для ИП, ООО и физлиц (услуги, подряд, поставка, купли-продажи, аренда, займы, NDA, договоры с самозанятыми/ИП).",
    ctaLabel: "Заказать услугу",
    illustration: "contract",
  },
  {
    slug: "claims-litigation",
    order: 5,
    title: "Исковые заявления и судебная защита",
    summary:
      "Юридическая помощь при нарушении обязательств контрагентами. Составление досудебных претензий, исковых заявления в суд и процессуальных документов для взыскания задолженности.",
    ctaLabel: "Заказать услугу",
    illustration: "claim",
  },
] as const;

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug) as [string, ...string[]];

export function getServiceBySlug(slug: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
