/**
 * Profil, halaman statis, dokumen publik, menu, widget, dan pengaturan
 * Desa Kwala Gunung.
 */

import type { ThemeOptions } from "@/features/publik/domain/theme";

export const PROFIL_SEED = {
  visi: "Terwujudnya Desa Kwala Gunung yang Maju, Mandiri, Sejahtera, dan Berbudaya melalui Tata Kelola Pemerintahan yang Bersih, Transparan, dan Partisipatif.",
  misi: [
    "Meningkatkan kualitas pelayanan administrasi publik yang cepat, mudah, dan tanpa biaya.",
    "Membangun dan memelihara infrastruktur dasar desa yang merata antar dusun.",
    "Mengembangkan ekonomi kerakyatan berbasis pertanian, UMKM, dan potensi lokal.",
    "Meningkatkan derajat kesehatan ibu, anak, dan lansia melalui posyandu aktif.",
    "Mendorong partisipasi warga, pemuda, dan perempuan dalam pembangunan desa.",
    "Mewujudkan tata kelola keuangan desa yang akuntabel dan bebas korupsi.",
  ].join("\n"),
  sejarah: `<p>Desa Kwala Gunung merupakan salah satu desa di Kecamatan Datuk Lima Puluh, Kabupaten Batu Bara, Provinsi Sumatera Utara. Nama <em>Kwala Gunung</em> berasal dari pertemuan dua sungai kecil yang mengalir di kaki perbukitan, yang oleh warga setempat disebut <em>kuala</em>.</p>
<p>Sejak dahulu wilayah ini dikenal sebagai daerah pertanian padi dan perkebunan karet rakyat. Seiring pembukaan jalan Trans Sumatera, Desa Kwala Gunung berkembang menjadi salah satu simpul ekonomi kecamatan dengan pasar desa yang ramai setiap pekan.</p>
<p>Pada tahun 2008, bersama pemekaran Kabupaten Batu Bara, Desa Kwala Gunung ditata kembali menjadi tiga dusun dengan dua belas wilayah RT. Hingga kini desa terus berbenah di bidang infrastruktur, pendidikan, kesehatan, dan pemberdayaan ekonomi warga.</p>`,
  sambutan: `<p>Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di portal resmi Desa Kwala Gunung.</p>
<p>Portal ini kami hadirkan sebagai wujud komitmen pemerintah desa dalam mewujudkan keterbukaan informasi dan pelayanan publik yang lebih mudah diakses oleh seluruh warga. Melalui portal ini, warga dapat membaca berita desa, memantau transparansi anggaran, melihat data pembangunan, serta mengajukan layanan surat secara daring.</p>
<p>Kami mengajak seluruh warga untuk bersama-sama membangun Desa Kwala Gunung yang lebih maju, mandiri, dan sejahtera. Masukan serta saran dari masyarakat sangat kami harapkan demi perbaikan pelayanan ke depan.</p>
<p>Wassalamu'alaikum warahmatullahi wabarakatuh.</p>`,
  koordinat: "3.289412, 99.392815",
} as const;

export interface HalamanSeed {
  judul: string;
  slug: string;
  isi: string;
}

