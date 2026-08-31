import { ReviewRepository } from "@/server/reviews/repository";
import { importReviewAction, togglePublishReviewAction, deleteReviewAction } from "./actions";

export const metadata = { title: "Отзывы" };

export default async function AdminReviewsPage() {
  const items = await ReviewRepository.listAll();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Отзывы</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Автоматический импорт с Avito недоступен: публичная страница профиля закрыта
          antibot-защитой (QRATOR, CAPTCHA) — обходить её запрещено политикой проекта. Добавляйте
          отзывы вручную ниже, указывая источник и ссылку.
        </p>
      </div>

      <section className="border-border bg-surface rounded-lg border">
        <ul className="divide-border divide-y">
          {items.map((review) => (
            <li key={review.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-medium">
                  {review.authorName}{" "}
                  <span className="text-muted-foreground text-xs">
                    · {review.source === "avito" ? "Avito" : "Вручную"}
                    {!review.isPublished && " · скрыт"}
                  </span>
                </p>
                <p className="text-muted-foreground mt-1 max-w-xl text-sm">{review.text}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <form action={togglePublishReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="isPublished" value={String(review.isPublished)} />
                  <button type="submit" className="text-accent text-sm hover:underline">
                    {review.isPublished ? "Скрыть" : "Опубликовать"}
                  </button>
                </form>
                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <button type="submit" className="text-destructive text-sm hover:underline">
                    Удалить
                  </button>
                </form>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-muted-foreground p-5 text-sm">Отзывов пока нет.</li>
          )}
        </ul>

        <form action={importReviewAction} className="border-border grid gap-3 border-t p-5">
          <p className="text-sm font-medium">Добавить отзыв вручную</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="authorName"
              placeholder="Имя автора"
              required
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
            <select
              name="source"
              defaultValue="avito"
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            >
              <option value="avito">Avito</option>
              <option value="manual">Другой источник</option>
            </select>
          </div>
          <textarea
            name="text"
            placeholder="Текст отзыва"
            required
            rows={3}
            className="border-border-strong bg-background rounded-md border p-3 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              name="rating"
              type="number"
              min="1"
              max="5"
              placeholder="Оценка (1-5)"
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
            <input
              name="sourceUrl"
              type="url"
              placeholder="Ссылка на отзыв"
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
            <input
              name="reviewedAt"
              type="date"
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" /> Опубликовать сразу
            </label>
            <button
              type="submit"
              className="bg-foreground text-background ml-auto h-9 rounded-md px-4 text-sm"
            >
              Добавить
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
