import type { Metadata } from "next";

import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { parseMisi } from "@/features/publik/domain/format";
import { getProfilDesa } from "@/features/publik/infrastructure/content-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profil Desa" };

export default async function ProfilDesaPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const profil = await getProfilDesa(desa.id);

  const Profil = tema.profil;

  return (
    <Profil
      ctx={ctx}
      profil={
        profil
          ? {
              visi: profil.visi,
              misi: parseMisi(profil.misi),
              sejarah: profil.sejarah,
              sambutan: profil.sambutan,
              koordinat: profil.koordinat,
            }
          : null
      }
    />
  );
}
