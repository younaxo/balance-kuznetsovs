import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <span className="relative inline-flex size-5 shrink-0">
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "peer border-border-strong bg-surface checked:border-accent checked:bg-accent focus-visible:ring-accent/25 aria-invalid:border-destructive size-5 shrink-0 appearance-none rounded-[4px] border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
    <Check className="text-accent-foreground pointer-events-none absolute inset-0 m-auto size-3.5 scale-0 transition-transform peer-checked:scale-100" />
  </span>
));
Checkbox.displayName = "Checkbox";
