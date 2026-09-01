import Markdown from "markdown-to-jsx";
import { cn } from "@/lib/cn";

/**
 * Общий рендер markdown-текста (контентные блоки, баннер) — жирный,
 * курсив, ссылки, списки. Ссылки — обязательно с rel на внешние (без
 * target здесь: сам markdown не знает, внешняя ссылка или внутренняя,
 * поэтому просто безопасный rel по умолчанию для всех).
 */
export function MarkdownText({ children, className }: { children: string; className?: string }) {
  // Свой оборачивающий <div> с className, а не className самого
  // <Markdown> — markdown-to-jsx применяет переданные пропсы к
  // "обёртке", только если реально её создаёт (несколько корневых
  // узлов); для одного абзаца он отдаёт узел как есть, без обёртки, и
  // className молча теряется.
  return (
    <div className={cn("[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2", className)}>
      <Markdown
        options={{
          forceBlock: true,
          overrides: {
            a: { props: { rel: "noopener noreferrer" } },
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
