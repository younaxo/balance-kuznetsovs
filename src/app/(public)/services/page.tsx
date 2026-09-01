import type { Metadata } from "next";
import { ServicesSection } from "@/components/sections/services-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export const metadata: Metadata = {
  description:
    "Защита персональных данных (152-ФЗ), регистрация товарных знаков, документы для сайтов, договоры под ключ, взыскание задолженности.",
};

export default function ServicesPage() {
  return (
    <>
      <ServicesSection headingLevel="h1" />
      <FinalCtaSection />
    </>
  );
}
