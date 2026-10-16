/**
 * Slug resource RBAC.
 *
 * Nilai-nilai ini **wajib** sama dengan `setting_modul.slug` karena matriks akses
 * (`grup_akses`) bertumpu pada `id_modul`, dan menu dibangun dari slug yang sama.
 * Menaruhnya di satu tempat mencegah salah tulis yang berujung pada lolosnya
 * otorisasi atau hilangnya menu.
 */
export const RESOURCES = {
  beranda: "beranda",
  penduduk: "penduduk",
  keluarga: "keluarga",
  wilayah: "wilayah",
  pengaturan: "pengaturan",
  identitasDesa: "identitas-desa",
  pengguna: "pengguna",
  grupAkses: "grup-akses",
  modul: "modul",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
