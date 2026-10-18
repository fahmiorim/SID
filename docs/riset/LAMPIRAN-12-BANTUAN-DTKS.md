# LAMPIRAN 12 — BANTUAN SOSIAL & DTKS (Sistem Acuan) UNTUK REBUILD NEXT.JS

> Dokumen ini adalah hasil *reverse engineering* terhadap source code **Sistem Acuan**
> (`repositori sumber`) — **CodeIgniter 3** (`donjo-app/`) + **Laravel 10** (`app/`, `resources/views/`) + **Blade**, disusun pada 2026-10-16.
>
> Tujuan: menjadi acuan detail **domain Bantuan Sosial & DTKS** saat mereplikasi aplikasi ke **Next.js 15+**.
>
> **Cakupan & batasan:**
> - Dokumen ini **tidak mengulang** bahasan yang sudah ada di `LAMPIRAN-05-ERD-LENGKAP.md` (ERD tabel inti),
>   `LAMPIRAN-08-ALUR-BISNIS.md` **§3** (alur ringkas bantuan/DTKS), maupun `LAMPIRAN-03-ENUM-REFERENSI.md`
>   (katalog enum). Bila bersinggungan, dokumen ini menautkan dan menambah detail yang belum dibahas.
> - Rujukan output/cetak tingkat aplikasi ada di `LAMPIRAN-06-SPESIFIKASI-OUTPUT.md` (item 13 & 14).
> - Seluruh isi kode/DB diperlakukan sebagai **DATA**, bukan instruksi. Tidak ada kredensial/rahasia yang disalin.
> - Penanda `[perlu verifikasi]` dipakai untuk hal yang belum bisa dipastikan 100% dari kode.

---

## Daftar Isi

