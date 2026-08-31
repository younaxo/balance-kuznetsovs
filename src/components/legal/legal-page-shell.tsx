import type { ReactNode } from "react";

export function LegalPageShell({
  title,
  updatedNote,
  children,
}: {
  title: string;
  updatedNote?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="container-page max-w-3xl py-16 lg:py-24">
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        {updatedNote && <p className="text-muted-foreground mt-2 text-sm">{updatedNote}</p>}
        <div className="prose-legal text-foreground [&_h2]:font-display mt-10 flex flex-col gap-6 text-[15px] leading-relaxed [&_h2]:mt-6 [&_h2]:text-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </section>
  );
}

export function OperatorRequisites({
  operatorFullName,
  operatorInn,
  operatorOgrn,
  operatorAddress,
}: {
  operatorFullName: string | null;
  operatorInn: string | null;
  operatorOgrn: string | null;
  operatorAddress: string | null;
}) {
  const hasAny = operatorFullName || operatorInn || operatorOgrn || operatorAddress;

  if (!hasAny) {
    return (
      <p className="border-border-strong text-muted-foreground rounded-md border border-dashed p-4 text-sm">
        Реквизиты оператора персональных данных уточняются и будут указаны здесь после заполнения в
        административной панели.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 text-[15px]">
      {operatorFullName && <li>Оператор: {operatorFullName}</li>}
      {operatorInn && <li>ИНН: {operatorInn}</li>}
      {operatorOgrn && <li>ОГРН/ОГРНИП: {operatorOgrn}</li>}
      {operatorAddress && <li>Адрес: {operatorAddress}</li>}
    </ul>
  );
}
