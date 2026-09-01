"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTheme } from "next-themes";
import { clientEnv } from "@/lib/env.client";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

/**
 * Виджет Cloudflare Turnstile. Рендерится только если задан
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY (в .env.example — тестовые ключи
 * Cloudflare, которые всегда проходят проверку: см. README, раздел
 * Turnstile). Без ключа компонент ничего не рендерит — форма работает
 * и без него, серверная проверка (verifyTurnstile) в этом случае тоже
 * автоматически считается пройденной.
 */
export function TurnstileWidget({ onVerify }: { onVerify: (token: string | null) => void }) {
  const siteKey = clientEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // resolvedTheme идёт undefined до гидратации и только потом становится
  // "light"/"dark" — если рендерить виджет сразу, он сначала появляется
  // с дефолтной темой, а через мгновение пересоздаётся (remove + render)
  // под реальную тему. Именно это пересоздание и выглядело как "капча
  // пропадает" — ждём, пока тема действительно определится.
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !scriptLoaded || !resolvedTheme || !containerRef.current || !window.turnstile) {
      return;
    }

    const container = containerRef.current;
    // В dev-режиме React (StrictMode) монтирует эффект дважды подряд
    // (mount → cleanup → mount) — без этой защиты turnstile.render()
    // вызывался бы на уже занятый контейнер и виджет ломался/пропадал.
    let cancelled = false;

    const id = window.turnstile.render(container, {
      sitekey: siteKey,
      theme: resolvedTheme === "dark" ? "dark" : "light",
      callback: (token: string) => {
        if (!cancelled) onVerify(token);
      },
      "expired-callback": () => {
        if (!cancelled) onVerify(null);
      },
      "error-callback": () => {
        if (!cancelled) onVerify(null);
      },
    });
    widgetIdRef.current = id;

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, scriptLoaded, resolvedTheme, onVerify]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </>
  );
}
