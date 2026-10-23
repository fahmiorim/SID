import type { Metadata } from "next";

import { getInventarisPublik } from "@/features/inventaris/application/inventaris-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Inventaris & Aset · ${desa.namaDesa ?? "Desa"}`,
    description: `Daftar inventaris dan aset desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function InventarisPublikPage() {
  const { ctx, tema, desa } = await siapkanTema();
  const { rows, rekap } = await getInventarisPublik(desa.id);
  const Inventaris = tema.inventaris;

  const inventaris = rows.map((row) => ({
    id: row.id,
    nama: row.namaBarang,
    kategori: row.kategoriNama,
    kode: row.kodeBarang ?? row.nomorInventaris,
    jumlah: row.jumlah,
    satuan: row.satuan,
    kondisi: row.kondisi,
    lokasi: row.lokasi,
    tahun: row.tahunPembelian,
    nilai: row.nilaiAkhir,
  }));

  return <Inventaris ctx={ctx} rekap={rekap} inventaris={inventaris} />;
}
