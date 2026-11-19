"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { StickerColorPicker } from "@/components/stickers/sticker-color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STICKER_COLOR_VALUES, stickerChipClassName, type StickerSummary } from "@/lib/sticker-colors";
import { cn } from "@/lib/utils";

type StickerPickerProps = {
  stickers: StickerSummary[];
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  id?: string;
};

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error?: { message?: string } };

const smallButtonClassName =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60";

export function StickerPicker({
  stickers,
  value,
  onChange,
  max = 5,
  id,
}: StickerPickerProps) {
  const [items, setItems] = useState<StickerSummary[]>(stickers);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState<string>(STICKER_COLOR_VALUES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseId = id ?? "stickers";
  const inputId = `${baseId}-new-name`;
  const atLimit = value.length >= max;

  useEffect(() => {
    setItems(stickers);
  }, [stickers]);

  function toggle(stickerId: string) {
    if (value.includes(stickerId)) {
      onChange(value.filter((idValue) => idValue !== stickerId));
    } else if (!atLimit) {
      onChange([...value, stickerId]);
    }
  }

  function openCreation() {
    setCreating(true);
    setDraftName("");
    setDraftColor(STICKER_COLOR_VALUES[0]);
    setError(null);
  }

  function closeCreation() {
    setCreating(false);
    setDraftName("");
    setError(null);
  }

  async function saveCreation() {
    const trimmedName = draftName.trim();

    if (!trimmedName || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/stickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, color: draftColor }),
      });
      const result = (await response.json()) as ApiEnvelope<StickerSummary>;

      if (!response.ok || !result.ok) {
        setError((result.ok ? null : result.error?.message) ?? "No se pudo crear el sticker.");
        return;
      }

      const created = result.data;
      setItems((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name, "es")));

      if (!atLimit) {
        onChange([...value, created.id]);
      }

      closeCreation();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtelo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveCreation();
    } else if (event.key === "Escape") {
      closeCreation();
    }
  }

  return (
    <div className="space-y-2">
      <div
        role="group"
        aria-label="Stickers del contacto"
        className="flex flex-wrap items-center gap-2"
      >
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay stickers. Cree uno debajo.</p>
        ) : null}
        {items.map((sticker) => {
          const selected = value.includes(sticker.id);
          const disabled = saving || (!selected && atLimit);

          return (
            <button
              key={sticker.id}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => toggle(sticker.id)}
              title={
                disabled
                  ? "Llegó al máximo de stickers. Quite uno para agregar otro."
                  : selected
                    ? "Quitar este sticker"
                    : "Agregar este sticker"
              }
              className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                stickerChipClassName(sticker.color),
                selected
                  ? "ring-2 ring-slate-900 ring-offset-1"
                  : "opacity-80 hover:opacity-100",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              {selected ? <span aria-hidden="true">✓</span> : null}
              <span className="truncate">{sticker.name}</span>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        {value.length} de {max} stickers seleccionados.
      </p>

      {atLimit ? (
        <p role="status" className="text-xs font-medium text-amber-700">
          Llegó al máximo de {max} stickers. Quite uno para agregar otro.
        </p>
      ) : null}

      <div>
        <Button
          type="button"
          className={smallButtonClassName}
          onClick={openCreation}
          disabled={saving || creating}
        >
          + Crear sticker
        </Button>
      </div>

      {creating ? (
        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="space-y-1">
            <Label htmlFor={inputId} className="text-xs">
              Nombre del sticker
            </Label>
            <Input
              id={inputId}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              maxLength={60}
              placeholder="p. ej. Cliente"
              className="max-w-xs"
              disabled={saving}
              autoFocus
            />
          </div>

          <StickerColorPicker value={draftColor} onChange={setDraftColor} disabled={saving} />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className={smallButtonClassName}
              onClick={() => void saveCreation()}
              disabled={saving || !draftName.trim()}
            >
              {saving ? "Guardando..." : "Crear"}
            </Button>
            <Button
              type="button"
              className={smallButtonClassName}
              onClick={closeCreation}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>

          {error ? (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
