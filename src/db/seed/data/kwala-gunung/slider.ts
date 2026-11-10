/**
 * Slider beranda Desa Kwala Gunung.
 * Menghasilkan 5 gambar sorotan di halaman utama situs publik.
 */

export interface SliderSeed {
  gambar: string;
  judul: string;
  keterangan: string;
  tautan: string | null;
  urut: number;
  aktif: boolean;
}

export const SLIDER_SEEDS: SliderSeed[] = [
  {
    gambar: "/1/slider/banner-1.svg",
    judul: "Selamat Datang di Portal Resmi Kwala Gunung",
    keterangan:
      "Website informasi publik Desa Kwala Gunung, Kecamatan Datuk Lima Puluh, Kabupaten Batu Bara.",
    tautan: "/desa/profil",
    urut: 1,
    aktif: true,
  },
  {
    gambar: "/1/slider/banner-2.svg",
    judul: "Transparansi APBDes 2024",
    keterangan: "Lihat detail rencana dan realisasi anggaran pembangunan desa Kami.",
    tautan: "/desa/apbdes",
    urut: 2,
    aktif: true,
  },
  {
    gambar: "/1/slider/banner-3.svg",
    judul: "Layanan Surat Online",
    keterangan: "Ajukan surat keterangan, domisili, dan pengantar secara cepat melalui portal ini.",
    tautan: "/desa/surat",
    urut: 3,
    aktif: true,
  },
  {
    gambar: "/1/slider/banner-4.svg",
    judul: "UMKM Kwala Gunung Hadir di Lapak Desa",
    keterangan: "Produk unggulan lokal, rotinya, kopi, dan kerajinan tangan tersedia daring.",
    tautan: "/desa/lapak",
    urut: 4,
    aktif: true,
  },
  {
    gambar: "/1/slider/banner-5.svg",
    judul: "Gotong Royong Membangun Desa",
    keterangan: "Bersama pemerintah desa dan warga, Kwala Gunung terus berkembang maju.",
    tautan: null,
    urut: 5,
    aktif: true,
  },
];
