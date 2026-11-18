"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SpecialtyTreeNode } from "@/lib/specialties";

type SpecialtiesManagerProps = {
  specialties: SpecialtyTreeNode[];
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

type SpecialtyRowProps = {
  name: string;
  editing: boolean;
  editName: string;
  busy: boolean;
  onEditNameChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
};

function SpecialtyRow({
  name,
  editing,
  editName,
  busy,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: SpecialtyRowProps) {
  const inputId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      onSaveEdit();
    } else if (event.key === "Escape") {
      onCancelEdit();
    }
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={inputId} className="sr-only">
          Renombrar {name}
        </Label>
        <Input
          id={inputId}
          value={editName}
          onChange={(event) => onEditNameChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={120}
          className="max-w-xs"
          disabled={busy}
          autoFocus
        />
        <Button
          type="button"
          className={smallButtonClassName}
          onClick={onSaveEdit}
          disabled={busy || !editName.trim()}
        >
          Guardar
        </Button>
        <Button
          type="button"
          className={smallButtonClassName}
          onClick={onCancelEdit}
          disabled={busy}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-800">{name}</span>
      <Button type="button" className={smallButtonClassName} onClick={onStartEdit} disabled={busy}>
        Renombrar
      </Button>
      <Button type="button" className={dangerButtonClassName} onClick={onDelete} disabled={busy}>
        Eliminar
      </Button>
    </div>
  );
}

export function SpecialtiesManager({ specialties }: SpecialtiesManagerProps) {
  const router = useRouter();
  const [parentName, setParentName] = useState("");
  const [childParentId, setChildParentId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(event: FormEvent<HTMLFormElement>, parentId: string | null) {
    event.preventDefault();
    const name = (parentId ? childName : parentName).trim();

    if (!name || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/specialties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ...(parentId ? { parentId } : {}) }),
      });

      await readResult(response);

      if (parentId) {
        setChildParentId(null);
        setChildName("");
      } else {
        setParentName("");
      }

      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la especialidad.");
    } finally {
      setBusy(false);
    }
  }

  async function rename(id: string) {
    const name = editName.trim();

    if (!name || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/specialties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      await readResult(response);
      setEditingId(null);
      setEditName("");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo renombrar la especialidad.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string, hasChildren: boolean) {
    const message = hasChildren
      ? `¿Eliminar "${name}"? También se eliminarán sus subcategorías y sus vínculos con los contactos.`
      : `¿Eliminar "${name}"? También se eliminarán sus vínculos con los contactos.`;

    if (!window.confirm(message) || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/specialties/${id}`, { method: "DELETE" });

      await readResult(response);

      if (editingId === id) {
        setEditingId(null);
        setEditName("");
      }

      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la especialidad.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditName(name);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function cancelChild() {
    setChildParentId(null);
    setChildName("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar una especialidad</CardTitle>
          <p className="text-sm text-slate-600">
            Cree una especialidad de primer nivel. Agregue subcategorías desde la lista siguiente.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(event) => void create(event, null)} className="space-y-2">
            <Label htmlFor="new-parent-name">Nombre de la especialidad</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="new-parent-name"
                value={parentName}
                onChange={(event) => setParentName(event.target.value)}
                placeholder="p. ej. Cardiología"
                maxLength={120}
                className="max-w-xs"
                disabled={busy}
              />
              <Button type="submit" disabled={busy || !parentName.trim()}>
                {busy ? "Guardando..." : "Agregar especialidad"}
              </Button>
            </div>
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
          <CardTitle>Sus especialidades</CardTitle>
        </CardHeader>
        <CardContent>
          {specialties.length === 0 ? (
            <p className="text-sm text-slate-600">Todavía no hay especialidades. Agregue la primera arriba.</p>
          ) : (
            <ul className="space-y-4">
              {specialties.map((parent) => (
                <li key={parent.id} className="rounded-md border border-slate-200 p-3">
                  <SpecialtyRow
                    name={parent.name}
                    editing={editingId === parent.id}
                    editName={editName}
                    busy={busy}
                    onEditNameChange={setEditName}
                    onStartEdit={() => startEdit(parent.id, parent.name)}
                    onSaveEdit={() => void rename(parent.id)}
                    onCancelEdit={cancelEdit}
                    onDelete={() => void remove(parent.id, parent.name, parent.children.length > 0)}
                  />

                  {parent.children.length > 0 ? (
                    <ul className="mt-3 space-y-2 border-l-2 border-slate-100 pl-4">
                      {parent.children.map((child) => (
                        <li key={child.id}>
                          <SpecialtyRow
                            name={child.name}
                            editing={editingId === child.id}
                            editName={editName}
                            busy={busy}
                            onEditNameChange={setEditName}
                            onStartEdit={() => startEdit(child.id, child.name)}
                            onSaveEdit={() => void rename(child.id)}
                            onCancelEdit={cancelEdit}
                            onDelete={() => void remove(child.id, child.name, false)}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-3">
                    {childParentId === parent.id ? (
                      <form
                        onSubmit={(event) => void create(event, parent.id)}
                        className="space-y-2"
                      >
                        <Label htmlFor={`new-child-${parent.id}`} className="text-xs">
                          Nueva subcategoría de {parent.name}
                        </Label>
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            id={`new-child-${parent.id}`}
                            value={childName}
                            onChange={(event) => setChildName(event.target.value)}
                            placeholder="p. ej. Intervencionista"
                            maxLength={120}
                            className="max-w-xs"
                            disabled={busy}
                          />
                          <Button
                            type="submit"
                            className={smallButtonClassName}
                            disabled={busy || !childName.trim()}
                          >
                            {busy ? "Guardando..." : "Guardar"}
                          </Button>
                          <Button
                            type="button"
                            className={smallButtonClassName}
                            onClick={cancelChild}
                            disabled={busy}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        type="button"
                        className={smallButtonClassName}
                        onClick={() => {
                          setChildParentId(parent.id);
                          setChildName("");
                          setError(null);
                        }}
                        disabled={busy}
                      >
                        Agregar subcategoría
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