export const HALAMAN_SEEDS: HalamanSeed[] = [
  {
    judul: "Sejarah Desa Kwala Gunung",
    slug: "sejarah-desa",
    isi: `<h2>Asal Usul Nama</h2>
<p>Nama Kwala Gunung berasal dari bahasa Melayu setempat. Kata <em>kuala</em> berarti muara atau pertemuan sungai, sedangkan <em>gunung</em> merujuk pada perbukitan yang membentang di sisi utara desa. Konon, para pendiri desa menjadikan pertemuan dua sungai di kaki perbukitan itu sebagai tempat bermukim pertama.</p>
<h2>Perkembangan Wilayah</h2>
<p>Pada masa awal, permukiman penduduk terpusat di sekitar masjid tua dan pasar pekan. Seiring bertambahnya penduduk, wilayah desa dimekarkan menjadi tiga dusun dan dua belas RT. Pembukaan Jalan Trans Sumatera mempercepat pertumbuhan ekonomi dan mobilitas warga.</p>
<h2>Masa Kini</h2>
<p>Desa Kwala Gunung kini memiliki balai desa, puskesmas pembantu, sekolah dasar, posyandu, dan lapak UMKM yang dikelola bersama masyarakat. Pemerintah desa terus mendorong pembangunan yang partisipatif dan berkelanjutan.</p>`,
  },
  {
    judul: "Visi dan Misi Desa",
    slug: "visi-misi",
    isi: `<h2>Visi</h2>
<p>Terwujudnya Desa Kwala Gunung yang Maju, Mandiri, Sejahtera, dan Berbudaya melalui Tata Kelola Pemerintahan yang Bersih, Transparan, dan Partisipatif.</p>
<h2>Misi</h2>
<ol>
<li>Meningkatkan kualitas pelayanan administrasi publik yang cepat, mudah, dan tanpa biaya.</li>
<li>Membangun dan memelihara infrastruktur dasar desa yang merata antar dusun.</li>
<li>Mengembangkan ekonomi kerakyatan berbasis pertanian, UMKM, dan potensi lokal.</li>
<li>Meningkatkan derajat kesehatan ibu, anak, dan lansia melalui posyandu aktif.</li>
<li>Mendorong partisipasi warga, pemuda, dan perempuan dalam pembangunan desa.</li>
<li>Mewujudkan tata kelola keuangan desa yang akuntabel dan bebas korupsi.</li>
</ol>`,
  },
  {
    judul: "Struktur Organisasi Pemerintah Desa",
    slug: "struktur-organisasi",
    isi: `<h2>Susunan Organisasi</h2>
<p>Pemerintah Desa Kwala Gunung dipimpin oleh Kepala Desa dan dibantu oleh Sekretaris Desa, Kepala Urusan (Kaur), Kepala Seksi (Kasi), serta Kepala Dusun.</p>
<ul>
<li><strong>Kepala Desa:</strong> H. Syahril, S.E.</li>
<li><strong>Sekretaris Desa:</strong> Rizky Efendi, S.E., M.M.</li>
<li><strong>Kaur Tata Usaha &amp; Umum:</strong> Nuraini, S.A.Kab.</li>
<li><strong>Kaur Keuangan:</strong> Mulyadi, S.E.</li>
<li><strong>Kaur Perencanaan:</strong> Febrianti, S.IP.</li>
<li><strong>Kasi Pemerintahan:</strong> Andi Pohan, S.Sos.</li>
<li><strong>Kasi Kesejahteraan:</strong> Hj. Ratna Sari, S.Pd.</li>
<li><strong>Kasi Pelayanan:</strong> Saiful Bahri, A.Md.</li>
<li><strong>Kepala Dusun:</strong> Irwan Sembiring</li>
</ul>`,
  },
  {
    judul: "Syarat dan Prosedur Layanan Surat",
    slug: "syarat-layanan-surat",
    isi: `<h2>Prosedur Pengajuan</h2>
<ol>
<li>Warga mengisi formulir pengajuan surat melalui menu <strong>Layanan Surat</strong> atau datang langsung ke kantor desa.</li>
<li>Petugas memverifikasi kelengkapan berkas dan data kependudukan.</li>
<li>Surat diproses dan ditandatangani secara berjenjang oleh operator, Sekretaris Desa, dan Kepala Desa.</li>
<li>Warga menerima surat dalam bentuk cetak atau berkas digital.</li>
</ol>
<h2>Syarat Umum</h2>
<ul>
<li>Fotokopi KTP dan Kartu Keluarga.</li>
<li>Surat pengantar RT/RW setempat.</li>
<li>Berkas pendukung sesuai jenis surat yang diajukan.</li>
</ul>
<p>Seluruh layanan administrasi desa <strong>tidak dipungut biaya</strong>.</p>`,
  },
  {
    judul: "Pengaduan dan Aspirasi Warga",
    slug: "pengaduan-aspirasi",
    isi: `<h2>Menyampaikan Pengaduan</h2>
<p>Warga dapat menyampaikan pengaduan, saran, atau aspirasi melalui halaman <a href="/desa/pengaduan">Pengaduan Warga</a>. Setiap pengaduan akan mendapat nomor tiket yang dapat digunakan untuk melacak status penanganan.</p>
<h2>Kanal Lain</h2>
<ul>
<li>Kotak saran di kantor desa pada hari kerja.</li>
<li>Musyawarah dusun dan musyawarah desa yang digelar setiap tahun.</li>
<li>Pertemuan rutin RT/RW bersama kepala dusun.</li>
</ul>
<p>Identitas pelapor yang meminta pengaduannya tidak dipublikasikan akan dijaga kerahasiaannya.</p>`,
  },
];

