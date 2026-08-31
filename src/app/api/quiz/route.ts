import { NextResponse } from "next/server";
import { quizSubmissionSchema } from "@/server/validation/application";
import { ApplicationService } from "@/server/applications/service";
import { getClientIp, hashIp } from "@/server/security/ip";
import { isSameOriginRequest } from "@/server/security/origin";
import { readJsonBodySafely } from "@/server/security/body-limit";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const body = await readJsonBodySafely(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.reason }, { status: 413 });
  }

  const parsed = quizSubmissionSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const ip = getClientIp(request.headers);
  const ipHash = hashIp(ip);

  const result = await ApplicationService.submitFromQuiz(parsed.data, {
    ipHash,
    ctaSource: "quiz",
  });

  if (!result.ok) {
    const status = result.error === "rate_limited" ? 429 : 400;
    if (result.error === "spam_detected") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, id: result.application.id }, { status: 201 });
}
