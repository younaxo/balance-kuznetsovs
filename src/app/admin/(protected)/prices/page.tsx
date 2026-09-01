import { PriceRepository, formatPriceFromKopecks } from "@/server/pricing/repository";
import { ServiceRepository } from "@/server/services/repository";
import { upsertPriceItemAction, deletePriceItemAction } from "./actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { AdminField } from "@/components/admin/admin-field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const metadata = {};

export default async function AdminPricesPage() {
  const [items, services] = await Promise.all([
    PriceRepository.listAll(),
    ServiceRepository.listAll(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl">Прайс</h1>

      <section className="border-border bg-surface rounded-lg border">
        <ul className="divide-border divide-y">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-medium">
                  {item.title}{" "}
                  {!item.isPublished && (
                    <span className="text-muted-foreground text-xs">(скрыто)</span>
                  )}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.priceFromKopecks
                    ? formatPriceFromKopecks(item.priceFromKopecks)
                    : "По запросу"}
                  {item.unit ? ` / ${item.unit}` : ""}
                </p>
              </div>
              <ConfirmDeleteForm
                action={deletePriceItemAction}
                id={item.id}
                itemLabel={item.title}
              />
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-muted-foreground p-5 text-sm">Позиций прайса пока нет.</li>
          )}
        </ul>

        <AdminForm
          action={upsertPriceItemAction}
          resetOnSuccess
          className="border-border grid gap-3 border-t p-5"
        >
          <p className="text-sm font-medium">Добавить позицию</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Название">
              <input
                name="title"
                placeholder="Название позиции"
                required
                className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
              />
            </AdminField>
            <AdminField label="Привязка к услуге">
              <Select name="serviceSlug" defaultValue="none">
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без привязки к услуге</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminField>
          </div>
          <AdminField label="Описание (необязательно)">
            <textarea
              name="description"
              rows={2}
              className="border-border-strong bg-background rounded-md border p-3 text-sm"
            />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminField label="Цена, ₽ (от)">
              <input
                name="priceFromKopecks"
                type="number"
                step="1"
                min="0"
                className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
              />
            </AdminField>
            <AdminField label="Единица">
              <input
                name="unit"
                placeholder="документ, час..."
                className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
              />
            </AdminField>
            <AdminField label="Порядок">
              <input
                name="order"
                type="number"
                defaultValue={items.length + 1}
                className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
              />
            </AdminField>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="isPublished" defaultChecked /> Опубликовано
            </label>
            <AdminSubmitButton pendingLabel="Сохранение…" className="ml-auto">
              Сохранить
            </AdminSubmitButton>
          </div>
        </AdminForm>
      </section>
    </div>
  );
}
