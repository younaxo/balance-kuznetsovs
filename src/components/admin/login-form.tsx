"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { loginAction, type LoginActionState } from "@/app/admin/login/actions";

const initialState: LoginActionState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="turnstileToken" value={turnstileToken ?? ""} />
      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <TurnstileWidget onVerify={setTurnstileToken} />
      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending} className="mt-1">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Войти
      </Button>
    </form>
  );
}
