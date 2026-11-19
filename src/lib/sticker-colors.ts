export const STICKER_COLORS = [
  {
    value: "slate",
    label: "Gris",
    chipClassName: "border-slate-200 bg-slate-100 text-slate-700",
  },
  {
    value: "red",
    label: "Rojo",
    chipClassName: "border-red-200 bg-red-100 text-red-700",
  },
  {
    value: "orange",
    label: "Naranja",
    chipClassName: "border-orange-200 bg-orange-100 text-orange-700",
  },
  {
    value: "amber",
    label: "Ámbar",
    chipClassName: "border-amber-200 bg-amber-100 text-amber-800",
  },
  {
    value: "emerald",
    label: "Verde",
    chipClassName: "border-emerald-200 bg-emerald-100 text-emerald-700",
  },
  {
    value: "sky",
    label: "Celeste",
    chipClassName: "border-sky-200 bg-sky-100 text-sky-700",
  },
  {
    value: "violet",
    label: "Violeta",
    chipClassName: "border-violet-200 bg-violet-100 text-violet-700",
  },
  {
    value: "pink",
    label: "Rosa",
    chipClassName: "border-pink-200 bg-pink-100 text-pink-700",
  },
] as const;

export type StickerColor = (typeof STICKER_COLORS)[number];
export type StickerColorValue = StickerColor["value"];

export const STICKER_COLOR_VALUES = STICKER_COLORS.map((color) => color.value) as [
  StickerColorValue,
  ...StickerColorValue[],
];

export const NEUTRAL_STICKER_CHIP_CLASS = "border-slate-200 bg-slate-100 text-slate-700";

/** Sentinel used by filters to select contacts without any sticker. */
export const NO_STICKER_FILTER = "sin-sticker";

export type StickerSummary = {
  id: string;
  name: string;
  color: string;
};

export function stickerChipClassName(color: string | null | undefined): string {
  return (
    STICKER_COLORS.find((entry) => entry.value === color)?.chipClassName ??
    NEUTRAL_STICKER_CHIP_CLASS
  );
}
