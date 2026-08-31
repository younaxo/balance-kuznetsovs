import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Нативный <select> вместо Radix Select: для короткого списка услуг
 * (5-7 пунктов) нативный контрол доступнее из коробки (клавиатура,
 * скринридеры, мобильные ОС) и не требует лишнего JS-бандла.
 */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "border-border-strong bg-surface text-foreground focus-visible:border-accent focus-visible:ring-accent/25 flex h-11 w-full appearance-none rounded-md border px-4 pr-10 text-[15px] transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
  </div>
));
Select.displayName = "Select";
