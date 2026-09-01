import Link from "next/link";
import { getAnalyticsSummary } from "@/server/analytics/reporting";
import { cn } from "@/lib/cn";
import { BarList } from "@/components/admin/bar-list";
import { UtmBuilder } from "@/components/admin/utm-builder";

export const metadata = {};

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
        <h1 className="font-display text-2xl">Аналитика</h1>
        <nav className="flex gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <Link
              key={opt.days}
              href={`/admin/analytics?days=${opt.days}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                days === opt.days
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted",
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

      <UtmBuilder />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="События">
          <BarList
            items={summary.eventsByType.map((e) => ({
              label: EVENT_LABELS[e.eventType] ?? e.eventType,
              value: e.count,
            }))}
          />
        </Panel>

        <Panel title="Точки входа">
          <BarList
            items={summary.topLandingPaths.map((p) => ({ label: p.path, value: p.count }))}
          />
        </Panel>

        <Panel title="Источники (utm_source)">
          <BarList
            items={summary.topUtmSources.map((s) => ({ label: s.source, value: s.count }))}
          />
        </Panel>

        <Panel title="Каналы (utm_medium)">
          <BarList
            items={summary.topUtmMediums.map((m) => ({ label: m.medium, value: m.count }))}
          />
        </Panel>

        <Panel title="Кампании (utm_campaign)">
          <BarList
            items={summary.topUtmCampaigns.map((c) => ({ label: c.campaign, value: c.count }))}
          />
        </Panel>

        <Panel title="Объявления (utm_content)">
          <BarList
            items={summary.topUtmContents.map((c) => ({ label: c.content, value: c.count }))}
          />
        </Panel>

        <Panel title="Ключевые слова (utm_term)">
          <BarList items={summary.topUtmTerms.map((t) => ({ label: t.term, value: t.count }))} />
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
