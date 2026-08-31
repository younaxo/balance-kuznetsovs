import { Logo } from "@/components/brand/logo";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NAV_ITEMS } from "./nav-items";
import { SERVICES } from "@/domain/services";
import { getContactSettings } from "@/server/content/contact-settings";

const LEGAL_LINKS = [
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Согласие на обработку ПДн", href: "/personal-data-consent" },
  { label: "Cookie policy", href: "/cookies" },
  { label: "Пользовательское соглашение", href: "/terms" },
];

export async function SiteFooter() {
  const contacts = await getContactSettings();
  const hasContacts =
    contacts.phone || contacts.email || contacts.telegram || contacts.maxMessenger;

  return (
    <footer className="border-graphite-border bg-graphite text-graphite-foreground border-t">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <TrackedLink href="/" sourceElement="footer_logo">
            <Logo height={34} />
          </TrackedLink>
          <p className="text-graphite-foreground/60 mt-5 max-w-xs text-sm">
            Юридические документы и защита персональных данных для бизнеса. Работаем удалённо по
            всей РФ.
          </p>
        </div>

        <div>
          <h3 className="text-graphite-foreground/50 text-xs font-medium tracking-wider uppercase">
            Навигация
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <TrackedLink
                  href={item.href}
                  sourceElement={`footer_nav_${item.href}`}
                  className="text-graphite-foreground/75 hover:text-graphite-foreground text-sm transition-colors"
                >
                  {item.label}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-graphite-foreground/50 text-xs font-medium tracking-wider uppercase">
            Услуги
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <TrackedLink
                  href={`/services#${service.slug}`}
                  sourceElement={`footer_service_${service.slug}`}
                  className="text-graphite-foreground/75 hover:text-graphite-foreground text-sm transition-colors"
                >
                  {service.title}
                </TrackedLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8">
          {hasContacts && (
            <div>
              <h3 className="text-graphite-foreground/50 text-xs font-medium tracking-wider uppercase">
                Контакты
              </h3>
              <ul className="text-graphite-foreground/75 mt-4 flex flex-col gap-2.5 text-sm">
                {contacts.phone && (
                  <li>
                    <TrackedLink
                      href={`tel:${contacts.phone}`}
                      eventType="phone_click"
                      sourceElement="footer_phone"
                    >
                      {contacts.phone}
                    </TrackedLink>
                  </li>
                )}
                {contacts.email && (
                  <li>
                    <TrackedLink
                      href={`mailto:${contacts.email}`}
                      eventType="email_click"
                      sourceElement="footer_email"
                    >
                      {contacts.email}
                    </TrackedLink>
                  </li>
                )}
                {contacts.telegram && (
                  <li>
                    <TrackedLink
                      href={contacts.telegram}
                      eventType="telegram_click"
                      sourceElement="footer_telegram"
                    >
                      Telegram
                    </TrackedLink>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-graphite-foreground/50 text-xs font-medium tracking-wider uppercase">
              Документы
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <TrackedLink
                    href={item.href}
                    sourceElement={`footer_legal_${item.href}`}
                    className="text-graphite-foreground/75 hover:text-graphite-foreground text-sm transition-colors"
                  >
                    {item.label}
                  </TrackedLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-graphite-border border-t">
        <div className="container-page text-graphite-foreground/50 flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} БАЛАНС КУЗНЕЦОВЫ. Все права защищены.</p>
          <p>
            Разработано{" "}
            <TrackedLink
              href="https://profi.ru/"
              eventType="external_link_click"
              sourceElement="footer_developer_credit"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:text-graphite-foreground underline underline-offset-2"
            >
              KODVEN STUDIO
            </TrackedLink>
            {" · "}Developed by younaxo
          </p>
        </div>
      </div>
    </footer>
  );
}
