import { Logo } from "@/components/brand/logo";
import { KodvenLogo } from "@/components/brand/kodven-logo";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NAV_ITEMS } from "./nav-items";
import { ServiceRepository } from "@/server/services/repository";
import { getContactSettings } from "@/server/content/contact-settings";

const LEGAL_LINKS = [
  { label: "Политика конфиденциальности", href: "/privacy" },
  { label: "Согласие на обработку ПДн", href: "/personal-data-consent" },
  { label: "Cookie policy", href: "/cookies" },
  { label: "Пользовательское соглашение", href: "/terms" },
];

export async function SiteFooter() {
  const [contacts, services] = await Promise.all([
    getContactSettings(),
    ServiceRepository.listPublished(),
  ]);
  const hasContacts =
    contacts.phone || contacts.email || contacts.telegram || contacts.maxMessenger;

  return (
    <footer className="border-graphite-border bg-graphite text-graphite-foreground border-t">
      <div className="container-page flex flex-col items-center py-16 text-center">
        <TrackedLink href="/" sourceElement="footer_logo">
          <Logo height={34} />
        </TrackedLink>
        <p className="text-graphite-foreground/60 mt-5 max-w-md text-sm">
          Юридические документы и защита персональных данных для бизнеса. Работаем удалённо по всей
          РФ.
        </p>

        <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          <FooterColumn title="Навигация">
            {NAV_ITEMS.map((item) => (
              <FooterLink key={item.href} href={item.href} source={`footer_nav_${item.href}`}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Услуги">
            {services.map((service) => (
              <FooterLink
                key={service.slug}
                href={`/services#${service.slug}`}
                source={`footer_service_${service.slug}`}
              >
                {service.title}
              </FooterLink>
            ))}
          </FooterColumn>

          {hasContacts && (
            <FooterColumn title="Контакты">
              {contacts.phone && (
                <FooterLink
                  href={`tel:${contacts.phone}`}
                  source="footer_phone"
                  event="phone_click"
                >
                  {contacts.phone}
                </FooterLink>
              )}
              {contacts.email && (
                <FooterLink
                  href={`mailto:${contacts.email}`}
                  source="footer_email"
                  event="email_click"
                >
                  {contacts.email}
                </FooterLink>
              )}
              {contacts.telegram && (
                <FooterLink
                  href={contacts.telegram}
                  source="footer_telegram"
                  event="telegram_click"
                >
                  Telegram
                </FooterLink>
              )}
            </FooterColumn>
          )}

          <FooterColumn title="Документы">
            {LEGAL_LINKS.map((item) => (
              <FooterLink key={item.href} href={item.href} source={`footer_legal_${item.href}`}>
                {item.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>
      </div>

      <div className="border-graphite-border border-t">
        <div className="container-page text-graphite-foreground/50 flex flex-col items-center justify-center gap-2 py-6 text-center text-xs">
          <p>© {new Date().getFullYear()} БАЛАНС КУЗНЕЦОВЫ. Все права защищены.</p>
          <p className="flex items-center gap-1.5">
            Разработано{" "}
            <TrackedLink
              href="https://profi.ru/profile/BaranovKA34"
              eventType="external_link_click"
              sourceElement="footer_developer_credit"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:text-graphite-foreground inline-flex items-center underline underline-offset-2"
            >
              <KodvenLogo className="inline-block" />
            </TrackedLink>
            {" · Developed by "}
            <TrackedLink
              href="https://github.com/younaxo"
              eventType="external_link_click"
              sourceElement="footer_github_credit"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="hover:text-graphite-foreground underline underline-offset-2"
            >
              younaxo
            </TrackedLink>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-left">
      <h3 className="text-graphite-foreground/50 text-xs font-medium tracking-wider uppercase">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  source,
  event,
  children,
}: {
  href: string;
  source: string;
  event?: "phone_click" | "email_click" | "telegram_click";
  children: React.ReactNode;
}) {
  return (
    <li>
      <TrackedLink
        href={href}
        sourceElement={source}
        eventType={event}
        className="text-graphite-foreground/75 hover:text-graphite-foreground text-sm transition-colors"
      >
        {children}
      </TrackedLink>
    </li>
  );
}
