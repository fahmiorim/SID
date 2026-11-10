/**
 * Berita & artikel publik Desa Kwala Gunung.
 * Semua entri idempoten (dicek slug+nama sebelum insert).
 */

export interface BeritaSeed {
  judul: string;
  slug: string;
  ringkasan: string;
  isi: string;
  kategoriSlug: string;
  gambar?: string;
  headline?: boolean;
  slider?: boolean;
}

export const BERITA_SEEDS: BeritaSeed[] = [
  {
    judul: "Penyerahan Bantuan Langsung Tunai Bulan Desember 2024",
    slug: "penyerahan-blt-desember-2024",
    ringkasan:
      "Pemerintah Desa Kwala Gunung melaksanakan penyaluran BLT Dana Desa tahap kedua kepada 15 KK penerima di balai desa.",
    isi: `<p>Pada hari Sabtu, 14 Desember 2024, Pemerintah Desa Kwala Gunung menyelenggarakan penyaluran Bantuan Langsung Tunai (BLT) Dana Desa tahap kedua tahun anggaran 2024. Sebanyak 15 Kartu Keluarga (KK) penerima mengikuti upacara seremonial di Balai Desa Kwala Gunung.</p>
<p>Bupati Batu Bara dalam sambutannya menyampaikan bahwa program BLT ini merupakan wujud kepedulian pemerintah terhadap keluarga kurang mampu. \"Dana yang disalurkan harus tepat sasaran dan digunakan untuk keperluan sehari-hari,\" ujarnya.</p>
<p>Kepala Desa Kwala Gunung, Syahril, S.E., menjelaskan bahwa proses pemilihan penerima BLT dilakukan secara partisipatif melalui Musyawarah Desa (Musdes) dan mengacu pada Data Terpadu Kesejahteraan Sosial (DTKS) tingkat kecamatan.</p>
<p>Setiap KK penerima mendapat bantuan sebesar Rp600.000,- yang disalurkan melalui bank mitra. Penyaluran berjalan aman dan tertib dengan pengawasan dari aparat desa serta tokoh masyarakat setempat.</p>`,
    kategoriSlug: "kegiatan",
    gambar: "/1/berita/berita-kegiatan.svg",
    headline: true,
  },
  {
    judul: "Pembangunan Jalan Lingkungan Dusun I Resmi Dimulai",
    slug: "pembangunan-jalan-dusun-i-2024",
    ringkasan:
      "Proyek pemasangan paving blok sepanjang 850 meter di Dusun I, Kwala Gunung mulai dikerjakan dengan dana APBDes 2024.",
    isi: `<p>Dinas Pekerjaan Umum Kabupaten Batu Bara bersama Pemerintah Desa Kwala Gunung resmi memulai pekerjaan pembangunan jalan lingkungan Dusun I seluas 850 meter persegi. Proyek ini menggunakan Anggaran Pendapatan dan Belanja Desa (APBDes) tahun 2024 sebesar Rp340.000.000,-.</p>
<p>Ketua Badan Permusyawaratan Desa (BPD) Kwala Gunung, M. Yusuf, ST., menegaskan bahwa prioritas pembangunan jalan ini didasarkan pada usulan warga melalui forum musyawarah desa bulan September 2023. \"Warga Dusun I sudah lama berharap jalan utama dusun bisa diaspal karena saat musim hujan sering tergenang banjir,\" ungkapnya.</p>
<p>Pejabat Pembangunan Desa (PPD) ditunjuk sebagai pengawas lapangan, sementara pelaksana teknis menggunakan skema Swakelola yang melibatkan anggota kelompok tani dan Karang Taruna setempat.</p>
<p>Target penyelesaian proyek ditargetkan selesai pada Maret 2025 mendatang.</p>`,
    kategoriSlug: "pembangunan",
    gambar: "/1/berita/berita-pembangunan.svg",
    slider: true,
  },
  {
    judul: "Posyandu Balita Bulan November Capai Target Partisipasi 95%",
    slug: "posyandu-november-2024",
    ringkasan:
      "Kegiatan posyandu balita di Kwala Gunung mencatat tingkat kehadiran bayi dan balita mencapai 95 persen dari target.",
    isi: `<p>Kelompok Kerja Posyandu Kwala Gunung melaporkan capaian positf pada kegiatan rutin bulan November 2024. Total 142 balita terdaftar, dan 135 di antaranya hadir pada pelaksanaan posyandu di Balai Dusun I.</p>
<p>Kasi Kesejahteraan Desa Kwala Gunung, Hj. Ratna, menerangkan bahwa peningkatan partisipasi dibanding tahun sebelumnya berkat pendekatan door-to-door oleh kader posyandu ke setiap rumah tangga sasaran. \"Kami juga meningkatkan sosialisasi lewat grup WhatsApp warga,\" jelasnya.</p>
<p>Pada kesempatan itu, ribuan dosis vitamin A dibagikan gratis kepada seluruh balita hadirin. Tim medis dari Puskesmas Datuk Lima Puluh juga memberikan layanan imunisasi campak dan pemeriksaan kadar hemoglobin untuk deteksi dini anemia.</p>`,
    kategoriSlug: "kesehatan",
    gambar: "/1/berita/berita-kesehatan.svg",
  },
  {
    judul: "Pelatihan UMKM Kerajinan Roti Masyarakat Kwala Gunung",
    slug: "pelatihan-umkm-roti-2024",
    ringkasan:
      "Sebanyak 25 pelaku usaha mikro bergabung dalam pelatihan pengolahan roti selama tiga hari di balai desa.",
    isi: `<p>Pemerintah Desa Kwala Gunung bekerjasama dengan Dinas Koperasi dan UKM Kabupaten Batu Bara menggelar pelatihan wirausaha untuk masyarakat binaan. Pelatihan bertema \"Pengolahan Roti dan Camilan Modern\" diikuti 25 peserta terdiri dari ibu rumah tangga, pemuda, dan pelaku UMKM lokal.</p>
<p>Materi disampaikan praktisi kuliner setempat yang berpengalaman puluhan tahun. Peserta diajarkan teknik pembakaran, formulasi adonan, hingga strategi packaging dan pemasaran digital via marketplace.</p>
<p>Kepala Desa Syahril berharap keterampilan ini dapat meningkatkan taraf ekonomi keluarga peserta sekaligus mendorong pertumbuhan ekonomi desa berbasis komoditas lokal.</p>
<p>Ke depan, desa berkomitmen akan menyediakan pendampingan pasar bagi produk hasil pelatihan melalui Lapak Desa.</p>`,
    kategoriSlug: "kegiatan",
    gambar: "/1/berita/berita-pelatihan.svg",
  },
  {
    judul: "Realisasi APBDes Kwala Gunung Tahun 2024 Tercapai 78 Persen",
    slug: "realisasi-apbdes-2024",
    ringkasan:
      "Belanja desa semester pertama telah mencapai 78% dari pagu anggaran, didominasi sektor pembangunan infrastruktur.",
    isi: `<p>Sekretaris Desa Kwala Gunung, Rizky Efendi, SE., MM. memaparkan realisasi anggaran desa tahun 2024 pada sidang paripurna BPD. Dari total pagu sebesar Rp1.850.000.000,-, belanja yang telah terserap mencapai Rp1.443.000.000,- atau 78%. </p>
<p>Sektor pembangunan masih menyumbang porsi terbesar yaitu Rp780.000.000,- (42% dari total pagu), menyusul sektor pemberdayaan masyarakat sebesar Rp425.000.000,- dan operasional aparatur desa Rp238.000.000,-.</p>
<p>\"Sisa anggaran kami prioritaskan untuk penyelesaian proyek jalan dusun II dan III yang masih berjalan,\" ungkap Sekretaris.</p>
<p>Realisasi triwulan IV direncanakan rampung pada akhir Januari 2025 agar dokumen pertanggungjawaban dapat disampaikan tepat waktu kepada Pemkab Batu Bara.</p>`,
    kategoriSlug: "pengumuman",
    gambar: "/1/berita/berita-apbdes.svg",
  },
  {
    judul:
      "Safari Ramadhan ke-5: Bupati dan Wabup Batu Bara Berbuka Puasa bersama Masyarakat Desa Bangun Sari",
    slug: "safari-ramadhan-ke-5-bupati-batu-bara",
    ringkasan:
      "Bupati Batu Bara H. Baharuddin Siagian bersama Wabup Syafrizal berbuka puasa bersama masyarakat Desa Bangun Sari dalam Safari Ramadhan ke-5, disertai penyerahan bantuan sembako dan tali asih.",
    isi: `<p>Safari Ramadhan ke-5, Bupati Batu Bara H. Baharuddin Siagian, S.H., M.Si., bersama Wakil Bupati Batu Bara Syafrizal, S.E., M.AP., berbuka puasa bersama masyarakat Desa Bangun Sari di Masjid Al-Amin, Desa Bangun Sari, Kecamatan Datuk Tanah Datar, Jumat (27/2/2026).</p>
<p>Dalam kesempatan tersebut, Bupati Batu Bara menyerahkan bantuan sembako dan tali asih kepada anak yatim piatu sebagai bentuk kepedulian sosial Pemerintah Kabupaten Batu Bara.</p>
<p>Selain itu, Bupati Baharuddin juga memberikan bantuan berupa satu unit vacuum cleaner dan kipas angin kepada BKM Al-Amin guna mendukung kenyamanan jamaah dalam beribadah.</p>
<p>Kegiatan juga diisi dengan ceramah agama yang disampaikan oleh Ustadz Abdurrahman Rivai. Melalui Safari Ramadan ini, Pemerintah Kabupaten Batu Bara berharap terjalin hubungan yang semakin harmonis antara pemerintah dan masyarakat.</p>`,
    kategoriSlug: "kegiatan",
    gambar: "/1/berita/safari-ramadhan-bupati.jpg",
  },
  {
    judul: "Agrinas Pangan Nusantara Bersama Personel Kodim 0208/Asahan Tinjau KMP Kwala Gunung",
    slug: "agrinas-pangan-nusantara-tinjau-kmp-kwala-gunung",
    ringkasan:
      "Perwakilan Agrinas Pangan Nusantara bersama personel Kodim 0208/Asahan meninjau pembangunan Koperasi Merah Putih Desa Kwala Gunung, Kecamatan Datuk Lima Puluh.",
    isi: `<p>Perwakilan Agrinas Pangan Nusantara bersama personel Kodim 0208/Asahan melakukan kunjungan lapangan secara langsung untuk meninjau pembangunan Koperasi Merah Putih (KMP) Desa Kwala Gunung, Kecamatan Datuk Lima Puluh, Kabupaten Batu Bara, Senin (24/8).</p>
<p>Rombongan terdiri dari Konsultan Agrinas Pangan Nusantara, Danramil 03, pengawas dari Kodim 0208/Asahan, Babinsa Kwala Gunung, serta pelaksana pembangunan. Mereka mengecek setiap ruang maupun gedung koperasi beserta pembangunan pendukung lainnya yang berlangsung aman dan lancar.</p>
<p>Peninjauan ini merupakan sinergi lintas sektor dan wujud nyata kolaborasi dalam memperkuat ketahanan pangan serta ekonomi kerakyatan di wilayah tersebut. Kehadiran koperasi diharapkan dapat meningkatkan kesejahteraan masyarakat dan memperkokoh perekonomian nasional.</p>
<p>Program tersebut bertujuan membangun ekonomi yang dimulai dari tingkat desa menjadi pusat ekonomi yang digagas oleh Presiden Prabowo Subianto sebagai program strategis nasional.</p>`,
    kategoriSlug: "pembangunan",
    gambar: "/1/berita/kmp-kwala-gunung.jpg",
    headline: true,
  },
  {
    judul: "Tinjau Titik Banjir, Wabup Syafrizal Pastikan Warga Tetap Aman",
    slug: "tinjau-titik-banjir-wabup-syafrizal",
    ringkasan:
      "Wabup Batu Bara Syafrizal meninjau titik banjir di Kecamatan Datuk Lima Puluh, termasuk Desa Kuala Gunung, dan memastikan warga tetap aman dengan posko kesehatan dan dapur umum.",
    isi: `<p>Wakil Bupati Batu Bara Syafrizal, S.E., M.AP., bersama Kepala Dinas Kesehatan PPKB dr. Deni Syahputra, Plt. Kadis PUTR Rubi Siboro, dan Camat Datuk Lima Puluh meninjau langsung titik lokasi banjir di wilayah Kecamatan Datuk Lima Puluh, Jumat (28/11/2025).</p>
<p>Peninjauan dimulai dari Desa Kuala Gunung, Desa Empat Negeri, Desa Simpang Dolok, dan Air Hitam dengan ketinggian air rata-rata mencapai 80 cm yang merendam ribuan rumah dan ratusan hektar sawah.</p>
<p>Banjir terjadi akibat intensitas hujan sangat tinggi dalam 3 hari terakhir karena siklon tropis senyar dan air kiriman dari hulu. Wabup Syafrizal memastikan keadaan warga aman dan mengimbau warga mengungsi ke tenda darurat yang didirikan BPBD Batu Bara.</p>
<p>Pemerintah Kabupaten Batu Bara juga menyediakan posko kesehatan, obat-obatan, dapur umum, dan ketersediaan makanan bagi warga.</p>`,
    kategoriSlug: "pengumuman",
    gambar: "/1/berita/banjir-datuk-lima-puluh.jpg",
  },
];
