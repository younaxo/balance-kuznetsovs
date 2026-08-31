import { ClipboardList } from "lucide-react";
import { PriceRepository, formatPriceFromKopecks } from "@/server/pricing/repository";
import { PricesCta } from "./prices-cta";

export async function PricesSection() {
  const items = await PriceRepository.listPublished();

  return (
    <section className="border-border border-b">
      <div className="container-page py-20 lg:py-28">
        <h1 className="font-display text-3xl sm:text-4xl">Стоимость наших услуг</h1>

        {items.length === 0 ? (
          <div className="border-border-strong mt-10 flex flex-col items-center gap-4 rounded-lg border border-dashed py-20 text-center">
            <ClipboardList className="text-muted-foreground size-8" />
            <p className="text-muted-foreground max-w-md text-[15px]">
              Прайс-лист сейчас формируется. Стоимость зависит от объёма и сложности задачи —
              оставьте заявку, и мы подготовим точный расчёт индивидуально.
            </p>
            <PricesCta />
          </div>
        ) : (
          <div className="divide-border border-border mt-10 divide-y rounded-lg border">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-[15px] font-medium">{item.title}</h3>
                  {item.description && (
                    <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
                  )}
                </div>
                <span className="font-display text-lg whitespace-nowrap">
                  {item.priceFromKopecks
                    ? `${formatPriceFromKopecks(item.priceFromKopecks)}${item.unit ? ` / ${item.unit}` : ""}`
                    : "По запросу"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
