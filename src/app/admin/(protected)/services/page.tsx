import { db } from "@/server/db/client";
import { services } from "@/server/db/schema";
import { asc } from "drizzle-orm";
import { SERVICES } from "@/domain/services";
import { upsertExtraServiceAction, deleteExtraServiceAction } from "./actions";

export const metadata = { title: "Услуги" };

export default async function AdminServicesPage() {
  const extraServices = await db.select().from(services).orderBy(asc(services.order));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Услуги</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Базовые 5 направлений заданы техническим заданием и редактируются в коде (тексты нельзя
          менять без согласования с владельцем). Здесь можно добавить дополнительные услуги сверх
          базового списка.
        </p>
      </div>

      <section className="border-border bg-surface rounded-lg border">
        <div className="border-border border-b p-5">
          <h2 className="font-medium">Базовые услуги (только чтение)</h2>
        </div>
        <ul className="divide-border divide-y">
          {SERVICES.map((s) => (
            <li key={s.slug} className="p-5">
              <p className="font-medium">
                {s.order}. {s.title}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{s.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-border bg-surface rounded-lg border">
        <div className="border-border border-b p-5">
          <h2 className="font-medium">Дополнительные услуги</h2>
        </div>
        <ul className="divide-border divide-y">
          {extraServices.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-medium">
                  {s.order}. {s.title}{" "}
                  {!s.isPublished && (
                    <span className="text-muted-foreground text-xs">(скрыто)</span>
                  )}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">{s.summary}</p>
              </div>
              <form action={deleteExtraServiceAction}>
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className="text-destructive text-sm hover:underline">
                  Удалить
                </button>
              </form>
            </li>
          ))}
          {extraServices.length === 0 && (
            <li className="text-muted-foreground p-5 text-sm">Дополнительных услуг пока нет.</li>
          )}
        </ul>

        <form action={upsertExtraServiceAction} className="border-border grid gap-3 border-t p-5">
          <p className="text-sm font-medium">Добавить услугу</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="slug"
              placeholder="slug-latinicej"
              required
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
            <input
              name="title"
              placeholder="Название"
              required
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
          </div>
          <textarea
            name="summary"
            placeholder="Описание"
            required
            rows={3}
            className="border-border-strong bg-background rounded-md border p-3 text-sm"
          />
          <div className="flex items-center gap-4">
            <input
              name="order"
              type="number"
              placeholder="Порядок"
              defaultValue={extraServices.length + 1}
              className="border-border-strong bg-background h-9 w-28 rounded-md border px-3 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublished" defaultChecked /> Опубликовано
            </label>
            <button
              type="submit"
              className="bg-foreground text-background ml-auto h-9 rounded-md px-4 text-sm"
            >
              Сохранить
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
