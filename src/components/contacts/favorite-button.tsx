"use client";

import { Star, StarOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  contactId: string;
  initialFavorite: boolean;
  className?: string;
};

type ErrorResponse = {
  ok?: false;
  error?: { message?: string };
};

export function FavoriteButton({ contactId, initialFavorite, className }: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the optimistic value aligned when a server refresh returns a new prop.
  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  async function handleToggle() {
    if (loading) {
      return;
    }

    const next = !isFavorite;
    setError(null);
    setIsFavorite(next);
    setLoading(true);

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });

      if (!response.ok) {
        const failure = (await response.json()) as ErrorResponse;
        setError(failure.error?.message ?? "No se pudo actualizar el favorito.");
        setIsFavorite(!next);
        return;
      }

      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtelo de nuevo.");
      setIsFavorite(!next);
    } finally {
      setLoading(false);
    }
  }

  const label = isFavorite ? "Quitar de favoritos" : "Agregar a favoritos";
  const Icon = isFavorite ? Star : StarOff;

  return (
    <div className="flex shrink-0 flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        aria-label={label}
        aria-pressed={isFavorite}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          isFavorite && "border-amber-200 bg-amber-50 text-amber-600",
          className,
        )}
      >
        <Icon aria-hidden="true" className="h-4 w-4" />
      </button>
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
