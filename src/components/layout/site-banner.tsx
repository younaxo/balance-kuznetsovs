import { getSiteBanner } from "@/server/content/banner";
import { MarkdownText } from "@/components/ui/markdown";
import { TrackedLink } from "@/components/analytics/tracked-link";

// Второй рубеж защиты от path traversal (../../..) — на случай, если в
// БД когда-нибудь окажется "грязное" значение в обход валидации записи
// (см. admin/banner/actions.ts). Имя файла из этой таблицы всегда
// должно быть "плоским" — без слэшей и точек-переходов.
const SAFE_FILENAME = /^[a-zA-Z0-9._-]+$/;

/**
 * Узкая плашка над шапкой — акции/новости. Управляется из /admin/banner,
 * полностью скрыта, пока владелец её не включит.
 */
export async function SiteBanner() {
  const banner = await getSiteBanner();
  if (!banner.enabled || !banner.text) return null;

  const hasSafeImage = Boolean(banner.imageFilename && SAFE_FILENAME.test(banner.imageFilename));

  return (
    <div className="bg-graphite text-graphite-foreground print:hidden">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
        <div className="flex items-center gap-3">
          {hasSafeImage && (
            // eslint-disable-next-line @next/next/no-img-element -- путь по данным из БД, статический импорт невозможен
            <img src={`/banner/${banner.imageFilename}`} alt="" className="size-6 shrink-0" />
          )}
          <MarkdownText className="[&_strong]:text-accent-foreground [&_strong]:bg-accent [&_p]:inline [&_strong]:rounded [&_strong]:px-1.5 [&_strong]:py-0.5">
            {banner.text}
          </MarkdownText>
        </div>
        {banner.buttonLabel && banner.buttonHref && (
          <TrackedLink
            href={banner.buttonHref}
            sourceElement="site_banner_cta"
            className="border-graphite-foreground/30 hover:bg-graphite-foreground/10 shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap"
          >
            {banner.buttonLabel}
          </TrackedLink>
        )}
      </div>
    </div>
  );
}
