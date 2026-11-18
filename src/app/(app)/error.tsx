"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Ocurrió un error</h1>
      <p className="text-sm text-slate-600">
        No se pudo cargar esta página. Inténtelo de nuevo.
      </p>
      <Button type="button" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
