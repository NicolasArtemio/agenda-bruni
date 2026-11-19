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

export async function assertValidStickers(
  stickerIds: string[],
  userId: string,
): Promise<void> {
  const unique = Array.from(new Set(stickerIds));

  if (unique.length === 0) {
    return;
  }

  const count = await prisma.sticker.count({
    where: { id: { in: unique }, userId },
  });

  if (count !== unique.length) {
    throw new ApiError("NOT_FOUND", "Sticker no encontrado.", 404);
  }
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
