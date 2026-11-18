import { handleApiError, ok, readJson } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import {
  assertParentSpecialty,
  assertUniqueSpecialtyName,
  getSpecialtyTree,
} from "@/lib/specialties";
import { specialtyCreateSchema } from "@/lib/validation/specialty";

export async function GET() {
  try {
    const user = await requireApiUser();

    return ok(await getSpecialtyTree(user.userId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const data = await readJson(request, specialtyCreateSchema);

    if (data.parentId) {
      await assertParentSpecialty(data.parentId, user.userId);
    }

    await assertUniqueSpecialtyName(user.userId, data.name, data.parentId ?? null);

    const specialty = await prisma.specialty.create({
      data: {
        name: data.name,
        parentId: data.parentId ?? null,
        userId: user.userId,
      },
    });

    return ok(specialty, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
