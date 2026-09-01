import { getSiteBanner } from "@/server/content/banner";
import { updateSiteBannerAction } from "./actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { AdminField } from "@/components/admin/admin-field";
import { Checkbox } from "@/components/ui/checkbox";

export const metadata = {};

export default async function AdminBannerPage() {
  const banner = await getSiteBanner();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Баннер</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Узкая плашка над шапкой сайта — для акций, новостей, всего важного. Текст понимает
          markdown (**жирный**), можно добавить кнопку-ссылку и маленькую иконку. Пока не включена —
          на сайте её не видно.
        </p>
      </div>

      <AdminForm
        action={updateSiteBannerAction}
        className="border-border bg-surface grid max-w-xl gap-4 rounded-lg border p-6"
      >
        <input type="hidden" name="existingImageFilename" value={banner.imageFilename ?? ""} />

        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="enabled" defaultChecked={banner.enabled} /> Показывать на сайте
        </label>

        <AdminField label="Текст (markdown: **жирный**, *курсив*, [ссылка](https://...))">
          <textarea
            name="text"
            rows={3}
            defaultValue={banner.text ?? ""}
            className="border-border-strong bg-background rounded-md border p-3 font-mono text-sm"
          />
        </AdminField>

        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Текст кнопки (необязательно)">
            <input
              name="buttonLabel"
              defaultValue={banner.buttonLabel ?? ""}
              placeholder="Узнать больше"
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
          </AdminField>
          <AdminField label="Ссылка кнопки">
            <input
              name="buttonHref"
              defaultValue={banner.buttonHref ?? ""}
              placeholder="/services"
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
          </AdminField>
        </div>

        <AdminField label="Иконка">
          <div className="flex items-center gap-3">
            {banner.imageFilename && (
              // eslint-disable-next-line @next/next/no-img-element -- путь по данным из БД, статический импорт невозможен
              <img
                src={`/banner/${banner.imageFilename}`}
                alt=""
                className="size-10 shrink-0 rounded object-contain"
              />
            )}
            <input
              name="image"
              type="file"
              accept="image/*"
              className="text-muted-foreground file:border-border-strong file:bg-muted w-full text-sm file:mr-3 file:h-9 file:cursor-pointer file:rounded-md file:border file:px-3 file:text-sm"
            />
          </div>
        </AdminField>
        {banner.imageFilename && (
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            <Checkbox name="removeImage" /> Убрать иконку
          </label>
        )}

        <AdminSubmitButton pendingLabel="Сохранение…" className="w-fit">
          Сохранить
        </AdminSubmitButton>
      </AdminForm>
    </div>
  );
}
