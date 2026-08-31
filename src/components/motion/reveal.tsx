"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Лёгкий scroll-reveal: элемент проявляется один раз при попадании
 * в область просмотра. Быстро (0.5s), без отскоков — премиальное,
 * а не "playful" движение. С prefers-reduced-motion анимация
 * автоматически отключается через MotionProvider (reducedMotion="user").
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
  id?: string;
}) {
  const MotionTag = as === "li" ? motion.li : motion.div;
  return (
    <MotionTag
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={variants}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/** Контейнер для stagger-эффекта у дочерних <Reveal>. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: stagger }}
    >
      {children}
    </motion.div>
  );
}
