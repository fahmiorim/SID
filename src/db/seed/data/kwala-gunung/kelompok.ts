/**
 * Kelompok & lembaga masyarakat Desa Kwala Gunung.
 */

export interface KategoriKelompokSeed {
  name: string;
  type: "kelompok" | "lembaga";
}

export interface KelompokSeed {
  name: string;
  slug: string;
  type: "kelompok" | "lembaga";
  code?: string | null;
  decreeNumber?: string | null;
  description: string;
  categoryId: number; // akan diisi setelah kategori di-insert
}

// Kategori master — akan di-insert dulu sebelum kelompok.
export const KELOMPOK_MASTER_SEEDS: KategoriKelompokSeed[] = [
  { name: "PKK", type: "lembaga" },
  { name: "Karang Taruna", type: "kelompok" },
  { name: "Kelompok Tani", type: "kelompok" },
  { name: "LPM", type: "lembaga" },
  { name: "Posyandu", type: "kelompok" },
  { name: "KUD", type: "lembaga" },
  { name: "DKM Masjid", type: "kelompok" },
];

export const KELOMPOK_SEEDS: Omit<KelompokSeed, "categoryId">[] = [
  {
    name: "PKK Kwala Gunung",
    slug: "pkk-kwala-gunung",
    type: "lembaga",
    code: "PKKWG/001/2010",
    decreeNumber: "SK Kades No. 045/2021",
    description:
      "Gerakan Pembinaan Kesejahteraan Keluarga desa Kwala Gunung aktif dalam program KB, gizi balita, dan ekonomi keluarga.",
  },
  {
    name: "Karang Taruna Kwala Gunung",
    slug: "karang-taruna-kwala-gunung",
    type: "kelompok",
    code: "KTWG/001/2018",
    decreeNumber: "SK Kades No. 062/2022",
    description:
      "Wadah pemuda-pemudi Kwala Gunung melakukan kegiatan sosial, olahraga, dan kreatifitas seni budaya lokal.",
  },
  {
    name: "Kelompok Tani Sumber Rejeki",
    slug: "kelompok-tani-sumber-rejeki",
    type: "kelompok",
    code: "KT/SR/001",
    description:
      "Gabungan petani padi dan palawija Dusun I yang mengintensifkan lahan kering bantaran rel perkebunan.",
  },
  {
    name: "Kelompok Tani Makmur Sejahtera",
    slug: "kelompok-tani-makmur-sejahtera",
    type: "kelompok",
    code: "KT/KMS/001",
    description:
      "Petani sayur-mayur dan tanaman obat keluarga (TOGA) di Dusun II yang menyuplai pasar tradisional Kecamatan Datuk Lima Puluh.",
  },
  {
    name: "LPM Desa Kwala Gunung",
    slug: "lpm-desanya",
    type: "lembaga",
    code: "LPMWG/001",
    decreeNumber: "SK Kades No. 001/2023",
    description:
      "Lembaga Pemberdayaan Masyarakat sebagai mitra perencanaan dan monitoring pembangunan desa secara partisipatif.",
  },
  {
    name: "Posyandu Melati",
    slug: "posyandu-melati",
    type: "kelompok",
    description:
      "Pos pelayanan terpadu balita dan lansia di Dusun I, menggelar rutin tiap tanggal 10 setiap bulan.",
  },
  {
    name: "Posyandu Putri Ayu",
    slug: "posyandu-putri-ayu",
    type: "kelompok",
    description:
      "Pos pelayanan terpadu balita dan lansia di Dusun II, aktif menindaklanjuti kasus gizi buruk dengan deteksi dini.",
  },
  {
    name: "KUD Makmur Sentosa",
    slug: "kud-makmur-sentosa",
    type: "lembaga",
    code: "KUDWG/001",
    description:
      "Koperasi Unit Desa tempat penjualan pupuk bersubsidi, simpan pinjam anggota, dan pemasaran hasil pertanian warga.",
  },
  {
    name: "DKM Masjid Al-Ikhlas",
    slug: "dkm-masjid-al-ikhlas",
    type: "kelompok",
    description:
      "Dewan Kemakmuran Masjid Al-Ikhlas Dusun I — mengelola masjid sekaligus menjadi basis kegiatan keagamaan warga.",
  },
  {
    name: "Lumbung Pangan Desa",
    slug: "lumbung-pangan-desa",
    type: "kelompok",
    description:
      "Kejakagan pangan mandiri swasembada gabah kering giling yang didirikan sebagai cadangan pangan bencana dan santunan Ramadhan.",
  },
];
