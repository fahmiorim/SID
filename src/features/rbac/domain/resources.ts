/**
 * Slug resource RBAC.
 *
 * Nilai-nilai ini **wajib** sama dengan `modules.slug` karena matriks akses
 * (`role_permissions`) bertumpu pada `module_id`, dan menu dibangun dari slug
 * yang sama. Menaruhnya di satu tempat mencegah salah tulis yang berujung pada
 * lolosnya otorisasi atau hilangnya menu.
 */
export const RESOURCES = {
  beranda: "beranda",
  penduduk: "penduduk",
  keluarga: "keluarga",
  wilayah: "wilayah",
  persuratan: "persuratan",
  surat: "surat",
  jenisSurat: "jenis-surat",
  klasifikasiSurat: "klasifikasi-surat",
  suratMasuk: "surat-masuk",
  suratKeluar: "surat-keluar",
  pengaturan: "pengaturan",
  identitasDesa: "identitas-desa",
  pengguna: "pengguna",
  grupAkses: "grup-akses",
  modul: "modul",
  keuangan: "keuangan",
  laporanKeuangan: "laporan-keuangan",
  dokumenLaporan: "dokumen-laporan",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
