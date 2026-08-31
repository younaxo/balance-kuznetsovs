"use client";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";

export function ExtraServiceCta({ slug, title }: { slug: string; title: string }) {
  const { openApplication } = useDialogs();
  return (
    <TrackedButton
      eventType="service_cta_click"
      sourceElement={`extra_service_${slug}`}
      destination={slug}
      onClick={() => openApplication({ sourceElement: `extra_service_${slug}` })}
      className="w-fit"
    >
      Заказать «{title}»
    </TrackedButton>
  );
}
