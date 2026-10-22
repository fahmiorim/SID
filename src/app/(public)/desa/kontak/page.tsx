import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Kontak Desa" };

export default async function KontakPage() {
  const { ctx, tema } = await siapkanTema();

  const Kontak = tema.kontak;

  return <Kontak ctx={ctx} />;
}
