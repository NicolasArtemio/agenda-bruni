import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return fail(error.code, error.message, error.status);
  }

  if (error instanceof ZodError) {
    return fail("VALIDATION_ERROR", "Datos inválidos.", 422);
  }

  return fail("INTERNAL_ERROR", "Error inesperado.", 500);
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiError("INVALID_JSON", "El cuerpo de la solicitud debe ser JSON válido.");
  }

  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError("VALIDATION_ERROR", "Datos de la solicitud inválidos.", 422);
    }

    throw error;
  }
}
