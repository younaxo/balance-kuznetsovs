"use client";

import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { submitConsent } from "@/lib/consent/client";
import { useConsent } from "@/lib/consent/use-consent";

export function CookieConsentBanner() {
  const consent = useConsent();
  const visible = consent === null;

  if (!visible) return null;

  const decide = (analytics: boolean) => {
    submitConsent(analytics);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Настройки cookie"
      className="glass-surface animate-in fade-in slide-in-from-bottom-4 fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-2xl flex-col gap-4 rounded-lg p-5 shadow-xl duration-300 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-muted-foreground text-sm">
        Мы используем cookie для работы сайта и, с вашего согласия, для аналитики посещений.{" "}
        <TrackedLink href="/cookies" className="hover:text-foreground underline underline-offset-2">
          Подробнее
        </TrackedLink>
        .
      </p>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button variant="outline" size="sm" onClick={() => decide(false)}>
          Только необходимые
        </Button>
        <Button size="sm" onClick={() => decide(true)}>
          Принять все
        </Button>
      </div>
    </div>
  );
}
