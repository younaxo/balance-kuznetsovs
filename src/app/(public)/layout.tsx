import { DialogsProvider } from "@/components/dialogs/dialog-manager";
import { ApplicationDialog } from "@/components/forms/application-dialog";
import { QuizDialog } from "@/components/quiz/quiz-dialog";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { YandexMetrica } from "@/components/analytics/yandex-metrica";
import { CookieConsentBanner } from "@/components/consent/cookie-consent-banner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/**
 * Layout публичного сайта: header, footer, диалоги заявки/квиза,
 * cookie-баннер, first-party аналитика и Яндекс.Метрика. Не применяется
 * к /admin/* — та ветка использует только корневой layout + AdminShell.
 *
 * force-dynamic: SiteFooter читает контакты из БД на каждой странице
 * (через этот layout), а контент услуг/прайса/отзывов управляется из
 * админки и должен быть виден сразу после сохранения. Статическая
 * генерация также требовала бы живого PostgreSQL прямо во время
 * `next build` (в т.ч. внутри изолированного Docker-билда, где реальной
 * БД нет и быть не должно) — динамический рендер снимает эту зависимость.
 */
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <DialogsProvider>
      <a
        href="#main-content"
        className="glass-surface fixed top-4 left-4 z-100 -translate-y-20 rounded-md px-4 py-2 text-sm font-medium transition-transform focus:translate-y-0"
      >
        Перейти к содержанию
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <ApplicationDialog />
      <QuizDialog />
      <CookieConsentBanner />
      <AnalyticsProvider />
      <YandexMetrica />
    </DialogsProvider>
  );
}
