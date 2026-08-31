import type { Metadata } from "next";
import { ServiceDetailSection } from "@/components/sections/service-detail-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";

export const metadata: Metadata = {
  title: "Регистрация товарных знаков",
  description:
    "Юридическое сопровождение защиты бренда, логотипа или названия в Роспатенте: проверка на уникальность, подготовка заявки, ведение делопроизводства.",
};

export default function TrademarksPage() {
  return (
    <>
      <ServiceDetailSection slug="trademarks" />
      <FinalCtaSection />
    </>
  );
}
