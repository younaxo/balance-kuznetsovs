import { ReviewRepository } from "@/server/reviews/repository";
import { importReviewAction, togglePublishReviewAction, deleteReviewAction } from "./actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const metadata = { title: "Отзывы" };

export default async function AdminReviewsPage() {
  const items = await ReviewRepository.listAll();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Отзывы</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          С Avito отзывы сами не подтянутся — их профиль закрыт от ботов (QRATOR, капча), а обходить
          такую защиту мы не станем. Так что добавляйте отзывы сюда руками: текст, источник и ссылку
          на оригинал.
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
                <AdminForm action={togglePublishReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <input type="hidden" name="isPublished" value={String(review.isPublished)} />
                  <AdminSubmitButton variant="ghost" pendingLabel="…">
                    {review.isPublished ? "Скрыть" : "Опубликовать"}
                  </AdminSubmitButton>
                </AdminForm>
                <AdminForm action={deleteReviewAction}>
                  <input type="hidden" name="id" value={review.id} />
                  <AdminSubmitButton variant="destructive" pendingLabel="Удаление…">
                    Удалить
                  </AdminSubmitButton>
                </AdminForm>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-muted-foreground p-5 text-sm">Отзывов пока нет.</li>
          )}
        </ul>

        <AdminForm
          action={importReviewAction}
          resetOnSuccess
          className="border-border grid gap-3 border-t p-5"
        >
          <p className="text-sm font-medium">Добавить отзыв вручную</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="authorName"
              placeholder="Имя автора"
              required
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
            <Select name="source" defaultValue="avito">
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avito">Avito</SelectItem>
                <SelectItem value="manual">Другой источник</SelectItem>
              </SelectContent>
            </Select>
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
              <Checkbox name="isPublished" /> Опубликовать сразу
            </label>
            <AdminSubmitButton pendingLabel="Сохранение…" className="ml-auto">
              Добавить
            </AdminSubmitButton>
          </div>
        </AdminForm>
      </section>
    </div>
  );
}
