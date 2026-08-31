import { NextResponse } from "next/server";
import { z } from "zod";
import { setConsent } from "@/server/consent/cookies";
import { getSessionIdCookie } from "@/server/analytics/cookies";
import { isSameOriginRequest } from "@/server/security/origin";
import { readJsonBodySafely } from "@/server/security/body-limit";

export const runtime = "nodejs";

const schema = z.object({ analytics: z.boolean() });

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await readJsonBodySafely(request, 200);
  if (!body.ok) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = await getSessionIdCookie();
  await setConsent(parsed.data.analytics, sessionId);

  return NextResponse.json({ ok: true });
}
