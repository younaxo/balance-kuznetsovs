/**
 * Обёртка "название поля сверху + само поле" — раньше в админке многие
 * поля вообще без подписи, только placeholder (а он пропадает, как
 * только начал печатать). Один компонент вместо копипасты разметки.
 */
export function AdminField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 text-sm ${className ?? ""}`}>
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
