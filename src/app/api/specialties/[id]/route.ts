import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { assertUniqueSpecialtyName } from "@/lib/specialties";
import { specialtyRenameSchema } from "@/lib/validation/specialty";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const data = await readJson(request, specialtyRenameSchema);

    const existing = await prisma.specialty.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return fail("NOT_FOUND", "Especialidad no encontrada.", 404);
    }

    await assertUniqueSpecialtyName(user.userId, data.name, existing.parentId, id);

    const result = await prisma.specialty.updateMany({
      where: { id, userId: user.userId },
      data: { name: data.name },
    });

    if (result.count === 0) {
      return fail("NOT_FOUND", "Especialidad no encontrada.", 404);
    }

    const specialty = await prisma.specialty.findFirst({
      where: { id, userId: user.userId },
    });

    return ok(specialty);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const specialty = await prisma.specialty.findFirst({
      where: { id, userId: user.userId },
      include: { children: { select: { id: true } } },
    });

    if (!specialty) {
      return fail("NOT_FOUND", "Especialidad no encontrada.", 404);
    }

    const ids = [id, ...specialty.children.map((child) => child.id)];

    await prisma.contact.updateMany({
      where: { userId: user.userId, specialtyId: { in: ids } },
      data: { specialtyId: null },
    });

    await prisma.specialty.deleteMany({
      where: { userId: user.userId, parentId: id },
    });

    await prisma.specialty.deleteMany({
      where: { id, userId: user.userId },
    });

    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
