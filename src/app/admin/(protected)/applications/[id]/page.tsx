import { notFound } from "next/navigation";
import Link from "next/link";
import { ApplicationRepository } from "@/server/applications/repository";
import { getServiceBySlug } from "@/domain/services";
import { updateApplicationStatusAction } from "../actions";
import { db } from "@/server/db/client";
import { attributions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const metadata = { title: "Заявка" };

const STATUS_OPTIONS = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Завершена" },
  { value: "archived", label: "Архив" },
] as const;

export default async function AdminApplicationDetailPage({
  params,
}: PageProps<"/admin/applications/[id]">) {
  const { id } = await params;
  const application = await ApplicationRepository.findById(id);
  if (!application) notFound();

  const [attribution] = await db
    .select()
    .from(attributions)
    .where(eq(attributions.applicationId, id))
    .limit(1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/applications"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Все заявки
          </Link>
          <h1 className="font-display mt-1 text-2xl">{application.name}</h1>
        </div>

        <form action={updateApplicationStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={application.id} />
          <select
            name="status"
            defaultValue={application.status}
            className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-foreground text-background h-9 rounded-md px-4 text-sm"
          >
            Сохранить
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border-border bg-surface rounded-lg border p-6">
          <h2 className="font-medium">Контакты</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <Row label="Телефон" value={application.phone} />
            <Row label="Telegram / MAX" value={application.telegram} />
            <Row label="Email" value={application.email} />
            <Row
              label="Услуга"
              value={
                application.serviceSlug
                  ? (getServiceBySlug(application.serviceSlug)?.title ?? application.serviceSlug)
                  : null
              }
            />
            <Row label="Источник" value={application.source === "quiz" ? "Квиз" : "Форма"} />
            <Row
              label="Создана"
              value={new Intl.DateTimeFormat("ru-RU", {
                dateStyle: "long",
                timeStyle: "short",
              }).format(application.createdAt)}
            />
          </dl>
        </section>

        <section className="border-border bg-surface rounded-lg border p-6">
          <h2 className="font-medium">Сообщение</h2>
          <p className="text-muted-foreground mt-4 text-sm whitespace-pre-line">
            {application.message || "—"}
          </p>
          {application.quizAnswers && (
            <>
              <h3 className="mt-6 text-sm font-medium">Ответы квиза</h3>
              <pre className="bg-muted mt-2 overflow-x-auto rounded-md p-3 text-xs">
                {JSON.stringify(application.quizAnswers, null, 2)}
              </pre>
            </>
          )}
        </section>

        <section className="border-border bg-surface rounded-lg border p-6">
          <h2 className="font-medium">Уведомления</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <Row
              label="Telegram"
              value={application.telegramNotifiedAt ? "Доставлено" : "Не доставлено"}
            />
            <Row
              label="Email"
              value={application.emailNotifiedAt ? "Доставлено" : "Не доставлено"}
            />
          </dl>
        </section>

        <section className="border-border bg-surface rounded-lg border p-6">
          <h2 className="font-medium">Атрибуция</h2>
          {attribution ? (
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <Row label="Источник (первый визит)" value={attribution.firstTouchUtmSource} />
              <Row label="Канал (первый визит)" value={attribution.firstTouchUtmMedium} />
              <Row label="Кампания (первый визит)" value={attribution.firstTouchUtmCampaign} />
              <Row label="Посадочная страница" value={attribution.firstTouchLandingPath} />
              <Row label="Источник (перед заявкой)" value={attribution.lastTouchUtmSource} />
              <Row label="Страница перед заявкой" value={attribution.lastTouchPath} />
              <Row label="CTA" value={attribution.ctaSource} />
            </dl>
          ) : (
            <p className="text-muted-foreground mt-4 text-sm">
              Атрибуция недоступна (заявка без UTM-меток или без согласия на аналитику).
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border-border flex justify-between gap-4 border-b pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}
