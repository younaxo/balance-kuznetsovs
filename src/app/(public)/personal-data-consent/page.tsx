import type { Metadata } from "next";
import { LegalPageShell, OperatorRequisites } from "@/components/legal/legal-page-shell";
import { getContactSettings } from "@/server/content/contact-settings";

export const metadata: Metadata = {
  description: "Согласие субъекта на обработку персональных данных при отправке заявки на сайте.",
};

export default async function PersonalDataConsentPage() {
  const contacts = await getContactSettings();

  return (
    <LegalPageShell title="Согласие на обработку персональных данных">
      <p>
        Отправляя форму заявки или квиза на Сайте и устанавливая соответствующий флажок согласия,
        пользователь подтверждает, что действует свободно, своей волей и в своём интересе, и даёт
        согласие оператору на обработку своих персональных данных на условиях, изложенных ниже.
      </p>

      <h2>Оператор</h2>
      <OperatorRequisites
        operatorFullName={contacts.operatorFullName}
        operatorInn={contacts.operatorInn}
        operatorOgrn={contacts.operatorOgrn}
        operatorAddress={contacts.operatorAddress}
      />

      <h2>Перечень персональных данных</h2>
      <p>
        Имя, номер телефона, адрес электронной почты, идентификатор Telegram/MAX, содержание
        сообщения — в объёме, указанном пользователем при заполнении формы.
      </p>

      <h2>Цель обработки</h2>
      <p>
        Обработка и рассмотрение заявки, обратная связь по вопросам оказания юридических услуг,
        подготовка коммерческого предложения/расчёта стоимости.
      </p>

      <h2>Срок действия согласия</h2>
      <p>
        Согласие действует до момента его отзыва пользователем. Отзыв согласия осуществляется путём
        направления письменного заявления оператору по контактным данным, указанным на странице{" "}
        <a href="/contacts" className="underline underline-offset-2">
          «Контакты»
        </a>
        .
      </p>

      <p>
        Полные условия обработки персональных данных приведены в{" "}
        <a href="/privacy" className="underline underline-offset-2">
          Политике обработки персональных данных
        </a>
        .
      </p>
    </LegalPageShell>
  );
}
