import Image from "next/image";
import { cn } from "@/lib/cn";
import logoMain from "../../../public/brand/main_logo.png";
import logoWhite from "../../../public/brand/white_logo.png";

/**
 * Логотип «БАЛАНС КУЗНЕЦОВЫ» — единственное место в кодовой базе,
 * которое ссылается на файлы ассетов. Чтобы заменить логотип на новую
 * версию, достаточно положить новые файлы в public/brand/ с теми же
 * именами (main_logo.png / white_logo.png) — весь сайт подхватит их
 * автоматически без правок кода.
 *
 * variant="light" (по умолчанию) — тёмный текст, для светлых мест
 * (шапка, светлые страницы). variant="dark" — белый текст, для тёмных
 * поверхностей (подвал на graphite-фоне).
 *
 * Пропорции оригинала сохраняются через next/image — искажений нет ни
 * на одном брейкпоинте.
 */
export function Logo({
  className,
  height = 40,
  priority = false,
  variant = "light",
}: {
  className?: string;
  height?: number;
  priority?: boolean;
  variant?: "light" | "dark";
}) {
  return (
    <Image
      src={variant === "dark" ? logoWhite : logoMain}
      alt="БАЛАНС КУЗНЕЦОВЫ"
      height={height}
      style={{ height, width: "auto" }}
      priority={priority}
      className={cn("select-none", className)}
    />
  );
}
