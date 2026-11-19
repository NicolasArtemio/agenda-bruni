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
  value: string;
  onChange: (id: string) => void;
  name?: string;
  id?: string;
};

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error?: { message?: string } };

const selectClassName =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60";

const smallButtonClassName =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60";

export function StickerPicker({
  stickers,
  value,
  onChange,
  name = "stickerId",
  id,
}: StickerPickerProps) {
  const [items, setItems] = useState<StickerSummary[]>(stickers);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState<string>(STICKER_COLOR_VALUES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectId = id ?? name;
  const inputId = `${selectId}-new-name`;

  useEffect(() => {
    setItems(stickers);
  }, [stickers]);

  const selected = items.find((sticker) => sticker.id === value);

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
      onChange(created.id);
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
      <select
        id={selectId}
        name={name}
        className={selectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={saving}
      >
        <option value="">Sin sticker</option>
        {items.map((sticker) => (
          <option key={sticker.id} value={sticker.id}>
            {sticker.name}
          </option>
        ))}
      </select>

      {selected ? (
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            stickerChipClassName(selected.color),
          )}
        >
          {selected.name}
        </span>
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
