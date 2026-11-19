import Link from "next/link";
import { ContactList } from "@/components/contacts/contact-list";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { contactInclude, toContactView } from "@/lib/contacts";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const secondaryLinkClassName =
  "text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900";

export default async function DashboardPage() {
  const user = await requireUser();

  const [totalContacts, favoriteCount, recent] = await Promise.all([
    prisma.contact.count({ where: { userId: user.userId } }),
    prisma.contact.count({ where: { userId: user.userId, isFavorite: true } }),
    prisma.contact.findMany({
      where: { userId: user.userId },
      include: contactInclude,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Panel</h1>
          <p className="text-sm text-slate-600">Una visión rápida de su agenda.</p>
        </div>
        <Link href="/favorites" className={secondaryLinkClassName}>
          Ver favoritos
        </Link>
      </div>

      <StatsCards totalContacts={totalContacts} favoriteCount={favoriteCount} />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Contactos recientes</h2>
          <Link href="/contacts" className={secondaryLinkClassName}>
            Ver todos los contactos
          </Link>
        </div>
        <ContactList items={recent.map(toContactView)} />
      </section>
    </div>
  );
}
