import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { getContactForUser, updateContactForUser } from "@/lib/contact-service";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { contactUpdateSchema } from "@/lib/validation/contact";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const contact = await getContactForUser(user.userId, id);

    if (!contact) {
      return fail("NOT_FOUND", "Contacto no encontrado.", 404);
    }

    return ok(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const data = await readJson(request, contactUpdateSchema);

    const contact = await updateContactForUser(user.userId, id, data);

    if (!contact) {
      return fail("NOT_FOUND", "Contacto no encontrado.", 404);
    }

    return ok(contact);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const result = await prisma.contact.deleteMany({
      where: { id, userId: user.userId },
    });

    if (result.count === 0) {
      return fail("NOT_FOUND", "Contacto no encontrado.", 404);
    }

    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
