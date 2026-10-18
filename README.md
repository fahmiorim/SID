# Sistem Informasi Desa (SID)

Aplikasi **fullstack Next.js + TypeScript** untuk administrasi pemerintahan desa:
bersih, bertipe kuat, dan mudah dirawat. Repositori ini berisi **fondasi** —
autentikasi, RBAC, kerangka admin, lapisan data — beserta irisan vertikal lengkap
untuk **Wilayah Administratif** dan **Kependudukan**.

> Status: **fondasi** — modul fitur dibangun bertahap. Lihat [Peta Jalan](#peta-jalan).

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
│  ├─ (auth)/masuk/          # Halaman masuk
│  ├─ (admin)/               # Area terproteksi + kerangka admin
│  │  ├─ beranda/  penduduk/  keluarga/  wilayah/
│  │  └─ pengaturan/{desa,pengguna,grup,modul,profil}/
│  ├─ api/auth/[...all]/     # Handler better-auth
│  └─ layout.tsx  page.tsx  globals.css
├─ components/
│  ├─ layout/                # app-shell, sidebar, header
│  ├─ shared/                # ModuleGuard, NoAccess, placeholder
│  └─ ui/                    # komponen shadcn/ui
├─ db/
│  ├─ schema/                # definisi tabel (Drizzle)
│  ├─ migrations/            # migrasi SQL
│  └─ seed/                  # data awal + katalog modul, role & referensi
├─ features/                 # kode per-domain (lihat ARCHITECTURE.md)
│  ├─ auth/  desa/  navigation/  penduduk/  rbac/  wilayah/
└─ lib/                      # env, logger, errors, action-state, dal, auth
```

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
database/`next/headers`): model izin RBAC, pembentukan menu, validasi wilayah,
pemetaan kesalahan, dan validasi environment. CI menjalankan
typecheck + lint + format + test + build pada setiap push/PR.

```bash
npm run test        # sekali jalan
npm run test:watch  # mode pantau
```

## Dokumentasi

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arsitektur, konvensi, keputusan.
- [`docs/riset/README.md`](docs/riset/README.md) — catatan riset internal
  (analisis sistem rujukan + lampiran), dipakai sebagai **referensi fitur**.

## Peta Jalan

1. **Fondasi** ✅ — auth, RBAC, kerangka admin, lapisan data, irisan Wilayah.
2. **Fondasi mutu** ✅ — pengujian unit (Vitest) + CI + Dependabot.
3. **Kependudukan** ✅ — data penduduk (identitas, sosial, domisili) + katalog
   referensi (agama, pendidikan, pekerjaan, dst.).
4. Modul berikutnya: Keluarga → Persuratan → Keuangan.
5. Ekspor/impor (exceljs/pdf-lib), peta, dan lampiran berkas.
