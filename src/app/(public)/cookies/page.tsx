import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";

export const metadata: Metadata = {
  description: "Использование cookie.",
};

// Страница временно пустая по решению владельца (ссылка из футера
// тоже убрана — см. LEGAL_LINKS в site-footer.tsx). Маршрут оставлен
// живым (а не удалён), чтобы не плодить 404 у уже проиндексированных
// ссылок.
export default function CookiesPage() {
  return <LegalPageShell title="Использование cookie" />;
}
