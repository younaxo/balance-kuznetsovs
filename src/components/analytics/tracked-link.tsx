"use client";

import * as React from "react";
import Link from "next/link";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics/client";

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) && typeof window !== "undefined"
    ? !href.startsWith(window.location.origin)
    : /^https?:\/\//.test(href);
}

export interface TrackedLinkProps extends React.ComponentProps<typeof Link> {
  /** Явно указать тип события, если авто-определение (nav/external) не подходит. */
  eventType?: AnalyticsEventType;
  sourceElement?: string;
}

/**
 * Обёртка над next/link, которая сама решает, это внутренняя навигация
 * или переход вовне, и шлёт соответствующее событие аналитики.
 * Используется в header/footer/навигации — компоненты не вызывают
 * trackEvent() руками.
 */
export const TrackedLink = React.forwardRef<HTMLAnchorElement, TrackedLinkProps>(
  ({ href, eventType, sourceElement, onClick, ...props }, ref) => {
    const hrefString = typeof href === "string" ? href : href.toString();

    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
      trackEvent({
        eventType: eventType ?? (isExternal(hrefString) ? "external_link_click" : "nav_click"),
        sourceElement,
        destination: hrefString,
      });
      onClick?.(event);
    };

    return <Link ref={ref} href={href} onClick={handleClick} {...props} />;
  },
);
TrackedLink.displayName = "TrackedLink";
