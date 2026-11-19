import { ContactForm } from "@/components/contacts/contact-form";
import { requireUser } from "@/lib/session";
import { getSpecialtyTree } from "@/lib/specialties";
import { getStickerList } from "@/lib/stickers";

export default async function NewContactPage() {
  const user = await requireUser();
  const [specialties, stickers] = await Promise.all([
    getSpecialtyTree(user.userId),
    getStickerList(user.userId),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nuevo contacto</h1>
        <p className="text-sm text-slate-600">Agregue una persona a su agenda.</p>
      </div>
      <ContactForm mode="create" specialties={specialties} stickers={stickers} />
    </div>
  );
}
