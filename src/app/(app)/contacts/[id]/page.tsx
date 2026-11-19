import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contacts/contact-form";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contactInclude } from "@/lib/contacts";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getSpecialtyTree } from "@/lib/specialties";
import { getStickerList } from "@/lib/stickers";

type ContactPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditContactPage({ params }: ContactPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, userId: user.userId },
    include: contactInclude,
  });

  if (!contact) {
    notFound();
  }

  const [specialties, stickers] = await Promise.all([
    getSpecialtyTree(user.userId),
    getStickerList(user.userId),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Editar contacto</h1>
          <p className="text-sm text-slate-600">Mantenga este registro actualizado.</p>
        </div>
        <DeleteContactButton contactId={contact.id} contactName={contact.name} className="px-4 py-2 text-sm" />
      </div>
      {contact.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
              {contact.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}
      <ContactForm mode="edit" contact={contact} specialties={specialties} stickers={stickers} />
    </div>
  );
}
