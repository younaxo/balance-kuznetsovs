"use client";

import { useEffect } from "react";

/**
 * После каждого редеплоя у Next.js меняются id Server Actions —
 * вкладка, открытая ДО обновления, при следующей отправке формы (вход
 * в админку, любое сохранение) падает с "Failed to find Server Action
 * ... This request might be from an older or newer deployment" —
 * человеку это выглядит как "админка не работает"/"сайт сломался".
 * Ловим эту ошибку глобально и просто перезагружаем страницу — со
 * свежими id форма отправится нормально уже следующим кликом.
 */
export function StaleActionRecovery() {
  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      const message = String(event.reason?.message ?? event.reason ?? "");
      if (message.includes("Failed to find Server Action")) {
        window.location.reload();
      }
    }
    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return null;
}
