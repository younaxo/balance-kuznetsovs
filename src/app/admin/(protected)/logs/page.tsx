import Link from "next/link";
import { NotificationLogRepository } from "@/server/notifications/log-repository";

export const metadata = {};

const CHANNEL_LABELS: Record<string, string> = {
  telegram: "Telegram",
  email: "Email",
};

export default async function AdminLogsPage() {
  const logs = await NotificationLogRepository.listRecent(150);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Логи</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Кто и когда пытался отправить уведомление о заявке — Telegram, email — и получилось ли.
          Последние 150 записей.
        </p>
      </div>

      <section className="border-border bg-surface rounded-lg border">
        <ul className="divide-border divide-y">
          {logs.map((log) => (
            <li key={log.id} className="flex items-start justify-between gap-4 p-4 text-sm">
              <div>
                <p className="font-medium">
                  {CHANNEL_LABELS[log.channel] ?? log.channel}{" "}
                  <span className={log.success ? "text-emerald-600" : "text-destructive"}>
                    · {log.success ? "доставлено" : "не доставлено"}
                  </span>
                </p>
                {log.applicationId && (
                  <Link
                    href={`/admin/applications/${log.applicationId}`}
                    className="text-muted-foreground hover:text-accent"
                  >
                    Заявка {log.applicationName ? `— ${log.applicationName}` : ""}
                  </Link>
                )}
                {log.errorMessage && (
                  <p className="text-destructive mt-1 text-xs">{log.errorMessage}</p>
                )}
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">
                {new Intl.DateTimeFormat("ru-RU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(log.createdAt)}
              </span>
            </li>
          ))}
          {logs.length === 0 && (
            <li className="text-muted-foreground p-5 text-sm">Записей пока нет.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
