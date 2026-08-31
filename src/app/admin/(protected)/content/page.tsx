import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";
import { CONTENT_BLOCK_KEYS } from "@/domain/content-blocks";
import { updateContentBlockAction } from "./actions";

export const metadata = { title: "Контент" };

export default async function AdminContentPage() {
  const rows = await db.select().from(contentBlocks);
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Контент</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Блоки, для которых пока не предоставлен текст. Пока блок не опубликован — на сайте он не
          показывается.
        </p>
      </div>

      <div className="grid gap-6">
        {CONTENT_BLOCK_KEYS.map(({ key, label }) => {
          const block = byKey.get(key);
          return (
            <form
              key={key}
              action={updateContentBlockAction}
              className="border-border bg-surface grid gap-3 rounded-lg border p-6"
            >
              <input type="hidden" name="key" value={key} />
              <h2 className="font-medium">{label}</h2>
              <input
                name="title"
                placeholder="Заголовок (необязательно)"
                defaultValue={block?.title ?? ""}
                className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
              />
              <textarea
                name="body"
                placeholder="Текст блока"
                rows={4}
                defaultValue={block?.body ?? ""}
                className="border-border-strong bg-background rounded-md border p-3 text-sm"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={block?.isPublished ?? false}
                  />
                  Опубликовано
                </label>
                <button
                  type="submit"
                  className="bg-foreground text-background ml-auto h-9 rounded-md px-4 text-sm"
                >
                  Сохранить
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
