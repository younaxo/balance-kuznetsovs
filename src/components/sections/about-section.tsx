import { Users } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

/**
 * Тёмная секция «О компании» — визуально по референсу (графитовый фон,
 * карточки экспертов, quote-карточка), но БЕЗ выдуманных имён/должностей.
 * Реальные данные о команде владелец пока не предоставил — карточки
 * появятся здесь через /admin/content, как только текст будет готов.
 */
export function AboutSection() {
  return (
    <section className="border-graphite-border bg-graphite text-graphite-foreground border-b">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <p className="text-graphite-foreground/50 text-xs font-medium tracking-[0.2em] uppercase">
            Основатели и экспертный состав
          </p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">О компании «Баланс Кузнецовы»</h2>
        </Reveal>

        <Reveal
          delay={0.1}
          className="border-graphite-foreground/15 mt-10 flex flex-col items-start gap-3 rounded-lg border p-8 sm:flex-row sm:items-center sm:gap-6"
        >
          <Users className="text-graphite-foreground/50 size-7 shrink-0" />
          <p className="text-graphite-foreground/70 text-[15px] leading-relaxed">
            Раздел о команде и экспертах компании готовится к публикации. Здесь появятся профили
            основателей и специалистов с их специализацией и опытом.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
