import { cn } from "@/lib/cn";
import { CLIENT_TASKS } from "@/domain/tasks";
import { ILLUSTRATIONS } from "@/components/icons/legal-illustrations";
import { Reveal } from "@/components/motion/reveal";

export function TasksSection() {
  return (
    <section className="border-border border-b">
      <div className="container-page py-20 lg:py-28">
        <Reveal>
          <h2 className="font-display text-3xl sm:text-4xl">С какими задачами к нам обращаются?</h2>
        </Reveal>

        {/* 5 карточек в сетке 3 колонок дают "фантомную" пустую ячейку в
            последней строке — растягиваем последнюю карточку на 2 колонки,
            чтобы сетка заполнялась без пустот на каждом брейкпоинте. */}
        <div className="border-border bg-border mt-12 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_TASKS.map((task, index) => {
            const Illustration = ILLUSTRATIONS[task.illustration];
            const isLast = index === CLIENT_TASKS.length - 1;
            return (
              <Reveal
                key={task.title}
                delay={index * 0.05}
                className={cn("bg-surface p-7", isLast && "sm:col-span-2 lg:col-span-2")}
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
