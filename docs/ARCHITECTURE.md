# Arsitektur & Konvensi

Dokumen ini menjelaskan **cara kode ini disusun** dan **mengapa**. Tujuannya agar
kontributor berikutnya (manusia atau AI) menambahkan modul baru tanpa menebak.

---

## 1. Prinsip

1. **Batasan antar-lapisan ditegakkan tipe, bukan disiplin.** Arah dependensi
   selalu satu arah: `presentation → application → domain`, dengan
   `infrastructure` diimplementasikan untuk `domain`/`application`.
2. **Otorisasi ada di dalam logika, bukan di UI.** Setiap use case memeriksa izin
   sendiri, sehingga pemanggil mana pun (Server Action, Route Handler, skrip)
   otomatis terlindungi. Pemeriksaan izin di halaman hanya untuk UX.
3. **Satu sumber kebenaran.** Environment divalidasi sekali (`src/lib/env.ts`),
   slug modul dipusatkan (`src/features/rbac/domain/resources.ts`), nama
   aplikasi di `src/lib/app-config.ts`.
4. **Tiruan bersih, bukan migrasi.** Aplikasi ini adalah reimplementasi fitur
   OpenSID; skema dirancang sendiri (lihat §3) tanpa terikat nama tabel/kolom
   sistem lama. Dokumen analisis OpenSID hanya dipakai sebagai **referensi fitur**.
5. **Dokumen riset hanya di `docs/`.** Akar repositori dijaga tetap rapi.

---

## 2. Struktur per-Fitur

Setiap domain hidup di `src/features/<fitur>/` dan memakai lapisan sesuai
kebutuhan (tidak semua fitur butuh keempatnya):

```
features/wilayah/
├─ domain/         # tipe, skema zod, aturan murni (tanpa I/O)
│  └─ wilayah.ts
├─ infrastructure/ # akses database (Drizzle) — satu-satunya yang menyentuh `db`
│  └─ wilayah-repository.ts
├─ application/    # use case: orkestrasi + OTORISASI
│  └─ use-cases.ts
└─ presentation/   # Server Actions + komponen (untuk fitur ini)
   ├─ actions.ts
   └─ components/*.tsx
```

Lapisan bersama (lintas-fitur) tinggal di `src/lib/`:

| Berkas               | Tanggung jawab                                                    |
| -------------------- | ----------------------------------------------------------------- |
| `env.ts`             | Validasi `process.env` saat start (fail fast). Tanpa `server-only` agar bisa dipakai skrip. |
| `app-config.ts`      | Nama & deskripsi aplikasi (aman dipakai server maupun client).   |
| `auth.ts`            | Konfigurasi better-auth (server).                                 |
| `auth-client.ts`     | Klien better-auth (browser).                                      |
| `dal.ts`             | **Satu-satunya** pintu sesi/pengguna/izin di server.              |
| `action-state.ts`    | Bentuk state Server Action + helper sukses/galat.                 |
| `errors.ts`          | `AppError` dengan kode + status HTTP.                             |
| `logger.ts`          | Logger JSON; menelusuri `Error.cause` (mis. galat MySQL).         |

### Aturan penting

- **`infrastructure` tidak pernah diimpor `presentation`.** Halaman & aksi
  memanggil *use case*, bukan *repository*.
- **`domain` tidak mengimpor apa pun dari aplikasi** selain zod.
- `import "server-only"` ditambahkan pada modul yang menyentuh DB / sesi
  (`dal.ts`, use case, repository) agar tidak pernah ikut ke bundel client.

---

## 3. Konvensi Lapisan Data

- **ORM:** Drizzle + driver `mysql2`. Skema di `src/db/schema/`, dipisah per
  domain (`auth.ts`, `rbac.ts`, `village.ts`, `region.ts`) dan digabung di
  `index.ts`.
- **Koneksi:** satu pool di `src/db/index.ts`; dipatok ke `globalThis` saat
  non-produksi agar tidak bocor saat HMR.
- **Impor modul DB wajib lewat `@/db`** — tidak ada `mysql2` mentah di fitur.
- **`datetime` → `timestamp`.** MySQL `datetime` tidak mendukung `defaultNow()`;
  kolom waktu memakai `timestamp` agar dapat dibuat otomatis.
- **`mysql2` + Drizzle memerlukan `mode: "default"`** pada `drizzle(pool, …)`.
- **`noUncheckedIndexedAccess` aktif.** Hasil array diakses dengan
  `rows[0]?.x ?? fallback`; hindari non-null assertion (`!`).
