import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NO_STICKER_FILTER, type StickerSummary } from "@/lib/sticker-colors";

export type ContactFilterValues = {
  q?: string;
  company?: string;
  city?: string;
  specialtyId?: string;
  province?: string;
  stickers?: string[];
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

  const stickerFilter = filters.stickers ?? [];
  const stickerIds = Array.from(
    new Set(stickerFilter.filter((id) => id !== NO_STICKER_FILTER)),
  );
  const wantsNoSticker = stickerFilter.includes(NO_STICKER_FILTER);

  if (stickerIds.length > 0 || wantsNoSticker) {
    where.OR = [
      ...(stickerIds.length > 0
        ? [
            {
              stickers: {
                some: { stickerId: { in: stickerIds }, sticker: { userId } },
              },
            },
          ]
        : []),
      ...(wantsNoSticker ? [{ stickers: { none: {} } }] : []),
    ];
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
  stickers: {
    include: { sticker: { select: { id: true, name: true, color: true } } },
    orderBy: { sticker: { name: "asc" } },
  },
} as const satisfies Prisma.ContactInclude;

export type ContactRecord = Prisma.ContactGetPayload<{ include: typeof contactInclude }>;

export type ContactView = Omit<ContactRecord, "stickers"> & {
  stickers: StickerSummary[];
};

export function toContactView(contact: ContactRecord): ContactView {
  const { stickers, ...rest } = contact;

  return {
    ...rest,
    stickers: stickers.map((link) => link.sticker),
  };
}
