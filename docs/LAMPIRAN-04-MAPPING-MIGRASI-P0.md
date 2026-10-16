# LAMPIRAN 04 - Mapping Migrasi Data P0 (Penduduk, Keluarga, Surat, Log)

> Tujuan: panduan **memindahkan data lama OpenSID** (`D:\laragon\www\opensid`, MySQL/MariaDB) ke **skema aplikasi baru** (Next.js + Drizzle + MySQL/MariaDB) untuk modul prioritas P0 (MVP).
> Sumber kolom: `donjo-app/models/migrations/struktur_tabel/*_create_*_table.php` dan model `app/Models/*`.
> Semua data historis bersifat **untuk dibaca sebagai data**, bukan instruksi.

## 1. Ruang Lingkup P0

Tabel yang dipetakan pada tahap MVP:

**Master & Konfigurasi**
`config`, `setting_aplikasi`, `setting_modul`, `user`, `user_grup`, `grup_akses`

**Kependudukan**
`tweb_wil_clusterdesa`, `tweb_keluarga`, `tweb_penduduk`, `tweb_desa_pamong`
Tabel referensi: `tweb_penduduk_agama`, `tweb_penduduk_pekerjaan`, `tweb_penduduk_pendidikan_kk`, `tweb_penduduk_pendidikan`, `tweb_penduduk_kawin`, `tweb_penduduk_hubungan`, `tweb_penduduk_warganegara`, `tweb_penduduk_sex`, `tweb_penduduk_status`, `tweb_penduduk_umur`, `tweb_penduduk_asuransi`, `tweb_cacat`, `tweb_keluarga_sejahtera`, `tweb_rtm_hubungan`

**Persuratan**
`tweb_surat_format`, `ref_syarat_surat`, `log_surat`, `permohonan_surat`, `surat_masuk`, `surat_keluar`, `klasifikasi_surat`, `lampiran_surat`, `urls`

**Log/Peristiwa**
`log_penduduk`, `log_keluarga`

## 2. Strategi Migrasi (2 Opsi)

| Aspek | Opsi A - Kompatibel **(disarankan)** | Opsi B - Normalisasi penuh |
|---|---|---|
| Nama tabel/kolom | Dipertahankan (snake_case sama) | Diganti gaya baru (`residents`, `families`) |
| ID | Pertahankan nilai lama (integer) | UUID baru + tabel map |
| Tipe | Naikkan tipe (varchar length, boolean, datetime) | Tipe ideal |
| Enum | Simpan kode numerik + tabel lookup | Enum DB / kode baru |
| Kecepatan migrasi | Cepat, rendah risiko | Lambat, banyak bug mapping |
| Risiko kehilangan data | Rendah | Menengah-tinggi |

**Rekomendasi: Opsi A.** Karena banyak relasi OpenSID memakai **ID numerik & `nik`/`no_kk` sebagai penghubung logis**, mempertahankan ID lama jauh lebih aman. Perbaikan tipe & struktur dilakukan bertahap setelah aplikasi baru stabil.

## 3. Aturan Umum Transformasi Tipe

| MySQL (OpenSID) | Tipe baru (MySQL/MariaDB) | Aturan |
|---|---|---|
| `tinyInteger` (0/1 boolean) | `boolean` (tinyint(1)) | Konversi 1=1, 0=0, NULL→0 bila default false |
| `tinyInteger` enum | `smallint` / `tinyint` | **Pertahankan kode numerik** + lookup table |
| `increments`/`integer` PK | `int unsigned AUTO_INCREMENT` **atau** `int` (ikuti asal) | Jika ada FK lama ke ID ini, **jangan ubah tipe** |
| `mediumIncrements` (PK `user`) | `int unsigned AUTO_INCREMENT`/`mediumint` | Perhatikan rentang |
| `string` (tanpa panjang) | `varchar(255)` | Tambahkan panjang eksplisit (MySQL default 255) |
| `string(col, 16)` | `varchar(16)` | Pertahankan panjang |
| `char`, `tinyText` | `varchar(...)` | Normalisasi |
| `longText`/`mediumText`/`text` | `text`/`mediumtext`/`longtext` | HTML/isi surat → `longtext` |
| `date` | `date` | Normalisasi `0000-00-00` → NULL |
| `dateTime`/`timestamp` | `datetime` | Zona waktu server; simpan apa adanya |
| `year` | `smallint` | |
| JSON-dalam-`text` (mis. `syarat_surat`, `akses_wilayah`) | `json` **atau** `longtext` | Validasi isi JSON saat impor |
| `unsignedInteger` (`tweb_penduduk.status`) | `smallint` | Lihat enum StatusPendudukEnum |
| `nullableMorphs`/`morphs` | `varchar`+`int` | Tabel baru (mis. `log_activity`) |

**Prinsip:**
1. Jangan ubah tipe kolom yang menjadi target FK lama kecuali semua dependen ikut diubah.
2. Pertahankan kode enum numerik sesungguhnya (jangan remap) agar impor 1:1.
3. Tambahkan kolom standar baru: `created_at`, `updated_at`, `deleted_at` (soft delete) pada tabel transaksional, diisi default migrasi (`created_at` = waktu impor jika asal tidak ada).
4. Jangan menyalin kolom usang (mis. `session`, `token`) kecuali fitur tersedia di aplikasi baru.

## 4. Mapping Kolom

### 4.1 `config` (identitas desa — tabel multi-desa)

