"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterFormProps = {
  redirectTo?: string;
};

type ErrorResponse = {
  ok: false;
  error?: { message?: string };
};

export function RegisterForm({ redirectTo }: RegisterFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const failure = data as ErrorResponse;
        setError(failure.error?.message ?? "No se pudo crear la cuenta.");
        return;
      }

      router.push(redirectTo || "/dashboard");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = redirectTo ? `/login?next=${encodeURIComponent(redirectTo)}` : "/login";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear una cuenta</CardTitle>
        <p className="text-sm text-slate-600">Comience a organizar sus contactos.</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="text-xs text-slate-500">Use al menos 8 caracteres.</p>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Espere..." : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          ¿Ya tiene una cuenta?{" "}
          <Link href={loginHref} className="font-medium text-slate-900 underline">
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
