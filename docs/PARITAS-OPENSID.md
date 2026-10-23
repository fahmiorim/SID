# Matriks Paritas Fitur vs OpenSID

Dokumen ini membandingkan fitur proyek ini dengan **OpenSID** yang ada di
`D:\laragon\www\opensid`. Sumber pembanding (bukan asumsi):

- `donjo-app/controllers/*` — daftar modul & aksi
- `resources/views/admin/*` — modul yang punya UI admin
- `donjo-app/controllers/fweb/*` — halaman web publik
- `donjo-app/controllers/fmandiri/*` — layanan mandiri warga
- `Modules/{Analisis,Anjungan,BukuTamu,Kehadiran,Lapak,Pelanggan}`
- `storage/app/themes/{esensi,natra}` — sistem tema

Legenda status proyek kita:

- ✅ **Berfungsi** — ada domain, action, UI, dan test
- 🟡 **Sebagian** — ada kode/skema tetapi belum lengkap atau belum ter-wire ke UI
- 🔴 **Belum ada**

> **Catatan lisensi.** OpenSID berlisensi **GPL v3**. Dokumen ini memakai
> OpenSID sebagai **rujukan perilaku, alur, dan model data**, bukan untuk
> menyalin kode. Menyalin source GPL ke basis kode ini akan membawa kewajiban
> lisensi GPL. Implementasi tetap idiomatik Next.js/TypeScript.
>
> Detail alur UX per modul (historis) ada di
> [`arsip/PEMETAAN-UX-OPENSID.md`](./arsip/PEMETAAN-UX-OPENSID.md). Status di
> dokumen itu sudah kedaluwarsa; gunakan matriks di halaman ini.

---

## Ringkasan Paritas

| Kategori | Total modul | ✅ | 🟡 | 🔴 |
|---|---:|---:|---:|---:|
| Kependudukan & sosial | 12 | 4 | 0 | 8 |
| Wilayah & pertanahan | 4 | 2 | 0 | 2 |
| Pemerintahan | 8 | 3 | 2 | 3 |
| Persuratan | 7 | 3 | 2 | 2 |
| Keuangan | 6 | 4 | 1 | 1 |
| Bumindes | 11 | 0 | 1 | 10 |
| Pembangunan | 1 | 0 | 0 | 1 |
| Layanan mandiri & warga | 10 | 0 | 3 | 7 |
| Analisis & statistik | 3 | 0 | 2 | 1 |
| Web publik | 21 | 7 | 9 | 5 |
| Sistem & operasional | 9 | 2 | 2 | 5 |
| **Total** | **92** | **25** | **22** | **45** |

**Paritas kasar saat ini: ±39%** (hitung ✅ penuh + setengah 🟡). Angka ini
dihitung ulang 23 Oktober 2026 langsung dari baris matriks; jumlah ✅ + 🟡 + 🔴
per kategori harus sama dengan kolom total. Untuk "tidak kalah" pada operasi
harian desa, target realistis adalah menutup seluruh 🔴 prioritas **P0** dan
**P1** — bukan seluruh 92 modul.

> Catatan 23 Okt 2026: Halaman web publik gelombang 1 sudah tersedia (beranda,
> berita, galeri, profil, perangkat, apbdes, status-des, idm-sdgs, surat,
> analisis-survei, dokumen, statistik, kontak, verifikasi-surat, kelompok,
> inventaris) dan memakai use case + slot tema. Yang masih 🔴 adalah halaman
> yang belum ada sama sekali (suplemen, lapak, dpt, komentar/pengunjung, SEO OG
> image) serta fitur lanjutan.
>
> Perbaikan P0 23 Okt 2026: verifikasi surat publik kini memakai token acak
> (hash SHA-256, tenant-aware) dan halaman cetak menampilkan tautan verifikasi;
> APBDes publik tidak lagi error saat memetakan baris; `/konten/menu` dan
> `/konten/dokumen` membaca data per desa. QR gambar verifikasi belum dibuat.
>
> Perbaikan P1.1 23 Okt 2026: inventaris kini punya CRUD barang & kategori,
> mutasi berjenjang operator → sekdes → kades, dan perubahan aset baru
> diterapkan secara atomik pada tahap akhir. Modul inventaris diaktifkan kembali
> di menu admin.
>
> Perbaikan P1.2 23 Okt 2026: `/konten/menu`, `/konten/widget`,
> `/konten/slider`, dan `/konten/dokumen` kini punya CRUD lengkap dengan filter
> `village_id` pada update/delete, daftar admin yang memuat baris nonaktif,
> validasi domain, dan slug dokumen unik. Slider beranda sudah memakai data
> aktif; widget dan teks berjalan belum dirender di tema publik. Unggah berkas
> dokumen masih berupa path/URL manual.
>
> Perbaikan P1.3 23 Okt 2026: `/desa/apbdes`, `/desa/statistik`,
> `/desa/dokumen`, `/desa/status-des`, `/desa/surat`, `/desa/analisis-survei`,
> dan `/desa/idm-sdgs` di-refactor lewat use case + slot tema. Halaman baru
> `/desa/kelompok` dan `/desa/inventaris` tersedia. IDM/SDGs tidak lagi memakai
> realisasi palsu (`realisasi = anggaran`); laporan memakai jumlah TW I–IV dan
> menyatakan bila indikator belum tersedia. Widget teks tampil di beranda dan
> disanitasi saat simpan + render. 404/error publik memakai konvensi Next 16.
> Smoke test produksi: seluruh halaman publik utama 200, tautan internal tanpa
> 404. Sisa P1: Lighthouse dan test integrasi HTTP.

