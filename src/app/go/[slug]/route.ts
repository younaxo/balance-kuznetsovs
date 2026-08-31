import { NextResponse } from "next/server";
import { notFound } from "next/navigation";
import { resolveTrackedDestination } from "@/server/redirects/repository";
import { recordAnalyticsEvent } from "@/server/analytics/service";

export const runtime = "nodejs";

/**
 * Единственный безопасный способ вести пользователя на внешний ресурс
 * с трекингом клика: /go/:slug -> заранее зарегистрированный в БД URL
 * (allowlist). Открытого редиректа вида /go?url=... в приложении нет.
 */
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const destination = await resolveTrackedDestination(slug);

  if (!destination) {
    notFound();
  }

  await recordAnalyticsEvent(
    {
      eventType: "tracked_redirect",
      pathname: `/go/${slug}`,
      destination,
      sourceElement: slug,
    },
    {
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    },
  );

  return NextResponse.redirect(destination, { status: 302 });
}
