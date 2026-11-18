"use client";

import { Loader2, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeleteContactButtonProps = {
  contactId: string;
  contactName?: string;
  className?: string;
  iconOnly?: boolean;
};

type ErrorResponse = {
  ok: false;
  error?: { message?: string };
};

export function DeleteContactButton({
  contactId,
  contactName,
  className,
  iconOnly = false,
}: DeleteContactButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar ${contactName ?? "este contacto"}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });

      if (!response.ok) {
        const failure = (await response.json()) as ErrorResponse;
        setError(failure.error?.message ?? "No se pudo eliminar el contacto.");
        return;
      }

      if (pathname.startsWith(`/contacts/${contactId}`)) {
        router.push("/contacts");
      }
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-1",
        iconOnly && "flex shrink-0 flex-col items-end gap-1",
      )}
    >
      <Button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        aria-label={iconOnly ? "Eliminar contacto" : undefined}
        title={iconOnly ? "Eliminar contacto" : undefined}
        className={cn(
          iconOnly
            ? "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            : "border border-red-200 bg-white px-3 py-1.5 text-xs text-red-700 hover:bg-red-50",
          className,
        )}
      >
        {iconOnly ? (
          loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )
        ) : loading ? (
          "Espere..."
        ) : (
          "Eliminar"
        )}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