| Kolom lama | Tipe | Kolom baru | Tipe baru | Transformasi |
|---|---|---|---|---|
| `id` | integer | `id` | int PK | Pertahankan. Ini `config_id`. |
| `app_key` | string | `app_key` | varchar(255) | Salin. |
| `nama_desa` | string | `nama_desa` | varchar(100) | Salin. |
| `kode_desa` | string | `kode_desa` | char(10) | Salin (string, jangan integer). |
| `kode_pos` | integer | `kode_pos` | varchar(5) | **Konversi** integer→string (leading zero). |
| `nama_kecamatan` | string | `nama_kecamatan` | varchar(100) | Salin. |
| `kode_kecamatan` | string | `kode_kecamatan` | char(8) | Salin. |
| `nama_kepala_camat` | string | `nama_kepala_camat` | varchar(100) | Salin. |
| `nip_kepala_camat` | string | `nip_kepala_camat` | varchar(30) | Salin. |
| `nama_kabupaten` | string | `nama_kabupaten` | varchar(100) | Salin. |
| `kode_kabupaten` | string | `kode_kabupaten` | char(4) | Salin. |
| `nama_propinsi` | string | `nama_propinsi` | varchar(100) | Salin. |
| `kode_propinsi` | string | `kode_propinsi` | char(2) | Salin. |
| `logo`, `path` | string/longText | `logo`, `path` | varchar(255) | Salin path relatif (pindahkan file). |
| `lat`,`lng`,`zoom`,`map_tipe` | string/int | sama | varchar/int | Salin. |
| `alamat_kantor`,`email_desa`,`telepon`,`nomor_operator`,`website`,`kantor_desa` | string | sama | varchar | Salin. |
| `warna`,`border` | string | sama | varchar(50) | Salin. |
| — | — | `created_at`,`updated_at` | datetime | Set waktu impor. |

> Catatan: `config` di OpenSID **juga** berperan sebagai tabel `identitas`. Di aplikasi baru disarankan memisahkan: tabel `villages` (tenant) + `village_profile` (identitas tampilan). Untuk Opsi A, cukup rename `config` → `villages`.

### 4.2 RBAC: `user`, `user_grup`, `setting_modul`, `grup_akses`

**`user_grup`** — sama persis:

| Lama | Tipe | Baru | Tipe | Transformasi |
|---|---|---|---|---|
| `id` | integer | `id` | int PK | Pertahankan. |
| `config_id` | integer | `config_id` | int FK→villages | Salin. |
| `nama` | string | `nama` | varchar(100) | Salin. |
| `slug` | string | `slug` | varchar(100) | Salin (unicity per config). |
| `jenis` | tinyInteger | `jenis` | tinyint | 1=Sistem, 2=Desa. |

**`user`**:

| Lama | Tipe | Baru | Tipe | Transformasi |
|---|---|---|---|---|
| `id` | mediumIncrements | `id` | int PK | Pertahankan. |
| `config_id` | integer | `config_id` | int FK | Salin. |
| `username` | string | `username` | varchar(100) | Salin. |
| `password` | string | `password_hash` | varchar(255) | **Jangan dipindah apa adanya bila migrasi ke better-auth**. Buat kolom `password` baru + tandai `must_reset_password=true`, atau import hash bcrypt jika kompatibel. Hash MD5 lama **tidak kompatibel** → paksa reset. |
| `id_grup` | integer | `role_id`/`id_grup` | int FK→user_grup | Salin. |
| `pamong_id` | integer | `pamong_id` | int FK | Salin. |
| `email` | string | `email` | varchar(255) | Salin. |
| `last_login` | dateTime | `last_login_at` | datetime | Salin. |
| `email_verified_at` | dateTime | `email_verified_at` | datetime | Salin. |
| `active` | boolean | `active` | boolean | Salin. |
| `nama` | string | `nama` | varchar(100) | Salin. |
| `id_telegram`,`token`,`token_exp`,`telegram_verified_at`,`notif_telegram` | mixed | (opsional) | — | Salin bila fitur Telegram dipertahankan. |
| `company`,`phone`,`foto` | string | sama | varchar | Salin. |
| `session` | string | — | — | **Tidak disalin** (session baru via better-auth). |

**`setting_modul`** → jadi katalog `permissions`/`resources`:

| Lama | Baru | Catatan |
|---|---|---|
| `id` | `id` | Pertahankan. |
| `config_id` | `config_id` | Salin. |
| `modul` | `nama` | Label. |
| `slug` | `slug` | Kunci unik modul (dasar nama permission). |
| `url` | `url` | Salin (untuk peta route). |
| `aktif` | `aktif` | boolean. |
| `ikon`,`ikon_kecil` | `ikon` | varchar. |
| `urut` | `urut` | int. |
| `level` | `level` | boolean (induk/daun). |
| `hidden` | `hidden` | boolean. |
| `parent` | `parent_id` | int (self FK). |

**`grup_akses`** → jadi `role_permissions`:

| Lama | Baru | Transformasi |
|---|---|---|
| `id` | `id` | Pertahankan. |
| `config_id` | `config_id` | Salin. |
| `id_grup` | `role_id` | Salin. |
| `id_modul` | `permission_id` (atau `modul_id`) | Salin. |
| `akses` | `akses` | **Pertahankan 1/3/7** (Baca/Ubah/Hapus). Bisa juga diturunkan jadi boolean `can_read/can_update/can_delete`: 1→(r), 3→(r,u), 7→(r,u,d). |

Aturan turunan akses bila memakai boolean:

```
akses = 1  -> read=true,  update=false, delete=false
akses = 3  -> read=true,  update=true,  delete=false
akses = 7  -> read=true,  update=true,  delete=true
```

### 4.3 `tweb_wil_clusterdesa` (wilayah)

| Lama | Tipe | Baru | Tipe | Transformasi |
|---|---|---|---|---|
| `id` | integer | `id` | int PK | Pertahankan (dipakai `id_cluster`). |
| `config_id` | integer | `config_id` | int FK | Salin. |
| `rt` | string | `rt` | varchar(10) | Salin (string, mungkin '000'). |
| `rw` | string | `rw` | varchar(10) | Salin. |
| `dusun` | string | `dusun` | varchar(100) | Salin. |
| `id_kepala` | integer | `kepala_penduduk_id` | int nullable | FK logis ke penduduk. |
| `lat`,`lng`,`zoom`,`path`,`map_tipe`,`warna`,`border` | mixed | sama | varchar/text | Salin. |
| `urut`,`urut_cetak` | integer | `urut`,`urut_cetak` | int | Salin. |

