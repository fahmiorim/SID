# Arsitektur & Konvensi

Dokumen ini menjelaskan **cara kode ini disusun** dan **mengapa**. Tujuannya agar
kontributor berikutnya (manusia atau AI) menambahkan modul baru tanpa menebak.

> Peta seluruh dokumentasi ada di [`README.md`](./README.md). Status fitur dan
> prioritas **tidak** diambil dari dokumen ini — gunakan
> [`RENCANA-PERBAIKAN.md`](./RENCANA-PERBAIKAN.md) dan
> [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).

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
4. **Skema dirancang sendiri.** Tidak ada ketergantungan pada skema atau data
   sistem lain; nama tabel/kolom ditentukan demi kejelasan, bukan demi
   kompatibilitas (lihat §3).
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
| `forms.ts`           | Primitif formulir murni: sentinel `NO_SELECTION`, skema zod potongan (teks/tanggal/id/angka), tipe pilihan select. |
| `errors.ts`          | `AppError` dengan kode + status HTTP.                             |
| `logger.ts`          | Logger JSON; menelusuri `Error.cause` (mis. galat MySQL).         |

Fitur yang sudah dibangun saat ini:

| Fitur            | Isi ringkas                                                            |
| ---------------- | ---------------------------------------------------------------------- |
| `wilayah`        | Wilayah administratif (dusun/RW/RT) + `listWilayahOptions`.            |
| `penduduk`       | Data penduduk + katalog referensi + `getPendudukSuratData`.           |
| `keluarga`       | Kartu Keluarga; kepala keluarga **diturunkan** dari anggota.           |
| `rumah-tangga`   | Rumah Tangga (RTM), nomor otomatis, kelas sosial & BDT, anggota.       |
| `kelompok`       | Kelompok masyarakat & lembaga desa (single-table inheritance), kategori, keanggotaan berjabatan. |
| `bantuan`        | Program bantuan, peserta penduduk/KK/RTM, snapshot kartu, sebaran wilayah. |
| `inventaris`     | Aset desa, kategori, mutasi/penghapusan, persetujuan berjenjang.       |
| `bumindes`       | BUMDes: unit usaha (buku) dan item/katalog.                            |
| `layanan-mandiri`| Permohonan surat warga (backend + action). Halaman admin kini di `/permohonan-surat`; rute publik `/layanan-mandiri` milik warga (UI login NIK+PIN belum dibangun). |
| `desa`           | Identitas desa (termasuk nama & NIP kepala desa).                     |
| `rbac`           | Role, matriks izin, `computeEffectivePermissions`.                    |
| `modul`          | Katalog modul/menu (pohon `parent_id`).                               |
| `pengguna`       | Manajemen pengguna (di atas tabel better-auth).                       |
| `surat`          | Persuratan: jenis/klasifikasi/syarat, surat layanan, agenda masuk/keluar, verifikasi berjenjang, cetak & PDF. |
| `keuangan`       | APBDes: pohon rekening, pagu & realisasi, agregasi induk, laporan RP APBDes, realisasi per bidang, grafik, ekspor CSV/Excel, arsip dokumen, triwulan. |
| `navigation`     | Menu sidebar dari modul + izin efektif.                               |
| `auth`           | Login/logout staf (username) + pelacakan login terakhir.               |

> Cakupan & batasan tiap modul dirinci di README. Status paritas dan prioritas
> ada di [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md) dan
> [`RENCANA-PERBAIKAN.md`](./RENCANA-PERBAIKAN.md); dokumen di `docs/riset/`
> hanya **referensi historis**.

### Aturan penting

- **`infrastructure` tidak pernah diimpor `presentation`.** Halaman & aksi
  memanggil *use case*, bukan *repository*.
- **`domain` tidak mengimpor apa pun dari aplikasi** selain zod dan primitif
  murni dari `src/lib/forms.ts`.
- **Ketergantungan antar-fitur searah.** Fitur yang secara domain memakai data
  fitur lain boleh mengimpornya (mis. `keluarga` → `penduduk`), dan pengetahuan
  tentang sebuah tabel tetap dipegang pemiliknya (mis. opsi wilayah dibaca lewat
  `listWilayahOptions` milik fitur `wilayah`, bukan query ulang per fitur).
- `import "server-only"` ditambahkan pada modul yang menyentuh DB / sesi
  (`dal.ts`, use case, repository) agar tidak pernah ikut ke bundel client.

---

## 3. Konvensi Lapisan Data

