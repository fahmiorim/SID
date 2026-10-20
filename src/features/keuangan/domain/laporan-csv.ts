import { KEUANGAN_AKUN, type RpApbdBaris } from "@/features/keuangan/domain/keuangan";

/**
 * Ekspor laporan Keuangan ke CSV.
 *
 * CSV dipilih (bukan XLSX) agar tanpa dependensi tambahan, dapat dibuka
 * Excel/LibreOffice/Google Sheets, dan mudah diaudit. Pemisah memakai `;`
 * karena Excel berlokal Indonesia memakainya sebagai default, sehingga angka
 * desimal (koma) tidak terpecah menjadi kolom.
 */

const SEPARATOR = ";";

/** Bungkus sebuah sel CSV: kutip bila mengandung pemisah/kutip/baris baru. */
export function csvCell(value: string): string {
  const needsQuote =
    value.includes(SEPARATOR) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");
  if (!needsQuote) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/** Susun teks CSV dari baris-baris sel. */
export function toCsv(rows: readonly (readonly string[])[]): string {
  return rows.map((row) => row.map(csvCell).join(SEPARATOR)).join("\r\n");
}

export interface LaporanCsvInput {
  namaDesa: string | null;
  kecamatan: string | null;
  tahun: number;
  baris: readonly RpApbdBaris[];
  total: { anggaran: string; realisasi: string; selisih: string };
  bidang: readonly RpApbdBaris[];
  totalBidang: { anggaran: string; realisasi: string; selisih: string };
}

const HEADER = ["Kode", "Uraian", "Anggaran", "Realisasi", "Selisih", "%"];

function barisKeSel(row: RpApbdBaris): string[] {
  return [row.kode, row.uraian, row.anggaran, row.realisasi, row.selisih, row.persen.toFixed(2)];
}

/**
 * Teks CSV laporan RP APBDes + realisasi per bidang.
 *
 * Angka ditulis sebagai desimal polos (mis. `1000000.00`) agar dapat dijumlahkan
 * langsung di lembar kerja, bukan sekadar teks tampilan.
 */
export function buildLaporanCsv(input: LaporanCsvInput): string {
  const akunLabel = (kode: string): string =>
    KEUANGAN_AKUN.find((item) => item.kode === kode)?.nama ?? kode;

  const rows: string[][] = [
    ["Laporan Realisasi Pelaksanaan APBDes"],
    [
      "Desa",
      input.namaDesa ?? "-",
      "Kecamatan",
      input.kecamatan ?? "-",
      "Tahun Anggaran",
      String(input.tahun),
    ],
    [],
    ["RP APBDes"],
    HEADER,
    ...input.baris.map(barisKeSel),
    ["", "Jumlah", input.total.anggaran, input.total.realisasi, input.total.selisih, ""],
    [],
    ["Akun yang ditampilkan", input.baris.map((row) => akunLabel(row.kode)).join(", ")],
    [],
    ["Realisasi Belanja per Bidang"],
    HEADER,
    ...input.bidang.map(barisKeSel),
    [
      "",
      "Jumlah",
      input.totalBidang.anggaran,
      input.totalBidang.realisasi,
      input.totalBidang.selisih,
      "",
    ],
  ];

  return `\uFEFF${toCsv(rows)}`;
}

/** Nama berkas aman untuk unduhan. */
export function laporanCsvFilename(namaDesa: string | null, tahun: number): string {
  const slug =
    (namaDesa ?? "desa")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "desa";
  return `laporan-apbdes-${slug}-${tahun}.csv`;
}
