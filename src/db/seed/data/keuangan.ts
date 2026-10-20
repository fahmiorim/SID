/**
 * Pohon kode rekening APBDes (chart of accounts) — mengikuti struktur
 * Siskeudes: `akun` (1 digit) → `kelompok` (2 segmen) → `jenis` (3 segmen) →
 * `obyek` (4 segmen).
 *
 * Katalog ini **global** (bukan per desa) dan menjadi tulang punggung tabel
 * `keuangan_template`. Isinya sengaja dibuat ringkas namun lengkap sampai level
 * obyek untuk akun 4 (Pendapatan), 5 (Belanja), dan 6 (Pembiayaan) agar dapat
 * dipakai menyusun APBDes.
 */
export interface KeuanganTemplateSeed {
  uuid: string;
  uraian: string;
}

export const KEUANGAN_TEMPLATE_SEEDS: readonly KeuanganTemplateSeed[] = [
  // 4. PENDAPATAN
  { uuid: "4", uraian: "PENDAPATAN" },
  { uuid: "4.1", uraian: "PENDAPATAN ASLI DESA" },
  { uuid: "4.1.1", uraian: "HASIL USAHA" },
  { uuid: "4.1.1.01", uraian: "Hasil BUMDes" },
  { uuid: "4.1.1.02", uraian: "Hasil Sewa Tanah Kas Desa" },
  { uuid: "4.1.2", uraian: "HASIL ASET" },
  { uuid: "4.1.2.01", uraian: "Hasil Sewa Bangunan" },
  { uuid: "4.1.3", uraian: "SWADAYA, PARTISIPASI, GOTONG ROYONG" },
  { uuid: "4.1.3.01", uraian: "Sumbangan Pihak Ketiga" },
  { uuid: "4.2", uraian: "TRANSFER" },
  { uuid: "4.2.1", uraian: "DANA DESA (DD)" },
  { uuid: "4.2.1.01", uraian: "Dana Desa" },
  { uuid: "4.2.2", uraian: "ALOKASI DANA DESA (ADD)" },
  { uuid: "4.2.2.01", uraian: "Alokasi Dana Desa" },
  { uuid: "4.2.3", uraian: "BAGI HASIL PAJAK & RETRIBUSI" },
  { uuid: "4.2.3.01", uraian: "Bagi Hasil Pajak Daerah" },
  { uuid: "4.2.4", uraian: "BANTUAN KEUANGAN PROVINSI/KABUPATEN" },
  { uuid: "4.2.4.01", uraian: "Bantuan Keuangan Kabupaten" },
  { uuid: "4.3", uraian: "LAIN-LAIN PENDAPATAN" },
  { uuid: "4.3.1", uraian: "PENDAPATAN LAIN" },
  { uuid: "4.3.1.01", uraian: "Bunga Bank" },
  { uuid: "4.3.1.02", uraian: "Lain-lain Pendapatan Sah" },

  // 5. BELANJA
  { uuid: "5", uraian: "BELANJA" },
  { uuid: "5.1", uraian: "BELANJA BIDANG PENYELENGGARAAN PEMERINTAHAN DESA" },
  { uuid: "5.1.1", uraian: "PENGHASILAN TETAP DAN TUNJANGAN" },
  { uuid: "5.1.1.01", uraian: "Penghasilan Tetap Kepala Desa & Perangkat" },
  { uuid: "5.1.1.02", uraian: "Tunjangan BPD" },
  { uuid: "5.1.2", uraian: "OPERASIONAL PERKANTORAN DESA" },
  { uuid: "5.1.2.01", uraian: "Belanja ATK & Benda Pos" },
  { uuid: "5.1.2.02", uraian: "Belanja Listrik & Air" },
  { uuid: "5.2", uraian: "BELANJA BIDANG PELAKSANAAN PEMBANGUNAN DESA" },
  { uuid: "5.2.1", uraian: "PENDIDIKAN" },
  { uuid: "5.2.1.01", uraian: "Bantuan Operasional Sekolah Desa" },
  { uuid: "5.2.2", uraian: "KESEHATAN" },
  { uuid: "5.2.2.01", uraian: "Posyandu & Sanitasi" },
  { uuid: "5.2.3", uraian: "PEKERJAAN UMUM & PERUMAHAN" },
  { uuid: "5.2.3.01", uraian: "Pembangunan Jalan Desa" },
  { uuid: "5.2.3.02", uraian: "Pembangunan Drainase" },
  { uuid: "5.3", uraian: "BELANJA BIDANG PEMBINAAN KEMASYARAKATAN" },
  { uuid: "5.3.1", uraian: "KEAGAMAAN" },
  { uuid: "5.3.1.01", uraian: "Bantuan Kegiatan Keagamaan" },
  { uuid: "5.3.2", uraian: "PEMBERDAYAAN PEREMPUAN & ANAK" },
  { uuid: "5.3.2.01", uraian: "Kegiatan PKK" },
  { uuid: "5.4", uraian: "BELANJA BIDANG PEMBERDAYAAN MASYARAKAT" },
  { uuid: "5.4.1", uraian: "PERTANIAN & KETAHANAN PANGAN" },
  { uuid: "5.4.1.01", uraian: "Bantuan Sarana Pertanian" },
  { uuid: "5.4.2", uraian: "PENINGKATAN KAPASITAS APARATUR DESA" },
  { uuid: "5.4.2.01", uraian: "Pelatihan Aparatur Desa" },
  { uuid: "5.5", uraian: "BELANJA TAK TERDUGA" },
  { uuid: "5.5.1", uraian: "BELANJA TAK TERDUGA" },
  { uuid: "5.5.1.01", uraian: "Belanja Tak Terduga" },

  // 6. PEMBIAYAAN
  { uuid: "6", uraian: "PEMBIAYAAN" },
  { uuid: "6.1", uraian: "PENERIMAAN PEMBIAYAAN" },
  { uuid: "6.1.1", uraian: "SILPA TAHUN ANGGARAN SEBELUMNYA" },
  { uuid: "6.1.1.01", uraian: "Sisa Lebih Perhitungan Anggaran" },
  { uuid: "6.2", uraian: "PENGELUARAN PEMBIAYAAN" },
  { uuid: "6.2.1", uraian: "PENYERTAAN MODAL DESA" },
  { uuid: "6.2.1.01", uraian: "Penyertaan Modal BUMDes" },
] as const;
