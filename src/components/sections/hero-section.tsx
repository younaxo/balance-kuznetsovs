"use client";

import { motion } from "motion/react";
import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";

/**
 * Hero без стоковых фото и без декоративного фона — чистая крупная
 * типографика (раньше был line-art фон с "документами", но владелец
 * несколько раз жаловался на "полоски" в этой области, поэтому от
 * декора отказались совсем — так однозначно надёжнее). Текст
 * заголовка/подзаголовка/CTA — дословно из ТЗ, не переписывается.
 */
export function HeroSection() {
  const { openApplication, openQuiz } = useDialogs();

  return (
    <section className="border-border border-b">
      <div className="container-page py-24 sm:py-32 lg:py-40">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-4xl text-[2.5rem] leading-[1.08] sm:text-6xl lg:text-7xl"
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