---

## A. Kependudukan & Sosial

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Data penduduk (CRUD, filter, cetak, ekspor) | `controllers/Penduduk.php`, `views/admin/penduduk` | ✅ | — |
| Riwayat/log penduduk (lahir, mati, pindah, datang) | `controllers/Penduduk_log.php` | 🔴 | **P1** |
| Keluarga / Kartu Keluarga + cetak | `controllers/Keluarga.php` | ✅ | — |
| Rumah tangga (RTM) | `controllers/Rtm.php` | ✅ | — |
| DPT (Daftar Pemilih Tetap) | `controllers/Dpt.php`, `fweb/Dpt` | 🔴 | P1 |
| DTKS (Data Terpadu Kesejahteraan Sosial) | `controllers/Dtks.php` | 🔴 | P1 |
| Data suplemen (disabilitas, dll.) | `controllers/Suplemen.php`, `fweb/Suplemen` | 🔴 | P1 |
| Stunting & rekapitulasi | `controllers/Stunting*.php` | 🔴 | P2 |
| Vaksin / Covid-19 | `controllers/Vaksin_covid.php`, `controllers/Covid19.php` | 🔴 | P2 |
| Pendapat warga | `controllers/Pendapat.php` | 🔴 | P2 |
| Program bantuan + peserta | `controllers/Program_bantuan.php`, `Peserta_bantuan.php` | ✅ | — |
| Statistik bantuan | `controllers/Statistik_bantuan.php` | 🔴 | P2 |

## B. Wilayah & Pertanahan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Wilayah administratif (dusun/RW/RT) | `controllers/Wilayah.php` | ✅ | — |
| Peta / GIS (area, garis, titik, polygon) | `controllers/{Area,Garis,Point,Polygon}.php`, `fweb/Peta` | 🔴 | **P1** |
| Data persil & Cdesa + mutasi | `controllers/{Data_persil,Cdesa,Cdesa_mutasi,Cdesa_rincian}.php` | 🔴 | P1 |
| Inventaris aset (6 kategori + mutasi) | `controllers/Inventaris_*.php` | ✅ | — |

## C. Pemerintahan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Identitas desa | `controllers/Identitas_desa.php` | ✅ | — |
| Perangkat desa / pamong + jabatan | `controllers/{Pamong,Jabatan,Pengurus}.php` | ✅ | — |
| Lembaga desa + anggota | `controllers/{Lembaga,Lembaga_anggota,Lembaga_master}.php` | 🟡 | P1 |
| Kelompok masyarakat + anggota | `controllers/{Kelompok,Kelompok_anggota}.php` | ✅ | — |
| Status desa / IDM | `controllers/Status_desa.php`, `fweb/Idm` | 🟡 | P2 |
| Pemilihan (pilkes/rekap) | `controllers/Pemilihan.php` | 🔴 | P3 |
| Sinergi program | `controllers/Sinergi_program.php` | 🔴 | P3 |
| SOTK (struktur organisasi) | `fweb/Sotk` | 🔴 | P2 |

## D. Persuratan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Surat warga (jenis, isian, nomor, verifikasi berjenjang) | `controllers/Surat.php`, `Surat_master.php` | ✅ | — |
| Surat masuk & surat keluar | `controllers/{Surat_masuk,Surat_keluar}.php` | ✅ | — |
| Klasifikasi & syarat surat | `controllers/{Klasifikasi,Syaratan_surat}.php` | ✅ | — |
| Surat dinas + arsip | `controllers/{Surat_dinas,Surat_dinas_arsip}.php` | 🔴 | P1 |
| Template surat, QR, verifikasi publik | `controllers/Qr_code.php`, `fweb/Verifikasi_surat` | 🟡 | **P0** |
| Permohonan surat admin | `controllers/Permohonan_surat_admin.php` | 🟡 | **P0** |
| Buku agenda / arsip surat | `controllers/Bumindes_arsip.php` | 🔴 | P2 |

