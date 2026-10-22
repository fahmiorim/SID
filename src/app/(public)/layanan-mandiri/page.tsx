import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Layanan Mandiri Warga" };

export default async function LayananMandiriPage() {
  const { ctx, tema } = await siapkanTema();

  const LayananMandiri = tema.layananMandiri;

  return <LayananMandiri ctx={ctx} />;
}
