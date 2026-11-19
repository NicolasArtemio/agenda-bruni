import { z } from "zod";
import { STICKER_COLOR_VALUES } from "@/lib/sticker-colors";

const nameField = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(60, "El nombre no puede superar los 60 caracteres.");

const colorField = z.enum(STICKER_COLOR_VALUES, {
  message: "Seleccione un color válido.",
});

export const stickerCreateSchema = z.object({
  name: nameField,
  color: colorField,
});

export const stickerUpdateSchema = z
  .object({
    name: nameField.optional(),
    color: colorField.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Se requiere al menos un campo.",
  });

export type StickerCreateInput = z.infer<typeof stickerCreateSchema>;
export type StickerUpdateInput = z.infer<typeof stickerUpdateSchema>;
