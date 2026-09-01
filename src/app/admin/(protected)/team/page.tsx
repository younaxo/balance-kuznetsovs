import { TeamRepository } from "@/server/team/repository";
import { upsertTeamMemberAction, deleteTeamMemberAction } from "./actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";

export const metadata = { title: "Команда" };

export default async function AdminTeamPage() {
  const members = await TeamRepository.listAll();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Команда</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          По решению владельца карточка специалиста содержит только ФИО и фото — без выдуманных
          должностей, стажа и регалий. Фото на сайте не появится, пока файл не будет вручную
          загружен на сервер в <code>public/team/</code> под именем, указанным в поле «Файл фото»;
          пока файла нет — на сайте показывается плейсхолдер с инициалами.
        </p>
      </div>

      <section className="border-border bg-surface rounded-lg border">
        <ul className="divide-border divide-y">
          {members.map((member) => (
            <TeamMemberRow key={member.id} member={member} />
          ))}
          {members.length === 0 && (
            <li className="text-muted-foreground p-5 text-sm">В команде пока никого нет.</li>
          )}
        </ul>
      </section>

      <section className="border-border bg-surface rounded-lg border p-5">
        <h2 className="mb-4 text-sm font-medium">Добавить человека</h2>
        <TeamMemberForm order={members.length + 1} />
      </section>
    </div>
  );
}

function TeamMemberRow({
  member,
}: {
  member: Awaited<ReturnType<typeof TeamRepository.listAll>>[number];
}) {
  return (
    <li className="p-5">
      <details>
        <summary className="flex cursor-pointer items-center justify-between gap-4">
          <span className="font-medium">
            {member.fullName}{" "}
            {!member.isPublished && <span className="text-muted-foreground text-xs">(скрыто)</span>}
          </span>
          <span className="text-muted-foreground text-xs">Редактировать ▾</span>
        </summary>
        <div className="mt-4">
          <TeamMemberForm member={member} order={member.order} />
          <AdminForm action={deleteTeamMemberAction} className="mt-3">
            <input type="hidden" name="id" value={member.id} />
            <AdminSubmitButton variant="destructive" pendingLabel="Удаление…">
              Удалить
            </AdminSubmitButton>
          </AdminForm>
        </div>
      </details>
    </li>
  );
}

function TeamMemberForm({
  member,
  order,
}: {
  member?: Awaited<ReturnType<typeof TeamRepository.listAll>>[number];
  order: number;
}) {
  return (
    <AdminForm action={upsertTeamMemberAction} resetOnSuccess={!member} className="grid gap-3">
      {member && <input type="hidden" name="id" value={member.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="fullName"
          placeholder="Фамилия Имя Отчество"
          defaultValue={member?.fullName}
          required
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
        <input
          name="photoFilename"
          placeholder="Файл фото (например, dmitry-kuznetsov.jpg)"
          defaultValue={member?.photoFilename ?? ""}
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <input
          name="order"
          type="number"
          placeholder="Порядок"
          defaultValue={order}
          className="border-border-strong bg-background h-9 w-28 rounded-md border px-3 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={member?.isPublished ?? true} />{" "}
          Опубликовано
        </label>
        <AdminSubmitButton pendingLabel="Сохранение…" className="ml-auto">
          Сохранить
        </AdminSubmitButton>
      </div>
    </AdminForm>
  );
}
