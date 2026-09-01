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
import type { AdminActionState } from "@/server/admin/action-state";

/**
 * Кнопка удаления с кастомным диалогом подтверждения — вместо обычного
 * браузерного confirm() (и вместо мгновенного удаления по одному клику,
 * с которым легко промахнуться на "Удалить" в списке).
 */
export function ConfirmDeleteForm({
  action,
  id,
  itemLabel,
  triggerLabel = "Удалить",
}: {
  action: (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  id: string;
  /** Название удаляемой записи — показывается в тексте подтверждения. */
  itemLabel: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Удалить «{itemLabel}»?</DialogTitle>
          <DialogDescription>Это действие нельзя отменить.</DialogDescription>
        </DialogHeader>
        <AdminForm
          action={action}
          onSuccess={() => setOpen(false)}
          className="flex justify-end gap-3"
        >
          <input type="hidden" name="id" value={id} />
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <AdminSubmitButton variant="destructive" pendingLabel="Удаление…">
            Да, удалить
          </AdminSubmitButton>
        </AdminForm>
      </DialogContent>
    </Dialog>
  );
}
