import { NextResponse } from "next/server";
import { analyticsEventSchema, recordAnalyticsEvent } from "@/server/analytics/service";
import { isSameOriginRequest } from "@/server/security/origin";
import { readJsonBodySafely } from "@/server/security/body-limit";
import { checkRateLimit } from "@/server/security/rate-limit";
import { getClientIp, hashIp } from "@/server/security/ip";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 5_000;
// Аналитика — высокочастотная, лимит мягче, чем для форм.
const RATE_LIMIT = { limit: 120, windowMs: 60 * 1000 };

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const ipHash = hashIp(getClientIp(request.headers));
  const rl = checkRateLimit(`analytics:${ipHash}`, RATE_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await readJsonBodySafely(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  const parsed = analyticsEventSchema.safeParse(body.data);
  if (!parsed.success) {
    // Аналитика не критична для пользователя — просто отвечаем ok:false,
    // без раскрытия деталей валидации.
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await recordAnalyticsEvent(parsed.data, {
    userAgent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  });

  return NextResponse.json({ ok: true });
}
