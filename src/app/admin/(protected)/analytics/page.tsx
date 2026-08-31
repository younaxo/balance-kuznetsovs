import Link from "next/link";
import { getAnalyticsSummary } from "@/server/analytics/reporting";
import { cn } from "@/lib/cn";

export const metadata = { title: "Аналитика" };

const EVENT_LABELS: Record<string, string> = {
  page_view: "Просмотры страниц",
  nav_click: "Клики по навигации",
  footer_click: "Клики в футере",
  cta_click: "Клики по CTA",
  service_cta_click: "Клики «Заказать услугу»",
  external_link_click: "Переходы вовне",
  telegram_click: "Клики Telegram",
  max_click: "Клики MAX",
  email_click: "Клики Email",
  phone_click: "Клики по телефону",
  quiz_open: "Открытия квиза",
  quiz_step: "Шаги квиза",
  quiz_complete: "Завершения квиза",
  application_open: "Открытия формы заявки",
  application_submit: "Отправки заявок",
  tracked_redirect: "Переходы /go/*",
};

const RANGE_OPTIONS = [
  { days: 7, label: "7 дней" },
  { days: 30, label: "30 дней" },
  { days: 90, label: "90 дней" },
];

export default async function AdminAnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const params = await searchParams;
  const days = Number(params.days) || 30;

  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const summary = await getAnalyticsSummary({ from, to });

  const conversion = summary.sessions > 0 ? (summary.applications / summary.sessions) * 100 : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Аналитика</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Собственная first-party аналитика (только с согласия посетителя)
          </p>
        </div>
        <nav className="flex gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <Link
              key={opt.days}
              href={`/admin/analytics?days=${opt.days}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                days === opt.days ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              {opt.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Сессии" value={summary.sessions} />
        <StatCard label="Просмотры страниц" value={summary.pageViews} />
        <StatCard label="Заявки" value={summary.applications} />
        <StatCard label="Конверсия в заявку" value={`${conversion.toFixed(1)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="События">
          {summary.eventsByType.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-border divide-y">
              {summary.eventsByType.map((e) => (
                <li key={e.eventType} className="flex justify-between p-4 text-sm">
                  <span>{EVENT_LABELS[e.eventType] ?? e.eventType}</span>
                  <span className="font-medium">{e.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Точки входа">
          {summary.topLandingPaths.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-border divide-y">
              {summary.topLandingPaths.map((p) => (
                <li key={p.path} className="flex justify-between p-4 text-sm">
                  <span className="truncate">{p.path}</span>
                  <span className="font-medium">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Источники (UTM Source)">
          {summary.topUtmSources.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-border divide-y">
              {summary.topUtmSources.map((s) => (
                <li key={s.source} className="flex justify-between p-4 text-sm">
                  <span>{s.source}</span>
                  <span className="font-medium">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Кампании (UTM Campaign)">
          {summary.topUtmCampaigns.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-border divide-y">
              {summary.topUtmCampaigns.map((c) => (
                <li key={c.campaign} className="flex justify-between p-4 text-sm">
                  <span>{c.campaign}</span>
                  <span className="font-medium">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border-border bg-surface rounded-lg border p-5">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-display mt-1 text-3xl">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-border bg-surface rounded-lg border">
      <div className="border-border border-b p-4">
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return <p className="text-muted-foreground p-4 text-sm">Нет данных за выбранный период.</p>;
}
