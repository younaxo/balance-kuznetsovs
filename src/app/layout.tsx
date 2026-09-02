import type { Metadata, Viewport } from "next";
import { manrope, ptSerif } from "@/lib/fonts";
import { MotionProvider } from "@/components/motion/motion-provider";
import { clientEnv } from "@/lib/env.client";
import "./globals.css";

/**
 * Корневой layout — общий для публичного сайта И админки: шрифты и
 * уважение prefers-reduced-motion нужны обоим. Сайт только светлый
 * (тёмная тема убрана), поэтому отдельного theme-provider больше нет.
 * Header/Footer/диалоги заявки-квиза/cookie-баннер/публичная аналитика
 * подключены ниже, в src/app/(public)/layout.tsx — админ-панели они
 * не нужны и не должны показываться поверх AdminShell.
 */

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // По просьбе владельца — везде в браузерной вкладке просто «БАЛАНС
  // КУЗНЕЦОВЫ», без "Страница — ...". Страничные title.tsx/metadata
  // ниже по дереву не переопределяют его (см. остальные page.tsx).
  title: "БАЛАНС КУЗНЕЦОВЫ",
  description:
    "Разработка юридических документов и защита персональных данных для бизнеса. Договоры, документы для сайтов, регистрация товарных знаков, сопровождение в Роскомнадзоре по 152-ФЗ.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${ptSerif.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
