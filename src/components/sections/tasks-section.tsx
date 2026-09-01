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

        {/* Каждая карточка — отдельный блок со своей рамкой (а не общая
            сетка с "заливкой швов"), поэтому нечётное число карточек не
            даёт визуального артефакта в последней строке — просто пустое
            место, и все карточки остаются одного размера. */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_TASKS.map((task, index) => {
            const Illustration = ILLUSTRATIONS[task.illustration];
            return (
              <Reveal
                key={task.title}
                delay={index * 0.05}
                className="border-border bg-surface flex flex-col items-center rounded-lg border p-7 text-center"
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
