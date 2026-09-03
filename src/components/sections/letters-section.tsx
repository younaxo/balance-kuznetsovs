"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

// Реальные скан-копии благодарственных/рекомендательных писем от клиентов
// (см. public/letters) — размеры указаны заранее, чтобы next/image не
// прыгал при загрузке (CLS).
const LETTERS = [
  {
    src: "/letters/letter-1.jpg",
    width: 583,
    height: 800,
    title: "ООО «Финполимер»",
    alt: "Благодарственное письмо от ООО «Финполимер»",
  },
  {
    src: "/letters/letter-2.jpg",
    width: 566,
    height: 800,
    title: "ООО «Авалон Мед»",
    alt: "Рекомендательное письмо от ООО «Авалон Мед»",
  },
  {
    src: "/letters/letter-3.jpg",
    width: 569,
    height: 799,
    title: "ООО СКА «Урал»",
    alt: "Благодарственное письмо от ООО СКА «Урал»",
  },
] as const;

/**
 * Скан-копии благодарственных/рекомендательных писем от клиентов —
 * дополнительное, документальное подтверждение работы команды (пока
 * раздел отзывов заполняется). Клик по миниатюре открывает письмо
 * целиком в диалоге.
 *
 * compact=true — узкая "полоса доверия" (используется на главной, сразу
 * под hero); compact=false — полноразмерный блок с заголовком (страница
 * /reviews).
 */
export function LettersSection({
  compact = false,
  headingLevel = "h2",
}: {
  compact?: boolean;
  headingLevel?: "h1" | "h2";
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const Heading = headingLevel;
  const active = openIndex !== null ? LETTERS[openIndex] : null;

  return (
    <section className={compact ? undefined : "border-border border-b"}>
      <div className={cn("container-page", compact ? "pb-14 sm:pb-20" : "py-20 lg:py-28")}>
        {compact ? (
          <Reveal className="flex flex-wrap items-center gap-4 sm:gap-5">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Нам доверяют
            </p>
            <div className="flex gap-3">
              {LETTERS.map((letter, index) => (
                <LetterThumb
                  key={letter.src}
                  letter={letter}
                  onClick={() => setOpenIndex(index)}
                  className="w-14 sm:w-16"
                />
              ))}
            </div>
          </Reveal>
        ) : (
          <>
            <Reveal>
              <Heading className="font-display text-3xl sm:text-4xl">
                Благодарственные и рекомендательные письма
              </Heading>
              <p className="text-muted-foreground mt-3 max-w-2xl text-[15px] leading-relaxed">
                Реальные письма от компаний, для которых мы разрабатывали комплект документов по
                защите персональных данных.
              </p>
            </Reveal>

            <div className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
              {LETTERS.map((letter, index) => (
                <Reveal key={letter.src} delay={index * 0.06}>
                  <LetterThumb
                    letter={letter}
                    onClick={() => setOpenIndex(index)}
                    className="w-full"
                  />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-2xl p-3 sm:p-4">
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
          </DialogHeader>
          {active && (
            <Image
              src={active.src}
              alt={active.alt}
              width={active.width}
              height={active.height}
              className="h-auto w-full rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function LetterThumb({
  letter,
  onClick,
  className,
}: {
  letter: (typeof LETTERS)[number];
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Открыть письмо: ${letter.title}`}
      className={cn(
        "border-border-strong hover:border-accent focus-visible:ring-ring block shrink-0 overflow-hidden rounded-md border shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      <Image
        src={letter.src}
        alt={letter.alt}
        width={letter.width}
        height={letter.height}
        className="aspect-3/4 w-full object-cover"
      />
    </button>
  );
}
