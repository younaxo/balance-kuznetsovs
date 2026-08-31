"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Кнопка сабмита для форм на Server Actions. useFormStatus() сам берёт
 * pending-состояние ближайшей родительской <form> — работает с обычным
 * `<form action={serverAction}>` без useActionState/доп. проводки.
 *
 * Раньше кнопки в админке были "немыми": без спиннера и без блокировки
 * на время запроса выглядело так, будто клик не сработал (хотя сохранение
 * реально проходило) — это и было причиной жалобы "не работают кнопки".
 */
export function AdminSubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "destructive" | "ghost";
  className?: string;
}) {
  const { pending } = useFormStatus();

  const variants = {
    primary: "bg-foreground text-background hover:bg-foreground/90",
    destructive: "text-destructive hover:underline",
    ghost: "text-accent hover:underline",
  } as const;

  const isPlainVariant = variant !== "primary";

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        !isPlainVariant && "h-9 rounded-md px-4",
        variants[variant],
        className,
      )}
    >
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
