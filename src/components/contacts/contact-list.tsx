import Link from "next/link";
import { ContactCard } from "@/components/contacts/contact-card";
import { Card, CardContent } from "@/components/ui/card";
import type { ContactView } from "@/lib/contacts";

type ContactListProps = {
  items: ContactView[];
  emptyMessage?: string;
};

export function ContactList({ items, emptyMessage = "Todavía no hay contactos" }: ContactListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">{emptyMessage}</h2>
          <p className="text-sm text-slate-600">Agregue su primer contacto para empezar su agenda.</p>
          <Link href="/contacts/new" className="text-sm font-medium text-slate-900 underline">
            Agregar un contacto
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}
