/**
 * Katalog modul awal untuk fondasi.
 *
 * Ini subset representatif (Beranda, Kependudukan, Pengaturan) agar sidebar &
 * RBAC dapat didemonstrasikan. Impor katalog penuh (137 modul dari
 * `setting_modul` OpenSID) akan ditambahkan pada tahap migrasi data; strukturnya
 * sudah identik sehingga cukup menambah entri di sini.
 */
export interface ModuleSeed {
  slug: string;
  modul: string;
  url: string | null;
  ikon: string;
  urut: number;
  /** Modul yang hanya menjadi judul/grup (punya anak). */
  level: boolean;
  hidden?: boolean;
  aktif?: boolean;
  /** Slug modul induk; kosong berarti modul tingkat atas. */
  parentSlug?: string;
}

export const MODULE_SEEDS: readonly ModuleSeed[] = [
  {
    slug: "beranda",
    modul: "Beranda",
    url: "/beranda",
    ikon: "layout-dashboard",
    urut: 1,
    level: false,
  },

  {
    slug: "kependudukan",
    modul: "Kependudukan",
    url: null,
    ikon: "users",
    urut: 2,
    level: true,
  },
  {
    slug: "penduduk",
    modul: "Data Penduduk",
    url: "/penduduk",
    ikon: "user-round",
    urut: 1,
    level: false,
    parentSlug: "kependudukan",
  },
  {
    slug: "keluarga",
    modul: "Kartu Keluarga",
    url: "/keluarga",
    ikon: "house",
    urut: 2,
    level: false,
    parentSlug: "kependudukan",
  },
  {
    slug: "wilayah",
    modul: "Wilayah Administratif",
    url: "/wilayah",
    ikon: "map",
    urut: 3,
    level: false,
    parentSlug: "kependudukan",
  },

  {
    slug: "pengaturan",
    modul: "Pengaturan",
    url: null,
    ikon: "settings",
    urut: 99,
    level: true,
  },
  {
    slug: "identitas-desa",
    modul: "Identitas Desa",
    url: "/pengaturan/desa",
    ikon: "building-2",
    urut: 1,
    level: false,
    parentSlug: "pengaturan",
  },
  {
    slug: "pengguna",
    modul: "Pengguna",
    url: "/pengaturan/pengguna",
    ikon: "user-cog",
    urut: 2,
    level: false,
    parentSlug: "pengaturan",
  },
  {
    slug: "grup-akses",
    modul: "Grup & Hak Akses",
    url: "/pengaturan/grup",
    ikon: "shield-check",
    urut: 3,
    level: false,
    parentSlug: "pengaturan",
  },
  {
    slug: "modul",
    modul: "Modul",
    url: "/pengaturan/modul",
    ikon: "blocks",
    urut: 4,
    level: false,
    parentSlug: "pengaturan",
  },
] as const;
