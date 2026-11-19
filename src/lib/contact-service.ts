import type { Prisma } from "@prisma/client";
import {
  contactInclude,
  toContactView,
  type ContactRecord,
  type ContactView,
} from "@/lib/contacts";
import { prisma } from "@/lib/prisma";
import { assertValidSpecialty } from "@/lib/specialties";
import { assertValidStickers } from "@/lib/stickers";
import type { ContactCreateInput, ContactUpdateInput } from "@/lib/validation/contact";

export async function createContactForUser(
  userId: string,
  data: ContactCreateInput,
): Promise<ContactView> {
  const { stickerIds, ...rest } = data;

  await assertValidSpecialty(data.specialtyId, userId);
  await assertValidStickers(stickerIds, userId);

  const contact = await prisma.contact.create({
    data: {
      ...rest,
      userId,
      stickers: {
        create: stickerIds.map((stickerId) => ({ stickerId })),
      },
    },
    include: contactInclude,
  });

  return toContactView(contact);
}

export async function updateContactForUser(
  userId: string,
  contactId: string,
  data: ContactUpdateInput,
): Promise<ContactView | null> {
  const { stickerIds, ...rest } = data;

  if (data.specialtyId !== undefined) {
    await assertValidSpecialty(data.specialtyId, userId);
  }

  if (stickerIds !== undefined) {
    await assertValidStickers(stickerIds, userId);
  }

  const contact: ContactRecord | null = await prisma.$transaction(async (tx) => {
    if (Object.keys(rest).length > 0) {
      const result = await tx.contact.updateMany({
        where: { id: contactId, userId },
        data: rest as Prisma.ContactUncheckedUpdateManyInput,
      });

      if (result.count === 0) {
        return null;
      }
    } else {
      const existing = await tx.contact.findFirst({
        where: { id: contactId, userId },
        select: { id: true },
      });

      if (!existing) {
        return null;
      }
    }

    if (stickerIds !== undefined) {
      await tx.contactSticker.deleteMany({ where: { contactId } });

      if (stickerIds.length > 0) {
        await tx.contactSticker.createMany({
          data: stickerIds.map((stickerId) => ({ contactId, stickerId })),
          skipDuplicates: true,
        });
      }
    }

    return tx.contact.findFirst({
      where: { id: contactId, userId },
      include: contactInclude,
    });
  });

  return contact ? toContactView(contact) : null;
}

export async function getContactForUser(
  userId: string,
  contactId: string,
): Promise<ContactView | null> {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, userId },
    include: contactInclude,
  });

  return contact ? toContactView(contact) : null;
}
