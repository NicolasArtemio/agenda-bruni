import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { contactInclude } from "@/lib/contacts";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { assertValidSpecialty } from "@/lib/specialties";
import { contactUpdateSchema } from "@/lib/validation/contact";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const contact = await prisma.contact.findFirst({
      where: { id, userId: user.userId },
      include: contactInclude,
    });

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

    if (data.specialtyId !== undefined) {
      await assertValidSpecialty(data.specialtyId, user.userId);
    }

    // updateMany cannot touch a row owned by another user.
    const result = await prisma.contact.updateMany({
      where: { id, userId: user.userId },
      data,
    });

    if (result.count === 0) {
      return fail("NOT_FOUND", "Contacto no encontrado.", 404);
    }

    const contact = await prisma.contact.findFirst({
      where: { id, userId: user.userId },
      include: contactInclude,
    });

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
