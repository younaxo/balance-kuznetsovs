/**
 * Горизонтальный bar-chart для одной серии значений (магнитуда:
 * количество событий/визитов на категорию) — тонкие полосы с
 * закруглёнными концами, один цвет заливки (сайт монохромный, второй
 * "категориальный" hue не нужен — здесь не различение идентичности,
 * а сравнение величины). Значение подписано напрямую у полосы.
 */
export function BarList({
  items,
  emptyLabel = "Нет данных за выбранный период.",
}: {
  items: { label: string; value: number }[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground p-4 text-sm">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="flex flex-col gap-3 p-4">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="truncate" title={item.label}>
              {item.label}
            </span>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-foreground h-full rounded-full"
                style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
              />
            </div>
          </div>
          <span className="font-medium tabular-nums">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