> Baris dengan `rt='0'`/`rw='0'` dan `dusun` terisi = level dusun; baris `rt` terisi = level RT. Struktur ini **datar** (satu tabel untuk 3 level). Di aplikasi baru boleh tetap datar atau dinormalisasi (`dusun`, `rw`, `rt`). Untuk Opsi A: pertahankan datar.

### 4.4 `tweb_keluarga` (Kartu Keluarga)

| Lama | Tipe | Baru | Tipe | Transformasi |
|---|---|---|---|---|
| `id` | integer | `id` | int PK | Pertahankan (target `tweb_penduduk.id_kk`). |
| `config_id` | integer | `config_id` | int FK | Salin. |
| `no_kk` | string | `no_kk` | char(16) | Normalisasi: hapus spasi/non-digit; validasi 16 digit; NIK/KK sementara dipertahankan. |
| `nik_kepala` | string | `nik_kepala` | char(16) | Salin; relasi logis ke `tweb_penduduk.nik`. |
| `tgl_daftar` | timestamp | `tgl_daftar` | datetime | Salin. |
| `kelas_sosial` | integer | `kelas_sosial_id` | int FK→keluarga_sejahtera | Salin. |
| `tgl_cetak_kk` | dateTime | `tgl_cetak_kk` | datetime null | `0000-00-00`→NULL. |
| `alamat` | string | `alamat` | varchar(255) | Salin. |
| `id_cluster` | integer | `id_cluster` | int FK→wilayah | Salin. |
| `updated_at` | timestamp | `updated_at` | datetime | Salin/set. |
| `updated_by` | integer | `updated_by` | int null | Salin. |
| — | — | `created_at`,`deleted_at` | datetime | Set impor. |

### 4.5 `tweb_penduduk` (inti)

| Lama | Tipe | Baru | Tipe | Transformasi |
|---|---|---|---|---|
| `id` | integer | `id` | int PK | **Pertahankan** (dipakai `id_pend` di log/surat). |
| `config_id` | integer | `config_id` | int FK | Salin. |
| `nama` | string | `nama` | varchar(100) | Salin (pertimbangkan UPPER untuk konsistensi). |
| `nik` | string | `nik` | char(16) | Normalisasi digit; unik per `config_id`. NIK sementara `0[kode_desa][5digit]` dipertahankan. |
| `id_kk` | integer | `keluarga_id`/`id_kk` | int FK→keluarga | Salin. `0`/NULL → NULL. |
| `kk_level` | tinyInteger | `kk_level` | smallint | Kode SHDK 1..11 (lihat enum). |
| `id_rtm` | string | `id_rtm` | int null | **Konversi** string→int; kosong/`0`→NULL. `[perlu verifikasi]` bila ada non-numerik. |
| `rtm_level` | integer | `rtm_level` | smallint | 1=KRT, 2=Anggota. |
| `sex` | unsignedTinyInteger | `jenis_kelamin` | smallint | 1=L, 2=P. |
| `tempatlahir` | string | `tempat_lahir` | varchar(100) | Salin. |
| `tanggallahir` | date | `tanggal_lahir` | date | Normalisasi; `0000-00-00`→NULL. |
| `agama_id` | integer | `agama_id` | int FK | Salin (lookup). |
| `pendidikan_kk_id` | integer | `pendidikan_kk_id` | int FK | Salin. |
| `pendidikan_sedang_id` | integer | `pendidikan_sedang_id` | int FK | Salin. |
| `pekerjaan_id` | integer | `pekerjaan_id` | int FK | Salin. |
| `status_kawin` | tinyInteger | `status_kawin` | smallint | 1..4 (lihat enum). |
| `warganegara_id` | tinyInteger | `warganegara_id` | smallint | 1=WNI,2=WNA,3=Dua Kewarganegaraan. |
| `dokumen_pasport`,`dokumen_kitas` | string | sama | varchar | Salin. |
| `ayah_nik`,`ibu_nik`,`nama_ayah`,`nama_ibu` | string | sama | varchar | Salin (validasi NIK 16 digit bila ada). |
| `foto` | string | `foto` | varchar(255) | Pindahkan file, simpan path baru. |
| `golongan_darah_id` | integer | `golongan_darah_id` | int FK | 1..13 (lihat enum). |
| `id_cluster` | integer | `id_cluster` | int FK→wilayah | Salin. |
| `status` | unsignedInteger | `status_penduduk` | smallint | 1=Tetap, 2=Tidak Tetap (StatusPendudukEnum). |
| `alamat_sebelumnya`,`alamat_sekarang` | string | sama | varchar(255) | Salin. |
| `status_dasar` | tinyInteger | `status_dasar` | smallint | 1 Hidup,2 Mati,3 Pindah,4 Hilang,6 Pergi,9 Tidak Valid. |
| `hamil` | integer | `status_hamil` | smallint null | **1=Hamil, 2=Tidak Hamil** (HamilEnum; tabel `ref_penduduk_hamil`). Data lama `0`→NULL/2. |
| `cacat_id` | integer | `cacat_id` | int FK | 1..7. |
| `sakit_menahun_id` | integer | `sakit_menahun_id` | int FK | Salin. |
| `akta_lahir`,`akta_perkawinan`,`akta_perceraian` | string | sama | varchar | Salin. |
| `tanggalperkawinan`,`tanggalperceraian` | date | `tanggal_perkawinan`,`tanggal_perceraian` | date | `0000-00-00`→NULL. |
| `cara_kb_id` | tinyInteger | `cara_kb_id` | smallint | Salin (1..7,99,100). |
| `telepon` | string | `telepon` | varchar(30) | Salin. |
| `tanggal_akhir_paspor` | date | sama | date | Nullable. |
| `no_kk_sebelumnya` | string | sama | char(16) | Salin. |
| `ktp_el` | tinyInteger | `ktp_el` | boolean | 1/0. |
| `status_rekam` | tinyInteger | `status_rekam` | smallint | 1 Belum, 2 KTP-el, 3 KIA. |
| `waktu_lahir` | string | `waktu_lahir` | varchar(10) | Salin. |
| `tempat_dilahirkan` | tinyInteger | `tempat_dilahirkan` | smallint | **1=RS/RB, 2=Puskesmas, 3=Polindes, 4=Rumah, 5=Lainnya** (`Penduduk::TEMPAT_LAHIR`). |
| `jenis_kelahiran` | tinyInteger | `jenis_kelahiran` | smallint | **1=Tunggal, 2=Kembar 2, 3=Kembar 3, 4=Kembar 4** (`Penduduk::JENIS_KELAHIRAN`). |
| `kelahiran_anak_ke` | tinyInteger | `kelahiran_anak_ke` | smallint | Salin. |
| `penolong_kelahiran` | tinyInteger | `penolong_kelahiran` | smallint | **1=Dokter, 2=Bidan/Perawat, 3=Dukun, 4=Lainnya** (`Penduduk::PENOLONG_KELAHIRAN`). |
| `berat_lahir` | smallInteger | `berat_lahir` | smallint | Salin (gram). |
| `panjang_lahir` | string | `panjang_lahir` | varchar(10) | Salin. |
| `tag_id_card` | string | `tag_id_card` | varchar(50) | Salin. |
| `id_asuransi` | tinyInteger | `asuransi_id` | smallint | 1..4,99 (AsuransiEnum). |
| `no_asuransi` | char | `no_asuransi` | varchar(50) | Salin. |
| `email`,`email_token`,`email_tgl_kadaluarsa`,`email_tgl_verifikasi` | mixed | sama | varchar/datetime | Salin (fitur mandiri). |
| `telegram*` | mixed | sama | varchar/datetime | Salin bila dipakai. |
| `bahasa_id` | integer | `bahasa_id` | smallint | BahasaEnum 1..6. |
| `ket` | tinyText | `keterangan` | varchar(255) | Salin. |
| `negara_asal` | string | `negara_asal` | varchar(100) | Salin. |
| `tempat_cetak_ktp`,`tanggal_cetak_ktp` | string/date | sama | varchar/date | Salin. |
| `suku` | string | `suku` | varchar(100) | Salin (nilai teks, bukan ID). |
| `bpjs_ketenagakerjaan` | char | `bpjs_ketenagakerjaan` | varchar(50) | Salin. |
| `hubung_warga` | string | `hubung_warga` | varchar(50) | Salin. |
| — | — | `created_at`,`updated_at`,`deleted_at` | datetime | Set impor. |

