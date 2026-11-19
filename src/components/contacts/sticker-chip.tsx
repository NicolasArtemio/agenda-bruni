"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { StickerSummary } from "@/lib/sticker-colors";
import { stickerChipClassName } from "@/lib/sticker-colors";
import { cn } from "@/lib/utils";

type StickerChipProps = {
  sticker: Pick<StickerSummary, "id" | "name" | "color">;
};

export function StickerChip({ sticker }: StickerChipProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());
  const selected = (searchParams.get("stickers") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  const next = Array.from(new Set([...selected, sticker.id]));
  params.set("stickers", next.join(","));
  params.delete("page");

  const href = params.toString().length > 0 ? `${pathname}?${params.toString()}` : pathname;

  return (
    <Link
      href={href}
      title={`Filtrar por el sticker ${sticker.name}`}
      aria-label={`Filtrar por el sticker ${sticker.name}`}
      className={cn(
        "inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        stickerChipClassName(sticker.color),
      )}
    >
      <span className="truncate">{sticker.name}</span>
    </Link>
  );
}
