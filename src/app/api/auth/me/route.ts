import { handleApiError, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireApiUser();

    return ok({ user: session });
  } catch (error) {
    return handleApiError(error);
  }
}
