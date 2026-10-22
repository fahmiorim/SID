import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { listPerangkatDesa } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Pemerintahan Desa" };

export default async function PemerintahanPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const perangkat = await listPerangkatDesa(desa.id);

  const Perangkat = tema.perangkat;

  return <Perangkat ctx={ctx} perangkat={perangkat} />;
}
