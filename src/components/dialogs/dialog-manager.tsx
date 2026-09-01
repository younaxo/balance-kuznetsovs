"use client";

import * as React from "react";
import { trackEvent } from "@/lib/analytics/client";

export interface OpenApplicationOptions {
  serviceSlug?: string;
  sourceElement?: string;
}

interface DialogsContextValue {
  applicationOpen: boolean;
  applicationServiceSlug?: string;
  openApplication: (options?: OpenApplicationOptions) => void;
  closeApplication: () => void;

  quizOpen: boolean;
  quizServiceSlug?: string;
  openQuiz: (options?: { serviceSlug?: string; sourceElement?: string }) => void;
  closeQuiz: () => void;
}

const DialogsContext = React.createContext<DialogsContextValue | null>(null);

/**
 * Единая точка управления модалками «Оставить заявку» и «Рассчитать
 * стоимость» — любой компонент дерева (header, hero, карточка услуги,
 * футер) открывает их через useDialogs(), не таская локальный state.
 */
export function DialogsProvider({ children }: { children: React.ReactNode }) {
  const [applicationOpen, setApplicationOpen] = React.useState(false);
  const [applicationServiceSlug, setApplicationServiceSlug] = React.useState<string | undefined>(
    undefined,
  );
  const [quizOpen, setQuizOpen] = React.useState(false);
  const [quizServiceSlug, setQuizServiceSlug] = React.useState<string | undefined>(undefined);

  const openApplication = React.useCallback((options?: OpenApplicationOptions) => {
    setApplicationServiceSlug(options?.serviceSlug);
    setApplicationOpen(true);
    trackEvent({
      eventType: "application_open",
      sourceElement: options?.sourceElement,
      destination: options?.serviceSlug,
    });
  }, []);

  const closeApplication = React.useCallback(() => setApplicationOpen(false), []);

  const openQuiz = React.useCallback(
    (options?: { serviceSlug?: string; sourceElement?: string }) => {
      setQuizServiceSlug(options?.serviceSlug);
      setQuizOpen(true);
      trackEvent({ eventType: "quiz_open", sourceElement: options?.sourceElement });
    },
    [],
  );

  const closeQuiz = React.useCallback(() => setQuizOpen(false), []);

  const value = React.useMemo(
    () => ({
      applicationOpen,
      applicationServiceSlug,
      openApplication,
      closeApplication,
      quizOpen,
      quizServiceSlug,
      openQuiz,
      closeQuiz,
    }),
    [
      applicationOpen,
      applicationServiceSlug,
      openApplication,
      closeApplication,
      quizOpen,
      quizServiceSlug,
      openQuiz,
      closeQuiz,
    ],
  );

  return <DialogsContext.Provider value={value}>{children}</DialogsContext.Provider>;
}

export function useDialogs(): DialogsContextValue {
  const ctx = React.useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs должен использоваться внутри DialogsProvider");
  return ctx;
}
