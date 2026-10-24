import type { Metadata } from "next";

import { daftarPerangkatDesa } from "@/features/publik/application/konten-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pemerintahan Desa" };

export default async function PemerintahanPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const perangkat = await daftarPerangkatDesa(desa.id);

  const Perangkat = tema.perangkat;

  return <Perangkat ctx={ctx} perangkat={perangkat} />;
}