export interface DokumenSeed {
  nama: string;
  slug: string;
  kategori: "informasi_publik" | "produk_hukum" | "lainnya";
  jenis: string;
  nomor: string | null;
  tahun: number;
  keterangan: string;
  /** Nama berkas PDF (tanpa ekstensi) di kategori media `dokumen`. */
  berkas: string;
}

export const DOKUMEN_SEEDS: DokumenSeed[] = [
  {
    nama: "Peraturan Desa tentang APBDes Tahun Anggaran 2026",
    slug: "perdes-apbdes-2026",
    kategori: "produk_hukum",
    jenis: "Peraturan Desa",
    nomor: "01/PERDES/KG/2026",
    tahun: 2026,
    keterangan:
      "Peraturan Desa Kwala Gunung tentang Anggaran Pendapatan dan Belanja Desa tahun anggaran 2026.",
    berkas: "perdes-apbdes-2026",
  },
  {
    nama: "Peraturan Desa tentang RKPDes Tahun 2026",
    slug: "perdes-rkpdes-2026",
    kategori: "produk_hukum",
    jenis: "Peraturan Desa",
    nomor: "02/PERDES/KG/2026",
    tahun: 2026,
    keterangan: "Rencana Kerja Pemerintah Desa Kwala Gunung tahun 2026.",
    berkas: "perdes-rkpdes-2026",
  },
  {
    nama: "Laporan Realisasi APBDes Semester I Tahun 2026",
    slug: "laporan-realisasi-apbdes-semester-1-2026",
    kategori: "informasi_publik",
    jenis: "Laporan Keuangan",
    nomor: null,
    tahun: 2026,
    keterangan: "Laporan realisasi pelaksanaan APBDes periode Januari–Juni 2026.",
    berkas: "laporan-realisasi-apbdes-semester-1-2026",
  },
  {
    nama: "Laporan Realisasi APBDes Semester II Tahun 2026",
    slug: "laporan-realisasi-apbdes-semester-2-2026",
    kategori: "informasi_publik",
    jenis: "Laporan Keuangan",
    nomor: null,
    tahun: 2026,
    keterangan: "Laporan realisasi pelaksanaan APBDes periode Juli–Desember 2026.",
    berkas: "laporan-realisasi-apbdes-semester-2-2026",
  },
  {
    nama: "Profil dan Statistik Desa Kwala Gunung 2026",
    slug: "profil-statistik-desa-2026",
    kategori: "informasi_publik",
    jenis: "Profil Desa",
    nomor: null,
    tahun: 2026,
    keterangan: "Ringkasan profil, data kependudukan, dan potensi Desa Kwala Gunung.",
    berkas: "profil-statistik-desa-2026",
  },
  {
    nama: "Rencana Pembangunan Jangka Menengah Desa 2023–2029",
    slug: "rpjmdes-2023-2029",
    kategori: "informasi_publik",
    jenis: "Dokumen Perencanaan",
    nomor: "03/PERDES/KG/2023",
    tahun: 2023,
    keterangan: "RPJMDes Kwala Gunung periode 2023–2029.",
    berkas: "rpjmdes-2023-2029",
  },
  {
    nama: "Daftar Inventaris Aset Desa Tahun 2026",
    slug: "inventaris-aset-desa-2026",
    kategori: "informasi_publik",
    jenis: "Laporan Aset",
    nomor: null,
    tahun: 2026,
    keterangan: "Rekapitulasi inventaris dan aset milik Desa Kwala Gunung.",
    berkas: "inventaris-aset-desa-2026",
  },
  {
    nama: "Surat Keputusan Kepala Desa tentang Penetapan Penerima BLT 2026",
    slug: "sk-penerima-blt-2026",
    kategori: "produk_hukum",
    jenis: "Surat Keputusan",
    nomor: "12/SK/KG/2026",
    tahun: 2026,
    keterangan: "Penetapan keluarga penerima manfaat Bantuan Langsung Tunai Dana Desa tahun 2026.",
    berkas: "sk-penerima-blt-2026",
  },
  {
    nama: "Peraturan Desa tentang Pengelolaan Sampah Rumah Tangga",
    slug: "perdes-pengelolaan-sampah",
    kategori: "produk_hukum",
    jenis: "Peraturan Desa",
    nomor: "04/PERDES/KG/2025",
    tahun: 2025,
    keterangan: "Aturan pengelolaan sampah rumah tangga dan kebersihan lingkungan desa.",
    berkas: "perdes-pengelolaan-sampah",
  },
  {
    nama: "Panduan Layanan Administrasi Desa",
    slug: "panduan-layanan-administrasi",
    kategori: "lainnya",
    jenis: "Panduan",
    nomor: null,
    tahun: 2026,
    keterangan: "Panduan syarat, prosedur, dan alur pelayanan surat bagi warga.",
    berkas: "panduan-layanan-administrasi",
  },
];

