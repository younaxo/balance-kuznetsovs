import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center">
      <div className="container-page py-24 text-center">
        <p className="font-display text-muted-foreground text-7xl">404</p>
        <h1 className="font-display mt-4 text-3xl sm:text-4xl">Страница не найдена</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-md text-[15px]">
          Возможно, страница была перемещена или адрес введён с ошибкой.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </section>
  );
}
