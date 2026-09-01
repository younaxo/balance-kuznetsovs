import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const TEAM_PHOTOS_DIR = path.join(process.cwd(), "public/team");
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 МБ — с запасом хватает на телефонное фото

/**
 * Принимает загруженный файл фото сотрудника, приводит к единому
 * размеру/пропорции (3:4, cover-кроп по центру) и сохраняет в
 * public/team/<uuid>.jpg. Так все фото на сайте выглядят одинаково,
 * даже если исходники были разного размера и формата.
 */
export async function saveTeamPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Файл должен быть изображением (jpg, png, webp).");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Файл слишком большой (максимум 8 МБ).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.jpg`;

  await mkdir(TEAM_PHOTOS_DIR, { recursive: true });
  await sharp(buffer)
    .rotate() // учесть EXIF-ориентацию телефонных фото
    .resize(900, 1200, { fit: "cover", position: "attention" })
    .jpeg({ quality: 88 })
    .toFile(path.join(TEAM_PHOTOS_DIR, filename));

  return filename;
}