> **Indeks yang disarankan**: `UNIQUE(config_id, nik)`, `INDEX(config_id, id_kk)`, `INDEX(config_id, status_dasar)`, `INDEX(config_id, id_cluster)`.

### 4.6 Tabel Referensi (lookup) — impor apa adanya

Semua tabel berikut hanya punya `id` + `nama` (kecuali `tweb_penduduk_umur`). **Impor 1:1, pertahankan ID**.

| Tabel lama | Tabel baru | Catatan |
|---|---|---|
| `tweb_penduduk_agama` | `ref_agama` | 1..7 terisi (Islam..Lainnya). |
| `tweb_penduduk_pekerjaan` | `ref_pekerjaan` | ~89 baris (PekerjaanEnum). |
| `tweb_penduduk_pendidikan_kk` | `ref_pendidikan_kk` | 1..10. |
| `tweb_penduduk_pendidikan` | `ref_pendidikan_sedang` | Kode 1..20. |
| `tweb_penduduk_kawin` | `ref_status_kawin` | 1..4. |
| `tweb_penduduk_hubungan` | `ref_shdk` | 1..11 (SHDKEnum). |
| `tweb_penduduk_warganegara` | `ref_warganegara` | 1..3. |
| `tweb_penduduk_sex` | `ref_jenis_kelamin` | 1=L,2=P. |
| `tweb_penduduk_status` | `ref_status_penduduk` | 1=Tetap,2=Tidak Tetap. |
| `tweb_penduduk_asuransi` | `ref_asuransi` | tinyint id. |
| `tweb_cacat` | `ref_cacat` | 1..7. |
| `tweb_keluarga_sejahtera` | `ref_keluarga_sejahtera` | 1..5. |
| `tweb_rtm_hubungan` | `ref_rtm_hubungan` | 1=KRT,2=Anggota. |
| `tweb_penduduk_umur` | `ref_kategori_umur` | punya `config_id`,`dari`,`sampai`,`status`. |

> Isi data lengkap tiap tabel ada di **LAMPIRAN-03-ENUM-REFERENSI.md**.

### 4.7 `tweb_desa_pamong` (perangkat desa)

| Lama | Baru | Tipe | Catatan |
|---|---|---|---|
| `pamong_id` | `id` | int PK | Pertahankan. |
| `config_id` | `config_id` | int FK | Salin. |
| `pamong_nama`,`gelar_depan`,`gelar_belakang` | sama | varchar | Salin. |
| `pamong_nip`,`pamong_niap`,`pamong_nik` | sama | varchar | Salin. |
| `pamong_pin` | (hash) | varchar | Jika fitur PIN dipertahankan → re-hash. |
| `pamong_tag_id_card`,`pamong_pin` | sama | varchar | Salin. |
| `pamong_status`,`pamong_ttd`,`pamong_ub` | boolean | boolean | Salin. |
| `pamong_tgl_terdaftar`,`pamong_tglsk`,`pamong_tglhenti` | date | date | `0000-00-00`→NULL. |
| `foto` | `foto` | varchar | Pindah file. |
| `id_pend` | `penduduk_id` | int FK | Salin. |
| `pamong_tempatlahir`,`pamong_tanggallahir`,`pamong_sex`,`pamong_pendidikan`,`pamong_agama` | sama | mixed | Salin. |
| `pamong_nosk`,`pamong_masajab`,`pamong_pangkat`,`pamong_nohenti` | sama | varchar | Salin. |
| `urut`,`atasan`,`bagan_*`,`kehadiran`,`jabatan_id` | sama | mixed | Salin. |

