"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      // Keep the session intact and let the user retry.
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleLogout} disabled={loading} className="px-3 py-1.5 text-xs">
      {loading ? "Espere..." : "Cerrar sesión"}
    </Button>
  );
}
