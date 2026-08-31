"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Обёртка над next-themes: атрибут data-theme (совпадает с токенами
 * в globals.css), системная тема по умолчанию, без "мигания" неверной
 * темы при загрузке (next-themes инлайнит синхронный скрипт в <head>).
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
