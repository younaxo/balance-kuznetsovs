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
          Юридическая компания «Баланс Кузнецовы»
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

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <svg
        className="text-border-strong absolute -top-24 -right-24 h-[36rem] w-[36rem] opacity-60 sm:-right-10"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="199" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1" />
        <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1" />
        <line x1="200" y1="1" x2="200" y2="399" stroke="currentColor" strokeWidth="1" />
        <line x1="1" y1="200" x2="399" y2="200" stroke="currentColor" strokeWidth="1" />
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
