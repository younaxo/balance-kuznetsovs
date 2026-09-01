import { CLIENT_TASKS } from "@/domain/tasks";
import { ILLUSTRATIONS } from "@/components/icons/legal-illustrations";
import { Reveal } from "@/components/motion/reveal";

export function TasksSection() {
  return (
    <section className="border-border border-b">
      <div className="container-page py-20 lg:py-28">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">С какими задачами к нам обращаются?</h2>
        </Reveal>

        {/* flex-wrap + justify-center вместо grid: ровно 3 карточки в
            ряд на десктопе (basis считает ширину под 3 колонки с учётом
            gap), нечётный остаток (2 карточки) просто центрируется в
            своём ряду, а не прижимается влево — как просили. */}
        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {CLIENT_TASKS.map((task, index) => {
            const Illustration = ILLUSTRATIONS[task.illustration];
            return (
              <Reveal
                key={task.title}
                delay={index * 0.05}
                className="border-border bg-surface flex basis-full flex-col items-center rounded-lg border p-7 text-center sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.333%-1rem)]"
              >
                <Illustration className="text-foreground/80 h-14 w-16" />
                <h3 className="mt-6 text-lg font-semibold">{task.title}</h3>
                <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">
                  {task.text}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
