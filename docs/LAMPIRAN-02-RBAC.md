# LAMPIRAN-02 — RBAC & Hak Akses OpenSID

> Dokumen ini mendeskripsikan **model otorisasi, peran, katalog modul, wilayah scoping, autentikasi, dan enforcement** pada aplikasi OpenSID (basis kode di `D:\laragon\www\opensid`), lalu merancang **RBAC usulan** untuk aplikasi Next.js + better-auth.
>
> Catatan metodologi: Seluruh isi bersumber langsung dari kode (`donjo-app/`, `app/`, `config/`, `Modules/`). Dua file core dijaga ter-obfuscate (`base64 → zlib → eval` bertingkat) dan telah didekode secara aman **tanpa mengeksekusi kode target** (PowerShell/.NET `DeflateStream`). Klaim yang belum 100% pasti ditandai `[perlu verifikasi]`.

---

## Daftar Isi

1. [Model Otorisasi (role → modul → aksi)](#1-model-otorisasi-role--modul--aksi)
2. [Role Bawaan & Permission Matrix](#2-role-bawaan--permission-matrix)
3. [Katalog Lengkap `setting_modul`](#3-katalog-lengkap-setting_modul)
4. [Warisan Parent→Child & Super Admin](#4-warisan-parentchild--super-admin)
5. [Wilayah Scoping (Batasi Wilayah)](#5-wilayah-scoping-batasi-wilayah)
6. [Autentikasi: Admin vs Layanan Mandiri](#6-autentikasi-admin-vs-layanan-mandiri)
7. [Enforcement di Kode (gate/middleware/`ci_auth()`)](#7-enforcement-di-kode-gatemiddlewareci_auth)
8. [Desain RBAC Usulan (Next.js + better-auth)](#8-desain-rbac-usulan-nextjs--better-auth)

---

## 1. Model Otorisasi (role → modul → aksi)

### 1.1 Ringkasan arsitektur

OpenSID memakai model **RBAC klasik** yang disimpan di tabel relasi `grup_akses` dan ditegakkan lewat **Laravel Gate** di atas aplikasi CodeIgniter 3 (hybrid: CI3 untuk legacy, Laravel untuk bagian modern).

```
user ──id_grup──> user_grup (role)
                      │ id
                      ▼
                 grup_akses ── id_modul ──> setting_modul
                 (akses: 1/3/7)
```

- **Role** = baris di tabel `user_grup` (`App\Models\UserGrup`), dipegang lewat `user.id_grup`.
- **Modul/resource** = baris di tabel `setting_modul` (`App\Models\Modul`), diakses lewat **slug** unik per desa.
- **Aksi** = nilai kolom `grup_akses.akses` (integer) yang dikonversi jadi tiga boolean: `baca`, `ubah`, `hapus`.

### 1.2 Skema tabel relasi

`grup_akses` (model `App\Models\GrupAkses`):

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | |
| `config_id` | int | ID desa/tenant (multi-desa) |
| `id_grup` | int FK → `user_grup.id` | role |
| `id_modul` | int FK → `setting_modul.id` | modul |
| `akses` | tinyint | **1 = Baca, 3 = Ubah, 7 = Hapus** |

Konstanta didefinisikan di `app/Models/GrupAkses.php` (baris 48–50):

```php
public const BACA  = 1;
public const UBAH  = 3;
public const HAPUS = 7;
```

Unique key: (`config_id`, `id_grup`, `id_modul`) — satu baris per pasangan role×modul. `[perlu verifikasi]` nama index pasti.

### 1.3 Arti akses 1 / 3 / 7

Konversi angka → boolean dilakukan di `app/Providers/AuthServiceProvider.php` → `getUserGroupAccessData()` (baris 289–303):

```php
'akses' => $item->akses,
'baca'  => $item->akses >= 1,
'ubah'  => $item->akses >= 3,
'hapus' => $item->akses >= 7,
```

Jadi nilainya **akumulatif/bertingkat**:

| Nilai `akses` | Makna literal | `baca` (≥1) | `ubah` (≥3) | `hapus` (≥7) |
|:---:|---|:---:|:---:|:---:|
| `0` | Tidak ada akses | ✗ | ✗ | ✗ |
| `1` | Baca saja | ✓ | ✗ | ✗ |
| `3` | Baca + Ubah (tambah/edit) | ✓ | ✓ | ✗ |
| `7` | Baca + Ubah + Hapus | ✓ | ✓ | ✓ |

> Tidak ada nilai lain yang dipakai pada data bawaan. Nilai 2/4/5/6 tidak digunakan secara semantik (walaupun kolom bertipe angka).

### 1.4 Format "ability" pada Gate

Helper `can()` (`donjo-app/helpers/general_helper.php`, baris 88–100) memanggil Gate dengan format `"{slug}:{akses}"`:

```php
function can($akses = null, $slugModul = null, $adminOnly = false, $demoOnly = false, ?User $user = null)
{
    if (null === $slugModul) {
        $slugModul = ci()->akses_modul ?? (ci()->sub_modul_ini ?? ci()->modul_ini);
    }
    ...
    return Gate::allows("{$slugModul}:{$akses}", [$akses, $slugModul, $adminOnly, $demoOnly]);
}
```

- `$akses` = `'b'`/`'baca'`/`'u'`/`'ubah'`/`'h'`/`'hapus'`.
- `$slugModul` default: `ci()->akses_modul` ← `sub_modul_ini` ← `modul_ini` (properti yang di-set setiap controller).
- Panggilan native Laravel juga didukung: `auth()->user()->can('slug:baca')` (diparse di `Gate::before`).

---

## 2. Role Bawaan & Permission Matrix

### 2.1 Daftar role bawaan

Dari seeder `app/database/seeders/DataAwal/DataAwalSeeder.php` → `tambah_grup_pengguna()` (baris 168–219):

| # | Nama grup | `slug` | `jenis` | Arti `jenis` | Bisa diubah/dihapus? |
|:--:|---|---|:--:|---|---|
| 1 | Administrator | `administrator` | 1 | Sistem | Tidak (grup sistem) |
| 2 | Operator | `operator` | 1 | Sistem | Tidak |
| 3 | Redaksi | `redaksi` | 1 | Sistem | Tidak |
| 4 | Kontributor | `kontributor` | 1 | Sistem | Tidak |
| 5 | Satgas Covid-19 | `satgas-covid-19` | 2 | Desa | Ya |

Konstanta slug & jenis di `app/Models/UserGrup.php` (baris 54–61):

```php
public const ADMINISTRATOR = 'administrator';
public const OPERATOR      = 'operator';
public const REDAKSI       = 'redaksi';
public const KONTRIBUTOR   = 'kontributor';
public const SISTEM = 1;  // grup sistem, dilindungi
public const DESA   = 2;  // grup buatan desa
```

Grup dengan `jenis = 1 (SISTEM)` tidak boleh diubah/dihapus (dipakai `UserGrup::systemGroupIds()` baris 81). Grup `administrator` **tidak muncul** di seeder `grup_akses` karena hak aksesnya diberikan otomatis sebagai **super admin** (lihat §4.2).

> **Akun admin default** (seeder `tambah_pengguna()`, baris 221–242): `username = admin`, `password = sid304` (di-hash bcrypt via `Hash::make`), `id_grup` = grup Administrator.

### 2.2 Permission matrix (default instalasi)

Sumber data: `app/database/seeders/DataAwal/GrupAkses.php` (179 baris, dipakai saat *instalasi/seed data awal*).

Legenda: **7** = hapus, **3** = ubah, **1** = baca, **0** = tanpa akses, **∅** = tidak ada baris eksplisit (ditangani oleh warisan parent, §4.1).

#### Administrator

Bukan dari `grup_akses`, melainkan **wildcard 7** pada semua modul via `Gate::before` + `super_admin()`.

#### Operator (156 baris eksplisit)

Hak akses Operator = **3 (ubah)** pada hampir semua modul operasional, dengan pengecualian **0** pada modul-modul administratif (induk) tertentu:

| `akses` | Modul (slug) |
|:--:|---|
| **0** (tanpa akses) | `kependudukan`, `statistik`, `layanan-surat`, `analisis`, `pertanahan`, `pemetaan`, `hubung-warga`, `pengaturan`, `admin-web`, `layanan-mandiri`, `sekretariat`, `info-desa`, `keuangan`, `kesehatan`, `buku-administrasi-desa` |
| **7** (hapus) | `pendataan`, `pemantauan` |
| **3** (ubah) | Seluruh sisa (mis. `home`, `identitas-desa`, `penduduk`, `keluarga`, `artikel`, `surat-masuk`, `surat-keluar`, `keuangan`-nya anak seperti `impor-data`, `laporan`, dll.) |

> Meskipun parent bernilai `0`, menu tetap tampil bagi Operator karena **warisan parent→child** menaikkan parent menjadi 7 bila punya anak ber-akses>0 (lihat §4.1). Jadi praktis Operator dapat mengakses hampir semua modul kecuali yang benar-benar tidak punya anak ber-akses>0.

#### Satgas Covid-19 (5 baris)

| Modul (slug) | `akses` |
|---|:--:|
| `statistik` | 0 |
| `statistik-kependudukan` | 3 |
| `kesehatan` | 0 |
| `pendataan` | 7 |
| `pemantauan` | 7 |

#### Redaksi (13 baris)

| Modul (slug) | `akses` |
|---|:--:|
| `admin-web` | 0 |
| `artikel` | 7 |
| `widget` | 7 |
| `menu` | 7 |
| `komentar` | 7 |
| `galeri` | 7 |
| `media-sosial` | 7 |
| `slider` | 7 |
| `teks-berjalan` | 7 |
| `pengunjung` | 7 |
| `pengaturan-web` | 7 |
| `kategori` | 7 |
| `lapak` | 7 |

#### Kontributor (5 baris)

| Modul (slug) | `akses` |
|---|:--:|
| `admin-web` | 0 |
| `artikel` | 3 |
| `komentar` | 3 |
| `galeri` | 3 |
| `slider` | 3 |

> **Dua sumber otorisasi berbeda** — perlu dibedakan:
> - `app/database/seeders/DataAwal/GrupAkses.php` → matrix **data awal** di atas (per-modul eksplisit).
> - `app/Services/Install/CreateGrupAksesService.php` → matrix **saat instalasi** (`handle()`), memakai pendekatan ringkas: `administrator => ['*' => 7]`, `operator => ['*' => 3]`, plus definisi eksplisit untuk `kontributor`, `redaksi`, `satgas-covid-19` (sama seperti tabel di atas kecuali operator disederhanakan jadi wildcard `*` = 3).
>
> Keduanya konsisten secara semantik: Operator efektif = "ubah di semua modul", Administrator = "hapus di semua modul".

---

## 3. Katalog Lengkap `setting_modul`

### 3.1 Struktur tabel `setting_modul`

Model: `app/Models/Modul.php` (tabel `setting_modul`, `$timestamps = false`). Kolom:

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | untuk modul induk di-hardcode (mis. 2, 11, 200, 301) |
| `config_id` | int | tenant/desa |
| `modul` | string | nama tampil |
| `slug` | string | slug unik per `config_id` (`unique(config_id, slug)`) |
| `url` | string | route/URI target |
| `aktif` | tinyint/bool | 1 aktif, 0 nonaktif |
| `ikon` | string | kelas FontAwesome |
| `urut` | int | urutan menu |
| `level` | tinyint | level kedalaman menu |
| `hidden` | tinyint | 0 tampil, 1 = `SHOW_S`, 2 = `HIDDEN` |
| `ikon_parent` | string | `[perlu verifikasi]` apakah ada kolom ini |
| `ikon_kecil` | string | ikon kecil/child |
| `parent` | int | id modul induk, `0` = root |

Konstanta `App\Models\Modul`: `PARENT=0`, `LOCK=0`, `UNLOCK=1`, `SHOW=0`, `SHOW_S=1`, `HIDDEN=2`, `SELALU_AKTIF=['beranda','notif','pengguna']` (baris 50–56).

### 3.2 Katalog modul daun (child) — 137 entri

Sumber: `app/database/seeders/DataAwal/SettingModul.php` → array `$data` (baris 55–1700). Kolom **parent** = id induk (lihat peta §3.3).

| Modul | slug | url | aktif | ikon | urut | level | hidden | parent |
|---|---|---|:--:|---|:--:|:--:|:--:|:--:|
| Home | `home` | `beranda` | 1 | fa-home | 10 | 2 | 1 | 0 |
| Pengaturan Peta | `pengaturan-peta` | `plan` | 1 | fa-location-arrow | 9 | 2 | 0 | 9 |
| Identitas [Desa] | `identitas-desa` | `identitas_desa` | 1 | fa-id-card | 2 | 2 | 0 | 200 |
| [Pemerintah Desa] | `pemerintah-desa` | `pengurus/clear` | 1 | fa-sitemap | 3 | 2 | 0 | 200 |
| Wilayah Administratif | `wilayah-administratif` | `wilayah/clear` | 1 | fa-map | 2 | 2 | 0 | 200 |
| Penduduk | `penduduk` | `penduduk/clear` | 1 | fa-user | 2 | 2 | 0 | 2 |
| Keluarga | `keluarga` | `keluarga/clear` | 1 | fa-users | 3 | 2 | 0 | 2 |
| Rumah Tangga | `rumah-tangga` | `rtm/clear` | 1 | fa-venus-mars | 4 | 2 | 0 | 2 |
| Kelompok | `kelompok` | `kelompok/clear` | 1 | fa-sitemap | 5 | 2 | 0 | 2 |
| Data Suplemen | `data-suplemen` | `suplemen/clear` | 1 | fa-slideshare | 6 | 2 | 0 | 2 |
| Calon Pemilih | `calon-pemilih` | `dpt/clear` | 1 | fa-podcast | 7 | 2 | 0 | 2 |
| Statistik Kependudukan | `statistik-kependudukan` | `statistik/clear` | 1 | fa-bar-chart | 1 | 2 | 0 | 3 |
| Laporan Bulanan | `laporan-bulanan` | `laporan/clear` | 1 | fa-file-text | 2 | 2 | 0 | 3 |
| Laporan Kelompok Rentan | `laporan-kelompok-rentan` | `laporan_rentan/clear` | 1 | fa-wheelchair | 3 | 2 | 0 | 3 |
| Pengaturan Surat | `pengaturan-surat` | `surat_master` | 1 | fa-cog | 1 | 2 | 0 | 4 |
| Cetak Surat | `cetak-surat` | `surat` | 1 | fa-files-o | 2 | 2 | 0 | 4 |
| Arsip Layanan | `arsip-layanan` | `keluar/clear/masuk` | 1 | fa-folder-open | 4 | 2 | 0 | 4 |
| Kirim Pesan | `kirim-pesan` | `sms` | 1 | fa-envelope-open-o | 1 | 2 | 0 | 10 |
| Daftar Kontak | `daftar-kontak` | `daftar_kontak` | 1 | fa-id-card-o | 2 | 2 | 0 | 10 |
| Modul | `modul` | `modul/clear` | 1 | fa-tags | 1 | 1 | 0 | 11 |
| Aplikasi | `aplikasi` | `setting` | 1 | fa-codepen | 2 | 1 | 0 | 11 |
| Pengguna | `pengguna` | `man_user/clear` | 1 | fa-users | 3 | 1 | 0 | 11 |
| Database | `database` | `database` | 1 | fa-database | 4 | 1 | 0 | 11 |
| Info Sistem | `info-sistem` | `info_sistem` | 1 | fa-server | 5 | 1 | 0 | 11 |
| Artikel | `artikel` | `web/clear` | 1 | fa-file-movie-o | 1 | 4 | 0 | 13 |
| Widget | `widget` | `web_widget/clear` | 1 | fa-windows | 2 | 4 | 0 | 13 |
| Menu | `menu` | `menu/clear` | 1 | fa-bars | 3 | 4 | 0 | 13 |
| Komentar | `komentar` | `komentar/clear` | 1 | fa-comments | 4 | 4 | 0 | 13 |
| Galeri | `galeri` | `gallery/clear` | 1 | fa-image | 5 | 5 | 0 | 13 |
| Media Sosial | `media-sosial` | `sosmed` | 1 | fa-facebook | 7 | 4 | 0 | 13 |
| Slider | `slider` | `web/slider` | 1 | fa-film | 8 | 4 | 0 | 13 |
| Kotak Pesan | `kotak-pesan` | `mailbox/clear` | 1 | fa-wechat | 1 | 2 | 0 | 14 |
| Pendaftar Layanan Mandiri | `pendaftar-layanan-mandiri` | `mandiri/clear` | 1 | fa-500px | 2 | 2 | 0 | 14 |
| Surat Masuk | `surat-masuk` | `surat_masuk/clear` | 1 | fa-sign-in | 1 | 2 | 2 | 15 |
| Surat Keluar | `surat-keluar` | `surat_keluar/clear` | 1 | fa-sign-out | 2 | 2 | 2 | 15 |
| Inventaris | `inventaris` | `inventaris_tanah` | 1 | fa-cubes | 5 | 2 | 0 | 15 |
| Peta | `peta` | `gis/clear` | 1 | fa-globe | 1 | 2 | 0 | 9 |
| Klasifikasi Surat | `klasifikasi-surat` | `klasifikasi/clear` | 1 | fa-code | 10 | 2 | 0 | 15 |
| Teks Berjalan | `teks-berjalan` | `teks_berjalan` | 1 | fa-ellipsis-h | 9 | 2 | 0 | 13 |
| Kategori | `kategori` | `kategori` | 1 | — | 12 | 0 | 2 | 13 |
| Log Penduduk | `log-penduduk` | `penduduk_log` | 1 | — | 8 | 0 | 2 | 2 |
| analisis_kategori | `analisis-kategori` | `analisis_kategori` | 1 | — | 0 | 0 | 2 | 5 |
| analisis_indikator | `analisis-indikator` | `analisis_indikator` | 1 | — | 0 | 0 | 2 | 5 |
| analisis_klasifikasi | `analisis-klasifikasi` | `analisis_klasifikasi` | 1 | — | 0 | 0 | 2 | 5 |
| analisis_periode | `analisis-periode` | `analisis_periode` | 1 | — | 0 | 0 | 2 | 5 |
| analisis_respon | `analisis-respon` | `analisis_respon` | 1 | — | 0 | 0 | 2 | 5 |
| analisis_laporan | `analisis-laporan` | `analisis_laporan` | 1 | — | 0 | 0 | 2 | 5 |
| analisis_statistik_jawaban | `analisis-statistik-jawaban` | `analisis_statistik_jawaban` | 1 | — | 0 | 0 | 2 | 5 |
| api_inventaris_asset | `api-inventaris-asset` | `api_inventaris_asset` | 1 | — | 16 | 0 | 2 | 15 |
| api_inventaris_gedung | `api-inventaris-gedung` | `api_inventaris_gedung` | 1 | — | 17 | 0 | 2 | 15 |
| api_inventaris_gedung | `api-inventaris-gedung-1` | `api_inventaris_gedung` | 1 | — | 18 | 0 | 2 | 15 |
| api_inventaris_jalan | `api-inventaris-jalan` | `api_inventaris_jalan` | 1 | — | 19 | 0 | 2 | 15 |
| api_inventaris_konstruksi | `api-inventaris-kontruksi` | `api_inventaris_kontruksi` | 1 | — | 20 | 0 | 2 | 15 |
| api_inventaris_peralatan | `api-inventaris-peralatan` | `api_inventaris_peralatan` | 1 | — | 21 | 0 | 2 | 15 |
| api_inventaris_tanah | `api-inventaris-tanah` | `api_inventaris_tanah` | 1 | — | 22 | 0 | 2 | 15 |
| inventaris_asset | `inventaris-asset` | `inventaris_asset` | 1 | — | 11 | 0 | 2 | 15 |
| inventaris_gedung | `inventaris-gedung` | `inventaris_gedung` | 1 | — | 12 | 0 | 2 | 15 |
| inventaris_jalan | `inventaris-jalan` | `inventaris_jalan` | 1 | — | 13 | 0 | 2 | 15 |
| inventaris_kontruksi | `inventaris-kontruksi` | `inventaris_kontruksi` | 1 | — | 14 | 0 | 2 | 15 |
| inventaris_peralatan | `inventaris-peralatan` | `inventaris_peralatan` | 1 | — | 15 | 0 | 2 | 15 |
| laporan_inventaris | `laporan-inventaris` | `laporan_inventaris` | 1 | — | 23 | 0 | 2 | 15 |
| plan | `plan` | `plan` | 1 | — | 11 | 0 | 2 | 9 |
| point | `point` | `point` | 1 | — | 12 | 0 | 2 | 9 |
| garis | `garis` | `garis` | 1 | — | 13 | 0 | 2 | 9 |
| line | `line` | `line` | 1 | — | 14 | 0 | 2 | 9 |
| area | `area` | `area` | 1 | — | 15 | 0 | 2 | 9 |
| polygon | `polygon` | `polygon` | 1 | — | 16 | 0 | 2 | 9 |
| Kategori Kelompok | `kategori-kelompok` | `kelompok_master` | 1 | — | 7 | 0 | 2 | 2 |
| Produk Hukum | `produk-hukum` | `dokumen_sekretariat/peraturan_desa` | 1 | fa-book | 3 | 2 | 2 | 15 |
| Informasi Publik | `informasi-publik-1` | `informasi_publik` | 1 | — | 0 | 0 | 2 | 52 |
| Daftar Persyaratan | `daftar-persyaratan` | `surat_mohon` | 1 | fa fa-book | 5 | 2 | 0 | 4 |
| Permohonan Surat | `permohonan-surat` | `permohonan_surat_admin` | 1 | fa-files-o | 3 | 0 | 0 | 4 |
| Status [Desa] | `status-desa` | `status_desa` | 1 | fa-dot-circle-o | 4 | 0 | 0 | 200 |
| Pengaturan Grup | `pengaturan-grup` | `grup/clear` | 1 | — | 7 | 0 | 2 | 11 |
| Master Analisis | `master-analisis` | `analisis_master/clear` | 1 | fa-check-square-o | 1 | 1 | 0 | 5 |
| Pengaturan | `pengaturan-analisis` | `setting/analisis` | 1 | fa-gear | 2 | 1 | 0 | 5 |
| Impor Data | `impor-data` | `keuangan/impor_data` | 1 | fa-cloud-upload | 1 | 2 | 0 | 201 |
| Laporan | `laporan` | `keuangan/laporan` | 1 | fa-bar-chart | 2 | 2 | 0 | 201 |
| Pengunjung | `pengunjung` | `pengunjung/clear` | 1 | fa-bar-chart | 10 | 4 | 0 | 13 |
| Pendataan | `pendataan` | `covid19` | 1 | fa-list | 1 | 2 | 0 | 206 |
| Pemantauan | `pemantauan` | `covid19/pantau` | 1 | fa-check | 2 | 2 | 0 | 206 |
| Input Data | `input-data` | `keuangan_manual/manual_apbdes` | 1 | fa-keyboard-o | 3 | 2 | 0 | 201 |
| Laporan Manual | `laporan-manual` | `keuangan_manual/laporan_manual` | 1 | fa-bar-chart | 4 | 2 | 0 | 201 |
| Pengaturan | `pengaturan-web` | `setting/web` | 1 | fa-gear | 11 | 4 | 0 | 13 |
| QR Code | `qr-code` | `setting/qrcode/clear` | 1 | fa-qrcode | 6 | 1 | 0 | 11 |
| Daftar Persil | `daftar-persil` | `data_persil` | 1 | fa-list | 0 | 2 | 0 | 7 |
| C-Desa | `c-desa` | `cdesa` | 1 | fa-files-o | 0 | 0 | 0 | 7 |
| Pembangunan | `pembangunan` | `admin_pembangunan` | 1 | fa-institution | 120 | 2 | 0 | 0 |
| Administrasi Umum | `administrasi-umum` | `bumindes_umum` | 1 | fa-bookmark | 1 | 2 | 0 | 301 |
| Administrasi Penduduk | `administrasi-penduduk` | `bumindes_penduduk_induk/clear` | 1 | fa-users | 2 | 2 | 0 | 301 |
| Administrasi Pembangunan | `administrasi-pembangunan` | `bumindes_rencana_pembangunan` | 1 | fa-university | 4 | 2 | 0 | 301 |
| Buku Eskpedisi | `buku-eskpedisi` | `ekspedisi/clear` | 1 | fa-files-o | 10 | 0 | 2 | 301 |
| Buku Lembaran Dan Berita [Desa] | `buku-lembaran-dan-berita-desa` | `lembaran_desa/clear` | 1 | fa-files-o | 11 | 0 | 2 | 301 |
| Layanan Pelanggan | `layanan-pelanggan` | `pelanggan` | 1 | fa-credit-card | 5 | 0 | 0 | 200 |
| Pengaturan | `pengaturan-layanan-mandiri` | `setting/mandiri` | 1 | fa-gear | 6 | 2 | 0 | 14 |
| Buku Mutasi Penduduk | `buku-mutasi-penduduk` | `bumindes_penduduk_mutasi/clear` | 1 | fa-files-o | 15 | 0 | 2 | 301 |
| Buku Rekapitulasi Jumlah Penduduk | `buku-rekapitulasi-jumlah-penduduk` | `bumindes_penduduk_rekapitulasi/clear` | 1 | fa-files-o | 16 | 0 | 2 | 301 |
| Buku Penduduk Sementara | `buku-penduduk-sementara` | `bumindes_penduduk_sementara/clear` | 1 | fa-files-o | 17 | 0 | 2 | 301 |
| Buku KTP dan KK | `buku-ktp-dan-kk` | `bumindes_penduduk_ktpkk/clear` | 1 | fa-files-o | 18 | 0 | 2 | 301 |
| Buku Tanah Kas [Desa] | `buku-tanah-kas-desa` | `bumindes_tanah_kas_desa/clear` | 1 | fa-files-o | 12 | 0 | 2 | 301 |
| Buku Tanah di [Desa] | `buku-tanah-di-desa` | `bumindes_tanah_desa/clear` | 1 | fa-files-o | 13 | 0 | 2 | 301 |
| Pendapat | `pendapat` | `pendapat` | 1 | fa-thumbs-o-up | 5 | 0 | 0 | 14 |
| Buku Inventaris dan Kekayaan [Desa] | `buku-inventaris-dan-kekayaan-desa` | `bumindes_inventaris_kekayaan` | 1 | fa-files-o | 14 | 0 | 2 | 301 |
| Buku Rencana Kerja Pembangunan | `buku-rencana-kerja-pembangunan` | `bumindes_rencana_pembangunan` | 1 | fa-files-o | 19 | 0 | 2 | 301 |
| Lapak | `lapak` | `lapak_admin` | 1 | fa-cart-plus | 122 | 2 | 0 | 0 |
| Laporan APBDes | `laporan-apbdes` | `laporan_apbdes` | 1 | fa-file-text-o | 5 | 2 | 0 | 201 |
| Sinkronisasi | `sinkronisasi` | `sinkronisasi` | 1 | fa-random | 125 | 2 | 0 | 343 |
| Lembaga [Desa] | `lembaga-desa` | `lembaga/clear` | 1 | fa-list | 4 | 2 | 0 | 200 |
| Kategori Lembaga | `kategori-lembaga` | `lembaga_master` | 1 | — | 6 | 2 | 2 | 200 |
| Bumindes Kegiatan Pembangunan | `bumindes-kegiatan-pembangunan` | `bumindes_kegiatan_pembangunan` | 1 | — | null | 2 | 2 | 301 |
| Laporan Penduduk | `laporan-penduduk` | `laporan_penduduk` | 1 | fa-file-text-o | 5 | 2 | 1 | 3 |
| Pendaftaran Kerjasama | `pendaftaran-kerjasama` | `pendaftaran_kerjasama` | 1 | fa-list | 6 | 2 | 0 | 200 |
| Kader Pemberdayaan Masyarakat | `bumindes-kader` | `bumindes_kader` | 1 | — | null | 2 | 2 | 301 |
| Buku Inventaris Hasil-Hasil Pembangunan | `bumindes-hasil-pembangunan` | `bumindes_hasil_pembangunan` | 1 | — | null | 2 | 2 | 301 |
| Pengaduan | `pengaduan` | `pengaduan_admin` | 1 | fa-info | 124 | 2 | 0 | 0 |
| Vaksin | `vaksin` | `vaksin_covid/clear` | 1 | fa-medkit | 2 | 2 | 0 | 206 |
| Arsip [Desa] | `arsip-desa` | `bumindes_arsip` | 1 | fa-archive | 5 | 2 | 0 | 301 |
| Jam Kerja | `jam-kerja` | `kehadiran_jam_kerja` | 1 | fa-clock-o | 2 | 0 | 0 | 337 |
| Hari Libur | `hari-libur` | `kehadiran_hari_libur` | 1 | fa-calendar | 2 | 0 | 0 | 337 |
| Rekapitulasi | `rekapitulasi` | `kehadiran_rekapitulasi` | 1 | fa-list | 2 | 0 | 0 | 337 |
| Pengaduan | `kehadiran-pengaduan` | `kehadiran_pengaduan` | 1 | fa-exclamation | 2 | 0 | 0 | 337 |
| Pesan | `pesan` | `opendk_pesan/clear` | 1 | fa-envelope | 124 | 2 | 0 | 343 |
| Grup Kontak | `grup-kontak` | `grup_kontak` | 1 | fa-list | 2 | 2 | 2 | 10 |
| Stunting | `stunting` | `stunting` | 1 | fa-stethoscope | 4 | 0 | 0 | 206 |
| Daftar Anjungan | `daftar-anjungan` | `anjungan` | 1 | fa-list | 1 | 2 | 0 | 312 |
| Menu | `anjungan-menu` | `anjungan_menu` | 1 | fa-bars | 2 | 2 | 0 | 312 |
| Pengaturan | `pengaturan-anjungan` | `anjungan_pengaturan` | 1 | fa-gear | 3 | 2 | 0 | 312 |
| Alasan Keluar | `alasan-keluar` | `kehadiran_keluar` | 1 | fa-sign-out | 5 | 2 | 0 | 337 |
| Gawai Layanan | `gawai-layanan` | `gawai_layanan` | 1 | fa-desktop | 3 | 2 | 0 | 14 |
| DTKS | `dtks` | `dtks` | 1 | fa-exchange | 1 | 2 | 0 | 352 |
| Data Tamu | `data-tamu` | `buku_tamu` | 1 | fa-bookmark-o | 1 | 2 | 0 | 354 |
| Data Kepuasan | `data-kepuasan` | `buku_kepuasan` | 1 | fa-smile-o | 2 | 2 | 0 | 354 |
| Data Pertanyaan | `data-pertanyaan` | `buku_pertanyaan` | 1 | fa-question | 3 | 2 | 0 | 354 |
| Data Keperluan | `data-keperluan` | `buku_keperluan` | 1 | fa-send | 4 | 2 | 0 | 354 |
| Optimasi Gambar | `optimasi-gambar` | `optimasi_gambar` | 1 | fa-picture-o | 7 | 2 | 0 | 11 |
| Program Bantuan | `program-bantuan` | `program_bantuan/clear` | 1 | fa-heart | 101 | 0 | 2 | 6 |
| Peserta Bantuan | `peserta-bantuan` | `peserta_bantuan` | 1 | fa-picture-o | 102 | 0 | 2 | 6 |

### 3.3 Modul induk (parent)

Dua sumber:

**(a) Peta id→slug** yang dipakai seeder `SettingModul.php` (baris 1702–1727) — **24 entri**:

| id | slug |
|:--:|---|
| 2 | `kependudukan` |
| 3 | `statistik` |
| 4 | `layanan-surat` |
| 5 | `analisis` |
| 6 | `bantuan` |
| 7 | `pertanahan` |
| 9 | `pemetaan` |
| 10 | `hubung-warga` |
| 11 | `pengaturan` |
| 13 | `admin-web` |
| 14 | `layanan-mandiri` |
| 15 | `sekretariat` |
| 200 | `info-desa` |
| 201 | `keuangan` |
| 206 | `kesehatan` |
| 220 | `pembangunan` |
| 301 | `buku-administrasi-desa` |
| 312 | `anjungan` |
| 324 | `lapak` |
| 334 | `pengaduan` |
| 337 | `kehadiran` |
| 343 | `opendk` |
| 352 | `satu-data` |
| 354 | `buku-tamu` |

**(b) Definisi lengkap modul induk** di `app/database/seeders/DataAwal/StrukturTabelSeeder.php` → `addSettingModul()` (baris 191–506), dengan `config_id = 1` dan **id di-hardcode**:

| id | modul | slug | url | ikon | urut | level | hidden |
|:--:|---|---|---|:--:|:--:|:--:|:--:|
| 2 | Kependudukan | `kependudukan` | | fa-users | 30 | 2 | 0 |
| 3 | Statistik | `statistik` | | fa-line-chart | 40 | 2 | 0 |
| 4 | Layanan Surat | `layanan-surat` | | fa-book | 50 | 2 | 0 |
| 5 | Analisis | `analisis` | | fa-check-square-o | 90 | 2 | 0 |
| 6 | Bantuan | `bantuan` | `program_bantuan/clear` | fa-heart | 100 | 2 | 0 |
| 7 | Pertanahan | `pertanahan` | | fa-map-signs | 110 | 2 | 0 |
| 9 | Pemetaan | `pemetaan` | | fa-globe | 130 | 2 | 0 |
| 10 | Hubung Warga | `hubung-warga` | | fa-envelope | 140 | 2 | 0 |
| 11 | Pengaturan | `pengaturan` | | fa-users | 150 | 1 | 1 |
| 13 | Admin Web | `admin-web` | | fa-desktop | 160 | 4 | 0 |
| 14 | Layanan Mandiri | `layanan-mandiri` | | fa-inbox | 170 | 2 | 0 |
| 15 | Sekretariat | `sekretariat` | | fa-archive | 60 | 2 | 0 |
| 52 | Informasi Publik | `informasi-publik` | `dokumen/clear` | fa-file-text | 4 | 4 | 0 |
| 200 | Info [Desa] | `info-desa` | | fa-dashboard | 20 | 2 | 1 |
| 201 | Keuangan | `keuangan` | | fa-balance-scale | 80 | 2 | 0 |
| 206 | Kesehatan | `kesehatan` | | fa-heartbeat | 41 | 2 | 0 |
| 301 | Buku Administrasi [Desa] | `buku-administrasi-desa` | | fa-paste | 70 | 2 | 0 |
| 312 | Anjungan | `anjungan` | | fa-desktop | 180 | 2 | 0 |
| 337 | Kehadiran | `kehadiran` | | fa-calendar-check-o | 41 | 0 | 0 |
| 343 | OpenDK | `opendk` | | fa-university | 124 | 2 | 0 |
| 352 | Satu Data | `satu-data` | | fa-globe | 180 | 1 | 0 |
| 354 | Buku Tamu | `buku-tamu` | | fa-book | 180 | 2 | 0 |

> **Catatan:** id `220`, `324`, `334` muncul di peta (`$parent`) tetapi **tidak** didefinisikan di `StrukturTabelSeeder`, sehingga kemungkinan ditambahkan oleh migrasi/premium module. `[perlu verifikasi]`. Seeder `SettingModul` meng-clone baris parent dari `config_id = 1` (baris 1729–1736) bila slug parent belum ada.

### 3.4 Cara memuat katalog saat runtime

- `Admin_Controller::modules_list()` (hasil dekode, baris 161–164) → `cache()->remember('settings_modules', 3600, fn () => Setting::get())`.
- Nama modul untuk judul halaman: `SebutanDesa($modules_list->firstWhere('slug', $this->sub_modul_ini ?? $this->modul_ini)->modul)`.

---

## 4. Warisan Parent→Child & Super Admin

### 4.1 Aturan warisan parent → child

Implementasi: `app/Providers/AuthServiceProvider.php` → `getUserGroupAccessData()` (baris 281–304):

```php
$grupAkses = GrupAkses::leftJoin('setting_modul as s1', 'grup_akses.id_modul', '=', 's1.id')
    ->leftJoin('setting_modul as s2', 's1.parent', '=', 's2.id')
    ->where('id_grup', $grupId)
    ->select('grup_akses.*', 's1.slug as slug', 's2.slug as parent_slug')
    ->get();

return $grupAkses->mapWithKeys(static function ($item) use ($grupAkses) {
    $item->akses = $grupAkses->where('parent_slug', $item->slug)->where('akses', '>', 0)->count() > 0
        ? 7   // ← parent dipaksa 7 bila punya ANAK ber-akses > 0
        : $item->akses;

    return [
        $item->slug => [
            'id_modul'    => $item->id_modul,
            'parent_slug' => $item->parent_slug,
            'id_grup'     => $item->id_grup,
            'akses'       => $item->akses,
            'baca'        => $item->akses >= 1,
            'ubah'        => $item->akses >= 3,
            'hapus'       => $item->akses >= 7,
        ],
    ];
})->toArray();
```

**Aturan detil:**

1. Untuk setiap baris `grup_akses`, sistem melihat apakah **ada baris lain** di grup yang sama yang modulnya ber-`parent = slug baris ini` **dan** `akses > 0`.
2. Bila ada (≥1 anak ber-akses>0), maka **akses baris induk dipaksa menjadi 7**, berapapun nilai aslinya (termasuk 0).
3. Bila tidak ada anak ber-akses>0, akses induk tetap seperti nilai aslinya.
4. Bila anak di-set 0 dan induk 0 → induk tetap 0 (anak 0 tidak dihitung).
5. Bila anak 0 tetapi salah satu saudara >0 → induk jadi 7.

> **Konsekuensi praktis:** memberi akses baca/ubah pada satu anak otomatis membuat **menu induk tampil** (dengan hak hapus=7 pada level induk). Ini yang membuat Operator (yang parent-nya banyak 0) tetap bisa melihat menu kependudukan, sekretariat, dst.

**Cache:** hasil per grup disimpan `cache()->remember("akses_grup_{$user->id_grup}", 604800, ...)` (7 hari). Perubahan `grup_akses` harus mem-`flush` cache (dilakukan `CreateGrupAksesService::handle()` → `cache()->flush()`).

### 4.2 Super admin

- Definisi: `app/Models/User.php` → `scopeSuperAdmin()` (baris 256–259):

```php
public function scopeSuperAdmin(mixed $query)
{
    return $query->where('id_grup', UserGrup::getGrupId(UserGrup::ADMINISTRATOR))->first();
}
```

- Helper: `donjo-app/helpers/opensid_helper.php`:

```php
function super_admin()          { return User::superAdmin()->id; }          // baris 1771
function is_super_admin(): bool { return (int) ci_auth()->id === super_admin(); } // baris 1781
function is_group_administrator(): bool {
    return (int) ci_auth()->id_grup === UserGrup::getGrupId(UserGrup::ADMINISTRATOR); // baris 1791
}
```

- Super admin = **user satu-satunya** dengan `id_grup` = grup slug `administrator`. Hanya ada 1 per desa.
- Pemberian wildcard: di `Gate::before` (`AuthServiceProvider`, baris 246–248):

```php
if ($user->id == super_admin()) {
    return true;   // super admin lolos SEMUA ability
}
```

- Modul default `beranda` **selalu** `true` untuk semua user (baris 236–238), sebelum pengecekan super admin.
- `$adminOnly` (argumen ke-3 `can()`): bila `true` dan `$user->id != super_admin()` → `false` (baris 241–243).
- `$demoOnly`: bila `true` dan `config_item('demo_mode')` → `false` (baris 231–233).

**Urutan evaluasi di `Gate::before`** (baris 213–271):

1. Parse argumen: `[$akses, $slugModul, $adminOnly, $demoOnly]`.
2. Bila argumen kosong (panggilan native `slug:akses`), pecah `$ability`.
3. `demoOnly` + demo mode → `false`.
4. `slugModul === 'beranda'` → `true`.
5. `adminOnly` dan bukan super admin → `false`.
6. Super admin → `true`.
7. Ambil cache akses grup → cocokkan `$akses`:
   - `baca`/`b` → `$moduleData['baca'] ?: null`
   - `ubah`/`u` → `$moduleData['ubah'] ?: null`
   - `hapus`/`h` → `$moduleData['hapus'] ?: null`
8. `null` dikembalikan agar Gate lain/policy bisa menangani.

---

## 5. Wilayah Scoping (Batasi Wilayah)

### 5.1 Cara kerja

Fitur ini membatasi **data mana yang boleh dilihat** oleh user berdasarkan wilayah (dusun/RW/RT), **bukan** membatasi menu/modul. Berbeda dari RBAC modul.

- **Tidak ada** tabel `user_akses_wilayah` / `grup_akses_wilayah`.
- Disimpan **langsung di tabel `user`** dengan dua kolom:
  - `user.batasi_wilayah` → tinyint (0/1): apakah pembatasan aktif.
  - `user.akses_wilayah` → text/JSON: array **id** dari tabel `wilayah` (di-cast `json` di model).

Model `app/Models/User.php`:

```php
protected $casts = [
    ...
    'akses_wilayah' => 'json',   // baris 122
];
// fillable antara lain: 'batasi_wilayah', 'akses_wilayah' (baris 96-97)
```

### 5.2 Penerapan (enforcement)

Trait/scope: `app/Scopes/AccessWilayahScope.php` (baris 51–65):

```php
public function apply(Builder $builder, Model $model)
{
    $user         = ci_auth();
    $aksesWilayah = [];
    if ($user->batasi_wilayah && (! empty($user->akses_wilayah))) {
        $aksesWilayah = $user->akses_wilayah;
        $namaTable    = $model->getTable();
        $namaColumn   = $model->getWilayahColumn();   // kolom wilayah pada model

        return $builder->whereIn($namaTable . '.' . $namaColumn, $aksesWilayah);
    }

    return $builder;
}
```

- Model yang mendukung wajib mendefinisikan `getWilayahColumn()` (kolom wilayah, mis. `id_cluster`/`dusun`). `[perlu verifikasi]` daftar model persis.
- Query otomatis ditambah `WHERE kolom_wilayah IN (...)` saat user membatasi wilayah.
- Struktur pohon wilayah: `App\Models\Wilayah::tree()`, `Wilayah::treeAccess()` untuk menampilkan hanya wilayah yang diizinkan.

### 5.3 Penggunaan di UI

`donjo-app/controllers/Man_user.php`:

- `form()` (baris 147–149): memuat `Wilayah::tree()` hanya jika kolom `batasi_wilayah` & `akses_wilayah` ada:

```php
if (Schema::hasColumn('user', 'batasi_wilayah') && Schema::hasColumn('user', 'akses_wilayah')) {
    $data['wilayah'] = Wilayah::tree();
}
```

### 5.4 Migrasi penambah kolom

`donjo-app/models/migrations/Migrasi_2024050171.php` → `migrasi_2024040451()` menambah kolom `batasi_wilayah` dan `akses_wilayah` ke tabel `user`. `[perlu verifikasi]` nomor migrasi/urutan.

---

## 6. Autentikasi: Admin vs Layanan Mandiri

### 6.1 Dua dunia autentikasi

| Aspek | Admin (Siteman) | Layanan Mandiri (warga) |
|---|---|---|
| Guard | `admin` (`admin_periksa`, `perangkat`) | `penduduk` (`pendudukGuest`) |
| Provider | `users` → `App\Models\User` | `pendudukMandiri` → `App\Models\PendudukMandiri` |
| Model tabel | `user` | `tweb_penduduk_mandiri` (PK `id_pend`) |
| Kredensial | `username` + `password` | `nik` (16 digit) **atau** `tag_id_card` (10 digit) + **PIN** |
| Controller login | `donjo-app/controllers/auth/AuthenticatedSessionController.php` | `donjo-app/controllers/fmandiri/auth/AuthenticatedSessionController.php` |
| Guard pages | `Admin_Controller` (base) | `Mandiri_Controller` (base) |

Definisi guard/provider: `config/auth.php` (baris 75–129):

```php
'guards' => [
    'admin'         => ['driver' => 'session', 'provider' => 'users'],
    'admin_periksa' => ['driver' => 'session', 'provider' => 'users'],
    'perangkat'     => ['driver' => 'session', 'provider' => 'users'],
    'penduduk'      => ['driver' => 'session', 'provider' => 'pendudukMandiri'],
    'pendudukGuest' => ['driver' => 'session', 'provider' => 'penduduk'],
],
'providers' => [
    'users'           => ['driver' => 'eloquent', 'model' => App\Models\User::class],
    'pendudukMandiri' => [
        'driver'    => App\Services\Auth\PendudukMandiriProvider::class,
        'model'     => App\Models\PendudukMandiri::class,
        'belongsTo' => 'penduduk',
    ],
    'penduduk' => ['driver' => 'eloquent', 'model' => App\Models\Penduduk::class],
],
'passwords' => [
    'users'           => ['provider' => 'users', 'table' => 'password_resets', 'expire' => 60, 'throttle' => 60],
    'pendudukMandiri' => ['provider' => 'pendudukMandiri', 'table' => 'password_resets', 'expire' => 60, 'throttle' => 60],
],
'password_timeout' => 10800, // 3 jam
```

Guard `session` di-kustomisasi via `AuthServiceProvider::bootExtendGuard()` (baris 103–135) memakai `App\Services\Auth\SessionGuard`.

### 6.2 Sesi

- Sesi PHP-native (CI3) + Laravel session store. Setelah login sukses admin: `$this->session->sess_regenerate()` (mencegah session fixation) — `AuthenticatedSessionController::store()` (baris 297).
- Objek user login admin diakses via `ci_auth()` (`donjo-app/helpers/general_helper.php`, baris 474–483):

```php
function ci_auth($params = null)
{
    $CI = &get_instance();
    if (null !== $params) {
        return $CI->session->isAdmin->{$params};
    }
    return $CI->session->isAdmin;
}
```

  Jadi `ci_auth()->id`, `ci_auth()->id_grup`, `ci_auth()->batasi_wilayah`, dll.
- `Mandiri_Controller` mengautentikasi `penduduk`/`pendudukGuest` dan memeriksa verifikasi email/telegram pendaftar mandiri. `[perlu verifikasi]` baris pasti.

### 6.3 Sandi admin

- Penyimpanan: **bcrypt** (`Hash::make`) — seeder admin memakai `Hash::make('sid304')`.
- Dukungan legacy **MD5**: `AuthServiceProvider::registerMd5Hasher()` (baris 146–208) mendaftarkan hasher `md5` yang meniru algoritma lama OpenSID: input **wajib angka 6 digit**, `strrev`, `*77`, tambah `!#@$#%`, lalu `md5()`.
- **Syarat sandi admin** (`User::syaratSandi()`, dipakai `AuthenticatedSessionController`): minimal 8–20 karakter, wajib angka, huruf besar, huruf kecil, simbol, tanpa spasi — regex:

```
/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/
```

- **Syarat sandi di form Manajemen Pengguna** (`Man_user::syarat_sandi`) lebih lemah: 6–20 karakter, wajib angka + huruf besar + huruf kecil:

```
/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
```

- Pemaksaan ganti sandi default: bila sandi login tidak memenuhi `syaratSandi`, set `session.force_change_password` dan redirect `pengguna#sandi` (baris 305–309).

### 6.4 Reset sandi (admin)

- **Request link** — `donjo-app/controllers/auth/PasswordResetLinkController.php`:
  - `store()` (baris 67–93): cek **captcha** (`App\Libraries\Captcha`), validasi `email`, lalu `Password::sendResetLink($request->only('email'))` (broker `users`, tabel `password_resets`).
- **Reset** — `donjo-app/controllers/auth/NewPasswordController.php`:
  - `store()` (baris 77–109): validasi `token`, `email`, `password` (confirmed, `Rules\Password::defaults()`), lalu `Password::reset(...)` → `Hash::make($password)` + `remember_token` baru.
- Masa berlaku token: **60 menit** (`expire => 60`), throttle 60 detik.
- Reset mandiri juga memakai tabel `password_resets` via broker `pendudukMandiri`.

### 6.5 OTP & 2FA

Ada **dua mekanisme berbeda**:

**(a) OTP login (email/telegram)** — modul OTP OpenSID:

- Layanan: `app/Services/OtpService.php`.
- Model token: `App\Models\OtpToken` (tabel `otp_token`), kolom antara lain `user_id`, `token_hash`, `channel`, `identifier`, `purpose`, `expires_at`, `attempts`.
  - OTP = 6 digit acak (`random_int(100000, 999999)`), **di-hash** (`Hash::make`) sebelum disimpan.
  - `purpose`: `activation`, `login`, `2fa_activation`, `2fa_login`.
  - Kirim: email (`App\Mail\OtpMail`) atau Telegram (`https://api.telegram.org/bot{token}/sendMessage`).
  - Verifikasi: cek expired → `Hash::check` → salah → `incrementAttempts` → bila `hasMaxAttempts` token dihapus. Setting: `otp_expiry_minutes`, `otp_max_trials`.
- Aktif bila setting `login_otp = 1`. Alur (`AuthenticatedSessionController`, baris 90–279):
  - `form_login_otp()` → form; `request_login()` → cari user by email/username, cek `otp_enabled`, cek channel aktif (`email_notifikasi`/`telegram_notifikasi`), kirim OTP (respons **generik** cegah user enumeration); `verify_login()` → form; `login_otp()` → verifikasi OTP lalu `Auth::guard('admin')->login($user)`; `resend_otp()` → kirim ulang.
- Kolom user (migrasi `donjo-app/models/migrations/Migrasi_2025110171.php`, baris 298–315):
  - `user.otp_enabled` (boolean, default false)
  - `user.otp_channel` (enum `email`|`telegram`|`both`, nullable)
  - `user.otp_identifier` (string 255, nullable)
  - `user.telegram_chat_id` (string 100, nullable)
- Pengelolaan aktivasi OTP: `donjo-app/controllers/Otp.php` (baris 200–224 set/clear `otp_enabled`/`otp_channel`/`otp_identifier`).

**(b) Two-Factor Authentication (2FA)** — paket `spatie/laravel-one-time-passwords`:

- Provider: `app/Providers/OneTimePasswordsServiceProvider.php` (baris 45–68) — bind `OriginEnforcer`, `OneTimePasswordGenerator`, load view/lang/migrasi dari vendor.
- Trait pada model user: `HasOneTimePasswords` dengan kolom `user.two_factor_enabled` (cast boolean; `User.php` baris 98 & 123).
- Alur login admin (`AuthenticatedSessionController::store()` baris 301–302): bila `$user->two_factor_enabled` → `startTwoFactorAuthProcess($user)`.
- Controller: `donjo-app/controllers/auth/TwoFactorAuthController.php` (`sendOneTimePassword`, `OneTimePasswordRule`).

### 6.6 Rate limiting / anti brute force

- **Admin login**: throttle key `username|ip`, memakai setting `maximum_login_attempts` dan `lockout_time`.
- **Login mandiri**: `app/Services/Auth/Traits/LoginRequest.php` → `ensureIsNotRateLimited()`, `RateLimiter::hit($this->throttleKey(), config_item('lockout_time'))`.
  - throttle key mandiri (`fmandiri/.../AuthenticatedSessionController.php` baris 245–250): `Str::transliterate(($nik ?: $tag_id_card) . '|' . ip())`.
- **Login mandiri NIK/e-KTP** (baris 114–157):
  - `nik` 16 digit (regex `/^\d{16}$/`) **atau** `tag_id_card` 10 digit (regex `/^\d{10}$/`) + `password` (PIN).
  - Mode e-KTP tanpa password (`authenticateEktp`, baris 180–210) — login via tap e-KTP.
  - Provider `App\Services\Auth\PendudukMandiriProvider` memverifikasi PIN (MD5 legacy vs bcrypt) dan replay-hash bila perlu (`Hash::needsRehash` → `forceFill(['pin' => Hash::make(...)])`).
  - Sesi dapat dipulihkan via `mac_address` + `token_layanan` yang cocok `setting('layanan_opendesa_token')`.
  - Fitur layanan mandiri bisa dimatikan: `setting('layanan_mandiri') == 0` → `show_404()`.

---

## 7. Enforcement di Kode (gate/middleware/`ci_auth()`)

### 7.1 Rantai enforcement

```
Request
  └─ CI3 Router → Controller (extends Admin_Controller)
        └─ __construct():
             - Admin_Controller: cek auth('admin')->check() → redirect siteman bila belum login
             - ModulTrait::activate(): cek modul premium (bukan RBAC)
             - isCan('b') / isCan('u') / isCan('h'): cek RBAC per modul
                   └─ can() → Gate::allows("{slug}:{akses}")
                         └─ AuthServiceProvider::Gate::before()
                               - beranda → true
                               - super admin → true
                               - getUserGroupAccessData(id_grup) → baca/ubah/hapus
```

### 7.2 File & baris kunci

| Peran | File | Simbol / baris |
|---|---|---|
| Gate (inti RBAC) | `app/Providers/AuthServiceProvider.php` | `bootGateAccess()` L211–272; `getUserGroupAccessData()` L281–304 |
| Helper `can()` | `donjo-app/helpers/general_helper.php` | L88–100 |
| Helper `isCan()` | `donjo-app/helpers/general_helper.php` | L111–126 |
| `ci_auth()` | `donjo-app/helpers/general_helper.php` | L474–483 |
| `super_admin()` | `donjo-app/helpers/opensid_helper.php` | L1771–1774 |
| `is_super_admin()` | `donjo-app/helpers/opensid_helper.php` | L1781–1785 |
| `is_group_administrator()` | `donjo-app/helpers/opensid_helper.php` | L1791–1795 |
| Scope super admin | `app/Models/User.php` | `scopeSuperAdmin()` L256–259 |
| Scope wilayah | `app/Scopes/AccessWilayahScope.php` | `apply()` L51–65 |
| Base controller admin | `donjo-app/core/Admin_Controller.php` | `__construct()` (auth gate, L74–79); file ter-obfuscate, dekode OK |
| Base controller modul | `donjo-app/core/AdminModulController.php` | `abstract`, `use ModulTrait`; file ter-obfuscate, dekode OK |
| Trait modul (premium) | `app/Traits/ModulTrait.php` | `activate()` L112–125; `isModulePremiumActive()` L132–143 |
| Login admin | `donjo-app/controllers/auth/AuthenticatedSessionController.php` | `store()` L281+; OTP L90–279; 2FA L301–302 |
| Login mandiri | `donjo-app/controllers/fmandiri/auth/AuthenticatedSessionController.php` | L114–157, `throttleKey()` L245–250 |
| Reset sandi admin | `donjo-app/controllers/auth/PasswordResetLinkController.php`, `NewPasswordController.php` | — |
| 2FA controller | `donjo-app/controllers/auth/TwoFactorAuthController.php` | — |
| OTP service | `app/Services/OtpService.php` | seluruh kelas |
| OTP controller | `donjo-app/controllers/Otp.php` | L200–224 |
| Middleware | `app/Http/Middleware/SecurityHeaders.php` | **satu-satunya** middleware di repo |

### 7.3 `isCan()` — perilaku redirect

`donjo-app/helpers/general_helper.php` L111–126:

```php
function isCan($akses = null, $slugModul = null, $adminOnly = false, $demoOnly = false, ?User $user = null): void
{
    $pesan = 'Anda tidak memiliki akses untuk halaman tersebut!';
    if (! can('b', $slugModul, $adminOnly, $demoOnly, $user)) {
        set_session('error', $pesan);
        session_error($pesan);
        redirect('beranda');            // gagal baca → ke beranda
    } elseif (! can($akses, $slugModul, $adminOnly, $demoOnly, $user)) {
        set_session('error', $pesan);
        session_error($pesan);
        redirect(ci()->controller);     // gagal aksi → kembali ke controller
    }
}
```

Pola pemakaian di controller legacy (mis. `donjo-app/controllers/Man_user.php`):
- `__construct()` → `isCan('b');` (baris 63) — gerbang baca di level controller.
- `form()` → `isCan('u');` (baris 135) — aksi ubah.
- Tombol UI juga dicek: `can('u')` (baris 107).

### 7.4 `Admin_Controller` (hasil dekode)

`donjo-app/core/Admin_Controller.php` (didekode; logika utama):

- `__construct()` (baris 68–117):
  - `parent::__construct()` (MY_Controller).
  - Jika `! auth('admin')->check()` → simpan `session->intended = current_url()` lalu `redirect('siteman')` (baris 74–79).
  - `cek_identitas_desa()`, `PelangganService::perbaruiLangganan()`.
  - `View::share([...])` termasuk `akses_modul = sub_modul_ini ?? modul_ini` (baris 103).
  - Bila `session->change_password` dan controller ≠ `pengguna` → `redirect('pengguna')` (baris 108–116).
- `cek_identitas_desa()` (baris 173–225): paksa isi identitas desa; logout `admin_periksa`; hitung notifikasi header.
- `set_hak_akses_rfm()` (baris 147–159): set `session->hapus_gambar_rfm` bila `can('h')`, `session->ubah_tambah_gambar_rfm` bila `can('u')`.
- `modules_list()` (baris 161–164): cache 1 jam.

> **Penting:** `Admin_Controller` **tidak** melakukan pengecekan akses per-modul. Enforcement akses modul dilakukan **di masing-masing controller** via `isCan()/can()`, bukan di base controller.

### 7.5 `AdminModulController` (hasil dekode)

`donjo-app/core/AdminModulController.php` (didekode; **2 lapis** obfuscation):

```php
use App\Traits\ModulTrait;

defined('BASEPATH') || exit('No direct script access allowed');

abstract class AdminModulController extends Admin_Controller
{
    use ModulTrait;

    public function __construct()
    {
        parent::__construct();
        $this->moduleDirectory = $this->getModuleDirectory();
        $this->moduleName ??= $this->loadModuleJson()['name'];
        $this->activate();        // cek modul premium (langganan), BUKAN RBAC
        $this->loadHelper();
        $this->loadConfig();
    }
}
```

`ModulTrait::activate()` (baris 112–125) hanya memeriksa apakah modul premium aktif (langganan). Bukan penegak RBAC.

### 7.6 Yang TIDAK ada (ekspektasi umum yang keliru)

- **Tidak ada** `app/Http/Controllers/Grup*.php` atau `User*.php`. Controller pengguna/grup ada di `donjo-app/controllers/` (`Grup.php`, `Man_user.php`, `Pengguna.php`).
- **Tidak ada** middleware RBAC (`can:`/`permission:`). Hanya `SecurityHeaders.php`.
- **Tidak ada** tabel `user_akses_wilayah`.
- **Tidak ada** Policy (array `$policies` di `AuthServiceProvider` kosong, baris 56–58) — otorisasi murni lewat `Gate::before`.

### 7.7 Prosedur deobfuscation (untuk audit)

File `Admin_Controller.php` & `AdminModulController.php` disimpan sebagai `base64 → (zlib/plain) → eval`. Dekode **aman tanpa eksekusi**:

1. Ekstrak string base64 panjang (`[A-Za-z0-9+/=]{100,}`).
2. `base64_decode`.
3. Jika berawalan header zlib (0x78…), lewati 2 byte lalu **DeflateStream** (.NET); jika tidak, hasil base64 sudah berupa PHP/`eval` bertingkat.
4. `Admin_Controller`: 1 lapis (zlib) → PHP langsung.
5. `AdminModulController`: lapis-1 zlib menghasilkan skrip obfuscate kedua; lapis-2 base64 → PHP langsung.

Hasil: `Admin_Controller` → class + `cek_identitas_desa()`; `AdminModulController` → `abstract` + `ModulTrait`.

---

## 8. Desain RBAC Usulan (Next.js + better-auth)

> Tujuan: mereplikasi semantik OpenSID (role → modul → aksi 1/3/7, warisan parent, super admin, wilayah scoping, OTP/2FA) di stack **Next.js + better-auth + Prisma/PostgreSQL**, dengan model yang lebih eksplisit dan tidak menyimpan permission di kolom user.

### 8.1 Prinsip desain

1. **Pisahkan** role, permission, dan assignment (RBAC murni, grant-based).
2. **Permission granular** = `resource:action`, bukan angka ajaib. Angka 1/3/7 OpenSID dipetakan menjadi aksi `read`/`update`/`delete`.
3. **Warisan parent→child** dihitung sebagai **derived/cached view** pada saat baca (bukan disimpan), agar konsisten dengan OpenSID; atau disimpan sebagai `effective_permission` yang di-recompute saat grant berubah.
4. **Scoping** (wilayah) dipisah dari RBAC → model `scope`/`data_scope` (ABAC/row-level).
5. **Super admin** = flag role khusus (`is_superadmin`) dengan bypass wildcard.
6. **2FA/OTP** ditangani di layer auth (better-auth plugin), bukan RBAC.

### 8.2 Skema usulan

```prisma
// ============ IDENTITAS & AUTH (better-auth) ============
model User {
  id            String   @id @default(cuid())
  email         String?  @unique
  username      String?  @unique
  passwordHash  String?                 // bcrypt/argon2 (bukan MD5)
  name          String?
  active        Boolean  @default(true)
  twoFactorEnabled Boolean @default(false)
  otpEnabled    Boolean  @default(false)
  otpChannel    OtpChannel?             // EMAIL | TELEGRAM | BOTH
  otpIdentifier String?
  configId      String                  // multi-tenant (desa)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  roles         UserRole[]
  dataScopes    UserDataScope[]         // pengganti batasi_wilayah + akses_wilayah
  sessions      Session[]
  accounts      Account[]
  twoFactors    TwoFactor[]
}

enum OtpChannel { EMAIL TELEGRAM BOTH }

// ============ RBAC ============
model Role {                            // ≈ user_grup
  id         String   @id @default(cuid())
  configId   String
  name       String                     // "Operator"
  slug       String                     // "operator"
  kind       RoleKind @default(DESA)    // SISTEM (terlindungi) | DESA
  isSuperadmin Boolean @default(false)  // wildcard bypass (≈ administrator)
  isProtected Boolean  @default(false)  // jenis=1 → tak boleh diubah/dihapus
  users      UserRole[]
  grants     RolePermission[]
  @@unique([configId, slug])
}

enum RoleKind { SISTEM DESA }

model Permission {                      // aksi granular per resource
  id          String @id @default(cuid())
  resource    String                  // = slug modul, mis. "penduduk"
  action      Action                  // READ | UPDATE | DELETE
  description String?
  roleGrants  RolePermission[]
  @@unique([resource, action])
}

enum Action { READ UPDATE DELETE }

model RolePermission {                  // ≈ grup_akses
  id           String @id @default(cuid())
  configId     String
  roleId       String
  permissionId String
  allowed      Boolean @default(true)   // 1/3/7 → dipetakan ke set permission
  role         Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@unique([configId, roleId, permissionId])
}

model UserRole {                        // ≈ user.id_grup (bisa multi-role)
  id     String @id @default(cuid())
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@unique([userId, roleId])
}

// ============ RESOURCE (modul) ============
model Resource {                        // ≈ setting_modul
  id          String  @id @default(cuid())   // atau pakai slug sebagai key
  configId    String
  name        String                          // "Penduduk"
  slug        String                          // "penduduk"
  url         String?
  icon        String?
  order       Int     @default(0)
  level       Int     @default(0)
  hidden      Hidden  @default(SHOW)          // SHOW | SHOW_S | HIDDEN
  active      Boolean @default(true)
  parentId    String?
  parent      Resource?  @relation("ResourceTree", fields: [parentId], references: [id])
  children    Resource[] @relation("ResourceTree")
  configIdJoin String
  @@unique([configId, slug])
}

enum Hidden { SHOW SHOW_S HIDDEN }

// ============ SCOPING (wilayah) ============
model UserDataScope {                   // pengganti batasi_wilayah + akses_wilayah
  id        String @id @default(cuid())
  userId    String
  scopeType String                    // "wilayah"
  scopeId   String                    // id wilayah (dusun/RW/RT)
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId, scopeType, scopeId])
}
// kolom batasi_wilayah → Boolean derived: user.dataScopes.length > 0
```

### 8.3 Pemetaan OpenSID → usulan

| OpenSID | Usulan Next.js | Catatan |
|---|---|---|
| `user_grup` | `Role` | tambah `isSuperadmin`, `isProtected` |
| `user.id_grup` (tunggal) | `UserRole` (many-to-many) | lebih fleksibel; bisa 1 role untuk kompatibilitas |
| `setting_modul` | `Resource` | slug = `resource` |
| `grup_akses.akses` (1/3/7) | `RolePermission` ke `Permission(READ/UPDATE/DELETE)` | **7** → READ+UPDATE+DELETE; **3** → READ+UPDATE; **1** → READ; **0** → tidak ada baris |
| Warisan parent (paksa 7 bila anak>0) | derived `effectivePermissions` (materialized view / cache Redis) | recompute saat grant berubah |
| `super_admin` (`id_grup=administrator`) | `Role.isSuperadmin = true` + bypass di authz | satu per config |
| `jenis=1` grup sistem | `Role.isProtected = true` | tolak edit/hapus |
| `user.batasi_wilayah` + `akses_wilayah` | `UserDataScope[]` | pisah dari RBAC |
| `can('baca','penduduk')` | `authz.can(session, 'penduduk', 'read')` | — |
| `isCan()` redirect | guard `requirePermission()` di server action/route handler | — |
| OTP (`OtpToken`) | better-auth `twoFactor` + emailOTP plugin | hash OTP, expiry, max attempts |
| reset sandi (`password_resets`) | better-auth `resetPassword` | token expire |
| MD5 legacy pin/NIK mandiri | provider terpisah + migrasi rehash ke argon2 | `tweb_penduduk_mandiri` → `WargaCredential` |

### 8.4 Contoh implementasi otorisasi

```ts
// lib/authz.ts
export type Action = "read" | "update" | "delete";

// Konversi akses OpenSID 0/1/3/7 → set aksi (untuk migrasi data)
export function aksesToActions(akses: number): Action[] {
  const a: Action[] = [];
  if (akses >= 1) a.push("read");
  if (akses >= 3) a.push("update");
  if (akses >= 7) a.push("delete");
  return a;
}

export async function can(
  user: { id: string; roles: { roleId: string; isSuperadmin: boolean }[] },
  resource: string,
  action: Action,
): Promise<boolean> {
  if (user.roles.some(r => r.isSuperadmin)) return true;       // super admin bypass
  if (resource === "beranda") return true;                     // modul default

  // query RolePermission + Permission(resource, action) untuk role user
  const perms = await getEffectivePermissions(user);            // mempertimbangkan warisan parent
  return perms.has(`${resource}:${action}`);
}
```

```ts
// server action / route handler
import { auth } from "@/lib/auth";
import { can } from "@/lib/authz";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });
  if (!(await can(session.user, "penduduk", "delete")))
    return new Response("Forbidden", { status: 403 });

  // ...hapus data (dan terapkan data scope bila user terbatas wilayah)
}
```

```ts
// warisan parent→child (derived, bukan disimpan di DB)
export function withInheritance(rows: { slug: string; parentSlug: string | null; akses: number }[]) {
  const byParent = new Map<string, typeof rows>();
  for (const r of rows) {
    if (r.parentSlug) byParent.set(r.parentSlug, [...(byParent.get(r.parentSlug) ?? []), r]);
  }
  return rows.map(r => {
    const children = byParent.get(r.slug) ?? [];
    const hasActiveChild = children.some(c => c.akses > 0);
    return { ...r, akses: hasActiveChild ? 7 : r.akses }; // sama persis dengan OpenSID
  });
}
```

### 8.5 Konfigurasi better-auth (ringkas)

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Ganti syarat sandi OpenSID dengan policy setara:
    minPasswordLength: 8, maxPasswordLength: 20,
    // requireNumber/symbol/uppercase/lowercase di-pasang di z-validator form
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,  // 7 hari
    updateAge: 60 * 60 * 24,      // perpanjang tiap 1 hari
  },
  plugins: [
    twoFactor({ issuer: "OpenDesa" }),     // ≈ two_factor_enabled (Spatie)
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) { /* kirim email */ },
      otpLength: 6,
      expiresIn: 60 * 5,                    // ≈ otp_expiry_minutes
    }),
  ],
  user: {
    additionalFields: {
      username: { type: "string", required: false },
      configId: { type: "string", required: true },
      otpChannel: { type: "string", required: false },
      otpIdentifier: { type: "string", required: false },
    },
  },
});
```

### 8.6 Rekomendasi migrasi data dari OpenSID

1. **Role**: `user_grup` → `Role` (+ `isProtected = (jenis === 1)`, `isSuperadmin = (slug === 'administrator')`).
2. **Resource**: `setting_modul` → `Resource` (pertahankan `slug`, `parent`→`parentId`, `hidden`, `urut`→`order`).
3. **Permission**: buat baris `READ/UPDATE/DELETE` per `Resource` (atau permission generik `resource:action`).
4. **RolePermission**: `grup_akses.akses` → `aksesToActions()` (0→∅, 1→[read], 3→[read,update], 7→[read,update,delete]).
5. **UserRole**: `user.id_grup` → satu `UserRole`.
6. **UserDataScope**: `user.akses_wilayah` (JSON array) → baris `UserDataScope` bila `batasi_wilayah = 1`.
7. **Verifikasi warisan**: hitung ulang `effectivePermissions` (parent paksa 7 bila ada anak ber-akses>0) dan bandingkan dengan OpenSID agar perilaku identik.

### 8.7 Matriks pemetaan aksi (ringkas)

| `grup_akses.akses` | `Permission.action` |
|:--:|---|
| 0 | *(tidak ada baris)* |
| 1 | `read` |
| 3 | `read`, `update` |
| 7 | `read`, `update`, `delete` |
| parent dgn anak ber-akses>0 | dipaksa `read`,`update`,`delete` (derived) |

---

## Lampiran A — Berkas sumber utama

| Topik | Path |
|---|---|
| Gate RBAC & warisan | `app/Providers/AuthServiceProvider.php` |
| Model role | `app/Models/UserGrup.php` |
| Model akses | `app/Models/GrupAkses.php` |
| Model modul | `app/Models/Modul.php` |
| Model user | `app/Models/User.php` |
| Model mandiri | `app/Models/PendudukMandiri.php` |
| Scope wilayah | `app/Scopes/AccessWilayahScope.php` |
| Helper akses | `donjo-app/helpers/general_helper.php`, `donjo-app/helpers/opensid_helper.php` |
| Base controller | `donjo-app/core/Admin_Controller.php`, `donjo-app/core/AdminModulController.php` |
| Trait modul | `app/Traits/ModulTrait.php` |
| Login admin/OTP/2FA | `donjo-app/controllers/auth/AuthenticatedSessionController.php`, `TwoFactorAuthController.php` |
| Login mandiri | `donjo-app/controllers/fmandiri/auth/AuthenticatedSessionController.php` |
| Reset sandi | `donjo-app/controllers/auth/PasswordResetLinkController.php`, `NewPasswordController.php` |
| OTP | `app/Services/OtpService.php`, `donjo-app/controllers/Otp.php` |
| Seeder role | `app/database/seeders/DataAwal/DataAwalSeeder.php` |
| Seeder akses | `app/database/seeders/DataAwal/GrupAkses.php` |
| Seeder modul | `app/database/seeders/DataAwal/SettingModul.php`, `StrukturTabelSeeder.php` |
| Permission default install | `app/Services/Install/CreateGrupAksesService.php` |
| Konfigurasi auth | `config/auth.php` |

## Lampiran B — Daftar `[perlu verifikasi]`

- Nama pasti unique key/index pada `grup_akses` dan `setting_modul`.
- Keberadaan kolom `setting_modul.ikon_parent`.
- Definisi modul induk id `220` (pembangunan), `324` (lapak), `334` (pengaduan) yang tidak ada di `StrukturTabelSeeder`.
- Nomor migrasi & urutan kolom persis untuk `batasi_wilayah`/`akses_wilayah` (`Migrasi_2024050171.php`) dan kolom OTP (`Migrasi_2025110171.php`).
- Daftar lengkap model yang mengimplementasikan `getWilayahColumn()` untuk `AccessWilayahScope`.
- Detail baris `Mandiri_Controller` untuk verifikasi email/telegram pendaftar.
