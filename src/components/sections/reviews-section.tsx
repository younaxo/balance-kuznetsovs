import { Star, Lock } from "lucide-react";
import { ReviewRepository } from "@/server/reviews/repository";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Reveal } from "@/components/motion/reveal";
import { AvitoMark } from "@/components/icons/avito-mark";
import { REVIEW_PROFILES } from "@/domain/review-profiles";

// Заглушка-"спойлер" для пока не запущенного раздела отзывов: несколько
// нейтральных скелетон-карточек размыты фоном, поверх — плашка
// "в разработке". Смысл — показать, что раздел существует и скоро
// появится, а не просто пустой блок с текстом.
const PLACEHOLDER_CARDS = [1, 2, 3];

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
          <div className="relative mt-10">
            <div
              aria-hidden="true"
              className="pointer-events-none grid gap-6 blur-[3px] select-none sm:grid-cols-2 lg:grid-cols-3"
            >
              {PLACEHOLDER_CARDS.map((i) => (
                <div
                  key={i}
                  className="border-border bg-surface flex flex-col gap-4 rounded-lg border p-6"
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="size-4 text-yellow-400"
                        fill="currentColor"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <div className="bg-muted h-3 w-full rounded" />
                  <div className="bg-muted h-3 w-4/5 rounded" />
                  <div className="bg-muted mt-auto h-3 w-1/3 rounded" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-border-strong bg-background/95 flex flex-col items-center gap-2 rounded-lg border px-8 py-6 text-center shadow-sm">
                <Lock className="text-muted-foreground size-6" />
                <p className="font-medium">Раздел в разработке</p>
                <p className="text-muted-foreground max-w-xs text-sm">
                  Реальные отзывы клиентов появятся здесь совсем скоро. А пока их можно почитать на
                  внешних площадках:
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-2">
                  {REVIEW_PROFILES.map((profile) => (
                    <TrackedLink
                      key={profile.url}
                      href={profile.url}
                      eventType="external_link_click"
                      sourceElement="reviews_placeholder_profile"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="border-border-strong hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
                    >
                      {profile.platform === "avito" && <AvitoMark className="text-accent size-4" />}
                      Отзывы на {profile.label}
                    </TrackedLink>
                  ))}
                </div>
              </div>
            </div>
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
                      className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
                    >
                      {review.source === "avito" && <AvitoMark className="size-3.5" />}
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
