import type { Metadata } from "next";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { LettersSection } from "@/components/sections/letters-section";

export const metadata: Metadata = {
  description: "Отзывы клиентов «Баланс Кузнецовы».",
};

export default function ReviewsPage() {
  return (
    <>
      <ReviewsSection headingLevel="h1" />
      <LettersSection />
    </>
  );
}
