"use client";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";
import { Reveal } from "@/components/motion/reveal";

export function FinalCtaSection() {
  const { openApplication, openQuiz } = useDialogs();

  return (
    <section className="border-graphite-border bg-graphite text-graphite-foreground border-b">
      <div className="container-page py-20 text-center lg:py-28">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl sm:text-4xl">Готовы обсудить вашу задачу?</h2>
          <p className="text-graphite-foreground/70 mt-4 text-[15px] leading-relaxed">
            Оставьте заявку — мы свяжемся с вами и подберём решение под ваш бизнес.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <TrackedButton
              size="lg"
              variant="accent"
              eventType="cta_click"
              sourceElement="final_cta_primary"
              onClick={() => openApplication({ sourceElement: "final_cta" })}
            >
              Оставить заявку
            </TrackedButton>
            <TrackedButton
              size="lg"
              variant="outline"
              eventType="cta_click"
              sourceElement="final_cta_secondary"
              className="border-graphite-foreground/25 text-graphite-foreground hover:bg-graphite-foreground/10"
              onClick={() => openQuiz({ sourceElement: "final_cta" })}
            >
              Рассчитать стоимость
            </TrackedButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
