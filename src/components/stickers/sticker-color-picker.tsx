"use client";

import { STICKER_COLORS } from "@/lib/sticker-colors";
import { cn } from "@/lib/utils";

type StickerColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function StickerColorPicker({ value, onChange, disabled }: StickerColorPickerProps) {
  return (
    <div role="group" aria-label="Color del sticker" className="flex flex-wrap items-center gap-2">
      {STICKER_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          disabled={disabled}
          aria-pressed={value === color.value}
          title={color.label}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60",
            color.chipClassName,
            value === color.value && "ring-2 ring-slate-900 ring-offset-1",
          )}
        >
          {color.label}
        </button>
      ))}
    </div>
  );
}
