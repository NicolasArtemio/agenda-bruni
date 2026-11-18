import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  searchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
};

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const numberFormatter = new Intl.NumberFormat("es-AR");

export function Pagination({
  page,
  totalPages,
  total,
  searchParams,
  basePath = "/contacts",
}: PaginationProps) {
  function hrefFor(target: number): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      const single = firstString(value);
      if (single) {
        params.set(key, single);
      }
    }

    params.set("page", String(target));
    return `${basePath}?${params.toString()}`;
  }

  const linkClassName =
    "inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100";
  const disabledClassName =
    "inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-400";

  return (
    <nav
      aria-label="Paginación de contactos"
      className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-slate-600"
    >
      <span>
        Página {numberFormatter.format(page)} de {numberFormatter.format(totalPages)} &middot;{" "}
        {numberFormatter.format(total)} {total === 1 ? "contacto" : "contactos"}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={linkClassName}>
            Anterior
          </Link>
        ) : (
          <span className={disabledClassName} aria-disabled="true">
            Anterior
          </span>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={linkClassName}>
            Siguiente
          </Link>
        ) : (
          <span className={disabledClassName} aria-disabled="true">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
