import { INVENTARIS_KONDISI, type InventarisKondisi } from "./inventaris";

/**
 * Filter dan ekspor publik inventaris (OS-WEB-011).
 *
 * Semua fungsi di sini murni (tanpa I/O) agar parameter URL dapat diuji tanpa
 * basis data. Filter diterapkan di repository, sehingga rekap, tabel, dan CSV
 * selalu memakai himpunan data yang sama.
 */

export interface InventarisFilter {
  kategoriId: number | null;
  kondisi: InventarisKondisi | null;
  lokasi: string | null;
  tahun: number | null;
}

export const FILTER_INVENTARIS_KOSONG: InventarisFilter = {
  kategoriId: null,
  kondisi: null,
  lokasi: null,
  tahun: null,
};

/** Pilihan filter yang tersedia pada data desa (bukan hasil filter aktif). */
export interface OpsiInventarisPublik {
  kategori: { id: number; nama: string }[];
  lokasi: string[];
  tahun: number[];
}

function teksTunggal(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim();
  return "";
}

/**
 * Baca filter dari parameter URL.
 *
 * Nilai tidak valid diabaikan (menjadi `null` = tanpa filter) alih-alih membuat
 * halaman gagal. Lokasi dipotong 150 karakter agar sesuai kolomnya.
 */
export function parseInventarisFilter(
  params: Readonly<Record<string, string | string[] | undefined>>,
): InventarisFilter {
  const kategoriAngka = Number(teksTunggal(params.kategori));
  const kategoriId = Number.isInteger(kategoriAngka) && kategoriAngka > 0 ? kategoriAngka : null;

  const kondisiTeks = teksTunggal(params.kondisi);
  const kondisi = (INVENTARIS_KONDISI as readonly string[]).includes(kondisiTeks)
    ? (kondisiTeks as InventarisKondisi)
    : null;

  const lokasi = teksTunggal(params.lokasi).slice(0, 150);

  const tahunAngka = Number(teksTunggal(params.tahun));
  const tahun =
    Number.isInteger(tahunAngka) && tahunAngka >= 1900 && tahunAngka <= 2100 ? tahunAngka : null;

  return { kategoriId, kondisi, lokasi: lokasi === "" ? null : lokasi, tahun };
}

/** Apakah minimal satu filter dipakai. */
export function filterInventarisAktif(filter: InventarisFilter): boolean {
  return (
    filter.kategoriId !== null ||
    filter.kondisi !== null ||
    filter.lokasi !== null ||
    filter.tahun !== null
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Nama berkas CSV yang aman dan mencerminkan filter aktif. */
export function namaBerkasInventarisPublik(
  namaDesa: string | null,
  filter: InventarisFilter,
  kategoriNama: string | null = null,
): string {
  const bagian = [slug(namaDesa ?? "desa") || "desa"];
  if (kategoriNama) bagian.push(slug(kategoriNama));
  if (filter.tahun !== null) bagian.push(String(filter.tahun));
  if (filter.kondisi) bagian.push(filter.kondisi);
  return `inventaris-${bagian.filter((item) => item !== "").join("-")}.csv`;
}
