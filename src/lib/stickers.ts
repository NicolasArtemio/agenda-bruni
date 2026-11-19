import type { Sticker } from "@prisma/client";
import { ApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import type { StickerSummary } from "@/lib/sticker-colors";

export {
  NO_STICKER_FILTER,
  NEUTRAL_STICKER_CHIP_CLASS,
  STICKER_COLORS,
  STICKER_COLOR_VALUES,
  stickerChipClassName,
} from "@/lib/sticker-colors";
export type {
  StickerColor,
  StickerColorValue,
  StickerSummary,
} from "@/lib/sticker-colors";

export function getStickerList(userId: string): Promise<StickerSummary[]> {
  return prisma.sticker.findMany({
    where: { userId },
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });
}

export async function assertValidSticker(
  stickerId: string | null | undefined,
  userId: string,
): Promise<Sticker | null> {
  if (!stickerId) {
    return null;
  }

  const sticker = await prisma.sticker.findFirst({
    where: { id: stickerId, userId },
  });

  if (!sticker) {
    throw new ApiError("NOT_FOUND", "Sticker no encontrado.", 404);
  }

  return sticker;
}

export async function assertUniqueStickerName(
  userId: string,
  name: string,
  excludeId?: string,
): Promise<void> {
  const existing = await prisma.sticker.findFirst({
    where: {
      userId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new ApiError("STICKER_EXISTS", "Ya existe un sticker con ese nombre.", 409);
  }
}
