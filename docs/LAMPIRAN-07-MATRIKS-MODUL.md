# LAMPIRAN 07 - Matriks Ketertelusuran Modul (Modul -> Controller -> Model -> Tabel)

> Dibangun **otomatis** dari repo OpenSID pada 2026-10-16.
> Sumber: `app/database/seeders/DataAwal/SettingModul.php` (katalog modul), `donjo-app/controllers` (161), `app/Models` + `donjo-app/models` (model), `donjo-app/models/migrations/struktur_tabel` (tabel).

## 1. Ringkasan Angka

| Entitas | Jumlah |
|---|---|
| Modul (setting_modul) | 137 |
| Controller | 161 |
| Model (Eloquent + legacy) | 179 |
| Tabel (create-table) | 243 |
| Modul yang controller-nya berhasil dipetakan | 100 / 137 |
| Controller tanpa modul | 71 |

## 2. Hierarki Menu (berdasarkan nilai `parent`)

> **Penting:** kolom `parent` pada seeder ini merujuk **id menu legacy** (mis. 200, 201, 301, 337), **bukan** nomor urut modul di tabel ini. Karena itu hierarki tidak dapat direkonstruksi 1:1 dari daftar modul; yang bisa dipastikan adalah **pengelompokan per nilai parent** di bawah.

**Modul tanpa induk (`parent = 0`):**

- Home (`beranda`)
- Pembangunan (`admin_pembangunan`)
- Lapak (`lapak_admin`)
- Pengaduan (`pengaduan_admin`)

| parent id (legacy) | jumlah modul | contoh modul |
|---|---|---|
| 15 | 18 | Surat Masuk, Surat Keluar, Inventaris, Klasifikasi Surat, api_inventaris_asset, api_inventaris_gedung, api_inventaris_gedung, api_inventaris_jalan |
| 301 | 17 | Administrasi Umum, Administrasi Penduduk, Administrasi Pembangunan, Buku Eskpedisi, Buku Lembaran Dan Berita [Desa], Buku Mutasi Penduduk, Buku Rekapitulasi Jumlah Penduduk, Buku Penduduk Sementara |
| 13 | 11 | Artikel, Widget, Menu, Komentar, Galeri, Media Sosial, Slider, Teks Berjalan |
| 5 | 9 | analisis_kategori, analisis_indikator, analisis_klasifikasi, analisis_periode, analisis_respon, analisis_laporan, analisis_statistik_jawaban, Master Analisis |
| 11 | 8 | Modul, Aplikasi, Pengguna, Database, Info Sistem, Pengaturan Grup, QR Code, Optimasi Gambar |
| 9 | 8 | Pengaturan Peta, Peta, plan, point, garis, line, area, polygon |
| 200 | 8 | Identitas [Desa], [Pemerintah Desa], Wilayah Administratif, Status [Desa], Layanan Pelanggan, Lembaga [Desa], Kategori Lembaga, Pendaftaran Kerjasama |
| 2 | 8 | Penduduk, Keluarga, Rumah Tangga, Kelompok, Data Suplemen, Calon Pemilih, Log Penduduk, Kategori Kelompok |
| 337 | 5 | Jam Kerja, Hari Libur, Rekapitulasi, Pengaduan, Alasan Keluar |
| 201 | 5 | Impor Data, Laporan, Input Data, Laporan Manual, Laporan APBDes |
| 4 | 5 | Pengaturan Surat, Cetak Surat, Arsip Layanan, Daftar Persyaratan, Permohonan Surat |
| 14 | 5 | Kotak Pesan, Pendaftar Layanan Mandiri, Pengaturan, Pendapat, Gawai Layanan |
| 206 | 4 | Pendataan, Pemantauan, Vaksin, Stunting |
| 3 | 4 | Statistik Kependudukan, Laporan Bulanan, Laporan Kelompok Rentan, Laporan Penduduk |
| 354 | 4 | Data Tamu, Data Kepuasan, Data Pertanyaan, Data Keperluan |
| 312 | 3 | Daftar Anjungan, Menu, Pengaturan |
| 10 | 3 | Kirim Pesan, Daftar Kontak, Grup Kontak |
| 6 | 2 | Program Bantuan, Peserta Bantuan |
| 343 | 2 | Sinkronisasi, Pesan |
| 7 | 2 | Daftar Persil, C-Desa |
| 352 | 1 | DTKS |
| 52 | 1 | Informasi Publik |

> Kelompok dengan anggota terbanyak memberi petunjuk grup menu: `200` (Pengaturan/Profil Desa), `301` (Bumindes), `201` (Laporan/Keuangan), `206` (Pendataan/Sasaran), `337`/`343` (Pengaturan sistem).

## 3. Katalog Modul Lengkap (137)

