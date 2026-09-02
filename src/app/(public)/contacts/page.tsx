import type { Metadata } from "next";
import { Phone, Mail, Send, MessageCircle, MapPin, Clock } from "lucide-react";
import { getContactSettings } from "@/server/content/contact-settings";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { ApplicationForm } from "@/components/forms/application-form";
import { ServiceRepository } from "@/server/services/repository";

export const metadata: Metadata = {
  description: "Свяжитесь с «Баланс Кузнецовы».",
};

export default async function ContactsPage() {
  const [contacts, services] = await Promise.all([
    getContactSettings(),
    ServiceRepository.listPublished(),
  ]);
  const hasAnyContact =
    contacts.phone ||
    contacts.email ||
    contacts.telegram ||
    contacts.maxMessenger ||
    contacts.address;

  return (
    <section>
      <div className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Контакты</h1>
          <p className="text-muted-foreground mt-4 max-w-md text-[15px] leading-relaxed">
            Оставьте заявку через форму — это самый быстрый способ связаться с нами. Мы работаем
            удалённо по всей РФ.
          </p>

          {hasAnyContact ? (
            <ul className="mt-8 flex flex-col gap-4">
              {contacts.phone && (
                <ContactRow
                  icon={Phone}
                  href={`tel:${contacts.phone}`}
                  label={contacts.phone}
                  event="phone_click"
                />
              )}
              {contacts.email && (
                <ContactRow
                  icon={Mail}
                  href={`mailto:${contacts.email}`}
                  label={contacts.email}
                  event="email_click"
                />
              )}
              {contacts.telegram && (
                <ContactRow
                  icon={Send}
                  href={contacts.telegram}
                  label="Telegram"
                  event="telegram_click"
                />
              )}
              {contacts.maxMessenger && (
                <ContactRow
                  icon={MessageCircle}
                  href={contacts.maxMessenger}
                  label="MAX"
                  event="max_click"
                />
              )}
              {contacts.address && <StaticRow icon={MapPin} label={contacts.address} />}
              {contacts.workingHours && <StaticRow icon={Clock} label={contacts.workingHours} />}
            </ul>
          ) : (
            <p className="border-border-strong text-muted-foreground mt-8 rounded-md border border-dashed p-5 text-sm">
              Контактные данные уточняются — используйте, пожалуйста, форму заявки, мы свяжемся с
              вами сами.
            </p>
          )}
        </div>

        <div className="border-border bg-surface rounded-lg border p-6 sm:p-8">
          <h2 className="font-display text-xl">Оставить заявку</h2>
          <div className="mt-6">
            <ApplicationForm services={services.map((s) => ({ slug: s.slug, title: s.title }))} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  href,
  label,
  event,
}: {
  icon: typeof Phone;
  href: string;
  label: string;
  event: "phone_click" | "email_click" | "telegram_click" | "max_click";
}) {
  return (
    <li className="flex items-center gap-3">
      <Icon className="text-muted-foreground size-5" />
      <TrackedLink
        href={href}
        eventType={event}
        sourceElement="contacts_page"
        className="hover:text-accent text-[15px]"
      >
        {label}
      </TrackedLink>
    </li>
  );
}

function StaticRow({ icon: Icon, label }: { icon: typeof Phone; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <Icon className="text-muted-foreground size-5" />
      <span className="text-foreground text-[15px]">{label}</span>
    </li>
  );
}
