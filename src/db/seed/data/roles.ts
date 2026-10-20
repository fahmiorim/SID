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
    slug: "operator",
    name: "Operator",
    isSystem: true,
    grants: {
      beranda: "read",
      penduduk: "manage",
      "laporan-penduduk": "read",
      keluarga: "manage",
      wilayah: "manage",
      surat: "manage",
      "jenis-surat": "read",
      "klasifikasi-surat": "read",
      "surat-masuk": "manage",
      "surat-keluar": "manage",
      keuangan: "write",
      "laporan-keuangan": "read",
      "dokumen-laporan": "write",
      "identitas-desa": "read",
    },
  },
] as const;
