# Sistem Informasi Desa (SID)

Aplikasi **fullstack Next.js + TypeScript** untuk administrasi pemerintahan desa:
bersih, bertipe kuat, dan mudah dirawat. Repositori ini berisi **fondasi** —
autentikasi, RBAC, kerangka admin, lapisan data — beserta irisan vertikal lengkap
untuk **Wilayah Administratif**, **Kependudukan**, **Kartu Keluarga**,
**Rumah Tangga (RTM)**, **Kelompok & Lembaga**, **Bantuan Sosial** (program &
peserta), **Persuratan**
(layanan surat, master surat, agenda masuk/keluar, cetak & PDF), dan
**Keuangan** (APBDes: pohon rekening, pagu
anggaran, realisasi, laporan RP APBDes & per bidang, ekspor CSV/Excel, serta
arsip dokumen laporan per semester).

> Status: modul dibangun bertahap. Lihat [Peta Jalan](#peta-jalan).

## Tumpukan Teknologi

| Lapisan    | Pilihan                                                            |
| ---------- | ------------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Turbopack, React 19)                       |
| Bahasa     | TypeScript (strict)                                                |
| Database   | MySQL / MariaDB via Drizzle ORM (+ mysql2)                         |
| Auth       | better-auth (login **username**, sesi 7 hari)                      |
| RBAC       | Tabel sendiri `roles`/`modules`/`role_permissions` (akses `read`/`write`/`manage`) dengan pewarisan induk ← anak |
| UI         | Tailwind CSS v4 + shadcn/ui (radix-nova) + lucide-react              |
| Validasi   | zod                                                                |
| Notifikasi | sonner                                                             |
| Pengujian  | Vitest (logika murni) + GitHub Actions CI                          |

## Kebutuhan

- **Node.js ≥ 20.9** (dikembangkan di Node 26)
- **MySQL 8 / MariaDB 10.4+**
- **npm** (repositori ini memakai `package-lock.json`)

## Memulai

```bash
# 1. Dependensi
npm install

# 2. Konfigurasi environment
Copy-Item .env.example .env      # bash: cp .env.example .env
#   → WAJIB isi BETTER_AUTH_SECRET (min. 32 karakter):
#     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Siapkan database
npm run db:create                # CREATE DATABASE IF NOT EXISTS
npm run db:migrate               # jalankan migrasi Drizzle
npm run db:seed                  # identitas desa, role, modul, referensi, admin

# 4. Jalankan
npm run dev                      # http://localhost:3000
```

Buka `http://localhost:3000` → dialihkan ke `/masuk`.

**Kredensial bawaan seed:** `admin` / `Admin#12345`
(ganti segera, atau set `SEED_ADMIN_PASSWORD` sebelum menjalankan seeder).

> **Penting (produksi):** `npm run build` lalu `npm run start`. Jangan pernah
> meng-commit berkas `.env`; berkas itu sudah diabaikan oleh `.gitignore`.

## Perintah

| Perintah               | Keterangan                                                |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Server pengembangan                                        |
| `npm run build`        | Build produksi                                             |
| `npm run start`        | Jalankan hasil build                                       |
| `npm run check`        | Typecheck + lint + cek format + test (jalankan sebelum commit) |
| `npm run typecheck`    | Typegen Next.js + `tsc --noEmit`                           |
| `npm run lint`         | ESLint                                                     |
| `npm run format`       | Prettier (menulis)                                         |
| `npm run format:check` | Prettier (memeriksa saja)                                  |
| `npm run test`         | Jalankan pengujian unit (Vitest, sekali jalan)             |
| `npm run test:watch`   | Pengujian unit mode pantau                                 |
| `npm run db:create`    | Buat database dari `DATABASE_URL`                          |
| `npm run db:generate`  | Hasilkan berkas migrasi dari perubahan skema               |
| `npm run db:migrate`   | Terapkan migrasi                                           |
| `npm run db:push`      | Sinkronkan skema langsung (khusus pengembangan)            |
| `npm run db:studio`    | Drizzle Studio                                             |
| `npm run db:seed`      | Isi data awal (idempoten)                                  |
| `npm run auth:schema`  | Cetak skema tabel yang diharapkan better-auth              |

## Struktur Proyek

