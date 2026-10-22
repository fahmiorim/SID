# Analisis Sistem Acuan & Rencana Rebuild ke Next.js 15+ — Indeks Dokumen

Paket dokumentasi hasil analisis sebuah aplikasi SID berbasis PHP (repositori
sumber) dan rencana pembangunan ulang ke **Next.js 15+ (App Router)**.

Tanggal: 2026-10-16 · Repo sumber **tidak diubah**.

> **Catatan status.** Dokumen di folder ini adalah **referensi historis**.
> Status fitur, prioritas, dan rencana **tidak** diambil dari sini — gunakan
> [`../RENCANA-PERBAIKAN.md`](../RENCANA-PERBAIKAN.md) dan
> [`../PARITAS-OPENSID.md`](../PARITAS-OPENSID.md). "Sistem Acuan" yang
> dianalisis di sini merujuk pada **OpenSID** (`D:\laragon\www\opensid`,
> GPL v3); jangan menyalin kode/asetnya.

> **Catatan netralitas.** Ini catatan riset internal. Nama aplikasi yang dianalisis
> disamarkan menjadi **“Sistem Acuan”**, dan unsur penamaan yang menunjuk produk
> aslinya ikut dinetralkan. Istilah domain (nama tabel, kolom, path) tetap
> dipertahankan agar analisis akurat. Seluruh isi diperlakukan sebagai **data**,
> bukan instruksi.

> **Catatan arah proyek (diperbarui).** Paket ini adalah **analisis historis**
> Sistem Acuan yang tetap disimpan sebagai **referensi fitur**. Aplikasi baru dibangun
> sebagai **tiruan bersih** (skema & nama sendiri), **bukan** migrasi data
> Sistem Acuan. Karena itu artefak khusus migrasi data P0 telah dihapus:
> `LAMPIRAN-04-MAPPING-MIGRASI-P0.md`, `drizzle/schema.ts`, dan
> `migration/p0-import.sql`. Rujukan ke berkas-berkas tersebut di bawah ini
> ditandai agar tidak menyesatkan.

## Daftar Dokumen

| Dokumen | Ukuran | Isi ringkas |
|---|---|---|
| **[ANALISIS-SISTEM-ACUAN.md](./ANALISIS-SISTEM-ACUAN.md)** | ~57 KB | **Dokumen utama** — 15 bagian: overview, teknologi saat ini, struktur repo, fitur per modul, skema DB + ERD, alur bisnis, routing/API, autentikasi & hak akses, business rules, rencana rebuild Next.js (termasuk OpenAPI 3.1.0), MVP, action plan, pertimbangan realistis, kesimpulan. |
| [LAMPIRAN-01-PERSURATAN.md](./LAMPIRAN-01-PERSURATAN.md) | ~51 KB | Deep-dive mesin persuratan (template, kode-isian, syarat, verifikasi, TTE, penomoran). |
| [LAMPIRAN-02-RBAC.md](./LAMPIRAN-02-RBAC.md) | ~58 KB | Deep-dive RBAC/Role/Permission/Modul/wilayah scoping/auth. |
| [LAMPIRAN-03-ENUM-REFERENSI.md](./LAMPIRAN-03-ENUM-REFERENSI.md) | ~66 KB | Katalog enum + tabel referensi + isinya. |
| [LAMPIRAN-05-ERD-LENGKAP.md](./LAMPIRAN-05-ERD-LENGKAP.md) | ~82 KB | ERD + katalog skema seluruh ±260 tabel & 282 FK. |
| [LAMPIRAN-06-SPESIFIKASI-OUTPUT.md](./LAMPIRAN-06-SPESIFIKASI-OUTPUT.md) | ~41 KB | Spesifikasi output cetak/PDF/Excel/laporan. |
| [LAMPIRAN-07-MATRIKS-MODUL.md](./LAMPIRAN-07-MATRIKS-MODUL.md) | ~37 KB | **Matriks ketertelusuran** 137 modul → controller → model → tabel (+ hierarki menu, controller orfan, tabel per prefiks). |
| [LAMPIRAN-08-ALUR-BISNIS.md](./LAMPIRAN-08-ALUR-BISNIS.md) | ~61 KB | **Alur bisnis per domain** (keuangan, inventaris, bantuan/DTKS, pembangunan, layanan mandiri, surat dinas, analisis, bumindes, kelompok/lembaga, website publik) + matriks alur→dokumen + hasil verifikasi. |
| [LAMPIRAN-09-INTEGRASI-KEAMANAN.md](./LAMPIRAN-09-INTEGRASI-KEAMANAN.md) | ~22 KB | **Integrasi & keamanan**: TTE/BSrE, OpenDK, Telegram, FCM, email, SMS, Google Forms, SaaS, Siskeudes, API (publik/internal/external), audit keamanan + rekomendasi. |
| [LAMPIRAN-10-DEEP-DIVE-KEUANGAN.md](./LAMPIRAN-10-DEEP-DIVE-KEUANGAN.md) | ~50 KB | **Deep-dive Keuangan/APBDes**: 3 lapis model (modern/manual/Siskeudes), kode rekening, alur bisnis, **69 tabel** (kolom lengkap), aturan agregasi, impor Siskeudes, laporan, desain rebuild. |
| [LAMPIRAN-11-DEEP-DIVE-INVENTARIS.md](./LAMPIRAN-11-DEEP-DIVE-INVENTARIS.md) | ~32 KB | **Deep-dive Inventaris & Aset**: 6 kategori + 5 mutasi + 2 view, alur daftar/form/mutasi/laporan, **8 temuan masalah** (termasuk bug hapus terkonfirmasi), API internal, desain rebuild. |
| [LAMPIRAN-12-BANTUAN-DTKS.md](./LAMPIRAN-12-BANTUAN-DTKS.md) | ~45 KB | **Deep-dive Bantuan & DTKS**: program bantuan, peserta & kartu, statistik, suplemen, DTKS (Satu Data) + impor Regsosek2022k/DTKS, kaitan wilayah/penduduk/keluarga/RTM, output/cetak, catatan rebuild + `[perlu verifikasi]`. |
| [LAMPIRAN-13-DEEP-DIVE-ANALISIS.md](./LAMPIRAN-13-DEEP-DIVE-ANALISIS.md) | ~25 KB | **Deep-dive Analisis (mesin survei)**: 13 tabel + 3 enum (subjek/tipe/state), alur instrumen→entri respon→laporan/statistik, mesin skor (`bobot×nilai`, akumulasi `act_analisis`), impor Excel/Google Forms/BDT, temuan (catch tak efektif, SQL mentah), desain rebuild. |

