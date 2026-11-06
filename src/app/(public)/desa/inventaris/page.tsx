import type { Metadata } from "next";

import { getInventarisPublik } from "@/features/inventaris/application/inventaris-publik-use-cases";
import { siapkanTema } from "@/features/publik/application/siapkan-tema";
import {
  inventarisEksporUrl,
  parseFilterInventaris,
} from "@/features/publik/domain/inventaris-publik";

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
}: PageProps<"/desa/inventaris">) {
  const params = await searchParams;
  const filter = parseFilterInventaris({
    q: typeof params.q === "string" ? params.q : undefined,
    kategori: typeof params.kategori === "string" ? params.kategori : undefined,
    kondisi: typeof params.kondisi === "string" ? params.kondisi : undefined,
    lokasi: typeof params.lokasi === "string" ? params.lokasi : undefined,
    tahun: typeof params.tahun === "string" ? params.tahun : undefined,
  });

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

  return (
    <Inventaris
      ctx={ctx}
      rekap={rekap}
      inventaris={inventaris}
      filter={filter}
      opsi={opsi}
      eksporUrl={inventarisEksporUrl(filter)}
    />
  );
}
