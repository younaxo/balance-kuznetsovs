import Link from "next/link";
import { ApplicationRepository, type ApplicationStatus } from "@/server/applications/repository";
import { ServiceRepository } from "@/server/services/repository";
import { cn } from "@/lib/cn";

export const metadata = {};

const STATUSES: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "completed", label: "Завершены" },
  { value: "archived", label: "Архив" },
];

const PAGE_SIZE = 20;

export default async function AdminApplicationsPage({
  searchParams,
}: PageProps<"/admin/applications">) {
  const params = await searchParams;
  const statusParam = typeof params.status === "string" ? params.status : "all";
  const page = Math.max(1, Number(params.page) || 1);
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";

  const status = statusParam !== "all" ? (statusParam as ApplicationStatus) : undefined;
  const [{ items, total }, allServices] = await Promise.all([
    ApplicationRepository.list({
      status,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    ServiceRepository.listAll(),
  ]);
  const serviceTitleBySlug = new Map(allServices.map((s) => [s.slug, s.title]));

  const filtered = query
    ? items.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.phone?.toLowerCase().includes(query) ||
          a.email?.toLowerCase().includes(query) ||
          a.telegram?.toLowerCase().includes(query),
      )
    : items;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl">Заявки</h1>
        <p className="text-muted-foreground mt-1 text-sm">Всего: {total}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1" aria-label="Фильтр по статусу">
          {STATUSES.map((s) => (
            <Link
              key={s.value}
              href={
                s.value === "all" ? "/admin/applications" : `/admin/applications?status=${s.value}`
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                statusParam === s.value
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {s.label}
            </Link>
          ))}
        </nav>

        <form method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Поиск по имени, телефону, email"
            className="border-border-strong bg-surface focus-visible:border-accent h-9 w-64 rounded-md border px-3 text-sm outline-none"
          />
        </form>
      </div>

      <div className="border-border bg-surface overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left">
              <th className="p-4 font-medium">Имя</th>
              <th className="p-4 font-medium">Контакт</th>
              <th className="p-4 font-medium">Услуга</th>
              <th className="p-4 font-medium">Источник</th>
              <th className="p-4 font-medium">Статус</th>
              <th className="p-4 font-medium">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-muted/50">
                <td className="p-4">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="hover:text-accent font-medium"
                  >
                    {app.name}
                  </Link>
                </td>
                <td className="text-muted-foreground p-4">
                  {app.phone || app.telegram || app.email || "—"}
                </td>
                <td className="text-muted-foreground p-4">
                  {app.serviceSlug
                    ? (serviceTitleBySlug.get(app.serviceSlug) ?? app.serviceSlug)
                    : "—"}
                </td>
                <td className="text-muted-foreground p-4">
                  {app.source === "quiz" ? "Квиз" : "Форма"}
                </td>
                <td className="p-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="text-muted-foreground p-4">
                  {new Intl.DateTimeFormat("ru-RU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(app.createdAt)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground p-8 text-center">
                  Заявок не найдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="flex gap-1" aria-label="Пагинация">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/applications?page=${i + 1}${status ? `&status=${status}` : ""}`}
              className={cn(
                "flex size-8 items-center justify-center rounded-md text-sm",
                page === i + 1
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    new: "bg-accent/10 text-accent",
    in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    archived: "bg-muted text-muted-foreground",
  };
  const labels: Record<ApplicationStatus, string> = {
    new: "Новая",
    in_progress: "В работе",
    completed: "Завершена",
    archived: "Архив",
  };
  return (
    <span
      className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", styles[status])}
    >
      {labels[status]}
    </span>
  );
}
