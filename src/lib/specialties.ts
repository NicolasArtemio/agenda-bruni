import type { Specialty } from "@prisma/client";
import { ApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export type SpecialtyTreeNode = Specialty & { children: Specialty[] };

export function getSpecialtyTree(userId: string): Promise<SpecialtyTreeNode[]> {
  return prisma.specialty.findMany({
    where: { userId, parentId: null },
    include: { children: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export async function assertValidSpecialty(
  specialtyId: string | null | undefined,
  userId: string,
): Promise<Specialty | null> {
  if (!specialtyId) {
    return null;
  }

  const specialty = await prisma.specialty.findFirst({
    where: { id: specialtyId, userId },
  });

  if (!specialty) {
    throw new ApiError("NOT_FOUND", "Especialidad no encontrada.", 404);
  }

  if (specialty.parentId !== null) {
    const parent = await prisma.specialty.findFirst({
      where: { id: specialty.parentId, userId },
    });

    if (!parent || parent.parentId !== null) {
      throw new ApiError("INVALID_SPECIALTY", "Solo se admite un nivel de subcategorías.", 422);
    }
  }

  return specialty;
}

export async function assertParentSpecialty(
  parentId: string,
  userId: string,
): Promise<Specialty> {
  const parent = await prisma.specialty.findFirst({
    where: { id: parentId, userId, parentId: null },
  });

  if (!parent) {
    throw new ApiError("NOT_FOUND", "Especialidad no encontrada.", 404);
  }

  return parent;
}

export async function assertUniqueSpecialtyName(
  userId: string,
  name: string,
  parentId: string | null,
  excludeId?: string,
): Promise<void> {
  const existing = await prisma.specialty.findFirst({
    where: {
      userId,
      parentId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new ApiError("SPECIALTY_EXISTS", "Ya existe una especialidad con ese nombre.", 409);
  }
}
