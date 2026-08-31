"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { services } from "@/server/db/schema";
import { z } from "zod";

const upsertSchema = z.object({
  id: z.uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  title: z.string().trim().min(1).max(300),
  summary: z.string().trim().min(1).max(2000),
  order: z.coerce.number().int().default(0),
  isPublished: z.coerce.boolean(),
});

export async function upsertExtraServiceAction(formData: FormData): Promise<void> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");

  const parsed = upsertSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    order: formData.get("order") || 0,
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Некорректные данные");

  const { id, ...data } = parsed.data;
  if (id) {
    await db
      .update(services)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(services.id, id));
  } else {
    await db.insert(services).values(data);
  }
  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function deleteExtraServiceAction(formData: FormData): Promise<void> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Некорректный id");

  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/services");
}
