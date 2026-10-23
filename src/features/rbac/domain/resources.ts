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
  rumahTangga: "rumah-tangga",
  kelompok: "kelompok",
  kategoriKelompok: "kategori-kelompok",
  wilayah: "wilayah",
  persuratan: "persuratan",
  surat: "surat",
  jenisSurat: "jenis-surat",
  klasifikasiSurat: "klasifikasi-surat",
  syaratSurat: "syarat-surat",
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
  laporanPenduduk: "laporan-penduduk",
  bantuan: "bantuan",
  programBantuan: "program-bantuan",
  pesertaBantuan: "peserta-bantuan",
  // Modul yang sudah memiliki halaman/API tetapi belum selesai dibangun tetap
  // punya slug resource agar otorisasi tidak memakai string bebas (`as any`).
  inventaris: "inventaris",
  mutasiInventaris: "mutasi-inventaris",
  bumindes: "bumindes",
  /**
   * Pengajuan surat oleh warga (dulu bernama "layanan-mandiri").
   *
   * Slug resource diganti menjadi `permohonan-surat` pada Fase 1A agar rute
   * publik `/layanan-mandiri` (milik warga) tidak bentrok dengan admin.
   */
  permohonanSurat: "permohonan-surat",
  analisisSurvei: "analisis-survei",
  /** Tema situs publik (Fase 1D). */
  tema: "tema",
  /** Role khusus untuk super-admin yang mengelola banyak desa. */
  superAdmin: "super-admin",
  /** Konten situs publik (Fase 1F). */
  berita: "berita",
  beritaKategori: "berita-kategori",
  galeri: "galeri",
  profilDesa: "profil-desa",
  perangkatDesa: "perangkat-desa",
  menuPublik: "menu-publik",
  widget: "widget",
  slider: "slider",
  dokumenPublik: "dokumen-publik",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
