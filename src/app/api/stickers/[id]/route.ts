import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { assertUniqueStickerName } from "@/lib/stickers";
import { stickerUpdateSchema } from "@/lib/validation/sticker";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const data = await readJson(request, stickerUpdateSchema);

    const existing = await prisma.sticker.findFirst({
      where: { id, userId: user.userId },
    });

    if (!existing) {
      return fail("NOT_FOUND", "Sticker no encontrado.", 404);
    }

    if (data.name !== undefined) {
      await assertUniqueStickerName(user.userId, data.name, id);
    }

    const result = await prisma.sticker.updateMany({
      where: { id, userId: user.userId },
      data,
    });

    if (result.count === 0) {
      return fail("NOT_FOUND", "Sticker no encontrado.", 404);
    }

    const sticker = await prisma.sticker.findFirst({
      where: { id, userId: user.userId },
      select: { id: true, name: true, color: true },
    });

    if (!sticker) {
      return fail("NOT_FOUND", "Sticker no encontrado.", 404);
    }

    return ok(sticker);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    // The ON DELETE CASCADE foreign key removes the contact-sticker links,
    // but the contacts themselves are kept.
    const result = await prisma.sticker.deleteMany({
      where: { id, userId: user.userId },
    });

    if (result.count === 0) {
      return fail("NOT_FOUND", "Sticker no encontrado.", 404);
    }

    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
