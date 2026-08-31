import Image from "next/image";
import { cn } from "@/lib/cn";
import logoAsset from "../../../public/brand/logo.jpg";

/**
 * Логотип «БАЛАНС КУЗНЕЦОВЫ» — единственное место в кодовой базе,
 * которое ссылается на файл ассета. Чтобы заменить логотип на новую
 * версию (например, вариант с прозрачным фоном), достаточно положить
 * новый файл в public/brand/logo.jpg с тем же именем — весь сайт
 * подхватит его автоматически без правок кода.
 *
 * Пропорции оригинала (1280×470) сохраняются через next/image —
 * искажений нет ни на одном брейкпоинте.
 */
export function Logo({
  className,
  height = 40,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src={logoAsset}
      alt="БАЛАНС КУЗНЕЦОВЫ"
      height={height}
      style={{ height, width: "auto" }}
      priority={priority}
      className={cn("rounded-[3px] select-none", className)}
    />
  );
}
