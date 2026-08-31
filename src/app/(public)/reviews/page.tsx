import type { Metadata } from "next";
import { ReviewsSection } from "@/components/sections/reviews-section";

export const metadata: Metadata = {
  title: "Отзывы",
  description: "Отзывы клиентов юридической компании «Баланс Кузнецовы».",
};

export default function ReviewsPage() {
  return <ReviewsSection headingLevel="h1" />;
}
