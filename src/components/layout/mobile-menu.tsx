"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { NAV_ITEMS } from "./nav-items";
import { useDialogs } from "@/components/dialogs/dialog-manager";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Мобильное меню — полноэкранный Radix Dialog: focus trap, Escape,
 * блокировка прокрутки body реализованы примитивом «из коробки».
 */
export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const { openApplication } = useDialogs();

  // Закрываем меню при смене маршрута. Вычисляем это во время рендера
  // (паттерн "adjusting state when a prop changes" из React docs),
  // а не в useEffect — так рендер один, без каскадного лишнего прохода.
  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Открыть меню" className="lg:hidden">
          <Menu className="size-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-background/0 fixed inset-0 z-50" />
        <DialogPrimitive.Content
          className={cn(
            "glass-surface fixed inset-0 z-50 flex flex-col p-6 outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Меню навигации</DialogPrimitive.Title>
          <div className="flex items-center justify-between">
            <span className="font-display text-lg">Меню</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Закрыть меню">
                <X className="size-5" />
              </Button>
            </DialogClose>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => (
              <TrackedLink
                key={item.href}
                href={item.href}
                sourceElement={`mobile_nav_${item.href}`}
                className={cn(
                  "border-border font-display border-b py-4 text-2xl transition-colors",
                  pathname === item.href ? "text-accent" : "text-foreground hover:text-accent",
                )}
              >
                {item.label}
              </TrackedLink>
            ))}
          </nav>

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() => {
              setOpen(false);
              openApplication({ sourceElement: "mobile_menu_cta" });
            }}
          >
            Оставить заявку
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
