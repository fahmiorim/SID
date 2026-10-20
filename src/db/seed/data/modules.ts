/**
 * Katalog modul awal untuk fondasi.
 *
 * Subset representatif (Beranda, Kependudukan, Pengaturan) agar sidebar & RBAC
 * dapat didemonstrasikan. Modul lain ditambahkan bertahap seiring dibangunnya
 * fitur; cukup menambah entri di sini dengan bentuk yang sama.
 */
export interface ModuleSeed {
  slug: string;
  name: string;
  url: string | null;
  icon: string;
  sortOrder: number;
  /** Modul yang hanya menjadi judul/grup (punya anak, tanpa halaman sendiri). */
  isGroup: boolean;
  isHidden?: boolean;
  isActive?: boolean;
  /** Slug modul induk; kosong berarti modul tingkat atas. */
  parentSlug?: string;
}

export const MODULE_SEEDS: readonly ModuleSeed[] = [
  {
    slug: "beranda",
    name: "Beranda",
    url: "/beranda",
    icon: "layout-dashboard",
    sortOrder: 1,
    isGroup: false,
  },

  {
    slug: "kependudukan",
    name: "Kependudukan",
    url: null,
    icon: "users",
    sortOrder: 2,
    isGroup: true,
  },
  {
    slug: "penduduk",
    name: "Data Penduduk",
    url: "/penduduk",
    icon: "user-round",
    sortOrder: 1,
    isGroup: false,
    parentSlug: "kependudukan",
  },
  {
    slug: "keluarga",
    name: "Kartu Keluarga",
    url: "/keluarga",
    icon: "house",
    sortOrder: 2,
    isGroup: false,
    parentSlug: "kependudukan",
  },
  {
    slug: "rumah-tangga",
    name: "Rumah Tangga",
    url: "/rumah-tangga",
    icon: "home",
    sortOrder: 3,
    isGroup: false,
    parentSlug: "kependudukan",
  },
  {
    slug: "wilayah",
    name: "Wilayah Administratif",
    url: "/wilayah",
    icon: "map",
    sortOrder: 4,
    isGroup: false,
    parentSlug: "kependudukan",
  },
  {
    slug: "laporan-penduduk",
    name: "Laporan Kependudukan",
    url: "/penduduk/laporan",
    icon: "bar-chart-3",
    sortOrder: 5,
    isGroup: false,
    parentSlug: "kependudukan",
  },

  {
    slug: "persuratan",
    name: "Persuratan",
    url: null,
    icon: "mail",
    sortOrder: 10,
    isGroup: true,
  },
  {
    slug: "surat",
    name: "Surat Keluar (Layanan)",
    url: "/persuratan/surat",
    icon: "file-text",
    sortOrder: 1,
    isGroup: false,
    parentSlug: "persuratan",
  },
  {
    slug: "surat-masuk",
    name: "Agenda Surat Masuk",
    url: "/persuratan/surat-masuk",
    icon: "inbox",
    sortOrder: 2,
    isGroup: false,
    parentSlug: "persuratan",
  },
  {
    slug: "surat-keluar",
    name: "Agenda Surat Keluar",
    url: "/persuratan/surat-keluar",
    icon: "send",
    sortOrder: 3,
    isGroup: false,
    parentSlug: "persuratan",
  },
  {
    slug: "jenis-surat",
    name: "Jenis Surat",
    url: "/persuratan/jenis",
    icon: "files",
    sortOrder: 4,
    isGroup: false,
    parentSlug: "persuratan",
  },
  {
    slug: "klasifikasi-surat",
    name: "Klasifikasi Surat",
    url: "/persuratan/klasifikasi",
    icon: "tags",
    sortOrder: 5,
    isGroup: false,
    parentSlug: "persuratan",
  },

  {
    slug: "keuangan-grup",
    name: "Keuangan",
    url: null,
    icon: "wallet",
    sortOrder: 20,
    isGroup: true,
  },
  {
    slug: "keuangan",
    name: "APBDes",
    url: "/keuangan/anggaran",
    icon: "calculator",
    sortOrder: 1,
    isGroup: false,
    parentSlug: "keuangan-grup",
  },
  {
    slug: "laporan-keuangan",
    name: "Laporan",
    url: "/keuangan/laporan",
    icon: "bar-chart-3",
    sortOrder: 2,
    isGroup: false,
    parentSlug: "keuangan-grup",
  },
  {
    slug: "dokumen-laporan",
    name: "Dokumen Laporan",
    url: "/keuangan/laporan-dokumen",
    icon: "file-spreadsheet",
    sortOrder: 3,
    isGroup: false,
    parentSlug: "keuangan-grup",
  },

  {
    slug: "pengaturan",
    name: "Pengaturan",
    url: null,
    icon: "settings",
    sortOrder: 99,
    isGroup: true,
  },
  {
    slug: "identitas-desa",
    name: "Identitas Desa",
    url: "/pengaturan/desa",
    icon: "building-2",
    sortOrder: 1,
    isGroup: false,
    parentSlug: "pengaturan",
  },
  {
    slug: "pengguna",
    name: "Pengguna",
    url: "/pengaturan/pengguna",
    icon: "user-cog",
    sortOrder: 2,
    isGroup: false,
    parentSlug: "pengaturan",
  },
  {
    slug: "grup-akses",
    name: "Grup & Hak Akses",
    url: "/pengaturan/grup",
    icon: "shield-check",
    sortOrder: 3,
    isGroup: false,
    parentSlug: "pengaturan",
  },
  {
    slug: "modul",
    name: "Modul",
    url: "/pengaturan/modul",
    icon: "blocks",
    sortOrder: 4,
    isGroup: false,
    parentSlug: "pengaturan",
  },
] as const;