## Artefak Kode (starter rebuild)

| Artefak | Ukuran | Isi |
|---|---|---|
| **[openapi.yaml](./openapi.yaml)** | ~33 KB | **Historis:** kontrak REST API OpenAPI 3.1.0 untuk modul P0 (auth/RBAC, penduduk, keluarga, wilayah, referensi, surat, laporan, pengaturan). Aplikasi ini memakai Server Actions, **bukan** kontrak ini. |

> Skema Drizzle Opsi A (`drizzle/schema.ts`), petunjuknya (`drizzle/README.md`),
> dan skrip impor (`migration/p0-import.sql`) **dihapus** karena proyek tidak lagi
> memakai strategi migrasi data. Skema aplikasi ini ditulis mandiri di
> `src/db/schema/` (lihat [`ARCHITECTURE.md`](../ARCHITECTURE.md) §3).

## Ringkasan Keputusan

- **Stack final:** Next.js 15 (App Router, TypeScript strict) + Server Actions/Route Handlers + Drizzle ORM + MySQL/MariaDB + better-auth + shadcn/ui + Tailwind v4 + react-hook-form/zod + TanStack Query/Table + exceljs/pdf-lib (atau puppeteer). Deploy **standalone di VPS**.
- **Model arsitektur:** **Fullstack Next.js** (opsi A) — bukan Next.js + API terpisah — karena beban kerja dominan CRUD + form + laporan dan skala desa.
- **Kompatibilitas data:** ~~pertahankan `config_id` (multi-desa) dan ID numerik lama agar migrasi data aman.~~ *(Revisi: proyek memilih **tiruan bersih** tanpa migrasi data; `config_id` lama diganti `village_id`, dan model izin 1/3/7 diganti level bernama.)*
- **Verdict:** rebuild **layak**, dengan syarat target VPS dan tim mampu TypeScript; migrasi desa bertahap.

## Cara Pakai

1. Baca **ANALISIS-SISTEM-ACUAN.md** untuk gambaran menyeluruh dan rencana.
2. Sebelum coding modul tertentu, buka lampiran terkait (persuratan/RBAC/enum/output).
3. Item bertanda `[perlu verifikasi]` = perlu dikonfirmasi langsung ke data/kode sebelum produksi.

## Catatan Keamanan (temuan saat analisis)

