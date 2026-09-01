"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { clientEnv } from "@/lib/env.client";

/**
 * Собирает ссылку с UTM-метками для рекламной кампании — руками
 * дописывать ?utm_source=...&utm_medium=... больше не нужно, и не
 * будет опечаток в имени параметра.
 */
export function UtmBuilder() {
  const [path, setPath] = React.useState("/");
  const [source, setSource] = React.useState("");
  const [medium, setMedium] = React.useState("");
  const [campaign, setCampaign] = React.useState("");
  const [content, setContent] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const url = React.useMemo(() => {
    const base = clientEnv.NEXT_PUBLIC_SITE_URL ?? "";
    const params = new URLSearchParams();
    if (source) params.set("utm_source", source);
    if (medium) params.set("utm_medium", medium);
    if (campaign) params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    if (term) params.set("utm_term", term);
    const query = params.toString();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}${query ? `?${query}` : ""}`;
  }, [path, source, medium, campaign, content, term]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // буфер обмена недоступен (нет разрешения/не https) — просто ничего
      // не делаем, ссылку всё равно можно выделить и скопировать руками
    }
  }

  return (
    <div className="border-border bg-surface rounded-lg border p-5">
      <h2 className="text-sm font-medium">Собрать ссылку с UTM-метками</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Заполните, откуда и на какую рекламу ведёт ссылка — остальное соберём сами.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Страница сайта" value={path} onChange={setPath} placeholder="/" />
        <Field
          label="utm_source"
          value={source}
          onChange={setSource}
          placeholder="vk, yandex, telegram…"
        />
        <Field
          label="utm_medium"
          value={medium}
          onChange={setMedium}
          placeholder="cpc, social, email…"
        />
        <Field
          label="utm_campaign"
          value={campaign}
          onChange={setCampaign}
          placeholder="название кампании"
        />
        <Field
          label="utm_content"
          value={content}
          onChange={setContent}
          placeholder="необязательно"
        />
        <Field label="utm_term" value={term} onChange={setTerm} placeholder="необязательно" />
      </div>

      <div className="border-border-strong bg-background mt-4 flex items-center gap-2 rounded-md border p-2">
        <code className="flex-1 overflow-x-auto text-xs break-all">{url}</code>
        <button
          type="button"
          onClick={copy}
          className="border-border-strong hover:bg-muted inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Скопировано" : "Скопировать"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
      />
    </label>
  );
}