- **ORM:** Drizzle + driver `mysql2`. Skema di `src/db/schema/`, dipisah per
  domain (`auth.ts`, `rbac.ts`, `village.ts`, `region.ts`, `reference.ts`,
  `resident.ts`, `family.ts`, `rumah-tangga.ts`, `kelompok.ts`, `bantuan.ts`,
  `inventaris.ts`, `bumindes.ts`, `survey.ts`, `letters*.ts`,
  `permohonan-surat.ts`, `keuangan.ts`) dan digabung di `index.ts`.
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
| Penduduk  | `residents`                                      | numerik |
| Keluarga  | `families`                                       | numerik |
| Rumah Tangga | `rtm`                                         | numerik |
| Kelompok  | `kelompok_master`, `kelompok`, `kelompok_anggota` | numerik |
| Bantuan   | `bantuan_program`, `bantuan_peserta`             | numerik |
| Inventaris | `inventaris_kategori`, `inventaris`, `inventaris_mutasi` | numerik |
| BUMDes    | `bumindes_buku`, `bumindes_item`                 | numerik |
| Survei    | `survey`, `survey_soal`, `survey_responden`, `survey_jawaban` | numerik |
| Persuratan | `letter_types`, `letter_classifications`, `letter_requirements`, `letters`, `incoming_letters`, `outgoing_letters`, `permohonan_surat` | numerik |
| Keuangan  | `keuangan_template`, `keuangan`, `keuangan_triwulan`, `keuangan_laporan` | numerik / uuid string |
| Referensi | `religions`, `educations`, `occupations`, `marital_statuses`, `family_relations`, `blood_types`, `citizenships` | numerik |

Tabel identitas memakai **plural khas better-auth** dengan id string yang
dikelola better-auth. Tabel lain dirancang mandiri: `roles` (dulu `user_grup`),
`modules` (dulu `setting_modul`), `role_permissions` (dulu `grup_akses`), dan
`villages` (dulu `config`). Kunci antar-tabel memakai `village_id` (tenant).

Tabel **referensi** bersifat global (tanpa `village_id`) karena isinya baku
secara nasional; `id`-nya diisi eksplisit dan stabil agar cocok dengan kode
resmi (mis. `religions.id = 1` → ISLAM). Semuanya diisi seeder (`npm run db:seed`)
secara idempoten. `residents.national_id` unik **per desa** — beberapa baris
boleh ber-NIK kosong karena indeks unik MySQL mengizinkan banyak `NULL`.

Keanggotaan keluarga **tidak** diduplikasi: `residents.family_id` menunjuk
`families.id`, dan **kepala keluarga diturunkan** dari anggota yang punya
`family_relations.id = 1` (KEPALA KELUARGA) — tidak ada kolom kepala tersendiri
yang bisa berbeda dari data anggotanya. Menghapus KK melepas tautan
(`ON DELETE SET NULL`) tanpa menghapus penduduk.

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
- **Select Radix menolak `value=""`,** jadi "belum dipilih" dikirim sebagai
  sentinel `NO_SELECTION` (`src/lib/forms.ts`) dan skema zod mengubahnya kembali
  menjadi `null` (`optionalSelectId`/`optionalIsoDate`).
- Aksi yang hanya **membaca data untuk dialog** (mis. rincian anggota KK) tidak
  memakai `ActionState`; ia mengembalikan hasil bertipe (`{ ok, … }`) dan tetap
  ditegakkan izinnya di use case.

---

## 6. Konvensi UI

- Komponen shadcn/ui ada di `src/components/ui/` — **jangan disunting gayanya**
  secara manual; kalau perlu varian baru, tambahkan di komponennya secara sadar.
- `cn` berasal dari paket **`cn`** (pengganti clsx + tailwind-merge, tanpa
  dependensi). `src/lib/utils.ts` hanya me-re-export.
- Komponen bersama di `src/components/shared/`:
  - `ModuleGuard` — gerbang izin halaman (server component) untuk halaman yang
    tidak membutuhkan data pengguna lain.
  - `NoAccess` — tampilan "Akses ditolak".
  - Halaman yang juga membutuhkan `user` (mis. untuk menentukan tombol aksi)
    memanggil `verifySession()` lalu `hasPermission()` langsung; `getCurrentUser`
    di-cache per permintaan sehingga tidak menambah query.
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
| Autentikasi via username (plugin better-auth)    | Operator desa terbiasa login dengan username; email opsional.          |
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
7. **Halaman:** `src/app/(admin)/bantuan/page.tsx` — panggil `verifySession()`,
   lalu tampilkan `NoAccess` bila `hasPermission(user.permissions,
   RESOURCES.bantuan, "read")` gagal. Bila halaman tidak butuh data pengguna,
   bungkus dengan `ModuleGuard` (`resource={RESOURCES.bantuan}`).
8. **Seeder:** tambahkan modul ke `modules.ts`; jalankan `npm run db:seed`.
9. **Verifikasi:** `npm run check` lalu `npm run build`.

