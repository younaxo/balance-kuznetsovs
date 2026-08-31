import { ServiceRepository } from "@/server/services/repository";
import { ILLUSTRATION_KEYS } from "@/components/icons/legal-illustrations";
import { upsertServiceAction, deleteServiceAction } from "./actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";

export const metadata = { title: "Услуги" };

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
          Полное управление направлениями услуг — заголовок, текст, CTA, иллюстрация, порядок и
          публикация. Изменения сразу отражаются на публичном сайте.
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
        <div className="mt-4">
          <ServiceForm service={service} order={service.order} />
          <AdminForm action={deleteServiceAction} className="mt-3">
            <input type="hidden" name="id" value={service.id} />
            <AdminSubmitButton variant="destructive" pendingLabel="Удаление…">
              Удалить услугу
            </AdminSubmitButton>
          </AdminForm>
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
        <input
          name="slug"
          placeholder="slug-latinicej"
          defaultValue={service?.slug}
          required
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
        <input
          name="title"
          placeholder="Название"
          defaultValue={service?.title}
          required
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
      </div>
      <textarea
        name="summary"
        placeholder="Описание"
        defaultValue={service?.summary}
        required
        rows={3}
        className="border-border-strong bg-background rounded-md border p-3 text-sm"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="ctaLabel"
          placeholder="Текст кнопки"
          defaultValue={service?.ctaLabel ?? "Заказать услугу"}
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
        <select
          name="illustration"
          defaultValue={service?.illustration ?? "contract"}
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        >
          {ILLUSTRATION_KEYS.map((key) => (
            <option key={key} value={key}>
              {ILLUSTRATION_LABELS[key] ?? key}
            </option>
          ))}
        </select>
        <input
          name="order"
          type="number"
          placeholder="Порядок"
          defaultValue={order}
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={service?.isPublished ?? true} />{" "}
          Опубликовано
        </label>
        <AdminSubmitButton pendingLabel="Сохранение…" className="ml-auto">
          Сохранить
        </AdminSubmitButton>
      </div>
    </AdminForm>
  );
}
