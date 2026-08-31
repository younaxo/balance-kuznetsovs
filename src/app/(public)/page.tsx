import { HeroSection } from "@/components/sections/hero-section";
import { TasksSection } from "@/components/sections/tasks-section";
import { ServicesSection } from "@/components/sections/services-section";
import { ProcessSection } from "@/components/sections/process-section";
import { AboutSection } from "@/components/sections/about-section";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { ContentBlockSection } from "@/components/sections/content-block-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TasksSection />
      <ServicesSection />
      {/* Блоки ниже управляются из /admin/content и появляются только
          после того, как владелец предоставит текст и опубликует их. */}
      <ContentBlockSection contentKey="why_us" className="border-border border-b" />
      <ContentBlockSection contentKey="service_includes" className="border-border border-b" />
      <ProcessSection />
      <ContentBlockSection
        contentKey="risks_without_documents"
        className="border-border border-b"
      />
      <AboutSection />
      <ContentBlockSection contentKey="company_stats" className="border-border border-b" />
      <ContentBlockSection contentKey="cases" className="border-border border-b" />
      <ReviewsSection limit={6} />
      <ContentBlockSection contentKey="guarantees" className="border-border border-b" />
      <ContentBlockSection contentKey="faq" className="border-border border-b" />
      <FinalCtaSection />
    </>
  );
}
