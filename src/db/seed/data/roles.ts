/**
 * Role bawaan (tabel `user_grup`).
 *
 * `jenis`: 1 = SISTEM (terlindungi, tidak boleh diubah/dihapus dari UI),
 *          2 = DESA (dapat dibuat/diubah operator desa).
 *
 * `grants` memetakan **slug modul** → kode akses legacy (0/1/3/7). Role
 * `administrator` tidak butuh grants karena dilewati sebagai super admin
 * (lihat `SUPERADMIN_SLUG` di `src/features/rbac/application/authorization.ts`).
 */
export interface RoleSeed {
  slug: string;
  nama: string;
  jenis: 1 | 2;
  grants: Record<string, number>;
}

export const ROLE_SEEDS: readonly RoleSeed[] = [
  {
    slug: "administrator",
    nama: "Administrator",
    jenis: 1,
    grants: {},
  },
  {
    slug: "operator",
    nama: "Operator",
    jenis: 1,
    grants: {
      beranda: 1,
      kependudukan: 7,
      penduduk: 7,
      keluarga: 7,
      wilayah: 7,
      pengaturan: 0,
      "identitas-desa": 1,
      pengguna: 0,
      "grup-akses": 0,
      modul: 0,
    },
  },
] as const;