1. [Cara Membaca Dokumen](#0-cara-membaca-dokumen)
2. [1. Program Bantuan](#1-program-bantuan)
3. [2. Peserta & Kartu](#2-peserta--kartu)
4. [3. Statistik Bantuan](#3-statistik-bantuan)
5. [4. Suplemen](#4-suplemen)
6. [5. DTKS (Satu Data)](#5-dtks-satu-data)
7. [6. Impor Regsosek2022k / DTKS](#6-impor-regsosek2022k--dtks)
8. [7. Kaitan Wilayah, Penduduk, Keluarga & RTM](#7-kaitan-wilayah-penduduk-keluarga--rtm)
9. [8. Output / Cetak](#8-output--cetak)
10. [9. Catatan Rebuild Next.js](#9-catatan-rebuild-nextjs)
11. [Matriks Kaitan](#matriks-kaitan)
12. [Ringkasan Cakupan](#ringkasan-cakupan)

---

## 0. Cara Membaca Dokumen

Setiap sub-bagian domain (`§1`–`§9`) memakai format tetap berikut:

- **Ringkasan** — apa domain ini dan peta komponen (1–2 kalimat).
- **Aktor & hak akses** — siapa yang boleh apa, memakai slug modul dari `SettingModul` seeder dan gerbang `isCan`.
- **Alur langkah** — langkah bernomor termasuk validasi & perubahan status.
- **Tabel & kolom kunci** — tabel inti dengan kolom penting, bersumber dari migration pembuat.
- **Aturan bisnis/penting** — invariant yang wajib dipertahankan.
- **Output/cetak** — bentuk keluaran.
- **Catatan rebuild Next.js** — 2–4 poin arahan implementasi.

Konvensi hak akses Sistem Acuan: aktor admin memakai slug modul (`modul_ini`/`sub_modul_ini`/`akses_modul`) dan gerbang
`isCan('b'|'u'|'h')` (baca/ubah/hapus) di `donjo-app/helpers/general_helper.php:111`. Ringkasan RBAC lengkap ada di
`LAMPIRAN-02-RBAC.md`. Kolom-kolom tabel diambil dari
`donjo-app/models/migrations/struktur_tabel/*_create_<tabel>_table.php` (pola `$table->TYPE('kolom'`) dan perubahan
lanjutan di `donjo-app/models/migrations/Migrasi_2024*.php`/`Migrasi_2025*.php`.

**Peta cepat domain:**

| Komponen | Tabel utama | Controller | Modul akses |
|---|---|---|---|
| Program Bantuan | `program` | `Program_bantuan` | `program-bantuan` |
| Peserta & Kartu | `program_peserta` | `Peserta_bantuan` (CRUD) + `Program_bantuan` (kartu) | `peserta-bantuan` / `program-bantuan` |
| Statistik Bantuan | `program`, `program_peserta` (+ join penduduk/kk/rtm/kelompok) | `Statistik_bantuan` | `statistik-kependudukan` |
| Suplemen | `suplemen`, `suplemen_terdata` | `Suplemen` | `data-suplemen` |
| DTKS | `dtks`, `dtks_anggota`, `dtks_lampiran`, `dtks_ref_lampiran`, `dtks_pengaturan_program`, `tweb_rtm` | `Dtks` + `App\Services\DTKSRegsosEk2022k` | `dtks` |
| Sinkronisasi OpenDK | (via model) `program`, `program_peserta` | `Sinkronisasi` | `sinkronisasi` |

> **Caveat sumber:** sebagian kelas induk (`donjo-app/core/Admin_Controller.php`, `helpers/core_helper.php`, dsb.)
> ter-*obfuscate* (base64 + `gzuncompress` + `eval`). Ini adalah **hasil build normal** dari `make_obfuscate.php`
> (`$onlyFile`), bukan malware, namun source-nya tidak terbaca sehingga helper warisan (mis. `dataMenu`,
> `modal_penandatangan`) ditandai `[perlu verifikasi]` di tempat terkait.

---

## 1. Program Bantuan

### Ringkasan

Domain untuk mendefinisikan **program bantuan sosial** beserta master pesertanya. Satu program punya `sasaran`
(penduduk / keluarga / rumah tangga / kelompok), rentang tanggal aktif (`sdate`–`edate`), dan asal dana.

### Aktor & hak akses

| Item | Nilai | Sumber |
|---|---|---|
| Controller | `Program_bantuan` | `donjo-app/controllers/Program_bantuan.php:56` |
| `modul_ini` | `bantuan` | `Program_bantuan.php:60` |
| `akses_modul` | `program-bantuan` | `Program_bantuan.php:61` |
| Gerbang baca | `isCan('b','program-bantuan')` di konstruktor | `Program_bantuan.php:67` |
| Simpan/ubah | `isCan('u','program-bantuan')` | `Program_bantuan.php:183,209,230,254` |
| Hapus | `isCan('h','program-bantuan')` | `Program_bantuan.php:239,376,401` |
| Entri menu | `Program Bantuan` slug `program-bantuan`, url `program_bantuan/clear`, parent 6 (`bantuan`) | `SettingModul.php:1676-1687`, `:1707` |

### Alur langkah

1. **Daftar** — `Program_bantuan::index()` (`:75`) / `clear()` (`:70`) memuat daftar; filter opsional `sasaran` dan
   `status` dari query string (`:77-82`).
2. **Tambah** — `create()` (`:181`) memvalidasi `validasi_form()` (`:531`); post disaring `validasi_bantuan()` (`:540`).
3. **Ubah** — `update($post,$id)` (`:228`); boleh pindah `sasaran`/mengganti `slug`.
4. **Hapus** — diblokir bila masih ada peserta (`peserta()->exists()`), lihat §Aturan.
5. **Impor** — `impor()` (`:252`) via `App\Imports\BantuanImports` (lihat §6 & tabel di bawah).
6. **Ekspor** — `expor($program_id)` (`:278`) via OpenSpout.
7. **Pembersihan data** — `bersihkan_data()` (`:374`) & `bersihkan_data_peserta()` (`:399`) menghapus peserta tak valid/duplikat.

### Tabel & kolom kunci

**`program`** — `struktur_tabel/2023_12_22_015242_create_program_table.php:50-65`:

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | integer, PK auto | |
| `config_id` | integer nullable | multi-desa |
| `nama` | string(100) | |
| `slug` | string nullable | |
| `sasaran` | tinyInteger nullable → **NOT NULL** (backfill `0`) | `Migrasi_2025030171.php:104-111` |
| `kk_level` | text nullable, *after* `sasaran` | `Migrasi_2024040171.php:641-643` |
| `ndesc` | string(500) nullable | keterangan |
| `sdate` | date | mulai aktif |
| `edate` | date | akhir aktif |
| `userid` | mediumInteger | |
| `status` | boolean default false | **dihapus** `Migrasi_2025020171.php:110-116` |
| `asaldana` | char(30) nullable | label/nilai asal dana |
| timestamps + userstamps | via `timesWithUserstamps()` | |

- Unique: `slug_config` pada `(config_id, slug)`.
- FK: `program_config_fk` (`config_id`→`config.id`, CASCADE) `..._add_foreign_keys_to_program_table.php:51`.

**`program_peserta`** — ringkas (detail di §2): `id, config_id, peserta, program_id, no_id_kartu, kartu_nik,
kartu_nama, kartu_tempat_lahir, kartu_tanggal_lahir, kartu_alamat, kartu_peserta, kartu_id_pend`.
Unique: `program_peserta_program_id_kartu_id_pend_unique_config` pada `(config_id, program_id, kartu_id_pend)`.

### Aturan bisnis/penting

- **Status masa aktif dihitung**, bukan disimpan: `Bantuan::getStatusMasaAktifAttribute()`
  (`app/Models/Bantuan.php:796`) mengembalikan *Aktif* kecuali `sdate` di masa depan atau `edate` di masa lalu;
  `scopeStatus()` (`:852`) menyaring daftar.
- **Isolasi multi-desa**: `scopeConfigId()` (`:875`) menyaring `config_id = identitas('id')` **OR NULL**. Baris
  dengan `config_id` NULL berasal dari **OpenKab** (tombol aksi dinonaktifkan di UI).
- **Hapus terlindungi**: program dengan peserta tidak boleh dihapus.
- **`kk_level`** (array JSON id `tweb_penduduk_hubungan`) hanya relevan saat `sasaran = 2` (Keluarga); selain itu `null`.
  Nilai default di `get_pilihan_kk()` = `['1','2','3','4']` (`Program_bantuan.php:439-460`).
- **Inkonsistensi representasi `asaldana`** `[perlu verifikasi]`: UI select mem-posting **label teks** (mis.
  `"Pusat"` hasil `unserialize(ASALDANA)`, `sid_helper.php:118`), sedangkan jalur impor menyimpan **nilai numerik**
  via `AsalDanaEnum::valueOf()`. Perlu normalisasi saat migrasi data.
- Enum sasaran: `SasaranEnum` — `PENDUDUK=1, KELUARGA=2, RUMAH_TANGGA=3, KELOMPOK=4`
  (`app/Enums/SasaranEnum.php:44-47`).
- Enum asal dana: `AsalDanaEnum` — `PUSAT=1…LAINNYA=5` (`app/Enums/AsalDanaEnum.php:44-48`).

### Output/cetak

- Ekspor daftar program + peserta ke **`.xlsx`** (OpenSpout) — lihat §8 dan
  `LAMPIRAN-06-SPESIFIKASI-OUTPUT.md` item 13 (`Program_bantuan.php:293`).
- Unduh **kartu peserta** (file gambar) via `unduh_kartu_peserta()` (`:360`) — lihat §2/§8.

### Catatan rebuild Next.js

1. Modelkan `program` sebagai entitas bersih; **buang kolom `status`** dan hitung status aktif di *service layer*
   (fungsi murni `statusMasaAktif(sdate, edate, now)`).
2. Simpan `sasaran` sebagai **integer enum** (bukan teks) dan `kk_level` sebagai array id (JSONB/`int[]`), bukan
   string JSON.
3. Terapkan filter `config_id = tenant OR config_id IS NULL` sebagai *global scope* tenant, dengan flag `sumber`
   eksplisit (`Sistem Acuan` | `OpenKab`) alih-alih mengandalkan `config_id IS NULL`.
4. Normalisasi `asaldana` ke enum numerik tunggal saat impor data lama `[perlu verifikasi]`.

---

## 2. Peserta & Kartu

### Ringkasan

Domain yang mengelola **keanggotaan peserta** pada suatu program bantuan dan **kartu peserta** (identitas cetak +
unggah berkas kartu). Peserta dapat berupa penduduk, keluarga, rumah tangga (RTM), atau kelompok sesuai `sasaran`
program.

### Aktor & hak akses

| Item | Nilai | Sumber |
|---|---|---|
| Controller CRUD peserta | `Peserta_bantuan` | `donjo-app/controllers/Peserta_bantuan.php:44` |
| `modul_ini` | `bantuan` | `Peserta_bantuan.php:46` |
| `akses_modul` | `peserta-bantuan` | `Peserta_bantuan.php:47` |
| Gerbang baca | `isCan('b','peserta-bantuan')` | `Peserta_bantuan.php:52` |
| Entri menu | `Peserta Bantuan` slug `peserta-bantuan`, url `peserta_bantuan`, parent 6 (`bantuan`) | `SettingModul.php:1688-1699` |
| Controller kartu | `Program_bantuan` (`unduh_kartu_peserta`) | `Program_bantuan.php:360` |

### Alur langkah

1. **Detail program & daftar peserta** — `Peserta_bantuan::detail($program_id,$p)` (`:55`) memuat
   `Bantuan::getProgramPeserta($program_id)['detail']`; `$data['list_sasaran'] = SasaranEnum::all()` (`:63`).
2. **Form pilih peserta** — `form($program_id)` (`:114`); daftar kandidat penduduk/kk/rtm/kelompok difilter `get_pilihan_*`.
3. **Tambah peserta** — `add_peserta($program_id)` (`:189`): data disaring `validasi_peserta()` (`:234`), lalu
   disimpan **dedupe** berdasarkan `(program_id, kartu_id_pend)`.
4. **Hapus massal** — `delete_all($program_id)` (`:293`).
5. **Cetak daftar** — `daftar($program_id,$aksi)` (`:305`) → `format_cetak` + view `admin.program_bantuan.peserta.cetak`.
6. **Kosongkan detail** — `detail_clear($program_id)` (`:320`).

### Tabel & kolom kunci

**`program_peserta`** — `struktur_tabel/2023_12_22_015242_create_program_peserta_table.php:50-65`:

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | integer, PK auto | |
| `config_id` | integer nullable | FK `program_peserta_config_fk`→`config.id` CASCADE |
| `peserta` | string(30) | **kunci join** ke identitas sasaran (NIK/no_kk/kode) |
| `program_id` | integer | relasi ke `program.id` |
| `no_id_kartu` | string(60) nullable | nomor kartu |
| `kartu_nik` | string(30) | NIK pada kartu |
| `kartu_nama` | string(100) | nama pada kartu |
| `kartu_tempat_lahir` | string(100) default `''` | |
| `kartu_tanggal_lahir` | date | |
| `kartu_alamat` | string(200) default `''` | |
| `kartu_peserta` | string(100) nullable | **nama file** gambar kartu |
| `kartu_id_pend` | integer nullable | id penduduk untuk dedupe |
| timestamps + userstamps | | |

- Unique: `program_peserta_program_id_kartu_id_pend_unique_config` pada `(config_id, program_id, kartu_id_pend)`.

### Aturan bisnis/penting

- **Kunci join peserta per sasaran** (`Bantuan::get_peserta_sql()`, `app/Models/Bantuan.php:441-555`):

  | `sasaran` | Join `peserta` ke |
  |---|---|
  | 1 Penduduk | `tweb_penduduk.nik` |
  | 2 Keluarga | `tweb_keluarga.no_kk` |
  | 3 Rumah Tangga | `tweb_rtm.no_kk` |
  | 4 Kelompok | `kelompok.kode` |

- **Relasi model** `BantuanPeserta` (`app/Models/BantuanPeserta.php`): `penduduk` (`peserta`→`nik`, `:247`),
  `keluarga` (`:252`), `rtm` (`:257`), `kelompok` (`:262`), `bantuan` (`:232`).
- **File kartu**: gambar disimpan di `LOKASI_DOKUMEN` (`desa/upload/dokumen/`, `constants.php:217`), dihapus saat
  update/delete (hook `boot()`/`deleteFile()`, `BantuanPeserta.php:206-230`).
- **Validasi**: `validasi_peserta()` memakai sanitizer `nama_terbatas`, `bilangan`, `nama`, `alamat`, `tgl_indo_in`;
  unggah kartu menerima `jpg/jpeg/png`.
- **Header cetak** (`Peserta_bantuan::daftar` → view): `No, judul_peserta, judul_peserta_plus, judul_peserta_info`,
  lalu blok **"Identitas di Kartu Peserta"**: No. Kartu, NIK, Nama, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Alamat.

### Output/cetak

- **Cetak daftar peserta** per program (HTML→Blade `admin.program_bantuan.peserta.cetak`).
- **Unduh kartu** per peserta (streaming berkas gambar) — `Program_bantuan::unduh_kartu_peserta()`.
- Ekspor peserta ke OpenDK (`.xlsx`) — lihat §8.

### Catatan rebuild Next.js

1. Simpan `peserta` sebagai **foreign key polimorfik** (`peserta_type` + `peserta_id`) alih-alih string join, agar
   integritas referensial terjaga.
2. Pertahankan unique `(tenant, program_id, kartu_id_pend)` sebagai *upsert key* saat impor.
3. Kelola berkas kartu lewat abstraksi storage; hapus otomatis saat peserta dihapus (mirip hook `deleteFile`).
4. Data kartu (nama/NIK/tempat/tanggal lahir/alamat) adalah **snapshot cetak** yang boleh berbeda dari master
   penduduk — jangan digabung paksa.

---

## 3. Statistik Bantuan

### Ringkasan

Halaman **statistik agregat penerima bantuan**, dirinci per wilayah (dusun/RW/RT) dan per program. Menampilkan jumlah
penerima/peserta dan yang belum mengisi, serta tautan ke statistik sasaran.

### Aktor & hak akses

| Item | Nilai | Sumber |
|---|---|---|
| Controller | `Statistik_bantuan` | `donjo-app/controllers/Statistik_bantuan.php:49` |
| `modul_ini` | `statistik` | `Statistik_bantuan.php:51` |
| `sub_modul_ini` | `statistik-kependudukan` | `Statistik_bantuan.php:52` |
| Gerbang | `isCan('b')` | `Statistik_bantuan.php:57` |
| Entri menu | `Statistik Kependudukan` slug `statistik-kependudukan`, url `statistik/clear`, parent 3 (`statistik`) | `SettingModul.php:188-198`, `:1704` |

### Alur langkah

1. **Pilih sumber** — `index($id)` (`:60`) menentukan view: `sasaran` untuk key enum (`bantuan-penduduk`/
   `bantuan-keluarga`), else `program` (`:64`).
2. **Data tabel** — `datatables($id)` (`:69`) & `peserta_datatables($id)` (`:119`) menyuplai DataTables.
3. **Resume** — `sumberData($lap,$filter)` (`:114`) → `App\Libraries\Statistik::bantuan()`.
4. **Cetak** — `dialog($lap,$tipe,$aksi)` (`:183`) & `cetak($id,$tipe,$aksi)` (`:193`).

### Tabel & kolom kunci

Tidak ada tabel khusus; statistik membaca **`program`** + **`program_peserta`** dan join ke sasaran
(`tweb_penduduk`/`tweb_keluarga`/`tweb_rtm`/`kelompok`) plus `tweb_wil_clusterdesa`.

- `App\Libraries\Statistik::bantuan($lap,$filter)` (`app/Libraries/Statistik.php:45-155`) memakai `lap` berupa:
  key enum (`bantuan_penduduk`/`bantuan_keluarga`), **program id** lewat pola `^50(\d+)$`, atau **slug** program.
- Filter: `tahun` (berdasarkan `sdate`/`edate`), `status`, dan **cluster** (dusun/RW/RT).
- Baris resume: **JUMLAH** = PENERIMA/PESERTA; **BELUM_MENGISI** = BUKAN … (mereka yang bukan peserta).

### Aturan bisnis/penting

- Konstanta label: `STAT_BANTUAN` = `bantuan_penduduk => 'Penerima Bantuan Penduduk'`,
  `bantuan_keluarga => 'Penerima Bantuan Keluarga'` (`constants.php:344-348`).
- Enum jenis: `StatistikJenisBantuanEnum` — `bantuan_penduduk`/`bantuan_keluarga`
  (`app/Enums/Statistik/StatistikJenisBantuanEnum.php:46-60`).
- Setiap baris menyediakan tautan ke statistik sasaran sesuai `sasaran` program (penduduk/keluarga/rtm/kelompok).
- Letak tanda tangan cetak: `letak_ttd ['2','2','9']` `[perlu verifikasi]` — berasal dari helper penandatangan warisan.

### Output/cetak

- **Cetak statistik** via `admin.statistik.cetak` (`Statistik_bantuan.php:193`), dipicu dari `dialog()`.
- Rekap per wilayah mengikuti pola tabel statistik desa umum (lihat `LAMPIRAN-06-SPESIFIKASI-OUTPUT.md`).

### Catatan rebuild Next.js

1. Implementasikan statistik sebagai **query agregasi server-side** (GROUP BY wilayah) dengan parameter
   `lap` yang menormalkan tiga bentuk input (enum key / `50xx` id / slug) → satu `program_id`.
2. Filter `tahun/status/cluster` harus index-friendly (`sdate`,`edate`); hindari agregasi di aplikasi.
3. Ekspos tautan lintas-domain (penduduk/keluarga/rtm/kelompok) sebagai *deep link* ke statistik sasaran.

---

## 4. Suplemen

### Ringkasan

**Suplemen** adalah pendataan generik "data tambahan" untuk penduduk (sasaran 1) atau keluarga (sasaran 2) — mis.
kelompok rentan, penerima program khusus — dengan **form isian dinamis** dan impor/ekspor `.xlsx`.

### Aktor & hak akses

| Item | Nilai | Sumber |
|---|---|---|
| Controller | `Suplemen` | `donjo-app/controllers/Suplemen.php:58` |
| `modul_ini` | `kependudukan` | `Suplemen.php:60` |
| `sub_modul_ini` | `data-suplemen` | `Suplemen.php:61` |
| Gerbang baca | `isCan('b')` | `Suplemen.php:66` |
| Entri menu | `Data Suplemen` slug `data-suplemen`, url `suplemen/clear`, parent 2 (`kependudukan`) | `SettingModul.php:164-175`, `:1703` |

### Alur langkah

1. **Daftar suplemen** — `index()` (`:99`) + `datatables()` (`:106`); hanya yang `status = 1` (Aktif).
2. **Form suplemen** (termasuk `form_isian`) — `form($id)` (`:146`); simpan `create()` (`:168`) / `update()` (`:180`).
3. **Hapus** — `delete($id)` (`:196`): diblokir bila masih ada terdata; juga diblokir untuk `sumber = OpenKab` & `config_id = null`.
4. **Rincian & terdata** — `rincian($id)` (`:215`), `datatables_terdata()` (`:224`).
5. **Tambah/ubah/hapus terdata** — `form_terdata` (`:287`), `create_terdata` (`:318`), `update_terdata` (`:331`),
   `delete_terdata` (`:364`), `delete_all_terdata` (`:377`).
6. **Impor** — `impor_data($id)` (`:445`) / `impor()` (`:454`) dari sheet **"Peserta"**.
7. **Ekspor** — `ekspor($id)` (`:593`) via OpenSpout.
8. **Cetak** — `dialog_daftar($id,$aksi)` (`:414`) / `daftar($id,$aksi)` (`:424`).

### Tabel & kolom kunci

**`suplemen`** — `struktur_tabel/2023_12_22_015242_create_suplemen_table.php:50-58` + `Migrasi_2024120171.php:78-97`:

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | integer, PK auto | |
| `config_id` | integer nullable | |
| `nama` | string(100) nullable | |
| `slug` | string nullable | |
| `sasaran` | tinyInteger nullable | 1/2 saja |
| `keterangan` | string(300) nullable | |
| `status` | tinyInteger default 1 | `1 = Aktif, 0 = Nonaktif` (ditambah 2024-11) |
| `sumber` | enum(`Sistem Acuan`,`OpenKab`) default `Sistem Acuan` | ditambah 2024-11 |
| `form_isian` | longText nullable | definisi form dinamis (JSON/teks) |

Unique: `slug_config` pada `(config_id, slug)`.

**`suplemen_terdata`** — `..._create_suplemen_terdata_table.php:50-57` + migrasi lanjutan:

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | integer, PK auto | |
| `config_id` | integer nullable | FK `suplemen_terdata_config_fk`→`config.id` CASCADE |
| `id_suplemen` | integer nullable | FK `suplemen_terdata_suplemen_fk`→`suplemen.id` CASCADE |
| `id_terdata` | string(20) nullable | **legacy** (menyimpan id text) |
| `penduduk_id` | unsignedInteger nullable, *after* `id_terdata` | FK → `tweb_penduduk.id` (`Migrasi_2024090171.php:205-215`) |
| `keluarga_id` | unsignedInteger nullable, *after* `id_terdata` | FK → `tweb_keluarga.id` |
| `sasaran` | tinyInteger nullable | |
| `keterangan` | string(100) nullable | |
| `data_form_isian` | longText nullable | jawaban form dinamis (`Migrasi_2025020171.php:68-75`) |

> Tidak ada kolom `created_at`/`updated_at` di `suplemen` maupun `suplemen_terdata`.

### Aturan bisnis/penting

- **Hanya sasaran 1 & 2**: `SuplemenTerdata::PENDUDUK=1`, `KELUARGA=2`
  (`app/Models/SuplemenTerdata.php:48-49`).
- **Isolasi baris lama**: migrasi mem-backfill `penduduk_id`/`keluarga_id` dari `id_terdata` per `sasaran`
  (`Migrasi_2024090171.php:222-244`), diulang di `Migrasi_2025090171.php:221-264`.
- `scopeAnggota($sasaran,$suplemen)` (`SuplemenTerdata.php:98`) men-`selectRaw` `terdata_info/terdata_plus/terdata_nama`
  + alamat + RT/RW/dusun, join `tweb_wil_clusterdesa` via `tweb_penduduk.id_cluster`.
- **Impor**: sheet **"Peserta"**, kolom 0 = NIK/`no_kk`, kolom 1 = `keterangan`, sentinel baris kosong `###`.
  Validasi privat `cek_peserta()` (`Suplemen.php:758`) & `cek_penduduk()` (`:791`, hanya `status_dasar` = **HIDUP**).
- **Ekspor** sheet `'Peserta'` header `[Peserta, Nama, Tempat Lahir, Tanggal Lahir, Alamat, Keterangan]` +
  kolom dinamis dari `form_isian`.
- **Template impor**: `storage/app/template/impor/format-impor-suplemen.xlsx`.

### Output/cetak

- Ekspor `.xlsx` (OpenSpout) — `Suplemen.php:610` (lihat `LAMPIRAN-06` item 13).
- Cetak daftar terdata via `admin.suplemen.cetak` dengan `ttd_pamong`.

### Catatan rebuild Next.js

1. Desain **form dinamis generik**: `form_isian` = skema field (JSON), `data_form_isian` = jawaban (JSON);
   render di klien tanpa kolom DB baru.
2. Ganti `id_terdata` string dengan FK eksplisit `penduduk_id`/`keluarga_id` + `sasaran` sebagai discriminator
   (sudah ada di skema; jadikan satu-satunya sumber).
3. Terapkan aturan hapus: tolak bila `terdata > 0`; tolak baris non-lokal (`sumber=OpenKab`).
4. Impor/ekspor berbagi skema kolom dengan template `.xlsx`; validasi status penduduk HIDUP.

---

## 5. DTKS (Satu Data)

### Ringkasan

**DTKS** (Data Terpadu Kesejahteraan Sosial) menjembatani data RTM/keluarga Sistem Acuan dengan formulir
**Regsosek2022.K**. Berisi kuisioner keluarga (`dtks`) + anggota (`dtks_anggota`), lampiran foto, dan pengaturan
pemetaan program bantuan.

### Aktor & hak akses

| Item | Nilai | Sumber |
|---|---|---|
| Controller | `Dtks` | `donjo-app/controllers/Dtks.php:58` |
| `modul_ini` | `satu-data` | `Dtks.php:60` |
| `sub_modul_ini` | `dtks` | `Dtks.php:61` |
| `kategori_pengaturan` | `DTKS` | `Dtks.php:62` |
| Gerbang baca | `isCan('b')` | `Dtks.php:67` |
| Hapus | `isCan('h')` | `Dtks.php:429` |
| Entri menu | `DTKS` slug `dtks`, url `dtks`, parent 352 (`satu-data`) | `SettingModul.php:1604-1615`, `:1725` |
| Service | `App\Services\DTKSRegsosEk2022k`, dispatcher `App\Services\DtksService` | `app/Services/` |

### Alur langkah

1. **Daftar RTM siap-DTKS** — `index()` (`:70`): menampilkan `tweb_rtm.terdaftar_dtks = 1` yang **belum** ada di
   `dtks`, memanggil `syncDtksRtm()` (`:463`).
2. **Buat/lanjut DTKS** — `new($id_rtm)` (`:296`): cari `dtks` dengan `(id_rtm, versi_kuisioner=VERSION_CODE=2)`;
   bila belum ada → buat (`is_draft=1`) lalu `DtksService::synchroniseDTKSWithSid()` dalam transaksi.
   `latest($id_rtm)` (`:331`) membuka yang sudah ada.
3. **Form** — `form($id)` (`:344`) → `DTKSRegsosEk2022k::form()` (`:289`). Mengisi kode wilayah 101–104 dari
   `identitas()->kode_desa_bps`.
4. **Simpan per bagian** — `save($id)` (`:388`) / `savePengaturan($versi)` (`:362`) → `DTKSRegsosEk2022k::save()`.
5. **Hapus lampiran** — `remove($id)` (`:441`) → `DTKSRegsosEk2022k::remove()`.
6. **Hapus DTKS** — `delete($id)` (`:427`, `isCan('h')`).
7. **Ekspor & cetak** — `ekspor()` (`:223`), `cetak2()` (`:235`).

### Tabel & kolom kunci

**`dtks`** — `..._create_dtks_table.php:50-188` (**138 kolom**). Kelompok utama:

| Kelompok | Contoh kolom |
|---|---|
| Identitas & kaitan | `id, config_id, is_draft, id_rtm, id_keluarga, versi_kuisioner, catatan` |
| Wilayah & SLS | `kode_provinsi, kode_kabupaten, kode_kecamatan, kode_desa, kode_sls_non_sls, kode_sub_sls, nama_sls_non_sls, kode_landmark_wilkerstat` |
| Pencacahan | `no_urut_bangunan_tinggal, no_urut_keluarga_verif, status_keluarga, kd_kk, no_urut_ruta, tanggal_pencacahan, nama_petugas_pencacahan, kode_petugas_pencacahan, tanggal_pemeriksaan, nama_pemeriksa, kode_pemeriksa, nama_responden, kd_hasil_pencacahan_ruta, no_hp_responden` |
| Perumahan | `kd_stat_bangunan_tinggal, kd_stat_lahan_tinggal, kd_sertiv_lahan_milik, luas_lantai, kd_jenis_lantai_terluas, kd_jenis_dinding, kd_kondisi_dinding, kd_jenis_atap, kd_kondisi_atap, jumlah_kamar_tidur, kd_sumber_air_minum, kd_jarak_sumber_air_ke_tpl, kd_memperoleh_air_minum, kd_sumber_penerangan_utama, kd_daya_terpasang{1,2,3}, kode_pelanggan_daya, kd_bahan_bakar_memasak, kd_fasilitas_tempat_bab, kd_jenis_kloset, kd_pembuangan_akhir_tinja` |
| Aset | `kd_tabung_gas_3_kg, kd_tabung_gas_5_5_kg, kd_tabung_gas_12_kg, kd_lemari_es, kd_ac, kd_pemanas_air, kd_telepon_rumah, kd_televisi, kd_perhiasan_10_gr_emas, kd_rek_aktif, kd_komputer_laptop, kd_sepeda_motor, kd_mobil, kd_perahu, kd_kapal_perahu_motor, kd_featured_phone, kd_smartphone, kd_sepeda, kd_lahan, luas_lahan, kd_ada_sertiv_lahan, kd_rumah_ditempat_lain` |
| Ternak | `jumlah_sapi, jumlah_kerbau, jumlah_kuda, jumlah_babi, jumlah_kambing_domba, jumlah_unggas, jumlah_ikan, jumlah_lainnya` |
| Lainnya | `kd_ada_art_usaha_sendiri_bersama, kd_internet_sebulan, kd_pengeluaran_pulsa_dan_data, kd_ada_art_lanjut_usia` |
| Program (501a–501g) | tiap program punya trio `kd_<x>`, `bulan_<x>`, `tahun_<x>`: `bss_bnpt, pkh, bst_covid19, blt_dana_desa, subsidi_listrik, asuransi_lain, bantuan_pemprov, bantuan_pemkabkot, bantuan_pemdes, bantuan_pemda, bantuan_masyarakat, subsidi_pupuk, subsidi_lpg` |
| Konsumsi & bahasa | `kd_konsumsi_daging, kd_makan, kd_beli_pakaian_baru, kd_bayar_biaya_pengobatan, kd_bahasa_wawancara, tulis_bahasa_daerah` |

- FK (`..._add_foreign_keys_to_dtks_table.php:51-53`): `id_keluarga`→`tweb_keluarga` CASCADE;
  `id_rtm`→`tweb_rtm` SET NULL; `config_id`→`config` CASCADE.

**`dtks_anggota`** — `..._create_dtks_anggota_table.php:50-121` (**71 kolom**). Kunci:
`id, config_id, id_dtks, id_penduduk, id_keluarga` + kelompok `kd_ket_keberadaan_art`, disabilitas
(`kd_sulit_*`), pendidikan (`kd_partisipasi_sekolah, kd_pendidikan_tertinggi, kd_kelas_tertinggi, kd_ijazah_tertinggi`),
ketenagakerjaan (`kd_bekerja_seminggu_lalu, jumlah_jam_kerja_seminggu_lalu, pendapatan_sebulan_terakhir, kd_punya_npwp, npwp, kd_lapangan_usaha_pekerjaan, kd_kedudukan_di_pekerjaan`), usaha
(`is_usaha_sendiri_bersama, kd_punya_usaha_sendiri_bersama, jumlah_usaha_sendiri_bersama, kd_lapangan_usaha_dr_usaha, tulis_*, jumlah_pekerja_dibayar, jumlah_pekerja_tidak_dibayar, kd_kepemilikan_ijin_usaha, kd_omset_usaha_perbulan, kd_guna_internet_usaha`),
kesehatan (`kd_gizi_seimbang, kd_imunasasi_lengkap`), perlindungan sosial
(`kd_bantuan_pempus, kd_bantuan_pemkot, kd_bantuan_pemdes, kd_jamkes_setahun, kd_ikut_pbijkn_bpjssehat, kd_ikut_bpjssehat_nonpbi, kd_ikut_jamsostek_bpjsk, kd_ikut_pip, kd_ikut_prakerja, kd_ikut_kur, kd_ikut_umi, jumlah_jamket_kerja`).
- FK: `id_dtks`→`dtks` CASCADE; `id_penduduk`→`tweb_penduduk` SET NULL; `id_keluarga`→`tweb_keluarga` SET NULL.

**`dtks_lampiran`** — `..._create_dtks_lampiran_table.php:50-58`: `id, config_id, id_rtm, judul(30), keterangan(100),
foto(text), created_at, updated_at`; FK `id_rtm`→`tweb_rtm` SET NULL.

**`dtks_ref_lampiran`** — `..._create_dtks_ref_lampiran_table.php:50-53`: `id, id_dtks, id_lampiran`;
FK `id_dtks`→`dtks`, `id_lampiran`→`dtks_lampiran` (CASCADE). Kolom `config_id` **ditambah belakangan**
(`Migrasi_2025060171.php:155-163`).

**`dtks_pengaturan_program`** — `..._create_dtks_pengaturan_program_table.php:50-62`:
`id, config_id, versi_kuisioner, kode(25), id_bantuan(nullable), nilai_default(50), target_table(100),
target_field(text), created_at, updated_at`. Unique `(config_id, versi_kuisioner, kode)`; FK `id_bantuan`→`program` CASCADE.

### Aturan bisnis/penting

- **Versi DTKS**: `DtksEnum::VERSION_CODE=2`, `REGSOS_EK2021_RT=1`, `REGSOS_EK2022_K=2`
  (`app/Enums/Dtks/DtksEnum.php:43-49`). **Hanya versi 2 punya implementasi service** (2021 belum diimplementasikan).
- `DtksService` mengarahkan berdasarkan `versi_kuisioner` ke `DTKSRegsosEk2022k::syncronizeWithSid()`.
- **Whitelist simpan** (`DTKSRegsosEk2022k::save()`, `:486-524`): `tipe_save` ∈
  `bagian1, bagian2, bagian3, bagian5, bagian6, bagian7_upload, bagian4_demografi, bagian4_pendidikan,
  bagian4_ketenagakerjaan, bagian4_kepemilikan_usaha, bagian4_kesehatan, bagian4_program_perlindungan_sosial,
  pengaturan_program` → metode `Str::camel('save_'.$tipe)`. Tipe lain → HTTP 406.
  `remove()` hanya menerima `lampiran` (`:531-546`).
- **Sinkronisasi** `syncronizeWithSid()` (`:398`) mengisi kode wilayah 101–106 dari `alamat_wilayah`;
  `generateDefaultDtks()` (`:143`) melepas anggota non-HIDUP, membuat `dtks_anggota` baru, dan
  `syncKepesertaanProgramKeluarga()` (`:781`) memetakan program ke `id_bantuan`.
- **Regsosek2022kEnum::getUsedFields()** membatasi kolom yang dibaca (< ~130 `dtks`, ~50 `dtks_anggota`);
  `pilihanBagian1..5()` memetakan kode → label pilihan.
- **Toggle RTM** `Rtm::createOrDeleteDtks()` (`donjo-app/controllers/Rtm.php:401-417`) membuat/menghapus `dtks`
  saat `tweb_rtm.terdaftar_dtks` berubah.

### Output/cetak

- **Ekspor** `.xlsx` via OpenSpout: `namafile('Dtks Regsosek2022k').xlsx`; hanya
  `versi_kuisioner = REGSOS_EK2022_K` dan `id_rtm NOT NULL`; sheet **`Keluarga`** (`:1013`+) & **`Anggota Keluarga`** (`:1149`+).
- **Cetak** PDF: `cetakPreviewSingle()` (inline) atau `cetakZip()` (banyak) → `Zip::download('berkas_dtks_regsosek_terpilih_<d-m-Y>.zip')`
  (`Dtks.php:285-292`); berkas PDF disimpan di `LOKASI_FOTO_DTKS` (`desa/upload/dtks/`, `constants.php:231`),
  nama `cetak_regsosek2022k_<nik_kepala>_<id_rtm>_<updated_at>.pdf`, dirender dari `resources/views/admin/dtks/2/cetak.php` via Html2Pdf.

### Catatan rebuild Next.js

1. Skema `dtks` sangat lebar (138 kolom) & kode-heavy: pertimbangkan **normalisasi ringan** (tabel jawaban
   `(dtks_id, kode, nilai)`) atau setidaknya validasi berlapis per bagian lewat skema kode → field.
2. Pertahankan satu baris `dtks` **per (rtm, versi)**; `is_draft` menandai belum final.
3. Service `DtksService` (dispatcher versi) + strategi per versi (`DTKSRegsosEk2022k`) adalah pola yang tepat —
   port sebagai *strategy pattern* agar versi baru (mis. Regsosek berikutnya) mudah ditambah.
4. Lampiran (`dtks_lampiran`/`dtks_ref_lampiran`) dimodelkan terpisah; jaga FK SET NULL saat RTM dihapus.

---

## 6. Impor Regsosek2022k / DTKS

### Ringkasan

Menangani **impor massal** untuk (a) program bantuan & pesertanya, (b) suplemen & terdatanya, dan (c) DTKS.
Impor DTKS saat ini **hanya menyediakan unduhan template** (belum ada aksi impor server-side).

### Aktor & hak akses

| Jalur | Route/method | Hak | Sumber |
|---|---|---|---|
| Program bantuan | `Program_bantuan::impor()` (`:252`) | `isCan('u','program-bantuan')` | `Program_bantuan.php:254` |
| Suplemen | `Suplemen::impor_data()` (`:445`) / `impor()` (`:454`) | `isCan` (modul suplemen) | `Suplemen.php` |
| DTKS | `Dtks::loadRecentImpor()` (`:214`) → `DTKSRegsosEk2022k::impor()` | `isCan('b')` | `Dtks.php:214`, service `:129` |

### Alur langkah

1. **Program bantuan** — `BantuanImports` (FastExcel `importSheets`), dua sheet:
   - Sheet **0 = Program** — kolom `id, nama, sasaran, ndesc, asaldana, sdate, edate` (tanggal divalidasi).
   - Sheet **1 = Peserta** — kolom 0 `peserta`, 1 `no_id_kartu`, 2 NIK, 3 `kartu_nama`, 4 tempat lahir,
     5 tanggal lahir, 6 alamat.
   - Validasi NIK via `Bantuan::cek_peserta()` (`Bantuan.php:158`); `sasaran = 4` mengonversi `peserta` → id kelompok;
     opsi `no_id_kartu` acak `acak_<1..1000>`.
   - Simpan: `Bantuan::impor_program()` (`:143`, update bila `ganti_program`, else create + slug) &
     `impor_peserta()` (`:220`, dengan opsi `kosongkan_peserta` → hapus semua lalu insert).
   - Template: `storage/app/template/impor/format-impor-program-bantuan.xlsx`.
2. **Suplemen** — sheet **"Peserta"**; kolom 0 = NIK/`no_kk`, kolom 1 = `keterangan`, sentinel `###`; validasi
   `cek_peserta()`/`cek_penduduk()`; `impor_peserta()` (`:812`). Template `format-impor-suplemen.xlsx`.
3. **DTKS** — `DTKSRegsosEk2022k::impor()` (`:129`) mengembalikan view `admin.dtks.2.impor` yang **hanya** berisi
   tautan unduh template:
   `storage/app/template/impor/format-impor-dtks-regsosek2022k.xlsx`. **Tidak ada handler impor server-side**
   (tidak ada method `impor()` di controller `Dtks`, route `dtks/impor` GET tanpa pemrosesan) `[perlu verifikasi]`.

### Tabel & kolom kunci

- Program bantuan: `program`, `program_peserta` (§1/§2).
- Suplemen: `suplemen`, `suplemen_terdata` (§4).
- DTKS: `dtks`, `dtks_anggota` (§5).
- Konstanta lokasi template: `DEFAULT_LOKASI_IMPOR = 'storage/app/template/impor/'` (`constants.php:182`).

### Aturan bisnis/penting

- **Idempotensi impor**: `impor_program()` update bila `ganti_program` diset; `impor_peserta()` mendukung mode
  "kosongkan" (destruktif) — beri konfirmasi di UI.
- **Validasi tanggal** pada sheet Program; NIK divalidasi lawan master per sasaran.
- **Peta sasaran → identitas** sama dengan §2 (`get_peserta_sql`).
- **Fitur DTKS impor belum lengkap** `[perlu verifikasi]` — jangan diasumsikan ada; untuk rebuild, unduh template
  adalah satu-satunya perilaku yang terbukti.

### Output/cetak

- Hasil impor dilaporkan dalam bentuk ringkasan/`data_diubah` (bukan dokumen cetak). Lihat §8 untuk ekspor.

### Catatan rebuild Next.js

1. Satukan impor dalam satu **mesin impor generik** (mapping kolom deklaratif per entitas: program, peserta,
   suplemen, terdata) dengan mode `create|update|replace`.
2. Validasi baris per baris + laporan galat (baris→pesan) yang dapat diunduh; jangan gagal seluruh batch.
3. Untuk DTKS: implementasikan impor **dari nol** (fitur belum ada di Sistem Acuan) atau minimal pertahankan unduh
   template; tandai sebagai fitur baru, bukan port `[perlu verifikasi]`.

---

## 7. Kaitan Wilayah, Penduduk, Keluarga & RTM

### Ringkasan

Domain bantuan/DTKS berakar pada empat entitas kependudukan: **wilayah** (`tweb_wil_clusterdesa`), **penduduk**
(`tweb_penduduk`), **keluarga** (`tweb_keluarga`), dan **rumah tangga / RTM** (`tweb_rtm`). Relasi ini menentukan
identitas peserta, filter statistik, dan sumber data DTKS.

### Aktor & hak akses

Domain ini tidak punya controller tersendiri; hak akses melekat pada controller pemakainya (`Bantuan`,
`Statistik_bantuan`, `Dtks`, `Suplemen`). Dikaitkan lewat `config_id` (multi-desa) pada tiap tabel.

### Alur langkah

1. **Daftar program** menentukan `sasaran` → menentukan jenis identitas peserta (lihat §2).
2. **Statistik** memfilter per wilayah (dusun/RW/RT) via `tweb_wil_clusterdesa`.
3. **DTKS** dimulai dari `tweb_rtm.terdaftar_dtks = 1`, membuat baris `dtks` per RTM, lalu `dtks_anggota` per
   anggota keluarga HIDUP.
4. **Suplemen** memilih penduduk/keluarga sebagai terdata, menampilkan alamat + RT/RW/dusun.

### Tabel & kolom kunci

**`tweb_rtm`** — `struktur_tabel/2023_12_22_015242_create_tweb_rtm_table.php:50-61`:
`id, config_id, nik_kepala, no_kk, tgl_daftar(timestamp), kelas_sosial, bdt(16), terdaftar_dtks(boolean default 0)`.
Unique `no_kk_config` pada `(config_id, no_kk)`. Pasangan `tweb_rtm_hubungan` (`id` tinyint, `nama`).

**Kaitan utama:**

| Dari | Ke | Kunci | Catatan |
|---|---|---|---|
| `program_peserta.peserta` | `tweb_penduduk.nik` | sasaran 1 | `Bantuan.php:441-555` |
| `program_peserta.peserta` | `tweb_keluarga.no_kk` | sasaran 2 | |
| `program_peserta.peserta` | `tweb_rtm.no_kk` | sasaran 3 | |
| `program_peserta.peserta` | `kelompok.kode` | sasaran 4 | |
| `dtks.id_rtm` | `tweb_rtm.id` | FK SET NULL | |
| `dtks.id_keluarga` | `tweb_keluarga.id` | FK CASCADE | |
| `dtks_anggota.id_penduduk` | `tweb_penduduk.id` | FK SET NULL | |
| `dtks_anggota.id_keluarga` | `tweb_keluarga.id` | FK SET NULL | |
| `suplemen_terdata.penduduk_id` | `tweb_penduduk.id` | FK | sasaran 1 |
| `suplemen_terdata.keluarga_id` | `tweb_keluarga.id` | FK | sasaran 2 |
| `tweb_penduduk.id_cluster` | `tweb_wil_clusterdesa.id` | | alamat & statistik wilayah |

### Aturan bisnis/penting

- **Anggota DTKS hanya penduduk HIDUP** (`status_dasar = 1`): `generateDefaultDtks()` memuat anggota dengan
  `where('status_dasar', 1)` (`DTKSRegsosEk2022k.php:161`).
- **`splitDTKSForEachKeluarga`** (`:891`) menangani RTM yang memuat **lebih dari satu keluarga** — DTKS dipecah
  per keluarga.
- **Wilayah** dipakai untuk filter cluster statistik dan pengisian kode wilayah DTKS (101–106) dari `alamat_wilayah`.
- Penghapusan RTM (`terdaftar_dtks` dilepas) memicu `Rtm::createOrDeleteDtks()` (`Rtm.php:401-417`).

### Output/cetak

Tidak ada cetak khusus di lapisan ini; memengaruhi isi cetak DTKS (§5) dan statistik (§3).

### Catatan rebuild Next.js

1. Jadikan `config_id` (tenant) + relasi FK sebagai tulang punggung integritas; RTM↔keluarga↔penduduk adalah
   graf inti yang dipakai lintas domain.
2. Pertahankan aturan *hanya anggota HIDUP* dan dukungan **RTM multi-keluarga** (pisah per keluarga) di DTKS.
3. Wilayah (dusun/RW/RT) perlu representasi hierarkis untuk filter; jangan simpan nama wilayah redundan di
   `program_peserta`.

---

## 8. Output / Cetak

### Ringkasan

Ringkasan keluaran domain bantuan/DTKS: ekspor `.xlsx` (program, peserta, suplemen, DTKS, OpenDK), cetak daftar
peserta & suplemen, kartu peserta, dan cetak PDF DTKS.

### Aktor & hak akses

Mengikuti controller asal: `expor` (`Program_bantuan`), `ekspor` (`Suplemen`), `ekspor`/`cetak2` (`Dtks`),
`cetak` (`Statistik_bantuan`), dan sinkronisasi OpenDK (`Sinkronisasi`).

### Alur langkah

1. **Ekspor program+peserta** — `Program_bantuan::expor()` (`:278`) → OpenSpout; sheet `Program`
   (`id, config_id, Nama Program, Sasaran Program, Keterangan, Asal Dana, sdate, edate`) & sheet `Peserta`
   (header: Peserta, No. Peserta, NIK, Nama, Tempat Lahir, Tanggal Lahir, Alamat); `sasaran=4` memetakan id → `kelompok.kode`.
2. **Ekspor suplemen** — `Suplemen::ekspor()` (`:593`) → sheet `'Peserta'` + kolom dinamis `form_isian`.
3. **Ekspor DTKS** — `DTKSRegsosEk2022k::ekspor()` (`:378`) → sheet `Keluarga` & `Anggota Keluarga`.
4. **Ekspor OpenDK** — `Sinkronisasi` (`donjo-app/controllers/Sinkronisasi.php`) mengirim `.xlsx`/`.zip`;
   `PesertaBantuanOpendkExport` menambah `desa_id` di depan + `sasaran` dari `bantuan.sasaran`; zip disimpan di
   `LOKASI_SINKRONISASI_ZIP` (`desa/upload/sinkronisasi/`, `constants.php:224`).
5. **Cetak** — daftar peserta (`Peserta_bantuan::daftar`), daftar suplemen (`Suplemen::daftar`), statistik
   (`Statistik_bantuan::cetak`), dan PDF DTKS (`Dtks::cetak2`).

### Tabel & kolom kunci

Sumber data = tabel di §1–§5. Lokasi berkas: `LOKASI_DOKUMEN` (kartu, `desa/upload/dokumen/`),
`LOKASI_FOTO_DTKS` (`desa/upload/dtks/`), `LOKASI_SINKRONISASI_ZIP` (`desa/upload/sinkronisasi/`).

### Aturan bisnis/penting

- **Pemisah domain output** sudah diringkas di `LAMPIRAN-06-SPESIFIKASI-OUTPUT.md` item 13–14
  (`Program_bantuan.php:293`, `Suplemen.php:610`, `app/Exports/*`). Jangan duplikasi spesifikasi kolom di sini.
- Nama berkas DTKS: `Dtks Regsosek2022k.xlsx` (ekspor) dan
  `berkas_dtks_regsosek_terpilih_<d-m-Y>.zip` (cetak massal).
- Ekspor DTKS memfilter `versi_kuisioner = REGSOS_EK2022_K` dan `id_rtm NOT NULL`.

### Output/cetak

| Keluaran | Format | Pemicu | Sumber |
|---|---|---|---|
| Program + peserta | `.xlsx` | `Program_bantuan::expor` | `:278` |
| Suplemen + terdata | `.xlsx` | `Suplemen::ekspor` | `:593` |
| DTKS (Keluarga & Anggota) | `.xlsx` | `DTKSRegsosEk2022k::ekspor` | `:378` |
| DTKS per-RTM | `.pdf` (inline) | `cetakPreviewSingle` | `:342` |
| DTKS banyak | `.zip` (PDF banyak) | `cetakZip` + `Dtks::cetak2` | `:350`, `Dtks.php:235` |
| Kartu peserta | gambar (stream) | `unduh_kartu_peserta` | `:360` |
| Daftar peserta/suplemen/statistik | HTML→PDF/cetak | `daftar`/`cetak` | controller terkait |
| OpenDK program bantuan | `.xlsx`/`.zip` | `Sinkronisasi` | `app/Exports/PesertaBantuanOpendkExport.php` |

### Catatan rebuild Next.js

1. Pisahkan **generator dokumen** dari controller (queue untuk ekspor besar); hasilkan `.xlsx`/`.pdf`/`.zip`
   secara asinkron dengan status unduh (pola `status_file` pada `cetakZip`).
2. Gunakan pustaka Excel/PDF di server (mis. `exceljs`, `puppeteer`/`pdf-lib`) dan streaming respons.
3. Simpan berkas sementara di storage tenant-scoped; bersihkan berkala (Sistem Acuan menyimpan PDF di folder upload).

---

## 9. Catatan Rebuild Next.js

### Ringkasan

Arahan lintas-domain untuk porting bantuan/DTKS ke Next.js 15+ (App Router) + backend API, dengan fokus pada
integritas data, keterpisahan lapisan, dan kompatibilitas migrasi data lama.

### Aktor & hak akses

- RBAC memakai slug modul (`program-bantuan`, `peserta-bantuan`, `data-suplemen`, `statistik-kependudukan`,
  `dtks`) dengan tiga aksi `b/u/h`. Lihat `LAMPIRAN-02-RBAC.md`.

### Alur langkah (checklist porting)

1. Definisikan skema (mis. Drizzle/Prisma) untuk `program`, `program_peserta`, `suplemen`, `suplemen_terdata`,
   `dtks`, `dtks_anggota`, `dtks_lampiran`, `dtks_ref_lampiran`, `dtks_pengaturan_program`, `tweb_rtm`.
2. Port aturan bisnis sebagai fungsi domain murni (status masa aktif, join peserta per sasaran, validasi impor).
3. Bangun *service layer* untuk DTKS dengan *strategy pattern* per versi.
4. Implementasikan ekspor/impor generik + job asinkron.

### Tabel & kolom kunci

Lihat §1–§7. Prioritas migrasi: `program`/`program_peserta` → `suplemen*` → `dtks*`.

### Aturan bisnis/penting

- **Jangan tirani `config_id = NULL`**: gantikan dengan kolom `sumber` eksplisit.
- **Status dihitung, bukan disimpan**; konsisten untuk program & suplemen.
- **Snapshot kartu** berbeda dari master penduduk — pertahankan.
- **Normalisasi `asaldana`** dan konversi kode DTKS (kode→label) di satu tempat.
- `[perlu verifikasi]`: helper warisan ter-obfuscate (`adminMenu`/penandatangan) → verifikasi perilaku cetak/TTD.

### Output/cetak

Ekspor/impor `.xlsx` dan PDF DTKS perlu pustaka setara OpenSpout/Html2Pdf; pertahankan struktur sheet & header
agar interoperabel dengan template lama.

### Catatan rebuild Next.js

1. **Skema normalized untuk kode DTKS**: tabel `(dtks_id, kode, nilai)` atau kolom terindeks per bagian;
   hindari 138 kolom datar bila memungkinkan, tetapi sediakan *view* datar untuk ekspor.
2. **Semua operasi tulis dalam transaksi** (khusus `Dtks::new` / sinkronisasi) — pertahankan perilaku
   `DB::beginTransaction()`.
3. **Idempotensi & auditori**: catat `userid`/`updated_by` (Sistem Acuan memakai *userstamps*).
4. **Uji paralel**: bandingkan hasil ekspor/impor Next.js dengan Sistem Acuan pada dataset uji yang sama untuk
   memverifikasi peta kolom (terutama `501a`+ dan `401`–`431f`).

---

## Matriks Kaitan

| Entitas | Tabel | Controller | Relasi kunci |
|---|---|---|---|
| Program Bantuan | `program` | `Program_bantuan` | `program.config_id → config.id`; unique `(config_id, slug)` |
| Peserta Bantuan | `program_peserta` | `Peserta_bantuan` | `program_id → program.id`; `peserta` → identitas sasaran |
| Statistik Bantuan | `program` + `program_peserta` (+ `tweb_penduduk`/`tweb_keluarga`/`tweb_rtm`/`kelompok`) | `Statistik_bantuan` | join sasaran + `tweb_wil_clusterdesa.id_cluster` |
| Suplemen | `suplemen` | `Suplemen` | unique `(config_id, slug)` |
| Terdata Suplemen | `suplemen_terdata` | `Suplemen` | `id_suplemen → suplemen.id`; `penduduk_id`/`keluarga_id` |
| DTKS (Keluarga) | `dtks` | `Dtks` + `DTKSRegsosEk2022k` | `id_rtm → tweb_rtm.id` (SET NULL); `id_keluarga` (CASCADE) |
| DTKS (Anggota) | `dtks_anggota` | `Dtks` + `DTKSRegsosEk2022k` | `id_dtks → dtks.id`; `id_penduduk → tweb_penduduk.id` |
| Lampiran DTKS | `dtks_lampiran`, `dtks_ref_lampiran` | `DTKSRegsosEk2022k` | `id_rtm → tweb_rtm.id`; `id_dtks`/`id_lampiran` |
| Pengaturan Program DTKS | `dtks_pengaturan_program` | `DTKSRegsosEk2022k` | `id_bantuan → program.id`; unique `(config_id, versi_kuisioner, kode)` |
| RTM | `tweb_rtm` | `Rtm` / `Dtks` | unique `(config_id, no_kk)`; `terdaftar_dtks` |
| Wilayah | `tweb_wil_clusterdesa` | (lintas) | `tweb_penduduk.id_cluster` |
| Sinkronisasi OpenDK | (via model) `program`, `program_peserta` | `Sinkronisasi` | LogSinkronisasi `modul` = `program-bantuan` / `program-bantuan-peserta` |

---

## Ringkasan Cakupan

| Area | § | Tabel inti | Controller/Service | Tingkat keyakinan |
|---|---|---|---|---|
| Program Bantuan | §1 | `program` | `Program_bantuan` | Tinggi |
| Peserta & Kartu | §2 | `program_peserta` | `Peserta_bantuan`, `Program_bantuan` | Tinggi |
| Statistik Bantuan | §3 | `program`, `program_peserta` | `Statistik_bantuan`, `App\Libraries\Statistik` | Sedang–Tinggi |
| Suplemen | §4 | `suplemen`, `suplemen_terdata` | `Suplemen` | Tinggi |
| DTKS | §5 | `dtks`, `dtks_anggota`, `dtks_lampiran`, `dtks_ref_lampiran`, `dtks_pengaturan_program` | `Dtks`, `DTKSRegsosEk2022k`, `DtksService` | Sedang–Tinggi |
| Impor/DTKS | §6 | `program*`, `suplemen*`, `dtks*` | `BantuanImports`, `Suplemen`, `DTKSRegsosEk2022k` | Sedang (DTKS impor: Rendah) |
| Kaitan entitas | §7 | `tweb_rtm`, `tweb_penduduk`, `tweb_keluarga`, `tweb_wil_clusterdesa` | (lintas) | Tinggi |
| Output/Cetak | §8 | (di atas) | ekspor/cetak lintas controller | Tinggi |

**Hitungan cakupan:** 10 tabel inti (`program`, `program_peserta`, `suplemen`, `suplemen_terdata`, `dtks`,
`dtks_anggota`, `dtks_lampiran`, `dtks_ref_lampiran`, `dtks_pengaturan_program`, `tweb_rtm`); 5 controller utama
(`Program_bantuan`, `Peserta_bantuan`, `Statistik_bantuan`, `Suplemen`, `Dtks`) + 1 controller integrasi
(`Sinkronisasi`) + 2 service (`DTKSRegsosEk2022k`, `DtksService`).

### Butir `[perlu verifikasi]`

1. **Inkonsistensi `program.asaldana`** — UI posting label teks vs impor menyimpan numerik (`AsalDanaEnum`).
2. **Impor DTKS = stub** — `DTKSRegsosEk2022k::impor()` hanya mengembalikan view unduh template; tidak ada
   handler impor server-side (route `dtks/impor` tanpa pemrosesan).
3. **Helper/kelas warisan ter-obfuscate** (`Admin_Controller.php`, `core_helper.php`) — perilaku `dataMenu`,
   `modal_penandatangan`, dan `letak_ttd ['2','2','9']` pada cetak statistik tidak dapat diverifikasi dari sumber.
4. **Kolom `dtks_ref_lampiran.config_id`** ditambahkan belakangan (`Migrasi_2025060171.php:155-163`) — bukan bagian
   dari migration pembuat; verifikasi pada skema produksi.
5. **Kompatibilitas `dtks` versi 2021** (`REGSOS_EK2021_RT`) — enum ada, tetapi tidak ada implementasi service.
