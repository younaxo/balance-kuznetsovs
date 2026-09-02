/**
 * Значок площадки Avito рядом со ссылками "Отзывы на Avito" — простой
 * обобщённый силуэт (сумка/бирка объявления), НЕ копия фирменного
 * логотипа Avito, в цветах сайта (currentColor), а не в оригинальных
 * оранжевых/зелёных цветах бренда Avito.
 */
export function AvitoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M7 8V6.5a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="4" y="8" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.5 12.5 11.5 14.5 15 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
