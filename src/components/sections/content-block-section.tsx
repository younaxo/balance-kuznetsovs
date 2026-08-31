import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Универсальная секция для блоков, текст которых владелец продукта
 * ещё не предоставил («Почему выбирают нас», «Риски без документов»,
 * «Гарантии», «Цифры компании», FAQ, «Кейсы» и т.п.).
 *
 * Пока запись в content_blocks не опубликована через админку — секция
 * не рендерится вообще (без «выдуманных» плейсхолдеров на публичном
 * сайте). Как только владелец передаст текст, его можно занести через
 * /admin/content, и блок появится без правок кода.
 */
export async function ContentBlockSection({
  contentKey,
  className,
}: {
  contentKey: string;
  className?: string;
}) {
  const rows = await db
    .select()
    .from(contentBlocks)
    .where(eq(contentBlocks.key, contentKey))
    .limit(1);

  const block = rows[0];
  if (!block || !block.isPublished || !block.body) return null;

  return (
    <section className={className}>
      <div className="container-page py-20 lg:py-28">
        {block.title && <h2 className="font-display text-3xl sm:text-4xl">{block.title}</h2>}
        <div className="text-muted-foreground mt-6 max-w-2xl text-[15px] leading-relaxed whitespace-pre-line">
          {block.body}
        </div>
      </div>
    </section>
  );
}
