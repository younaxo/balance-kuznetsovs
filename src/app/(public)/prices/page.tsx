import type { Metadata } from "next";
import { PricesSection } from "@/components/sections/prices-section";

export const metadata: Metadata = {
  title: "Прайс",
  description: "Стоимость юридических услуг компании «Баланс Кузнецовы».",
};

export default function PricesPage() {
  return <PricesSection />;
}
