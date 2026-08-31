"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminLoginSchema } from "@/server/validation/admin";
import { loginAdmin, GENERIC_LOGIN_ERROR } from "@/server/auth/login";
import { getClientIp, hashIp } from "@/server/security/ip";

export interface LoginActionState {
  error?: string;
}

function isSafeNextPath(next: string | null): next is string {
  return Boolean(next) && next!.startsWith("/admin") && !next!.startsWith("//");
}

export async function loginAction(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: GENERIC_LOGIN_ERROR };
  }

  const headerList = await headers();
  const ipHash = hashIp(getClientIp(headerList));
  const userAgent = headerList.get("user-agent") ?? undefined;

  const result = await loginAdmin({
    email: parsed.data.email,
    password: parsed.data.password,
    ipHash,
    userAgent,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const nextParam = formData.get("next");
  const nextPath = typeof nextParam === "string" ? nextParam : null;
  redirect(isSafeNextPath(nextPath) ? nextPath : "/admin");
}
