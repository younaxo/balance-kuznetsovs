import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/auth/session";

/**
 * Proxy (бывший middleware, см. AGENTS.md/DECISIONS.md — переименован
 * в Next.js 16) — первый, "быстрый" рубеж защиты /admin: если cookie
 * сессии вообще отсутствует, сразу отправляем на /admin/login, не
 * дожидаясь рендера страницы.
 *
 * Это НЕ единственная проверка: полноценная валидация токена (истёк ли
 * срок, активен ли пользователь) выполняется в src/app/admin/layout.tsx
 * через getCurrentAdmin() — так рекомендует сама документация Next.js,
 * поскольку Proxy можно случайно обойти при рефакторинге маршрутов.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
