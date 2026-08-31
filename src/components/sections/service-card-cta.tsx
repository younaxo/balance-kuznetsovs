"use client";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";

export function ServiceCardCta({
  slug,
  ctaLabel,
  sourcePrefix,
}: {
  slug: string;
  ctaLabel: string;
  sourcePrefix: string;
}) {
  const { openApplication } = useDialogs();
  return (
    <TrackedButton
      eventType="service_cta_click"
      sourceElement={`${sourcePrefix}_${slug}`}
      destination={slug}
      onClick={() =>
        openApplication({ serviceSlug: slug, sourceElement: `${sourcePrefix}_card_${slug}` })
      }
    >
      {ctaLabel}
    </TrackedButton>
  );
}
