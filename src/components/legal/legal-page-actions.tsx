"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";

/**
 * Кнопки «Скачать PDF» / «Распечатать» над текстом юридического
 * документа. PDF — оригинальный файл из public/documents (см.
 * legal-page-shell.tsx), печать — обычный window.print() по самой
 * странице; header/footer/баннер скрыты в печати через print:hidden.
 */
export function LegalPageActions({ pdfHref }: { pdfHref: string }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3 print:hidden">
      <TrackedLink
        href={pdfHref}
        sourceElement="legal_download_pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="border-border-strong hover:bg-surface inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium"
      >
        Скачать PDF
      </TrackedLink>
      <button
        type="button"
        onClick={() => window.print()}
        className="border-border-strong hover:bg-surface inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium"
      >
        Распечатать
      </button>
    </div>
  );
}
