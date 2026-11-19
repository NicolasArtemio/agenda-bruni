import { handleApiError, ok, readJson } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { assertUniqueStickerName, getStickerList } from "@/lib/stickers";
import { stickerCreateSchema } from "@/lib/validation/sticker";

export async function GET() {
  try {
    const user = await requireApiUser();

    return ok(await getStickerList(user.userId));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const data = await readJson(request, stickerCreateSchema);

    await assertUniqueStickerName(user.userId, data.name);

    const sticker = await prisma.sticker.create({
      data: {
        name: data.name,
        color: data.color,
        userId: user.userId,
      },
      select: { id: true, name: true, color: true },
    });

    return ok(sticker, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
