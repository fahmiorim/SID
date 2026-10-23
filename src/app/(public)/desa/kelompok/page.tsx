import type { Metadata } from "next";

import { listKelompokPublik } from "@/features/kelompok/application/publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Kelompok & Lembaga · ${desa.namaDesa ?? "Desa"}`,
    description: `Daftar kelompok masyarakat dan lembaga desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function KelompokPublikPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const rows = await listKelompokPublik(desa.id);
  const Kelompok = tema.kelompok;

  const kelompok = rows.map((row) => ({
    id: row.id,
    nama: row.name,
    tipe: row.type,
    kategori: row.categoryName,
    ketua: row.leaderName,
    jumlahAnggota: row.memberCount,
    kode: row.code,
    keterangan: row.description,
  }));

  return <Kelompok ctx={ctx} kelompok={kelompok} />;
}
