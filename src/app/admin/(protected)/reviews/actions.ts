"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { reviews } from "@/server/db/schema";
import { reviewUpsertSchema } from "@/server/validation/admin";
import { ManualReviewProvider } from "@/server/reviews/providers/manual-provider";
import { ReviewRepository } from "@/server/reviews/repository";
import type { AdminActionState } from "@/server/admin/action-state";

/**
 * Ручной импорт отзыва (см. ReviewProvider/AvitoReviewProvider/
 * ManualReviewProvider) — единственный доступный сейчас способ добавить
 * отзыв с источником Avito, так как публичная страница профиля закрыта
 * antibot-firewall (см. DECISIONS.md).
 */
export async function importReviewAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const parsed = reviewUpsertSchema.safeParse({
    authorName: formData.get("authorName"),
    text: formData.get("text"),
    rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
    source: formData.get("source"),
    sourceUrl: formData.get("sourceUrl") || "",
    reviewedAt: formData.get("reviewedAt") || "",
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const provider = new ManualReviewProvider({
    authorName: parsed.data.authorName,
    text: parsed.data.text,
    rating: parsed.data.rating,
    sourceUrl: parsed.data.sourceUrl || undefined,
    reviewedAt: parsed.data.reviewedAt ? new Date(parsed.data.reviewedAt) : undefined,
  });
  const { imported } = await provider.fetchReviews();
  const review = imported[0];

  await ReviewRepository.create({
    authorName: review.authorName,
    text: review.text,
    rating: review.rating,
    source: parsed.data.source,
    sourceUrl: review.sourceUrl,
    reviewedAt: review.reviewedAt,
    isPublished: parsed.data.isPublished,
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  return { ok: true };
}

export async function togglePublishReviewAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const id = formData.get("id");
  const isPublished = formData.get("isPublished") === "true";
  if (typeof id !== "string") return { ok: false, error: "Некорректный id" };

  await ReviewRepository.setPublished(id, !isPublished);
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteReviewAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false, error: "Некорректный id" };

  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  return { ok: true };
}
