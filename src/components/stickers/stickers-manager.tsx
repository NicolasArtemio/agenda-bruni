"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { StickerColorPicker } from "@/components/stickers/sticker-color-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  STICKER_COLOR_VALUES,
  stickerChipClassName,
  type StickerSummary,
} from "@/lib/sticker-colors";

type StickersManagerProps = {
  stickers: StickerSummary[];
};

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error?: { message?: string } };

const smallButtonClassName =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60";

const dangerButtonClassName =
  "rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60";

async function readResult<T>(response: Response): Promise<T> {
  const result = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !result.ok) {
    throw new Error(
      (result.ok ? null : result.error?.message) ?? "No se pudo completar la solicitud.",
    );
  }

  return result.data;
}

function StickerChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-xs font-medium ${stickerChipClassName(color)}`}
      title={name}
    >
      <span className="truncate">{name}</span>
    </span>
  );
}

export function StickersManager({ stickers }: StickersManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(STICKER_COLOR_VALUES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<string>(STICKER_COLOR_VALUES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/stickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, color }),
      });

      await readResult(response);
      setName("");
      setColor(STICKER_COLOR_VALUES[0]);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear el sticker.");
    } finally {
      setBusy(false);
    }
  }

  async function update(id: string) {
    const trimmedName = editName.trim();

    if (!trimmedName || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/stickers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, color: editColor }),
      });

      await readResult(response);
      cancelEdit();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar el sticker.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, stickerName: string) {
    if (
      !window.confirm(
        `¿Eliminar el sticker "${stickerName}"? Los contactos que lo tengan quedarán sin sticker.`,
      ) ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/stickers/${id}`, { method: "DELETE" });

      await readResult(response);

      if (editingId === id) {
        cancelEdit();
      }

      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar el sticker.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(sticker: StickerSummary) {
    setEditingId(sticker.id);
    setEditName(sticker.name);
    setEditColor(sticker.color);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditColor(STICKER_COLOR_VALUES[0]);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar un sticker</CardTitle>
          <p className="text-sm text-slate-600">
            Los stickers son privados de su cuenta y sirven para clasificar contactos con un color.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void create(event)} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-sticker-name">Nombre del sticker</Label>
              <Input
                id="new-sticker-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="p. ej. Cliente"
                maxLength={60}
                className="max-w-xs"
                disabled={busy}
              />
            </div>
            <StickerColorPicker value={color} onChange={setColor} disabled={busy} />
            <Button type="submit" disabled={busy || !name.trim()}>
              {busy ? "Guardando..." : "Agregar sticker"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Sus stickers</CardTitle>
        </CardHeader>
        <CardContent>
          {stickers.length === 0 ? (
            <p className="text-sm text-slate-600">
              Todavía no hay stickers. Agregue el primero arriba.
            </p>
          ) : (
            <ul className="space-y-3">
              {stickers.map((sticker) => (
                <li
                  key={sticker.id}
                  className="rounded-md border border-slate-200 p-3"
                >
                  {editingId === sticker.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-sticker-${sticker.id}`}>Nombre</Label>
                        <Input
                          id={`edit-sticker-${sticker.id}`}
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          maxLength={60}
                          className="max-w-xs"
                          disabled={busy}
                          autoFocus
                        />
                      </div>
                      <StickerColorPicker
                        value={editColor}
                        onChange={setEditColor}
                        disabled={busy}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          className={smallButtonClassName}
                          onClick={() => void update(sticker.id)}
                          disabled={busy || !editName.trim()}
                        >
                          Guardar
                        </Button>
                        <Button
                          type="button"
                          className={smallButtonClassName}
                          onClick={cancelEdit}
                          disabled={busy}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <StickerChip name={sticker.name} color={sticker.color} />
                      <Button
                        type="button"
                        className={smallButtonClassName}
                        onClick={() => startEdit(sticker)}
                        disabled={busy}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        className={dangerButtonClassName}
                        onClick={() => void remove(sticker.id, sticker.name)}
                        disabled={busy}
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
