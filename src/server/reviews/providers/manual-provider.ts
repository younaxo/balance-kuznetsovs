import "server-only";
import type { ImportedReview, ReviewImportResult, ReviewProvider } from "./types";

/**
 * "Импорт" отзыва, введённого администратором вручную (например,
 * скопированного из закрытого личного кабинета Avito, из мессенджера
 * или полученного по email) — с честным указанием источника в БД.
 */
export class ManualReviewProvider implements ReviewProvider {
  readonly source = "manual" as const;

  constructor(private readonly review: ImportedReview) {}

  async fetchReviews(): Promise<ReviewImportResult> {
    return { imported: [this.review] };
  }
}
