import type { NextRequest } from "next/server";
import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { createContactForUser } from "@/lib/contact-service";
import { buildContactWhere, contactInclude, toContactView } from "@/lib/contacts";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { assertValidStickers, NO_STICKER_FILTER } from "@/lib/stickers";
import { contactCreateSchema, contactFiltersSchema } from "@/lib/validation/contact";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const parsed = contactFiltersSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Filtros inválidos.", 422);
    }

    const { page, limit } = parsed.data;

    await assertValidStickers(
      parsed.data.stickers.filter((id) => id !== NO_STICKER_FILTER),
      user.userId,
    );

    const where = await buildContactWhere(user.userId, parsed.data);

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: contactInclude,
      }),
      prisma.contact.count({ where }),
    ]);

    return ok({
      items: items.map(toContactView),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    const data = await readJson(request, contactCreateSchema);

    const contact = await createContactForUser(user.userId, data);

    return ok(contact, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
