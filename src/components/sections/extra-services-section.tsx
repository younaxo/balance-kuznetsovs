import { listPublishedExtraServices } from "@/server/services/repository";
import { Reveal } from "@/components/motion/reveal";
import { ExtraServiceCta } from "./extra-service-cta";

/**
 * Дополнительные услуги, добавленные администратором сверх базовых пяти
 * (см. /admin/services). Если их нет — секция просто не рендерится.
 */
export async function ExtraServicesSection() {
  const items = await listPublishedExtraServices();
  if (items.length === 0) return null;

  return (
    <section className="border-border border-b">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl">Дополнительные услуги</h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map((service, index) => (
            <Reveal
              key={service.id}
              delay={(index % 2) * 0.06}
              className="border-border bg-surface flex flex-col justify-between gap-6 rounded-lg border p-7"
            >
              <div>
                <h3 className="text-lg font-semibold">{service.title}</h3>
                <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                  {service.summary}
                </p>
              </div>
              <ExtraServiceCta slug={service.slug} title={service.title} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
