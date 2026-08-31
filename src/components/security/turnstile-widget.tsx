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
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !scriptLoaded || !containerRef.current || !window.turnstile) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: resolvedTheme === "dark" ? "dark" : "light",
      callback: (token: string) => onVerify(token),
      "expired-callback": () => onVerify(null),
      "error-callback": () => onVerify(null),
    });

    return () => {
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