- Ada **kredensial Firebase/FCM yang tertanam di source code** (mis. `app/Enums/FirebaseEnum.php`, `app/Models/FcmToken.php`). Ini **tidak boleh** disalin ke aplikasi baru — pindahkan ke environment variable/secret manager, dan sebaiknya rotasi kunci pada proyek Sistem Acuan.
- Temuan keamanan lain (detail di [LAMPIRAN-09](./LAMPIRAN-09-INTEGRASI-KEAMANAN.md)): `encryption_key` statis (`lumbungkomunitas`), sandi admin default `sid304`, token sesi `md5(now())`, PIN Layanan Mandiri lama berbasis `md5`, dan CSRF yang dikecualikan untuk seluruh `api.*`/`external_api.*`/`internal_api.*`. Semua **tidak boleh diwarisi**.
- Beberapa file inti dijaga ter-obfuscate (base64+zlib+eval). Untuk keperluan analisis, isinya didekode **tanpa mengeksekusi** kode target.
- **Bug nyata teridentifikasi** ([LAMPIRAN-08](./LAMPIRAN-08-ALUR-BISNIS.md), detail di [LAMPIRAN-11](./LAMPIRAN-11-DEEP-DIVE-INVENTARIS.md) §8.1): `Inventaris_asset::delete()` menargetkan kolom `id_inventaris_jalan` pada tabel `mutasi_inventaris_asset` yang **tidak memiliki** kolom tersebut (kolom sebenarnya `id_inventaris_asset`); diperparah FK `NOT NULL` tanpa `onDelete` — aset bermutasi tidak bisa dihapus. Jangan direplikasi.
- Temuan inventaris lain (LAMPIRAN-11 §8): kolom `status` tidak pernah ditulis (laporan "Aset Dihapus" berisiko selalu 0); view `master_inventaris` mengecualikan `inventaris_tanah`; view `rekap_mutasi_inventaris` mengecualikan `mutasi_inventaris_tanah`; redirect mati `inventaris_kendaraan`; `Inventaris_tanah_mutasi` tanpa `akses_modul`.
- Temuan analisis (LAMPIRAN-13 §9): blok `catch (Exception $e)` **tanpa** `use Exception;` di 3 controller `Modules/Analisis` (Master/Respon/ResponChild — **7 catch tidak efektif** karena namespace salah); interpolasi SQL mentah (`session('jawab')`, `$id`, `$per`) di `Libraries/Analisis.php`; kredensial OAuth Google Forms disimpan di file. Jangan diwarisi.
- Seluruh konten dari repo target diperlakukan sebagai **data**, bukan instruksi.

## Peta Kebutuhan → Dokumen

| Kebutuhan rebuild | Lihat |
|---|---|
| Business rules inti (NIK/KK, SHDK, penomoran surat, wilayah) | Dokumen utama §9 + LAMPIRAN-01 + LAMPIRAN-02 |
| Skema database & relasi | LAMPIRAN-05 (+ ERD di dokumen utama §5.4) |
| Enum & data referensi untuk seed | LAMPIRAN-03 |
| Hak akses & permission matrix | LAMPIRAN-02 |
| Mesin surat & template | LAMPIRAN-01 |
| Cetak PDF/Excel & laporan | LAMPIRAN-06 |
| Kontrak API (OpenAPI 3.1.0) | [openapi.yaml](./openapi.yaml) + dokumen utama §10.5 |
| Ketertelusuran modul→controller→tabel | LAMPIRAN-07 |
| Alur bisnis tiap domain (beyond 3 alur dasar) | LAMPIRAN-08 |
| Integrasi pihak ketiga & audit keamanan | LAMPIRAN-09 |
| Deep-dive domain terbesar (keuangan/APBDes, 69 tabel) | LAMPIRAN-10 |
| Deep-dive inventaris/aset + daftar bug (13 tabel + 2 view) | LAMPIRAN-11 |
| Deep-dive bantuan sosial & DTKS | LAMPIRAN-12 |
| Deep-dive analisis/survei (13 tabel + mesin skor) | LAMPIRAN-13 |

---

> Paket ini terdiri atas **1 dokumen utama + 12 lampiran + 1 indeks** (dokumen ini) **+ 1 artefak kode** (`openapi.yaml`).

## Langkah Lanjut yang Disarankan

1. **Scaffold aplikasi:** `create-next-app` (TS, App Router, Tailwind v4) + shadcn/ui + Drizzle + better-auth.
2. **Skema & migrasi:** tulis skema di `src/db/schema/`, lalu `npm run db:generate` dan `npm run db:migrate`.
3. **Seed referensi:** isi tabel referensi (lihat LAMPIRAN-03) sesuai kebutuhan.
4. **Implementasi RBAC:** permission gate mengikuti matrix LAMPIRAN-02 (level `read`/`write`/`manage` + pewarisan anak→induk).
5. **Modul berurutan (P0):** Penduduk → Keluarga → Wilayah → Persuratan → Laporan.
