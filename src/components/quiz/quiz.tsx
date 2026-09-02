"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessengerToggle } from "@/components/ui/messenger-toggle";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { OptionCard } from "./option-card";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { trackEvent } from "@/lib/analytics/client";
import { quizSubmissionSchema } from "@/server/validation/application";
import type { ServiceOption } from "@/server/services/options";

type EntityType = "individual" | "sole_proprietor" | "llc" | "other";
type YesNo = "yes" | "no" | "not_sure";
type Urgency = "urgent" | "standard" | "flexible";
type Contact = "phone" | "telegram" | "email";

interface QuizState {
  serviceSlug?: string;
  entityType?: EntityType;
  taskDescription: string;
  hasExistingDocuments?: YesNo;
  urgency?: Urgency;
  preferredContact?: Contact;
  name: string;
  phone: string;
  telegram: string;
  messengerType: "telegram" | "max";
  email: string;
  consent: boolean;
  website: string;
}

const INITIAL_STATE: QuizState = {
  taskDescription: "",
  name: "",
  phone: "",
  telegram: "",
  messengerType: "telegram",
  email: "",
  consent: false,
  website: "",
};

const TOTAL_STEPS = 7;

export function Quiz({
  onDone,
  services,
  initialServiceSlug,
}: {
  onDone?: () => void;
  services: ServiceOption[];
  /** Если квиз открыт со страницы конкретной услуги — первый шаг
   *  (выбор услуги) пропускается и сразу отмечен этой услугой, но
   *  остаётся доступным через «Назад», чтобы можно было поменять выбор. */
  initialServiceSlug?: string;
}) {
  const [step, setStep] = React.useState(initialServiceSlug ? 2 : 1);
  const [state, setState] = React.useState<QuizState>(() => ({
    ...INITIAL_STATE,
    serviceSlug: initialServiceSlug,
  }));
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const trackedSteps = React.useRef(new Set<number>());

  React.useEffect(() => {
    if (!trackedSteps.current.has(step)) {
      trackedSteps.current.add(step);
      trackEvent({ eventType: "quiz_step", sourceElement: `step_${step}` });
    }
  }, [step]);

  function update<K extends keyof QuizState>(key: K, value: QuizState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  const canProceed = React.useMemo(() => {
    switch (step) {
      case 1:
        return Boolean(state.serviceSlug);
      case 2:
        return Boolean(state.entityType);
      case 3:
        return true; // описание опционально
      case 4:
        return Boolean(state.hasExistingDocuments);
      case 5:
        return Boolean(state.urgency);
      case 6:
        return Boolean(state.preferredContact);
      case 7:
        return (
          Boolean(state.name.trim()) &&
          Boolean(state.phone) &&
          Boolean(state.email) &&
          state.consent
        );
      default:
        return false;
    }
  }, [step, state]);

  async function handleSubmit() {
    setError(null);

    const parsed = quizSubmissionSchema.safeParse({
      name: state.name,
      phone: state.phone,
      telegram: state.telegram,
      messengerType: state.messengerType,
      email: state.email,
      consent: state.consent,
      website: state.website,
      turnstileToken: turnstileToken ?? undefined,
      quizAnswers: {
        serviceSlug: state.serviceSlug,
        entityType: state.entityType,
        taskDescription: state.taskDescription,
        hasExistingDocuments: state.hasExistingDocuments,
        urgency: state.urgency,
        preferredContact: state.preferredContact,
      },
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Проверьте заполненные поля.");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (response.status === 429) {
        setError("Слишком много заявок подряд. Попробуйте немного позже.");
        setStatus("error");
        return;
      }
      if (!response.ok) {
        setError("Не удалось отправить заявку. Попробуйте ещё раз.");
        setStatus("error");
        return;
      }

      trackEvent({ eventType: "quiz_complete" });
      setStatus("success");
    } catch {
      setError("Не удалось отправить заявку. Проверьте соединение и попробуйте снова.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="text-accent size-10" />
        <p className="font-display text-xl">Заявка получена</p>
        <p className="text-muted-foreground max-w-sm text-sm">
          Точная стоимость определяется после анализа вашей задачи — мы свяжемся с вами и подготовим
          расчёт.
        </p>
        {onDone && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onDone}>
            Закрыть
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>
            Шаг {step} из {TOTAL_STEPS}
          </span>
        </div>
        <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
          <div
            className="bg-accent h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-64">
        {step === 1 && (
          <StepShell title="Какая услуга нужна?">
            <div className="grid gap-2">
              {services.map((service) => (
                <OptionCard
                  key={service.slug}
                  label={service.title}
                  selected={state.serviceSlug === service.slug}
                  onClick={() => update("serviceSlug", service.slug)}
                />
              ))}
              <OptionCard
                label="Пока не знаю / нужна консультация"
                selected={state.serviceSlug === "consultation"}
                onClick={() => update("serviceSlug", "consultation")}
              />
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Кто вы?">
            <div className="grid gap-2">
              <OptionCard
                label="Физическое лицо"
                selected={state.entityType === "individual"}
                onClick={() => update("entityType", "individual")}
              />
              <OptionCard
                label="ИП"
                selected={state.entityType === "sole_proprietor"}
                onClick={() => update("entityType", "sole_proprietor")}
              />
              <OptionCard
                label="ООО"
                selected={state.entityType === "llc"}
                onClick={() => update("entityType", "llc")}
              />
              <OptionCard
                label="Другое"
                selected={state.entityType === "other"}
                onClick={() => update("entityType", "other")}
              />
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title="Кратко о задаче"
            subtitle="Необязательно, но поможет нам лучше подготовиться"
          >
            <Textarea
              value={state.taskDescription}
              onChange={(e) => update("taskDescription", e.target.value)}
              rows={5}
              placeholder="Опишите вашу ситуацию в свободной форме"
            />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Есть ли уже документы по этой задаче?">
            <div className="grid gap-2">
              <OptionCard
                label="Да, есть"
                selected={state.hasExistingDocuments === "yes"}
                onClick={() => update("hasExistingDocuments", "yes")}
              />
              <OptionCard
                label="Нет"
                selected={state.hasExistingDocuments === "no"}
                onClick={() => update("hasExistingDocuments", "no")}
              />
              <OptionCard
                label="Не уверен(а)"
                selected={state.hasExistingDocuments === "not_sure"}
                onClick={() => update("hasExistingDocuments", "not_sure")}
              />
            </div>
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="Насколько это срочно?">
            <div className="grid gap-2">
              <OptionCard
                label="Срочно"
                selected={state.urgency === "urgent"}
                onClick={() => update("urgency", "urgent")}
              />
              <OptionCard
                label="В обычном режиме"
                selected={state.urgency === "standard"}
                onClick={() => update("urgency", "standard")}
              />
              <OptionCard
                label="Сроки гибкие"
                selected={state.urgency === "flexible"}
                onClick={() => update("urgency", "flexible")}
              />
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title="Как удобнее связаться?">
            <div className="grid gap-2">
              <OptionCard
                label="Телефон"
                selected={state.preferredContact === "phone"}
                onClick={() => update("preferredContact", "phone")}
              />
              <OptionCard
                label="Telegram"
                selected={state.preferredContact === "telegram"}
                onClick={() => update("preferredContact", "telegram")}
              />
              <OptionCard
                label="Email"
                selected={state.preferredContact === "email"}
                onClick={() => update("preferredContact", "email")}
              />
            </div>
          </StepShell>
        )}

        {step === 7 && (
          <StepShell title="Ваши контакты">
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="quiz-website">Не заполняйте это поле</label>
              <input
                id="quiz-website"
                tabIndex={-1}
                autoComplete="off"
                value={state.website}
                onChange={(e) => update("website", e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="quiz-name">Имя*</Label>
                <Input
                  id="quiz-name"
                  value={state.name}
                  onChange={(e) => update("name", e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="quiz-phone">Телефон*</Label>
                  <Input
                    id="quiz-phone"
                    type="tel"
                    value={state.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+7 900 000-00-00"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="quiz-telegram">
                      {state.messengerType === "max" ? "MAX" : "Telegram"}
                    </Label>
                    <MessengerToggle
                      value={state.messengerType}
                      onChange={(value) => update("messengerType", value)}
                    />
                  </div>
                  <Input
                    id="quiz-telegram"
                    value={state.telegram}
                    onChange={(e) => update("telegram", e.target.value)}
                    placeholder="@username"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="quiz-email">Email*</Label>
                <Input
                  id="quiz-email"
                  type="email"
                  value={state.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <label className="text-muted-foreground flex items-start gap-3 text-sm">
                <Checkbox
                  checked={state.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                />
                <span>
                  Даю согласие на{" "}
                  <TrackedLink
                    href="/personal-data-consent"
                    className="hover:text-foreground underline underline-offset-2"
                  >
                    обработку персональных данных
                  </TrackedLink>
                  *
                </span>
              </label>
              <TurnstileWidget onVerify={setTurnstileToken} />
            </div>
          </StepShell>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="border-border flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={step === 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          <ArrowLeft className="size-4" /> Назад
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            size="sm"
            disabled={!canProceed}
            onClick={() => setStep((s) => s + 1)}
          >
            Далее <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={!canProceed || status === "submitting"}
            onClick={handleSubmit}
          >
            {status === "submitting" && <Loader2 className="size-4 animate-spin" />}
            Отправить
          </Button>
        )}
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl">{title}</h3>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
