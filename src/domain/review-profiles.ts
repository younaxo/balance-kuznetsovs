/**
 * Внешние профили, где уже есть реальные отзывы клиентов — пока
 * собственный раздел отзывов на сайте (`ReviewsSection`) не наполнен
 * (см. DECISIONS.md, раздел «Отзывы Avito»: автоматический импорт с
 * Avito технически невозможен без обхода antibot-защиты, что запрещено
 * ТЗ, поэтому раздел на сайте временно в разработке). Список статичный,
 * без БД — площадок мало, меняются они редко.
 */
export const REVIEW_PROFILES = [
  {
    label: "Avito — София",
    url: "https://www.avito.ru/user/f4883dd8791ff0dc85758741fd609cfb/profile",
    platform: "avito",
  },
  {
    label: "Avito — Дмитрий",
    url: "https://www.avito.ru/user/eb322c7d762ad7d9cd2ee49834862c63/profile?src=sharing",
    platform: "avito",
  },
] as const;