| Id | Modul | slug | url | parent | controller (perkiraan) |
|---|---|---|---|---|---|
| 1 | Home | `home` | `beranda` | 0 | Beranda |
| 2 | Pengaturan Peta | `pengaturan-peta` | `plan` | 9 | Plan |
| 3 | Identitas [Desa] | `identitas-desa` | `identitas_desa` | 200 | Identitas_desa |
| 4 | [Pemerintah Desa] | `pemerintah-desa` | `pengurus/clear` | 200 | _(tidak dipetakan)_ |
| 5 | Wilayah Administratif | `wilayah-administratif` | `wilayah/clear` | 200 | Wilayah |
| 6 | Penduduk | `penduduk` | `penduduk/clear` | 2 | Penduduk |
| 7 | Keluarga | `keluarga` | `keluarga/clear` | 2 | Keluarga |
| 8 | Rumah Tangga | `rumah-tangga` | `rtm/clear` | 2 | Rtm |
| 9 | Kelompok | `kelompok` | `kelompok/clear` | 2 | Kelompok |
| 10 | Data Suplemen | `data-suplemen` | `suplemen/clear` | 2 | Suplemen |
| 11 | Calon Pemilih | `calon-pemilih` | `dpt/clear` | 2 | Dpt |
| 12 | Statistik Kependudukan | `statistik-kependudukan` | `statistik/clear` | 3 | Statistik |
| 13 | Laporan Bulanan | `laporan-bulanan` | `laporan/clear` | 3 | Laporan |
| 14 | Laporan Kelompok Rentan | `laporan-kelompok-rentan` | `laporan_rentan/clear` | 3 | Laporan_rentan |
| 15 | Pengaturan Surat | `pengaturan-surat` | `surat_master` | 4 | Surat_master |
| 16 | Cetak Surat | `cetak-surat` | `surat` | 4 | Surat |
| 17 | Arsip Layanan | `arsip-layanan` | `keluar/clear/masuk` | 4 | Keluar |
| 18 | Kirim Pesan | `kirim-pesan` | `sms` | 10 | Sms |
| 19 | Daftar Kontak | `daftar-kontak` | `daftar_kontak` | 10 | Daftar_kontak |
| 20 | Modul | `modul` | `modul/clear` | 11 | Modul |
| 21 | Aplikasi | `aplikasi` | `setting` | 11 | Setting |
| 22 | Pengguna | `pengguna` | `man_user/clear` | 11 | Man_user |
| 23 | Database | `database` | `database` | 11 | Database |
| 24 | Info Sistem | `info-sistem` | `info_sistem` | 11 | Info_sistem |
| 25 | Artikel | `artikel` | `web/clear` | 13 | Web |
| 26 | Widget | `widget` | `web_widget/clear` | 13 | Web_widget |
| 27 | Menu | `menu` | `menu/clear` | 13 | Menu |
| 28 | Komentar | `komentar` | `komentar/clear` | 13 | Komentar |
| 29 | Galeri | `galeri` | `gallery/clear` | 13 | Gallery |
| 30 | Media Sosial | `media-sosial` | `sosmed` | 13 | Sosmed |
| 31 | Slider | `slider` | `web/slider` | 13 | Web |
| 32 | Kotak Pesan | `kotak-pesan` | `mailbox/clear` | 14 | Mailbox |
| 33 | Pendaftar Layanan Mandiri | `pendaftar-layanan-mandiri` | `mandiri/clear` | 14 | Mandiri |
| 34 | Surat Masuk | `surat-masuk` | `surat_masuk/clear` | 15 | _(tidak dipetakan)_ |
| 35 | Surat Keluar | `surat-keluar` | `surat_keluar/clear` | 15 | _(tidak dipetakan)_ |
| 36 | Inventaris | `inventaris` | `inventaris_tanah` | 15 | Inventaris_tanah |
| 37 | Peta | `peta` | `gis/clear` | 9 | Gis |
| 38 | Klasifikasi Surat | `klasifikasi-surat` | `klasifikasi/clear` | 15 | Klasifikasi |
| 39 | Teks Berjalan | `teks-berjalan` | `teks_berjalan` | 13 | Teks_berjalan |
| 40 | Kategori | `kategori` | `kategori` | 13 | Kategori |
| 41 | Log Penduduk | `log-penduduk` | `penduduk_log` | 2 | Penduduk_log |
| 42 | analisis_kategori | `analisis-kategori` | `analisis_kategori` | 5 | _(tidak dipetakan)_ |
| 43 | analisis_indikator | `analisis-indikator` | `analisis_indikator` | 5 | _(tidak dipetakan)_ |
| 44 | analisis_klasifikasi | `analisis-klasifikasi` | `analisis_klasifikasi` | 5 | _(tidak dipetakan)_ |
| 45 | analisis_periode | `analisis-periode` | `analisis_periode` | 5 | _(tidak dipetakan)_ |
| 46 | analisis_respon | `analisis-respon` | `analisis_respon` | 5 | _(tidak dipetakan)_ |
| 47 | analisis_laporan | `analisis-laporan` | `analisis_laporan` | 5 | _(tidak dipetakan)_ |
| 48 | analisis_statistik_jawaban | `analisis-statistik-jawaban` | `analisis_statistik_jawaban` | 5 | _(tidak dipetakan)_ |
| 49 | api_inventaris_asset | `api-inventaris-asset` | `api_inventaris_asset` | 15 | Api_inventaris_asset |
| 50 | api_inventaris_gedung | `api-inventaris-gedung` | `api_inventaris_gedung` | 15 | _(tidak dipetakan)_ |
| 51 | api_inventaris_gedung | `api-inventaris-gedung-1` | `api_inventaris_gedung` | 15 | _(tidak dipetakan)_ |
| 52 | api_inventaris_jalan | `api-inventaris-jalan` | `api_inventaris_jalan` | 15 | Api_inventaris_jalan |
| 53 | api_inventaris_konstruksi | `api-inventaris-kontruksi` | `api_inventaris_kontruksi` | 15 | _(tidak dipetakan)_ |
| 54 | api_inventaris_peralatan | `api-inventaris-peralatan` | `api_inventaris_peralatan` | 15 | _(tidak dipetakan)_ |
| 55 | api_inventaris_tanah | `api-inventaris-tanah` | `api_inventaris_tanah` | 15 | _(tidak dipetakan)_ |
| 56 | inventaris_asset | `inventaris-asset` | `inventaris_asset` | 15 | Inventaris_asset |
| 57 | inventaris_gedung | `inventaris-gedung` | `inventaris_gedung` | 15 | Inventaris_gedung |
| 58 | inventaris_jalan | `inventaris-jalan` | `inventaris_jalan` | 15 | Inventaris_jalan |
| 59 | inventaris_kontruksi | `inventaris-kontruksi` | `inventaris_kontruksi` | 15 | Inventaris_kontruksi |
| 60 | inventaris_peralatan | `inventaris-peralatan` | `inventaris_peralatan` | 15 | Inventaris_peralatan |
| 61 | laporan_inventaris | `laporan-inventaris` | `laporan_inventaris` | 15 | Laporan_inventaris |
| 62 | plan | `plan` | `plan` | 9 | Plan |
| 63 | point | `point` | `point` | 9 | Point |
| 64 | garis | `garis` | `garis` | 9 | Garis |
| 65 | line | `line` | `line` | 9 | Line |
| 66 | area | `area` | `area` | 9 | Area |
| 67 | polygon | `polygon` | `polygon` | 9 | Polygon |
| 68 | Kategori Kelompok | `kategori-kelompok` | `kelompok_master` | 2 | Kelompok_master |
| 69 | Produk Hukum | `produk-hukum` | `dokumen_sekretariat/peraturan_desa` | 15 | _(tidak dipetakan)_ |
| 70 | Informasi Publik | `informasi-publik-1` | `informasi_publik` | 52 | _(tidak dipetakan)_ |
| 71 | Daftar Persyaratan | `daftar-persyaratan` | `surat_mohon` | 4 | Surat_mohon |
| 72 | Permohonan Surat | `permohonan-surat` | `permohonan_surat_admin` | 4 | Permohonan_surat_admin |
| 73 | Status [Desa] | `status-desa` | `status_desa` | 200 | Status_desa |
| 74 | Pengaturan Grup | `pengaturan-grup` | `grup/clear` | 11 | Grup |
| 75 | Master Analisis | `master-analisis` | `analisis_master/clear` | 5 | _(tidak dipetakan)_ |
| 76 | Pengaturan | `pengaturan-analisis` | `setting/analisis` | 5 | Setting |
| 77 | Impor Data | `impor-data` | `keuangan/impor_data` | 201 | _(tidak dipetakan)_ |
| 78 | Laporan | `laporan` | `keuangan/laporan` | 201 | Laporan |
| 79 | Pengunjung | `pengunjung` | `pengunjung/clear` | 13 | Pengunjung |
| 80 | Pendataan | `pendataan` | `covid19` | 206 | Covid19 |
| 81 | Pemantauan | `pemantauan` | `covid19/pantau` | 206 | Covid19 |
| 82 | Input Data | `input-data` | `keuangan_manual/manual_apbdes` | 201 | Keuangan_manual |
| 83 | Laporan Manual | `laporan-manual` | `keuangan_manual/laporan_manual` | 201 | Keuangan_manual |
| 84 | Pengaturan | `pengaturan-web` | `setting/web` | 13 | Setting |
| 85 | QR Code | `qr-code` | `setting/qrcode/clear` | 11 | Setting |
| 86 | Daftar Persil | `daftar-persil` | `data_persil` | 7 | Data_persil |
| 87 | C-Desa | `c-desa` | `cdesa` | 7 | Cdesa |
| 88 | Pembangunan | `pembangunan` | `admin_pembangunan` | 0 | Admin_pembangunan |
| 89 | Administrasi Umum | `administrasi-umum` | `bumindes_umum` | 301 | _(tidak dipetakan)_ |
| 90 | Administrasi Penduduk | `administrasi-penduduk` | `bumindes_penduduk_induk/clear` | 301 | Bumindes_penduduk_induk |
| 91 | Administrasi Pembangunan | `administrasi-pembangunan` | `bumindes_rencana_pembangunan` | 301 | Bumindes_rencana_pembangunan |
| 92 | Buku Eskpedisi | `buku-eskpedisi` | `ekspedisi/clear` | 301 | _(tidak dipetakan)_ |
| 93 | Buku Lembaran Dan Berita [Desa] | `buku-lembaran-dan-berita-desa` | `lembaran_desa/clear` | 301 | _(tidak dipetakan)_ |
| 94 | Layanan Pelanggan | `layanan-pelanggan` | `pelanggan` | 200 | _(tidak dipetakan)_ |
| 95 | Pengaturan | `pengaturan-layanan-mandiri` | `setting/mandiri` | 14 | Setting |
| 96 | Buku Mutasi Penduduk | `buku-mutasi-penduduk` | `bumindes_penduduk_mutasi/clear` | 301 | Bumindes_penduduk_mutasi |
| 97 | Buku Rekapitulasi Jumlah Penduduk | `buku-rekapitulasi-jumlah-penduduk` | `bumindes_penduduk_rekapitulasi/clear` | 301 | Bumindes_penduduk_rekapitulasi |
| 98 | Buku Penduduk Sementara | `buku-penduduk-sementara` | `bumindes_penduduk_sementara/clear` | 301 | Bumindes_penduduk_sementara |
| 99 | Buku KTP dan KK | `buku-ktp-dan-kk` | `bumindes_penduduk_ktpkk/clear` | 301 | Bumindes_penduduk_ktpkk |
| 100 | Buku Tanah Kas [Desa] | `buku-tanah-kas-desa` | `bumindes_tanah_kas_desa/clear` | 301 | Bumindes_tanah_kas_desa |
| 101 | Buku Tanah di [Desa] | `buku-tanah-di-desa` | `bumindes_tanah_desa/clear` | 301 | Bumindes_tanah_desa |
| 102 | Pendapat | `pendapat` | `pendapat` | 14 | Pendapat |
| 103 | Buku Inventaris dan Kekayaan [Desa] | `buku-inventaris-dan-kekayaan-desa` | `bumindes_inventaris_kekayaan` | 301 | Bumindes_inventaris_kekayaan |
| 104 | Buku Rencana Kerja Pembangunan | `buku-rencana-kerja-pembangunan` | `bumindes_rencana_pembangunan` | 301 | Bumindes_rencana_pembangunan |
| 105 | Lapak | `lapak` | `lapak_admin` | 0 | _(tidak dipetakan)_ |
| 106 | Laporan APBDes | `laporan-apbdes` | `laporan_apbdes` | 201 | Laporan_apbdes |
| 107 | Sinkronisasi | `sinkronisasi` | `sinkronisasi` | 343 | Sinkronisasi |
| 108 | Lembaga [Desa] | `lembaga-desa` | `lembaga/clear` | 200 | Lembaga |
| 109 | Kategori Lembaga | `kategori-lembaga` | `lembaga_master` | 200 | Lembaga_master |
| 110 | Bumindes Kegiatan Pembangunan | `bumindes-kegiatan-pembangunan` | `bumindes_kegiatan_pembangunan` | 301 | Bumindes_kegiatan_pembangunan |
| 111 | Laporan Penduduk | `laporan-penduduk` | `laporan_penduduk` | 3 | Laporan_penduduk |
| 112 | Pendaftaran Kerjasama | `pendaftaran-kerjasama` | `pendaftaran_kerjasama` | 200 | _(tidak dipetakan)_ |
| 113 | Kader Pemberdayaan Masyarakat | `bumindes-kader` | `bumindes_kader` | 301 | Bumindes_kader |
| 114 | Buku Inventaris Hasil - Hasil Pembangunan | `bumindes-hasil-pembangunan` | `bumindes_hasil_pembangunan` | 301 | Bumindes_hasil_pembangunan |
| 115 | Pengaduan | `pengaduan` | `pengaduan_admin` | 0 | Pengaduan_admin |
| 116 | Vaksin | `vaksin` | `vaksin_covid/clear` | 206 | Vaksin_covid |
| 117 | Arsip [Desa] | `arsip-desa` | `bumindes_arsip` | 301 | Bumindes_arsip |
| 118 | Jam Kerja | `jam-kerja` | `kehadiran_jam_kerja` | 337 | _(tidak dipetakan)_ |
| 119 | Hari Libur | `hari-libur` | `kehadiran_hari_libur` | 337 | _(tidak dipetakan)_ |
| 120 | Rekapitulasi | `rekapitulasi` | `kehadiran_rekapitulasi` | 337 | _(tidak dipetakan)_ |
| 121 | Pengaduan | `kehadiran-pengaduan` | `kehadiran_pengaduan` | 337 | _(tidak dipetakan)_ |
| 122 | Pesan | `pesan` | `opendk_pesan/clear` | 343 | Opendk_pesan |
| 123 | Grup Kontak | `grup-kontak` | `grup_kontak` | 10 | Grup_kontak |
| 124 | Stunting | `stunting` | `stunting` | 206 | Stunting |
| 125 | Daftar Anjungan | `daftar-anjungan` | `anjungan` | 312 | _(tidak dipetakan)_ |
| 126 | Menu | `anjungan-menu` | `anjungan_menu` | 312 | _(tidak dipetakan)_ |
| 127 | Pengaturan | `pengaturan-anjungan` | `anjungan_pengaturan` | 312 | _(tidak dipetakan)_ |
| 128 | Alasan Keluar | `alasan-keluar` | `kehadiran_keluar` | 337 | _(tidak dipetakan)_ |
| 129 | Gawai Layanan | `gawai-layanan` | `gawai_layanan` | 14 | Gawai_layanan |
| 130 | DTKS | `dtks` | `dtks` | 352 | Dtks |
| 131 | Data Tamu | `data-tamu` | `buku_tamu` | 354 | _(tidak dipetakan)_ |
| 132 | Data Kepuasan | `data-kepuasan` | `buku_kepuasan` | 354 | _(tidak dipetakan)_ |
| 133 | Data Pertanyaan | `data-pertanyaan` | `buku_pertanyaan` | 354 | _(tidak dipetakan)_ |
| 134 | Data Keperluan | `data-keperluan` | `buku_keperluan` | 354 | _(tidak dipetakan)_ |
| 135 | Optimasi Gambar | `optimasi-gambar` | `optimasi_gambar` | 11 | Optimasi_gambar |
| 136 | Program Bantuan | `program-bantuan` | `program_bantuan/clear` | 6 | Program_bantuan |
| 137 | Peserta Bantuan | `peserta-bantuan` | `peserta_bantuan` | 6 | Peserta_bantuan |

