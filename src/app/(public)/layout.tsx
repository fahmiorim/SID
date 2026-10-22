import type { ReactNode } from "react";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import { listMenuPublik } from "@/features/publik/infrastructure/content-repository";

import { PublicFooter } from "./_components/public-footer";
import { PublicHeader, susunMenu } from "./_components/public-header";

export const dynamic = "force-dynamic";

/**
 * Layout situs publik.
 *
 * Desa (tenant) ditentukan dari host permintaan — bukan dari sesi — sehingga
 * satu basis kode dapat melayani banyak domain desa.
 */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const desa = await getIdentitasFromRequest();
  const menu = susunMenu(await listMenuPublik(desa.id));

  return (
    <div className="flex min-h-full flex-col bg-background">
      <PublicHeader namaDesa={desa.namaDesa ?? "Desa"} logo={desa.logo} menu={menu} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">{children}</main>
      <PublicFooter desa={desa} />
    </div>
  );
}
