"use client";

import * as React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { trackEvent } from "@/lib/analytics/client";
import { applicationSchema } from "@/server/validation/application";
import type { ServiceOption } from "@/server/services/options";

type FormState = {
  name: string;
  phone: string;
  telegram: string;
  email: string;
  serviceSlug: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
};

const initialState: FormState = {
  name: "",
  phone: "",
  telegram: "",
  email: "",
  serviceSlug: "",
  message: "",
  consent: false,
  website: "",
};

export function ApplicationForm({
  defaultServiceSlug,
  services,
  onSuccess,
}: {
  defaultServiceSlug?: string;
  services: ServiceOption[];
  onSuccess?: () => void;
}) {
  const [form, setForm] = React.useState<FormState>({
    ...initialState,
    serviceSlug: defaultServiceSlug ?? "",
  });
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = React.useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);

    const parsed = applicationSchema.safeParse({
      ...form,
      serviceSlug: form.serviceSlug || undefined,
      turnstileToken: turnstileToken ?? undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(form.serviceSlug ? { "X-CTA-Source": form.serviceSlug } : {}),
        },
        body: JSON.stringify(parsed.data),
      });

      if (response.status === 429) {
        setServerError("Слишком много заявок подряд. Попробуйте немного позже.");
        setStatus("error");
        return;
      }

      if (!response.ok) {
        setServerError("Не удалось отправить заявку. Попробуйте ещё раз.");
        setStatus("error");
        return;
      }

      trackEvent({ eventType: "application_submit", sourceElement: form.serviceSlug || undefined });
      setStatus("success");
      onSuccess?.();
    } catch {
      setServerError("Не удалось отправить заявку. Проверьте соединение и попробуйте снова.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="text-accent size-10" />
        <p className="font-display text-xl">Заявка отправлена</p>
        <p className="text-muted-foreground text-sm">
          Мы свяжемся с вами в ближайшее время удобным для вас способом.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Honeypot: скрыто от людей визуально и из tab-order, но видно ботам */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Не заполняйте это поле</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="name">Имя*</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
          required
        />
        {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            placeholder="+7 900 000-00-00"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="telegram">Telegram</Label>
          <Input
            id="telegram"
            value={form.telegram}
            onChange={(e) => update("telegram", e.target.value)}
            placeholder="@username"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
        />
      </div>
      {errors.phone && <p className="text-destructive -mt-2 text-xs">{errors.phone}</p>}

      <div className="grid gap-1.5">
        <Label htmlFor="serviceSlug">Тип услуги</Label>
        <Select value={form.serviceSlug} onValueChange={(value) => update("serviceSlug", value)}>
          <SelectTrigger id="serviceSlug">
            <SelectValue placeholder="Не выбрано" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.slug} value={service.slug}>
                {service.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="message">Опишите задачу</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          rows={4}
        />
      </div>

      <label className="text-muted-foreground flex items-start gap-3 text-sm">
        <Checkbox
          checked={form.consent}
          onChange={(e) => update("consent", e.target.checked)}
          aria-invalid={Boolean(errors.consent)}
          required
        />
        <span>
          Даю согласие на{" "}
          <TrackedLink
            href="/personal-data-consent"
            className="hover:text-foreground underline underline-offset-2"
          >
            обработку персональных данных
          </TrackedLink>{" "}
          в соответствии с{" "}
          <TrackedLink
            href="/privacy"
            className="hover:text-foreground underline underline-offset-2"
          >
            политикой конфиденциальности
          </TrackedLink>
          *
        </span>
      </label>
      {errors.consent && <p className="text-destructive text-xs">{errors.consent}</p>}

      <TurnstileWidget onVerify={setTurnstileToken} />

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}

      <Button type="submit" size="lg" disabled={status === "submitting"} className="mt-1">
        {status === "submitting" && <Loader2 className="size-4 animate-spin" />}
        Отправить заявку
      </Button>
    </form>
  );
}
