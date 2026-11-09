import { RESOURCES } from "@/features/rbac/domain/resources";

/** Slug resource RBAC untuk modul pemeriksaan data (harus sama dengan `modules.slug`). */
export const PERIKSA_RESOURCE = RESOURCES.periksa;

/**
 * Pemeriksaan data — padanan Periksa di OpenSID.
 *
 * OpenSID menyediakan konsol pemeriksaan basis data untuk menemukan data
 * kependudukan yang tidak konsisten. Di sini pemeriksaan bersifat **baca saja**:
 * setiap temuan menautkan pengguna ke halaman perbaikan yang sudah ada, bukan
 * mengubah data secara otomatis.
 */
export const KATEGORI_PEMERIKSAAN = ["penduduk", "keluarga", "menu"] as const;
export type KategoriPemeriksaan = (typeof KATEGORI_PEMERIKSAAN)[number];

export const KATEGORI_LABELS: Readonly<Record<KategoriPemeriksaan, string>> = {
  penduduk: "Data Penduduk",
  keluarga: "Data Keluarga",
  menu: "Menu Aplikasi",
};

export interface JenisPemeriksaan {
  /** Kode stabil; dipakai sebagai kunci hasil dan tautan. */
  kode: string;
  nama: string;
  kategori: KategoriPemeriksaan;
  keterangan: string;
  /** Halaman admin tempat data diperbaiki. */
  perbaikan: { label: string; href: string };
}

export const JENIS_PEMERIKSAAN: readonly JenisPemeriksaan[] = [
  {
    kode: "penduduk-tanpa-nik",
    nama: "Penduduk tanpa NIK",
    kategori: "penduduk",
    keterangan:
      "NIK kosong membuat penduduk tidak dapat diverifikasi atau dicetak pada dokumen resmi.",
    perbaikan: { label: "Buka Data Penduduk", href: "/penduduk" },
  },
  {
    kode: "penduduk-nik-tidak-valid",
    nama: "NIK tidak 16 angka",
    kategori: "penduduk",
    keterangan: "NIK harus tepat 16 angka; format lain biasanya berasal dari salah ketik.",
    perbaikan: { label: "Buka Data Penduduk", href: "/penduduk" },
  },
  {
    kode: "penduduk-tanpa-tanggal-lahir",
    nama: "Penduduk tanpa tanggal lahir",
    kategori: "penduduk",
    keterangan: "Tanggal lahir dipakai untuk menghitung umur, statistik, dan syarat surat.",
    perbaikan: { label: "Buka Data Penduduk", href: "/penduduk" },
  },
  {
    kode: "penduduk-tanpa-kk",
    nama: "Penduduk tanpa Kartu Keluarga",
    kategori: "penduduk",
    keterangan: "Penduduk tanpa KK tidak muncul pada buku administrasi keluarga.",
    perbaikan: { label: "Buka Data Penduduk", href: "/penduduk" },
  },
  {
    kode: "penduduk-tanpa-hubungan",
    nama: "Penduduk tanpa hubungan keluarga",
    kategori: "penduduk",
    keterangan:
      "Hubungan keluarga menentukan posisi penduduk di dalam KK (kepala, istri, anak, dst.).",
    perbaikan: { label: "Buka Data Penduduk", href: "/penduduk" },
  },
  {
    kode: "keluarga-tanpa-anggota",
    nama: "Kartu Keluarga tanpa anggota",
    kategori: "keluarga",
    keterangan: "KK kosong tidak dapat dicetak dan mengganggu rekap jumlah keluarga.",
    perbaikan: { label: "Buka Data Keluarga", href: "/keluarga" },
  },
  {
    kode: "keluarga-tanpa-kepala",
    nama: "Kartu Keluarga tanpa kepala keluarga",
    kategori: "keluarga",
    keterangan: 'Setiap KK harus punya tepat satu anggota berhubungan "Kepala Keluarga".',
    perbaikan: { label: "Buka Data Keluarga", href: "/keluarga" },
  },
  {
    kode: "keluarga-kepala-ganda",
    nama: "Kartu Keluarga dengan kepala ganda",
    kategori: "keluarga",
    keterangan:
      'Lebih dari satu anggota berhubungan "Kepala Keluarga" membuat pencetakan KK ambigu.',
    perbaikan: { label: "Buka Data Keluarga", href: "/keluarga" },
  },
  {
    kode: "menu-tanpa-induk",
    nama: "Menu tanpa induk",
    kategori: "menu",
    keterangan:
      "Menu yang menunjuk induk tidak ada tidak akan tampil pada sidebar, tetapi tetap tersimpan.",
    perbaikan: { label: "Buka Pengaturan Modul", href: "/pengaturan/modul" },
  },
];

const JENIS_BY_KODE = new Map(JENIS_PEMERIKSAAN.map((jenis) => [jenis.kode, jenis]));

export interface TemuanPemeriksaan {
  kode: string;
  nama: string;
  kategori: KategoriPemeriksaan;
  keterangan: string;
  perbaikan: { label: string; href: string };
  /** Jumlah total baris bermasalah (bisa lebih banyak dari `contoh`). */
  jumlah: number;
  /** Beberapa baris sebagai contoh; maksimal lima. */
  contoh: readonly { id: number; label: string }[];
}

/** Rangkuman hasil pemeriksaan untuk ditampilkan di halaman. */
export interface RingkasanPemeriksaan {
  totalTemuan: number;
  jenisBermasalah: number;
  totalJenis: number;
  bersih: boolean;
}

export function jenisPemeriksaan(kode: string): JenisPemeriksaan | undefined {
  return JENIS_BY_KODE.get(kode);
}

export function ringkasPemeriksaan(temuan: readonly TemuanPemeriksaan[]): RingkasanPemeriksaan {
  const totalTemuan = temuan.reduce((total, item) => total + item.jumlah, 0);
  const jenisBermasalah = temuan.filter((item) => item.jumlah > 0).length;

  return {
    totalTemuan,
    jenisBermasalah,
    totalJenis: temuan.length,
    bersih: totalTemuan === 0,
  };
}
