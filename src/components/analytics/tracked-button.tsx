"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics/client";

export interface TrackedButtonProps extends ButtonProps {
  eventType: AnalyticsEventType;
  sourceElement?: string;
  destination?: string;
}

/**
 * Кнопка, которая при клике сама шлёт событие аналитики перед
 * выполнением своего onClick. Используется для CTA "Оставить заявку",
 * "Рассчитать стоимость", карточек услуг и т.п.
 */
export const TrackedButton = React.forwardRef<HTMLButtonElement, TrackedButtonProps>(
  ({ eventType, sourceElement, destination, onClick, ...props }, ref) => {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      trackEvent({ eventType, sourceElement, destination });
      onClick?.(event);
    };

    return <Button ref={ref} onClick={handleClick} {...props} />;
  },
);
TrackedButton.displayName = "TrackedButton";
