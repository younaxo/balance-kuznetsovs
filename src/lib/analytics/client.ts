"use client";

/**
 * Единая точка отправки событий first-party аналитики с клиента.
 * Компоненты НЕ дергают fetch('/api/analytics/event') напрямую —
 * все идут через trackEvent()/TrackedLink/TrackedButton, что и
 * требовалось ТЗ («централизованный analytics layer»).
 *
 * Согласие на аналитику проверяет сервер (см. src/server/analytics/service.ts) —
 * клиент просто отправляет событие, сервер решает, писать ли его в БД.
 * navigator.sendBeacon используется, когда доступен — событие успевает
 * уйти даже при немедленном переходе на другую страницу/сайт.
 */

export type AnalyticsEventType =
  | "page_view"
  | "nav_click"
  | "footer_click"
  | "cta_click"
  | "service_cta_click"
  | "external_link_click"
  | "telegram_click"
  | "max_click"
  | "email_click"
  | "phone_click"
  | "quiz_open"
  | "quiz_step"
  | "quiz_complete"
  | "application_open"
  | "application_submit";

export interface TrackEventInput {
  eventType: AnalyticsEventType;
  sourceElement?: string;
  destination?: string;
}

export function trackEvent(input: TrackEventInput): void {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    eventType: input.eventType,
    pathname: window.location.pathname,
    search: window.location.search,
    sourceElement: input.sourceElement,
    destination: input.destination,
  });

  const url = "/api/analytics/event";

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    }
  } catch {
    // падаем на fetch ниже
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // аналитика не должна ломать пользовательский сценарий
  });
}