export interface MenuSeed {
  nama: string;
  link: string;
  linkTipe: "internal" | "eksternal" | "halaman";
  urut: number;
  anak?: Array<Omit<MenuSeed, "anak">>;
}

/** Menu publik bertingkat mengikuti struktur navigasi bawaan. */
export const MENU_SEEDS: MenuSeed[] = [
  { nama: "Beranda", link: "/", linkTipe: "internal", urut: 1 },
  {
    nama: "Profil",
    link: "/desa/profil",
    linkTipe: "internal",
    urut: 2,
    anak: [
      { nama: "Profil Desa", link: "/desa/profil", linkTipe: "internal", urut: 1 },
      { nama: "Pemerintahan", link: "/desa/pemerintahan", linkTipe: "internal", urut: 2 },
      { nama: "Kelompok & Lembaga", link: "/desa/kelompok", linkTipe: "internal", urut: 3 },
      { nama: "Peta Desa", link: "/desa/peta", linkTipe: "internal", urut: 4 },
    ],
  },
  {
    nama: "Informasi",
    link: "/desa/berita",
    linkTipe: "internal",
    urut: 3,
    anak: [
      { nama: "Berita", link: "/desa/berita", linkTipe: "internal", urut: 1 },
      { nama: "Agenda", link: "/desa/agenda", linkTipe: "internal", urut: 2 },
      { nama: "Galeri", link: "/desa/galeri", linkTipe: "internal", urut: 3 },
      { nama: "Informasi Publik", link: "/desa/dokumen", linkTipe: "internal", urut: 4 },
    ],
  },
  {
    nama: "Transparansi",
    link: "/desa/apbdes",
    linkTipe: "internal",
    urut: 4,
    anak: [
      { nama: "APBDes", link: "/desa/apbdes", linkTipe: "internal", urut: 1 },
      { nama: "Statistik", link: "/desa/statistik", linkTipe: "internal", urut: 2 },
      { nama: "Pembangunan", link: "/desa/pembangunan", linkTipe: "internal", urut: 3 },
      { nama: "Inventaris", link: "/desa/inventaris", linkTipe: "internal", urut: 4 },
      { nama: "Status Desa", link: "/desa/status-des", linkTipe: "internal", urut: 5 },
      { nama: "IDM & SDGs", link: "/desa/idm-sdgs", linkTipe: "internal", urut: 6 },
    ],
  },
  {
    nama: "Potensi",
    link: "/desa/lapak",
    linkTipe: "internal",
    urut: 5,
    anak: [
      { nama: "Lapak Desa", link: "/desa/lapak", linkTipe: "internal", urut: 1 },
      { nama: "Sinergi Program", link: "/desa/sinergi-program", linkTipe: "internal", urut: 2 },
      { nama: "Bantuan Sosial", link: "/desa/bantuan", linkTipe: "internal", urut: 3 },
    ],
  },
  {
    nama: "Partisipasi",
    link: "/desa/pemilihan",
    linkTipe: "internal",
    urut: 6,
    anak: [
      { nama: "DPT", link: "/desa/dpt", linkTipe: "internal", urut: 1 },
      { nama: "Pemilihan", link: "/desa/pemilihan", linkTipe: "internal", urut: 2 },
      { nama: "Analisis & Survei", link: "/desa/analisis-survei", linkTipe: "internal", urut: 3 },
      { nama: "Pengaduan", link: "/desa/pengaduan", linkTipe: "internal", urut: 4 },
    ],
  },
  {
    nama: "Layanan",
    link: "/desa/surat",
    linkTipe: "internal",
    urut: 7,
    anak: [
      { nama: "Jenis Surat", link: "/desa/surat", linkTipe: "internal", urut: 1 },
      { nama: "Kesehatan", link: "/desa/kesehatan/kia", linkTipe: "internal", urut: 2 },
      { nama: "Suplemen Data", link: "/desa/suplemen", linkTipe: "internal", urut: 3 },
    ],
  },
  { nama: "Kontak", link: "/desa/kontak", linkTipe: "internal", urut: 8 },
];

