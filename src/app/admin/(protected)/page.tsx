import Link from "next/link";
import { ApplicationRepository } from "@/server/applications/repository";

export const metadata = { title: "Дашборд" };

const STATUS_LABELS: Record<string, string> = {
  new: "Новые",
  in_progress: "В работе",
  completed: "Завершены",
  archived: "Архив",
};

export default async function AdminDashboardPage() {
  const [counts, recent] = await Promise.all([
    ApplicationRepository.countByStatus(),
    ApplicationRepository.list({ limit: 5 }),
  ]);

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Дашборд</h1>
        <p className="text-muted-foreground mt-1 text-sm">Обзор заявок и активности сайта</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Всего заявок" value={total} />
        {(["new", "in_progress", "completed", "archived"] as const).map((status) => (
          <StatCard key={status} label={STATUS_LABELS[status]} value={counts[status] ?? 0} />
        ))}
      </div>

      <div className="border-border bg-surface rounded-lg border">
        <div className="border-border flex items-center justify-between border-b p-5">
          <h2 className="font-medium">Последние заявки</h2>
          <Link href="/admin/applications" className="text-accent text-sm hover:underline">
            Все заявки →
          </Link>
        </div>
        {recent.items.length === 0 ? (
          <p className="text-muted-foreground p-5 text-sm">Заявок пока нет.</p>
        ) : (
          <ul className="divide-border divide-y">
            {recent.items.map((app) => (
              <li key={app.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {app.phone || app.telegram || app.email || "—"}
                  </p>
                </div>
                <Link
                  href={`/admin/applications/${app.id}`}
                  className="text-accent text-sm hover:underline"
                >
                  Открыть →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-surface rounded-lg border p-5">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="font-display mt-1 text-3xl">{value}</p>
    </div>
  );
}