### 4.8 `tweb_surat_format` (template & jenis surat)

| Lama | Tipe | Baru | Tipe | Transformasi |
|---|---|---|---|---|
| `id` | integer | `id` | int PK | Pertahankan (`id_format_surat`). |
| `config_id` | integer | `config_id` | int FK | Salin. |
| `nama` | string | `nama` | varchar(100) | Salin. |
| `url_surat` | string | `url_surat` | varchar(100) | Salin (unique per config). |
| `kode_surat` | string | `kode_surat` | varchar(10) | Salin. |
| `lampiran` | string | `lampiran` | varchar(100) | Salin. |
| `kunci` | boolean | `kunci` | boolean | 1 sistem (tak bisa dihapus), 0 desa. |
| `favorit` | boolean | `favorit` | boolean | Salin. |
| `jenis` | tinyInteger | `jenis` | tinyint | 3=Surat Sistem, 4=Surat Desa (FormatSurat::JENIS_SURAT). |
| `mandiri` | boolean | `mandiri` | boolean | 1=bisa diajukan via layanan mandiri. |
| `masa_berlaku` | integer | `masa_berlaku` | int | Salin. |
| `satuan_masa_berlaku` | string | `satuan_masa_berlaku` | char(1) | H/M/B/T (SatuanWaktuEnum). |
| `qr_code`,`qr_code_tte`,`logo_garuda` | boolean | sama | boolean | Salin. |
| `kecamatan` | boolean | `kecamatan` | boolean | Arsip ke kecamatan. |
| `syarat_surat` | longText(JSON) | `syarat` | json/longtext | **Validasi JSON**; simpan daftar `ref_syarat_id`. |
| `template`,`template_desa` | longText | sama | longtext | HTML TinyMCE. |
| `form_isian`,`kode_isian` | longText | sama | longtext | Skema form & kode isian. |
| `orientasi`,`ukuran`,`margin`,`margin_global` | mixed | sama | varchar/bool | Salin. |
| `footer`,`header` | integer | sama | int | Salin. |
| `format_nomor`,`format_nomor_global` | string/bool | sama | varchar/bool | Salin (lihat penomoran). |
| `sumber_penduduk_berulang` | boolean | sama | boolean | Salin. |

### 4.9 `ref_syarat_surat`

| Lama | Baru | Tipe | Catatan |
|---|---|---|---|
| `ref_syarat_id` | `id` | int PK | Pertahankan. |
| `config_id` | `config_id` | int FK | Salin. |
| `ref_syarat_nama` | `nama` | varchar(100) | Salin. |

> **Terkonfirmasi:** tidak ada tabel pivot `syarat_surat`; relasi format↔syarat disimpan sebagai **JSON di kolom `tweb_surat_format.syarat_surat`** (daftar `ref_syarat_id`). Hanya ada tabel master `ref_syarat_surat`.

### 4.10 `log_surat` (arsip surat)

| Lama | Tipe | Baru | Tipe | Transformasi |
|---|---|---|---|---|
| `id` | integer | `id` | int PK | Pertahankan. |
| `config_id` | integer | `config_id` | int FK | Salin. |
| `id_format_surat` | integer | `format_surat_id` | int FK | Salin. |
| `id_pend` | integer | `penduduk_id` | int FK | Salin (bisa NULL untuk non-warga). |
| `id_pamong` | integer | `pamong_id` | int FK | Salin. |
| `nama_pamong`,`nama_jabatan` | string | sama | varchar | Salin (snapshot penandatangan). |
| `id_user` | integer | `user_id` | int FK | Salin. |
| `tanggal` | timestamp | `tanggal` | datetime | Salin. |
| `bulan`,`tahun` | string | `bulan`,`tahun` | varchar(2)/(4) | Salin (dipakai penomoran). |
| `no_surat` | string | `no_surat` | varchar(100) | Salin. |
| `nama_surat` | string | `nama_surat` | varchar(100) | Salin. |
| `lampiran` | string | `lampiran` | varchar(100) | Salin. |
| `nik_non_warga` | decimal | `nik_non_warga` | varchar(16) | **Konversi** numeric→string. |
| `nama_non_warga` | string | `nama_non_warga` | varchar(100) | Salin. |
| `keterangan` | string | `keterangan` | text | Salin. |
| `lokasi_arsip` | string | `lokasi_arsip` | varchar(255) | Salin. |
| `urls_id` | integer | `urls_id` | int FK→urls | Salin. |
| `status` | tinyInteger | `status` | tinyint | 0=Konsep, 1=Cetak, -1=Ditolak (LogSurat::KONSEP/CETAK/TOLAK). |
| `log_verifikasi` | string | `log_verifikasi` | varchar/text | Salin. |
| `tte` | boolean | `tte` | boolean | Salin. |
| `verifikasi_operator`,`verifikasi_kades`,`verifikasi_sekdes` | boolean | sama | boolean | Salin. |
| `isi_surat` | longText | `isi_surat` | longtext | HTML hasil render. |
| `kecamatan` | boolean | `kecamatan` | boolean | Salin. |
| `deleted_at` | dateTime | `deleted_at` | datetime | Salin (soft delete). |
| `pemohon` | string | `pemohon` | varchar(100) | Salin. |

> **Indeks**: `UNIQUE(config_id, no_surat, id_format_surat)` bila penomoran unik; `INDEX(config_id, id_pend)`.