```
src/
├─ app/                      # Rute (App Router)
│  ├─ (auth)/masuk/          # Halaman masuk staf
│  ├─ (admin)/               # Area terproteksi + kerangka admin
│  │  ├─ beranda/  penduduk/  keluarga/  rumah-tangga/  wilayah/
│  │  ├─ kelompok/  kelompok/kategori/
│  │  ├─ bantuan/  inventaris/  bumindes/  analisis-survei/
│  │  ├─ persuratan/{surat,jenis,klasifikasi,syarat,surat-masuk,surat-keluar}/
│  │  ├─ keuangan/{anggaran,triwulan,laporan,laporan-dokumen}/
│  │  ├─ layanan-mandiri/    # sementara: admin; akan dipindah ke /permohonan-surat
│  │  └─ pengaturan/{desa,pengguna,grup,modul,profil}/
│  ├─ (public)/              # Situs desa (target: /, /desa/*, /layanan-mandiri/*)
│  ├─ api/auth/[...all]/     # Handler better-auth
│  └─ layout.tsx  page.tsx  globals.css
├─ components/
│  ├─ layout/                # app-shell, sidebar, header
│  ├─ shared/                # NoAccess, guard
│  └─ ui/                    # komponen shadcn/ui
├─ db/
│  ├─ schema/                # definisi tabel (Drizzle)
│  ├─ migrations/            # migrasi SQL
│  └─ seed/                  # data awal + katalog modul, role & referensi
├─ features/                 # kode per-domain (lihat ARCHITECTURE.md)
│  ├─ auth/  bantuan/  bumindes/  desa/  inventaris/  keluarga/  kelompok/
│  ├─ keuangan/  layanan-mandiri/  modul/  navigation/  penduduk/  pengguna/
│  ├─ rbac/  rumah-tangga/  surat/  wilayah/
├─ themes/                   # (target) tema web publik yang dipasang saat build
└─ lib/                      # env, logger, errors, action-state, forms, dal, auth
```

Dokumentasi lengkap ada di [`docs/`](docs/) — mulai dari
[`docs/README.md`](docs/README.md). Dokumen usang dipindahkan ke
[`docs/arsip/`](docs/arsip/) dan **tidak boleh** dipakai sebagai acuan status.

## Autentikasi & Hak Akses

- **Login memakai username** (email opsional) — sesuai kebiasaan operator desa.
- Sesi disimpan sebagai cookie `HttpOnly` berlaku **7 hari**.
- **RBAC** memakai tabel sendiri: `modules` (katalog modul/menu), `roles`
  (role), dan `role_permissions` (matriks izin). Tingkat akses bernama —
  `read` (lihat), `write` (lihat + tambah/ubah), `manage` (semuanya, termasuk
  hapus).
- Izin **diwarisi** dari anak ke induk: bila salah satu anak punya akses, modul
  grup induknya otomatis dapat dibaca agar menunya tampil.
- Role dengan `slug = "administrator"` adalah **super admin** (melewati semua
  pemeriksaan). Modul `beranda` selalu dapat dibaca.
- Otorisasi ditegakkan **di dalam use-case aplikasi** (`requirePermission`),
  bukan hanya di UI — sehingga setiap pemanggil terlindungi.

## Keamanan

- Tidak ada kredensial yang di-hardcode. Secret dibaca dari environment dan
  divalidasi saat aplikasi start (`src/lib/env.ts`).
- Pengalihan setelah login divalidasi (menolak URL eksternal / `//`).
- **Catatan `npm audit`:** seluruh temuan bersumber dari **dependensi
  pengembangan** (dev-only) yang transitif, dan **tidak ada** pada dependensi
  produksi. Perbaikannya menuntut penurunan versi besar (breaking) sehingga
  sengaja belum diambil:
  - `esbuild` (moderate) lewat `drizzle-kit` — hanya dev-server alat migrasi.
  - `braces` (high) lewat `fast-glob` → `micromatch` pada `eslint-config-next`
    dan `shadcn`; `3.0.3` adalah rilis terbaru dan tetap terdampak, jadi belum
    ada versi yang bisa dipakai. Dipantau otomatis oleh Dependabot.

## Pengujian

Pengujian unit memakai **Vitest** dan hanya mencakup **logika murni** (tanpa
database/`next/headers`): model izin RBAC, pembentukan menu, validasi penduduk,
keluarga, wilayah, pengguna, kelompok (slug, jabatan, keanggotaan), bantuan
(status masa aktif, slug, validasi peserta),
dan persuratan (nomor, template, tanggal), pemetaan
kesalahan, serta validasi environment. CI menjalankan typecheck + lint + format +
test + build pada setiap push/PR.

```bash
npm run test        # sekali jalan
npm run test:watch  # mode pantau
```

## Dokumentasi

Mulai dari **[`docs/README.md`](docs/README.md)** — peta dokumentasi dan aturan
sumber kebenaran.

- [`docs/RENCANA-PERBAIKAN.md`](docs/RENCANA-PERBAIKAN.md) — **otoritatif** untuk
  prioritas, fase, dan status milestone.
- [`docs/PARITAS-OPENSID.md`](docs/PARITAS-OPENSID.md) — **otoritatif** untuk
  status paritas fitur terhadap OpenSID (T1/T2/T3).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — **otoritatif** untuk
  arsitektur, lapisan, skema, RBAC, dan konvensi kode.
