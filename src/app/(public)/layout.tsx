import type { CSSProperties, ReactNode } from "react";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

/**
 * Layout situs publik.
 *
 * Desa (tenant) ditentukan dari host permintaan — bukan dari sesi — sehingga
 * satu basis kode dapat melayani banyak domain desa. Tema aktif dipilih dari
 * registry (diatur admin di `/konten/tema`) dan mengatur header/footer serta
 * seluruh tampilan halaman di bawahnya.
 */
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { ctx, tema } = await siapkanTema();
  const Layout = tema.layout;

  return (
    <div style={ctx.tema.cssVars as CSSProperties}>
      <Layout ctx={ctx}>{children}</Layout>
    </div>
  );
}
