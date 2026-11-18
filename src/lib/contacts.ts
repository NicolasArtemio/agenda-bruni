import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ContactFilterValues = {
  q?: string;
  company?: string;
  city?: string;
  specialtyId?: string;
};

export async function buildContactWhere(
  userId: string,
  filters: ContactFilterValues,
): Promise<Prisma.ContactWhereInput> {
  const where: Prisma.ContactWhereInput = { userId };

  if (filters.q) {
    where.name = { contains: filters.q, mode: "insensitive" };
  }
  if (filters.company) {
    where.company = { contains: filters.company, mode: "insensitive" };
  }
  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }
  if (filters.specialtyId) {
    const specialty = await prisma.specialty.findFirst({
      where: { id: filters.specialtyId, userId },
      include: { children: { select: { id: true } } },
    });

    if (specialty && specialty.children.length > 0) {
      where.specialtyId = {
        in: [specialty.id, ...specialty.children.map((child) => child.id)],
      };
    } else {
      where.specialtyId = filters.specialtyId;
    }
  }

  return where;
}

export const contactInclude = {
  specialty: { include: { parent: true } },
} as const satisfies Prisma.ContactInclude;

export type ContactWithSpecialty = Prisma.ContactGetPayload<{
  include: { specialty: { include: { parent: true } } };
}>;
