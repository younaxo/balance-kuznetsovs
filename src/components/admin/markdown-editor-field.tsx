"use client";

import * as React from "react";
import { MarkdownText } from "@/components/ui/markdown";

/**
 * Textarea + живой предпросмотр markdown под ней — "маленький редактор"
 * вместо голого текстового поля, чтобы сразу было видно, как жирный/
 * курсив/ссылки лягут на сайте. Для FAQ дополнительно подсказка про
 * формат вопросов.
 */
export function MarkdownEditorField({
  name,
  defaultValue,
  isFaq = false,
}: {
  name: string;
  defaultValue: string;
  isFaq?: boolean;
}) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div className="grid gap-2">
      {isFaq && (
        <p className="text-muted-foreground text-xs">
          Каждый вопрос — с новой строки: <code>### Вопрос</code>, ответ обычным текстом ниже.
          Вопросы на сайте сворачиваются в список &laquo;раскрыть/свернуть&raquo;.
        </p>
      )}
      <textarea
        name={name}
        rows={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          isFaq
            ? "### Как долго готовится документ?\nОбычно 2-3 рабочих дня...\n\n### Можно ли работать удалённо?\nДа, по всей РФ..."
            : "Поддерживается markdown: **жирный**, *курсив*, [ссылка](https://...)"
        }
        className="border-border-strong bg-background rounded-md border p-3 font-mono text-sm"
      />
      {value.trim() && (
        <div className="border-border bg-muted/40 rounded-md border border-dashed p-3">
          <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">Предпросмотр</p>
          <MarkdownText className="text-[15px] leading-relaxed">{value}</MarkdownText>
        </div>
      )}
    </div>
  );
}
