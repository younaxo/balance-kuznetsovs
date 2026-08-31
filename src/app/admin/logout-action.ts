"use server";

import { redirect } from "next/navigation";
import {
  getSessionTokenFromCookies,
  invalidateSession,
  clearSessionCookie,
} from "@/server/auth/session";

export async function logoutAction(): Promise<void> {
  const token = await getSessionTokenFromCookies();
  if (token) {
    await invalidateSession(token);
  }
  await clearSessionCookie();
  redirect("/admin/login");
}
