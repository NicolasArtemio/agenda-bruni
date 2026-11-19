import { StickersManager } from "@/components/stickers/stickers-manager";
import { requireUser } from "@/lib/session";
import { getStickerList } from "@/lib/stickers";

export default async function StickersPage() {
  const user = await requireUser();
  const stickers = await getStickerList(user.userId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Stickers</h1>
        <p className="text-sm text-slate-600">
          Cree stickers con nombre y color para identificar y filtrar sus contactos.
        </p>
      </div>
      <StickersManager stickers={stickers} />
    </div>
  );
}
