import type { Metadata } from "next";

import { profilDesaPublik } from "@/features/publik/application/konten-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import { parseMisi } from "@/features/publik/domain/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profil Desa" };

export default async function ProfilDesaPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const profil = await profilDesaPublik(desa.id);

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
