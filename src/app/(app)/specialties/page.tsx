import { SpecialtiesManager } from "@/components/specialties/specialties-manager";
import { requireUser } from "@/lib/session";
import { getSpecialtyTree } from "@/lib/specialties";

export default async function SpecialtiesPage() {
  const user = await requireUser();
  const specialties = await getSpecialtyTree(user.userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Especialidades</h1>
        <p className="text-sm text-slate-600">
          Las especialidades son privadas de su cuenta y admiten un nivel de subcategorías. Úselas
          para organizar y filtrar sus contactos.
        </p>
      </div>
      <SpecialtiesManager specialties={specialties} />
    </div>
  );
}