export interface WidgetSeed {
  judul: string;
  isi: string;
  jenis: number;
  urut: number;
}

export const WIDGET_SEEDS: WidgetSeed[] = [
  {
    judul: "Jam Pelayanan Kantor Desa",
    isi: `<p>Senin–Kamis: 08.00–15.00 WIB<br/>Jumat: 08.00–11.30 WIB<br/>Sabtu–Minggu dan hari libur nasional: tutup.</p><p>Layanan darurat dapat menghubungi kepala dusun setempat.</p>`,
    jenis: 1,
    urut: 1,
  },
  {
    judul: "Pengumuman Penting",
    isi: `<p>Musyawarah Desa penetapan RKPDes 2027 akan dilaksanakan di Balai Desa. Warga diharapkan hadir melalui perwakilan RT masing-masing.</p>`,
    jenis: 1,
    urut: 2,
  },
  {
    judul: "Kontak Penting",
    isi: `<ul><li>Kantor Desa: (0621) 000-0000</li><li>Puskesmas Pembantu: (0621) 000-0001</li><li>Polsek Datuk Lima Puluh: 110</li><li>Ambulans Desa: 0812-0000-0000</li></ul>`,
    jenis: 1,
    urut: 3,
  },
];

export const PENGATURAN_SEEDS: Record<string, unknown> = {
  "web.komentar_aktif": true,
  "web.berita_beranda": 6,
  "mandiri.pendaftaran_warga": true,
  "surat.penomoran_mode": 2,
};

/** Opsi tema yang dipakai portal Desa Kwala Gunung. */
export const TEMA_OPSI: Partial<ThemeOptions> = {
  warnaPrimer: "#0f766e",
  warnaSekunder: "#115e59",
  font: "aksesibel",
  kelengkungan: 0.75,
  heroJudul: "Selamat Datang di Portal Resmi Desa Kwala Gunung",
  heroTombol: "Layanan Mandiri Warga",
  heroTombolUrl: "/layanan-mandiri",
  headerVarian: "berwarna",
  tampilMenu: true,
  tampilKontakFooter: true,
  teksBerjalan:
    "Selamat datang di portal resmi Desa Kwala Gunung — Kecamatan Datuk Lima Puluh, Kabupaten Batu Bara.",
  beranda: ["hero", "slider", "statistik", "widget", "berita", "surat", "agenda", "kontak"],
  sosmed: [
    { platform: "facebook", url: "https://facebook.com/desakwalagunung" },
    { platform: "instagram", url: "https://instagram.com/desakwalagunung" },
    { platform: "youtube", url: "https://youtube.com/@desakwalagunung" },
    { platform: "whatsapp", url: "https://wa.me/6281200000000" },
  ],
};
