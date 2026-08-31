import type { Metadata, Viewport } from "next";
import { manrope, ptSerif } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { clientEnv } from "@/lib/env.client";
import "./globals.css";

/**
 * Корневой layout — общий для публичного сайта И админки: шрифты,
 * тема (light/dark) и уважение prefers-reduced-motion нужны обоим.
 * Header/Footer/диалоги заявки-квиза/cookie-баннер/публичная аналитика
 * подключены ниже, в src/app/(public)/layout.tsx — админ-панели они
 * не нужны и не должны показываться поверх AdminShell.
 */

const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "БАЛАНС КУЗНЕЦОВЫ — юридические документы и защита персональных данных",
    template: "%s — БАЛАНС КУЗНЕЦОВЫ",
  },
  description:
    "Разработка юридических документов и защита персональных данных для бизнеса. Договоры, документы для сайтов, регистрация товарных знаков, сопровождение в Роскомнадзоре по 152-ФЗ.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${manrope.variable} ${ptSerif.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
