export interface ImportedReview {
  authorName: string;
  text: string;
  rating?: number;
  sourceUrl?: string;
  reviewedAt?: Date;
}

export interface ReviewImportResult {
  imported: ImportedReview[];
  /** Человекочитаемое объяснение, если импорт не удался/недоступен. */
  notice?: string;
}

export interface ReviewProvider {
  readonly source: "avito" | "manual";
  fetchReviews(): Promise<ReviewImportResult>;
}
