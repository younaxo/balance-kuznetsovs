import "server-only";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const BANNER_IMAGES_DIR = path.join(process.cwd(), "public/banner");
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 МБ — маленькая иконка, с запасом

/**
 * Маленькая иконка для баннера — в отличие от фото команды, тут НЕ
 * обрезаем до фиксированной пропорции (это может быть лого/значок
 * произвольной формы), просто ограничиваем максимальный размер и
 * сохраняем прозрачность (PNG).
 */
export async function saveBannerImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Файл должен быть изображением (jpg, png, webp, svg).");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Файл слишком большой (максимум 4 МБ).");
  }

  await mkdir(BANNER_IMAGES_DIR, { recursive: true });

  // SVG сохраняем как есть (sharp растеризует SVG в PNG, теряя
  // векторность/чёткость на любом масштабе) — для растровых форматов
  // приводим к PNG с ограничением по размеру.
  if (file.type === "image/svg+xml") {
    const filename = `${randomUUID()}.svg`;
    await writeFile(path.join(BANNER_IMAGES_DIR, filename), Buffer.from(await file.arrayBuffer()));
    return filename;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.png`;
  await sharp(buffer)
    .rotate()
    .resize(160, 160, { fit: "inside", withoutEnlargement: true })
    .png()
    .toFile(path.join(BANNER_IMAGES_DIR, filename));

  return filename;
}