### 4.11 `permohonan_surat`

| Lama | Baru | Tipe | Catatan |
|---|---|---|---|
| `id` | `id` | int PK | Pertahankan. |
| `config_id` | `config_id` | int FK | Salin. |
| `id_pemohon` | `penduduk_id` | int FK | Salin. |
| `id_surat` | `format_surat_id` | int FK | Salin. |
| `isian_form` | `isian_form` | json/longtext | Validasi JSON. |
| `status` | `status` | tinyint | **0=Belum Lengkap, 1=Sedang Diperiksa, 2=Menunggu Tanda Tangan, 3=Siap Diambil, 4=Sudah Diambil, 5=Dibatalkan** (`PermohonanSurat::STATUS_PERMOHONAN`). |
| `alasan` | `alasan` | varchar/text | Salin. |
| `keterangan` | `keterangan` | text | Salin. |
| `no_hp_aktif` | `no_hp_aktif` | varchar(20) | Salin. |
| `syarat` | `syarat` | json/longtext | Salin. |
| `created_at`,`updated_at` | datetime | sama | Salin. |
| `no_antrian` | `no_antrian` | varchar(20) | Salin. |

### 4.12 `surat_masuk` & `surat_keluar`

Impor 1:1. Perhatikan kolom tanggal `date` dan `nomor_urut`.

**`surat_masuk`**: `id, config_id, nomor_urut, tanggal_penerimaan, nomor_surat, kode_surat, tanggal_surat, pengirim, isi_singkat, isi_disposisi, berkas_scan, lokasi_arsip`.
**`surat_keluar`**: `id, config_id, nomor_urut, nomor_surat, kode_surat, tanggal_surat, tanggal_catat, tujuan, isi_singkat, berkas_scan, ekspedisi(bool), tanggal_pengiriman, tanda_terima, keterangan, lokasi_arsip`.

Transformasi: `berkas_scan`/`lokasi_arsip` → pindahkan file dan simpan path baru; `ekspedisi` boolean.

### 4.13 `klasifikasi_surat`, `lampiran_surat`, `urls`

- `klasifikasi_surat`: `id, config_id, kode, nama(text), uraian, enabled(int→boolean)`.
- `lampiran_surat`: `id, config_id, slug, nama, jenis(1=Sistem,2=Desa), template, template_desa, status`.
- `urls`: `id, config_id, url, alias, created` — dipakai untuk QR/verifikasi surat (relasi `log_surat.urls_id`).

### 4.14 `log_penduduk` & `log_keluarga` (peristiwa)

**`log_penduduk`**: `id, config_id, id_pend, kode_peristiwa, meninggal_di, jam_mati, sebab, penolong_mati, akta_mati, alamat_tujuan, tgl_lapor, tgl_peristiwa, catatan, no_kk, nama_kk, ref_pindah, maksud_tujuan_kedatangan`.

| Transformasi | Catatan |
|---|---|
| `id_pend` → `penduduk_id` | FK ke penduduk. |
| `kode_peristiwa` | 1=Baru Lahir, 2=Mati, 3=Pindah Keluar, 4=Hilang, 5=Baru Pindah Masuk, 6=Tidak Tetap Pergi (`PeristiwaPendudukEnum`). |
| `tgl_peristiwa`,`tgl_lapor` | date/datetime, `0000-00-00`→NULL. |
| `ref_pindah` | PindahEnum 1=Desa,2=Kecamatan,3=Kabupaten,4=Provinsi. |
| `no_kk`,`nama_kk` | Snapshot teks. |

**`log_keluarga`**: `id, config_id, id_kk, id_peristiwa, tgl_peristiwa, id_pend, updated_by, id_log_penduduk`.

| Transformasi | Catatan |
|---|---|
| `id_kk` → `keluarga_id` | FK. |
| `id_peristiwa` | 1=Keluarga Baru, 2=Kepala Keluarga Mati, 3=Kepala Keluarga Pindah, 4=Kepala Keluarga Hilang, 5=Keluarga Baru Datang, 6=Kepala Keluarga Pergi, 11=Kepala Keluarga Tidak Valid, 12=Anggota Keluarga Pecah, 13=Keluarga Hapus, 14=Kepala Keluarga Kembali Hidup (`PeristiwaKeluargaEnum`). |
| `id_log_penduduk` | FK ke `log_penduduk.id`. |

## 5. Tabel Enum Mapping (kode dipertahankan)