Catatan: bila modul membutuhkan **data acuan** (enum/katalog), buat tabelnya di
`src/db/schema/reference.ts` (global, tanpa `village_id`, `id` eksplisit), isi
datanya di `src/db/seed/data/`, lalu daftarkan penyisipan idempotennya di
`src/db/seed/index.ts` — pola yang dipakai modul Penduduk.

Bila modul butuh **opsi dari fitur lain** (mis. daftar wilayah atau daftar KK
untuk sebuah select), panggil pembaca milik pemilik datanya — jangan menulis
query ulang. Yang sudah ada: `listWilayahOptions(villageId)` (fitur `wilayah`)
dan `getPendudukReferenceData(villageId)` (fitur `penduduk`).

---

## 10. Multi-Tenant, Web Publik & Tema (target)

Bagian ini adalah **arah arsitektur** untuk Fase 1 dan Fase 4; belum semua
diimplementasikan. Statusnya ada di
[`RENCANA-PERBAIKAN.md`](./RENCANA-PERBAIKAN.md).

### Route group

- `(public)` — situs desa: `/` (beranda), `/desa/*`, dan `/layanan-mandiri`
  (halaman informasi/CTA warga). **Sudah berjalan.**
- `(warga)` — *belum ada*: login NIK + PIN dan dasbor warga di
  `/layanan-mandiri/*` (rencana Fase 2).
- `(admin)` — panel staf di `/beranda` dan modulnya. Permohonan surat warga ada
  di `/permohonan-surat`.
- `(auth)` — `/masuk` untuk staf.

Root `/` adalah beranda publik, bukan redirect ke login. `/beranda` tetap admin.
Rute admin lama `/layanan-mandiri` sudah dipindah ke `/permohonan-surat`, dan
slug resource RBAC-nya kini `permohonan-surat` (dulu `layanan-mandiri`).

### Resolusi desa (tenant)

- `resolveVillageByHost(host)` membaca `villages.domain` (unik). Di produksi
  jangan mengandalkan `orderBy(id).limit(1)`; fallback hanya dipakai bila
  instalasi benar-benar satu desa (`countVillages() === 1`) atau untuk fallback
  admin. Bila ada >1 desa dan host tak dikenal → 404.
- Halaman publik: `villageId` berasal dari **host**.
- Halaman admin/warga: `villageId` berasal dari **sesi** pengguna.
- Setiap repository yang menyentuh data desa **wajib** menerima `villageId` dan
  memasukkannya ke `WHERE`.
- `getIdentitas()` menjadi `getIdentitas(villageId)`.

### Warga

- Login NIK + PIN (6 digit) mengikuti perilaku OpenSID, bukan email/username.
- Akun warga dibuat operator (tanpa pendaftaran mandiri), dengan `resident_id` +
  `must_change_pin`; PIN direset operator.
- `users` tetap dipakai better-auth; identitas warga ditautkan ke `residents`.

### Tema publik

- Tema **dikompilasi saat build** di `src/themes/<slug>` dengan manifest.
- Tema aktif + opsi (warna, logo, menu) disimpan di DB per desa.
- Unggah ZIP tema saat runtime **ditolak**: mengeksekusi kode/aset tak tepercaya
  dan tidak kompatibel dengan build Next.js.
- Konten berita memakai HTML tervalidasi + sanitizer di server sebelum disimpan
  dan sebelum dirender.

### Batas keamanan

- Jangan menerima `villageId` dari body/query klien.
- Semua action tetap memeriksa izin di use case, termasuk action warga.

---

## 11. QA & Verifikasi

`npm run check` menjalankan typecheck, lint, cek format, **dan pengujian unit**.
Sebelum sebuah perubahan dianggap selesai, pastikan juga:

- `npm run build` berhasil.
- Perubahan otorisasi diuji untuk **dua peran**: super admin dan peran terbatas
  (menu yang tampil serta akses langsung ke URL modul yang tidak diizinkan).
- Perubahan skema disertai berkas migrasi yang ikut di-commit.

### Pengujian

- Perkakas: **Vitest** (`vitest.config.mts`), berkas uji bernama `*.test.ts`
  bersebelahan dengan sumbernya.
- Cakupan sasaran: **logika murni** — aturan domain, utilitas, dan validasi.
  Jangan menguji lapisan `infrastructure`/`presentation` yang butuh database,
  sesi, atau `next/headers`; itu diuji lewat smoke test HTTP.
- Karena `src/lib/env.ts` memvalidasi environment saat impor, variabel wajib
  disuplai lewat `test.env` di konfigurasi Vitest.
- CI (`.github/workflows/ci.yml`) menjalankan `npm run check` + `npm run build`
  pada setiap push/PR.

Perkakas browser otomatis (`chrome-devtools` MCP) tidak selalu tersedia; skrip
smoke test berbasis HTTP di direktori sementara dapat dipakai sebagai gantinya.
