import { PROCESS_STEPS } from "@/domain/process";
import { Reveal } from "@/components/motion/reveal";

export function ProcessSection() {
  return (
    <section className="border-border bg-muted/40 border-b">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl">Как происходит сотрудничество</h2>
        </Reveal>

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.order}
              delay={index * 0.04}
              className="border-border-strong border-t pt-5"
            >
              <span className="font-display text-muted-foreground text-xl">{step.order}</span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              {step.description && (
                <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                  {step.description}
                </p>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
