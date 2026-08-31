/**
 * Единый тип результата для admin Server Actions, используемых с
 * useActionState (см. src/components/admin/admin-form.tsx). Раньше
 * действия возвращали Promise<void> и просто `throw`, из-за чего форма
 * не могла показать ни ошибку, ни явное подтверждение успеха.
 */
export interface AdminActionState {
  ok: boolean;
  error?: string;
}

export const initialAdminActionState: AdminActionState = { ok: false };