## E. Keuangan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| APBDes / anggaran | `controllers/{Keuangan_laporan,Laporan_apbdes}.php` | ✅ | — |
| Realisasi & laporan triwulan | `controllers/Keuangan_laporan.php` | ✅ | — |
| Dokumen laporan | `controllers/Dokumen.php` | ✅ | — |
| Keuangan manual / rekonsiliasi | `controllers/Keuangan_manual.php` | 🔴 | P2 |
| Inventaris kekayaan desa (buku) | `controllers/Bumindes_inventaris_kekayaan.php` | 🟡 | P1 |
| Transparansi APBDes di web publik | `fweb` (APBDes) | ✅ | — |

## F. Bumindes

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Buku administrasi umum | `controllers/Bumindes_*.php` | 🟡 | **P0** |
| Buku penduduk induk | `Bumindes_penduduk_induk` | 🔴 | P1 |
| Buku penduduk KTP/KK | `Bumindes_penduduk_ktpkk` | 🔴 | P1 |
| Buku mutasi penduduk | `Bumindes_penduduk_mutasi` | 🔴 | P1 |
| Buku rekapitulasi penduduk | `Bumindes_penduduk_rekapitulasi` | 🔴 | P1 |
| Buku penduduk sementara | `Bumindes_penduduk_sementara` | 🔴 | P1 |
| Buku rencana & kegiatan pembangunan | `Bumindes_rencana_pembangunan`, `Bumindes_kegiatan_pembangunan` | 🔴 | P1 |
| Buku tanah desa & tanah kas | `Bumindes_tanah_desa`, `Bumindes_tanah_kas_desa` | 🔴 | P1 |
| Buku kader | `Bumindes_kader` | 🔴 | P2 |
| Buku arsip | `Bumindes_arsip` | 🔴 | P2 |
| Buku hasil pembangunan | `Bumindes_hasil_pembangunan` | 🔴 | P2 |

## G. Pembangunan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Proyek pembangunan + dokumentasi + rencana + hasil | `controllers/{Pembangunan_dokumentasi,Admin_pembangunan,Plan}.php`, `fweb/Pembangunan` | 🔴 | **P1** |

## H. Layanan Mandiri & Warga

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Akun warga **NIK + PIN**, dibuat operator, reset PIN | `controllers/Mandiri.php`, `Setting_mandiri.php` | 🔴 | **P0** |
| Login & beranda warga | `controllers/fmandiri/Beranda.php` | 🔴 | **P0** |
| Pengajuan surat warga | `fmandiri/Surat.php` | 🟡 | **P0** |
| Dokumen warga | `fmandiri/Dokumen.php` | 🔴 | P1 |
| Pesan warga ↔ desa | `fmandiri/Pesan.php` | 🔴 | P2 |
| Pengaduan warga | `controllers/Pengaduan_admin.php`, `fweb/Pengaduan` | 🔴 | P1 |
| Bantuan untuk warga | `fmandiri/Bantuan.php` | 🟡 | P2 |
| Lapak / produk warga | `Modules/Lapak`, `fmandiri/{Lapak,Produk}.php` | 🔴 | P3 |
| Kehadiran perangkat | `Modules/Kehadiran`, `fmandiri/Kehadiran_perangkat.php` | 🔴 | P3 |
| Verifikasi surat publik (QR/token) | `fweb/Verifikasi_surat`, `fmandiri/Verifikasi.php` | 🟡 | **P0** (token selesai; gambar QR menyusul) |

## I. Analisis & Statistik

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Analisis (kategori, indikator, parameter, respon, laporan) | `Modules/Analisis` (19 file + 47 view) | 🔴 | P1 |
| Statistik penduduk & bantuan | `controllers/Statistik.php`, `Statistik_bantuan.php` | 🟡 | P1 |
| IDM & SDGs | `controllers/Status_desa.php`, `fweb/{Idm,Sdgs}` | 🟡 | P2 |