| Konteks | Kolom | Nilai → Arti |
|---|---|---|
| Jenis kelamin | `sex`/`jenis_kelamin` | 1=Laki-laki, 2=Perempuan |
| Status dasar | `status_dasar` | 1=Hidup, 2=Mati, 3=Pindah, 4=Hilang, 6=Pergi, 9=Tidak Valid |
| Status penduduk | `status` | 1=Tetap, 2=Tidak Tetap |
| Status kawin | `status_kawin` | 1=Belum Kawin, 2=Kawin, 3=Cerai Hidup, 4=Cerai Mati |
| SHDK | `kk_level` | 1=Kepala Keluarga, 2=Suami, 3=Istri, 4=Anak, 5=Menantu, 6=Cucu, 7=Orang Tua, 8=Mertua, 9=Famili Lain, 10=Pembantu, 11=Lainnya |
| Warga negara | `warganegara_id` | 1=WNI, 2=WNA, 3=Dua Kewarganegaraan |
| Agama | `agama_id` | 1=Islam,2=Kristen,3=Katholik,4=Hindu,5=Budha,6=Khonghucu,7=Lainnya |
| Status rekam | `status_rekam` | 1=Belum, 2=KTP-el, 3=KIA |
| KTP-el | `ktp_el` | 0/1 |
| Golongan darah | `golongan_darah_id` | 1=A,2=B,3=AB,4=O,5=A+,6=A-,7=B+,8=B-,9=AB+,10=AB-,11=O+,12=O-,13=Tidak Tahu |
| Cacat | `cacat_id` | 1=Cacat Fisik,2=Netra/Buta,3=Rungu/Wicara,4=Mental/Jiwa,5=Fisik & Mental,6=Lainnya,7=Tidak Cacat |
| Asuransi | `id_asuransi` | 1=Tidak/Belum Punya,2=BPJS PBI,3=BPJS Non-PBI,4=BPJS Bantuan Daerah,99=Asuransi Lainnya |
| Cara KB | `cara_kb_id` | 1=PIL,2=IUD,3=Suntik,4=Kondom,5=Susuk,6=Steril Wanita,7=Steril Pria,99=Lainnya,100=Tidak Menggunakan |
| Sakit menahun | `sakit_menahun_id` | 1=Jantung…14=Tidak Ada/Tidak Sakit,15=Zoonotik |
| Pindah | `ref_pindah` | 1=Desa,2=Kecamatan,3=Kabupaten,4=Provinsi |
| Keluarga sejahtera | `kelas_sosial` | 1=Pra Sejahtera,2=KS I,3=KS II,4=KS III,5=KS III+ |
| Status RTM | `rtm_level`/`terdaftar_dtks` | HubunganRTMEnum 1=KRT, 2=Anggota |
| Jenis surat | `jenis` | 3=Surat Sistem, 4=Surat Desa |
| Status log surat | `status` | -1=Ditolak, 0=Konsep, 1=Cetak |
| Status permohonan | `permohonan_surat.status` | 0=Belum Lengkap, 1=Sedang Diperiksa, 2=Menunggu Tanda Tangan, 3=Siap Diambil, 4=Sudah Diambil, 5=Dibatalkan |
| Peristiwa penduduk | `log_penduduk.kode_peristiwa` | 1=Baru Lahir, 2=Mati, 3=Pindah Keluar, 4=Hilang, 5=Baru Pindah Masuk, 6=Tidak Tetap Pergi |
| Peristiwa keluarga | `log_keluarga.id_peristiwa` | 1=Keluarga Baru, 2=KK Mati, 3=KK Pindah, 4=KK Hilang, 5=Keluarga Baru Datang, 6=KK Pergi, 11=KK Tidak Valid, 12=Anggota Pecah, 13=Keluarga Hapus, 14=KK Kembali Hidup |
| Tempat dilahirkan | `tempat_dilahirkan` | 1=RS/RB, 2=Puskesmas, 3=Polindes, 4=Rumah, 5=Lainnya |
| Jenis kelahiran | `jenis_kelahiran` | 1=Tunggal, 2=Kembar 2, 3=Kembar 3, 4=Kembar 4 |
| Penolong kelahiran | `penolong_kelahiran` | 1=Dokter, 2=Bidan/Perawat, 3=Dukun, 4=Lainnya |
| Status hamil | `hamil` | 1=Hamil, 2=Tidak Hamil |
| Kunci surat | `kunci`/`mandiri`/`favorit` | 1=Ya, 0=Tidak |
| RBAC akses | `akses` | 1=Baca, 3=Ubah, 7=Hapus |
| Bahasa | `bahasa_id` | 1=Latin,2=Daerah,3=Arab,4=Arab-Latin,5=Arab-Daerah,6=Arab-Latin-Daerah |
| Status dasar KK | (turunan) | 1=Aktif, 2=Hilang/Mati/Pindah, 3=Kosong |

> Daftar lengkap ±76 enum ada di **LAMPIRAN-03-ENUM-REFERENSI.md**.

## 6. Urutan Impor (FK-safe)

```
1. config (villages)
2. user_grup
3. setting_modul
4. grup_akses
5. user
6. setting_aplikasi
7. tabel referensi (ref_*)
8. tweb_wil_clusterdesa
9. tweb_keluarga            (butuh config, wilayah)
10. tweb_penduduk           (butuh keluarga, wilayah, ref_*)
    -> setelah penduduk: update tweb_wil_clusterdesa.id_kepala bila perlu
11. tweb_desa_pamong        (butuh penduduk)
12. ref_syarat_surat
13. tweb_surat_format
14. urls
15. klasifikasi_surat, lampiran_surat
16. log_penduduk            (butuh penduduk)
17. log_keluarga            (butuh keluarga + log_penduduk)
18. log_surat               (butuh penduduk, pamong, user, surat_format, urls)
19. permohonan_surat
20. surat_masuk, surat_keluar
```

**Catatan FK longgar:** `tweb_keluarga.nik_kepala`, `log_surat.id_pend`, dan relasi berbasis `nik`/`no_kk` tidak ditegakkan DB. Lakukan validasi "orphan" setelah impor:
- Penduduk yang `id_kk` menunjuk keluarga tidak ada.
- Keluarga yang `nik_kepala` tidak ada di penduduk.
- `log_surat.id_pend` tidak ada.

## 7. Validasi & Normalisasi Data

| Field | Aturan | Aksi bila tidak valid |
|---|---|---|
| `nik` | 16 digit; unik per `config_id`; NIK sementara `0…` diizinkan | Karantina ke tabel `import_errors` |
| `no_kk` | 16 digit; unik per config | Karantina |
| `tanggallahir`,`tanggalperkawinan`, dst | format `YYYY-MM-DD`; bukan `0000-00-00` | NULL |
| `nama` | trim, hilangkan karakter kontrol | Bersihkan |
| `email` | format email | NULL jika salah |
| `telepon`/`no_hp_aktif` | digit/`+` | Bersihkan |
| `syarat_surat`,`isian_form`,`akses_wilayah` | JSON valid | Perbaiki/lapor |
| `path` berkas (`foto`, `lampiran`, `berkas_scan`) | file ada | Catat file hilang |
| `status_dasar` | salah satu 1,2,3,4,6,9 | Default 1 + lapor |
| `id_cluster` | ada di wilayah | NULL + lapor |

