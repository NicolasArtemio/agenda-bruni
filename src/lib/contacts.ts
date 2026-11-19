import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NO_STICKER_FILTER } from "@/lib/sticker-colors";

type ContactFilterValues = {
  q?: string;
  company?: string;
  city?: string;
  specialtyId?: string;
  province?: string;
  stickerId?: string;
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
  if (filters.province) {
    where.province = filters.province;
  }
  if (filters.stickerId) {
    where.stickerId = filters.stickerId === NO_STICKER_FILTER ? null : filters.stickerId;
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
  sticker: { select: { id: true, name: true, color: true } },
} as const satisfies Prisma.ContactInclude;

export type ContactWithSpecialty = Prisma.ContactGetPayload<{
  include: {
    specialty: { include: { parent: true } };
    sticker: { select: { id: true; name: true; color: true } };
  };
}>;
