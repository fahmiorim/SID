# Sistem Informasi Desa (SID) — Rebuild Modern

Rebuild [OpenSID](https://github.com/OpenSID/OpenSID) (PHP/CodeIgniter) menjadi
aplikasi **fullstack Next.js + TypeScript** yang bersih, bertipe kuat, dan mudah
dirawat. Repositori ini berisi **fondasi**: autentikasi, RBAC, kerangka admin,
lapisan data, dan satu irisan vertikal lengkap (Wilayah Administratif).

> Status: **fondasi** — belum seluruh modul OpenSID dipindahkan. Lihat
> [Peta Jalan](#peta-jalan).

## Tumpukan Teknologi

| Lapisan    | Pilihan                                                            |
| ---------- | ------------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Turbopack, React 19)                       |
| Bahasa     | TypeScript (strict)                                                |
| Database   | MySQL / MariaDB via Drizzle ORM (+ mysql2)                         |
| Auth       | better-auth (login **username**, sesi 7 hari)                      |
| RBAC       | Model izin OpenSID (0/1/3/7) dengan pewarisan induk→anak           |
| UI         | Tailwind CSS v4 + shadcn/ui (radix-nova) + lucide-react              |
| Validasi   | zod                                                                |
| Notifikasi | sonner                                                             |

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
npm run db:seed                  # identitas desa, role, modul, admin

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
| `npm run check`        | Typecheck + lint + cek format (jalankan sebelum commit)    |
| `npm run typecheck`    | Typegen Next.js + `tsc --noEmit`                           |
| `npm run lint`         | ESLint                                                     |
| `npm run format`       | Prettier (menulis)                                         |
| `npm run format:check` | Prettier (memeriksa saja)                                  |
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
│  └─ seed/                  # data awal + katalog modul & role
├─ features/                 # kode per-domain (lihat ARCHITECTURE.md)
│  ├─ auth/  desa/  navigation/  rbac/  wilayah/
└─ lib/                      # env, logger, errors, action-state, dal, auth
```

## Autentikasi & Hak Akses

- **Login memakai username** (kebiasaan OpenSID); email opsional.
- Sesi disimpan sebagai cookie `HttpOnly` berlaku **7 hari**.
- **RBAC** memakai kembali model OpenSID: tabel `setting_modul` (katalog modul),
  `user_grup` (role), dan `grup_akses` (matriks izin) dengan kode akses
  `0` (tidak ada), `1` (baca), `3` (baca+ubah), `7` (penuh).
- Izin **diwarisi** dari induk ke anak: bila salah satu anak punya akses > 0,
  induknya otomatis diberi akses penuh agar menunya tampil.
- Role dengan `slug = "administrator"` adalah **super admin** (melewati semua
  pemeriksaan). Modul `beranda` selalu dapat dibaca.
- Otorisasi ditegakkan **di dalam use-case aplikasi** (`requirePermission`),
  bukan hanya di UI — sehingga setiap pemanggil terlindungi.

## Keamanan

- Tidak ada kredensial yang di-hardcode. Secret dibaca dari environment dan
  divalidasi saat aplikasi start (`src/lib/env.ts`).
- Pengalihan setelah login divalidasi (menolak URL eksternal / `//`).
- **Catatan:** `npm audit` melaporkan 4 kerentanan *moderate* pada dependensi
  transitif `drizzle-kit` (`esbuild` dev-server). Hanya berdampak pada alat
  pengembangan lokal; perbaikannya menuntut penurunan versi besar, jadi belum
  diambil. Tidak menyentuh runtime produksi.

## Dokumentasi

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arsitektur, konvensi, keputusan.
- [`docs/README-ANALISIS-OPENSID.md`](docs/README-ANALISIS-OPENSID.md) — indeks
  hasil analisis sistem lama (laporan utama + 13 lampiran).
- [`docs/`](docs/) — laporan analisis, ERD, matriks modul, `openapi.yaml`,
  draf skema & skrip impor data.

## Peta Jalan

1. **Fondasi** ✅ — auth, RBAC, kerangka admin, lapisan data, irisan Wilayah.
2. Impor katalog penuh 137 modul + matriks akses dari OpenSID.
3. Migrasi data master (penduduk, keluarga, wilayah, surat).
4. Modul berikutnya: Kependudukan → Keluarga → Persuratan → Keuangan.
5. Ekspor/impor (exceljs/pdf-lib), peta, dan lampiran berkas.
