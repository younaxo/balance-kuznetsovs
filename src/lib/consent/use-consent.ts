"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_CHANGE_EVENT, readStoredConsent, type ConsentState } from "./client";

/**
 * useSyncExternalStore — корректный React-способ читать внешнее
 * хранилище (cookie согласия) и подписываться на его изменения, без
 * setState внутри useEffect (см. https://react.dev/learn/you-might-not-need-an-effect).
 */
function subscribe(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  window.addEventListener("visibilitychange", callback);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
    window.removeEventListener("visibilitychange", callback);
  };
}

let cachedSnapshot: ConsentState | null | undefined;
let cachedRaw: string | undefined;

function getSnapshot(): ConsentState | null {
  const raw = document.cookie;
  if (raw === cachedRaw) return cachedSnapshot ?? null;
  cachedRaw = raw;
  cachedSnapshot = readStoredConsent();
  return cachedSnapshot;
}

function getServerSnapshot(): ConsentState | null {
  return null;
}

export function useConsent(): ConsentState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