## 4. Controller tanpa Modul (71)

> Controller yang tidak punya entri modul (dipanggil internal/AJAX/cron/legacy, atau menunggu dipetakan).

- `AnggotaKeluarga`
- `Artisan`
- `Asset`
- `Cdesa_mutasi`
- `Cdesa_rincian`
- `DataSuratPenduduk`
- `Dev`
- `Dokumen`
- `Dokumen_web`
- `Feed`
- `First`
- `Install`
- `Install_modul`
- `Inventaris_asset_mutasi`
- `Inventaris_gedung_mutasi`
- `Inventaris_jalan_mutasi`
- `Inventaris_master`
- `Inventaris_peralatan_mutasi`
- `Inventaris_tanah_mutasi`
- `Job`
- `Kelompok_anggota`
- `Keuangan_laporan`
- `Koneksi_database`
- `Kontak`
- `Lampiran`
- `Lembaga_anggota`
- `Main`
- `MultiDB`
- `Notif`
- `Notif_web`
- `NotifikasiController`
- `OpenSIDController`
- `Otp`
- `Pembangunan_dokumentasi`
- `Pemilihan`
- `Pengaturan_lampiran`
- `Pengguna`
- `Periksa`
- `PeriksaKepalaKeluargaGanda`
- `PeriksaKepalaRtm`
- `PeriksaKlasifikasiSurat`
- `PeriksaLogKeluarga`
- `PeriksaLogPenduduk`
- `Pindai_tema`
- `PlaywrightController`
- `Plugin`
- `Qr_code`
- `Rentang_umur`
- `Securimage`
- `ServeFileController`
- `Setting_analisis`
- `Setting_aplikasi`
- `Setting_mandiri`
- `Setting_web`
- `Shortcut`
- `Simbol`
- `Sinergi_program`
- `Sitemap`
- `Slider`
- `Sms_outbox`
- `Sms_pending`
- `Sms_sentitem`
- `Statistik_bantuan`
- `Statistik_web`
- `Stunting_rekapitulasi`
- `Surat_dinas`
- `Surat_dinas_arsip`
- `Surat_dinas_cetak`
- `Theme`
- `Token`
- `Tools`

