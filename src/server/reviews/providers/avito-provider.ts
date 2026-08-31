import "server-only";
import type { ReviewImportResult, ReviewProvider } from "./types";

/**
 * Импорт отзывов с публичного профиля Avito.
 *
 * Итог легального ресёрча (см. DECISIONS.md, раздел «Avito reviews»):
 * профиль https://www.avito.ru/user/f4883dd8791ff0dc85758741fd609cfb/profile
 * при обычном HTTP-запросе отдаёт страницу антибот-firewall QRATOR
 * («Доступ ограничен: проблема с IP», HTTP 429) с CAPTCHA. По прямому
 * требованию ТЗ обходить CAPTCHA/antibot/авторизацию запрещено — поэтому
 * автоматический разбор страницы НЕ реализован.
 *
 * Провайдер оставлен как честная реализация контракта: он не делает
 * вид, что что-то импортировал, а явно возвращает пустой список с
 * причиной. Если в будущем появится официальный API Avito для бизнеса
 * или иной легальный источник — сюда добавляется реальный fetch/parse,
 * при этом остальной код (админка, ReviewRepository) менять не придётся.
 */
export class AvitoReviewProvider implements ReviewProvider {
  readonly source = "avito" as const;

  async fetchReviews(): Promise<ReviewImportResult> {
    return {
      imported: [],
      notice:
        "Автоматический импорт с Avito недоступен: публичная страница профиля защищена antibot-firewall (QRATOR) и требует прохождения CAPTCHA. " +
        "Обход антибот-защиты запрещён политикой проекта. Используйте ручной импорт отзывов через форму ниже " +
        "(источник будет сохранён как Avito, с указанием ссылки на отзыв).",
    };
  }
}