- [`docs/LOG-PERKEMBANGAN.md`](docs/LOG-PERKEMBANGAN.md) — kronologi pekerjaan
  yang sudah selesai.
- [`docs/riset/`](docs/riset/README.md) — analisis sistem acuan (OpenSID) sebagai
  **referensi historis**, bukan status.
- [`docs/arsip/`](docs/arsip/README.md) — dokumen usang; **jangan** dipakai untuk
  status atau prioritas.

## Status & Peta Jalan

Status lengkap dan urutan fase ada di
[`docs/RENCANA-PERBAIKAN.md`](docs/RENCANA-PERBAIKAN.md). Ringkasnya:

1. **Fondasi** ✅ — auth staf, RBAC, kerangka admin, lapisan data, Wilayah.
2. **Kependudukan** ✅ — penduduk, Kartu Keluarga (termasuk PDF), Rumah Tangga.
3. **Kelompok & Lembaga** ✅ — kelompok/lembaga, kategori, keanggotaan berjabatan.
4. **Bantuan Sosial** ✅ — program, peserta, snapshot kartu, sebaran wilayah.
5. **Persuratan** ✅ — layanan surat, syarat dinamis, penomoran, agenda masuk/keluar,
   verifikasi berjenjang, cetak HTML/PDF.
6. **Keuangan** ✅ — APBDes, realisasi, laporan & dokumen, triwulan.
7. **Inventaris** 🟡 — aset & mutasi ada; persetujuan mutasi belum menerapkan
   perubahan aset secara transaksional.
8. **Layanan Mandiri** 🟡 — domain/action ada; UI warga dan login NIK + PIN belum.
9. **BUMDes** 🟡 — unit & item ada; action belum terhubung ke UI.
10. **Analisis & Survei** 🟡 — kerangka skema ada; UI masih placeholder.

Berikutnya (lihat rencana untuk detail):

- **Fase 1** — web publik (beranda, profil, berita, statistik, tema), lalu pindahkan
  `/layanan-mandiri` milik admin menjadi `/permohonan-surat`.
- **Fase 2** — menuntaskan seluruh menu admin yang ada.
- **Fase 3** — paritas OpenSID T1 + T2.
- **Fase 4** — multi-desa & multi-domain.

### Cakupan Kelompok & Lembaga

Kelompok dan lembaga memakai **single-table inheritance** (`kelompok.type`),
bukan tabel terpisah. Berbeda dari sistem rujukan yang menyimpan `id_ketua` di
tabel kelompok (berisiko tidak sinkron, dengan penanda sentinel `-9999`), di sini
**ketua diturunkan** dari anggota berjabatan Ketua — satu sumber kebenaran.
Keanggotaan bersifat banyak-ke-banyak (satu penduduk boleh di banyak kelompok).

| Fitur rujukan | Status |
| ------------- | ------ |
| Kelompok masyarakat (nama, kode, SK, keterangan) | ✅ |
| Lembaga desa sebagai tipe kelompok | ✅ |
| Master kategori (per tipe) | ✅ |
| Anggota + jabatan (Ketua, Wakil, Sekretaris, Bendahara, Anggota) | ✅ |
| Ketua turunan dari keanggotaan | ✅ |
| Data suplemen (mis. penyandang disabilitas) | belum (modul terpisah) |
| Buku administrasi / laporan kelompok | belum |

### Cakupan Bantuan Sosial

Modul Bantuan Sosial dibangun sebagai dua entitas bersih: `bantuan_program`
(definisi program + sasaran + masa aktif) dan `bantuan_peserta` (keanggotaan
sasaran). Status masa aktif **dihitung** dari rentang tanggal, bukan disimpan.
Penautan peserta memakai **FK eksplisit** (`resident_id`/`family_id`/`rtm_id`)
alih-alih kunci teks seperti sistem rujukan
([`docs/riset/LAMPIRAN-12-BANTUAN-DTKS.md`](docs/riset/LAMPIRAN-12-BANTUAN-DTKS.md)).
Yang belum termasuk:

| Fitur rujukan | Status |
| ------------- | ------ |
| Program bantuan (nama, sasaran, masa aktif, asal dana) | ✅ |
| Sasaran penduduk / keluarga / rumah tangga | ✅ |
| Peserta + snapshot kartu (no. kartu, NIK, nama, tempat/tanggal lahir, alamat) | ✅ |
| Dedupe peserta per program + blokir hapus program berpeserta | ✅ |
| Sebaran peserta per wilayah | ✅ |
| Sasaran **kelompok** (modul Kelompok kini tersedia; penautan peserta menyusul) | belum |
| Unggah berkas kartu peserta (jpg/png) | belum |
| Ekspor/impor peserta (Excel), cetak daftar & kartu peserta | belum |
| Statistik bantuan per wilayah lintas program | belum |
| Sinkronisasi DTKS (Satu Data) & impor Regsosek | belum |

