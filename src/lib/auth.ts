import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { ApiError } from "@/lib/api-response";

export const SESSION_COOKIE = "bruni_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  email: string;
};

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new ApiError("SERVER_CONFIG", "JWT_SECRET no está configurado.", 500);
  }

  return new TextEncoder().encode(secret);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const secret = getJwtSecret();

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });

    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
