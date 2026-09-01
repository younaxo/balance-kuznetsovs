import { TeamRepository } from "@/server/team/repository";
import { upsertTeamMemberAction, deleteTeamMemberAction } from "./actions";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Checkbox } from "@/components/ui/checkbox";

export const metadata = { title: "Команда" };

export default async function AdminTeamPage() {
  const members = await TeamRepository.listAll();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Команда</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          У карточки сотрудника всего два поля — ФИО и фото, без придуманных должностей и стажа.
          Загрузите любое фото — мы сами обрежем и подгоним его под общий размер, чтобы карточки
          смотрелись одинаково.
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
        <div className="mt-4 flex flex-col gap-3">
          <TeamMemberForm member={member} order={member.order} />
          <ConfirmDeleteForm
            action={deleteTeamMemberAction}
            id={member.id}
            itemLabel={member.fullName}
          />
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
      <input type="hidden" name="existingPhotoFilename" value={member?.photoFilename ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
        <input
          name="fullName"
          placeholder="Фамилия Имя Отчество"
          defaultValue={member?.fullName}
          required
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
        <div className="flex items-center gap-3">
          {member?.photoFilename && (
            // eslint-disable-next-line @next/next/no-img-element -- путь по данным из БД, статический импорт невозможен
            <img
              src={`/team/${member.photoFilename}`}
              alt=""
              className="aspect-3/4 w-12 shrink-0 rounded object-cover"
            />
          )}
          <input
            name="photo"
            type="file"
            accept="image/*"
            className="text-muted-foreground file:border-border-strong file:bg-muted w-full text-sm file:mr-3 file:h-9 file:cursor-pointer file:rounded-md file:border file:px-3 file:text-sm"
          />
        </div>
      </div>
      {member?.photoFilename && (
        <label className="text-muted-foreground flex items-center gap-2 text-sm">
          <Checkbox name="removePhoto" /> Убрать фото (будут только инициалы)
        </label>
      )}
      <div className="flex items-center gap-4">
        <input
          name="order"
          type="number"
          placeholder="Порядок"
          defaultValue={order}
          className="border-border-strong bg-background h-9 w-28 rounded-md border px-3 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="isPublished" defaultChecked={member?.isPublished ?? true} /> Опубликовано
        </label>
        <AdminSubmitButton pendingLabel="Сохранение…" className="ml-auto">
          Сохранить
        </AdminSubmitButton>
      </div>
    </AdminForm>
  );
}
