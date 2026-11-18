import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingrese un correo electrónico válido."),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(72, "La contraseña no puede superar los 72 caracteres."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingrese un correo electrónico válido."),
  password: z.string()
    .min(1, "La contraseña es obligatoria.")
    .max(72, "La contraseña no puede superar los 72 caracteres."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
