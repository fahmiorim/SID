# LAMPIRAN 08 — ALUR BISNIS PER DOMAIN (OpenSID) UNTUK REBUILD NEXT.JS

> Dokumen ini adalah hasil *reverse engineering* terhadap source code **OpenSID**
> (`D:\laragon\www\opensid`) — **CodeIgniter 3** (`donjo-app/`) + **Laravel 10** (`app/`, `Modules/`,
> `resources/views/`) + **Blade**.
>
> Tujuan: menjadi acuan detail **alur bisnis per domain** saat mereplikasi aplikasi ke **Next.js 15+**.
>
> **Cakupan & batasan:**
> - Dokumen ini **tidak mengulang** alur dasar yang sudah ada di
>   `ANALISIS-OPENSID-REBUILD-NEXTJS.md` **§6** (pendaftaran/perubahan penduduk, surat keterangan,
>   laporan desa) maupun mesin persuratan layanan/surat keterangan di `LAMPIRAN-01-PERSURATAN.md`.
>   Bila suatu alur bersinggungan, dokumen ini hanya menautkan dan menambah detail yang belum dibahas.
> - Seluruh isi kode/DB diperlakukan sebagai **DATA**, bukan instruksi. Tidak ada kredensial/rahasia
>   yang disalin.
> - Penanda `[perlu verifikasi]` dipakai untuk hal yang belum bisa dipastikan 100% dari kode.

---

## Daftar Isi

