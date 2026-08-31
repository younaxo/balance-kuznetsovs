import { ServiceRepository } from "@/server/services/repository";
import { ILLUSTRATIONS, type IllustrationKey } from "@/components/icons/legal-illustrations";
import { Reveal } from "@/components/motion/reveal";
import { ServiceCardCta } from "./service-card-cta";

export async function ServicesSection({
  showHeading = true,
  headingLevel = "h2",
}: {
  showHeading?: boolean;
  /** "h1" на самостоятельной странице /services, "h2" при встраивании
   *  в главную (там h1 уже задаёт Hero) — корректная иерархия заголовков. */
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  const services = await ServiceRepository.listPublished();

  if (services.length === 0) return null;

  return (
    <section className="border-border border-b">
      <div className="container-page py-20 lg:py-28">
        {showHeading && (
          <Reveal>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
              Направления работы и пакетные решения
            </p>
            <Heading className="font-display mt-3 text-3xl sm:text-4xl">Наши услуги</Heading>
          </Reveal>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.map((service, index) => {
            const Illustration =
              ILLUSTRATIONS[service.illustration as IllustrationKey] ?? ILLUSTRATIONS.contract;
            return (
              <Reveal
                key={service.id}
                delay={(index % 2) * 0.08}
                id={service.slug}
                className="group border-border bg-surface hover:border-border-strong flex scroll-mt-28 flex-col justify-between gap-8 rounded-lg border p-8 transition-colors sm:p-10"
              >
                <div>
                  <h3 className="font-display text-2xl leading-tight sm:text-[1.75rem]">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">
                    {service.summary}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <ServiceCardCta
                    slug={service.slug}
                    ctaLabel={service.ctaLabel}
                    sourcePrefix="service"
                  />
                  <Illustration className="text-foreground/70 h-16 w-20 shrink-0 self-end sm:h-20 sm:w-24" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
