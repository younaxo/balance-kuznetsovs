import { cn } from "@/lib/cn";

/**
 * Переключатель "Telegram / MAX" — какому мессенджеру принадлежит
 * соседнее поле ввода хэндла. Обычная "полосочка" (segmented control)
 * вместо двух раздельных полей.
 */
export function MessengerToggle({
  value,
  onChange,
}: {
  value: "telegram" | "max";
  onChange: (value: "telegram" | "max") => void;
}) {
  return (
    <div className="border-border-strong inline-flex rounded-md border p-0.5" role="group">
      {(["telegram", "max"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={cn(
            "rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
            value === option
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option === "telegram" ? "Telegram" : "MAX"}
        </button>
      ))}
    </div>
  );
}
