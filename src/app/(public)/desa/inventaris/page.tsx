import type { Metadata } from "next";

import { getInventarisPublik } from "@/features/inventaris/application/inventaris-publik-use-cases";
import { parseInventarisFilter } from "@/features/inventaris/domain/inventaris-publik";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { desa } = await siapkanTema();
  return {
    title: `Inventaris & Aset · ${desa.namaDesa ?? "Desa"}`,
    description: `Daftar inventaris dan aset desa ${desa.namaDesa ?? "desa"}.`,
  };
}

export default async function InventarisPublikPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = parseInventarisFilter(params);

  const { ctx, tema, desa } = await siapkanTema();
  const { rows, rekap, opsi } = await getInventarisPublik(desa.id, filter);
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

  const query = new URLSearchParams();
  if (filter.kategoriId !== null) query.set("kategori", String(filter.kategoriId));
  if (filter.kondisi !== null) query.set("kondisi", filter.kondisi);
  if (filter.lokasi !== null) query.set("lokasi", filter.lokasi);
  if (filter.tahun !== null) query.set("tahun", String(filter.tahun));
  const qs = query.toString();
  const eksporHref = qs ? `/desa/inventaris/ekspor?${qs}` : "/desa/inventaris/ekspor";

  return (
    <Inventaris
      ctx={ctx}
      rekap={rekap}
      inventaris={inventaris}
      filter={filter}
      opsi={opsi}
      eksporHref={eksporHref}
    />
  );
}