### Cakupan Keuangan

Irisan Keuangan mengikuti **Lapis A (modern/konsolidasi)** dan **Lapis D (arsip
dokumen)** dari sistem rujukan
([`docs/riset/LAMPIRAN-10-DEEP-DIVE-KEUANGAN.md`](docs/riset/LAMPIRAN-10-DEEP-DIVE-KEUANGAN.md)):
dua tabel inti `keuangan_template` (pohon rekening) + `keuangan` (nilai per
tahun), dengan laporan RP APBDes & realisasi per bidang diturunkan dari pohon
tersebut, ditambah `keuangan_triwulan` (realisasi per bidang per TW I–IV) dan
`keuangan_laporan` sebagai arsip dokumen laporan per semester. Yang belum
termasuk:

| Fitur rujukan | Status |
| ------------- | ------ |
| Lapis B legacy manual (`keuangan_manual_*`, impor dari Siskeudes) | belum |
| Lapis C (`ref_bidang`, `ref_kegiatan`, `ref_rek*` + sub-tabel rincian) | belum |
| Laporan triwulan (`Tw1Rinci`…`Tw4Rinci`) | ✅ (per bidang `5.x`, input manual) |
| Ekspor laporan (Excel/CSV) | ✅ |
| Sisa lebih (SiLPA) otomatis antartahun | belum |
| Catatan/lampiran berkas per rekening | belum |

### Cakupan Kependudukan

Laporan kependudukan **diturunkan** dari tabel `residents` (tanpa tabel baru);
hanya penduduk berstatus hidup yang dihitung. Yang belum termasuk:

| Fitur rujukan | Status |
| ------------- | ------ |
| Rekap menurut umur, jenis kelamin, agama, pendidikan, pekerjaan, status kawin, wilayah, kelompok umur | ✅ |
| Ekspor CSV (pemisah `;`, BOM UTF-8) | ✅ |
| Cetak Kartu Keluarga (PDF, lanskap, dua tabel) | ✅ |
| Laporan bulanan desa (LAMPIRAN A-9, kelahiran/kematian/pindah) | belum |
| Laporan kelompok rentan & statistik lintas-desa | belum |
| Impor data penduduk dari berkas Excel/CSV | belum |
| Cetak biodata penduduk per orang (PDF) | belum |

### Cakupan Rumah Tangga

Modul Rumah Tangga (RTM) dibangun sebagai entitas **mandiri** (kolom penanda
DTKS/BDT disiapkan, tetapi sinkronisasi ke DTKS menyusul saat modul Bantuan
dibangun). Keanggotaan RTM **eksklusif**: satu penduduk hanya berada di satu RTM,
ditautkan lewat `residents.rtm_id` + `residents.rtm_level`.

| Fitur rujukan | Status |
| ------------- | ------ |
| Daftar RTM dengan paginasi & pencarian | ✅ |
| Nomor RTM otomatis (kode desa + nomor urut) | ✅ |
| Kelas sosial & nomor BDT | ✅ |
| Rincian anggota dengan tingkat (kepala/anggota) | ✅ |
| Penautan & pengeluaran penduduk dari RTM | ✅ |
| RTM sebagai data rumah tangga (Rumah Tangga, bukan KK) | ✅ |
| Sinkronisasi otomatis RTM ↔ DTKS | belum (menunggu modul Bantuan/DTKS) |
| Ekspor & cetak data RTM | belum |

### Cakupan Persuratan

Irisan Persuratan yang sudah dibangun sengaja dibatasi pada **siklus surat
dasar**. Fitur lanjutan dari sistem rujukan
([`docs/riset/LAMPIRAN-01-PERSURATAN.md`](docs/riset/LAMPIRAN-01-PERSURATAN.md))
belum termasuk dan menjadi pekerjaan berikutnya:

| Fitur rujukan | Status |
| ------------- | ------ |
| Layanan Mandiri (warga mengajukan surat sendiri) | belum |
| Verifikasi berjenjang (operator → sekdes → kades) | belum |
| Tanda Tangan Elektronik (TTE/BSRE) | belum |
| QR verifikasi publik & tabel `urls` | belum |
| Form isian dinamis per surat (`form_isian` JSON) | belum |
| Kode isian kustom & mesin placeholder lengkap (aritmatika, terbilang, `klgx_`) | belum |
| Master syarat surat (`ref_syarat_surat`) | belum |
| Impor katalog 43 surat sistem | belum (seed memuat katalog contoh) |
| Empat mode penomoran surat | belum (dipakai: per jenis + tahun) |
