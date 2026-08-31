"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";
import { z } from "zod";

const schema = z.object({
  key: z.string().trim().min(1).max(150),
  title: z.string().trim().max(300).optional().or(z.literal("")),
  body: z.string().trim().max(10000).optional().or(z.literal("")),
  isPublished: z.boolean(),
});

export async function updateContentBlockAction(formData: FormData): Promise<void> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");

  const parsed = schema.safeParse({
    key: formData.get("key"),
    title: formData.get("title") || "",
    body: formData.get("body") || "",
    isPublished: formData.get("isPublished") === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Некорректные данные");

  await db
    .insert(contentBlocks)
    .values({
      key: parsed.data.key,
      title: parsed.data.title || null,
      body: parsed.data.body || null,
      isPublished: parsed.data.isPublished,
    })
    .onConflictDoUpdate({
      target: contentBlocks.key,
      set: {
        title: parsed.data.title || null,
        body: parsed.data.body || null,
        isPublished: parsed.data.isPublished,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/admin/content");
  revalidatePath("/");
}