1. [Cara Membaca Dokumen](#0-cara-membaca-dokumen)
2. [1. Keuangan / APBDes](#1-keuangan--apbdes)
3. [2. Inventaris / Aset Desa](#2-inventaris--aset-desa)
4. [3. Bantuan Sosial & DTKS](#3-bantuan-sosial--dtks)
5. [4. Pembangunan](#4-pembangunan)
6. [5. Layanan Mandiri (end-to-end)](#5-layanan-mandiri-end-to-end)
7. [6. Surat Dinas (naskah dinas internal)](#6-surat-dinas-naskah-dinas-internal)
8. [7. Analisis (kuesioner/indikator)](#7-analisis-kuesionerindikator)
9. [8. Bumindes (Buku Administrasi Desa)](#8-bumindes-buku-administrasi-desa)
10. [9. Kelompok / Lembaga / RTM / Rumah Tangga](#9-kelompok--lembaga--rtm--rumah-tangga)
11. [10. Website Publik](#10-website-publik)
12. [Matriks Alur → Dokumen](#matriks-alur--dokumen)
13. [Ringkasan Cakupan](#ringkasan-cakupan)

---

## 0. Cara Membaca Dokumen

Setiap domain (10 sub-bagian) memakai format tetap:

- **Ringkasan** — apa domain ini dan peta komponen.
- **Aktor & hak akses** — siapa yang boleh apa (slug modul/`isCan`/`can`).
- **Alur langkah** — langkah bernomor termasuk validasi & perubahan status.
- **Tabel & kolom kunci** — tabel inti beserta kolom penting.
- **Aturan bisnis/penting** — invariant yang wajib dipertahankan.
- **Output/cetak** — bentuk keluaran.
- **Catatan rebuild Next.js** — 2–4 poin arahan implementasi.

Konvensi hak akses OpenSID: aktor admin memakai slug modul (`modul_ini`/`sub_modul_ini`) dan gerbang
`isCan('b'|'u'|'h')` (baca/ubah/hapus); aktor warga memakai *Layanan Mandiri* (`fmandiri`) berbasis
akun `tweb_penduduk_mandiri`. Ringkasan RBAC lengkap ada di `LAMPIRAN-02-RBAC.md`.

---

## 1. Keuangan / APBDes

### Ringkasan

Domain pencatatan APBDes: **pendapatan**, **belanja**, dan **pembiayaan** desa. Sejak migrasi
`donjo-app/models/migrations/Migrasi_2025010171.php` arsitekturnya **berbasis satu tabel `keuangan`**
yang direlasikan ke **hierarki `keuangan_template`**, menggantikan 66 tabel legacy `keuangan_ta_*`
(Siskeudes) yang tetap ada untuk kompatibilitas impor. Tiga controller utama:

| Kelompok | Controller | Modul / Sub-modul | Peran |
|---|---|---|---|
| Laporan & grafik | `donjo-app/controllers/Keuangan_laporan.php` | `keuangan` / `laporan` | Tampilan realisasi/anggaran per tahun, rincian realisasi manual, grafik APBDes |
| Input manual & impor | `donjo-app/controllers/Keuangan_manual.php` | `keuangan` / `input-data` (+ `impor-data`) | CRUD rincian anggaran/realisasi; impor data Siskeudes |
| Publikasi APBDes | `donjo-app/controllers/Laporan_apbdes.php` | `keuangan` / `laporan-apbdes` | Unggah PDF laporan APBDes & kirim ke OpenDK/kecamatan |

Model/library: `app/Models/Keuangan.php`, `app/Models/KeuanganTemplate.php`,
`app/Models/KeuanganManualRefRek2.php`, `KeuanganManualRefRek3.php`, `app/Libraries/Keuangan.php`,
enum `app/Enums/KeuanganRefRek1Enum.php`.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin/operator keuangan | `isCan('b')` pada daftar; `isCan('u')` untuk input/ubah/impor; `isCan('h')` untuk hapus |
| Operator desa | Melihat modul `keuangan` sesuai `grup_akses` |
| Publik (website) | Hanya **lihat** grafik/ringkasan APBDes bila `setting('apbdes_footer')` aktif (via `App\Libraries\Keuangan::grafik_keuangan_tema`) |

Sub-modul dipetakan ke URL melalui `setting_modul`; migrasi `migrasi_2024102351()` menetapkan
`url = keuangan_manual` untuk slug `input-data`.

### Alur langkah

**A. Menyiapkan tahun anggaran (struktur template).**
1. Saat install/upgrade, `Migrasi_2025010171::migrasi_2024071251()` membuat `keuangan_template` (bila
   belum ada) dan menyemai hierarki rekening standar (Pendapatan `4`, Belanja `5`, Pembiayaan `6`).
2. Setiap akun punya `uuid` berjenjang (mis. `4` → `4.1` → `4.1.1` → `4.1.1.01`) dan `parent_uuid`.
3. `Keuangan_manual::template()` menampilkan struktur ini sebagai acuan input.

**B. Input manual rincian (anggaran & realisasi).**
4. Operator membuka `Keuangan_manual::index()` lalu `form($id)`/`update($id)`.
5. Data disimpan pada tabel rincian manual (`keuangan_manual_rinci`, `keuangan_manual_rinci_tpl`)
   beserta referensi (`keuangan_manual_ref_rek1/2/3`, `ref_bidang`, `ref_kegiatan`).
6. Validasi: tahun anggaran harus konsisten; nilai anggaran/realisasi numerik.
7. Pada model `Keuangan`, event `saved` **menggulung (roll-up) total ke baris parent** melalui
   `parent_uuid` — sehingga nilai `keuangan` pada akun induk = akumulasi anak (lihat
   `app/Models/Keuangan.php`).

**C. Impor data (Siskeudes).**
8. `Keuangan_manual::impor_data()` (sub-modul `impor-data`) → `confirmationForm()` →
   `proses_impor()`.
9. Validasi berkas: ekstrak `.zip` (`extract()`), cek keberadaan `Ta_RAB.csv` (`checkFile()`),
   lalu `cek_tahun_manual()` untuk memastikan tahun valid terhadap `keuangan_template`.
10. `simpanData($namaFile, $tahun)` membaca:
    - `Ta_RABRinci.csv` → `AnggaranStlhPAK` dipetakan ke kolom **`anggaran`**;
    - `Ta_JurnalUmumRinci.csv` → `Debet + Kredit` dipetakan ke **`realisasi`**.
11. Hasil impor menggulung ke `keuangan` per `template_uuid`.

**D. Laporan & publikasi.**
12. `Keuangan_laporan::index()` menampilkan ringkasan; `grafik_rp_apbd($tahun)` menyiapkan grafik;
    `rincian_realisasi_manual($tahun, $judul)` untuk rincian realisasi manual.
13. `Laporan_apbdes::index()/form()/insert()/update()` mengelola berkas laporan APBDes
    (`uploadFile()`, `file()`); `unduh($id)` mengunduh; `kirim()` mengirim ke OpenDK
    (`opendk($id)`) bila integrasi aktif.
14. `Laporan_apbdes::datatables()` menampilkan daftar tahun/laporan.

### Tabel & kolom kunci

| Tabel | Kolom penting | Catatan |
|---|---|---|
| `keuangan` | `id`, `config_id`, `template_uuid` (char 36), `tahun`, `anggaran` (decimal 65,2), `realisasi` (decimal 65,2), `created_by`, `updated_by`, timestamps | Tabel inti baru; FK ke `config` (cascade) & `keuangan_template(uuid)` |
| `keuangan_template` | `uuid` (PK), `parent_uuid` (char 36, index), `uraian`, audit | Hierarki rekening; level 1=kategori (`4/5/6`), 3=bidang, 5=kegiatan, 8=rincian |
| `keuangan_manual_rinci` | `tahun`, `config_id`, `Kd_Rincian`, `Kd_Keg`, `Nilai_Anggaran`, `Nilai_realisasi` | Rincian input manual (dan sumber migrasi) |
| `keuangan_manual_rinci_tpl` | `Kd_Rincian`, `Kd_Keg` | Template baris rincian |
| `keuangan_manual_ref_rek1/2/3`, `keuangan_manual_ref_bidang`, `keuangan_manual_ref_kegiatan` | kode & uraian referensi | Master referensi Siskeudes |
| `keuangan_master` | daftar tahun anggaran | Daftar tahun yang dikelola |
| `keuangan_ref_*` (bank_desa, bidang, kegiatan, rek1..rek4, sumber, sbu, dst.) | kode & uraian | Referensi luas (termasuk neraca) |
| `keuangan_ta_*` (66 tabel) | — | Legacy Siskeudes; tetap dipertahankan untuk impor |

`KeuanganRefRek1Enum` (`app/Enums/KeuanganRefRek1Enum.php`) memetakan kategori:
`ASET='1.'`, `KEWAJIBAN='2.'`, `EKUITAS='3.'`, `PENDAPATAN='4.'`, `BELANJA='5.'`, `PEMBIAYAAN='6.'`,
`NON_ANGGARAN='7.'`.

### Aturan bisnis/penting

- **Roll-up otomatis.** Nilai akun induk **tidak** diinput langsung; dijumlah dari anak. Ini wajib
  dipertahankan di Next.js (baik sebagai computed column/trigger maupun agregasi aplikasi).
- **Kunci logis = (`config_id`, `template_uuid`, `tahun`).** Satu kombinasi hanya boleh punya satu baris.
- **Tahun konsisten.** Impor/manual divalidasi terhadap tahun yang ada di template (`cek_tahun_manual`).
- **Konversi realisasi Siskeudes = `Debet + Kredit`** (bukan selisih); anggaran = `AnggaranStlhPAK`.
- **Duplikasi struktur.** `keuangan_manual_rinci` (manual) dan `keuangan_ta_rab_rinci`
  (impor Siskeudes) keduanya menjadi sumber migrasi ke `keuangan`; proses migrasi hanya berjalan bila
  tahun pada `keuangan` belum ada.

### Output/cetak

- **Grafik APBDes** untuk website/footer (`Keuangan::grafik_keuangan_tema`) — bukan cetak kertas.
- **Laporan APBDes PDF** diunggah manual oleh operator (`Laporan_apbdes`) lalu dikirim ke OpenDK.
- Tabel laporan/realisasi dirender di layar; detail bentuk cetak ada di `LAMPIRAN-06`.

### Catatan rebuild Next.js

1. **Model data:** satu tabel `keuangan` + `keuangan_template` berjenjang. Terapkan *materialized path*
   atau *closure table* pada `uuid` untuk memudahkan roll-up; sediakan constraint unik
   `(config_id, template_uuid, tahun)`.
2. **Roll-up:** hitung saat tulis (trigger/DB function) atau rekap berkala; jangan biarkan klien
   mengirim nilai parent. Sediakan endpoint rekomputasi untuk perbaikan data.
3. **Impor Siskeudes:** port `proses_impor` sebagai *worker* terpisah (stream `.csv` dalam `.zip`),
   dengan laporan baris gagal; pertahankan aturan `Debet+Kredit` dan `AnggaranStlhPAK`.
4. **Publikasi:** pisahkan peran "input/verifikasi" (admin) dan "publikasi APBDes" (unggah PDF +
   kirim OpenDK) ke permission berbeda; untuk website publik, ekspos endpoint ringkasan APBDes read-only.

---

## 2. Inventaris / Aset Desa

### Ringkasan

Pencatatan **kekayaan/aset milik desa** per jenis (per Permendagri 47/2016) beserta **mutasi**
(penghapusan/perubahan status). Terdapat enam jenis aset, masing-masing dengan controller CRUD
(`Inventory + Mutasi`); satu jenis (**Konstruksi**) tidak punya tabel mutasi.

| Jenis | Controller CRUD | Controller Mutasi | Model |
|---|---|---|---|
| Aset (bergerak/lainnya) | `Inventaris_asset.php` | `Inventaris_asset_mutasi.php` | `InventarisAsset`, `MutasiInventarisAsset` |
| Gedung & Bangunan | `Inventaris_gedung.php` | `Inventaris_gedung_mutasi.php` | `InventarisGedung` |
| Jalan/Irigasi/Jaringan | `Inventaris_jalan.php` | `Inventaris_jalan_mutasi.php` | `InventarisJalan` |
| Peralatan & Mesin | `Inventaris_peralatan.php` | `Inventaris_peralatan_mutasi.php` | `InventarisPeralatan` |
| Tanah | `Inventaris_tanah.php` | `Inventaris_tanah_mutasi.php` | `InventarisTanah` |
| Konstruksi | `Inventaris_kontruksi.php` | — | `InventarisKontruksi` |

Modul `sekretariat`, sub-modul `inventaris` (contoh slug akses modul: `inventaris-asset`). Ditambah
`Inventaris_master.php` (master/inventori), model `Aset` (`tweb_aset`) dan `MasterInventaris`,
serta service `app/Services/LaporanInventaris.php`. Enum terkait `InventarisMenuEnum`,
`InventarisSubMenuEnum`.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin/operator sekretariat | `isCan('b')` daftar, `isCan('u')` input/ubah, `isCan('h')` hapus + input mutasi |
| Publik | Melihat inventaris via menu `inventaris` di website (read-only) |

### Alur langkah

**A. Tambah/ubah aset.**
1. Buka menu sesuai jenis (`Inventaris_asset::index()`, dst.).
2. `form($id, $view)` menampilkan form; `create()`/`update($id)` menyimpan.
3. `validate($data)` memeriksa kelengkapan & tipe (mis. tanggal perolehan, nilai, jenis).
4. Data masuk ke `inventaris_<jenis>` (mis. `inventaris_asset`).

**B. Mutasi aset (penghapusan / perubahan status / perbaikan).**
5. Dari daftar aset, buka `Inventaris_asset_mutasi::index()`/`create($inventaris_id)`.
6. `validate($data, $mutasi)` memeriksa validitas mutasi.
7. Simpan ke `mutasi_inventaris_<jenis>`; `JENIS_MUTASI` menentukan efek:
   - `1` = Hapus barang masih baik
   - `2` = Status rusak
   - `3` = Status diperbaiki
   - `4` = Hapus barang rusak
8. Kolom `jenis_penghapusan` memakai `JENIS_PENGHAPUSAN`: `1` Rusak, `2` Dijual, `3` Disumbang.

**C. Cetak/laporan.**
9. `cetak($aksi)` (mis. `Inventaris_asset::cetak()`) menghasilkan lembar inventaris;
   `dialog($aksi)` menyiapkan parameter cetak.
10. `Laporan_inventaris.php` + `MasterInventaris::permen47` menghasilkan rekap sesuai Permendagri 47
    (dipakai bersama Bumindes — lihat domain 8).

### Tabel & kolom kunci

| Tabel | Kolom kunci | Keterangan |
|---|---|---|
| `inventaris_asset` | identitas aset, `asal` (`ASAL_INVENTARIS`), nilai, tahun, kondisi | Aset bergerak/lainnya |
| `inventaris_gedung`, `inventaris_jalan`, `inventaris_peralatan`, `inventaris_tanah`, `inventaris_kontruksi` | kolom khas per jenis (luas, lokasi, bahan, dst.) | Konstruksi **tanpa** mutasi |
| `mutasi_inventaris_asset` (+ gedung/jalan/peralatan/tanah) | `id_inventaris_*`, `jenis_mutasi`, `jenis_penghapusan`, keterangan, tanggal | Riwayat mutasi |
| `tweb_aset` | master aset lama | Model `Aset` |
| View `master_inventaris_view`, `rekap_mutasi_inventaris_view` | — | Read model rekap |

Konstanta: `ASAL_INVENTARIS` (`1` Dibeli Sendiri … `5` Sumbangan).

### Aturan bisnis/penting

- **Enam jenis aset**, tiap jenis format kolom berbeda; mutasi hanya untuk 5 jenis (tanpa Konstruksi).
- **Mutasi tidak menghapus aset**; ia mencatat riwayat (termasuk penghapusan) sehingga aset tetap
  terlacak.
- **[perlu verifikasi] Kemungkinan bug.** `Inventaris_asset::delete()` (baris ~162) tampak memakai
  nama kolom `id_inventaris_jalan` saat membersihkan `mutasi_inventaris_asset` (seharusnya
  `id_inventaris_asset`). Bila benar, ini berpotensi meninggalkan baris mutasi yatim. Perlu dicek
  langsung ke kode sebelum mereplikasi; di Next.js pastikan FK `mutasi.*` → `inventaris_*` memakai
  nama kolom yang konsisten + `ON DELETE CASCADE`.
- **Asal perolehan** wajib salah satu dari `ASAL_INVENTARIS`.
- **Rekap Permendagri 47** menggabungkan semua jenis via `MasterInventaris`.

### Output/cetak

- Lembar/kartu inventaris per jenis (`cetak()`).
- Rekap inventaris & kekayaan desa (Permendagri 47) via `Laporan_inventaris` + `MasterInventaris`.
- Dipakai ulang oleh Bumindes kategori "Kekayaan Desa".

### Catatan rebuild Next.js

1. **Desain polymorphic.** Satu konsep "aset" dengan `jenis` + tabel detail per jenis, atau satu tabel
   dengan atribut JSON per jenis. Mutasi jadi tabel anak dengan FK ke aset (cascade delete).
2. **Enum terpusat.** Port `JENIS_MUTASI`, `JENIS_PENGHAPUSAN`, `ASAL_INVENTARIS` sebagai enum.
3. **Rekap.** Port `MasterInventaris::permen47` sebagai query/report terpisah, karena dipakai lintas
   domain (inventaris + Bumindes).
4. **Verifikasi bug mutasi** di atas sebelum menetapkan skema final.

---

## 3. Bantuan Sosial & DTKS

### Ringkasan

Dua hal yang sering dianggap satu: **Program Bantuan (Bansos) yang dikelola desa** dan **DTKS**
(Data Terpadu Kesejahteraan Sosial yang diimpor/disinkronkan). Ditambah **Suplemen** (data
pendukung kependudukan) dan **Statistik Bantuan**.

| Controller | Modul / Sub-modul | Peran |
|---|---|---|
| `Program_bantuan.php` | `bantuan` (`program-bantuan`) | CRUD program & impor/ekspor peserta |
| `Peserta_bantuan.php` | `bantuan` (`peserta-bantuan`) | Daftar peserta per program |
| `Statistik_bantuan.php` | `statistik` (`statistik-kependudukan`) | Statistik penerima bantuan |
| `Dtks.php` | `satu-data` (`dtks`) | Kelola & sinkronisasi DTKS, cetak |
| `Suplemen.php` | `kependudukan` (`data-suplemen`) | Data suplemen + anggota |

Model: `Bantuan` (tabel `program`), `BantuanPeserta` (`program_peserta`), `Dtks` (`dtks`),
`DtksAnggota` (`dtks_anggota`), `DtksLampiran`, `DtksPengaturanProgram`.
Enum: `SasaranEnum`, `ListSasaranEnum`, `DtksEnum`, `Regsosek2022kEnum`. Service: `DtksService`.
Library: `DTKSRegsosEk2022k`.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin bantuan | `isCan('b')` daftar; `isCan('u')` tambah/ubah & impor; `isCan('h')` hapus. Slug akses: `program-bantuan`, `peserta-bantuan` |
| Admin satu-data | Kelola DTKS (`dtks`, kategori_pengaturan `DTKS`) |
| Publik | Statistik penerima bantuan tertentu bila `tampilkan_tombol_peta` mengizinkan (lihat `Statistik_web`) |

### Alur langkah

**A. Kelola program bantuan (`program`).**
1. `Program_bantuan::index()` menampilkan daftar; `create()`/`edit($id)` untuk form.
2. `validasi_bantuan($post)` memvalidasi; `SasaranEnum` menentukan sasaran:
   `1` Penduduk, `2` Keluarga/KK, `3` Rumah Tangga (RTM), `4` Kelompok.
3. Simpan ke `program` (mis. `nama`, `sasaran`, `ndesc`, `sdate`, `edate`, sumber dana `ASALDANA`).
4. **Hapus program diblokir** bila masih ada peserta (`Bantuan::delete` memeriksa peserta).

**B. Kelola peserta (`program_peserta`).**
5. Dari program, buka daftar peserta (`Peserta_bantuan` / `Program_bantuan::apipendudukbantuan`).
6. Pencarian peserta bergantung sasaran: `get_pilihan_penduduk`, `get_pilihan_kk`,
   `get_pilihan_rtm`, `get_pilihan_kelompok`.
7. Nilai kolom `peserta` disimpan sebagai **NIK** (penduduk), **no_kk** (keluarga), **no_rtm**
   (RTM), atau **id kelompok**. Kolom `kartu_*` menyimpan data kartu peserta.
8. Impor massal `Program_bantuan::impor()` (xls/xlsx via `BantuanImports`);
   ekspor `Program_bantuan::expor($program_id)` (xlsx). `bersihkan_data*()` untuk reset.

**C. DTKS (`dtks`).**
9. `Dtks::index()`/`datatables()` menampilkan daftar rumah tangga terdata.
10. `new($id_rtm)`: membuat entri DTKS dari RTM; `latest($id_rtm)` mengambil versi terbaru;
    `form($id)`/`save($id)` menyunting; `listAnggota($id_dtks)` menampilkan anggota.
11. `Dtks::savePengaturan($versi_dtks)` menyimpan versi (`DtksEnum`: `VERSION_CODE=2`,
    `REGSOS_EK2021_RT=1`, `REGSOS_EK2022_K=2`).
12. Sinkronisasi: `syncDtksRtm($rtm)` (controller) memanggil
    `DtksService::synchroniseDTKSWithOpenSid` → `DTKSRegsosEk2022k::syncronizeWithOpenSid`; pada model
    `Rtm`, `createOrDeleteDtks` memicu ini saat RTM ditandai `terdaftar_dtks=1`.
13. Impor mengikuti format `format-impor-dtks-regsosek2022k.xlsx`; ekspor memuat sheet keluarga &
    anggota; cetak massal via `cetak2()`/`cetakZip`.

**D. Suplemen (`data-suplemen`).** CRUD data suplemen (mis. data tambahan per penduduk) + ekspor.

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `program` | identitas program, `sasaran`, `ndesc`, `sdate`, `edate`, sumber dana |
| `program_peserta` | `program_id`, `peserta` (NIK/no_kk/no_rtm/id_kelompok), `kartu_*`, `config_id` |
| `dtks` | identitas RT/keluarga, `nik_kepala`/`no_kk`, versi, sumber data, `config_id` |
| `dtks_anggota` | `dtks_id`, identitas anggota |
| `dtks_lampiran`, `dtks_ref_lampiran` | lampiran & referensi lampiran |
| `dtks_pengaturan_program` | pengaturan program per konteks DTKS |
| `tweb_rtm` | `no_kk` (= `no_rtm`), `nik_kepala`, `bdt`, `terdaftar_dtks`, `config_id` |

### Aturan bisnis/penting

- **Sasaran menentukan tipe `peserta`.** Menyimpan NIK untuk penduduk, no_kk untuk KK, dst. Ini adalah
  kunci relasi polimorfik longgar — wajib divalidasi.
- **Hapus program gagal bila peserta ada.** Pertahankan sebagai *blocking rule*.
- **RTM → DTKS otomatis.** Menandai `terdaftar_dtks=1` pada `tweb_rtm` memicu pembuatan/menghapus
  entri DTKS. Rebuild harus mempertahankan efek samping ini (event/trigger atau service eksplisit).
- **Versi DTKS penting** (`Regsos Ek 2021 RT` vs `2022 Keluarga`); format impor/ekspor berbeda.
- **Impor xls/xlsx** memakai library `BantuanImports` (OpenSpout) — bukan HTML `.xls` palsu.

### Output/cetak

- Ekspor program & peserta `.xlsx` (OpenSpout); unduh kartu peserta (`unduh_kartu_peserta`).
- Cetak DTKS (keluarga & anggota) dan cetak massal (zip) via `Dtks`.
- Ekspor Suplemen `.xlsx`.

### Catatan rebuild Next.js

1. **Pisahkan entitas:** `Program`, `PesertaBantuan`, `Dtks`, `DtksAnggota`, `Suplemen`. `peserta`
   sebaiknya diganti relasi eksplisit bertipe (`peserta_type` + `peserta_id`) agar integritas terjaga.
2. **Event RTM↔DTKS:** implementasi sebagai domain event/service (bukan hard-coded di controller).
3. **Impor/ekspor:** port sebagai job background dengan template xlsx persis sama.
4. **Sasaran:** enum + validasi yang menolak peserta tak sesuai tipe.

---

## 4. Pembangunan

### Ringkasan

Pencatatan **rencana & realisasi pembangunan desa** beserta **dokumentasi progres bergambar**.
Controller: `Admin_pembangunan.php` (modul `pembangunan`) dan `Pembangunan_dokumentasi.php`.
Model: `app/Models/Pembangunan.php` (`pembangunan`), `app/Models/PembangunanDokumentasi.php`
(`pembangunan_ref_dokumentasi`). Enum: `SumberDanaEnum`, `SatuanWaktuEnum`.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin/operator pembangunan | `isCan('b')` daftar; `isCan('u')` tambah/ubah/dokumentasi; `isCan('h')` hapus |
| Publik | Melihat pembangunan (rencana/kegiatan/hasil) di website & peta |

### Alur langkah

1. `Admin_pembangunan::index()` menampilkan daftar; `form($id)` untuk tambah/ubah.
2. `validasi($post, $id, $oldFoto)` memvalidasi; upload foto via `upload_gambar_pembangunan`.
3. Simpan ke `pembangunan`: `slug` (unik per `config_id`), `sumber_dana` (array/json), `anggaran`
   (bigint), `perubahan_anggaran`, `status` (tinyint, default `1`).
4. Lokasi geospasial: `maps($id)` & `updateMaps($id)` mengatur koordinat/peta.
5. Status tampil: `lock($id)` mengubah status. Progres dihitung dari dokumentasi.
6. Dokumentasi progres: `Pembangunan_dokumentasi::create()/update()` menyimpan ke
   `pembangunan_ref_dokumentasi` (`id_pembangunan`, `gambar`, `persentase` (string), `keterangan`).
7. **Klasifikasi tipe via `scopeTipe`:** `rencana` = belum ada dokumentasi; `kegiatan` = persentase
   < 100%; `hasil` = persentase ≥ 100% (100%). `STATUS_PEMBANGUNAN`: `1`=0%, `2`=30%, `3`=80%,
   `4`=100%.

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `pembangunan` | `id`, `config_id`, `slug` (unik/config), `nama`, `sumber_dana` (cast array), `anggaran` (bigint), `perubahan_anggaran`, `status` (default 1), `latitude`/`longitude` (peta), foto |
| `pembangunan_ref_dokumentasi` | `id`, `id_pembangunan`, `gambar`, `persentase` (string), `keterangan` |

### Aturan bisnis/penting

- **Slug unik per desa** (`config_id`). Jangan global unik.
- **`sumber_dana` disimpan sebagai array/JSON** namun bertipe enum `SumberDanaEnum`.
- **Status & klasifikasi tipe adalah derivasi**, bukan sekadar kolom: `rencana`/`kegiatan`/`hasil`
  dihitung dari keberadaan dan nilai `persentase` dokumentasi.
- **`persentase` disimpan sebagai string** — perlu normalisasi di rebuild.
- Nama tabel dokumentasi **`pembangunan_ref_dokumentasi`** (bukan `pembangunan_dokumentasi`).

### Output/cetak

- Dokumentasi pembangunan dapat diekspor ke **Word `.doc`** (HTML + header Word) —
  lihat `LAMPIRAN-06`.
- Tampilan publik (website) + peta (GIS).
- Integrasi OpenDK untuk ekspor pembangunan (`app/Exports`).

### Catatan rebuild Next.js

1. **Skema tunggal + relasi dokumentasi.** Buat `pembangunan` dan `pembangunan_dokumentasi`
   (FK cascade). Simpan `sumber_dana` sebagai array bertipe enum, `persentase` sebagai numerik.
2. **Derivasi tipe** dijadikan kolom terhitung/service (`rencana`/`kegiatan`/`hasil`).
3. **Peta:** simpan lat/long sebagai `numeric`/PostGIS; endpoint ringan untuk peta web.
4. **Ekspor Word** (jika dipertahankan) di porting terpisah.

---

## 5. Layanan Mandiri (end-to-end)

### Ringkasan

Portal **warga** (self-service) untuk mendaftar akun, mengajukan surat, mengunggah syarat, memantau
status, dan menerima notifikasi. Terdiri dari sisi **publik** (`donjo-app/controllers/fmandiri/`)
dan sisi **admin** (`donjo-app/controllers/Mandiri.php`, `Setting_mandiri.php`,
`Permohonan_surat_admin.php`, `Surat_mohon.php`, `DataSuratPenduduk.php`).
Model: `app/Models/PendudukMandiri.php` (`tweb_penduduk_mandiri`), `app/Models/PermohonanSurat.php`
(`permohonan_surat`).

> **Tidak diulang di sini:** mesin template surat & alur cetak surat keterangan sudah dibahas di
> `LAMPIRAN-01-PERSURATAN.md` dan `ANALISIS §6.2`. Fokus di sini adalah **sisi akun & permohonan
> mandiri**.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Warga (publik) | Daftar akun (`setting('tampilkan_pendaftaran')`), login, ajukan surat, unggah syarat, cek status, kelola PIN |
| Admin layanan mandiri | Verifikasi akun, kelola PIN, tanggapi permohonan (slug `layanan-mandiri`/`pendaftar-layanan-mandiri`, dan `layanan-surat`) |

### Alur langkah

**A. Pendaftaran akun warga.** (`fmandiri/auth/RegisteredUserController`)
1. Warga membuka form pendaftaran (aktif hanya bila `setting('tampilkan_pendaftaran')`).
2. Isian wajib: `nama`, `tanggallahir`, `nik`, `no_kk`, `email`, `telegram`, `password` (6 digit),
   `scan_ktp`, `scan_kk`, `foto_selfie`.
3. `store()` memvalidasi & membuat baris `tweb_penduduk_mandiri` dengan **`aktif = 0`**.
4. Verifikasi email + telegram dikirim; akun belum bisa dipakai sebelum diverifikasi admin.

**B. Verifikasi akun oleh admin.** (`Mandiri`)
5. Admin membuka daftar pendaftar (`Mandiri::index`/`datatables`).
6. `verifikasi_warga($id_pend)` menetapkan **`aktif = true`**; `ajax_verifikasi_warga` untuk pratinjau.
7. `kirim($id_pend)` mengirim PIN/notifikasi (Telegram `kirimTelegram`, email `kirimEmail`).
8. `ubah_hp($id_pend)`, `ajax_hp`, `ajax_pin`, `delete` untuk kelola data akun.

**C. PIN.** (`PendudukMandiri`)
9. PIN **di-hash**; `generate_pin()` menghasilkan 6 digit (pola `strrev(random 6 digit)`).
10. Ganti PIN via `gantiPin` dengan OTP (Telegram/email). `kirimPinBaru` mengirim PIN baru.

**D. Pengajuan surat oleh warga.** (`fmandiri/Surat`)
11. Warga memilih jenis surat → `buat` membuat permohonan.
12. `cek_syarat` memastikan syarat surat terpenuhi (dokumen/berkas).
13. `form` menampilkan/mengisi form; `kirim` mengirim permohonan (status = `1`) dan memicu event
    `PermohonanSuratSubmitted`.
14. `proses` untuk membatalkan/memproses. Status `PermohonanSurat`:
    `0` Belum Lengkap, `1` Sedang Diperiksa, `2` Menunggu Tandatangan, `3` Siap Diambil,
    `4` Sudah Diambil, `5` Dibatalkan.
15. Setelah diproses admin (lihat LAMPIRAN-01 untuk verifikasi berjenjang/TTE), arsip masuk `log_surat`.

**E. Pengaturan.** (`Setting_mandiri`) Mengatur opsi layanan mandiri (PIN, notifikasi, dsb.).

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `tweb_penduduk_mandiri` | `id_pend`, `pin` (hash), `aktif`, `tanggal_buat`, data verifikasi, akses |
| `permohonan_surat` | `id`, `config_id`, `id_pemohon`, `id_surat`, `status`, berkas syarat, `no_hp_aktif`, keterangan |
| `log_surat` | arsip surat terbit (lihat LAMPIRAN-01) |
| `setting_aplikasi` (key `tampilkan_pendaftaran`, dsb.) | kontrol tampilnya pendaftaran |

### Aturan bisnis/penting

- **Akun tidak aktif sampai diverifikasi admin** (`aktif=0` → `true`).
- **Pendaftaran hanya tampil bila `setting('tampilkan_pendaftaran')` aktif.**
- **PIN selalu disimpan ter-hash**, tidak pernah plaintext; penggantian PIN memakai OTP.
- **Status permohonan** berjenjang `0..5`; hanya status tertentu yang memblokir/mengizinkan langkah
  berikutnya. `kirim` menetapkan status `1`.
- **Event `PermohonanSuratSubmitted`** memicu notifikasi ke admin (Telegram/FCM).
- **Verifikasi email + telegram** merupakan dua kanal; akun butuh verifikasi yang dikonfigurasi.

### Output/cetak

- Halaman web mandiri (Blade `theme::`), notifikasi Telegram/email.
- Surat hasil permohonan dicetak via mesin persuratan (LAMPIRAN-01) — tidak diulang di sini.

### Catatan rebuild Next.js

1. **Auth terpisah** dari admin: sesi warga berbasis `tweb_penduduk_mandiri`; hash PIN (mis. bcrypt/
   argon2) dan wajib OTP saat ganti PIN.
2. **State machine permohonan** (`0..5`) eksplisit; batasi transisi (mis. `5` final).
3. **Notifikasi** sebagai service (Telegram/email/FCM) dengan *queue*, bukan inline.
4. **Verifikasi akun** sebagai langkah eksplisit (pending → aktif) dengan audit.

---

## 6. Surat Dinas (naskah dinas internal)

### Ringkasan

Modul surat **dinas internal desa** (naskah dinas: pengaturan jenis, pencetakan, arsip, verifikasi
berjenjang, TTE, integrasi kecamatan). Modul `surat-dinas` dengan tiga sub-modul:

| Controller | Sub-modul | Peran |
|---|---|---|
| `Surat_dinas.php` | `pengaturan-surat-dinas` | CRUD jenis surat dinas, impor/ekspor, kode isian |
| `Surat_dinas_cetak.php` | `cetak-surat-dinas` | Form isian, pratinjau, PDF, konsep, cetak |
| `Surat_dinas_arsip.php` | `arsip-surat-dinas` | Arsip, verifikasi/tolak, TTE, cetak ulang |

Model: `SuratDinas` (`surat_dinas`), `LogSuratDinas` (`log_surat_dinas`), `SuratMasuk`
(`surat_masuk`), `SuratKeluar` (`surat_keluar`). Enum: `DerajatSuratEnum` (Biasa/Segera/Sangat
Segera), `KarakterSuratEnum` (Biasa/Terbata/…), `StatusSuratKecamatanEnum`.
Helper: `PeriksaKlasifikasiSurat`.

> **Tidak diulang di sini:** mesin penomoran & template surat *layanan* (keterangan) sudah dibahas di
> `LAMPIRAN-01`. Fokus domain ini adalah **surat dinas internal + verifikasi/TTE + arsip dinas**.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Operator | Menyusun konsep, mengajukan verifikasi |
| Sekretaris Desa (sekdes) | Verifikasi (bila `setting` mengaktifkan) |
| Kepala Desa (kades) | Verifikasi akhir (bila `setting` mengaktifkan) |
| Admin arsip | Kelola arsip, cetak ulang, kirim ke kecamatan |

### Alur langkah

**A. Pengaturan jenis surat dinas.** (`Surat_dinas`)
1. `index()`/`form()` mengelola `surat_dinas`: `jenis` (`3` Sistem, `4` Desa), status `kunci`/`favorit`,
   `form_isian` + `kode_isian` (JSON), `margin`, `format_nomor`, `syarat_surat`.
2. `SuratDinas::SISTEM = [3]` menandai jenis bawaan yang tidak bisa dihapus.
3. Impor/ekspor jenis surat dinas didukung.

**B. Menyusun & mencetak.** (`Surat_dinas_cetak`)
4. Form isian dinamis dari `kode_isian`; pratinjau; simpan **konsep** (status `KONSEP`).
5. Generate **PDF** (Html2Pdf langsung, tanpa TinyMCE).

**C. Verifikasi berjenjang.** (`Surat_dinas_arsip` + `log_surat_dinas`)
6. Status `log_surat_dinas`: `KONSEP=0`, `CETAK=1`, `TOLAK=-1`.
7. Rantai verifikasi: **operator → sekdes (bila diaktifkan) → kades (bila diaktifkan) → TTE (bila
   diaktifkan)**. Setiap tahap menandai kolom `verifikasi_operator` / `verifikasi_sekdes` /
   `verifikasi_kades`.
8. `tolak` mencatat alasan; `tte` mengirim ke layanan eksternal.
9. Integrasi TTE: `external_api/Tte`, memakai setting `tte_api`, `tte_username`, `tte_password`,
   `ssl_tte`. Catatan error TTE disimpan (mis. `log_tte`).

**D. Penomoran.**
10. Setting `penomoran_surat_dinas` menentukan mode:
    `1` semua surat layanan, `2` per jenis, `3` gabungan layanan/masuk/keluar, `4` per klasifikasi.
    Token format: `[nomor_surat]`, `[nomor_surat,N]`, `[kode_surat]`, `[tahun]`, `[bulan_romawi]`,
    `[kode_desa]`.

**E. Arsip & kecamatan.**
11. `log_surat_dinas` menyimpan `no_surat`, `urls_id` (verifikasi QR).
12. Surat masuk/keluar pada `surat_masuk`/`surat_keluar`.
13. Status kecamatan: `StatusSuratKecamatanEnum` — `1` TidakAktif, `2` BelumDikirim, `3` SudahDikirim.

**F. Notifikasi.** Verifikasi memakai Telegram + FCM (`FirebaseEnum::SERVER_KEY`/`SENDER_ID`).

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `surat_dinas` | `jenis` (3 Sistem/4 Desa), `kunci`, `favorit`, `form_isian`+`kode_isian` (JSON), `margin`, `format_nomor`, `syarat_surat` |
| `log_surat_dinas` | `status` (KONSEP 0/CETAK 1/TOLAK -1), `verifikasi_operator`/`sekdes`/`kades`, `tte`, `no_surat`, `urls_id` |
| `surat_masuk`, `surat_keluar` | buku agenda surat masuk/keluar |
| `urls` | pemendek URL + QR verifikasi (lihat LAMPIRAN-01 untuk detail) |

### Aturan bisnis/penting

- **Rantai verifikasi bergantung setting.** Tahap sekdes/kades/TTE opsional (dikonfigurasi). Harus
  dihormati urutannya.
- **Jenis sistem tak terhapus** (`SISTEM=[3]`). Jenis desa (`4`) bebas dikelola.
- **Penomoran multi-mode**; format token harus dievaluasi berurutan agar nomor unik.
- **Status kecamatan** terpisah dari status internal (`1/2/3`).
- **Kode isian & form isian disimpan sebagai JSON** — perlu migrasi struktur terpisah di rebuild.

### Output/cetak

- PDF surat dinas langsung (Html2Pdf). Detail bentuk cetak di `LAMPIRAN-06`.
- QR verifikasi via tabel `urls`.

### Catatan rebuild Next.js

1. **State machine + approval chain** sebagai tabel/workflow (operator → sekdes → kades → TTE),
   bukan flag tersebar; simpan jejak tiap tahap + siapa & kapan.
2. **Editor dinamis** untuk `kode_isian`/`form_isian` (JSON schema) agar bisa render form & PDF.
3. **Penomoran** sebagai service transaksional dengan lock, menerapkan format token sesuai mode.
4. **TTE & arsip kecamatan** sebagai integrasi eksternal terisolasi (retry + log error).

---

## 7. Analisis (kuesioner/indikator)

### Ringkasan

Modul **Analisis** (survei/kuesioner berbasis indikator & klasifikasi, mis. BDT, SDGs) kini hidup di
**Laravel Module**: `Modules/Analisis` (namespace `Modules\Analisis`), dengan route bernama
`analisis_master.*`, `analisis_indikator.{master}.*`, `analisis_parameter.{indikator}.*`,
`analisis_kategori.{master}.*`, `analisis_klasifikasi.{master}.*`, `analisis_respon.{master}.*`,
`analisis_periode.{master}.*`, `analisis_laporan.{master}.*`, `analisis_statistik_jawaban.{master}.*`.
Controller legacy `Setting_analisis.php` (modul `analisis`, sub-modul `pengaturan-analisis`) masih ada.

Controller (module): `AnalisisMasterController`, `AnalisisIndikatorController`,
`AnalisisKategoriController`, `AnalisisKlasifikasiController`, `AnalisisParameterController`,
`AnalisisPeriodeController`, `AnalisisResponController`, `AnalisisResponChildController`,
`AnalisisLaporanController`, `AnalisisStatistikJawabanController`.
Model: `AnalisisMaster`, `AnalisisIndikator`, `AnalisisParameter`, `AnalisisKategori`,
`AnalisisKlasifikasi`, `AnalisisRespon`, `AnalisisResponHasil`, `AnalisisResponBukti`,
`AnalisisPeriode`. Library: `Analisis.php`, `Bdt.php`, `Gform.php`, `Import.php`.
Enum: `AnalisisRefSubjekEnum` (1 Penduduk…8 RT), `AnalisisTipeIndikatorEnum`
(1 Pilihan Tunggal, 2 Ganda, 3 Isian angka, 4 Isian tulisan), `AnalisisRefStateEnum`
(1 Belum, 2 Sedang, 3 Selesai).

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin analisis | Kelola master, indikator, parameter, kategori, klasifikasi, periode (CRUD) |
| Operator/responden | Mengisi respon kuesioner pada **periode aktif** |
| Publik | Statistik hasil (bila dipublikasikan) |

### Alur langkah

1. **Master** (`analisis_master`): buat master dengan `subjek_tipe` (`AnalisisRefSubjekEnum`),
   `jenis` (`==1` = sistem/terkunci), `lock`, `pembagi`, `id_child`.
2. **Kategori** & **klasifikasi** per master.
3. **Indikator** (`analisis_indikator`) dengan `tipe` (`AnalisisTipeIndikatorEnum`) dan `bobot`.
4. **Parameter** (`analisis_parameter`) per indikator, masing-masing bernilai (`nilai`).
5. **Periode** (`analisis_periode`): `aktif`, `id_state` (`AnalisisRefStateEnum`),
   `tahun_pelaksanaan`. **Respon hanya boleh pada periode `aktif=YA`.**
6. **Respon** (`analisis_respon`): `AnalisisRespon::updateKuisioner` menangani input
   `rb` (radio/pilihan tunggal), `cb` (checkbox/ganda), `ia` (isian angka), `it` (isian teks).
7. **Akumulasi/skor:**
   `SUM(indikator.bobot * parameter.nilai)` dengan syarat `act_analisis = 1`.
   Hasil dapat disimpan di `analisis_respon_hasil`; bukti di `analisis_respon_bukti`.
8. **Impor respon** (`.xls`): memerlukan *magic key*
   `'AN' . (($per+3)*($mas+7)*($subjek*3))`. Tersedia impor **BDT 2015** dan impor **Google Form**
   (library `Gform`, setting `api_gform_credential`).
9. **Laporan** (`AnalisisLaporanController`) & **Statistik Jawaban**
   (`AnalisisStatistikJawabanController`) menampilkan rekap.

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `analisis_master` | `subjek_tipe`, `jenis` (==1 sistem), `lock`, `pembagi`, `id_child` |
| `analisis_indikator` | `id_master`, `tipe`, `bobot`, `act_analisis` |
| `analisis_parameter` | `id_indikator`, `nilai` |
| `analisis_kategori` | kategori per master |
| `analisis_klasifikasi` | klasifikasi rentang nilai |
| `analisis_respon` | `id_periode`, `id_subjek`, jawaban |
| `analisis_respon_hasil` | hasil akumulasi per subjek |
| `analisis_respon_bukti` | bukti pendukung |
| `analisis_periode` | `aktif`, `id_state`, `tahun_pelaksanaan` |
| `analisis_ref_subjek`, `analisis_ref_state`, `analisis_tipe_indikator`, `analisis_partisipasi`, `analisis_kategori_indikator` | tabel referensi |

### Aturan bisnis/penting

- **Periode aktif wajib** untuk mengisi respon; jika tidak, alihkan dengan error.
- **Rumus skor wajib identik:** `bobot × nilai` dijumlahkan untuk parameter dengan `act_analisis=1`.
- **Tipe indikator menentukan kontrol input** (`rb`/`cb`/`ia`/`it`).
- **Master bertipe sistem** (`jenis==1`) bersifat terkunci.
- **Magic key impor** harus dipertahankan agar file impor lama tetap valid.
- **Google Form / BDT** adalah jalur impor khusus dengan kredensial (`api_gform_credential`).

### Output/cetak

- Laporan hasil analisis & statistik jawaban (tabel + grafik) — bentuk cetak di `LAMPIRAN-06`.
- Ekspor/impor `.xls` respon.

### Catatan rebuild Next.js

1. **Skema relasional penuh**: master → indikator → parameter → respon, dengan periode & state
   eksplisit. Terapkan constraint periode aktif di level service.
2. **Mesin skoring** terpusat (library) agar rumus konsisten dengan OpenSID.
3. **Impor** (magic key, BDT, Google Form) sebagai adapter terpisah + validasi format.
4. **Tipe indikator** memetakan ke komponen form dinamis.

---

## 8. Bumindes (Buku Administrasi Desa)

### Ringkasan

Rangkaian **buku administrasi desa** (buku induk, mutasi, sementara, rekap, rencana/kegiatan/hasil
pembangunan, kekayaan/inventaris desa, tanah desa/kas, kader, arsip desa). Modul
`buku-administrasi-desa` dengan beberapa sub-modul (`arsip-desa`, `administrasi-umum`,
`administrasi-pembangunan`, dll.).

| Controller | Sub-modul | Peran |
|---|---|---|
| `Bumindes_penduduk_induk.php` | administrasi | Buku induk penduduk |
| `Bumindes_penduduk_ktpkk.php` | administrasi | Buku KTP & KK |
| `Bumindes_penduduk_mutasi.php` | administrasi | Buku mutasi penduduk |
| `Bumindes_penduduk_sementara.php` | administrasi | Buku penduduk sementara |
| `Bumindes_penduduk_rekapitulasi.php` | administrasi | Rekapitulasi penduduk (1 laporan ber-PDF asli) |
| `Bumindes_rencana_pembangunan.php` | `administrasi-pembangunan` | Buku rencana pembangunan (base) |
| `Bumindes_kegiatan_pembangunan.php` | `administrasi-pembangunan` | Extends base; `tipe=kegiatan` |
| `Bumindes_hasil_pembangunan.php` | `administrasi-pembangunan` | Buku hasil pembangunan |
| `Bumindes_inventaris_kekayaan.php` | `administrasi-umum` | Buku kekayaan desa (Permendagri 47) |
| `Bumindes_tanah_desa.php` | `administrasi-umum` | Buku tanah desa |
| `Bumindes_tanah_kas_desa.php` | `administrasi-umum` | Buku tanah kas desa |
| `Bumindes_kader.php` | administrasi | Buku kader |
| `Bumindes_arsip.php` | `arsip-desa` | Arsip fisik surat |

Model pendukung: `TanahDesa` (`tanah_desa`), `MasterInventaris`, `ArsipFisikSurat`.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin/operator desa | Isi/lihat/cetak buku sesuai sub-modul (`isCan('b'|'u'|'h')`) |
| Publik | Sebagian buku (mis. rencana pembangunan) tampil di website |

### Alur langkah

1. **Penduduk**: `Bumindes_penduduk_*` menyajikan buku berdasarkan data penduduk aktif
   (view `keluarga_aktif`/`penduduk_aktif`), termasuk mutasi & penduduk sementara.
2. **Pembangunan**: `Bumindes_rencana_pembangunan` adalah basis; `Bumindes_kegiatan_pembangunan`
   **extends** class itu dan menyaring `tipe=kegiatan`; `Bumindes_hasil_pembangunan` untuk hasil.
   (Sumber data = tabel `pembangunan` + dokumentasi.)
3. **Kekayaan**: `Bumindes_inventaris_kekayaan` memakai `MasterInventaris::permen47` untuk membentuk
   rekap kekayaan desa (menggabungkan seluruh jenis inventaris).
4. **Tanah desa**: `Bumindes_tanah_desa` mengelola `tanah_desa` (model `TanahDesa`) — **validasi NIK**
   (pemilik) wajib ada. `Bumindes_tanah_kas_desa` + referensi `ref_asal_tanah_kas`,
   `ref_peruntukan_tanah_kas`, `ref_persil_mutasi`.
5. **Kader**: `Bumindes_kader` mengelola data kader.
6. **Arsip**: `Bumindes_arsip` mengelola arsip fisik surat dengan kategori `ArsipFisikSurat`:
   `dokumen_desa`, `surat_masuk`, `surat_keluar`, `kependudukan`, `layanan_surat`.

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `tanah_desa` | identitas tanah, NIK pemilik (validasi), luas, lokasi, jenis hak |
| `tanah_kas_desa` + `ref_asal_tanah_kas`, `ref_peruntukan_tanah_kas`, `ref_persil_mutasi` | tanah kas desa & referensi |
| `tweb_aset`/inventaris | sumber buku kekayaan (lewat `MasterInventaris`) |
| `pembangunan`, `pembangunan_ref_dokumentasi` | sumber buku pembangunan |
| arsip fisik surat | kategori `ArsipFisikSurat` |
| view `keluarga_aktif`, `master_inventaris_view`, `rekap_mutasi_inventaris_view` | read model |

### Aturan bisnis/penting

- **Bumindes tidak menyimpan data baru untuk penduduk** — ia *membaca* data penduduk/keluarga dan
  membentuk buku (kecuali buku tanah, kader, arsip yang punya tabel sendiri).
- **Kegiatan extends rencana** — logika dasar dipakai bersama, dibedakan `tipe`.
- **Kekayaan desa = gabungan semua jenis inventaris** (jangan duplikasi tabel).
- **Tanah desa wajib NIK pemilik valid.**
- **Rekapitulasi penduduk** adalah satu-satunya laporan Bumindes ber-**PDF asli**
  (`Bumindes_penduduk_rekapitulasi.php` memakai `buat_pdf()`), sisanya HTML cetak/`.xls` palsu.

### Output/cetak

- HTML cetak (mayoritas) & `.xls` palsu (HTML ber-ekstensi `.xls`).
- Rekapitulasi penduduk: **PDF asli**.
- Detail kop/kolom per buku ada di `LAMPIRAN-06`.

### Catatan rebuild Next.js

1. **Buku sebagai *view/report*** dari data inti (penduduk, pembangunan, inventaris) — jangan
   duplikasi penyimpanan.
2. **Tanah, kader, arsip** tetap entitas tersendiri dengan CRUD.
3. **Format cetak** (kop, kolom, TTD) mengikuti `LAMPIRAN-06`; bedakan PDF asli vs HTML cetak.
4. **Validasi NIK** untuk tanah desa; kategori arsip sebagai enum.

---

## 9. Kelompok / Lembaga / RTM / Rumah Tangga

### Ringkasan

Tiga entitas sosial: **Kelompok** (kelompok masyarakat), **Lembaga** (lembaga desa — subclass
kelompok dengan `tipe=lembaga`), dan **RTM / Rumah Tangga** (`tweb_rtm`). Controller:

| Controller | Modul / Sub-modul | Peran |
|---|---|---|
| `Kelompok.php` | `kependudukan` / `kelompok` | CRUD kelompok (tipe=kelompok) |
| `Kelompok_master.php` | `kependudukan` | Master tipe kelompok |
| `Kelompok_anggota.php` | `kependudukan` | Anggota kelompok + jabatan |
| `Lembaga.php` (extends `Kelompok`) | `info-desa` / `lembaga-desa` | CRUD lembaga (tipe=lembaga) |
| `Lembaga_master.php`, `Lembaga_anggota.php` | `info-desa` | Master & anggota lembaga |
| `Rtm.php` | `kependudukan` / `rumah-tangga` | CRUD RTM |
| `PeriksaKepalaRtm.php` | — | Pemeriksa kepala RTM |

Model: `Kelompok` (`kelompok`), `KelompokMaster` (`kelompok_master`), `KelompokAnggota`
(`kelompok_anggota`), `Rtm` (`tweb_rtm`), `RtmHubungan` (`tweb_rtm_hubungan`).
Enum: `JabatanKelompokEnum` (KETUA=1 … ANGGOTA=90), `HubunganRTMEnum`
(KEPALA_RUMAH_TANGGA=1, ANGGOTA=2), `StatusRTMEnum`.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin kependudukan | Kelola kelompok, anggota, RTM |
| Admin info-desa | Kelola lembaga & anggota lembaga |
| Publik | Melihat lembaga/kelompok di website |

### Alur langkah

**A. Kelompok / Lembaga.**
1. `Kelompok::index()`/`form()` mengelola `kelompok`: `tipe` (`kelompok`|`lembaga`), `id_master`
   (→ `kelompok_master`), `id_ketua`, `slug`, `kode`, `no_sk_pendirian`, `logo`.
2. `Lembaga extends Kelompok` dengan `tipe=lembaga` (modul `info-desa`/`lembaga-desa`).
3. **Hapus kelompok diblokir bila masih punya anggota.**

**B. Anggota kelompok & jabatan.** (`Kelompok_anggota`)
4. Tambah anggota: `id_kelompok`, `id_penduduk`, `no_anggota`, `jabatan`, `no_sk_jabatan`, `foto`,
   `tipe`.
5. `UbahJabatan`: bila `jabatan=KETUA`, kolom `kelompok.id_ketua` diperbarui; bila KETUA diubah ke
   jabatan lain, `id_ketua` diset **`-9999`** (penanda tak ada ketua).

**C. RTM / Rumah Tangga.** (`Rtm`)
6. `Rtm::index()`/CRUD `tweb_rtm`: `no_kk` (= `no_rtm`), `nik_kepala`, `bdt`, `terdaftar_dtks`.
7. Saat insert, **`no_kk` digenerate otomatis**: `kode_desa` + nomor urut 5 digit.
8. Penduduk terkait menyimpan `id_rtm` (= string `no_kk`) dan `rtm_level`
   (`1` = kepala rumah tangga, lihat `HubunganRTMEnum`).
9. **`terdaftar_dtks=1`** memicu sinkronisasi DTKS (lihat domain 3).

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `kelompok` | `tipe` (`kelompok`/`lembaga`), `id_master`, `id_ketua`, `slug`, `kode`, `no_sk_pendirian`, `logo` |
| `kelompok_master` | `tipe`, nama master |
| `kelompok_anggota` | `id_kelompok`, `id_penduduk`, `no_anggota`, `jabatan`, `no_sk_jabatan`, `foto`, `tipe` |
| `tweb_rtm` | `no_kk` (= `no_rtm`), `nik_kepala`, `bdt`, `terdaftar_dtks`, `config_id` |
| `tweb_rtm_hubungan` | relasi hubungan anggota RTM |
| `tweb_penduduk` (kolom terkait) | `id_rtm`, `rtm_level` |

### Aturan bisnis/penting

- **Lembaga = kelompok bertipe lembaga** (inheritance di kode, bukan tabel terpisah).
- **Ketua kelompok sinkron** dengan jabatan anggota; penanda `-9999` saat tak ada ketua.
- **Hapus kelompok terblokir** bila masih ada anggota.
- **`no_rtm` = `no_kk`** (satu kolom, dua makna) — hati-hati saat migrasi.
- **`id_rtm` pada penduduk = string**, bukan integer.
- **RTM ↔ DTKS** punya efek samping otomatis.

### Output/cetak

- Daftar kelompok/lembaga & anggota (web/website). Bentuk cetak mengikuti `LAMPIRAN-06`.
- Data RTM tampil sebagai bagian kependudukan.

### Catatan rebuild Next.js

1. **Gunakan *single table inheritance*** untuk `kelompok`/`lembaga` (`tipe`), atau tabel
   `organisasi` + `organisasi_anggota`.
2. **Konsistensi jabatan↔ketua** dijadikan invariant service (transaksional).
3. **RTM**: gunakan `no_rtm` sebagai business key; `id_rtm` penduduk jadikan relasi eksplisit (FK)
   alih-alih string.
4. **Event RTM→DTKS** dibuat eksplisit.

---

## 10. Website Publik

### Ringkasan

Situs publik desa: artikel/berita, kategori menu, agenda, komentar, galeri & slider, widget, teks
berjalan, sinergi program, statistik publik, peta GIS, pengaduan warga, dokumen unduhan, dan
statistik pengunjung. Dua sisi: **admin** (`donjo-app/controllers/*.php` dengan modul `admin-web`)
dan **publik/theme** (`donjo-app/controllers/fweb/*` + base `donjo-app/core/Web_Controller.php`).

| Sisi | Komponen kunci |
|---|---|
| Admin | `Web.php` (artikel), `Slider.php`, `Gallery.php`, `Komentar.php`, `Teks_berjalan.php`, `Web_widget.php`, `Sinergi_program.php`, `Pengunjung.php`, `Statistik_web.php`, `Dokumen_web.php` |
| Publik | `fweb/Utama.php` (beranda), `fweb/Artikel.php`, `fweb/Pengaduan.php`, `fweb/Galeri.php`, `fweb/Statistik.php`, `fweb/Peta.php`, dsb. |
| Internal API | `internal_api/Artikel.php`, `internal_api/Galeri.php`, `internal_api/Pengaduan.php`, `internal_api/Statistik.php`, … |
| Base publik | `donjo-app/core/Web_Controller.php` (share data ke semua view tema) |

Model: `Artikel` (`artikel`), `Kategori` (`kategori`), `Komentar` (`komentar`), `Menu` (`menu`),
`Galery` (`gambar_gallery`), `Widget` (`widget`), `TeksBerjalan` (`teks_berjalan`),
`SinergiProgram` (`sinergi_program`), `StatistikPengunjung` (`sys_traffic`), `Dokumen`.
Enum: `StatusEnum`, `AktifEnum`, `SistemEnum`, `TampilanArtikelEnum`, `StatusPengaduanEnum`.

### Aktor & hak akses

| Aktor | Hak |
|---|---|
| Admin web | `isCan('b')` daftar; `isCan('u')` tambah/ubah/status; `isCan('h')` hapus (modul `admin-web`) |
| Kontributor (grup 4) | Boleh menulis, tetapi artikel yang dibuat **`enabled=0`** (perlu persetujuan) |
| Publik | Membaca berita, komentar (bila dibuka), galeri, statistik; mengirim **pengaduan** |

Catatan: beberapa controller menolak jalan bila `setting('offline_mode') >= 2`.

### Alur langkah

**A. Artikel / berita.** (`Web.php`)
1. `index($cat)` menampilkan daftar (per kategori `id_kategori` atau `tipe` statis/agenda/keuangan);
   `datatables()` untuk grid.
2. `form($cat, $id)` → `insert($cat)` / `update($cat, $id)` menyimpan.
3. Validasi: `judul` & `isi` wajib. `judul` dibersihkan (`judul()`), `slug` unik
   (`unique_slug('artikel', ...)`).
4. Upload gambar `gambar`, `gambar1..3` (`uploadPicture`, `LOKASI_FOTO_ARTIKEL`) dan dokumen lampiran
   (`MIME_TYPE_DOKUMEN`/`EXT_DOKUMEN`, nama file dienkripsi `Checker`).
5. **Kontributor (`id_grup=4`)**: `enabled = StatusEnum::TIDAK` (tidak otomatis aktif).
6. Aksi status via `lock($cat, $column, $id)`: `enabled`, `boleh_komentar`, `headline`
   (hanya satu — `onlyOne=true`), `slider`.
7. `update_kategori()` memindah kategori/tipe. `delete()`/`hapus($cat)` menghapus + file terkait.
8. `reset('statis')` mereset `hit` sebesar persentase.

**B. Beranda publik.** (`Web_Controller::viewShare`, `fweb/Utama::index`)
9. `viewShare()` menghitung **statistik pengunjung** (`StatistikPengunjung::counterVisitor`, sekali per
   hari per sesi), lalu membagikan: `menu_kiri` (`Kategori::daftar`), `teks_berjalan`, `slide_artikel`,
   `slider_gambar` (`Artikel::slideGambar`), `widgetAktif`, `w_gal` (`Galery::widget`), agenda
   (`Agenda::show`), komentar terbaru, arsip (`ArsipArtikel`), aparatur, sinergi program, widget
   keuangan, jam kerja.
10. `fweb/Utama::index()` memuat artikel (`enable()`, `headline != 1`, `tgl_upload <= now`, search),
    `headline`, feed (bila `covid_rss`), transparansi APBDes (bila `apbdes_footer`), data covid.
11. Artikel dibaca → `Artikel::read()` menambah `hit` (sekali per sesi, kecuali robot/crawler).

**C. Slider.** (`Slider.php`)
12. `update()` menyimpan setting `sumber_gambar_slider` dan `jumlah_gambar_slider`. Bila sumber `3`
    (dari galeri), wajib ada album aktif (`Galery::daftar()` tidak kosong).

**D. Galeri.** (`Gallery.php`)
13. Hierarki album: `parrent=0` = album, `parrent>0` = subgaleri; `tipe` (`1` album, `2` sub).
14. `insert()`/`update()` (upload `LOKASI_GALERI`, atau URL), `lock` (status), `slider` (jadikan
    slider — album wajib punya isi), `delete` (diblokir bila masih punya subgaleri), `tukar` (urut).
15. **Kontributor (`grup=4`)** → `enabled=0`.

**E. Komentar.** (`Komentar.php`)
16. `datatables()` menampilkan komentar level atas (`whereNull('parent_id')`) berdasar status
    (`ACTIVE`/`NONACTIVE`/`UNREAD`). `balas($id)` membuat komentar anak (`parent_id`), mengaktifkan
    induk bila perlu. `lock` mengubah status; `delete` menghapus.

**F. Teks berjalan.** (`Teks_berjalan.php`)
17. CRUD `teks_berjalan`: `teks`, `tipe` (`1` internal artikel, `2` eksternal URL),
    `judul_tautan`, `status`, `tautan`, `urut`. `tukar()` untuk urutan.

**G. Widget.** (`Web_widget.php`)
18. `jenis_widget`: `1` Sistem (tak bisa hapus/edit isi), `2`/`3` Statis. `admin($widget)` untuk form
    admin (mis. `aparatur_desa`); `update_setting($widget)` menyimpan `setting` (JSON).
    Endpoint statis dari tema (`ListWidgetBaru` memindai `resources/views/widgets/*.blade.php`).
    **Butuh ekstensi PHP `tidy`** (`cek_tidy`).

**H. Sinergi program.** (`Sinergi_program.php`)
19. CRUD `sinergi_program`: `judul`, `gambar` (dikonversi **WebP** via Spatie Image), `tautan`,
    `status`, `urut`. Cache `sinergi_program` di-*forget* saat model boot.

**I. Pengaduan warga (publik → admin).** (`fweb/Pengaduan.php` + `Pengaduan_admin.php`)
20. Warga membuka form (`hak_akses_menu('pengaduan')`), mengisi `nik`, `nama`, `email`, `telepon`,
    `judul`, `isi`, foto.
21. `kirim()` memverifikasi **captcha**; menolak bila IP tak dikenali; membatasi jumlah per hari
    (`setting('jumlah_aduan_pengguna')`, dihitung per `ip_address` & tanggal).
22. Simpan ke `pengaduan` (`id_pengaduan` NULL = dari warga). Kirim notifikasi Telegram
    (`telegram_notifikasi`) & notifikasi admin.
23. Admin `Pengaduan_admin`: daftar, `form`/`detail`, `kirim($id)` **menanggapi** — memperbarui status
    induk & membuat baris balasan (`id_pengaduan = id`). Status `StatusPengaduanEnum`:
    `1` Menunggu, `2` Sedang, `3` Selesai. `delete` menghapus induk + anak.

**J. Pengunjung.** (`Pengunjung.php`)
24. Statistik dari `sys_traffic`: hari ini/kemarin/minggu/bulan/tahun/total; `cetak()` menghasilkan
    laporan cetak.

**K. Statistik publik.** (`Statistik_web.php`)
25. `load_chart_gis($lap)` menampilkan peta/grafik kependudukan, dibatasi `cek_akses($lap)` yang
    membaca `setting('tampilkan_tombol_peta')` (Statistik Penduduk/Keluarga/Bantuan). Filter
    dusun/RW/RT disimpan di sesi.

**L. Dokumen.** (`Dokumen_web.php`) `unduh_berkas`, `tampil`, `unduh` dari `LOKASI_DOKUMEN`
(nama file dienkripsi).

### Tabel & kolom kunci

| Tabel | Kolom kunci |
|---|---|
| `artikel` | `id`, `config_id`, `gambar`/`gambar1..3`, `isi`, `enabled`, `tgl_upload`, `id_kategori`, `id_user`, `judul`, `headline`, `dokumen`, `link_dokumen`, `boleh_komentar`, `slug`, `hit`, `slider` (+`tampilan`, `tipe` via kolom tambahan) |
| `kategori` | `id`, `config_id`, `kategori`, `tipe` (default 1), `urut`, `enabled`, `parrent`, `slug` |
| `komentar` | `id`, `config_id`, `id_artikel`, `owner`, `email`, `subjek`, `komentar`, `tgl_upload`, `status`, `tipe`, `no_hp`, `updated_at`, `is_archived`, `permohonan` (+`parent_id`) |
| `menu` | `id`, `config_id`, `nama`, `link`, `parrent`, `link_tipe`, `enabled`, `urut` |
| `gambar_gallery` | `id`, `config_id`, `nama`, `jenis` (1 gambar/2 URL), `gambar`, `parrent`, `tipe`, `enabled`, `slider`, `urut` |
| `widget` | `id`, `config_id`, `isi`, `enabled`, `judul`, `jenis_widget` (1 sistem/2/3 statis), `urut`, `form_admin`, `setting` (JSON), `foto` |
| `teks_berjalan` | `id`, `config_id`, `teks`, `urut`, `status`, `tipe` (default 1), `tautan`, `judul_tautan`, timestamps |
| `sinergi_program` | `uuid`, `config_id`, `judul`, `gambar`, `tautan`, `status`, `urut` |
| `pengaduan` | `id`, `config_id`, `id_pengaduan` (NULL=warga), `nik`, `nama`, `email`, `telepon`, `judul`, `isi`, `status` (default 1), `foto`, `ip_address`, timestamps |
| `sys_traffic` | `Tanggal`, `Jumlah`, `ipAddress` (JSON) |
| `dokumen` | nama berkas, lokasi |

### Aturan bisnis/penting

- **Kontributor (`grup=4`) tidak bisa langsung mengaktifkan** artikel/galeri (`enabled=0`).
  `bolehUbah()` untuk artikel: `id_user == auth` atau `id_grup != 4`.
- **Artikel milik OpenKab** (`config_id == null`) tidak bisa diedit/dihapus di instance desa.
- **Headline hanya satu** (`onlyOne`); **slider** hanya artikel `enabled=1`.
- **Galeri**: album tak bisa dihapus bila punya subgaleri; album slider wajib berisi.
- **Pengaduan**: dibatasi captcha + jumlah per IP per hari; balasan berelasi `id_pengaduan`.
- **Statistik publik dibatasi setting** `tampilkan_tombol_peta`.
- **`offline_mode >= 2` menyembunyikan website**; `Web_widget`/`Slider`/`Web` redirect ke beranda.
- **`hit` artikel** ditambah sekali per sesi; robot/crawler dikecualikan.
- **`Widget` sistem** (`jenis_widget=1`) tidak dapat dihapus/diubah isinya.

### Output/cetak

- Halaman tema (Blade `theme::`) — beranda, artikel, galeri, peta, statistik.
- Laporan cetak statistik pengunjung (`Pengunjung::cetak`).
- Unduhan dokumen & lampiran artikel (nama file dienkripsi).
- Ringkasan APBDes di footer (bila `apbdes_footer`).

### Catatan rebuild Next.js

1. **Pisahkan admin (CMS) & publik.** Artikel, kategori, komentar, galeri, widget, teks berjalan,
   sinergi program adalah entitas CMS; publik hanya *read model* (termasuk widget/agenda agregat).
2. **Alur moderasi** kontributor→aktif harus dipertahankan (`enabled` default nonaktif untuk grup
   kontributor; headline tunggal).
3. **Pengaduan** sebagai alur ticketing sederhana: tiket (warga) + balasan (admin) dengan status
   `1/2/3`, anti-spam (captcha & rate limit per IP).
4. **Statistik pengunjung** disimpan harian-agregat (`sys_traffic`), hitung unik per sesi; ekspos
   statistik publik terbatas sesuai setting.

---

## Matriks Alur → Dokumen

Ringkasan agar tidak ada duplikasi/kelalaian terhadap dokumen lain di folder ini.

| # | Alur / Domain | Bagian di dokumen ini | ANALISIS § | LAMPIRAN terkait | Catatan overlap |
|---|---|---|---|---|---|
| 1 | Keuangan / APBDes | §1 | §6.3 (laporan desa, sebagian) | 05 (ERD), 06 (output), 07 (modul) | §6.3 hanya laporan umum; detail APBDes di sini |
| 2 | Inventaris / Aset | §2 | — | 05, 06, 07 | Rekap Permendagri 47 juga di §8 (Bumindes) |
| 3 | Bantuan & DTKS | §3 | — | 03 (enum), 05, 06, 07 | Sasaran/versi DTKS di §3 |
| 4 | Pembangunan | §4 | — | 05, 06, 07 | Dipakai ulang oleh Bumindes (§8) |
| 5 | Layanan Mandiri | §5 | §6.1 (pendaftaran penduduk) — **berbeda** | 01 (mesin surat), 02 (RBAC) | §6.1 = data penduduk; §5 = akun & permohonan mandiri |
| 6 | Surat Dinas | §6 | — | **01** (mesin surat & penomoran), 06 | Mesin surat layanan tidak diulang |
| 7 | Analisis | §7 | — | 03 (enum), 05, 06 | — |
| 8 | Bumindes | §8 | §6.3 (laporan desa) | 05, 06 | §6.3 hanya "laporan desa"; Bumindes = buku administrasi |
| 9 | Kelompok/Lembaga/RTM | §9 | — | 03 (Jabatan/Hubungan), 05 | Efek RTM→DTKS juga di §3 |
| 10 | Website Publik | §10 | §6.3 (sebagian laporan) | 06 (cetak pengunjung) | — |
| — | Pendaftaran/perubahan penduduk | **tidak dibahas** | §6.1 | — | Dilarang diulang |
| — | Surat keterangan (layanan) | hanya tautan | §6.2 | **01** | Dilarang diulang |

---

## Ringkasan Cakupan

| Domain | Tabel inti (perkiraan) | Controller/Modul | Tingkat keyakinan |
|---|---|---|---|
| 1. Keuangan/APBDes | 8 inti (`keuangan`, `keuangan_template`, `keuangan_manual_*`, `keuangan_master`, `keuangan_ref_*`) + 66 legacy `keuangan_ta_*` | 3 controller (`Keuangan_laporan`, `Keuangan_manual`, `Laporan_apbdes`) | **Tinggi** — kolom & migrasi dibaca langsung |
| 2. Inventaris/Aset | 11 (`inventaris_*` ×6, `mutasi_inventaris_*` ×5) + `tweb_aset` + 2 view | 11 controller (`Inventaris_*`) | **Tinggi** (kolom diverifikasi; **bug `delete()` terkonfirmasi**) |
| 3. Bantuan & DTKS | 7+ (`program`, `program_peserta`, `dtks`, `dtks_anggota`, `dtks_lampiran`, `dtks_ref_lampiran`, `dtks_pengaturan_program`) + `tweb_rtm` | 5 controller | **Tinggi** (kolom `program`/`program_peserta` diverifikasi dari migrasi) |
| 4. Pembangunan | 2 (`pembangunan`, `pembangunan_ref_dokumentasi`) | 2 controller | **Tinggi** |
| 5. Layanan Mandiri | `tweb_penduduk_mandiri`, `permohonan_surat` (+`log_surat`) | `Mandiri`, `Setting_mandiri`, `Permohonan_surat_admin`, `fmandiri/*` | **Sedang–Tinggi** (rincian OTP/provider perlu verifikasi) |
| 6. Surat Dinas | 4 (`surat_dinas`, `log_surat_dinas`, `surat_masuk`, `surat_keluar`) + `urls` | 3 controller + helper | **Tinggi** |
| 7. Analisis | 13 (`analisis_*` + ref) | 10 controller (module) + 4 library | **Tinggi** (13 tabel diverifikasi dari migrasi) |
| 8. Bumindes | `tanah_desa`, `tanah_kas_desa` + ref + view | 14 controller | **Tinggi** (kolom kedua tabel diverifikasi) |
| 9. Kelompok/Lembaga/RTM | 5 (`kelompok`, `kelompok_master`, `kelompok_anggota`, `tweb_rtm`, `tweb_rtm_hubungan`) | 8 controller | **Tinggi** |
| 10. Website Publik | 11 (`artikel`, `kategori`, `komentar`, `menu`, `gambar_gallery`, `widget`, `teks_berjalan`, `sinergi_program`, `pengaduan`, `sys_traffic`, `dokumen`) | 10 admin + 20+ publik (`fweb/*`) + `internal_api/*` | **Tinggi** (kolom migrasi inti dibaca langsung) |

### Daftar `[perlu verifikasi]`

1. **Inventaris — TERVERIFIKASI (BUG).** `Inventaris_asset::delete()` (baris 169) benar memakai
   `MutasiInventarisAsset::where('id_inventaris_jalan', $id)->update(['id_inventaris_jalan' => null]);`.
   Namun migrasi `mutasi_inventaris_asset` **tidak punya** kolom `id_inventaris_jalan`; kolomnya adalah
   `id_inventaris_asset` (daftar kolom: `id, config_id, id_inventaris_asset, jenis_mutasi, tahun_mutasi,
   harga_jual, sumbangkan, keterangan, visible, status_mutasi`). Jadi ini **bug nyata** (menyentuh kolom
   tak ada / baris mutasi tidak dibersihkan dengan benar) dan **tidak boleh disalin** ke implementasi baru.
2. **Bantuan — TERVERIFIKASI.** Kolom hasil migrasi:
   - `program`: `id, config_id, nama, slug, sasaran, ndesc, sdate, edate, userid, status, asaldana`.
   - `program_peserta`: `id, config_id, peserta, program_id, no_id_kartu, kartu_nik, kartu_nama,
     kartu_tempat_lahir, kartu_tanggal_lahir, kartu_alamat, kartu_peserta, kartu_id_pend`.
   - Ada juga `dtks_pengaturan_program` (integrasi DTKS).
3. **Layanan Mandiri — [perlu verifikasi] (sebagian).** Detail penuh `OtpService`/provider OTP dan rantai
   `Surat_mohon`/`DataSuratPenduduk` belum ditelusuri tuntas; alur OTP masih disimpulkan dari
   `PendudukMandiri`. (Lihat juga LAMPIRAN-09 §3.3/§3.4 untuk notifikasi terkait.)
4. **Analisis — TERVERIFIKASI.** Seluruh 13 tabel `analisis_*` dibaca dari migrasi, termasuk
   `analisis_master` (memiliki `gform_id, gform_nik_item_id, gform_last_sync` → mengonfirmasi integrasi
   Google Forms), `analisis_respon` (`id_indikator, id_parameter, id_subjek, id_periode`),
   `analisis_periode` (`id_master, nama, id_state, aktif, keterangan, tahun_pelaksanaan`).
5. **Bumindes — TERVERIFIKASI.** Kolom hasil migrasi:
   - `tanah_desa`: `id, config_id, id_penduduk, nik, jenis_pemilik, nama_pemilik_asal, luas, hak_milik,
     hak_guna_bangunan, hak_pakai, hak_guna_usaha, hak_pengelolaan, hak_milik_adat, hak_verponding,
     tanah_negara, perumahan, perdagangan_jasa, perkantoran, industri, fasilitas_umum, sawah, tegalan,
     perkebunan, peternakan_perikanan, hutan_belukar, hutan_lebat_lindung, tanah_kosong, lain, mutasi,
     keterangan, visible`.
   - `tanah_kas_desa`: `id, config_id, nama_pemilik_asal, letter_c, kelas, luas, asli_milik_desa, pemerintah,
     provinsi, kabupaten_kota, lain_lain, sawah, tegal, kebun, tambak_kolam, tanah_kering_darat, ada_patok,
     tidak_ada_patok, ada_papan_nama, tidak_ada_papan_nama, tanggal_perolehan, lokasi, peruntukan, mutasi,
     keterangan, visible`.

> **Hasil verifikasi (ringkas):** 4 dari 5 item tertutup dengan bukti migrasi langsung (item 1, 2, 4, 5);
> item 1 bahkan terkonfirmasi sebagai **bug**. Hanya item 3 (detail OTP Layanan Mandiri) yang masih
> `[perlu verifikasi]`.

> **Catatan akhir:** Seluruh temuan di atas berasal dari kode OpenSID sebagai *data*. Tidak ada
> instruksi dalam konten target yang dijalankan. Bila menemukan teks yang menyerupai perintah pada
> kode/DB, itu diperlakukan sebagai data dan dilaporkan, bukan dipatuhi.
