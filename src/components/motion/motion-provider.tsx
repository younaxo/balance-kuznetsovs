"use client";

import { MotionConfig } from "motion/react";

/**
 * reducedMotion="user" — библиотека сама уважает системную настройку
 * prefers-reduced-motion и автоматически отключает/упрощает анимации
 * во всех компонентах, использующих motion/react.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
