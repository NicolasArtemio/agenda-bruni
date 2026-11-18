"use client";

import type { Specialty } from "@prisma/client";
import { Fragment, useEffect, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SpecialtyTreeNode } from "@/lib/specialties";

type SpecialtyPickerProps = {
  specialties: SpecialtyTreeNode[];
  value: string;
  onChange: (id: string) => void;
  name?: string;
  id?: string;
  includeAny?: boolean;
  emptyLabel?: string;
};

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error?: { message?: string } };

const selectClassName =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60";

const smallButtonClassName =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60";

export function SpecialtyPicker({
  specialties,
  value,
  onChange,
  name = "specialtyId",
  id,
  includeAny = true,
  emptyLabel,
}: SpecialtyPickerProps) {
  const [items, setItems] = useState<SpecialtyTreeNode[]>(specialties);
  const [mode, setMode] = useState<"parent" | "child" | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectId = id ?? name;
  const inputId = `${selectId}-new-name`;

  useEffect(() => {
    setItems(specialties);
  }, [specialties]);

  function openCreation(nextMode: "parent" | "child") {
    setMode(nextMode);
    setParentId(nextMode === "child" ? value : null);
    setDraftName("");
    setError(null);
  }

  function closeCreation() {
    setMode(null);
    setParentId(null);
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
      const response = await fetch("/api/specialties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          ...(parentId ? { parentId } : {}),
        }),
      });
      const result = (await response.json()) as ApiEnvelope<Specialty>;

      if (!response.ok || !result.ok) {
        setError(
          (result.ok ? null : result.error?.message) ?? "No se pudo crear la especialidad.",
        );
        return;
      }

      const created: SpecialtyTreeNode = { ...result.data, children: [] };
      setItems((current) =>
        created.parentId
          ? current.map((parent) =>
              parent.id === created.parentId
                ? { ...parent, children: [...parent.children, created] }
                : parent,
            )
          : [...current, created],
      );
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

  const canAddSubcategory = items.some((parent) => parent.id === value);
  const resolvedEmptyLabel = emptyLabel ?? (includeAny ? "Todas las especialidades" : "Sin especialidad");

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
        <option value="">{resolvedEmptyLabel}</option>
        {items.map((parent) => (
          <Fragment key={parent.id}>
            <option value={parent.id}>{parent.name}</option>
            {parent.children.map((child) => (
              <option key={child.id} value={child.id}>{`— ${child.name}`}</option>
            ))}
          </Fragment>
        ))}
      </select>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          className={smallButtonClassName}
          onClick={() => openCreation("parent")}
          disabled={saving || mode !== null}
        >
          Nueva
        </Button>
        <Button
          type="button"
          className={smallButtonClassName}
          onClick={() => openCreation("child")}
          disabled={saving || !canAddSubcategory || mode !== null}
        >
          Agregar subcategoría
        </Button>
      </div>

      {mode ? (
        <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
          <Label htmlFor={inputId} className="text-xs">
            {mode === "parent"
              ? "Nueva especialidad"
              : `Nueva subcategoría de ${items.find((parent) => parent.id === parentId)?.name ?? "especialidad"}`}
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id={inputId}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              maxLength={120}
              placeholder={mode === "parent" ? "p. ej. Cardiología" : "p. ej. Intervencionista"}
              className="max-w-xs"
              disabled={saving}
              autoFocus
            />
            <Button
              type="button"
              className={smallButtonClassName}
              onClick={() => void saveCreation()}
              disabled={saving || !draftName.trim()}
            >
              {saving ? "Guardando..." : "Guardar"}
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
