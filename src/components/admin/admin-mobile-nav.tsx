"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { logoutAction } from "@/app/admin/logout-action";
import { ADMIN_NAV } from "./admin-nav-items";
import { cn } from "@/lib/cn";

/**
 * Мобильная навигация админки — до этого компонента на телефонах/узких
 * экранах сайдбар (aside md:flex) полностью пропадал вместе с логотипом
 * и не было НИКАКОГО способа перейти между разделами, кроме ручного
 * ввода URL. Верхняя полоса с лого + бургер-меню видна только ниже md,
 * на десктопе её нет — там работает обычный сайдбар.
 */
export function AdminMobileNav({ adminEmail }: { adminEmail: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  const [lastPathname, setLastPathname] = React.useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  return (
    <div className="border-border bg-surface flex items-center justify-between border-b p-4 md:hidden">
      <Logo height={28} />

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Trigger asChild>
          <Button variant="ghost" size="icon" aria-label="Открыть меню">
            <Menu className="size-5" />
          </Button>
        </DialogPrimitive.Trigger>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="bg-foreground/20 fixed inset-0 z-50" />
          <DialogPrimitive.Content
            className={cn(
              "bg-surface fixed inset-0 z-50 flex flex-col p-5 outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            )}
          >
            <DialogPrimitive.Title className="sr-only">Меню админки</DialogPrimitive.Title>
            <div className="flex items-center justify-between">
              <Logo height={28} />
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Закрыть меню">
                  <X className="size-5" />
                </Button>
              </DialogClose>
            </div>

            <nav className="mt-6 flex flex-1 flex-col gap-0.5" aria-label="Навигация админки">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-muted text-foreground"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-border border-t pt-3">
              <p className="text-muted-foreground truncate px-3 py-1 text-xs">{adminEmail}</p>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-foreground/80 hover:bg-muted hover:text-foreground flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <LogOut className="size-4" />
                  Выйти
                </button>
              </form>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
