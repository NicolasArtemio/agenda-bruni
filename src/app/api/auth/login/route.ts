import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await readJson(request, loginSchema);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return fail("INVALID_CREDENTIALS", "Correo electrónico o contraseña inválidos.", 401);
    }

    const token = await signSession({ sub: user.id, email: user.email });
    const response = ok({ user: { id: user.id, email: user.email } });

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
