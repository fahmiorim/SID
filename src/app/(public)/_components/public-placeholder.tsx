import { AlertCircle } from "lucide-react";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import type { IdentitasDesa } from "@/features/desa/infrastructure/desa-repository";

/**
 * Halaman publik yang sedang disiapkan.
 *
 * Dipakai agar tidak ada tautan menuju 404 selama pembangunan bertahap: menu
 * publik boleh menunjuk ke rute ini, dan halamannya menjelaskan status apa
 * adanya. Rute ini diganti satu per satu saat fiturnya dibangun.
 */
export const PUBLIC_PLACEHOLDER_DESCRIPTION =
  "Halaman ini belum berisi data. Struktur dan kontennya sedang dibangun.";

export async function PublicPlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const desa: IdentitasDesa = await getIdentitasFromRequest();

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full border">
        <AlertCircle className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {description ?? PUBLIC_PLACEHOLDER_DESCRIPTION}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {desa.namaDesa ?? "Desa"} · konten akan tersedia pada tahap berikutnya.
      </p>
    </div>
  );
}
