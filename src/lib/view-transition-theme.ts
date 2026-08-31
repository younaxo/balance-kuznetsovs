/**
 * "Большое" переключение темы: круг, расширяющийся из точки клика и
 * закрывающий весь экран новой темой — вместо мгновенной подмены
 * CSS-переменных. Использует нативный View Transitions API браузера
 * (без библиотек). При отсутствии поддержки или prefers-reduced-motion
 * — обычная мгновенная смена темы, без анимации.
 */
export function animateThemeChange(applyTheme: () => void, origin: { x: number; y: number }): void {
  const supportsViewTransitions = typeof document.startViewTransition === "function";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsViewTransitions || prefersReducedMotion) {
    applyTheme();
    return;
  }

  const transition = document.startViewTransition(() => {
    applyTheme();
  });

  transition.ready.then(() => {
    const endRadius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${origin.x}px ${origin.y}px)`,
          `circle(${endRadius}px at ${origin.x}px ${origin.y}px)`,
        ],
      },
      {
        duration: 620,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}
