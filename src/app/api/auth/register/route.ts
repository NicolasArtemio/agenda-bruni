import { Prisma } from "@prisma/client";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await readJson(request, registerSchema);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return fail("EMAIL_TAKEN", "Ya existe una cuenta con ese correo electrónico.", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });

    const token = await signSession({ sub: user.id, email: user.email });
    const response = ok({ user }, 201);

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("EMAIL_TAKEN", "Ya existe una cuenta con ese correo electrónico.", 409);
    }

    return handleApiError(error);
  }
}
