import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { ok } from "@/lib/api-response";

export async function POST() {
  const response = ok({ ok: true });

  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });

  return response;
}
