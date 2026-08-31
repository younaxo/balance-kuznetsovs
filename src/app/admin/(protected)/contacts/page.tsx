import { getContactSettings } from "@/server/content/contact-settings";
import { updateContactSettingsAction } from "./actions";

export const metadata = { title: "Контакты" };

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
      />
    </label>
  );
}

export default async function AdminContactsPage() {
  const contacts = await getContactSettings();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl">Контакты</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Пока поля пустые — публичный сайт не показывает выдуманные контакты. Заполните реальные
          данные, чтобы они появились в шапке, футере и на странице «Контакты».
        </p>
      </div>

      <form action={updateContactSettingsAction} className="grid max-w-2xl gap-8">
        <section className="border-border bg-surface grid gap-4 rounded-lg border p-6">
          <h2 className="font-medium">Способы связи</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Телефон"
              name="phone"
              defaultValue={contacts.phone}
              placeholder="+7 900 000-00-00"
            />
            <Field
              label="Email"
              name="email"
              defaultValue={contacts.email}
              placeholder="office@example.com"
            />
            <Field
              label="Telegram (ссылка)"
              name="telegram"
              defaultValue={contacts.telegram}
              placeholder="https://t.me/username"
            />
            <Field label="MAX (ссылка)" name="maxMessenger" defaultValue={contacts.maxMessenger} />
          </div>
          <Field label="Адрес" name="address" defaultValue={contacts.address} />
          <Field
            label="Часы работы"
            name="workingHours"
            defaultValue={contacts.workingHours}
            placeholder="Пн–Пт, 10:00–19:00"
          />
        </section>

        <section className="border-border bg-surface grid gap-4 rounded-lg border p-6">
          <h2 className="font-medium">Реквизиты оператора ПДн</h2>
          <p className="text-muted-foreground text-xs">
            Используются на страницах политики конфиденциальности и пользовательского соглашения.
          </p>
          <Field
            label="Полное наименование"
            name="operatorFullName"
            defaultValue={contacts.operatorFullName}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ИНН" name="operatorInn" defaultValue={contacts.operatorInn} />
            <Field label="ОГРН/ОГРНИП" name="operatorOgrn" defaultValue={contacts.operatorOgrn} />
          </div>
          <Field
            label="Юридический адрес"
            name="operatorAddress"
            defaultValue={contacts.operatorAddress}
          />
        </section>

        <button
          type="submit"
          className="bg-foreground text-background h-10 w-fit rounded-md px-6 text-sm"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}
