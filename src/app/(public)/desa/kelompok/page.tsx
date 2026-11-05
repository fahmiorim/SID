import type { Metadata } from "next";

import {
  listAnggotaKelompokPublik,
  listKelompokPublik,
} from "@/features/kelompok/application/publik-use-cases";
import { kelompokkanAnggotaPublik } from "@/features/kelompok/domain/anggota-publik";
import { isKelompokTipe, type KelompokTipe } from "@/features/kelompok/domain/kelompok";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Kelompok & Lembaga · ${desa.namaDesa ?? "Desa"}`,
    description: `Daftar kelompok masyarakat dan lembaga desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function KelompokPublikPage({
  searchParams,
}: {
  searchParams: Promise<{ tipe?: string }>;
}) {
  const params = await searchParams;
  const tipeParam = typeof params.tipe === "string" ? params.tipe : "";
  const tipe: KelompokTipe | null = isKelompokTipe(tipeParam) ? tipeParam : null;

  const { ctx, tema, desa } = await siapkanTema();
  const [rows, anggotaRows] = await Promise.all([
    listKelompokPublik(desa.id, tipe ?? ""),
    listAnggotaKelompokPublik(desa.id, tipe ?? ""),
  ]);
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

  return (
    <Kelompok
      ctx={ctx}
      kelompok={kelompok}
      tipeAktif={tipe}
      anggota={kelompokkanAnggotaPublik(anggotaRows)}
    />
  );
}
