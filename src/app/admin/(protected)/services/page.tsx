import { ServiceRepository } from "@/server/services/repository";
import { ILLUSTRATION_KEYS } from "@/components/icons/legal-illustrations";
import { upsertServiceAction, deleteServiceAction } from "./actions";
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

const ILLUSTRATION_LABELS: Record<string, string> = {
  "personal-data": "Персональные данные (щит)",
  trademark: "Товарный знак (R)",
  "website-documents": "Документы сайта (браузер)",
  contract: "Договор (подпись)",
  claim: "Претензия (конверт)",
};

export default async function AdminServicesPage() {
  const services = await ServiceRepository.listAll();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Услуги</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Здесь все услуги — правьте что угодно: заголовок, текст, кнопку, картинку, порядок и видна
          ли услуга на сайте. Сохранили — сайт обновится сразу же.
        </p>
      </div>

      <section className="border-border bg-surface rounded-lg border">
        <ul className="divide-border divide-y">
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
          {services.length === 0 && (
            <li className="text-muted-foreground p-5 text-sm">Услуг пока нет.</li>
          )}
        </ul>
      </section>

      <section className="border-border bg-surface rounded-lg border p-5">
        <h2 className="mb-4 text-sm font-medium">Добавить услугу</h2>
        <ServiceForm order={services.length + 1} />
      </section>
    </div>
  );
}

function ServiceRow({
  service,
}: {
  service: Awaited<ReturnType<typeof ServiceRepository.listAll>>[number];
}) {
  return (
    <li className="p-5">
      <details>
        <summary className="flex cursor-pointer items-center justify-between gap-4">
          <span className="font-medium">
            {service.title}{" "}
            {!service.isPublished && (
              <span className="text-muted-foreground text-xs">(скрыто)</span>
            )}
          </span>
          <span className="text-muted-foreground text-xs">Редактировать ▾</span>
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          <ServiceForm service={service} order={service.order} />
          <ConfirmDeleteForm
            action={deleteServiceAction}
            id={service.id}
            itemLabel={service.title}
            triggerLabel="Удалить услугу"
          />
        </div>
      </details>
    </li>
  );
}

function ServiceForm({
  service,
  order,
}: {
  service?: Awaited<ReturnType<typeof ServiceRepository.listAll>>[number];
  order: number;
}) {
  return (
    <AdminForm action={upsertServiceAction} resetOnSuccess={!service} className="grid gap-3">
      {service && <input type="hidden" name="id" value={service.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField label="Slug (для ссылки)">
          <input
            name="slug"
            placeholder="slug-latinicej"
            defaultValue={service?.slug}
            required
            className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
          />
        </AdminField>
        <AdminField label="Название">
          <input
            name="title"
            placeholder="Название услуги"
            defaultValue={service?.title}
            required
            className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
          />
        </AdminField>
      </div>
      <AdminField label="Описание">
        <textarea
          name="summary"
          placeholder="Описание услуги"
          defaultValue={service?.summary}
          required
          rows={3}
          className="border-border-strong bg-background rounded-md border p-3 text-sm"
        />
      </AdminField>
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminField label="Текст на кнопке">
          <input
            name="ctaLabel"
            placeholder="Заказать услугу"
            defaultValue={service?.ctaLabel ?? "Заказать услугу"}
            className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
          />
        </AdminField>
        <AdminField label="Картинка">
          <Select name="illustration" defaultValue={service?.illustration ?? "contract"}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ILLUSTRATION_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {ILLUSTRATION_LABELS[key] ?? key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>
        <AdminField label="Порядок на странице">
          <input
            name="order"
            type="number"
            defaultValue={order}
            className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
          />
        </AdminField>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="isPublished" defaultChecked={service?.isPublished ?? true} /> Опубликовано
        </label>
        <AdminSubmitButton pendingLabel="Сохранение…" className="ml-auto">
          Сохранить
        </AdminSubmitButton>
      </div>
    </AdminForm>
  );
}
