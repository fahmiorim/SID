/**
 * Proyek pembangunan desa Desa Kwala Gunung — contoh data publik.
 */

export interface PembangunanSeed {
  judul: string;
  slug: string;
  deskripsi: string;
  lokasi: string;
  tahunAnggaran: number;
  sumberDana: string;
  anggaran: string;
  volume: string | null;
  satuan: string | null;
  pelaksana: string;
  mulai: string;
  selesai: string | null;
  status: "rencana" | "berjalan" | "selesai" | "dibatalkan";
  progres: number;
  hasil?: string;
  dokumentasi?: Array<{ gambar: string; judul?: string; keterangan?: string }>;
}

export const PEMBANGUNAN_SEEDS: PembangunanSeed[] = [
  {
    judul: "Paving Jalan Lingkungan Dusun I",
    slug: "paving-jalan-dusun-i",
    deskripsi:
      "Pemasangan paving blok sepanjang 850 m pada jalan lingkungan Dusun I, dari jembatan sungai hingga simpang tiga balai dusun.",
    lokasi: "Dusun I, Kwala Gunung",
    tahunAnggaran: 2024,
    sumberDana: "Dana Desa",
    anggaran: "340000000",
    volume: "850",
    satuan: "meter",
    pelaksana: "Swakelola Masyarakat",
    mulai: "2024-02-15",
    selesai: "2024-08-30",
    status: "selesai",
    progres: 100,
    hasil:
      "Jalan Dusun I teraspal rapi memudahkan akses warga ke pasar dan puskesmas kecamatan. Proyek selesai tepat waktu dengan biaya realisasi sebesar Rp332.500.000,-.",
    dokumentasi: [
      {
        gambar: "/1/galeri/pembangunan-jalan-1.svg",
        judul: "Progress Tahap 1",
        keterangan: "Pemasangan pondasi agregat",
      },
      {
        gambar: "/1/galeri/pembangunan-jalan-2.svg",
        judul: "Progress Tahap 2",
        keterangan: "Finishing paving blok",
      },
    ],
  },
  {
    judul: "Rehabilitasi Gedung Balai Desa",
    slug: "rehabilitasi-balai-desa",
    deskripsi:
      "Renovasi atap, plafon, cat eksterior, dan penambahan toilet umum di Balai Desa Kwala Gunung.",
    lokasi: "Kwala Gunung",
    tahunAnggaran: 2024,
    sumberDana: "Dana Desa",
    anggaran: "285000000",
    volume: null,
    satuan: null,
    pelaksana: "Kontraktor Swasta",
    mulai: "2024-03-01",
    selesai: "2024-06-30",
    status: "selesai",
    progres: 100,
    hasil:
      "Balai desa tampil lebih representatif untuk kegiatan musyawarah, pelatihan UMKM, dan acara adat masyarakat.",
  },
  {
    judul: "Pembangunan Drainase Dusun II",
    slug: "drainase-dusun-ii",
    deskripsi:
      "Pembuatan saluran air drainase sepanjang 1.200 meter di Dusun II untuk mengatasi genangan air saat musim hujan.",
    lokasi: "Dusun II, Kwala Gunung",
    tahunAnggaran: 2024,
    sumberDana: "Alokasi Dana Desa (ADD)",
    anggaran: "420000000",
    volume: "1200",
    satuan: "meter",
    pelaksana: "Swakelola",
    mulai: "2024-07-01",
    selesai: null,
    status: "berjalan",
    progres: 45,
  },
  {
    judul: "Pengadaan Air Bersih Minum Desa",
    slug: "air-bersih-minum",
    deskripsi:
      "Instalasi pompa air bersih dan jaringan perpipaan PDAM mini untuk melayani 120 KK di Dusun III yang selama ini kesulitan air bersih.",
    lokasi: "Dusun III, Kwala Gunung",
    tahunAnggaran: 2025,
    sumberDana: "Dana Desa",
    anggaran: "520000000",
    volume: null,
    satuan: null,
    pelaksana: "UMKM Lokal",
    mulai: "2025-01-15",
    selesai: null,
    status: "rencana",
    progres: 0,
  },
  {
    judul: "Perbaikan Jembatan Kayu Dusun III",
    slug: "perbaikan-jembatan-dusun-iii",
    deskripsi:
      "Penggantian jembatan kayu tua dengan konstruksi beton bertulang sepanjang 12 meter agar aman dilintasi kendaraan roda empat.",
    lokasi: "Dusun III, Kwala Gunung",
    tahunAnggaran: 2025,
    sumberDana: "Dana Desa",
    anggaran: "180000000",
    volume: "12",
    satuan: "meter",
    pelaksana: "Swakelola",
    mulai: "2025-03-01",
    selesai: null,
    status: "rencana",
    progres: 0,
  },
];