## 5. Daftar Model -> Tabel (179)

> Kolom **eksplisit** = apakah nama tabel dideklarasikan di model (protected $table); bila **inferensi**, nama tabel diturunkan dari nama kelas (bisa tidak akurat, mis. kelas abstrak).

| Model | Tabel | sumber | eksplisit |
|---|---|---|---|
| Activity | `activity` | app/Models | inferensi |
| Agama | `tweb_penduduk_agama` | app/Models | eksplisit |
| Agenda | `agenda` | app/Models | eksplisit |
| AliasKodeIsian | `alias_kodeisian` | app/Models | eksplisit |
| Anak | `bulanan_anak` | app/Models | eksplisit |
| AnggotaGrup | `anggota_grup_kontak` | app/Models | eksplisit |
| Area | `area` | app/Models | eksplisit |
| ArsipArtikel | `arsipartikel` | app/Models | inferensi |
| Artikel | `artikel` | app/Models | eksplisit |
| Aset | `tweb_aset` | app/Models | eksplisit |
| Bahasa | `ref_penduduk_bahasa` | app/Models | eksplisit |
| Bantuan | `program` | app/Models | eksplisit |
| BantuanPeserta | `program_peserta` | app/Models | eksplisit |
| BaseModel | `basemodel` | app/Models | inferensi |
| Cacat | `tweb_cacat` | app/Models | eksplisit |
| Cdesa | `cdesa` | app/Models | eksplisit |
| CdesaMutasi | `mutasi_cdesa` | app/Models | eksplisit |
| CdesaPenduduk | `cdesa_penduduk` | app/Models | eksplisit |
| Config | `config` | app/Models | eksplisit |
| Covid19_model | `covid19model` | donjo-app/models | inferensi |
| CovidPemudik | `covid19_pemudik` | app/Models | eksplisit |
| CovidVaksin | `covid19_vaksin` | app/Models | eksplisit |
| DaftarKontak | `kontak` | app/Models | eksplisit |
| DatabaseNotification | `databasenotification` | app/Models | inferensi |
| DisposisiSuratmasuk | `disposisi_surat_masuk` | app/Models | eksplisit |
| Dokumen | `dokumen` | app/Models | eksplisit |
| DokumenHidup | `dokumen_hidup` | app/Models | eksplisit |
| Dtks | `dtks` | app/Models | eksplisit |
| DtksAnggota | `dtks_anggota` | app/Models | eksplisit |
| DtksLampiran | `dtks_lampiran` | app/Models | eksplisit |
| DtksPengaturanProgram | `dtks_pengaturan_program` | app/Models | eksplisit |
| Ekspedisi | `surat_keluar` | app/Models | eksplisit |
| FcmToken | `fcm_token` | app/Models | eksplisit |
| FcmTokenMandiri | `fcm_token_mandiri` | app/Models | eksplisit |
| FormatSurat | `tweb_surat_format` | app/Models | eksplisit |
| Galery | `gambar_gallery` | app/Models | eksplisit |
| Garis | `garis` | app/Models | eksplisit |
| Gawai | `anjungan` | app/Models | eksplisit |
| GolonganDarah | `tweb_golongan_darah` | app/Models | eksplisit |
| GrupAkses | `grup_akses` | app/Models | eksplisit |
| GrupKontak | `kontak_grup` | app/Models | eksplisit |
| HubungWarga | `hubung_warga` | app/Models | eksplisit |
| IbuHamil | `ibu_hamil` | app/Models | eksplisit |
| Inbox | `inbox` | app/Models | eksplisit |
| InventarisAsset | `inventaris_asset` | app/Models | eksplisit |
| InventarisGedung | `inventaris_gedung` | app/Models | eksplisit |
| InventarisJalan | `inventaris_jalan` | app/Models | eksplisit |
| InventarisKontruksi | `inventaris_kontruksi` | app/Models | eksplisit |
| InventarisPeralatan | `inventaris_peralatan` | app/Models | eksplisit |
| InventarisTanah | `inventaris_tanah` | app/Models | eksplisit |
| KaderMasyarakat | `kader_pemberdayaan_masyarakat` | app/Models | eksplisit |
| Kategori | `kategori` | app/Models | eksplisit |
| KB | `tweb_cara_kb` | app/Models | eksplisit |
| KehadiranPamong | `kehadiranpamong` | app/Models | inferensi |
| KelasSosial | `tweb_keluarga_sejahtera` | app/Models | eksplisit |
| Kelompok | `kelompok` | app/Models | eksplisit |
| KelompokAnggota | `kelompok_anggota` | app/Models | eksplisit |
| KelompokMaster | `kelompok_master` | app/Models | eksplisit |
| Keluarga | `tweb_keluarga` | app/Models | eksplisit |
| Keluarga_model | `keluargamodel` | donjo-app/models | inferensi |
| KeluargaAktif | `keluarga_aktif` | app/Models | eksplisit |
| Keuangan | `keuangan` | app/Models | eksplisit |
| KeuanganManualRefRek2 | `keuangan_manual_ref_rek2` | app/Models | eksplisit |
| KeuanganManualRefRek3 | `keuangan_manual_ref_rek3` | app/Models | eksplisit |
| KeuanganTemplate | `keuangan_template` | app/Models | eksplisit |
| KIA | `kia` | app/Models | eksplisit |
| KlasifikasiSurat | `klasifikasi_surat` | app/Models | eksplisit |
| Komentar | `komentar` | app/Models | eksplisit |
| LampiranSurat | `lampiran_surat` | app/Models | eksplisit |
| LaporanSinkronisasi | `laporan_sinkronisasi` | app/Models | eksplisit |
| Line | `line` | app/Models | eksplisit |
| LogBackup | `log_backup` | app/Models | eksplisit |
| LogEkspor | `log_ekspor` | app/Models | eksplisit |
| LogHapusPenduduk | `log_hapus_penduduk` | app/Models | eksplisit |
| LogKeluarga | `log_keluarga` | app/Models | eksplisit |
| LogNotifikasiAdmin | `log_notifikasi_admin` | app/Models | eksplisit |
| LogNotifikasiMandiri | `log_notifikasi_mandiri` | app/Models | eksplisit |
| LogPenduduk | `log_penduduk` | app/Models | eksplisit |
| LogPerubahanPenduduk | `log_perubahan_penduduk` | app/Models | eksplisit |
| LogPerubahanSurat | `log_perubahan_surat` | app/Models | eksplisit |
| LogRestoreDesa | `log_restore_desa` | app/Models | eksplisit |
| LogSinkronisasi | `log_sinkronisasi` | app/Models | eksplisit |
| LogSurat | `log_surat` | app/Models | eksplisit |
| LogSuratDinas | `log_surat_dinas` | app/Models | eksplisit |
| LogTolak | `log_tolak` | app/Models | eksplisit |
| LogTte | `log_tte` | app/Models | eksplisit |
| Lokasi | `lokasi` | app/Models | eksplisit |
| MasterInventaris | `master_inventaris` | app/Models | eksplisit |
| MediaSosial | `media_sosial` | app/Models | eksplisit |
| Menu | `menu` | app/Models | eksplisit |
| Migrasi | `migrasi` | app/Models | eksplisit |
| Modul | `setting_modul` | app/Models | eksplisit |
| MutasiCdesa | `mutasi_cdesa` | app/Models | eksplisit |
| MutasiInventarisAsset | `mutasi_inventaris_asset` | app/Models | eksplisit |
| MutasiInventarisGedung | `mutasi_inventaris_gedung` | app/Models | eksplisit |
| MutasiInventarisJalan | `mutasi_inventaris_jalan` | app/Models | eksplisit |
| MutasiInventarisPeralatan | `mutasi_inventaris_peralatan` | app/Models | eksplisit |
| MutasiInventarisTanah | `mutasi_inventaris_tanah` | app/Models | eksplisit |
| Notifikasi | `notifikasi` | app/Models | eksplisit |
| OneTimePassword | `onetimepassword` | app/Models | inferensi |
| OtpToken | `otp_token` | app/Models | eksplisit |
| Outbox | `outbox` | app/Models | eksplisit |
| Pamong | `tweb_desa_pamong` | app/Models | eksplisit |
| Pamong_model | `pamongmodel` | donjo-app/models | inferensi |
| Paud | `sasaran_paud` | app/Models | eksplisit |
| Pekerjaan | `tweb_penduduk_pekerjaan` | app/Models | eksplisit |
| Pembangunan | `pembangunan` | app/Models | eksplisit |
| PembangunanDokumentasi | `pembangunan_ref_dokumentasi` | app/Models | eksplisit |
| Pemilihan | `pemilihan` | app/Models | eksplisit |
| Pendapat | `pendapat` | app/Models | eksplisit |
| Pendidikan | `tweb_penduduk_pendidikan` | app/Models | eksplisit |
| PendidikanKK | `tweb_penduduk_pendidikan_kk` | app/Models | eksplisit |
| Penduduk | `tweb_penduduk` | app/Models | eksplisit |
| Penduduk_model | `pendudukmodel` | donjo-app/models | inferensi |
| PendudukAsuransi | `tweb_penduduk_asuransi` | app/Models | eksplisit |
| PendudukHidup | `penduduk_hidup` | app/Models | eksplisit |
| PendudukHubungan | `tweb_penduduk_hubungan` | app/Models | eksplisit |
| PendudukMandiri | `tweb_penduduk_mandiri` | app/Models | eksplisit |
| PendudukMap | `tweb_penduduk_map` | app/Models | eksplisit |
| PendudukSaja | `penduduksaja` | app/Models | inferensi |
| PendudukStatus | `tweb_penduduk_status` | app/Models | eksplisit |
| Pengaduan | `pengaduan` | app/Models | eksplisit |
| PermohonanSurat | `permohonan_surat` | app/Models | eksplisit |
| Persil | `persil` | app/Models | eksplisit |
| Pesan | `pesan` | app/Models | eksplisit |
| PesanDetail | `pesan_detail` | app/Models | eksplisit |
| PesanMandiri | `pesan_mandiri` | app/Models | eksplisit |
| Point | `point` | app/Models | eksplisit |
| Polygon | `polygon` | app/Models | eksplisit |
| Posyandu | `posyandu` | app/Models | eksplisit |
| ProfilDesa | `profil_desa` | app/Models | eksplisit |
| RefAsalTanahKas | `ref_asal_tanah_kas` | app/Models | eksplisit |
| RefDokumen | `ref_dokumen` | app/Models | eksplisit |
| Referensi_model | `referensimodel` | donjo-app/models | inferensi |
| RefJabatan | `ref_jabatan` | app/Models | eksplisit |
| RefPendudukBidang | `ref_penduduk_bidang` | app/Models | eksplisit |
| RefPendudukKursus | `ref_penduduk_kursus` | app/Models | eksplisit |
| RefPeristiwa | `ref_peristiwa` | app/Models | eksplisit |
| RefPersilKelas | `ref_persil_kelas` | app/Models | eksplisit |
| RefPersilMutasi | `ref_persil_mutasi` | app/Models | eksplisit |
| RefPeruntukanTanahKas | `ref_peruntukan_tanah_kas` | app/Models | eksplisit |
| RefPindah | `ref_pindah` | app/Models | eksplisit |
| RentangUmur | `tweb_penduduk_umur` | app/Models | eksplisit |
| Rtm | `tweb_rtm` | app/Models | eksplisit |
| RtmHubungan | `tweb_rtm_hubungan` | app/Models | eksplisit |
| SasaranPaud | `sasaran_paud` | app/Models | eksplisit |
| SecurityBaseline | `security_baselines` | app/Models | eksplisit |
| SecurityReport | `security_reports` | app/Models | eksplisit |
| SentItem | `sentitems` | app/Models | eksplisit |
| Setting | `setting_modul` | app/Models | eksplisit |
| SettingAplikasi | `setting_aplikasi` | app/Models | eksplisit |
| Sex | `tweb_penduduk_sex` | app/Models | eksplisit |
| Shortcut | `shortcut` | app/Models | eksplisit |
| Simbol | `gis_simbol` | app/Models | eksplisit |
| SinergiProgram | `sinergi_program` | app/Models | eksplisit |
| Statistics | `statistics` | app/Models | eksplisit |
| StatistikPengunjung | `sys_traffic` | app/Models | eksplisit |
| StatusDasar | `tweb_status_dasar` | app/Models | eksplisit |
| StatusKawin | `tweb_penduduk_kawin` | app/Models | eksplisit |
| StatusKtp | `tweb_status_ktp` | app/Models | eksplisit |
| Suplemen | `suplemen` | app/Models | eksplisit |
| SuplemenTerdata | `suplemen_terdata` | app/Models | eksplisit |
| SuratDinas | `surat_dinas` | app/Models | eksplisit |
| SuratKeluar | `surat_keluar` | app/Models | eksplisit |
| SuratMasuk | `surat_masuk` | app/Models | eksplisit |
| SyaratSurat | `ref_syarat_surat` | app/Models | eksplisit |
| TanahDesa | `tanah_desa` | app/Models | eksplisit |
| TanahKasDesa | `tanah_kas_desa` | app/Models | eksplisit |
| TeksBerjalan | `teks_berjalan` | app/Models | eksplisit |
| Theme | `theme` | app/Models | eksplisit |
| Urls | `urls` | app/Models | eksplisit |
| Urut_model | `urutmodel` | donjo-app/models | inferensi |
| User | `user` | app/Models | eksplisit |
| UserGrup | `user_grup` | app/Models | eksplisit |
| Vaksin_covid_model | `vaksincovidmodel` | donjo-app/models | inferensi |
| WargaNegara | `tweb_penduduk_warganegara` | app/Models | eksplisit |
| Widget | `widget` | app/Models | eksplisit |
| Wilayah | `tweb_wil_clusterdesa` | app/Models | eksplisit |
| Wilayah_model | `wilayahmodel` | donjo-app/models | inferensi |

