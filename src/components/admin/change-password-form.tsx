"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/app/admin/(protected)/settings/actions";

const initialState: ChangePasswordState = {};

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="grid max-w-sm gap-3">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Текущий пароль</span>
        <input
          type="password"
          name="currentPassword"
          autoComplete="current-password"
          required
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Новый пароль</span>
        <input
          type="password"
          name="newPassword"
          autoComplete="new-password"
          minLength={12}
          required
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">Повторите новый пароль</span>
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={12}
          required
          className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
        />
      </label>

      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Пароль обновлён.</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground text-background mt-1 h-9 w-fit rounded-md px-4 text-sm disabled:opacity-50"
      >
        Сохранить
      </button>
    </form>
  );
}
