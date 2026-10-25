# Sistem Informasi Desa (SID)

Aplikasi **fullstack Next.js + TypeScript** untuk administrasi pemerintahan desa:
bersih, bertipe kuat, dan mudah dirawat. Repositori ini adalah rebuild orisinal
dengan target **cakupan fitur OpenSID lengkap**, bukan salinan kode OpenSID.
Sumber kebutuhan lengkap ada di
[`docs/KATALOG-FITUR-OPENSID.md`](docs/KATALOG-FITUR-OPENSID.md); status
implementasi ada di [`docs/PARITAS-OPENSID.md`](docs/PARITAS-OPENSID.md).

Saat ini proyek masih bertahap: fondasi dan banyak fitur inti sudah tersedia,
tetapi sejumlah modul OpenSID, quality gate, dan verifikasi E2E masih belum
selesai. Jangan membaca daftar modul yang sudah ada sebagai klaim paritas penuh.

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

Buka `http://localhost:3000` → beranda publik desa. Area admin ada di
`/beranda`; bila belum login, rute terproteksi mengarahkan ke `/masuk`.

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
| `npm run smoke`        | Smoke test HTTP halaman publik (server harus berjalan)       |
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
│  ├─ (auth)/masuk/          # Halaman masuk staf & warga
│  ├─ (admin)/               # Area terproteksi + kerangka admin
│  │  ├─ beranda/  penduduk/  keluarga/  rumah-tangga/  wilayah/
│  │  ├─ kelompok/  kelompok/kategori/
│  │  ├─ bantuan/  inventaris/  bumindes/  analisis-survei/
│  │  ├─ persuratan/{surat,jenis,klasifikasi,syarat,surat-masuk,surat-keluar}/
│  │  ├─ keuangan/{anggaran,triwulan,laporan,laporan-dokumen}/
│  │  ├─ permohonan-surat/   # Pengelolaan permohonan surat warga
│  │  └─ pengaturan/{desa,pengguna,grup,modul,profil}/
│  ├─ (public)/              # Situs desa (/, /desa/*, /layanan-mandiri)
│  ├─ (warga)/layanan-mandiri/  # Dasbor warga: beranda, surat, dokumen, pesan,
│  │                          # profil, ubah-pin
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
│  ├─ keuangan/  konten/  layanan-mandiri/  modul/  navigation/  penduduk/
│  ├─ pengguna/  publik/  rbac/  rumah-tangga/  surat/  survey/  warga/
│  ├─ wilayah/
├─ themes/                   # tema publik terkompilasi (registry statis)
└─ lib/                      # env, logger, errors, action-state, forms, dal, auth
```

Dokumentasi lengkap ada di [`docs/`](docs/) — mulai dari
[`docs/README.md`](docs/README.md). Dokumen usang dipindahkan ke
[`docs/arsip/`](docs/arsip/) dan **tidak boleh** dipakai sebagai acuan status.

## Autentikasi & Hak Akses

- **Staf login memakai username** (email opsional) — sesuai kebiasaan operator
  desa. **Warga login memakai NIK + PIN 6 digit**; akun dibuat operator.
- Sesi disimpan sebagai cookie `HttpOnly` berlaku **7 hari**. Login dibatasi
  5 percobaan/menit per IP.
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
- Akun warga tidak memakai RBAC (tanpa `roleId`); area warga dijaga
  `requireWarga`/`requireWargaAktif` dan `residentId` selalu diambil dari sesi.

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

Pengujian memakai **Vitest**. Mayoritas test adalah unit test logika murni
(tanpa database/`next/headers`): model izin RBAC, pembentukan menu, validasi
penduduk, keluarga, wilayah, pengguna, kelompok (slug, jabatan, keanggotaan),
bantuan (status masa aktif, slug, validasi peserta), persuratan (nomor, template,
tanggal), inventaris (transisi mutasi, perhitungan perubahan aset), akun warga
(PIN, ubah PIN), permohonan surat (transisi status, berkas syarat), pemetaan
kesalahan, serta validasi environment. Suite juga memiliki test integrasi DB
untuk isolasi tenant dan siklus akun warga; test ini otomatis di-skip bila MySQL
tidak tersedia.

CI menjalankan typecheck + lint + format + test + build, lalu smoke test HTTP
pada build produksi (MySQL + migrate + seed), pada setiap push/PR.

```bash
npm run test        # sekali jalan
npm run test:watch  # mode pantau
```

## Dokumentasi

Mulai dari **[`docs/README.md`](docs/README.md)** — peta dokumentasi dan aturan
sumber kebenaran.

- [`docs/KATALOG-FITUR-OPENSID.md`](docs/KATALOG-FITUR-OPENSID.md) — baseline
  cakupan **seluruh** fitur OpenSID yang wajib dipetakan.
- [`docs/PARITAS-OPENSID.md`](docs/PARITAS-OPENSID.md) — **otoritatif** untuk
  status paritas implementasi terhadap katalog OpenSID.
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

1. **Fondasi** ✅ — auth staf, RBAC, kerangka admin, lapisan data, dan wilayah.
2. **Fitur inti** 🟡 — kependudukan, keluarga, RTM, kelompok, bantuan,
   persuratan, keuangan dasar, inventaris, Bumindes inti, layanan mandiri,
   pengaduan, survei dasar, dan CMS publik sudah memiliki irisan implementasi.
3. **Paritas OpenSID lengkap** 🔴 — seluruh ID di
   [`docs/KATALOG-FITUR-OPENSID.md`](docs/KATALOG-FITUR-OPENSID.md) belum selesai.
4. **Multi-desa dan hardening** 🟡/🔴 — seam tenant publik sudah dibuat, tetapi
   provisioning, super-admin, audit, backup, dan uji keamanan menyeluruh belum.

Status fitur di atas bukan klaim bahwa seluruh kemampuan OpenSID pada domain
tersebut sudah tersedia. Status per ID ada di `PARITAS-OPENSID.md`.
