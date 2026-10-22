/**
 * Seed konten awal situs publik (Fase 1C.5).
 *
 * Tujuan: instalasi baru **tidak kosong** — beranda, profil, berita, galeri,
 * dan dokumen sudah punya contoh yang bisa langsung diganti operator. Semua
 * data idempoten (dicek berdasarkan slug/nama sebelum menyisipkan) sehingga
 * `db:seed` boleh dijalankan berulang kali.
 */

export interface JabatanSeed {
  nama: string;
  slug: string;
  urut: number;
}

export const JABATAN_SEEDS: JabatanSeed[] = [
  { nama: "Kepala Desa", slug: "kepala-desa", urut: 1 },
  { nama: "Sekretaris Desa", slug: "sekretaris-desa", urut: 2 },
  { nama: "Kaur Tata Usaha & Umum", slug: "kaur-tata-usaha-umum", urut: 3 },
  { nama: "Kaur Keuangan", slug: "kaur-keuangan", urut: 4 },
  { nama: "Kaur Perencanaan", slug: "kaur-perencanaan", urut: 5 },
  { nama: "Kasi Pemerintahan", slug: "kasi-pemerintahan", urut: 6 },
  { nama: "Kasi Kesejahteraan", slug: "kasi-kesejahteraan", urut: 7 },
  { nama: "Kasi Pelayanan", slug: "kasi-pelayanan", urut: 8 },
  { nama: "Kepala Dusun", slug: "kepala-dusun", urut: 9 },
];

export const KATEGORI_BERITA_SEEDS: { nama: string; slug: string; urut: number }[] = [
  { nama: "Pengumuman", slug: "pengumuman", urut: 1 },
  { nama: "Kegiatan", slug: "kegiatan", urut: 2 },
  { nama: "Pembangunan", slug: "pembangunan", urut: 3 },
  { nama: "Kesehatan", slug: "kesehatan", urut: 4 },
];

export const PROFIL_SEED = {
  visi: "Terwujudnya desa yang maju, mandiri, dan sejahtera berlandaskan gotong royong.",
  misi: [
    "Meningkatkan kualitas pelayanan publik yang cepat, transparan, dan akuntabel.",
    "Mengembangkan ekonomi desa berbasis potensi lokal dan UMKM.",
    "Meningkatkan infrastruktur dan konektivitas antarwilayah.",
    "Mewujudkan tata kelola pemerintahan desa yang bersih dan partisipatif.",
  ].join("\n"),
  sejarah:
    "Desa ini berdiri sejak lama dan terus berkembang seiring pertumbuhan penduduk. " +
    "Sejarah lengkap desa dapat diperbarui oleh pengelola melalui panel admin.",
  sambutan:
    "Selamat datang di portal resmi desa. Portal ini kami hadirkan sebagai wujud " +
    "keterbukaan informasi dan kemudahan layanan bagi seluruh warga.",
  koordinat: null,
} as const;

export const BERITA_CONTOH = {
  judul: "Selamat Datang di Portal Resmi Desa",
  slug: "selamat-datang-di-portal-resmi-desa",
  ringkasan:
    "Portal resmi desa kini hadir untuk memudahkan warga mengakses informasi dan layanan secara daring.",
  isi:
    "<p>Dengan bangga kami mempersembahkan portal informasi resmi desa. Melalui halaman ini, " +
    "warga dapat membaca berita terbaru, melihat transparansi anggaran, memantau data " +
    "kependudukan, serta mengajukan layanan surat secara daring.</p>" +
    "<p>Kami mengundang seluruh warga untuk memanfaatkan layanan ini. Masukan dan saran " +
    "sangat kami harapkan demi perbaikan pelayanan ke depan.</p>",
  kategoriSlug: "pengumuman",
} as const;

export const DOKUMEN_SEEDS: {
  nama: string;
  slug: string;
  kategori: string;
  keterangan: string;
}[] = [
  {
    nama: "Profil dan Statistik Desa",
    slug: "profil-dan-statistik-desa",
    kategori: "informasi_publik",
    keterangan: "Ringkasan profil serta data statistik desa.",
  },
  {
    nama: "Rencana Kerja Pemerintah Desa (RKPDes)",
    slug: "rkpdes",
    kategori: "informasi_publik",
    keterangan: "Dokumen perencanaan pembangunan tahunan desa.",
  },
  {
    nama: "Laporan Realisasi APBDes",
    slug: "laporan-realisasi-apbdes",
    kategori: "informasi_publik",
    keterangan: "Laporan realisasi anggaran pendapatan dan belanja desa.",
  },
];

export const MENU_SEEDS: {
  nama: string;
  link: string;
  linkTipe: string;
  urut: number;
}[] = [
  { nama: "Beranda", link: "/", linkTipe: "internal", urut: 1 },
  { nama: "Profil", link: "/desa/profil", linkTipe: "internal", urut: 2 },
  { nama: "Pemerintahan", link: "/desa/pemerintahan", linkTipe: "internal", urut: 3 },
  { nama: "Berita", link: "/desa/berita", linkTipe: "internal", urut: 4 },
  { nama: "Galeri", link: "/desa/galeri", linkTipe: "internal", urut: 5 },
  { nama: "Statistik", link: "/desa/statistik", linkTipe: "internal", urut: 6 },
  { nama: "APBDes", link: "/desa/apbdes", linkTipe: "internal", urut: 7 },
  { nama: "Informasi Publik", link: "/desa/dokumen", linkTipe: "internal", urut: 8 },
  { nama: "Kontak", link: "/desa/kontak", linkTipe: "internal", urut: 9 },
];