- **`$returningId()`** mengembalikan `[{ id }]`; bungkus lewat helper kecil
  (seeder memakai `unwrap`) agar tidak ada `undefined` liar.
- **Zod untuk batas sistem.** Input dari formulir divalidasi zod di
  `domain/*.ts`; tipe TypeScript diturunkan dari skema (`z.infer`), bukan
  ditulis dua kali.

### Nama Tabel & Kolom

Bahasa **Inggris** untuk lapisan data (tabel & kolom), sedangkan kode domain dan
antarmuka tetap berbahasa **Indonesia**. Pemetaan antar keduanya terjadi di
lapisan `infrastructure` (repository), sehingga kosakata produk tetap utuh tanpa
membocorkan detail penyimpanan ke lapisan atas.

Istilah administratif yang tidak punya padanan baku (`dusun`, `rw`, `rt`)
dipertahankan apa adanya.

| Domain    | Tabel                                            | Id      |
| --------- | ------------------------------------------------ | ------- |
| Identitas | `users`, `sessions`, `accounts`, `verifications` | string  |
| Desa      | `villages`                                       | numerik |
| RBAC      | `roles`, `modules`, `role_permissions`           | numerik |
| Wilayah   | `regions`                                        | numerik |

Tabel identitas memakai **plural khas better-auth** dengan id string yang
dikelola better-auth. Tabel lain dirancang mandiri: `roles` (dulu `user_grup`),
`modules` (dulu `setting_modul`), `role_permissions` (dulu `grup_akses`), dan
`villages` (dulu `config`). Kunci antar-tabel memakai `village_id` (tenant).

---

## 4. Model RBAC

- Tingkat akses bernama per (role × modul), disimpan di `role_permissions.access`:
  `read` (lihat), `write` (lihat + tambah/ubah), `manage` (semuanya, termasuk
  hapus). Definisi & helper ada di `src/features/rbac/domain/permission.ts`.
- `hasPermission(permissions, resource, action)` dengan `action` ∈
  `read | update | delete`. `read` butuh ≥ `read`, `update` butuh ≥ `write`,
  `delete` butuh `manage`.
- **Super admin** = role dengan `slug === "administrator"`; semua pemeriksaan
  dilewati.
- **Modul `beranda` selalu dapat dibaca.**
- **Pewarisan anak→induk:** bila minimal satu anak punya akses, modul grup
  induknya otomatis dapat dibaca agar grup menunya ikut tampil (tingkat anak
  tidak dinaikkan).
- Izin efektif dihitung sekali per permintaan (`computeEffectivePermissions`
  dibungkus `cache()` React).
- Slug resource dipusatkan di `src/features/rbac/domain/resources.ts` dan
  **wajib sama** dengan `modules.slug`.

---

## 5. Konvensi Server Action & Formulir

- Semua aksi ber-`"use server"`, menerima `(_previousState: ActionState, formData: FormData)`
  dan mengembalikan `ActionState`.
- Hasil aksi selalu lewat helper di `src/lib/action-state.ts`; kesalahan zod
  dipetakan ke `fieldErrors` via `zodToFieldErrors`.
- **Pesan galat ke pengguna harus ramah dan tidak membocorkan detail internal.**
  Detail teknis masuk log (`logger.error`), bukan ke UI.
- Formulir memakai `useActionState` + `<form action={…}>` (progressive
  enhancement, tetap berfungsi tanpa JavaScript).
- Mengganti/menghapus data yang bergantung pada hasil aksi segera: pakai
  `startTransition` + pemanggilan aksi langsung, **hindari `setState` di dalam
  `useEffect`** (aturan React 19 `react-hooks/set-state-in-effect`).
- Setelah mutasi: `revalidatePath` pada halaman terkait.
- Arahkan pengguna lewat `redirect()` hanya setelah validasi tujuan
  (lihat `safeRedirectTarget`).

---

## 6. Konvensi UI

- Komponen shadcn/ui ada di `src/components/ui/` — **jangan disunting gayanya**
  secara manual; kalau perlu varian baru, tambahkan di komponennya secara sadar.
- `cn` berasal dari paket **`cn`** (pengganti clsx + tailwind-merge, tanpa
  dependensi). `src/lib/utils.ts` hanya me-re-export.
