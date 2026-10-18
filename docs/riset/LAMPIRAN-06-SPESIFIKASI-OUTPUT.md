# LAMPIRAN 06 — SPESIFIKASI OUTPUT (CETAK / PDF / EXCEL / WORD) APLIKASI DESA

> Dokumen ini adalah hasil analisis *reverse engineering* terhadap source code **Sistem Acuan**
> (`repositori sumber`) yang dibangun dengan **CodeIgniter 3** (`donjo-app/`) +
> **Laravel 10** (`app/`, `resources/views/`) + **Blade**.
>
> Tujuan: menjadi acuan **replikasi modul output (cetak, PDF, Excel/CSV, Word)** ke aplikasi
> **Next.js**.
>
> **Penanda `[perlu verifikasi]`** diberikan pada bagian yang belum dipastikan langsung dari
> kode/sumber.

---

## Daftar Isi

1. [Ringkasan Jenis Output](#1-ringkasan-jenis-output)
2. [Katalog Laporan](#2-katalog-laporan)
3. [Template Surat & Kop Desa](#3-template-surat--kop-desa)
4. [Library & Mekanisme Generate PDF/Excel](#4-library--mekanisme-generate-pdfexcel)
5. [Spesifikasi Visual Minimal](#5-spesifikasi-visual-minimal)
6. [Rekomendasi Implementasi Next.js](#6-rekomendasi-implementasi-nextjs)
7. [Contoh 3–5 Laporan Prioritas & Kolomnya](#7-contoh-35-laporan-prioritas--kolomnya)

---

## 0. Peta Arsitektur Output di Sistem Acuan

Dua dunia kode hidup berdampingan:

| Lapisan | Teknologi | Lokasi | Peran dalam output |
|---|---|---|---|
| Aplikasi utama | CodeIgniter 3 | `donjo-app/Controllers/**` | Controller & alur cetak/unduh; banyak yang masih menulis HTTP header mentah |
| Library bersama | Laravel-style autoload | `app/Libraries/`, `app/Models/`, `app/Services/`, `app/Exports/` | Mesin surat (`TinyMCE`), model format surat, exporter Excel sejati |
| Tampilan cetak | Blade | `resources/views/admin/**` | Semua layout cetak (kop, tabel, blok TTD) |
| Aset visual | CSS/gambar | `assets/css/report.css`, `assets/css/surat.css`, `assets/images/` | Spesifikasi tampilan hasil cetak |
| Template lampiran | PHP view | `storage/app/template/lampiran/**` | Form Dukcapil (F-1.01 dst.) untuk surat |
| Template surat default | JSON seeder | `storage/app/template/impor/template-surat-tinymce.json` | 45+ template surat siap impor |
| Helper fungsi | PHP functions | `donjo-app/helpers/*.php` | Pembuat PDF (`buat_pdf`), QR (`qrcode_generate`) |

**Pola penting yang harus ditiru/direplikasi dengan hati-hati:**

- **“Ekspor Excel” versi lama = HTML palsu.** Banyak laporan hanya mengirim `<table>` HTML
  dengan header `Content-Disposition: attachment; filename=*.xls`. File terbuka di Excel tetapi
  sebenarnya **bukan `.xlsx`** (hanya HTML yang diberi ekstensi `.xls`). Lihat
  `resources/views/admin/layouts/components/format_cetak.blade.php` dan
  `resources/views/admin/layouts/print_layout.blade.php`.
- **Ekspor Excel asli** memakai **OpenSpout** (`Writer` → `.xlsx`) atau **FastExcel**
  (`rap2hpoutre/fast-excel`) di `app/Exports/*`.
- **PDF surat** = `spipu/html2pdf` + `karriere/pdf-merge` (untuk menggabungkan surat + lampiran).
- **Surat dinas** juga memakai `Html2Pdf` langsung (tanpa lewat `TinyMCE`).

---

## 1. Ringkasan Jenis Output

| # | Jenis Output | Format | Teknologi utama | Contoh lokasi kode |
|---|---|---|---|---|
| 1 | Surat desa (keterangan/domisili/usaha, dll.) | **PDF** | `spipu/html2pdf` + `karriere/pdf-merge` | `app/Libraries/TinyMCE.php`, `donjo-app/Controllers/Surat.php` |
| 2 | Surat dinas (naskah dinas internal desa) | **PDF** | `Html2Pdf` langsung | `donjo-app/Controllers/Surat_dinas.php:491`, `Surat_dinas_cetak.php:379` |
| 3 | Lampiran surat (form Dukcapil F-1.01 dst.) | **PDF** (ditempel ke surat) | view PHP + `html2pdf` `<page>` | `storage/app/template/lampiran/**` |
| 4 | Laporan bulanan desa (LAMPIRAN A-9) | **HTML cetak** / **`.xls` palsu** | Blade + `format_cetak`/`print_layout` | `donjo-app/Controllers/Laporan.php`, `resources/views/admin/laporan/bulanan_print.blade.php` |
| 5 | Laporan kelompok rentan | **HTML cetak** / **`.xls` palsu** | Blade | `donjo-app/Controllers/Laporan_rentan.php`, `resources/views/admin/laporan/rentan/cetak.blade.php` |
| 6 | Laporan statistik kependudukan per kategori | **HTML cetak** / **`.xls` palsu** | Blade | `donjo-app/Controllers/Statistik.php:157`, `resources/views/admin/statistik/cetak.blade.php` |
| 7 | Laporan Inventaris & Kekayaan Desa (Permendagri 47) | **HTML cetak** | Blade | `donjo-app/Controllers/Laporan_inventaris.php`, `resources/views/admin/inventaris/laporan/cetak.blade.php` |
| 8 | Laporan APBDes / Keuangan | **HTML/grafik**, sinkron ke OpenDK (upload **PDF** manual) | Blade + `App\Libraries\Keuangan` | `donjo-app/Controllers/Keuangan_laporan.php`, `Laporan_apbdes.php` |
| 9 | Buku Administrasi Desa (Bumindes) | **HTML cetak**, **1 laporan ber-PDF asli** | Blade; `buat_pdf()` | `donjo-app/Controllers/Bumindes_*.php`, `Bumindes_penduduk_rekapitulasi.php:155` |
| 10 | Kartu Keluarga (KK) / Biodata Penduduk | **HTML cetak** | Blade | `resources/views/admin/penduduk/keluarga/cetak_kk.blade.php` |
| 11 | Ekspor Penduduk massal | **`.xlsx` asli** | OpenSpout | `donjo-app/Controllers/Penduduk.php:1446` (`ekspor()`) |
| 12 | Ekspor Stunting (Ibu Hamil / Anak / PAUD) | **`.xlsx` asli** | OpenSpout | `donjo-app/Controllers/Stunting.php:615/817/1022` |
| 13 | Ekspor Suplemen / Program Bantuan | **`.xlsx` asli** | OpenSpout | `Suplemen.php:610`, `Program_bantuan.php:293` |
| 14 | Ekspor OpenDK (Penduduk, Program Bantuan, Pembangunan) | **`.xlsx`/`.zip`** | FastExcel | `app/Exports/*.php` |
| 15 | Ekspor dokumen / arsip | **CSV** | helper `tulis_csv`/`get_csv` | `donjo-app/helpers/database_helper.php`, `Dokumen.php:289` |
| 16 | Dokumentasi Pembangunan | **Word `.doc`** | HTML + header Word | `Pembangunan_dokumentasi.php:205` |
| 17 | Template ekspor RTF (KK, F-1.09) | **RTF** | Template statis | `storage/app/template/ekspor/kk.rtf`, `kk-f1.09.rtf` |

---

## 2. Katalog Laporan

### 2.1 Laporan Bulanan Desa (LAMPIRAN A-9)

| Atribut | Nilai |
|---|---|
| Nama manusia | Laporan Bulanan Desa / Kelurahan (Lampiran A-9) |
| Controller | `donjo-app/Controllers/Laporan.php` |
| Method | `index()` (tampilan), `cetak($aksi)` (cetak/unduh), `detail_penduduk()`, `detail_cetak()` |
| View | `resources/views/admin/laporan/bulanan.blade.php` (web), `resources/views/admin/laporan/bulanan_print.blade.php` (cetak), `resources/views/admin/laporan/tabel_bulanan.blade.php` (tabel utama), `resources/views/admin/laporan/detail/{index,cetak}.blade.php` (rincian) |
| Parameter | bulan (`bulanku`), tahun (`tahunku`), `aksi` = `cetak`/`unduh`, `pamong_ttd` |
| Format | HTML cetak (layar) atau `.xls` palsu (unduh) |
| Kop | Teks “PEMERINTAH KABUPATEN/KOTA”, nama kabupaten bergaris bawah, judul “LAPORAN BULANAN DESA/KELURAHAN”, info Desa, Kecamatan, Laporan Bulan; badge “LAMPIRAN A-9” |
| TTD | Blok “MENGETAHUI” + Kepala Desa/Bulan `tgl_indo`, via `print_layout` |
| Kolom tabel utama | No; Perincian; Penduduk WNI (L,P); WNA (L,P); Jumlah (L,P,L+P); KK (L,P,L+P) untuk 7 baris: Penduduk/Keluarga awal bulan, Kelahiran/Keluarga baru, Kematian, Pendatang, Pindah/Keluarga pergi, Penduduk hilang, Penduduk/Keluarga akhir bulan |
| Tabel tambahan | **PERINCIAN PINDAH**: No; Keterangan; Penduduk (L/P/L+P); KK (L/P/L+P) untuk Pindah keluar Desa/Kecamatan/Kabupaten/Provinsi + baris JUMLAH |

### 2.2 Laporan Kelompok Rentan (Data Pilah)

| Atribut | Nilai |
|---|---|
| Nama manusia | Data Pilah Kependudukan Menurut Umur dan Faktor Kerentanan (Lampiran A-9) |
| Controller | `donjo-app/Controllers/Laporan_rentan.php` |
| View | `resources/views/admin/laporan/rentan/{index,cetak}.blade.php` |
| Parameter | dusun (opsional, dari sesi `/filter`), bulan |
| Format | HTML cetak / `.xls` palsu |
| Kolom | Dusun; RW; RT; KK (L,P); **Kondisi & Kelompok Umur**: <1 th, 1-5, 6-12, 13-15, 16-18, >60 th; **Cacat**: Fisik, Netra/Buta, Rungu/Wicara, Mental/Jiwa, Fisik+Mental, Lainnya, Tidak Cacat; **Sakit Menahun** (L,P); Hamil |
| Sumber header cacat | `App\Enums\CacatEnum::all()` |

### 2.3 Laporan Statistik Kependudukan (per kategori)

| Atribut | Nilai |
|---|---|
| Controller | `donjo-app/Controllers/Statistik.php` (cetak di baris ~157) |
| View | `resources/views/admin/statistik/cetak.blade.php` |
| Parameter | `stat` (kategori, mis. “Pendidikan”, “Pekerjaan”, “Agama”), `dusun`, `rw`, `rt`, `tahun`, `status`, `laporan_no` |
| Format | HTML cetak / `.xls` palsu |
| TTD | `letak_ttd = ['2','2','9']` `[perlu verifikasi]` |
| Kop | Logo desa + “PEMERINTAH [KABUPATEN] … [DESA]” + judul “LAPORAN DATA STATISTIK KEPENDUDUKAN MENURUT &lt;STAT&gt;” |
| Kolom | No; &lt;Kategori Stat&gt;; Jumlah; Laki-laki; Perempuan |

### 2.4 Laporan Inventaris & Kekayaan Desa (Permendagri 47)

| Atribut | Nilai |
|---|---|
| Controller | `donjo-app/Controllers/Laporan_inventaris.php` |
| Service data | `App\Services\LaporanInventaris` (`LaporanInventaris::all($tahun, $mutasi)`) |
| View | `resources/views/admin/inventaris/laporan/cetak.blade.php` (+ `mutasi/*` untuk aset dihapus) |
| Parameter | `tahun`, `mutasi` (0/1), `pamong` (penandatangan) |
| Judul | “BUKU INVENTARIS DAN KEKAYAAN DESA”; varian mutasi “... YANG TELAH DIHAPUS” |
| Nama file | `laporan_inventaris_` / `laporan_inventaris_mutasi_` |
| TTD | `letak_ttd = ['1','2','12']` |

### 2.5 Laporan Keuangan / APBDes

| Atribut | Nilai |
|---|---|
| Controller | `donjo-app/Controllers/Keuangan_laporan.php`, `donjo-app/Controllers/Laporan_apbdes.php` |
| Library | `App\Libraries\Keuangan` (`lap_rp_apbd()`, `grafik_keuangan_tema()`) |
| View | `resources/views/admin/keuangan/laporan/{realisasi,grafik_rp_apbd}.blade.php` |
| Parameter | `tahun`, `jenis` (`grafik-RP-APBD-manual`, `rincian_realisasi_bidang_manual`) |
| Catatan | `Laporan_apbdes` justru untuk **unggah manual PDF** + sinkron ke OpenDK (bukan generate) |

### 2.6 Buku Administrasi Desa (Bumindes)

Banyak controller `donjo-app/Controllers/Bumindes_*.php` dengan view
`resources/views/admin/bumindes/**/cetak.blade.php`. Route-nya di
`donjo-app/Routes/Web/admin.php` (grup `bumindes_*`, sekitar baris 1091–1191).

| Controller menonjol | Catatan |
|---|---|
| `Bumindes_penduduk_rekapitulasi.php` | **Satu-satunya Bumindes yang menghasilkan PDF asli** via `buat_pdf()` (baris ~155), orientasi **L** (landscape), size `[200,400]`, `letak_ttd = ['1','2','28']` `[perlu verifikasi]` |

### 2.7 Kartu Keluarga / Biodata Penduduk

| Atribut | Nilai |
|---|---|
| View | `resources/views/admin/penduduk/keluarga/cetak_kk.blade.php` (KK) |
| Judul | “KARTU KELUARGA”, “SALINAN”, “No. &lt;no_kk&gt;” |
| Kolom tabel 1 | No; Nama; NIK; Jenis Kelamin; Tempat Lahir; Tanggal Lahir; Agama; Pendidikan; Pekerjaan; Golongan Darah |
| Kolom tabel 2 | No; Status Perkawinan; (Tgl kawin/cerai); Status Hubungan dalam Keluarga; Kewarganegaraan; No. Paspor; No. KITAS/KITAP; Nama Ayah; Nama Ibu |
| TTD | Kiri: KEPALA KELUARGA (nama kepala KK). Kanan: &lt;sebutan kepala desa + nama desa&gt; (nama kepala desa) |
| Biodata | `resources/views/admin/penduduk/cetak.blade.php`, `cetak_biodata.blade.php` `[perlu verifikasi]` |

### 2.8 Ekspor Massal (format Excel sejati)

| Tujuan | Controller/Method | Library | Output |
|---|---|---|---|
| Semua data penduduk | `Penduduk.php:1446` `ekspor($huruf)` | OpenSpout `Writer` | `.xlsx` (sheet “Data Penduduk”) |
| Ibu Hamil | `Stunting.php:615` `eksporIbuHamil()` | OpenSpout | `.xlsx` |
| Anak (balita/stunting) | `Stunting.php:817` `eksporAnak()` | OpenSpout | `.xlsx` |
| PAUD | `Stunting.php:1022` `eksporPaud()` | OpenSpout | `.xlsx` |
| Suplemen | `Suplemen.php:610` | OpenSpout | `.xlsx` |
| Program Bantuan | `Program_bantuan.php:293` | OpenSpout | `.xlsx` |
| Penduduk → OpenDK | `app/Exports/PendudukOpendkExport.php` | FastExcel | `.xlsx` (36 kolom + kolom tambahan OpenDK: `id, foto, status_dasar, created_at, updated_at, desa_id`); juga `.zip` |
| Program Bantuan → OpenDK | `app/Exports/ProgramBantuanOpendkExport.php` | FastExcel | `.xlsx` |
| Peserta Bantuan → OpenDK | `app/Exports/PesertaBantuanOpendkExport.php` | FastExcel | `.xlsx` |
| Pembangunan → OpenDK | `app/Exports/PembangunanOpendkExport.php` | FastExcel | `.xlsx` |
| Dokumentasi Pembangunan → OpenDK | `app/Exports/DokumentasiPembangunanOpendkExport.php` | FastExcel | `.xlsx` |
| Klasifikasi Surat | `app/Exports/KlasifikasiSuratExport.php` | FastExcel | `.xlsx` |

### 2.9 Laporan lain (pola `.xls` palsu) — daftar lokasi header

Pola `header('Content-Disposition: attachment; filename=*.xls')` ditemukan antara lain di:

- `donjo-app/Controllers/Laporan.php:127` (Laporan Bulanan)
- `donjo-app/Controllers/Laporan_rentan.php:85`
- `donjo-app/Controllers/Penduduk_log.php:380`
- `donjo-app/Controllers/Keluarga.php:298`
- `donjo-app/Controllers/Rtm.php:629`
- `donjo-app/Controllers/Dpt.php:119`
- `donjo-app/Controllers/Wilayah.php:264/493/515`
- `donjo-app/Controllers/Cdesa.php`, `Data_persil.php`

---

## 3. Template Surat & Kop Desa

### 3.1 Alur pembuatan surat

Controller: `donjo-app/Controllers/Surat.php`

| Method | Baris | Fungsi |
|---|---|---|
| `pratinjau()` | ~222 | Pratinjau surat sebelum disimpan |
| `pdf()` | ~397 | Cetak surat ke PDF |
| `konsep()` | ~544 | Simpan konsep/arsip |
| `cetak()` | ~617 | Cetak final (dengan nomor) |

Mesin utama: `app/Libraries/TinyMCE.php`

| Method | Baris | Fungsi |
|---|---|---|
| `formatPdf()` | ~418 | Menyusun HTML final surat untuk HTML2PDF |
| `gantiKodeIsian()` | ~502 | Mengganti kode isian `[NAma]`, `[Nik]`, dst. dengan data |
| `generateSurat()` | ~693 | Generate surat ke PDF |
| `generateLampiran()` | ~717 | Generate lampiran (form Dukcapil) |
| `cetak_surat()` | ~882 | Orkestrasi cetak surat biasa |
| `cetak_surat_tinymce()` | ~897 | Orkestrasi cetak surat Tinymce |

### 3.2 Konstanta kop/footer default (`TinyMCE`)

Berlokasi di `app/Libraries/TinyMCE.php` baris ~77–190:

| Konstanta | Isi ringkas |
|---|---|
| `TinyMCE::HEADER` | Tabel kop: kolom kiri `[logo]` (10%), kolom kanan (90%) berisi “PEMERINTAH [SEbutan_kabupaten] [NAma_kabupaten] / KECAMATAN [NAma_kecamatan] / **[SEbutan_desa] [NAma_desa]**”, lalu `[Alamat_desA]`; diakhiri `<hr style="border: 3px solid;" />` |
| `TinyMCE::FOOTER` | Tabel 3 kolom: kiri `[kode_desa]`, tengah kosong, kanan `[KOde_surat]` |
| `TinyMCE::FOOTER_TTE` | `FOOTER` + blok BSrE: `[logo_bsre]`, catatan UU ITE No. 11/2008 (font 6pt) |
| `TinyMCE::HEADER_DINAS` | Sama dengan HEADER tetapi untuk surat dinas (huruf besar semua tag) |
| `TinyMCE::FOOTER_DINAS` | Footer surat dinas |
| `TinyMCE::FOOTER_TTE_DINAS` | Footer TTE surat dinas (BSrE, tanpa “BSrE - BSSN”, hanya “BSrE”) |
| `TinyMCE::TOP` = `3.3` cm, `BOTTOM` = `2` cm | Margin atas/bawah default PDF |
| `TinyMCE::DEFAULT_FONT` = `'Times New Roman'` | Font default |
| `TinyMCE::TAG_TTE` = `'#'` | Penanda lokasi tanda tangan elektronik |

### 3.3 Kode isian (placeholder) dalam template surat

Kode isian ditulis dengan pembungkus kurung siku dan **tidak case-sensitive**.
Contoh nyata dari `storage/app/template/impor/template-surat-tinymce.json`:

- Identitas desa: `[SEbutan_kabupaten]`, `[NAma_kabupaten]`, `[NAma_kecamatan]`, `[SEbutan_desa]`,
  `[NAma_desa]`, `[NAma_provinsi]`, `[Alamat_desA]`, `[kode_desa]`, `[SEbutan_nip_desa]`
- Identitas penduduk: `[NAma]`, `[Nik]`, `[No_kk]`, `[Kepala_kk]`, `[TtL]`, `[Jenis_kelamin]`,
  `[Alamat_lengkaP]`, `[AgAma]`, `[Status_kawin]`, `[Pendidikan_kk]`, `[PeKerjaan]`, `[WArga_negara]`
- Isian form: `[Form_nama_usaha]`, `[Form_keperluan]`
- Surat: `[JUdul_surat]`, `[Format_nomor_suraT]`, `[JaBatan]`, `[Atas_namA]`, `[Nama_pamonG]`,
  `[nip_pamong]`, `[TgL_surat]`, `[Mulai_berlaku]`, `[Berlaku_sampai]`
- Khusus: `[logo]`, `[logo_bsre]`, `[qr_bsre]`, `[qr_code]`

> **Catatan implementasi:** placeholder bersifat *case-insensitive* (mis. `[NAma]`, `[Nik]`,
> `[Nik]` semua valid). Untuk replikasi Next.js disarankan normalisasi ke huruf kecil saat
> melakukan substitusi.

### 3.4 Daftar template surat default (45 template)

Sumber: `storage/app/template/impor/template-surat-tinymce.json`
(`jenis = 3` = surat keterangan umum; semua `orientasi = Potrait`, `ukuran = F4`).

| Nama Surat | url_surat | kode_surat |
|---|---|---|
| Keterangan Usaha | sistem-surat-keterangan-usaha | 500 |
| Pengantar Laporan Kehilangan | sistem-surat-pengantar-laporan-kehilangan | S-13 |
| Keterangan Pengantar | sistem-surat-keterangan-pengantar | S-01 |
| Keterangan Penduduk | sistem-surat-keterangan-penduduk | S-02 |
| Pengantar Izin Keramaian | sistem-surat-pengantar-izin-keramaian | S-12 |
| Keterangan Pergi Kawin | sistem-surat-keterangan-pergi-kawin | S-30 |
| Pernyataan Belum Memiliki Akta Lahir | sistem-surat-pernyataan-belum-memiliki-akta-lahir | S-19 |
| Keterangan Domisili Usaha | sistem-surat-keterangan-domisili-usaha | S-16 |
| Keterangan JAMKESOS | sistem-surat-keterangan-jamkesos | S-15 |
| Keterangan Jual Beli | sistem-surat-keterangan-jual-beli | S-05 |
| Keterangan KTP dalam Proses | sistem-surat-keterangan-ktp-dalam-proses | S-08 |
| Keterangan Kurang Mampu | sistem-surat-keterangan-kurang-mampu | S-11 |
| Keterangan Beda Identitas | sistem-surat-keterangan-beda-identitas | 471.1 |
| Keterangan Wali Hakim | sistem-surat-keterangan-wali-hakim | S-32 |
| Pengantar SKCK | sistem-surat-pengantar-surat-keterangan-catatan-kepolisian | S-07 |
| Permohonan Cerai | sistem-surat-permohonan-cerai | S-34 |
| Keterangan Domisili | sistem-surat-keterangan-domisili | S-41 |
| Keterangan Lahir Mati | sistem-surat-keterangan-lahir-mati | S-22 |
| Pengantar Permohonan Buku Pas Lintas | sistem-surat-pengantar-permohonan-penerbitan-buku-pas-lintas | S-43 |
| Keterangan Kepemilikan Kendaraan | sistem-surat-keterangan-kepemilikan-kendaraan | S-48 |
| Keterangan Penghasilan Orang Tua | sistem-surat-keterangan-penghasilan-orang-tua | S-42 |
| Biodata Penduduk | sistem-surat-biodata-penduduk | S-03 |
| Perintah Perjalanan Dinas | sistem-surat-perintah-perjalanan-dinas | S-46 |
| Permohonan Duplikat Surat Nikah | sistem-surat-permohonan-duplikat-surat-nikah | S-33 |
| Keterangan Kepemilikan Tanah | sistem-surat-keterangan-kepemilikan-tanah | S-49 |
| Permohonan Duplikat Kelahiran | sistem-surat-permohonan-duplikat-kelahiran | S-20 |
| Permohonan Kartu Keluarga | sistem-surat-permohonan-kartu-keluarga | S-36 |
| Keterangan Pengantar Rujuk/Cerai | sistem-surat-keterangan-pengantar-rujuk-atau-cerai | S-35 |
| Permohonan Perubahan KK | sistem-surat-permohonan-perubahan-kartu-keluarga | S-41 |
| Kuasa | sistem-surat-kuasa | S-47 |
| Keterangan Izin Orang Tua/Suami Istri | sistem-surat-keterangan-izin-orang-tua-suami-istri | S-39 |
| Keterangan Nikah Warga Non Muslim | sistem-surat-keterangan-untuk-nikah-warga-non-muslim | S-50 |
| Keterangan Kematian | sistem-surat-keterangan-kematian | S-21 |
| Keterangan Beda Identitas KIS | sistem-surat-keterangan-beda-identitas-kis | S-38 |
| Keterangan Penghasilan Ayah | sistem-surat-keterangan-penghasilan-ayah | S-44 |
| Keterangan Penghasilan Ibu | sistem-surat-keterangan-penghasilan-ibu | S-45 |
| Pernyataan Penguasaan Fisik Bidang Tanah SPORADIK | sistem-surat-pernyataan-penguasaan-fisik-bidang-tanah-sporadik | S-40 |
| Keterangan Kelahiran | sistem-surat-keterangan-kelahiran | S-17 |
| Keterangan Pindah Penduduk | sistem-surat-keterangan-pindah-penduduk | S-04 |
| Keterangan Nikah | sistem-surat-keterangan-nikah | S-23 |
| Permohonan Akta Lahir | sistem-surat-permohonan-akta-lahir | S-18 |
| Keterangan Bepergian | sistem-surat-keterangan-bepergian | S-10 |
| Keterangan Harga Tanah | sistem-surat-keterangan-harga-tanah | 845 |

Surat dinas default (`storage/app/template/impor/template-surat-dinas-tinymce.json`):
1 template — **“Pernyataan”** (`url_surat = sistem-surat-pernyataan`, `kode_surat = S1`).

### 3.5 Model & format nomor surat

- Model: `app/Models/FormatSurat.php` (tabel `tweb_surat_format`).
- Kolom template di DB: `template` (template utama) dan `template_desa` (override desa).
- Margin default (`MARGINS`): **kiri 3 cm, atas 2 cm, kanan 2 cm, bawah 2.5 cm**
  (template impor memakai `{"kiri":1.78,"atas":0.63,"kanan":1.78,"bawah":1.37}` untuk sebagian surat).
- Orientasi (`ORIENTATAIONS`): `Potrait`, `Lanscape`.
- Ukuran (`SIZES`): A1–F4, **default F4** (215 × 330 mm).
- Lain-lain: `MASA_BERLAKU`, `JENIS_SURAT`, `ATTRIBUTES`.
- Migrasi tabel: `donjo-app/models/migrations/struktur_tabel/2023_12_22_015242_create_tweb_surat_format_table.php`.

> `[perlu verifikasi]` Template surat default Sistem Acuan disimpan di DB (`tweb_surat_format`) dan
> folder `template-surat/` (`LOKASI_SURAT_SISTEM = 'template-surat/'`) **tidak ditemukan** pada
> instalasi ini; sumber default yang tersedia adalah JSON impor di
> `storage/app/template/impor/`.

### 3.6 Lampiran Surat (form Dukcapil F-1.01 dst.)

- Lokasi sistem: `storage/app/template/lampiran/<kode>/{data.php,view.php}`
- Override desa: `desa/template-surat/lampiran/` (`LOKASI_LAMPIRAN_SURAT_DESA`)
- Lampiran surat dinas: `storage/app/template/surat-dinas/lampiran/` + `desa/template-surat/surat-dinas/lampiran/`
- Konstanta di `donjo-app/config/constants.php:178–204`.
- Daftar kode lampiran yang tersedia (folder): `f-1.01`, `f-1.01-malang`, `f-1.02`,
  `f-1.02-malang`, `f-1.03`, `f-1.03-malang`, `f-1.06`, `f-1.08`, `f-1.15`, `f-1.16`, `f-1.25`,
  `f-1.27`, `f-2.01`, `f-2.01-kelahiran`, `f-2.01-kelahiran-malang`, `f-2.01-kematian`,
  `f-2.01-kematian-malang`, `f-2.01-malang`, `f-2.01-perkawinan`, `f-2.12`, `f-2.29`, `f-2.30`,
  `f.1-21`, `n-1`, `n-2`, `n-4`, `n-5`, `n-6`, `sps`, `swn`.
- `view.php` memakai tag `<page orientation="..." format="...">` (diparse HTML2PDF).
- Helper layout kotak/centang: `donjo-app/helpers/surat_helper.php` → `kotak()`, `checklist()`
  (menggunakan `assets/images/check.png`).

---

## 4. Library & Mekanisme Generate PDF/Excel

### 4.1 Dependensi (`composer.json`)

| Paket | Versi | Kegunaan |
|---|---|---|
| `spipu/html2pdf` | `^5.2` | PDF utama surat & sebagian laporan |
| `tecnickcom/tcpdf` | (via html2pdf) | Renderer PDF dasar + barcode QR (`TCPDF2DBarcode`) |
| `karriere/pdf-merge` | `^2.1` | Gabung surat + lampiran PDF |
| `openspout/openspout` | `^4.24` | Ekspor Excel `.xlsx` asli (streaming) |
| `rap2hpoutre/fast-excel` | `^5.5` | Ekspor Excel `.xlsx` cepat (dipakai `app/Exports/*`) |

### 4.2 Mekanisme PDF

**a. PDF Surat (utama) — `TinyMCE` + HTML2PDF**

1. Ambil template HTML dari `tweb_surat_format.template`/`template_desa`.
2. Substitusi kode isian lewat `gantiKodeIsian()`.
3. Susun HTML final: `HEADER` + `<page>` + isi surat + TTD + `FOOTER` (atau `FOOTER_TTE`).
4. Render via `Html2Pdf` (font default `Times New Roman`, margin `TOP=3.3cm`, `BOTTOM=2cm`).
5. Lampiran (jika ada) di-generate terpisah lalu digabung memakai `Karriere\PdfMerge\PdfMerge`.

**b. PDF Surat Dinas** — `Html2Pdf` langsung di `donjo-app/Controllers/Surat_dinas.php:491`;
penggabungan di `Surat_dinas_cetak.php:379`.

**c. PDF Laporan (helper generik) — `buat_pdf()`**

`donjo-app/helpers/surat_helper.php:133`

```php
function buat_pdf(string $isi, string $file, $style = null, $orientation = 'P', $page_size = 'A4'): void
{
    $style     = $style ?: APPPATH . '../assets/css/report.css';
    $style_isi = "<style>\n " . file_get_contents($style) . "</style>\n" . $isi;
    $html2pdf  = new Html2Pdf($orientation, $page_size);
    $html2pdf->setDefaultFont('Arial');
    $html2pdf->writeHTML($style_isi);
    $html2pdf->output($file . '.pdf', 'FI');
}
```

Saat ini pemakai utamanya hanya `Bumindes_penduduk_rekapitulasi.php:155` (landscape, size `[200,400]`).

**d. QR Code** — `donjo-app/helpers/pict_helper.php:660` fungsi `qrcode_generate()` memakai
`TCPDF2DBarcode`; logo desa ditanam di tengah QR. Dipanggil dari `App\Models\LogSurat::buatQrCode()`
(`app/Models/LogSurat.php:255`). QR dummy: `dummyQrCode()` di
`donjo-app/helpers/sid_helper.php:2883`.

### 4.3 Mekanisme Excel / CSV / Word

**a. “Excel” palsu (HTML `.xls`)** — paling banyak dipakai.
Contoh `resources/views/admin/layouts/components/format_cetak.blade.php`:

```blade
@php
    if (empty($ekstensi)) { $ekstensi = 'xls'; }
    if ($aksi == 'unduh') {
        header('Content-type: application/' . $ekstensi);
        header('Content-Disposition: attachment; filename=' . namafile($file) . '.' . $ekstensi);
        header('Pragma: no-cache');
        header('Expires: 0');
    }
@endphp
```

`print_layout.blade.php` identik. Styling mencegah Excel mengubah format (mis.
`td, th { mso-number-format:"\@"; }`, kelas `.textx`).

**b. Excel asli `.xlsx` (OpenSpout)** — contoh `Penduduk.php:1451`:

```php
$writer = new Writer();
$writer->openToBrowser(namafile('penduduk') . '.xlsx');   // langsung ke browser
$writer->getCurrentSheet()->setName('Data Penduduk');
$writer->addRow(Row::fromValues(Import::DAFTAR_KOLOM));
foreach ($get as $row) { $writer->addRow(Row::fromValues($penduduk)); }
$writer->close();
```

**c. Excel asli `.xlsx` (FastExcel)** — kontrak kelas di `app/Exports/*`:
method `filename()`, `data()`, `download()`, `export()`, `zip()`.

```php
return (new FastExcel())->data($this->data())->download($this->filename());
// atau
$filePath = sys_get_temp_dir() . '/' . $this->filename() . '.xlsx';
return (new FastExcel())->data($this->data())->export($filePath);
```

**d. CSV** — helper di `donjo-app/helpers/database_helper.php` (`tulis_csv`, `get_csv`);
contoh pemakaian `Dokumen.php:289` (`ekspor_csv`).

**e. Word `.doc`** — HTML + header Word di
`donjo-app/Controllers/Pembangunan_dokumentasi.php:205`.

**f. RTF statis** — `storage/app/template/ekspor/kk.rtf`, `kk-f1.09.rtf`.

### 4.4 Helper penamaan file & aset gambar

- `namafile()` — membersihkan nama file (dipakai di semua ekspor).
- `gambar_desa($logo)` — path logo desa untuk kop cetak.
- `favico_desa()` — favicon pada `print_layout`.
- `tgl_indo()`, `getBulan()`, `get_nokk()`, `get_nik()`, `show_zero_as()` — format tanggal/angka
  pada output.

---

## 5. Spesifikasi Visual Minimal

### 5.1 CSS cetak — `assets/css/report.css`

| Elemen | Nilai |
|---|---|
| Body | margin/padding 2px, background `#fff`, warna `#000`, font `12px` Arial/Times/Cambria |
| `h1`, `h3` | 18px; `h4` 14px; `h5` 13px |
| `#body` | padding 0 |
| `.header` | border-bottom 2px solid #000; padding-bottom 5px |
| `table` | `border-collapse: collapse; width:100%` |
| `table.border` | border 1px solid #000; varian `.thick` = 2px |
| `table.border td` | padding `2px 5px`, border `1px solid #aaa` |
| `th` | `text-transform:uppercase`, padding 2px, border 1px solid #000, background `#eee` |
| `tr.footer` | uppercase bold, border-top 1px solid #000, background `#eee` |
| `img.logo` | **width 100px**, `display:block`, margin auto |
| `.judul` | uppercase, text-align center |
| `hr.garis` | border-bottom **2px solid #000**, margin-top 5px, margin-bottom 10px |
| `td, th` | **font-size 9pt** |
| `#ktp` | width 500px, border 2px solid #000, padding 5px |
| `.textx`, `td.textx` | `mso-number-format:"\@"` (paksa teks di Excel) |
| `table#ttd td` | text-align center, nowrap |

### 5.2 CSS surat — `assets/css/surat.css`

| Elemen | Nilai |
|---|---|
| Body | font 14px Arial, line-height 20px, margin kiri 24px / kanan 20px |
| `hr` | border-bottom 4px solid #000 |
| `.page` | margin 18px |
| `.kop` | font-size **24px**, center, line-height 0.1, margin 22px |
| `.kop3` / `.kop2` | 18px / 14px |
| `.header` | padding-top 1px, center, height 110px |
| `.logo` | float left, margin-top 8px, margin-left 5px, **width/height 90px** |
| `.indentasi` | text-indent 40px, line-height 1.2, justify |
| `#isi3 td` | line-height 1.2, vertical-align top, justify |

### 5.3 Kop & bingkai surat (dari `TinyMCE::HEADER`)

- Tabel 2 kolom: **10% logo** + **90% teks kop** (center).
- Baris 1: `PEMERINTAH [SEbutan_kabupaten] [NAma_kabupaten]`
- Baris 2: `KECAMATAN [NAma_kecamatan]`
- Baris 3 (bold): `[SEbutan_desa] [NAma_desa]`
- Baris 4 (italic, 10pt): `[Alamat_desA]`
- Garis pemisah bawah kop: `<hr style="border: 3px solid;" />`.
- Ukuran default: **F4 (215×330 mm) potrait**, font **Times New Roman**,
  margin default PDF atas 3.3 cm & bawah 2 cm.
- Footer: `[kode_desa]` (kiri), kosong (tengah), `[KOde_surat]` (kanan).

### 5.4 Blok tanda tangan

Dua implementasi:

**a. Laporan cetak** — `resources/views/admin/layouts/components/blok_ttd_pamong.blade.php`:
- Kolom kiri **“MENGETAHUI”** → jabatan + nama desa (uppercase) → ruang kosong (5 baris `&nbsp;`)
  → nama bergaris bawah (`<u>`) → `NIP/NIAP`.
- Kolom kanan → `[NAMA DESA], [tgl_indo]` → jabatan + nama desa → nama bergaris bawah → NIP/NIAP.
- Nilai `pamong_ketahui` & `pamong_ttd` dari `Pamong::selectData()`.

**b. Laporan lama** — `resources/views/admin/layouts/components/format_cetak.blade.php`:
- Layout tabel dengan `letak_ttd` = array 3 angka (kolom kiri / tengah / kanan),
  mis. `['1','2','12']`, `['2','2','9']`, `['1','1','1']`.
- Ukuran kolom dihitung dari `$width` (mm) bila tersedia.

Dialog pemilihan penandatangan: `resources/views/admin/layouts/components/ttd_pamong.blade.php`
(memilih `pamong_ttd` dan `pamong_ketahui`).

### 5.5 Logo & QR

- Logo desa: `gambar_desa($desa['logo'])`; 90px (surat), 100px (laporan); center/float-left.
- QR biasa: `[qr_code]` (validasi keaslian surat).
- QR BSrE (TTE): `[qr_bsre]` + `[logo_bsre]` pada `FOOTER_TTE`.
- QR dihasilkan `qrcode_generate()` (`TCPDF2DBarcode`) dengan logo desa di tengah.

---

## 6. Rekomendasi Implementasi Next.js

### 6.1 Pemetaan teknologi

| Kebutuhan Sistem Acuan | Padanan Next.js yang disarankan |
|---|---|
| `html2pdf` (surat HTML→PDF) | **Puppeteer/Playwright** render HTML→PDF, **atau** `@react-pdf/renderer` untuk layout terkontrol |
| `karriere/pdf-merge` | `pdf-lib` (`PDFDocument.copyPages`) |
| `TCPDF2DBarcode` (QR) | `qrcode` (server) atau `qrcode.react` (client) |
| `OpenSpout` / `FastExcel` (xlsx) | `exceljs` (kaya fitur) |
| CSV | `papaparse` atau `exceljs` (sheet CSV) |
| Word `.doc` | `html-docx-js` / `docx` (npm) |
| Template Blade cetak | Komponen React Server (`app/print/**/page.tsx`) + `@media print` CSS |
| Kop + kode isian | Fungsi substitusi placeholder (case-insensitive) + komponen `<KopSurat/>` |

### 6.2 Arsitektur yang disarankan

```
src/
  lib/
    print/
      pdf.ts            # renderHtmlToPdf (puppeteer), mergePdf (pdf-lib)
      excel.ts          # exceljs helpers (writeXlsx, streamToResponse)
      csv.ts
      qrcode.ts         # generateQrBuffer(url, logo?)
    surat/
      placeholders.ts   # substitusi kode isian case-insensitive
      templates.ts      # registry template surat (id, kode, orientasi, ukuran, margin)
      kop.tsx           # komponen kop desa (logo + teks + garis)
  components/print/
    KopSurat.tsx
    BlokTandaTangan.tsx
    TabelCetak.tsx
  app/
    api/
      print/surat/[kode]/route.ts        # POST -> PDF
      print/laporan/[jenis]/route.ts     # POST -> PDF/HTML
      export/[jenis]/route.ts            # POST -> xlsx/csv
```

### 6.3 Contoh: substitusi kode isian

```ts
// src/lib/surat/placeholders.ts
export function isiTemplate(html: string, data: Record<string, string>): string {
  const map = new Map(
    Object.entries(data).map(([k, v]) => [k.toLowerCase(), v ?? ''])
  );
  return html.replace(/\[([^\]]+)\]/g, (m, key: string) =>
    map.has(key.toLowerCase()) ? map.get(key.toLowerCase())! : m
  );
}
```

### 6.4 Contoh: generate PDF surat (Puppeteer + pdf-lib)

```ts
// src/lib/print/pdf.ts
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

export async function renderHtmlToPdf(html: string, opts: {
  width?: string; height?: string; marginTop?: string; marginBottom?: string;
} = {}): Promise<Buffer> {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  // Ukuran F4 = 215mm x 330mm, margin atas 3.3cm, bawah 2cm
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    width: opts.width  ?? '215mm',
    height: opts.height ?? '330mm',
    margin: {
      top: opts.marginTop ?? '33mm',
      bottom: opts.marginBottom ?? '20mm',
      left: '30mm',
      right: '20mm',
    },
    printBackground: true,
  });
  await browser.close();
  return Buffer.from(pdf);
}

export async function mergePdfBuffers(buffers: Uint8Array[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await out.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save();
}
```

### 6.5 Contoh: ekspor Excel (exceljs)

```ts
// src/lib/print/excel.ts
import ExcelJS from 'exceljs';

export async function buildXlsx(
  sheetName: string,
  kolom: { header: string; key: string; width?: number }[],
  rows: Record<string, unknown>[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  ws.columns = kolom;
  rows.forEach((r) => ws.addRow(r));
  ws.getRow(1).font = { bold: true };
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
```

### 6.6 Contoh komponen kop surat (React)

```tsx
// src/components/print/KopSurat.tsx
export function KopSurat(props: {
  logoUrl: string;
  kabupaten: string; kecamatan: string; desa: string; alamat: string;
}) {
  return (
    <header style={{ fontFamily: '"Times New Roman", serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '10%' }}>
              <img src={props.logoUrl} alt="logo-desa" style={{ width: 90, height: 90 }} />
            </td>
            <td style={{ width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: '14pt' }}>
                <div>PEMERINTAH {props.kabupaten.toUpperCase()}</div>
                <div>KECAMATAN {props.kecamatan.toUpperCase()}</div>
                <div><strong>{props.desa.toUpperCase()}</strong></div>
              </div>
              <div style={{ fontSize: '10pt', fontStyle: 'italic' }}>{props.alamat}</div>
            </td>
          </tr>
        </tbody>
      </table>
      <hr style={{ border: '3px solid #000' }} />
    </header>
  );
}
```

### 6.7 Strategi migrasi bertahap

1. Bangun **registry template surat** (id, kode_surat, orientasi, ukuran, margin, placeholder)
   dari JSON default + tabel desa.
2. Implementasi **komponen kop + blok TTD + tabel cetak** reusable.
3. Implementasi **pipeline PDF**: HTML → Puppeteer → (opsional merge lampiran) → unduh.
4. Implementasi **pipeline Excel** dengan `exceljs`, mulai dari laporan berkolom tetap.
5. Porting CSS `report.css`/`surat.css` ke `@media print` (ukuran 9pt–14pt, logo 90/100px,
   garis kop 2–4px).
6. Verifikasi nomor surat & QR agar menghasilkan nilai yang sama dengan Sistem Acuan.

---

## 7. Contoh 3–5 Laporan Prioritas & Kolomnya

### 7.1 PRIORITAS 1 — Laporan Bulanan Desa (LAMPIRAN A-9)

- **Sumber:** `donjo-app/Controllers/Laporan.php` → `resources/views/admin/laporan/bulanan_print.blade.php`
- **Parameter:** bulan, tahun, `pamong_ttd`
- **Ukuran/kop:** F4 potrait; kop “PEMERINTAH KABUPATEN/KOTA” + badge **LAMPIRAN A-9**;
  judul besar “LAPORAN BULANAN DESA/KELURAHAN”; info Desa/Kecamatan/Laporan Bulan (Lampiran A-9).
- **Tabel utama (13 kolom, 7 baris):**

| No | Perincian | WNI L | WNI P | WNA L | WNA P | Jml L | Jml P | Jml L+P | KK L | KK P | KK L+P |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Penduduk/Keluarga awal bulan ini | | | | | | | | | | |
| 2 | Kelahiran/Keluarga baru bulan ini | | | | | | | | | | |
| 3 | Kematian bulan ini | | | | | | | | | | |
| 4 | Pendatang bulan ini | | | | | | | | | | |
| 5 | Pindah/Keluarga pergi bulan ini | | | | | | | | | | |
| 6 | Penduduk hilang bulan ini | | | | | | | | | | |
| 7 | Penduduk/Keluarga akhir bulan ini | | | | | | | | | | |

- **Tabel tambahan “PERINCIAN PINDAH” (9 kolom):**

| No | Keterangan | Penduduk L | P | L+P | KK L | P | L+P |
|---|---|---|---|---|---|---|---|
| 1 | Pindah keluar Desa/Kelurahan | | | | | | |
| 2 | Pindah keluar Kecamatan | | | | | | |
| 3 | Pindah keluar Kabupaten/Kota | | | | | | |
| 4 | Pindah keluar Provinsi | | | | | | |
| — | JUMLAH: | | | | | | |

- **TTD:** kanan “&lt;Desa&gt;, &lt;tgl_indo&gt;” + jabatan + nama + “( nama )” + NIP/NIAP.

### 7.2 PRIORITAS 2 — Laporan Kelompok Rentan (Data Pilah)

- **Sumber:** `donjo-app/Controllers/Laporan_rentan.php` → `resources/views/admin/laporan/rentan/cetak.blade.php`
- **Parameter:** dusun (opsional), bulan
- **Kop:** “PEMERINTAH KABUPATEN/KOTA &lt;KAB&gt;”, judul “DATA PILAH KEPENDUDUKAN MENURUT UMUR
  DAN FAKTOR KERENTANAN (LAMPIRAN A - 9)”, info Desa/Kecamatan/Bulan/Dusun.
- **Kolom (24 kolom):**

| # | Kolom |
|---|---|
| 1 | Dusun |
| 2 | RW |
| 3 | RT |
| 4 | KK L |
| 5 | KK P |
| 6 | Di bawah 1 Tahun |
| 7 | 1–5 Tahun |
| 8 | 6–12 Tahun |
| 9 | 13–15 Tahun |
| 10 | 16–18 Tahun |
| 11 | Di atas 60 Tahun |
| 12 | Cacat Fisik |
| 13 | Cacat Netra/Buta |
| 14 | Cacat Rungu/Wicara |
| 15 | Cacat Mental/Jiwa |
| 16 | Cacat Fisik dan Mental |
| 17 | Cacat Lainnya |
| 18 | Tidak Cacat |
| 19 | Sakit Menahun L |
| 20 | Sakit Menahun P |
| 21 | Hamil |

(Baris tfoot menampilkan total setiap kolom; ditambah footer “Tanggal cetak : &lt;tgl_indo&gt;”.)

### 7.3 PRIORITAS 3 — Laporan Statistik Kependudukan per Kategori

- **Sumber:** `donjo-app/Controllers/Statistik.php` → `resources/views/admin/statistik/cetak.blade.php`
- **Parameter:** `stat` (kategori), `dusun`, `rw`, `rt`, `tahun`, `status`, `laporan_no`
- **Kop:** logo desa + “PEMERINTAH …” + judul “LAPORAN DATA STATISTIK KEPENDUDUKAN MENURUT
  &lt;STAT&gt;”; info Laporan No / Dusun / RW / RT.
- **Kolom (5 kolom):**

| No | &lt;Kategori Stat&gt; | Jumlah | Laki-laki | Perempuan |
|---|---|---|---|---|

- **Footer:** “Laporan data statistik kependudukan menurut &lt;stat&gt; pada tanggal : &lt;tgl_indo&gt;”.

### 7.4 PRIORITAS 4 — Kartu Keluarga (KK)

- **Sumber:** `resources/views/admin/penduduk/keluarga/cetak_kk.blade.php`
- **Judul:** “KARTU KELUARGA” / “SALINAN” / “No. &lt;no_kk&gt;”
- **Header info:** Nama KK; Alamat; RT/RW; Kelurahan/Desa; Kecamatan; Kabupaten/Kota; Kode Pos; Provinsi.
- **Tabel 1 (10 kolom):** No; Nama; NIK; Jenis Kelamin; Tempat Lahir; Tanggal Lahir; Agama;
  Pendidikan; Pekerjaan; Golongan Darah.
- **Tabel 2 (9 kolom):** No; Status Perkawinan; (Tanggal Kawin/Cerai); Status Hubungan dalam
  Keluarga; Kewarganegaraan; No. Paspor; No. KITAS/KITAP; Nama Ayah; Nama Ibu.
- **TTD:** Kiri “KEPALA KELUARGA” (nama kepala KK); Kanan “&lt;sebutan kepala desa + nama desa&gt;”
  (nama kepala desa).

### 7.5 PRIORITAS 5 — Ekspor Penduduk (.xlsx) untuk OpenDK

- **Sumber:** `app/Exports/PendudukOpendkExport.php`
- **Format:** `.xlsx` asli via FastExcel (bisa juga `.zip` bila dipaket).
- **Kolom (36 + 6 tambahan):**

| # | Header | Key |
|---|---|---|
| 1 | Alamat | alamat |
| 2 | Dusun | dusun |
| 3 | RW | rw |
| 4 | RT | rt |
| 5 | Nama | nama |
| 6 | Nomor KK | nomor_kk |
| 7 | Nomor NIK | nomor_nik |
| 8 | Jenis Kelamin | jenis_kelamin |
| 9 | Tempat Lahir | tempat_lahir |
| 10 | Tanggal Lahir | tanggal_lahir |
| 11 | Agama | agama |
| 12 | Pendidikan (dlm KK) | pendidikan_dlm_kk |
| 13 | Pendidikan (sdg ditempuh) | pendidikan_sdg_ditempuh |
| 14 | Pekerjaan | pekerjaan |
| 15 | Kawin | kawin |
| 16 | Hub. Keluarga | hubungan_keluarga |
| 17 | Kewarganegaraan | kewarganegaraan |
| 18 | Nama Ayah | nama_ayah |
| 19 | Nama Ibu | nama_ibu |
| 20 | Gol. Darah | gol_darah |
| 21 | Akta Lahir | akta_lahir |
| 22 | Nomor Dokumen Paspor | nomor_dokumen_pasport |
| 23 | Tanggal Akhir Paspor | tanggal_akhir_pasport |
| 24 | Nomor Dokumen KITAS | nomor_dokumen_kitas |
| 25 | NIK Ayah | nik_ayah |
| 26 | NIK Ibu | nik_ibu |
| 27 | Nomor Akta Perkawinan | nomor_akta_perkawinan |
| 28 | Tanggal Perkawinan | tanggal_perkawinan |
| 29 | Nomor Akta Perceraian | nomor_akta_perceraian |
| 30 | Tanggal Perceraian | tanggal_perceraian |
| 31 | Cacat | cacat |
| 32 | Cara KB | cara_kb |
| 33 | Hamil | hamil |
| 34 | KTP-el | ktp_el |
| 35 | Status Rekam | status_rekam |
| 36 | Alamat Sekarang | alamat_sekarang |
| 37 | id | id |
| 38 | foto | foto |
| 39 | status_dasar | status_dasar |
| 40 | created_at | created_at |
| 41 | updated_at | updated_at |
| 42 | desa_id | desa_id |

---

## Lampiran A — Daftar Route Terkait (dari `donjo-app/Routes/Web/admin.php`)

| Grup | Baris (≈) |
|---|---|
| `statistik` | 440 |
| `laporan` | 494 |
| `laporan_rentan` | 506 |
| `laporan_penduduk` | 514 |
| `surat` | 661 |
| `keluar` | 712 |
| `dokumen` | 816 |
| `laporan_inventaris` | 944 |
| `bumindes_*` | 1091–1191 |

> `[perlu verifikasi]` Nomor baris dapat bergeser bila file berubah.

## Lampiran B — Konstanta Lokasi (`donjo-app/config/constants.php:178–232`)

| Konstanta | Nilai |
|---|---|
| `LOKASI_SURAT_SISTEM` | `template-surat/` |
| `LOKASI_LAMPIRAN_SURAT_DESA` | `desa/template-surat/lampiran/` |
| `LOKASI_LAMPIRAN_SURAT_DINAS_DESA` | `desa/template-surat/surat-dinas/lampiran/` |
| `LOKASI_FONT_DESA` | (font untuk TCPDF/html2pdf) `[perlu verifikasi]` |

## Lampiran C — Catatan Risiko Replikasi

1. **Case-insensitive placeholder** — mudah salah; wajib normalisasi.
2. **Ukuran F4** (215×330 mm) bukan A4 — set eksplisit di Puppeteer/PDF.
3. **“Excel palsu” vs “Excel asli”** — putuskan apakah Next.js meniru HTML `.xls` atau langsung
   menghasilkan `.xlsx` sejati (disarankan `.xlsx`).
4. **QR + tanda tangan elektronik (BSrE)** — perlu integrasi penyedia sertifikat bila ingin
   setara `FOOTER_TTE`.
5. **Merge surat + lampiran** — lampiran Dukcapil punya ukuran halaman berbeda; gunakan `pdf-lib`.
6. **Override template desa** — hormati urutan: template desa → template sistem.

---

*Dokumen ini disusun dari pembacaan langsung source code Sistem Acuan di `repositori sumber`.
Tidak ada berkas di repositori tersebut yang diubah.*