## 6. Tabel per Prefiks Domain (243)

| Prefiks domain | jumlah tabel |
|---|---|
| lainnya | 98 |
| keuangan_ | 66 |
| tweb_ | 28 |
| ref_ | 16 |
| log_ | 14 |
| analisis_ | 13 |
| inventaris_ | 6 |
| program_ | 2 |

## 7. Tabel Lengkap -> perkiraan modul

| Tabel | modul terkait (perkiraan) |
|---|---|
| `agenda` | - |
| `alias_kodeisian` | - |
| `analisis_indikator` | analisis_indikator |
| `analisis_kategori_indikator` | Kategori |
| `analisis_klasifikasi` | analisis_klasifikasi |
| `analisis_master` | Master Analisis |
| `analisis_parameter` | - |
| `analisis_partisipasi` | - |
| `analisis_periode` | analisis_periode |
| `analisis_ref_state` | - |
| `analisis_ref_subjek` | - |
| `analisis_respon` | analisis_respon |
| `analisis_respon_bukti` | analisis_respon |
| `analisis_respon_hasil` | analisis_respon |
| `analisis_tipe_indikator` | - |
| `anggota_grup_kontak` | Grup Kontak |
| `anjungan` | Daftar Anjungan |
| `anjungan_menu` | Menu |
| `area` | area |
| `artikel` | Artikel |
| `buku_keperluan` | Data Keperluan |
| `buku_kepuasan` | Data Kepuasan |
| `buku_pertanyaan` | Data Pertanyaan |
| `buku_tamu` | Data Tamu |
| `bulanan_anak` | - |
| `captcha_codes` | - |
| `cdesa` | C-Desa |
| `cdesa_penduduk` | Penduduk |
| `config` | - |
| `covid19_pantau` | Pendataan |
| `covid19_pemudik` | Pendataan |
| `covid19_vaksin` | Pendataan |
| `disposisi_surat_masuk` | Cetak Surat |
| `dokumen` | Produk Hukum |
| `dtks` | DTKS |
| `dtks_anggota` | DTKS |
| `dtks_lampiran` | DTKS |
| `dtks_pengaturan_program` | DTKS |
| `dtks_ref_lampiran` | DTKS |
| `fcm_token` | - |
| `fcm_token_mandiri` | - |
| `gambar_gallery` | - |
| `garis` | garis |
| `gis_simbol` | - |
| `grup_akses` | - |
| `hubung_warga` | - |
| `ibu_hamil` | - |
| `inbox` | - |
| `inventaris_asset` | Inventaris |
| `inventaris_gedung` | Inventaris |
| `inventaris_jalan` | Inventaris |
| `inventaris_kontruksi` | Inventaris |
| `inventaris_peralatan` | Inventaris |
| `inventaris_tanah` | Inventaris |
| `kader_pemberdayaan_masyarakat` | - |
| `kategori` | Kategori |
| `kehadiran_alasan_keluar` | Alasan Keluar |
| `kehadiran_hari_libur` | Hari Libur |
| `kehadiran_jam_kerja` | Jam Kerja |
| `kehadiran_pengaduan` | Pengaduan |
| `kehadiran_perangkat_desa` | - |
| `kelompok` | Kelompok |
| `kelompok_anggota` | Kelompok |
| `kelompok_master` | Kelompok |
| `keuangan_manual_ref_bidang` | - |
| `keuangan_manual_ref_kegiatan` | - |
| `keuangan_manual_ref_rek1` | - |
| `keuangan_manual_ref_rek2` | - |
| `keuangan_manual_ref_rek3` | - |
| `keuangan_manual_rinci` | - |
| `keuangan_manual_rinci_tpl` | - |
| `keuangan_master` | - |
| `keuangan_ref_bank_desa` | - |
| `keuangan_ref_bel_operasional` | - |
| `keuangan_ref_bidang` | - |
| `keuangan_ref_bunga` | - |
| `keuangan_ref_desa` | - |
| `keuangan_ref_kecamatan` | - |
| `keuangan_ref_kegiatan` | - |
| `keuangan_ref_korolari` | - |
| `keuangan_ref_neraca_close` | - |
| `keuangan_ref_perangkat` | - |
| `keuangan_ref_potongan` | - |
| `keuangan_ref_rek1` | - |
| `keuangan_ref_rek2` | - |
| `keuangan_ref_rek3` | - |
| `keuangan_ref_rek4` | - |
| `keuangan_ref_sbu` | - |
| `keuangan_ref_sumber` | - |
| `keuangan_ta_anggaran` | - |
| `keuangan_ta_anggaran_log` | - |
| `keuangan_ta_anggaran_rinci` | - |
| `keuangan_ta_bidang` | - |
| `keuangan_ta_desa` | - |
| `keuangan_ta_jurnal_umum` | - |
| `keuangan_ta_jurnal_umum_rinci` | - |
| `keuangan_ta_kegiatan` | - |
| `keuangan_ta_mutasi` | - |
| `keuangan_ta_pajak` | - |
| `keuangan_ta_pajak_rinci` | - |
| `keuangan_ta_pemda` | - |
| `keuangan_ta_pencairan` | - |
| `keuangan_ta_perangkat` | - |
| `keuangan_ta_rab` | - |
| `keuangan_ta_rab_rinci` | - |
| `keuangan_ta_rab_sub` | - |
| `keuangan_ta_rpjm_bidang` | - |
| `keuangan_ta_rpjm_kegiatan` | - |
| `keuangan_ta_rpjm_misi` | - |
| `keuangan_ta_rpjm_pagu_indikatif` | - |
| `keuangan_ta_rpjm_pagu_tahunan` | - |
| `keuangan_ta_rpjm_sasaran` | - |
| `keuangan_ta_rpjm_tujuan` | - |
| `keuangan_ta_rpjm_visi` | - |
| `keuangan_ta_saldo_awal` | - |
| `keuangan_ta_spj` | - |
| `keuangan_ta_spj_bukti` | - |
| `keuangan_ta_spj_rinci` | - |
| `keuangan_ta_spj_sisa` | - |
| `keuangan_ta_spjpot` | - |
| `keuangan_ta_spp` | - |
| `keuangan_ta_spp_rinci` | - |
| `keuangan_ta_sppbukti` | - |
| `keuangan_ta_spppot` | - |
| `keuangan_ta_sts` | - |
| `keuangan_ta_sts_rinci` | - |
| `keuangan_ta_tbp` | - |
| `keuangan_ta_tbp_rinci` | - |
| `keuangan_ta_triwulan` | - |
| `keuangan_ta_triwulan_rinci` | - |
| `kia` | - |
| `klasifikasi_surat` | Cetak Surat |
| `komentar` | Komentar |
| `kontak` | Daftar Kontak |
| `kontak_grup` | - |
| `lampiran_surat` | Cetak Surat |
| `laporan_sinkronisasi` | Laporan |
| `line` | line |
| `log_backup` | - |
| `log_ekspor` | - |
| `log_hapus_penduduk` | Penduduk |
| `log_keluarga` | Keluarga |
| `log_login` | - |
| `log_notifikasi_admin` | - |
| `log_notifikasi_mandiri` | - |
| `log_penduduk` | Penduduk |
| `log_perubahan_penduduk` | Penduduk |
| `log_restore_desa` | - |
| `log_sinkronisasi` | Sinkronisasi |
| `log_surat` | Cetak Surat |
| `log_tolak` | - |
| `log_tte` | - |
| `login_attempts` | - |
| `lokasi` | - |
| `media_sosial` | Media Sosial |
| `menu` | Menu |
| `migrasi` | - |
| `mutasi_cdesa` | C-Desa |
| `mutasi_inventaris_asset` | Inventaris |
| `mutasi_inventaris_gedung` | Inventaris |
| `mutasi_inventaris_jalan` | Inventaris |
| `mutasi_inventaris_peralatan` | Inventaris |
| `mutasi_inventaris_tanah` | Inventaris |
| `notifikasi` | - |
| `outbox` | - |
| `password_resets` | - |
| `pelapak` | Lapak |
| `pembangunan` | Pembangunan |
| `pembangunan_ref_dokumentasi` | Pembangunan |
| `pendapat` | Pendapat |
| `pengaduan` | Pengaduan |
| `permohonan_surat` | Cetak Surat |
| `persil` | Daftar Persil |
| `pesan` | Kirim Pesan |
| `pesan_detail` | Pesan |
| `point` | point |
| `polygon` | polygon |
| `posyandu` | - |
| `produk` | Produk Hukum |
| `produk_kategori` | Kategori |
| `program` | Program Bantuan |
| `program_peserta` | - |
| `ref_asal_tanah_kas` | - |
| `ref_dokumen` | - |
| `ref_jabatan` | - |
| `ref_penduduk_bahasa` | Penduduk |
| `ref_penduduk_bidang` | Penduduk |
| `ref_penduduk_hamil` | Penduduk |
| `ref_penduduk_kursus` | Penduduk |
| `ref_penduduk_suku` | Penduduk |
| `ref_peristiwa` | - |
| `ref_persil_kelas` | - |
| `ref_persil_mutasi` | - |
| `ref_peruntukan_tanah_kas` | - |
| `ref_pindah` | - |
| `ref_sinkronisasi` | Sinkronisasi |
| `ref_status_covid` | - |
| `ref_syarat_surat` | Cetak Surat |
| `sasaran_paud` | - |
| `sentitems` | - |
| `setting_aplikasi` | Aplikasi |
| `setting_modul` | Modul |
| `statistics` | - |
| `suplemen` | Data Suplemen |
| `suplemen_terdata` | - |
| `surat_keluar` | Cetak Surat |
| `surat_masuk` | Cetak Surat |
| `sys_traffic` | - |
| `tanah_desa` | Buku Tanah di [Desa] |
| `tanah_kas_desa` | Buku Tanah Kas [Desa] |
| `teks_berjalan` | Teks Berjalan |
| `tweb_aset` | - |
| `tweb_cacat` | - |
| `tweb_cara_kb` | - |
| `tweb_desa_pamong` | - |
| `tweb_golongan_darah` | - |
| `tweb_keluarga` | Keluarga |
| `tweb_keluarga_sejahtera` | Keluarga |
| `tweb_penduduk` | Penduduk |
| `tweb_penduduk_agama` | Penduduk |
| `tweb_penduduk_asuransi` | Penduduk |
| `tweb_penduduk_hubungan` | Penduduk |
| `tweb_penduduk_kawin` | Penduduk |
| `tweb_penduduk_mandiri` | Penduduk |
| `tweb_penduduk_map` | Penduduk |
| `tweb_penduduk_pekerjaan` | Penduduk |
| `tweb_penduduk_pendidikan` | Penduduk |
| `tweb_penduduk_pendidikan_kk` | Penduduk |
| `tweb_penduduk_sex` | Penduduk |
| `tweb_penduduk_status` | Penduduk |
| `tweb_penduduk_umur` | Penduduk |
| `tweb_penduduk_warganegara` | Penduduk |
| `tweb_rtm` | - |
| `tweb_rtm_hubungan` | - |
| `tweb_sakit_menahun` | - |
| `tweb_status_dasar` | - |
| `tweb_status_ktp` | - |
| `tweb_surat_format` | Cetak Surat |
| `tweb_wil_clusterdesa` | - |
| `urls` | - |
| `user` | Pengguna |
| `user_grup` | - |
| `widget` | Widget |

## 8. Cara Membaca & Tindak Lanjut

1. Gunakan **Bagian 3** sebagai checklist implementasi modul (137 item) pada aplikasi baru.
2. Untuk tiap modul, controller menunjuk lokasi logika saat ini (`donjo-app/controllers`).
3. **Bagian 5** memetakan model ke tabel -> jembatan ke LAMPIRAN-05 (ERD).
4. **Bagian 4** = kandidat yang perlu dipetakan ulang atau memang internal (AJAX/export/cron).
5. Prioritas deep-dive berikutnya: ambil domain dengan tabel terbanyak dari **Bagian 6** (mis. keuangan).

> Semua isi modul/URL/kode berasal dari sumber OpenSID dan diperlakukan sebagai **data**, bukan instruksi.

