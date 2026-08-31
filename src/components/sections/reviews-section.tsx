import { Star, MessageSquareText } from "lucide-react";
import { ReviewRepository } from "@/server/reviews/repository";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Reveal } from "@/components/motion/reveal";

export async function ReviewsSection({
  limit,
  showHeading = true,
  headingLevel = "h2",
}: {
  limit?: number;
  showHeading?: boolean;
  /** "h1" на самостоятельной странице /reviews, "h2" при встраивании в главную. */
  headingLevel?: "h1" | "h2";
}) {
  const reviews = await ReviewRepository.listPublished(limit);
  const Heading = headingLevel;

  return (
    <section className="border-border border-b">
      <div className="container-page py-20 lg:py-28">
        {showHeading && (
          <Reveal>
            <Heading className="font-display text-3xl sm:text-4xl">Отзывы клиентов</Heading>
          </Reveal>
        )}

        {reviews.length === 0 ? (
          <div className="border-border-strong mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
            <MessageSquareText className="text-muted-foreground size-8" />
            <p className="text-muted-foreground max-w-md text-[15px]">
              Раздел отзывов пока наполняется. Реальные отзывы клиентов появятся здесь по мере
              поступления — мы не публикуем ничего, кроме подтверждённых оценок.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <Reveal
                key={review.id}
                delay={(index % 3) * 0.06}
                className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
              >
                {review.rating && (
                  <div className="flex gap-0.5" aria-label={`Оценка: ${review.rating} из 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4"
                        fill={i < review.rating! ? "currentColor" : "none"}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                )}
                <p className="text-foreground text-[15px] leading-relaxed">{review.text}</p>
                <div className="text-muted-foreground mt-auto flex items-center justify-between pt-2 text-sm">
                  <span className="text-foreground font-medium">{review.authorName}</span>
                  {review.sourceUrl && (
                    <TrackedLink
                      href={review.sourceUrl}
                      eventType="external_link_click"
                      sourceElement="review_source_link"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="hover:text-foreground underline underline-offset-2"
                    >
                      {review.source === "avito" ? "Avito" : "Источник"}
                    </TrackedLink>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
