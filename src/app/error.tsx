"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center">
      <div className="container-page py-24 text-center">
        <p className="font-display text-muted-foreground text-7xl">500</p>
        <h1 className="font-display mt-4 text-3xl sm:text-4xl">Что-то пошло не так</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-md text-[15px]">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу — если проблема повторится,
          свяжитесь с нами.
        </p>
        <Button size="lg" className="mt-8" onClick={() => reset()}>
          Попробовать снова
        </Button>
      </div>
    </section>
  );
}
