export const metadata = {};

/**
 * Модуль временно на паузе по решению владельца — форма и логика
 * управления отзывами (actions.ts) никуда не делись, просто страница
 * их пока не показывает. Вернуть — заменить этот файл содержимым из
 * истории git (см. коммит перед этим).
 */
export default function AdminReviewsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl">Отзывы</h1>
      <p className="text-muted-foreground text-sm">Модуль в разработке.</p>
    </div>
  );
}
