import { z } from "zod";

const optionalText = z.string().trim().max(120, "El texto no puede superar los 120 caracteres.");
const emailField = z.string()
  .trim()
  .toLowerCase()
  .email("Ingrese un correo electrónico válido.")
  .max(120, "El correo electrónico no puede superar los 120 caracteres.");
const specialtyIdField = z.string().trim().min(1, "Seleccione una especialidad.");

export const contactCreateSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
  phone: optionalText.optional(),
  email: emailField.optional(),
  company: optionalText.optional(),
  city: optionalText.optional(),
  specialtyId: specialtyIdField.nullable().optional(),
  isFavorite: z.boolean().optional().default(false),
});

export const contactUpdateSchema = z
  .object({
    name: z.string()
      .trim()
      .min(1, "El nombre es obligatorio.")
      .max(120, "El nombre no puede superar los 120 caracteres.")
      .optional(),
    phone: optionalText.optional(),
    email: emailField.optional(),
    company: optionalText.optional(),
    city: optionalText.optional(),
    specialtyId: specialtyIdField.nullable().optional(),
    isFavorite: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Se requiere al menos un campo.",
  });

export const contactFiltersSchema = z.object({
  q: z.string().trim().optional(),
  company: z.string().trim().optional(),
  city: z.string().trim().optional(),
  specialtyId: z.string().trim().optional(),
  page: z.coerce
    .number()
    .int("Debe ser un número entero.")
    .min(1, "Debe ser al menos 1.")
    .default(1),
  limit: z.coerce
    .number()
    .int("Debe ser un número entero.")
    .min(1, "Debe ser al menos 1.")
    .max(50, "No puede superar 50.")
    .default(10),
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
export type ContactFilters = z.infer<typeof contactFiltersSchema>;