## 8. Multi-Desa (`config_id`)

- Setiap baris **wajib** punya `config_id`; baris lama dengan `config_id` NULL → isi `config_id` desa asal sebelum impor.
- Unik yang bersifat per-desa harus memakai komposit: `UNIQUE(config_id, nik)`, `UNIQUE(config_id, no_kk)`, `UNIQUE(config_id, username)`, `UNIQUE(config_id, url_surat)`.
- Jika aplikasi baru beralih ke **satu desa per instalasi**, `config_id` boleh jadi konstanta (tetap dipertahankan agar kompatibel).

## 9. Contoh SQL Migrasi (penduduk) — ilustrasi

> **Skrip impor lengkap (siap pakai) ada di [`migration/p0-import.sql`](./migration/p0-import.sql)**, mengikuti Opsi A (nama tabel/kolom legacy dipertahankan). Contoh ringkas:

```sql
-- Impor penduduk (Opsi A: nama kolom legacy dipertahankan)
INSERT INTO desa_new.tweb_penduduk
  (id, config_id, nama, nik, id_kk, kk_level, rtm_level, sex,
   tempatlahir, tanggallahir, agama_id, pendidikan_kk_id, pendidikan_sedang_id,
   pekerjaan_id, status_kawin, warganegara_id, golongan_darah_id, id_cluster,
   status, status_dasar, cacat_id, sakit_menahun_id, cara_kb_id, id_asuransi, suku)
SELECT
  p.id, p.config_id, TRIM(p.nama),
  NULLIF(REGEXP_REPLACE(p.nik, '[^0-9]', ''), ''),
  NULLIF(p.id_kk, 0), p.kk_level, NULLIF(p.id_rtm, ''), p.sex,
  p.tempatlahir, NULLIF(p.tanggallahir, '0000-00-00'), p.agama_id,
  p.pendidikan_kk_id, p.pendidikan_sedang_id, p.pekerjaan_id, p.status_kawin,
  p.warganegara_id, p.golongan_darah_id, p.id_cluster, p.status, p.status_dasar,
  p.cacat_id, p.sakit_menahun_id, p.cara_kb_id, p.id_asuransi, p.suku
FROM opensid_legacy.tweb_penduduk p
WHERE p.config_id = :configId;
```

> Karena Opsi A mempertahankan nama, mayoritas kolom disalin langsung. Bila kelak pindah ke **Opsi B** (nama modern), sediakan tabel map ID `legacy_id_map(entity, old_id, new_id)`.

## 10. Checklist Verifikasi

- [ ] Jumlah baris tiap tabel lama = baru (kecuali yang sengaja difilter).
- [ ] Tidak ada `nik` ganda dalam satu `config_id`.
- [ ] Semua `id_kk` menunjuk keluarga yang ada.
- [ ] Semua `nik_kepala` keluarga ada di penduduk.
- [ ] Semua `id_cluster` ada di wilayah.
- [ ] Semua `agama_id`,`pekerjaan_id`,`pendidikan_kk_id`, dst. ada di tabel referensi.
- [ ] Semua `log_surat.id_pend` valid atau NULL.
- [ ] JSON (`syarat_surat`, `isian_form`) valid.
- [ ] Berkas (`foto`, `berkas_scan`, `lampiran`) tersalin & path cocok.
- [ ] Penomoran surat (nomor terakhir per jenis) tetap konsisten.
- [ ] Uji buka 1 surat lama & render ulang via mesin baru.

---

> **Referensi silang:** LAMPIRAN-01 (Persuratan), LAMPIRAN-02 (RBAC), LAMPIRAN-03 (Enum & Referensi), LAMPIRAN-05 (ERD lengkap), LAMPIRAN-06 (Spesifikasi output).
> Tanda `[perlu verifikasi]` = perlu dicek langsung pada data/kode sebelum dipakai produksi.

## 11. Hasil Verifikasi Kode (update)

Item `[perlu verifikasi]` telah diverifikasi langsung dari kode sumber OpenSID. Hasil:

| Item | Status | Bukti |
|---|---|---|
| Status `permohonan_surat` | ✅ Terkonfirmasi 0–5 | `app/Models/PermohonanSurat.php:50-63` (`STATUS_PERMOHONAN`) |
| Kode `log_penduduk.kode_peristiwa` | ✅ Terkonfirmasi 1–6 | `app/Enums/PeristiwaPendudukEnum.php` |
| Kode `log_keluarga.id_peristiwa` | ✅ Terkonfirmasi 1–6,11–14 | `app/Enums/PeristiwaKeluargaEnum.php` |
| `tempat_dilahirkan` | ✅ 1–5 | `app/Models/Penduduk.php:93-99` + `donjo-app/helpers/opensid_helper.php:126-132` |
| `jenis_kelahiran` | ✅ 1–4 | `app/Models/Penduduk.php:106-111` |
| `penolong_kelahiran` | ✅ 1–4 | `app/Models/Penduduk.php:118-123` |
| `hamil` | ✅ 1=Hamil, 2=Tidak Hamil | `app/Enums/HamilEnum.php`; `ref_penduduk_hamil` di `StrukturTabelSeeder.php:603` |
| Pivot `syarat_surat` | ✅ Tidak ada tabel pivot (JSON) | Tidak ada `create_syarat_surat_table`; hanya `ref_syarat_surat` |
| Kredensial Firebase/FCM di source | ⚠️ **Temuan keamanan** | `app/Enums/FirebaseEnum.php`, `app/Models/FcmToken.php` — jangan dipindah ke aplikasi baru |

> Sisa penanda `[perlu verifikasi]` pada LAMPIRAN-01/02/03/06 (bila ada) bersifat sekunder dan tidak menghambat MVP; verifikasi menyeluruh dapat dilakukan saat mengakses instance/data produksi.
