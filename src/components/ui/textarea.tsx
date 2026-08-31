import * as React from "react";
import { cn } from "@/lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "border-border-strong bg-surface text-foreground placeholder:text-muted-foreground focus-visible:border-accent focus-visible:ring-accent/25 aria-invalid:border-destructive flex min-h-28 w-full rounded-md border px-4 py-3 text-[15px] transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
