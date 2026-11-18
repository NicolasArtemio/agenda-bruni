import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/layout/logout-button";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="font-semibold text-slate-900">
            Agenda Bruni
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <span className="max-w-[9rem] truncate text-xs text-slate-600 sm:max-w-xs sm:text-sm">
              {session.email}
            </span>
            <LogoutButton />
          </div>
          <nav
            aria-label="Navegación principal"
            className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-sm sm:order-none sm:w-auto sm:border-0 sm:pt-0"
          >
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900">
              Panel
            </Link>
            <Link href="/contacts" className="text-slate-600 hover:text-slate-900">
              Contactos
            </Link>
            <Link href="/favorites" className="text-slate-600 hover:text-slate-900">
              Favoritos
            </Link>
            <Link href="/specialties" className="text-slate-600 hover:text-slate-900">
              Especialidades
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
