import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { MarkdownText } from "@/components/ui/markdown";
import { ChevronDown } from "lucide-react";

/**
 * Универсальная секция для блоков, текст которых владелец продукта
 * ещё не предоставил («Почему выбирают нас», «Риски без документов»,
 * «Гарантии», «Цифры компании», FAQ, «Кейсы» и т.п.).
 *
 * Пока запись в content_blocks не опубликована через админку — секция
 * не рендерится вообще (без «выдуманных» плейсхолдеров на публичном
 * сайте). Как только владелец передаст текст, его можно занести через
 * /admin/content, и блок появится без правок кода. Текст — markdown
 * (жирный/курсив/ссылки/списки).
 *
 * Блок с ключом "faq" — особый случай: каждый вопрос оформляется в
 * тексте как "### Вопрос", ответ — обычный текст ниже до следующего
 * "###". Рендерится как аккордеон (раскрыть/свернуть), а не сплошным
 * текстом — так удобнее читать список вопросов.
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
        <div className="mt-6 max-w-2xl">
          {contentKey === "faq" ? (
            <FaqAccordion body={block.body} />
          ) : (
            <MarkdownText className="text-muted-foreground text-[15px] leading-relaxed">
              {block.body}
            </MarkdownText>
          )}
        </div>
      </div>
    </section>
  );
}

function FaqAccordion({ body }: { body: string }) {
  const items = parseFaqItems(body);
  if (items.length === 0) {
    // Текст есть, но не оформлен как "### Вопрос" — показываем как есть,
    // чтобы контент не пропадал молча.
    return (
      <MarkdownText className="text-muted-foreground text-[15px] leading-relaxed">
        {body}
      </MarkdownText>
    );
  }

  return (
    <div className="divide-border divide-y">
      {items.map((item, index) => (
        <details key={index} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {item.question}
            <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3">
            <MarkdownText className="text-muted-foreground text-[15px] leading-relaxed">
              {item.answer}
            </MarkdownText>
          </div>
        </details>
      ))}
    </div>
  );
}

function parseFaqItems(body: string): { question: string; answer: string }[] {
  const lines = body.split("\n");
  const items: { question: string; answer: string }[] = [];
  let current: { question: string; answer: string[] } | null = null;

  for (const line of lines) {
    const match = line.match(/^###\s+(.+)/);
    if (match) {
      if (current)
        items.push({ question: current.question, answer: current.answer.join("\n").trim() });
      current = { question: match[1].trim(), answer: [] };
    } else if (current) {
      current.answer.push(line);
    }
  }
  if (current) items.push({ question: current.question, answer: current.answer.join("\n").trim() });

  return items;
}
