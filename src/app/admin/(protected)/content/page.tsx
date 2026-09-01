import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";
import { CONTENT_BLOCK_KEYS } from "@/domain/content-blocks";
import { updateContentBlockAction } from "./actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { AdminField } from "@/components/admin/admin-field";
import { MarkdownEditorField } from "@/components/admin/markdown-editor-field";
import { Checkbox } from "@/components/ui/checkbox";

export const metadata = {};

export default async function AdminContentPage() {
  const rows = await db.select().from(contentBlocks);
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl">Контент</h1>

      <div className="grid gap-6">
        {CONTENT_BLOCK_KEYS.map(({ key, label }) => {
          const block = byKey.get(key);
          return (
            <AdminForm
              key={key}
              action={updateContentBlockAction}
              className="border-border bg-surface grid gap-3 rounded-lg border p-6"
            >
              <input type="hidden" name="key" value={key} />
              <h2 className="font-medium">{label}</h2>
              <AdminField label="Заголовок блока (необязательно)">
                <input
                  name="title"
                  defaultValue={block?.title ?? ""}
                  className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
                />
              </AdminField>
              <AdminField label="Текст блока">
                <MarkdownEditorField
                  name="body"
                  defaultValue={block?.body ?? ""}
                  isFaq={key === "faq"}
                />
              </AdminField>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox name="isPublished" defaultChecked={block?.isPublished ?? false} />
                  Опубликовано
                </label>
                <AdminSubmitButton pendingLabel="Сохранение…" className="ml-auto">
                  Сохранить
                </AdminSubmitButton>
              </div>
            </AdminForm>
          );
        })}
      </div>
    </div>
  );
}
