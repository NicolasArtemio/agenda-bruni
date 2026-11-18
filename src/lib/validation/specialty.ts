import { z } from "zod";

export const specialtyCreateSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre de la especialidad es obligatorio.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
  parentId: z.string().trim().min(1, "Seleccione una especialidad principal.").optional(),
});

export const specialtyRenameSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre de la especialidad es obligatorio.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
});

export type SpecialtyCreateInput = z.infer<typeof specialtyCreateSchema>;
export type SpecialtyRenameInput = z.infer<typeof specialtyRenameSchema>;