- Komponen bersama di `src/components/shared/`:
  - `ModuleGuard` — gerbang izin halaman (server component).
  - `NoAccess` — tampilan "Akses ditolak".
- Semua teks antarmuka **berbahasa Indonesia**.
- Navigasi internal memakai `next/link` (`<Link>`), bukan `<a href>`.

---

## 7. Penamaan & Format

- Berkas & folder: `kebab-case` (`wilayah-form-dialog.tsx`).
- Komponen: `PascalCase`; fungsi/variabel: `camelCase`.
- Tipe/interface: `PascalCase` tanpa prefiks `I`.
- Konstanta: `SCREAMING_SNAKE_CASE`.
- Impor diurutkan otomatis (`@ianvs/prettier-plugin-sort-imports`) dan kelas
  Tailwind diurutkan otomatis (`prettier-plugin-tailwindcss`).
- **Prettier adalah wasit format**; jalankan `npm run format`.
- Commit mengikuti **Conventional Commits** (ditegakkan `commitlint` via hook);
  `lint-staged` menjalankan ESLint + Prettier pada berkas yang diubah.

---

## 8. Keputusan Arsitektur (ringkas)

| Keputusan                                        | Alasan                                                                 |
| ------------------------------------------------ | ---------------------------------------------------------------------- |
| `cacheComponents: false`                         | Aplikasi admin yang selalu dinamis per pengguna nyaris tidak mengambil untung dari caching rute; menghindari kerumitan `use cache`/Suspense. |
| `middleware.ts` → `proxy.ts`                     | Perubahan Next.js 16 (runtime Node).                                   |
| Autentikasi via username (plugin better-auth)    | Meniru kebiasaan login OpenSID; email opsional.                        |
| Lapisan data berbahasa Inggris, domain Indonesia | Konvensi kode/storage yang umum **dan** tetap nyaman bagi tim Indonesia. |
| Akses sebagai level bernama (`read`/`write`/`manage`) | Lebih terbaca daripada kode bitmask; pemetaan ke aksi eksplisit.   |
| Otorisasi di use case, bukan hanya di halaman    | Menutup celah pemanggilan langsung (Route Handler/skrip).              |
| Server Action + `useActionState` (tanpa RHF)     | Satu pola untuk semua formulir, tetap jalan tanpa JavaScript.          |
| Slug modul dipusatkan di `resources.ts`          | Salah ketik slug = celah otorisasi/menu hilang; dipusatkan agar aman.  |

---

## 9. Menambah Modul Baru (resep)

Contoh: modul "Bantuan Sosial" dengan slug `bantuan`.

1. **Katalog & izin:** tambahkan entri di `src/db/seed/data/modules.ts` dan
   `grants` per role di `src/db/seed/data/roles.ts`; tambahkan slug ke
   `RESOURCES` di `src/features/rbac/domain/resources.ts`.
2. **Skema DB:** tambahkan tabel di `src/db/schema/`, lalu
   `npm run db:generate` → `npm run db:migrate`.
3. **Domain:** `src/features/bantuan/domain/bantuan.ts` — tipe + skema zod.
4. **Infrastruktur:** `…/infrastructure/bantuan-repository.ts` — query Drizzle.
5. **Aplikasi:** `…/application/use-cases.ts` — panggil `requirePermission` lalu
   repository.
6. **Presentasi:** `…/presentation/actions.ts` (Server Action) dan
   `…/presentation/components/*` (formulir/tabel).
7. **Halaman:** `src/app/(admin)/bantuan/page.tsx` — bungkus `ModuleGuard`
   (`resource={RESOURCES.bantuan}`).
8. **Seeder:** tambahkan modul ke `modules.ts`; jalankan `npm run db:seed`.
9. **Verifikasi:** `npm run check` lalu `npm run build`.

---

## 10. QA & Verifikasi

`npm run check` menjalankan typecheck, lint, dan cek format. Sebelum sebuah
perubahan dianggap selesai, pastikan juga:

- `npm run build` berhasil.
- Perubahan otorisasi diuji untuk **dua peran**: super admin dan peran terbatas
  (menu yang tampil serta akses langsung ke URL modul yang tidak diizinkan).
- Perubahan skema disertai berkas migrasi yang ikut di-commit.

Perkakas browser otomatis (`chrome-devtools` MCP) tidak selalu tersedia; skrip
smoke test berbasis HTTP di direktori sementara dapat dipakai sebagai gantinya.
