"use client";

import * as React from "react";
import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { initialAdminActionState, type AdminActionState } from "@/server/admin/action-state";

/**
 * Обёртка над формой на Server Action с явной обратной связью:
 * успех показывается коротким подтверждением (и опционально сбрасывает
 * поля формы — для форм "добавить новую запись"), ошибка — текстом.
 * Без этого форма просто молча перерисовывалась после сохранения,
 * что выглядело как "кнопка не работает".
 */
export function AdminForm({
  action,
  resetOnSuccess = false,
  successMessage = "Сохранено",
  className,
  children,
}: {
  action: (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  resetOnSuccess?: boolean;
  successMessage?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialAdminActionState);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [successTick, setSuccessTick] = React.useState(0);

  // "Подстройка состояния при изменении значения" во время рендера, через
  // useState (не useRef — React запрещает читать/писать refs в рендере),
  // см. https://react.dev/learn/you-might-not-need-an-effect — без
  // лишнего эффекта и лишнего прохода рендера ради setState.
  const [lastState, setLastState] = React.useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.ok) setSuccessTick((n) => n + 1);
  }

  // А вот сброс полей формы — реальная синхронизация с DOM вне React,
  // для неё useEffect уместен (никакого setState внутри него нет).
  React.useEffect(() => {
    if (state.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  React.useEffect(() => {
    if (successTick === 0) return;
    const timeout = setTimeout(() => setSuccessTick(0), 2500);
    return () => clearTimeout(timeout);
  }, [successTick]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      {state.error && <p className="text-destructive mt-2 text-sm">{state.error}</p>}
      {successTick > 0 && (
        <p
          key={successTick}
          className="animate-in fade-in mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="size-4" /> {successMessage}
        </p>
      )}
    </form>
  );
}
