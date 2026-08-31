"use client";

import Script from "next/script";
import { clientEnv } from "@/lib/env.client";
import { useConsent } from "@/lib/consent/use-consent";

/**
 * Яндекс.Метрика подключается только если:
 *  1) задан NEXT_PUBLIC_YANDEX_METRICA_ID;
 *  2) пользователь дал согласие на аналитику через cookie-баннер.
 * Без ID сайт работает без ошибок (счётчик просто не рендерится).
 */
export function YandexMetrica() {
  const consent = useConsent();
  const allowed = Boolean(consent?.analytics);

  const counterId = clientEnv.NEXT_PUBLIC_YANDEX_METRICA_ID;
  if (!counterId || !allowed) return null;

  return (
    <Script id="yandex-metrica" strategy="afterInteractive">
      {`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${JSON.stringify(counterId)}, "init", {
          clickmap:false,
          trackLinks:true,
          accurateTrackBounce:true,
          webvisor:false
        });
      `}
    </Script>
  );
}
