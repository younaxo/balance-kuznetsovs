"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (!mounted) {
    // Пустая "заглушка" того же размера, чтобы не было прыжка layout
    // до гидратации (next-themes не знает тему на сервере).
    return <div className="size-10" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </Button>
  );
}