## J. Web Publik

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Beranda + headline + slider | `fweb/Utama`, `partials/{headline,slider}` | ✅ | **P0** |
| Artikel/berita + arsip | `fweb/{Artikel,Arsip}` | ✅ | **P0** |
| Profil & pemerintah (perangkat) | `fweb/{Pemerintah,Sotk}` | ✅ | **P0** |
| Galeri | `fweb/Galeri` | ✅ | **P0** |
| Dokumen & produk hukum/peraturan | `fweb/{InformasiPublik,Embed}` | 🟡 | P1 |
| Statistik publik | `fweb/Statistik` | 🟡 | P1 |
| Peta & wilayah administratif | `fweb/{Peta,WilayahAdministratif}` | 🟡 | P1 |
| Pembangunan publik | `fweb/Pembangunan` | 🟡 | P1 |
| Pengaduan publik | `fweb/Pengaduan` | 🟡 | P1 |
| Kelompok & lembaga | `fweb/{Kelompok,Lembaga}` | 🟡 | P1 (halaman publik ada; anggota lembaga menyusul) |
| Inventaris publik | `fweb/Inventaris` | ✅ | — |
| APBDes publik | tema `partials/apbdesa` | ✅ | — |
| Suplemen, kesehatan, vaksin | `fweb/{Suplemen,Kesehatan,Vaksin}` | 🔴 | P2 |
| DPT publik | `fweb/Dpt` | 🔴 | P2 |
| Lapak publik | `fweb/Lapak`, `Modules/Lapak` | 🔴 | P3 |
| Kontak | `controllers/Kontak.php` | ✅ | **P0** |
| Komentar & pengunjung | `controllers/{Komentar,Pengunjung}.php` | 🔴 | P2 |
| Menu, widget, slider, teks berjalan, sosmed | `controllers/{Menu,Web_widget,Slider,Teks_berjalan,Sosmed}.php` | 🟡 | **P0** |
| **Tema/template** (ganti tema + opsi) | `controllers/{Theme,Pindai_tema}.php`, `themes/esensi` | 🟡 | **P0** |
| SEO: sitemap, robots, OG image | `controllers/{Sitemap,OgImage}.php` | 🟡 | P1 |
| Multi-desa & domain per desa | tidak ada di OpenSID (fitur baru) | 🔴 | **P1** (setelah P0) |

## K. Sistem & Operasional

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Pengguna, grup, modul, RBAC | `controllers/{Pengguna,Man_user,Grup,Modul}.php` | ✅ | — |
| Identitas & pengaturan aplikasi | `controllers/{Identitas_desa,Setting_aplikasi}.php` | ✅ | — |
| Shortcut / menu admin | `controllers/Shortcut.php` | 🟡 | P2 |
| Notifikasi, mailbox, SMS gateway | `controllers/{Notifikasi,Mailbox,Sms*}.php` | 🔴 | P2 |
| Database: backup/restore/optimasi | `controllers/{Database,Koneksi_database,Optimasi_gambar}.php` | 🔴 | P1 |
| Sinkronisasi & OpenDK | `controllers/{Sinkronisasi,Opendk_pesan}.php`, `fweb` | 🔴 | P3 |
| Plugin & pemasangan modul | `controllers/{Plugin,Install_modul}.php` | 🔴 | P3 |
| Log aktivitas / audit trail | `controllers/Info_sistem.php` | 🔴 | P1 |
| Token/OTP & keamanan login | `controllers/{Token,Otp,Securimage}.php` | 🟡 | P1 |

---

## Peta Prioritas (untuk "Tidak Kalah")

### T1 — Operasi harian desa (wajib)

Penduduk + log, KK, RTM, surat lengkap + verifikasi publik, keuangan +
transparansi, inventaris + mutasi berjenjang, bumindes inti, bantuan, layanan
mandiri warga (NIK+PIN), web publik lengkap + tema, pengaturan, kelompok &
lembaga, perangkat desa.

### T2 — Transparansi & pembangunan (target "setara")

Pembangunan + dokumentasi, pengaduan, pertanahan/persil, DPT/DTKS/suplemen,
statistik, peta/GIS, produk hukum, IDM/SDGs, APBDes publik, analisis/survei,
surat dinas, backup database, audit log.

### T3 — Ekosistem (opsional, bisa menyusul)

Lapak, anjungan, buku tamu, kehadiran, SMS/mailbox/notifikasi, plugin,
sinkronisasi/OpenDK, optimasi gambar, pemilihan, sinergi program, vaksin/Covid.

**Target realistis:** T1 + T2 = "tidak kalah" untuk kebutuhan mayoritas desa.
T3 tidak perlu dikejar sekarang.

---

## Kesimpulan

1. Proyek ini sudah kuat di **inti administrasi** (penduduk, KK, RTM, surat,
   keuangan, bantuan, kelompok) tetapi **jauh tertinggal di web publik, layanan
   mandiri warga, dan modul transparansi**.
2. Prioritas yang Anda tetapkan sudah tepat: **web publik dulu**, karena itu
   satu-satunya bagian yang dilihat warga dan saat ini hampir kosong.
3. "Tidak kalah dengan OpenSID" bukan satu fase, melainkan **T1 + T2** yang
   masing-masing butuh berminggu-minggu. Dokumen rencana memecahnya per fase.
