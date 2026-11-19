import { Building2, Mail, MapPin, MessageCircle, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { FavoriteButton } from "@/components/contacts/favorite-button";
import { StickerChip } from "@/components/contacts/sticker-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContactWithSpecialty } from "@/lib/contacts";
import { capitalizeWords } from "@/lib/utils";

type ContactCardProps = {
  contact: ContactWithSpecialty;
};

function specialtyLabel(contact: ContactWithSpecialty): string | null {
  const { specialty } = contact;

  if (!specialty) {
    return null;
  }

  return specialty.parent ? `${specialty.parent.name} · ${specialty.name}` : specialty.name;
}

export function ContactCard({ contact }: ContactCardProps) {
  const label = specialtyLabel(contact);
  const displayName = capitalizeWords(contact.name);
  const whatsappDigits = (contact.phone ?? "").replace(/\D/g, "");
  const location = [contact.city, contact.province].filter(Boolean).join(", ");

  return (
    <Card className="flex h-full min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-lg" title={contact.name}>
            {displayName}
          </CardTitle>
          {label || contact.sticker ? (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {label ? (
                <span
                  className="inline-flex max-w-full items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                  title={label}
                >
                  <span className="truncate">{label}</span>
                </span>
              ) : null}
              {contact.sticker ? <StickerChip sticker={contact.sticker} /> : null}
            </div>
          ) : null}
        </div>
        <FavoriteButton contactId={contact.id} initialFavorite={contact.isFavorite} />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 p-4 pt-3 text-sm text-slate-600">
        <ul className="flex flex-col gap-2">
          {contact.phone ? (
            <li className="flex min-w-0 items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate" title={contact.phone}>
                <a
                  href={`tel:${contact.phone}`}
                  className="truncate hover:text-slate-900 hover:underline"
                  aria-label={`Llamar a ${displayName}`}
                  title={contact.phone}
                >
                  {contact.phone}
                </a>
              </span>
              {whatsappDigits.length > 0 ? (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir en WhatsApp"
                  title="Abrir en WhatsApp"
                  className="shrink-0 text-green-600 hover:text-green-700"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </li>
          ) : null}
          {contact.email ? (
            <li className="flex min-w-0 items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate" title={contact.email}>
                <a
                  href={`mailto:${contact.email}`}
                  className="truncate hover:text-slate-900 hover:underline"
                  aria-label={`Enviar correo a ${displayName}`}
                  title={contact.email}
                >
                  {contact.email}
                </a>
              </span>
            </li>
          ) : null}
          {contact.company ? (
            <li className="flex min-w-0 items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate" title={contact.company}>
                {contact.company}
              </span>
            </li>
          ) : null}
          {location ? (
            <li className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate" title={location}>
                {location}
              </span>
            </li>
          ) : null}
        </ul>

        {contact.notes ? (
          <p className="line-clamp-2 text-xs text-slate-500" title={contact.notes}>
            {contact.notes}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <time
            className="text-[11px] text-slate-400"
            dateTime={contact.createdAt.toISOString()}
          >
            {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(contact.createdAt)}
          </time>
          <div className="flex items-center gap-2">
            <Link
              href={`/contacts/${contact.id}`}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="Editar contacto"
              title="Editar contacto"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
            <DeleteContactButton contactId={contact.id} contactName={contact.name} iconOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
