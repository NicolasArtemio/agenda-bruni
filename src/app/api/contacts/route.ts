import type { NextRequest } from "next/server";
import { fail, handleApiError, ok, readJson } from "@/lib/api-response";
import { buildContactWhere, contactInclude } from "@/lib/contacts";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { assertValidSpecialty } from "@/lib/specialties";
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
      items,
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

    await assertValidSpecialty(data.specialtyId, user.userId);

    const contact = await prisma.contact.create({
      data: { ...data, userId: user.userId },
      include: contactInclude,
    });

    return ok(contact, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
