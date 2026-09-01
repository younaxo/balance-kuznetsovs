"use client";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";

/**
 * Кнопка "Оставить заявку" в подвале — источник клика (footer_cta)
 * помечается отдельно от такого же клика в шапке (header_cta), чтобы в
 * аналитике/атрибуции заявки было видно, откуда именно её оставили.
 */
export function FooterCta() {
  const { openApplication } = useDialogs();
  return (
    <TrackedButton
      variant="primary"
      size="sm"
      eventType="cta_click"
      sourceElement="footer_cta"
      onClick={() => openApplication({ sourceElement: "footer_cta" })}
    >
      Оставить заявку
    </TrackedButton>
  );
}
