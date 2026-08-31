"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function OptionCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-md border px-4 py-3.5 text-left transition-colors",
        selected
          ? "border-accent bg-accent/[0.06] text-foreground"
          : "border-border-strong hover:bg-muted",
      )}
    >
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {description && (
          <span className="text-muted-foreground mt-0.5 block text-sm">{description}</span>
        )}
      </span>
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-accent bg-accent text-accent-foreground" : "border-border-strong",
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
    </button>
  );
}
