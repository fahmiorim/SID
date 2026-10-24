import type { Metadata } from "next";

import { daftarBerita, daftarKategoriBerita } from "@/features/publik/application/konten-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Berita Desa · ${desa.namaDesa ?? "Desa"}`,
    description: `Kabar terbaru, pengumuman, dan kegiatan ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function BeritaPage({ searchParams }: PageProps<"/desa/berita">) {
  const params = await searchParams;
  const kategori = typeof params.kategori === "string" ? params.kategori : undefined;

  const { ctx, tema, desa } = await siapkanTema();
  const [berita, kategoriList] = await Promise.all([
    daftarBerita(desa.id, { limit: 30, kategoriSlug: kategori }),
    daftarKategoriBerita(desa.id),
  ]);

  const Berita = tema.berita;

  return (
    <Berita ctx={ctx} berita={berita} kategori={kategoriList} kategoriAktif={kategori ?? null} />
  );
}
