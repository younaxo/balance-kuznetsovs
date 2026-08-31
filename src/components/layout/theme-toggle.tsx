"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animateThemeChange } from "@/lib/view-transition-theme";

// Флаг гидратации без useEffect: useSyncExternalStore с "пустой" подпиской
// возвращает false на сервере и при первом клиентском рендере (совпадают —
// нет hydration mismatch), а затем true — ровно тот момент, когда next-themes
// уже знает реальную тему. Устоявшийся React-паттерн для подобных флагов.
function useHasMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  if (!mounted) {
    // Пустая "заглушка" того же размера, чтобы не было прыжка layout
    // до гидратации (next-themes не знает тему на сервере).
    return <div className="size-10" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  function handleToggle() {
    const next = isDark ? "light" : "dark";
    const rect = buttonRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    animateThemeChange(() => setTheme(next), origin);
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      onClick={handleToggle}
    >
      {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </Button>
  );
}
