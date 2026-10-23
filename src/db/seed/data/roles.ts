import type { AccessLevel } from "@/features/rbac/domain/permission";

/**
 * Role bawaan (tabel `roles`).
 *
 * `isSystem` = role bawaan yang tidak boleh diubah/dihapus lewat UI.
 *
 * `grants` memetakan **slug modul** → tingkat akses (`read`/`write`/`manage`).
 * Modul yang tidak dicantumkan berarti tanpa akses; modul grup (mis.
 * "Kependudukan", "Pengaturan") tidak perlu dicantumkan karena warisan
 * induk ← anak menandainya dapat dibaca begitu salah satu anaknya diberi akses.
 *
 * Role `administrator` tidak butuh grants karena dilewati sebagai super admin
 * (lihat `SUPERADMIN_SLUG` di `src/features/rbac/application/authorization.ts`).
 */
export interface RoleSeed {
  slug: string;
  name: string;
  isSystem: boolean;
  grants: Record<string, AccessLevel>;
}

export const ROLE_SEEDS: readonly RoleSeed[] = [
  {
    slug: "administrator",
    name: "Administrator",
    isSystem: true,
    grants: {},
  },
  {
    slug: "super-admin",
    name: "Super Admin",
    isSystem: true,
    grants: {},
  },
  {
    slug: "sekretaris-desa",
    name: "Sekretaris Desa",
    isSystem: true,
    grants: {
      beranda: "read",
      penduduk: "read",
      keluarga: "read",
      "rumah-tangga": "read",
      wilayah: "read",
      surat: "manage",
      "jenis-surat": "read",
      "klasifikasi-surat": "read",
      "syarat-surat": "read",
      "surat-masuk": "read",
      "surat-keluar": "read",
      "laporan-penduduk": "read",
      "laporan-keuangan": "read",
      bumindes: "read",
      inventaris: "read",
      "mutasi-inventaris": "write",
      tema: "read",
      berita: "read",
      "berita-kategori": "read",
      galeri: "read",
      "profil-desa": "read",
      "perangkat-desa": "read",
      "menu-publik": "read",
      widget: "read",
      slider: "read",
      "dokumen-publik": "read",
    },
  },
  {
    slug: "kepala-desa",
    name: "Kepala Desa",
    isSystem: true,
    grants: {
      beranda: "read",
      penduduk: "read",
      keluarga: "read",
      "rumah-tangga": "read",
      wilayah: "read",
      surat: "manage",
      "jenis-surat": "read",
      "klasifikasi-surat": "read",
      "syarat-surat": "read",
      "surat-masuk": "read",
      "surat-keluar": "read",
      "laporan-penduduk": "read",
      "laporan-keuangan": "read",
      bumindes: "read",
      inventaris: "read",
      "mutasi-inventaris": "write",
      tema: "read",
      berita: "read",
      "berita-kategori": "read",
      galeri: "read",
      "profil-desa": "read",
      "perangkat-desa": "read",
      "menu-publik": "read",
      widget: "read",
      slider: "read",
      "dokumen-publik": "read",
    },
  },
  {
    slug: "operator",
    name: "Operator",
    isSystem: true,
    grants: {
      beranda: "read",
      penduduk: "manage",
      "laporan-penduduk": "read",
      keluarga: "manage",
      "rumah-tangga": "manage",
      kelompok: "manage",
      "kategori-kelompok": "manage",
      wilayah: "manage",
      surat: "manage",
      "jenis-surat": "read",
      "klasifikasi-surat": "read",
      "syarat-surat": "read",
      "surat-masuk": "manage",
      "surat-keluar": "manage",
      "program-bantuan": "manage",
      keuangan: "write",
      "laporan-keuangan": "read",
      "dokumen-laporan": "write",
      bumindes: "write",
      inventaris: "manage",
      "mutasi-inventaris": "manage",
      "permohonan-surat": "manage",
      "analisis-survei": "read",
      "identitas-desa": "read",
      tema: "manage",
      berita: "manage",
      "berita-kategori": "manage",
      galeri: "manage",
      "profil-desa": "manage",
      "perangkat-desa": "manage",
      "menu-publik": "manage",
      widget: "manage",
      slider: "manage",
      "dokumen-publik": "manage",
    },
  },
] as const;
