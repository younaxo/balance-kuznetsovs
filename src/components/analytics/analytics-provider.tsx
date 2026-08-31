"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    trackEvent({ eventType: "page_view" });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Монтируется один раз в корневом layout. Автоматически шлёт page_view
 * при каждой навигации (в т.ч. клиентской, без полной перезагрузки).
 * useSearchParams требует Suspense-границу — оборачиваем локально, чтобы
 * это не заставляло весь layout переходить в client-only рендер.
 */
export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
