export const DOKUMEN_KATEGORI = ["informasi_publik", "produk_hukum", "embed", "lainnya"] as const;
export type DokumenKategori = (typeof DOKUMEN_KATEGORI)[number];

export const DOKUMEN_KATEGORI_LABELS: Readonly<Record<DokumenKategori, string>> = {
  informasi_publik: "Informasi publik",
  produk_hukum: "Produk hukum & peraturan",
  embed: "Sematan",
  lainnya: "Lainnya",
};

export const DOKUMEN_KATEGORI_FILTERS = [
  { value: "semua", label: "Semua kategori" },
  ...DOKUMEN_KATEGORI.map((value) => ({
    value,
    label: DOKUMEN_KATEGORI_LABELS[value],
  })),
] as const;

export type DokumenKategoriFilter = "semua" | DokumenKategori;

export function parseDokumenKategoriFilter(value: string | undefined): DokumenKategoriFilter {
  return value && (DOKUMEN_KATEGORI as readonly string[]).includes(value)
    ? (value as DokumenKategori)
    : "semua";
}

export function isHttpsEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isSafeDocumentLink(value: string): boolean {
  if (!value || value.trim() !== value || /[\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname !== "" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function isPdfDocument(isi: Uint8Array): boolean {
  return (
    isi.length >= 5 &&
    isi[0] === 0x25 &&
    isi[1] === 0x50 &&
    isi[2] === 0x44 &&
    isi[3] === 0x46 &&
    isi[4] === 0x2d
  );
}

/**
 * Jenis produk hukum/regulasi yang dapat dipilih operator (OS-WEB-005).
 * Nilai disimpan apa adanya di `dokumen_publik.jenis`; baris lama dengan jenis
 * bebas tetap ditampilkan memakai labelnya sendiri.
 */
export const DOKUMEN_JENIS = [
  "peraturan_desa",
  "peraturan_kepala_desa",
  "peraturan_bersama_desa",
  "keputusan_kepala_desa",
] as const;

export type DokumenJenis = (typeof DOKUMEN_JENIS)[number];

export const DOKUMEN_JENIS_LABELS: Readonly<Record<DokumenJenis, string>> = {
  peraturan_desa: "Peraturan Desa",
  peraturan_kepala_desa: "Peraturan Kepala Desa",
  peraturan_bersama_desa: "Peraturan Bersama Desa",
  keputusan_kepala_desa: "Keputusan Kepala Desa",
};

/** Label jenis dokumen; nilai tak dikenal ditampilkan apa adanya. */
export function dokumenJenisLabel(jenis: string | null | undefined): string {
  if (!jenis) return "Tanpa jenis";
  return DOKUMEN_JENIS_LABELS[jenis as DokumenJenis] ?? jenis;
}

export interface BarisArsipDokumen {
  tahun: number | null;
  jenis: string | null;
}

export interface JenisArsipDokumen {
  jenis: string | null;
  label: string;
  jumlah: number;
}

export interface KelompokArsipDokumen {
  tahun: number | null;
  jumlah: number;
  jenis: JenisArsipDokumen[];
}

/**
 * Kelompokkan dokumen aktif per tahun lalu per jenis, untuk navigasi arsip
 * publik. Tahun terbaru lebih dulu; dokumen tanpa tahun diletakkan paling
 * akhir agar tidak menyamarkan arsip bertanggal.
 */
export function susunArsipDokumen(rows: readonly BarisArsipDokumen[]): KelompokArsipDokumen[] {
  const perTahun = new Map<number | null, Map<string | null, number>>();

  for (const row of rows) {
    const jenis = perTahun.get(row.tahun) ?? new Map<string | null, number>();
    jenis.set(row.jenis, (jenis.get(row.jenis) ?? 0) + 1);
    perTahun.set(row.tahun, jenis);
  }

  return [...perTahun.entries()]
    .sort(([kiri], [kanan]) => {
      if (kiri === null) return 1;
      if (kanan === null) return -1;
      return kanan - kiri;
    })
    .map(([tahun, jenisMap]) => {
      const jenis = [...jenisMap.entries()]
        .map(([nilai, jumlah]) => ({
          jenis: nilai,
          label: dokumenJenisLabel(nilai),
          jumlah,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "id"));

      return {
        tahun,
        jumlah: jenis.reduce((total, item) => total + item.jumlah, 0),
        jenis,
      };
    });
}

export const DOKUMEN_PAGE_SIZE = 20;
