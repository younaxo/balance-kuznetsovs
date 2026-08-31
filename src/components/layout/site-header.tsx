"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";
import { NAV_ITEMS } from "./nav-items";
import { useDialogs } from "@/components/dialogs/dialog-manager";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const { openApplication } = useDialogs();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-shadow duration-300",
        scrolled ? "glass-surface shadow-[0_1px_0_0_var(--color-border)]" : "bg-background/0",
      )}
    >
      <div className="container-page flex h-18 items-center justify-between py-3">
        <TrackedLink href="/" sourceElement="header_logo" className="shrink-0">
          <Logo height={36} priority />
        </TrackedLink>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <TrackedLink
              key={item.href}
              href={item.href}
              sourceElement={`header_nav_${item.href}`}
              className={cn(
                "text-[14px] font-medium tracking-wide transition-colors",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </TrackedLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => openApplication({ sourceElement: "header_cta" })}
          >
            Оставить заявку
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
