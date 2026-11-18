import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { ApiError } from "@/lib/api-response";

export type Session = {
  userId: string;
  email: string;
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySession(token);

  if (!payload) {
    return null;
  }

  return { userId: payload.sub, email: payload.email };
}

export async function requireUser(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireApiUser(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new ApiError("UNAUTHORIZED", "Se requiere autenticación.", 401);
  }

  return session;
}
