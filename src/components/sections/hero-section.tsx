"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Gem, ScrollText } from "lucide-react";
import { TrackedButton } from "@/components/analytics/tracked-button";
import { useDialogs } from "@/components/dialogs/dialog-manager";
import mark from "../../../public/brand/mark.png";

/**
 * Hero почти без декора — крупная типографика плюс едва заметный
 * фирменный монограм-водяной знак справа (обрезается контейнером,
 * не создаёт "полосок", на которые раньше жаловался владелец — это
 * был line-art фон с "документами", убранный совсем; монограмма же
 * настолько бледная, что на мобильных экранах просто не видна).
 * Текст заголовка/подзаголовка/CTA — дословно из ТЗ, не переписывается.
 */
export function HeroSection() {
  const { openApplication, openQuiz } = useDialogs();

  return (
    <section className="border-border relative overflow-hidden border-b">
      <Image
        src={mark}
        alt=""
        aria-hidden="true"
        priority
        className="pointer-events-none absolute top-1/2 -right-16 hidden w-104 -translate-y-1/2 opacity-[0.05] select-none lg:block xl:right-0 xl:w-lg"
      />

      <div className="container-page relative py-24 sm:py-32 lg:py-40">
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

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="border-border mt-16 flex flex-wrap gap-x-14 gap-y-6 border-t pt-8 sm:mt-20"
        >
          <TrustBadge
            icon={Gem}
            title="Работаем по всей России"
            subtitle="Удалённо. Быстро. Конфиденциально."
          />
          <TrustBadge
            icon={ScrollText}
            title="Фиксированные цены"
            subtitle="Прозрачные условия и договор"
          />
        </motion.div>
      </div>
    </section>
  );
}

function TrustBadge({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Gem;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-accent size-6 shrink-0" strokeWidth={1.5} />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-[13px]">{subtitle}</p>
      </div>
    </div>
  );
}
