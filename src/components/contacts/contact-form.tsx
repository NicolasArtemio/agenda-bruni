"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SpecialtyPicker } from "@/components/contacts/specialty-picker";
import { StickerPicker } from "@/components/contacts/sticker-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactView } from "@/lib/contacts";
import { PROVINCES } from "@/lib/provinces";
import type { SpecialtyTreeNode } from "@/lib/specialties";
import type { StickerSummary } from "@/lib/sticker-colors";
import { contactCreateSchema, contactUpdateSchema } from "@/lib/validation/contact";

type ContactFormProps = {
  specialties: SpecialtyTreeNode[];
  stickers: StickerSummary[];
  contact?: ContactView;
  mode: "create" | "edit";
};

type ErrorResponse = {
  ok: false;
  error?: { message?: string };
};

const selectClassName =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60";

export function ContactForm({ specialties, stickers, contact, mode }: ContactFormProps) {
  const router = useRouter();
  const [name, setName] = useState(contact?.name ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [company, setCompany] = useState(contact?.company ?? "");
  const [city, setCity] = useState(contact?.city ?? "");
  const [province, setProvince] = useState(contact?.province ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [specialtyId, setSpecialtyId] = useState(contact?.specialtyId ?? "");
  const [stickerIds, setStickerIds] = useState<string[]>(
    contact?.stickers.map((sticker) => sticker.id) ?? [],
  );
  const [isFavorite, setIsFavorite] = useState(contact?.isFavorite ?? false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      name,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      company: company.trim() || undefined,
      city: city.trim() || undefined,
      province: province || null,
      notes: notes.trim() || null,
      specialtyId: specialtyId || null,
      stickerIds,
      isFavorite,
    };

    const validation =
      mode === "create"
        ? contactCreateSchema.safeParse(payload)
        : contactUpdateSchema.safeParse(payload);

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revise el formulario.");
      return;
    }

    setLoading(true);

    try {
      const url = mode === "edit" && contact ? `/api/contacts/${contact.id}` : "/api/contacts";
      const response = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      if (!response.ok) {
        const failure = (await response.json()) as ErrorResponse;
        setError(
          failure.error?.message ??
            (mode === "edit" ? "No se pudo actualizar el contacto." : "No se pudo crear el contacto."),
        );
        return;
      }

      router.push("/contacts");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Datos del contacto" : "Editar contacto"}</CardTitle>
        <p className="text-sm text-slate-600">
          {mode === "create"
            ? "Complete los datos que desea recordar."
            : "Actualice los datos siguientes y guarde los cambios."}
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={120}
              placeholder="Nombre y apellido"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                maxLength={120}
                placeholder="+54 11 5555 0100"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                maxLength={120}
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                name="company"
                maxLength={120}
                placeholder="Empresa S.A."
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                name="city"
                maxLength={120}
                placeholder="Ciudad"
                value={city}
                onChange={(event) => setCity(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <select
                id="province"
                name="province"
                className={selectClassName}
                value={province}
                onChange={(event) => setProvince(event.target.value)}
              >
                <option value="">Sin provincia</option>
                {PROVINCES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              name="notes"
              maxLength={200}
              rows={3}
              placeholder="Información adicional sobre el contacto"
              className={`${selectClassName} min-h-[4.5rem] resize-y`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <p className="text-right text-xs text-slate-500">{notes.length}/200</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <SpecialtyPicker
              specialties={specialties}
              value={specialtyId}
              onChange={setSpecialtyId}
              name="specialtyId"
              id="specialty"
              includeAny={false}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-sm font-medium text-slate-700">Stickers</legend>
            <StickerPicker
              stickers={stickers}
              value={stickerIds}
              onChange={setStickerIds}
              max={5}
              id="stickers"
            />
          </fieldset>

          <div className="flex items-center gap-2">
            <input
              id="isFavorite"
              name="isFavorite"
              type="checkbox"
              checked={isFavorite}
              onChange={(event) => setIsFavorite(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            <Label htmlFor="isFavorite" className="cursor-pointer">
              Marcar como favorito
            </Label>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Espere..." : mode === "create" ? "Crear contacto" : "Guardar cambios"}
            </Button>
            <Button
              type="button"
              className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              onClick={() => router.push("/contacts")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
