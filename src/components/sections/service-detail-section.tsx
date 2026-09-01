"use client";

import { ILLUSTRATIONS, type IllustrationKey } from "@/components/icons/legal-illustrations";
import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";
import { Reveal } from "@/components/motion/reveal";

export interface ServiceDetailData {
  slug: string;
  title: string;
  summary: string;
  ctaLabel: string;
  illustration: string;
}

export function ServiceDetailSection({ service }: { service: ServiceDetailData }) {
  const { openApplication, openQuiz } = useDialogs();
  const Illustration =
    ILLUSTRATIONS[service.illustration as IllustrationKey] ?? ILLUSTRATIONS.contract;

  return (
    <section className="border-border border-b">
      <div className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-32">
        <Reveal>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{service.title}</h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-[15px] leading-relaxed sm:text-base">
            {service.summary}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedButton
              size="lg"
              eventType="service_cta_click"
              sourceElement={`service_detail_${service.slug}`}
              destination={service.slug}
              onClick={() =>
                openApplication({
                  serviceSlug: service.slug,
                  sourceElement: `service_detail_${service.slug}`,
                })
              }
            >
              {service.ctaLabel}
            </TrackedButton>
            <TrackedButton
              size="lg"
              variant="outline"
              eventType="cta_click"
              sourceElement={`service_detail_quiz_${service.slug}`}
              onClick={() =>
                openQuiz({
                  serviceSlug: service.slug,
                  sourceElement: `service_detail_${service.slug}`,
                })
              }
            >
              Рассчитать стоимость
            </TrackedButton>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="flex justify-center lg:justify-end">
          <Illustration className="text-foreground/70 h-56 w-64 sm:h-72 sm:w-80" />
        </Reveal>
      </div>
    </section>
  );
}
