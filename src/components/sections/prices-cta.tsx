"use client";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";

export function PricesCta() {
  const { openQuiz } = useDialogs();
  return (
    <TrackedButton
      eventType="cta_click"
      sourceElement="prices_empty_state_cta"
      onClick={() => openQuiz({ sourceElement: "prices_page" })}
    >
      Получить точный расчет
    </TrackedButton>
  );
}
