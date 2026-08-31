import type { Metadata } from "next";
import { ServiceDetailSection } from "@/components/sections/service-detail-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export const metadata: Metadata = {
  title: "152-ФЗ и Роскомнадзор",
  description:
    "Подготовка бизнеса к требованиям Роскомнадзора «под ключ»: уведомление, приказы, политика ПДн, инструкции по безопасности, журналы и акты классификации ИСПДн.",
};

export default function PersonalDataLawPage() {
  return (
    <>
      <ServiceDetailSection slug="personal-data-152fz" />
      <FinalCtaSection />
    </>
  );
}
