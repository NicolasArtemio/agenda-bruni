"use client";

import Link from "next/link";
import { useState } from "react";
import { SpecialtyPicker } from "@/components/contacts/specialty-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROVINCES } from "@/lib/provinces";
import type { SpecialtyTreeNode } from "@/lib/specialties";
import {
  NO_STICKER_FILTER,
  stickerChipClassName,
  type StickerSummary,
} from "@/lib/sticker-colors";
import { cn } from "@/lib/utils";
import type { ContactFilters as ContactFilterValues } from "@/lib/validation/contact";

type ContactFiltersProps = {
  values: Pick<
    ContactFilterValues,
    "q" | "company" | "city" | "specialtyId" | "province" | "stickers"
  >;
  specialties: SpecialtyTreeNode[];
  stickers: StickerSummary[];
  action?: string;
};

const selectClassName =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60";

const filterChipClassName =
  "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

export function ContactFilters({
  values,
  specialties,
  stickers,
  action = "/contacts",
}: ContactFiltersProps) {
  const [specialtyId, setSpecialtyId] = useState(values.specialtyId ?? "");
  const [stickerIds, setStickerIds] = useState<string[]>(values.stickers ?? []);

  function toggleSticker(stickerId: string) {
    setStickerIds((current) =>
      current.includes(stickerId)
        ? current.filter((id) => id !== stickerId)
        : [...current, stickerId],
    );
  }

  return (
    <Card>
      <CardContent>
        <form method="get" action={action} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filter-q">Nombre</Label>
              <Input id="filter-q" name="q" placeholder="Buscar por nombre" defaultValue={values.q} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-company">Empresa</Label>
              <Input
                id="filter-company"
                name="company"
                placeholder="Buscar por empresa"
                defaultValue={values.company}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-city">Ciudad</Label>
              <Input
                id="filter-city"
                name="city"
                placeholder="Buscar por ciudad"
                defaultValue={values.city}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-province">Provincia</Label>
              <select
                id="filter-province"
                name="province"
                className={selectClassName}
                defaultValue={values.province ?? ""}
              >
                <option value="">Todas las provincias</option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-specialty">Especialidad</Label>
              <SpecialtyPicker
                specialties={specialties}
                value={specialtyId}
                onChange={setSpecialtyId}
                name="specialtyId"
                id="filter-specialty"
                includeAny
              />
            </div>
            <fieldset className="space-y-2">
              <legend className="block text-sm font-medium text-slate-700">Stickers</legend>
              <input type="hidden" name="stickers" value={stickerIds.join(",")} />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={stickerIds.includes(NO_STICKER_FILTER)}
                  onClick={() => toggleSticker(NO_STICKER_FILTER)}
                  className={cn(
                    filterChipClassName,
                    "border-slate-300 bg-white text-slate-600",
                    stickerIds.includes(NO_STICKER_FILTER) &&
                      "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-1",
                  )}
                >
                  Sin sticker
                </button>
                {stickers.map((sticker) => {
                  const selected = stickerIds.includes(sticker.id);

                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleSticker(sticker.id)}
                      className={cn(
                        filterChipClassName,
                        stickerChipClassName(sticker.color),
                        selected
                          ? "ring-2 ring-slate-900 ring-offset-1"
                          : "opacity-80 hover:opacity-100",
                      )}
                    >
                      {selected ? <span aria-hidden="true">✓</span> : null}
                      <span className="truncate">{sticker.name}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Filtrar</Button>
            <Link
              href={action}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Limpiar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
