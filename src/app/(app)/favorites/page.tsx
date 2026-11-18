import Link from "next/link";
import { ContactList } from "@/components/contacts/contact-list";
import { Pagination } from "@/components/contacts/pagination";
import { contactInclude } from "@/lib/contacts";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { contactFiltersSchema } from "@/lib/validation/contact";

type FavoritesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FavoritesPage({ searchParams }: FavoritesPageProps) {
  const user = await requireUser();
  const raw = await searchParams;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    const single = firstString(value);
    if (single !== undefined) {
      params.set(key, single);
    }
  }

  const parsed = contactFiltersSchema.safeParse(Object.fromEntries(params.entries()));
  const filters = parsed.success ? parsed.data : contactFiltersSchema.parse({});

  const where = { userId: user.userId, isFavorite: true };

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { createdAt: "desc" },
      include: contactInclude,
    }),
    prisma.contact.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Favoritos</h1>
          <p className="text-sm text-slate-600">Los contactos que quiere tener a mano.</p>
        </div>
        <Link
          href="/contacts/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Nuevo contacto
        </Link>
      </div>

      <ContactList items={items} emptyMessage="Todavía no hay contactos favoritos" />
      <Pagination
        page={filters.page}
        totalPages={totalPages}
        total={total}
        searchParams={raw}
        basePath="/favorites"
      />
    </div>
  );
}
