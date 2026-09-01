"use client";

import { motion } from "motion/react";
import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";

/**
 * Hero без стоковых фото — крупная типографика, тонкая архитектурная
 * геометрия (документы/линии) и монограмма как декоративный акцент.
 * Текст заголовка/подзаголовка/CTA — дословно из ТЗ, не переписывается.
 */
export function HeroSection() {
  const { openApplication, openQuiz } = useDialogs();

  return (
    <section className="border-border relative overflow-hidden border-b">
      <HeroBackdrop />
      <div className="container-page relative py-24 sm:py-32 lg:py-40">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase"
        >
          «Баланс Кузнецовы»
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mt-6 max-w-4xl text-[2.5rem] leading-[1.08] sm:text-6xl lg:text-7xl"
        >
          Разработка юридических документов и защита персональных данных для вашего бизнеса
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-muted-foreground mt-8 max-w-2xl text-base leading-relaxed sm:text-lg"
        >
          Готовые решения для сайтов, интернет-магазинов, ИП и ООО. Регистрация товарных знаков и
          сопровождение в Роскомнадзоре по 152-ФЗ. Работаем удаленно по всей РФ.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <TrackedButton
            size="lg"
            eventType="cta_click"
            sourceElement="hero_primary_cta"
            onClick={() => openApplication({ sourceElement: "hero" })}
          >
            Оставить заявку
          </TrackedButton>
          <TrackedButton
            size="lg"
            variant="outline"
            eventType="cta_click"
            sourceElement="hero_secondary_cta"
            onClick={() => openQuiz({ sourceElement: "hero" })}
          >
            Рассчитать стоимость
          </TrackedButton>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Собственная line-art композиция вместо стоковых фото и вместо
 * "generic" концентрических кругов: веер юридических документов —
 * та же визуальная система, что и в src/components/icons/legal-illustrations.tsx,
 * увеличенная до масштаба фона.
 */
function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg
        className="text-border-strong absolute top-1/2 -right-16 h-136 w-120 -translate-y-1/2 opacity-[0.55] sm:-right-4 lg:right-8"
        viewBox="0 0 480 560"
        fill="none"
        strokeWidth="1.1"
      >
        {/* три перекрывающихся "листа" документа с уголком-сгибом */}
        <g transform="rotate(-8 240 280)">
          <path d="M120 60 H340 V440 H120 Z" stroke="currentColor" fill="var(--color-background)" />
          <path d="M300 60 V100 H340 Z" stroke="currentColor" fill="var(--color-background)" />
        </g>
        <g transform="rotate(3 240 280)">
          <path d="M140 90 H380 V480 H140 Z" stroke="currentColor" fill="var(--color-background)" />
          <path d="M340 90 V130 H380 Z" stroke="currentColor" fill="var(--color-background)" />
          <line x1="170" y1="180" x2="340" y2="180" stroke="currentColor" opacity="0.6" />
          <line x1="170" y1="220" x2="340" y2="220" stroke="currentColor" opacity="0.6" />
          <line x1="170" y1="260" x2="290" y2="260" stroke="currentColor" opacity="0.6" />
        </g>
        <g transform="rotate(14 240 280)">
          <path
            d="M100 140 H320 V520 H100 Z"
            stroke="currentColor"
            fill="var(--color-background)"
          />
          <path d="M280 140 V180 H320 Z" stroke="currentColor" fill="var(--color-background)" />
          <path
            d="M140 420 q30 -30 60 0 q30 -30 60 0"
            stroke="currentColor"
            strokeLinecap="round"
          />
        </g>
        {/* точечная сетка-акцент, как в library иллюстраций */}
        <g fill="currentColor" opacity="0.4">
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2].map((col) => (
              <circle key={`${row}-${col}`} cx={30 + col * 16} cy={40 + row * 16} r="1.6" />
            )),
          )}
        </g>
      </svg>

      <svg
        className="text-border absolute bottom-0 left-1/2 h-64 w-[140%] -translate-x-1/2 opacity-70"
        viewBox="0 0 1000 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d="M0 40 H1000" stroke="currentColor" strokeWidth="1" />
        <path d="M0 70 H1000" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}
