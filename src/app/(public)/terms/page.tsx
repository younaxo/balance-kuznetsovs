import type { Metadata } from "next";
import { LegalPageShell, OperatorRequisites } from "@/components/legal/legal-page-shell";
import { getContactSettings } from "@/server/content/contact-settings";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description: "Правила использования сайта «Баланс Кузнецовы».",
};

export default async function TermsPage() {
  const contacts = await getContactSettings();

  return (
    <LegalPageShell title="Пользовательское соглашение">
      <p>
        Настоящее соглашение регулирует условия использования сайта «Баланс Кузнецовы» (далее —
        «Сайт»). Используя Сайт, пользователь подтверждает согласие с условиями, изложенными ниже.
      </p>

      <h2>Оператор сайта</h2>
      <OperatorRequisites
        operatorFullName={contacts.operatorFullName}
        operatorInn={contacts.operatorInn}
        operatorOgrn={contacts.operatorOgrn}
        operatorAddress={contacts.operatorAddress}
      />

      <h2>Общие положения</h2>
      <p>
        Материалы Сайта носят информационный характер и не являются публичной офертой, если иное
        прямо не указано на соответствующей странице. Стоимость услуг определяется индивидуально
        после анализа задачи пользователя.
      </p>

      <h2>Интеллектуальная собственность</h2>
      <p>
        Логотип, фирменное наименование «Баланс Кузнецовы» и материалы Сайта являются объектами
        интеллектуальной собственности и охраняются в соответствии с законодательством РФ.
      </p>

      <h2>Обратная связь</h2>
      <p>
        По вопросам, связанным с использованием Сайта, обращайтесь через форму заявки или контакты,
        указанные на странице{" "}
        <a href="/contacts" className="underline underline-offset-2">
          «Контакты»
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
