import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailSection } from "@/components/sections/service-detail-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { ServiceRepository } from "@/server/services/repository";

export const metadata: Metadata = {
  title: "152-ФЗ и Роскомнадзор",
  description:
    "Подготовка бизнеса к требованиям Роскомнадзора «под ключ»: уведомление, приказы, политика ПДн, инструкции по безопасности, журналы и акты классификации ИСПДн.",
};

export default async function PersonalDataLawPage() {
  const service = await ServiceRepository.findBySlug("personal-data-152fz");
  if (!service || !service.isPublished) notFound();

  return (
    <>
      <ServiceDetailSection service={service} />
      <FinalCtaSection />
    </>
  );
}
