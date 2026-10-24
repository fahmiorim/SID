import type { Metadata } from "next";

import { getIdentitasFromRequest } from "@/features/desa/application/resolve-village";
import {
  getStatistikDesa,
  listSuratTerbitTerbaru,
} from "@/features/desa/application/statistik-desa";
import {
  daftarBerita,
  daftarSliderBeranda,
  daftarWidgetPublik,
  profilDesaPublik,
} from "@/features/publik/application/konten-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const desa = await getIdentitasFromRequest();
  const nama = desa.namaDesa ?? "Desa";

  return {
    title: `Beranda · ${nama}`,
    description: `Website resmi ${nama}. Informasi publik, berita, transparansi anggaran, dan layanan surat warga.`,
  };
}

export default async function BerandaPage() {
  const { ctx, tema, desa } = await siapkanTema();

  const [statistik, surat, slider, berita, profil, widget] = await Promise.all([
    getStatistikDesa(desa.id),
    listSuratTerbitTerbaru(desa.id, 5),
    daftarSliderBeranda(desa.id),
    daftarBerita(desa.id, { limit: 3 }),
    profilDesaPublik(desa.id),
    daftarWidgetPublik(desa.id),
  ]);

  const Home = tema.home;

  return (
    <Home
      ctx={ctx}
      sambutan={profil?.sambutan ?? null}
      slider={slider}
      statistik={statistik}
      widget={widget}
      berita={berita}
      surat={surat}
    />
  );
}
