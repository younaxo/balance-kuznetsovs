import type { Metadata } from "next";
import { PricesSection } from "@/components/sections/prices-section";

export const metadata: Metadata = {
  description: "Стоимость юридических услуг «Баланс Кузнецовы».",
};

export default function PricesPage() {
  return <PricesSection />;
}
