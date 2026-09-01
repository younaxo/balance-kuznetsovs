import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailSection } from "@/components/sections/service-detail-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { ServiceRepository } from "@/server/services/repository";

export const metadata: Metadata = {
  description:
    "Юридическое сопровождение защиты бренда, логотипа или названия в Роспатенте: проверка на уникальность, подготовка заявки, ведение делопроизводства.",
};

export default async function TrademarksPage() {
  const service = await ServiceRepository.findBySlug("trademarks");
  if (!service || !service.isPublished) notFound();

  return (
    <>
      <ServiceDetailSection service={service} />
      <FinalCtaSection />
    </>
  );
}
