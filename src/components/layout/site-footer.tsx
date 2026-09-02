import { Logo } from "@/components/brand/logo";
import { KodvenLogo } from "@/components/brand/kodven-logo";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NAV_ITEMS } from "./nav-items";
import { ServiceRepository } from "@/server/services/repository";
import { getContactSettings } from "@/server/content/contact-settings";

const LEGAL_LINKS = [
  { label: "Политика обработки ПДн", href: "/privacy" },
  { label: "Политика конфиденциальности", href: "/confidentiality" },
  { label: "Публичная оферта", href: "/offer" },
  { label: "Согласие на обработку ПДн", href: "/personal-data-consent" },
  { label: "Пользовательское соглашение", href: "/terms" },
];

export async function SiteFooter() {
  const [contacts, services] = await Promise.all([
    getContactSettings(),
    ServiceRepository.listPublished(),
  ]);
  const hasContacts =
    contacts.phone || contacts.email || contacts.telegram || contacts.maxMessenger;
  const hasOperatorInfo = contacts.operatorFullName || contacts.operatorInn;

  return (
    <footer className="bg-graphite text-graphite-foreground print:hidden">
      <div className="container-page py-16">
        {/* Лого + копирайт/реквизиты — полноширинный блок, а НЕ узкая
            колонка грида ниже: только так у длинных строк реквизитов
            хватает места не переноситься на sm-экранах и шире (на
            телефонах перенос всё равно неизбежен — иначе горизонтальный
            скролл, что строго хуже). */}
        <div className="flex flex-col items-start gap-5">
          <TrackedLink href="/" sourceElement="footer_logo">
            <Logo height={64} variant="dark" />
          </TrackedLink>

          <div className="text-graphite-foreground/60 flex flex-col gap-1 text-sm leading-relaxed">
            <p className="whitespace-normal sm:whitespace-nowrap">
              © {new Date().getFullYear()} Баланс Кузнецовы. Все права защищены.
            </p>

            {/* Реквизиты оператора — только реальные, из БД (см. /admin/contacts —
                там они уже не редактируются). Пока не заполнены, блок просто не
                показывается — никаких выдуманных ООО/ИНН на публичном сайте. */}
            {hasOperatorInfo && (
              <>
                {contacts.operatorFullName && (
                  <p className="whitespace-normal sm:whitespace-nowrap">
                    {contacts.operatorStatus
                      ? `${contacts.operatorStatus} ${contacts.operatorFullName}`
                      : contacts.operatorFullName}
                  </p>
                )}
                {contacts.operatorInn && (
                  <p className="whitespace-normal sm:whitespace-nowrap">
                    ИНН {contacts.operatorInn}
                  </p>
                )}
                {contacts.operatorEmail && (
                  <p className="whitespace-normal sm:whitespace-nowrap">{contacts.operatorEmail}</p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-4">
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

          <FooterColumn title="Документы">
            {LEGAL_LINKS.map((item) => (
              <FooterLink key={item.href} href={item.href} source={`footer_legal_${item.href}`}>
                {item.label}
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
              {contacts.maxMessenger && (
                <FooterLink href={contacts.maxMessenger} source="footer_max" event="max_click">
                  MAX
                </FooterLink>
              )}
            </FooterColumn>
          )}
        </div>
      </div>

      <div className="container-page text-graphite-foreground/50 flex flex-col items-center gap-1 py-6 text-center text-xs">
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
        </p>
        <p className="flex items-center gap-1.5">
          Developed by{" "}
          <TrackedLink
            href="https://github.com/younaxo"
            eventType="external_link_click"
            sourceElement="footer_github_credit"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="hover:text-graphite-foreground inline-flex items-center gap-1 underline underline-offset-2"
          >
            <GithubMark className="size-3.5" />
            younaxo
          </TrackedLink>
          {" & "}
          <TrackedLink
            href="https://github.com/kleek-code"
            eventType="external_link_click"
            sourceElement="footer_github_credit_2"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="hover:text-graphite-foreground inline-flex items-center gap-1 underline underline-offset-2"
          >
            <GithubMark className="size-3.5" />
            kleek-code
          </TrackedLink>
        </p>
      </div>
    </footer>
  );
}

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.12 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
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
  event?: "phone_click" | "email_click" | "telegram_click" | "max_click";
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
