import type { Metadata } from "next";

import { listBantuanProgramPublik } from "@/features/bantuan/application/publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Program Bantuan Sosial" };

export default async function BantuanPublikPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const program = await listBantuanProgramPublik(desa.id);

  const Bantuan = tema.bantuan;

  return <Bantuan ctx={ctx} program={program} />;
}
