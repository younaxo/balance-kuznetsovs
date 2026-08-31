"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { PriceRepository } from "@/server/pricing/repository";
import { priceItemUpsertSchema } from "@/server/validation/admin";
import type { AdminActionState } from "@/server/admin/action-state";

export async function upsertPriceItemAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const rawPrice = formData.get("priceFromKopecks");
  const parsed = priceItemUpsertSchema.safeParse({
    id: formData.get("id") || undefined,
    serviceSlug: formData.get("serviceSlug") || "",
    title: formData.get("title"),
    description: formData.get("description") || "",
    priceFromKopecks: rawPrice ? Math.round(Number(rawPrice) * 100) : undefined,
    unit: formData.get("unit") || "",
    order: Number(formData.get("order")) || 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }

  const { id, serviceSlug, description, unit, ...rest } = parsed.data;
  const data = {
    ...rest,
    serviceSlug: serviceSlug || null,
    description: description || null,
    unit: unit || null,
  };

  if (id) {
    await PriceRepository.update(id, data);
  } else {
    await PriceRepository.create(data);
  }
  revalidatePath("/admin/prices");
  revalidatePath("/prices");
  return { ok: true };
}

export async function deletePriceItemAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Unauthorized" };

  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false, error: "Некорректный id" };

  await PriceRepository.remove(id);
  revalidatePath("/admin/prices");
  revalidatePath("/prices");
  return { ok: true };
}
