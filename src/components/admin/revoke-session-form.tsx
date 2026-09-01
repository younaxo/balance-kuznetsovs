"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AdminForm } from "./admin-form";
import { AdminSubmitButton } from "./admin-submit-button";
import { Button } from "@/components/ui/button";
import { revokeSessionAction } from "@/app/admin/(protected)/settings/actions";

/**
 * Завершение сессии — чувствительное действие, поэтому просим
 * подтвердить своим текущим паролем в модалке, а не просто по клику.
 */
export function RevokeSessionForm({
  sessionId,
  deviceLabel,
}: {
  sessionId: string;
  deviceLabel: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Завершить
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Завершить сессию?</DialogTitle>
          <DialogDescription>
            {deviceLabel} — потеряет доступ сразу. Подтвердите своим паролем.
          </DialogDescription>
        </DialogHeader>
        <AdminForm
          action={revokeSessionAction}
          onSuccess={() => setOpen(false)}
          className="grid gap-3"
        >
          <input type="hidden" name="sessionId" value={sessionId} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">Ваш пароль</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="border-border-strong bg-background h-9 rounded-md border px-3 text-sm"
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <AdminSubmitButton variant="destructive" pendingLabel="Завершение…">
              Завершить
            </AdminSubmitButton>
          </div>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
