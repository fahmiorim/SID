# Rencana Pembangunan Menyeluruh — SID Desa

Dokumen ini menggantikan urutan rencana sebelumnya. Prioritas mengikuti arahan
produk terbaru:

1. **Web publik dibangun sempurna lebih dulu** — itu wajah aplikasi.
2. **Semua fitur admin yang sudah ada wajib berfungsi penuh.**
3. **Kejar paritas fitur OpenSID** (lihat `docs/PARITAS-OPENSID.md`).
4. **Multi-desa dibangun terakhir**, setelah semua di atas stabil.

Rujukan paritas: `docs/PARITAS-OPENSID.md` (dipetakan dari source OpenSID di
`D:\laragon\www\opensid`).

---

## Asumsi & Keputusan

| # | Keputusan | Catatan |
|---|---|---|
| 1 | Web publik di `/`, admin di `/beranda` | Sesuai keputusan sebelumnya |
| 2 | Konten berita memakai **HTML + sanitizer** | `sanitize-html`, allowlist ketat |
| 3 | Akun warga **dibuat operator** | Sesuai keputusan; tanpa self-register |
| 4 | Login warga **NIK + PIN** | Meniru OpenSID (`controllers/Mandiri.php`); PIN 6 digit, bisa diganti |
| 5 | Tema publik **dipasang di build**, opsi diubah dari admin | Next.js tidak aman memuat kode tema saat runtime |
| 6 | Multi-desa: subdomain `*.desa.id` + dukungan domain kustom | Wildcard DNS + TLS; detail di Fase 5 |
| 7 | Target paritas: **T1 + T2** OpenSID, bukan seluruh modul premium | T3 (lapak, SMS, plugin, OpenDK) opsional |

**Dampak estimasi:** total **±7–8 bulan** untuk satu developer, atau
**±4–5 bulan** dengan dua developer yang bekerja paralel. Ini konsekuensi dari
target "tidak kalah OpenSID" — bukan pekerjaan 2–3 minggu.

---

## Kondisi Awal yang Harus Dibereskan

| Masalah | Bukti | Dampak |
|---|---|---|
| Build gagal | `src/features/surat/domain/isian.test.ts:50` (`TS2532`) | Tidak bisa deploy |
| 95 file belum di-commit | `git status` | Pekerjaan tanpa titik aman |
| Migrasi `0010`–`0016` untracked | `src/db/migrations` | Clone bersih kehilangan tabel |
| Halaman publik diblokir | `src/proxy.ts` hanya mengizinkan `/masuk` | Web publik tidak bisa diakses |
| Root bukan beranda desa | `src/app/page.tsx` redirect | Wajah aplikasi belum ada |
| Asumsi satu desa | `getIdentitasDesa()` = `orderBy(id).limit(1)` | Multi-desa butuh refactor |
| Fitur mati | Inventaris read-only, Layanan Mandiri read-only, Bumindes tanpa form | Menu ada, fungsi tidak |
| Dokumentasi stale | `README.md`, `docs/arsip/MAPPING-RISET-vs-KODE.md` | Menyesatkan |

---

## Fase 0 — Stabilisasi (1 hari)

- [x] **0.1** Perbaiki `isian.test.ts:50` (guard `parsed[0]`).
- [x] **0.2** Audit pola `arr[0]` serupa di seluruh test: tidak ada lagi pola
      `[angka].` yang tidak dijaga.
- [x] **0.3** Commit migrasi `0010`–`0017` + snapshot + `_journal.json`; uji
      `npm run db:migrate` dari DB kosong. (Migrasi & seed terverifikasi lokal:
      `db:migrate` dua kali idempoten, `db:seed` idempoten; job CI
      `migrate` di `.github/workflows/ci.yml` menjaga regresi.)
- [x] **0.4** Commit pekerjaan berjalan, pesan per domain (9 commit:
      db, inventaris, bumindes, layanan-mandiri, persuratan, keuangan,
      kependudukan, publik, docs).
- [x] **0.5** Perbaiki seed `peserta-bantuan` yang silent-skip: grant dihapus
      karena peserta dikelola di dalam modul `program-bantuan`.
- [x] **0.6** Seeder gagal keras bila grant merujuk modul yang tidak ada
      (`replaceGrants` melempar galat berisi slug role + modul).
- [x] **0.7** Konsolidasi dokumentasi: `docs/README.md` sebagai peta, 6 dokumen
      usang diarsipkan ke `docs/arsip/` dengan penanda, `README.md` + `AGENTS.md`
      + `ARCHITECTURE.md` disinkronkan.

**Selesai bila:** `npm run check` + `npm run build` hijau, `git status` bersih.
Status: **SELESAI** — check + build hijau, tree bersih (commit `07268d1`..`98f40c2`).

---

## Fase 1 — Web Publik + Sistem Tema (3–4 minggu)

Tujuan: wajah aplikasi selesai lebih dulu. Semua halaman publik dibangun
strukturnya (dengan empty state), lalu diisi data pada Fase 4.

> **Catatan P1.3 (diperbarui 24 Okt 2026):** halaman publik gelombang 1 memakai
> slot tema; `/desa/apbdes`, `/desa/statistik`, `/desa/dokumen`,
> `/desa/status-des`, `/desa/surat`, `/desa/analisis-survei`, `/desa/idm-sdgs`,
> `/desa/kelompok`, dan `/desa/inventaris` sudah lewat use case. Widget teks
> tampil di beranda; 404/error publik tersedia. **Perbarui 24 Okt:** sisa
> halaman yang masih mengimpor repository langsung telah dirapikan — beranda,
> berita, galeri, profil, pemerintahan, bantuan, dan halaman statis membaca
> lewat use case `features/publik/application/konten-publik.ts`,
> `bantuan/application/publik-use-cases.ts`, dan `pertanahan-publik.ts`
> (tidak ada lagi query `db` mentah di halaman publik). Placeholder
> (pembangunan, peta) tetap menunggu backend; `/desa/pengaduan` sudah memakai
> data 3D. Test integrasi HTTP juga belum ada.

### 1A. Fondasi publik

- [x] **1A.1** Perbaiki `src/proxy.ts`: publik = `/`, `/desa/*`,
      `/layanan-mandiri` (halaman informasi), `/masuk`, plus berkas metadata
      (`/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.svg`);
      sisanya terproteksi. Sejak 2C, `/layanan-mandiri/*` (dasbor warga)
      **wajib sesi**, dan pengalihan pengguna yang sudah login ditangani
      `/masuk` di server agar akun staf dan warga diarahkan ke area berbeda.
- [x] **1A.2** Beranda desa di `src/app/(public)/page.tsx` (redirect dihapus);
      `src/app/page.tsx` lama dihapus, `/desa` dialihkan ke `/`.
- [x] **1A.3** `src/app/(public)/layout.tsx`: header (logo, menu, drawer mobile,
      CTA Layanan Mandiri) + footer (tautan + kontak). *Mode gelap belum*
      (menyusul bersama mesin tema 1D).
- [x] **1A.4** `generateMetadata` per halaman + `sitemap.ts` + `robots.ts` sadar
      host (multi-domain). *JSON-LD belum.*
- [x] **1A.5** Halaman 404/error publik yang rapi:
      `src/app/not-found.tsx` (URL tak cocok), `src/app/(public)/not-found.tsx`
      (hasil `notFound()` dari rute publik, tetap memakai tema desa), dan
      `src/app/(public)/error.tsx` memakai prop `retry` Next 16. Smoke test:
      `/desa/tidak-ada`, `/desa/halaman/tidak-ada`, dan
      `/desa/berita/tidak-ada` mengembalikan status 404.

### 1B. Seam multi-domain (disiapkan, belum diaktifkan)

- [x] **1B.1** Migrasi `villages.domain` (nullable, unique) — `0017`.
- [x] **1B.2** `resolveVillageByHost()` + `getIdentitasFromRequest()` di
      `src/features/desa/application/resolve-village.ts`: normalisasi host →
      exact → alias `www` → fallback **hanya bila instalasi berjumlah satu desa**
      → 404. Normalisasi murni di `domain/host.ts` + test.
- [x] **1B.3** `getIdentitasDesa(villageId)` (wajib argumen); `orderBy(id)`
      tersisa **hanya** di `getFirstVillageId()` untuk fallback admin, bukan di
      jalur publik.
- [x] **1B.4** Semua query publik (beranda, statistik, APBDes, bantuan, profil)
      memfilter `villageId` dari host.
- [x] **1B.5** Media & URL relatif; cache sadar-tenant; cookie per-host.
      URL media dibentuk relatif (`urlMedia` → `/api/publik/media/<villageId>/...`),
      rute media mengirim `Vary: Host` + `X-Content-Type-Options: nosniff`, dan
      cookie sesi dikunci host-only lewat
      `advanced.crossSubDomainCookies.enabled = false` di `src/lib/auth.ts`.
      Halaman publik tetap `force-dynamic` agar tidak berbagi cache antar-host.
- [x] **1B.6** Test isolasi dua desa/dua host: `domain/tenant.test.ts` menguji
      dua domain → dua desa berbeda, host tak dikenal → `null` (404) saat
      multi-desa, fallback hanya untuk instalasi satu desa, serta desa tanpa
      domain tidak membocorkan tenant lain. *(Uji HTTP dua host menyusul.)*

### 1C. Skema konten & media

- [x] **1C.1** Migrasi: `profil_desa`, `perangkat_desa`, `jabatan_perangkat`,
      `berita_kategori`, `berita`, `galeri_album`, `galeri_foto`,
      `menu_publik`, `widget`, `slider`, `dokumen_publik`, `halaman_statis`
      (`src/db/schema/content.ts`, migrasi `0018`).
- [x] **1C.2** Slug unik per desa + helper (`domain/slug.ts`: `buatSlug`,
      `slugUnik`; unique index `(village_id, slug)` di DB).
- [x] **1C.3** `media-storage.ts` (pola `laporan-storage.ts`) +
      `/api/publik/media/[...path]` (sadar-tenant: segmen pertama wajib
      sama dengan `villageId` host; tolak traversal).
- [x] **1C.4** Validasi unggahan: MIME allowlist, batas ukuran, nama acak,
      ekstensi diturunkan dari MIME (`domain/media.ts` + test).
- [x] **1C.5** Seed konten awal (`db/seed/data/konten.ts` + `seedKonten`):
      profil, jabatan + perangkat contoh, kategori berita, satu berita,
      tiga dokumen, menu publik bawaan. Idempoten.

### 1D. Mesin tema (template bisa diubah)

Meniru konsep OpenSID (`storage/app/themes/{esensi,natra}` + `config.json`),
tetapi aman untuk Next.js.

- [x] **1D.1** Migrasi tabel `theme`: `village_id`, `slug`, `nama`, `versi`,
      `sumber`, `aktif`, `opsi` (JSON). *(Migrasi `0019`.)*
- [x] **1D.2** Kontrak tema di `src/features/publik/domain/theme.ts`:
      `ThemeManifest`, `ThemeOptionsSchema` (Zod), daftar slot halaman.
- [x] **1D.3** Struktur folder:
      ```
      src/themes/<slug>/
        manifest.ts        # nama, versi, preview, opsi, slot
        layout.tsx         # header/footer
        pages/
          home.tsx
          profil.tsx
          perangkat.tsx
          berita.tsx
          berita-detail.tsx
          galeri.tsx
          galeri-detail.tsx
          kontak.tsx
          dokumen.tsx
          statistik.tsx
        components/
        theme.css
      ```
      *(Halaman rute hanya mengambil data lalu menyerahkan ke komponen tema;
      kontrak props ada di `src/themes/types.ts`, paket komponen di
      `src/themes/kontrak.ts`.)*
- [x] **1D.4** `src/themes/registry.ts` — peta statis slug → komponen.
      **Tanpa** dynamic import dari input user. *(Slug tak dikenal jatuh ke tema
      bawaan, bukan mengeksekusi apa pun di luar registry.)*
- [x] **1D.5** Dua tema bawaan: `esensi` (bersih, default) dan `natra`
      (modern). Desain orisinal — **jangan salin aset OpenSID (GPL)**.
- [x] **1D.6** Opsi tema: warna primer/sekunder, font, hero, susunan section,
      tampil/sembunyi widget. Disimpan di `theme.opsi`.
- [x] **1D.7** Admin `/konten/tema`: pilih tema, atur opsi, pratinjau,
      aktifkan per desa.
- [x] **1D.8** Batasan yang didokumentasikan: menambah tema baru = tambah
      folder + build/deploy. Unggah ZIP tema saat runtime **tidak didukung**
      (keamanan + model build Next.js). Bila kelak perlu kustomisasi tanpa
      deploy, tambahkan "page builder" berbasis blok, bukan eksekusi kode.
      *(Belum ada pemilih tema di `/pengaturan/modul`; cukup lewat halaman
      `/konten/tema`.)*

### 1E. Halaman publik (gelombang 1 — struktur lengkap)

Mengacu `donjo-app/controllers/fweb/*`:

- [x] `/` beranda: hero, sambutan, berita terbaru, statistik ringkas, slider.
      *(Agenda menyusul.)*
- [x] `/desa/profil`: visi, misi, sejarah, sambutan, koordinat, peta statis.
      *(Peta interaktif GIS menyusul Fase 3B.)*
- [x] `/desa/perangkat`: perangkat + jabatan + foto (SOTK).
- [x] `/desa/berita` + `/desa/berita/[slug]`. *(`/desa/berita/arsip`
      menyusul — daftar berita memakai filter kategori.)*
- [x] `/desa/galeri` + `/desa/galeri/[slug]`.
- [x] `/desa/dokumen` (informasi publik, produk hukum): use case
      `daftarDokumenPublik()` + slot tema `dokumen`. Smoke test 200.
- [x] `/desa/statistik` (penduduk, bantuan, APBDes).
- [x] `/desa/kelompok` (kelompok & lembaga): use case
      `listKelompokPublik()` → slot tema `kelompok`; menampilkan tipe,
      kategori, ketua, jumlah anggota, dan keterangan. Smoke test 200.
- [x] `/desa/inventaris` (ringkasan aset): use case
      `getInventarisPublik()` + rekap murni (`ringkasan-publik.ts`) → slot tema
      `inventaris`; menampilkan total unit/nilai, rekap kategori, dan daftar
      barang. Smoke test 200.
- [x] `/desa/apbdes` (transparansi keuangan): rute memakai
      `getLaporanApbdesPublik()` dan slot tema `apbdes`, bukan query DB langsung;
      ringkasan anggaran + realisasi per bidang. Smoke test 200.
- [x] `/desa/kontak`.
- [x] `/desa/verifikasi-surat/[token]` + `/desa/verifikasi-surat` (form token).
      *Token dicari lewat hash SHA-256 dan ter-scope tenant; token mentah
      disimpan agar tautan dapat dicetak ulang. Parameter `params` sudah
      di-`await` (Next 16).*
- [x] `/desa/halaman/[slug]` (halaman statis dari `halaman_statis`).
- [x] `/desa/status-des`: identitas desa + ringkasan aset lewat use case
      `getInventarisPublik()` dan slot tema `statusDesa`; bukan query DB
      langsung. Smoke test 200.
- [x] `/desa/idm-sdgs`: laporan realisasi per triwulan dari
      `getLaporanTriwulanPublik()` (TW I–IV dijumlahkan, bukan disamakan dengan
      anggaran). Klaim SDGs statis dihapus; bila indikator IDM/SDGs belum ada,
      halaman menyatakan data belum tersedia. Smoke test 200.
- [x] `/desa/surat`: daftar jenis surat dari DB lewat
      `listJenisSuratPublik()` + slot tema `surat`; tautan verifikasi menuju
      halaman form token yang valid. Smoke test 200.
- [x] `/desa/analisis-survei`: daftar survei aktif lewat
      `listSurveiPublik()` + slot tema `survei`; menampilkan jumlah
      pertanyaan/responden dan daftar pertanyaan. Pengisian mandiri belum
      tersedia. Smoke test 200.
- [x] `/desa/pembangunan`, `/desa/peta`, `/desa/idm`,
      `/desa/sdgs`, `/desa/suplemen`, `/desa/dpt`, `/desa/lapak` — **hanya
      placeholder kosong** dengan komentar TODO. Tidak ada backend
      (`src/features/pembangunan/` tidak ada). Data menyusul Fase 3B/3C.
      (`/desa/pengaduan` keluar dari daftar ini: sudah memakai data 3D.)

### 1F. CMS konten

- [x] **1F.1** Resource & modul seed: `berita`, `berita-kategori`, `galeri`,
      `profil-desa`, `perangkat-desa`, `menu-publik`, `widget`, `slider`,
      `dokumen-publik`, `tema`, dan `super-admin` sudah punya slug resource +
      entri `modules.ts`. Operator mendapat `manage` untuk empat modul CMS;
      sekdes/kades `read`. Halaman `/super-admin` sendiri masih mockup dan
      belum menjadi fitur (Fase 5).
- [x] **1F.2** `/konten/berita` + `/konten/berita/kategori`: CRUD, draf/terbit,
      jadwal, sampul, lampiran PDF, penulis dari sesi, slug unik per desa, isi
      disanitasi saat simpan. Bukti: `features/konten/*`, halaman admin, dan
      `domain/berita.test.ts`; CRUD diuji langsung ke DB dev.
- [x] **1F.3** `/konten/galeri` + `/konten/galeri/[id]`: CRUD album, unggah
      banyak foto (maks. 20/permintaan), judul/keterangan/urutan/aktif, penanda
      slider beranda, sampul album. Bukti: `features/konten/*galeri*`,
      `domain/galeri.test.ts`, halaman admin; album & foto uji terverifikasi
      tampil di admin dan `/desa/galeri` lalu dibersihkan.
- [x] **1F.4** `/konten/profil` dan `/konten/perangkat`: visi/misi/sejarah/
      sambutan/koordinat (HTML disanitasi), CRUD perangkat lengkap dengan
      jabatan, foto, status, urutan, dan penanda tangan; katalog jabatan CRUD.
      Bukti: `features/konten/*profil*`, `*perangkat*`, halaman admin; CRUD dan
      FK `set null` diuji ke DB dev.
- [x] **1F.5** `/konten/menu`, `/konten/widget`, `/konten/slider`: CRUD penuh
      lewat `CmsCrudManager` bersama. Menu mendukung induk satu tingkat,
      penolakan siklus/orphan, urutan, dan status; widget memvalidasi jenis
      1–6 + JSON pengaturan; slider menyimpan gambar, tautan, urutan, status.
      Daftar admin memuat baris nonaktif. Bukti: `features/konten/*menu*`,
      `*widget*`, `*slider*`, `cms-crud-manager.tsx`, halaman admin, dan
      `domain/cms.test.ts`.
- [x] **1F.6** `/konten/dokumen`: CRUD metadata (nama, slug otomatis/unik,
      kategori, jenis, nomor, tahun, berkas/tautan, keterangan, status).
      Unggah berkas lewat UI **belum** ada; path media/tautan diisi manual.
      Bukti: `features/konten/*dokumen*`, `dokumenSlugExists`, halaman admin,
      dan `domain/cms.test.ts`.
- [x] **1F.7** Sanitasi HTML: `sanitize-html` + `@types/sanitize-html`;
      `src/lib/sanitize.ts`; sanitasi saat simpan **dan** render; test XSS
      (`<script>`, `onerror=`, `javascript:`, `<iframe>`, `style=`).
      Widget `isi` kini disanitasi saat simpan (`widget-use-cases.ts`) dan
      dirender lewat `KontenHtml` (sanitasi lapisan kedua) pada bagian beranda
      `widget`. Widget non-teks tetap tersimpan; tampilan lanjutan per jenis
      menyusul. Menu/slider/dokumen tidak memuat HTML bebas.

### 1G. Test & kriteria selesai

- [x] Sanitasi HTML: `sanitize-html` + `@types/sanitize-html` terpasang;
      `src/lib/sanitize.ts` (`sanitasiHtml`, `teksPolos`); sanitasi saat
      render (lapisan kedua) via `_components/konten-html.tsx`; test XSS
      (`<script>`, `onerror=`, `javascript:`, `style=`, `<iframe>`, `data:`).
- [x] Semua halaman publik bisa dibuka tanpa sesi. *(Smoke test produksi
      `next start` pada 23 Okt 2026: beranda, profil, pemerintahan, berita,
      galeri, statistik, APBDes, dokumen, kelompok, inventaris, status desa,
      surat, analisis survei, IDM/SDGs, bantuan, kontak, dan layanan mandiri
      semuanya 200. Test otomatis HTTP menyusul.)*
- [x] Ganti tema & opsi langsung terlihat, tanpa deploy. *(Uji admin
      `/konten/tema` pada `next start` 23 Okt 2026: klik "Pakai tema ini" untuk
      `natra`, simpan warna primer `#123456`, radius `1.25rem`, dan judul hero;
      beranda publik langsung memakai `data-theme="natra"`,
      `--pub-primary:#123456`, `--pub-radius:1.25rem`, dan teks hero baru tanpa
      build/deploy. Keadaan awal (`esensi`, opsi `NULL`) dikembalikan.)*
- [x] Draft tidak tampil; slug unik; unggahan tervalidasi; konten tersanitasi.
      *(Uji integrasi `next start` + DB dev 23 Okt 2026: berita `draft` dan
      `published` berjadwal besok tidak muncul di `/desa/berita`; detail
      keduanya 404, sedangkan berita terbit tampil 200. Slug duplikat ditolak
      indeks unik DB (`ER_DUP_ENTRY`, errno 1062); `slug.test.ts` menguji
      `buatSlug`/`slugUnik`, dan test domain kategori/album/jabatan memastikan
      akhiran unik tetap muat kolom. `media.test.ts` + `media-nama.test.ts`
      menguji allowlist MIME/ukuran/ekstensi; HTML berisi `<script>`,
      `onerror=`, dan `javascript:` yang disisipkan langsung ke DB hilang saat
      dirender di detail berita, ditambah `sanitize.test.ts`.)*
- [x] Tidak ada tautan 404. *(Crawler internal pada build produksi memeriksa
      19 halaman publik; tidak ada tautan internal yang mengembalikan 404.)*
- [x] Lighthouse mobile ≥ 90 untuk performance & accessibility (target awal).
      *(Build produksi `next start`, Lighthouse 12, emulasi mobile 23 Okt 2026:
      performance **97**, accessibility **100** setelah kontras teks footer
      dinaikkan dari `text-muted-foreground` ke `text-foreground/70`.)*

**Selesai bila:** situs publik terasa seperti produk jadi, bukan placeholder.

---

## Fase 2 — Semua Fitur Admin Berfungsi (4–5 minggu)

Fokus: tidak ada menu yang membuka halaman mati. Setiap action punya UI,
otorisasi, validasi, dan test.

### 2A. Inventaris + approval berjenjang (6 hari)

- [x] Migrasi kolom mutasi: `diajukan_oleh`, `diajukan_oleh_id`,
      `verifikasi_operator`, `verifikasi_sekdes`, `verifikasi_kades`,
      `log_verifikasi`, `catatan_verifikasi`.
- [x] State machine `nextMutasiStep()`: operator → sekdes → kades.
- [x] Approve per tahap; **aset berubah hanya di tahap final**, dalam satu
      transaksi (`pindah` → lokasi, `rusak` → kondisi, `perbaikan` → kondisi
      baru, `hapus` → kurangi jumlah/soft-delete).
- [x] Larangan: lompat tahap, approve ganda, dan approve oleh pengaju sendiri.
- [x] Grant `inventaris` + `mutasi-inventaris` untuk sekdes & kades.
- [x] UI: daftar inventaris, form mutasi, approval berjenjang, dan timeline
      verifikasi.
- [x] UI: CRUD inventaris & kategori (tambah/ubah/hapus dengan validasi).
- [x] Test transisi sah & ilegal di `domain/inventaris.test.ts` (14 test).
      *Catatan: pengujian transaksi DB/tenant masih mengandalkan filter
      `village_id` di repository; test integrasi DB menyusul.*

### 2B. Perangkat desa & lembaga (3 hari)

- [x] Modul `perangkat-desa`: CRUD, jabatan, urutan, foto, periode, aktif.
- [x] Modul jabatan (master) tersedia sebagai `JabatanManager` di
      `/konten/perangkat`; tidak perlu route terpisah.
- [x] Lembaga desa memakai `kelompok` tipe `lembaga`; `/kelompok` punya filter
      tipe, CRUD, kategori, dan `AnggotaDialog` untuk menambah/mengeluarkan
      anggota.
- [x] Data perangkat dipakai halaman publik `/desa/pemerintahan` (bukan
      `/desa/perangkat`) lewat `listPerangkatDesa` + slot tema `perangkat`;
      `/desa/kelompok` menampilkan kelompok & lembaga. Smoke test produksi
      23 Okt 2026: keduanya 200.

### 2C. Akun warga (NIK + PIN) + Layanan Mandiri (10 hari)

**Route:** warga di `/layanan-mandiri/*` (login lewat `/masuk`, dasbor di
`/layanan-mandiri/beranda`). Halaman admin permohonan tetap di
`/permohonan-surat` agar tidak bentrok; `/layanan-mandiri` (tanpa subpath)
masih halaman informasi tema publik dengan CTA ke `/masuk`.

- [x] Migrasi `users.resident_id`, `users.must_change_pin` (`0021`), dan FK
      `permohonan_surat.letter_id` + indeks unik `users.resident_id` (`0022`).
- [x] Login warga: `username = NIK`, password = PIN 6 digit
      (`src/features/auth/actions.ts`, `src/features/warga/*`).
  - `minPasswordLength: 6` di better-auth; **kebijakan staf tetap ≥ 8**
    ditegakkan di `features/pengguna/domain/pengguna.ts`.
  - Rate limit login aktif: 5 percobaan/menit untuk `/sign-in/username`
    (`src/lib/auth.ts`).
- [x] Operator membuat akun dari baris penduduk (`PendudukRowActions`):
  - generate PIN 6 digit, tampilkan **sekali** di `KredensialWargaDialog`
    dengan tombol salin;
  - `mustChangePin = true`; reset PIN oleh operator;
  - kirim PIN otomatis menyusul di Fase 3H (SMS/WA); sekarang manual.
- [x] Area `(warga)`: `/layanan-mandiri/beranda`, `/layanan-mandiri/surat`,
      `/layanan-mandiri/dokumen`, `/layanan-mandiri/pesan`,
      `/layanan-mandiri/profil`, `/layanan-mandiri/ubah-pin`. Halaman ubah PIN
      sengaja di luar layout gerbang agar PIN sementara bisa diganti.
- [x] Scoping: `residentId` **selalu dari sesi** (`requireWarga`/
      `requireWargaAktif` di `src/lib/dal.ts`), tidak dari `formData`. PDF surat
      warga juga memeriksa `residentId` + status `issued`.
- [x] State machine status permohonan 0–5; transisi ilegal ditolak
      (`PERMOHONAN_TRANSITIONS`, `prosesPermohonan`).
- [x] Syarat nyata dari master surat: `letter_types.syarat_surat` di-resolve ke
      `letter_requirements` (bukan `"[]"`).
- [x] UI warga: ajukan surat + isian dinamis + unggah syarat + status
      (`form-ajukan-surat.tsx`). Berkas syarat disimpan di media privat
      (kategori `permohonan`) dan diunduh lewat route ber-otentikasi.
- [x] UI admin: detail permohonan, proses status, kembalikan dengan alasan,
      batalkan, dan riwayat (`PermohonanDetailDialog`, `/permohonan-surat`).
- [x] Terbitkan surat dari permohonan: `buatKonsepSuratPermohonanData` memakai
      use case persuratan (bukan duplikasi penomoran), menyimpan `letter_id`,
      dan menyinkronkan status saat surat terbit/ditolak.
- [x] Test integrasi DB akses lintas warga & siklus PIN (`integrasi-warga.test.ts`,
      5 case, berjalan pada `desa_test` — auto-skip bila MySQL tak tersedia):
      permohonan tidak terlihat lintas warga/lintas desa, mapping spec item 4;
      jenis surat hanya muncul pada desa pemilik; `createWargaAccount` →
      `mustChangePin` → `clearMustChangePin` → `resetWargaPin` memaksa ganti PIN
      lagi; `findResidentForAccount` menolak penduduk desa lain. Proteksi
      sesi (`requireWarga`/`requireWargaAktif`) tetap dari `lib/dal.ts`.
      Untuk test integrasi HTTP, lihat catatan daftar akhir.

### 2D. Bumindes (4 hari)

- [x] Layer `domain` + `application`; presentation tidak impor `infrastructure`.
      `features/bumindes/domain/bumindes.ts` (katalog + skema zod + helper),
      `application/use-cases.ts` (izin + tenant scope), repository hanya di
      `infrastructure/`. `/bumindes` dan halaman detail memanggil use case.
- [x] CRUD item buku; validasi nomor urut unik. Tambah/ubah lewat
      `BukuItemFormDialog`, hapus berkonfirmasi lewat `BukuItemRowActions`.
      Keunikan diperiksa server per (desa, buku) — `nomorUrutTerpakai` — dan
      dilaporkan sebagai konflik. Indeks unik DB belum dipasang karena data
      lama mungkin sudah berisi nomor ganda.
- [x] Lengkapi buku inti: administrasi umum (A1–A8), penduduk induk, KTP/KK,
      mutasi, rekapitulasi, penduduk sementara (B1–B5), tanah desa (E1).
      Katalog di `BUKU_INTI`; seed menata ulang kode bawaan lama (mis. `C1`
      Agenda → `A6`) tanpa melepas item yang sudah tercatat, lalu menambah buku
      yang belum ada secara idempoten. **Isi buku masih manual** — sinkronisasi
      otomatis dari data penduduk belum dibuat.
- [x] Test: `domain/bumindes.test.ts` (13 test — katalog, skema item, nomor
      urut berikutnya).

### 2E. Persuratan: sisa gap (8 hari)

- [x] Penegakan syarat saat pengajuan. Jalur operator memaksa konfirmasi
      kelengkapan syarat (checkbox pada dialog Ajukan Verifikasi,
      server-enforced di `ajukanVerifikasiSuratData(id, konfirmasiSyarat)`;
      daftar syarat wajib ditampilkan dari master syarat). Jalur permohonan
      warga tetap lolos (`true`) karena warga sudah wajib mengunggah semua
      berkas syarat.
- [x] Verifikasi publik token + `/desa/verifikasi-surat/[token]` (tenant-aware).
      QR gambar dibuat lokal dengan pustaka `qrcode` (tanpa layanan pihak
      ketiga): SVG di halaman cetak admin dan PNG di PDF admin/warga, berisi
      URL verifikasi dari helper bersama `domain/verifikasi.ts`. Token tetap
      dicetak sebagai teks cadangan.
- [x] Template surat, placeholder gambar (logo, TTD, stempel). Kolom baru
      `villages.signature` & `villages.stamp` (migration 0025), unggahan
      kategori media `umum` lewat Pengaturan > Desa (logo/ttd/stempel),
      disajikan `/api/publik/media/`. Kop surat cetak menampilkan logo; blok
      TTD menampilkan gambar tanda tangan + stempel menimpa; PDF
      (`surat-pdf.ts`) menanam PNG/JPG yang sama (fallback URL bila jalur
      berupa http). QR verifikasi ikut ditanam di footer PDF.
- [x] Terbilang & aritmetika isian. `domain/terbilang.ts` (murni + 12 test):
      token `[terbilang:KODE]`, `[terbilang_rupiah:KODE]`,
      `[hitung:EKSPRESI]` (+ - * / %, kurung; token gagal dibiarkan utuh);
      isian angka otomatis mendapat `[<kode>_terbilang]`. Diterapkan pada
      render terbit (`terbitkanSurat`) dan render cetak/PDF/warga
      (`loadSuratPrintData`), plus bantuan token di form jenis surat.
- [x] Pengikut & penduduk luar. `domain/pengikut.ts` (+6 test): pengikut
      penduduk desa (placeholder `pengikut<n>_*`, `pengikut_daftar`,
      `pengikut_jumlah`) dan penduduk luar desa diisi manual (`luar<n>_*`,
      `luar_daftar`, `luar_jumlah`). Disimpan di `nilaiIsian` JSON kunci
      `__pengikut`/`__luar` tanpa migrasi; data pengikut dimuat ulang dari
      penduduk (`listPendudukSuratByIds`). UI: dialog surat diberi checkbox
      pengikut (maks 10) + baris dinami penduduk luar (maks 10) melalui
      `surat-form-dialog.tsx`; bantuan placeholder di form jenis surat.
- [x] Surat dinas + arsip. Modul `surat-dinas` (resource RBAC + seed 3 role:
      operator `manage`, sekdes/kades `read`; ikon `scroll-text`) dengan
      migration `0026` tabel `letter_dinas` (nomor/tanggal/penerima/perihal/
      isi/klasifikasi/arsip berkas + lokasi arsip fisik). Fitur
      `features/surat/{application,infrastructure,presentation}` +
      halaman `/persuratan/surat-dinas` (cari, CRUD, unggah/buka/hapus
      lampiran media kategori `umum`, hapus berkas ikut membersihkan storage).
- [x] TTE/BSRE: adapter mode nonaktif. Scaffolding di `domain/tte.ts`
      (murni + 7 test): konfigurasi dari env `TTE_*` (`parseKonfigTte`,
      mode `nonaktif`/`manual`/`bsre` — nilai asing jatuh aman ke nonaktif),
      tipe adapter `KlienTte` siap ditukar dengan klien jaringan nanti.
      `terbitkanSurat` memanggil `prosesTteSurat` (repo `setSuratTte`) yang
      keluar segera saat nonaktif — penerbitan surat tidak pernah diblokir;
      hasil `ok: false` hanya dicatat.

### 2F. Keuangan (3 hari)

- [x] Halaman anggaran, triwulan, laporan, dokumen bebas error dan konsisten:
      check/lint/build/test hijau; sumber data admin & publik lewat fungsi
      domain yang sama sehingga angka saling konsisten.
- [x] Ekspor CSV/Excel & cetak. Laporan RP APBDes sudah punya cetak + CSV +
      Excel; kini lengkap juga: **triwulan** mendapat tombol Cetak & Ekspor
      CSV (`triwulan/ekspor` route, `laporan-triwulan-csv.ts` + 3 test) dan
      **anggaran** mendapat tombol Cetak + kop cetak (input pagu/realisasi
      otomatis dirender sebagai teks saat cetak via `print:hidden`).
- [x] Data untuk `/desa/apbdes` publik tersedia lewat `getLaporanApbdesPublik`
      (villageId dari host, domain sama dengan admin).
- [ ] Rekonsiliasi/manual (bila diperlukan) — P2.

### 2G. Analisis/survei (5 hari)

- [x] Modul `survey` penuh: builder soal, responden, jawaban, rekap.
      `features/survey/{domain,application,infrastructure,presentation}`.
      `/analisis-survei` berisi daftar + CRUD survei; `/analisis-survei/[id]`
      berisi builder pertanyaan (isian, angka, pilihan ganda 2–10 opsi),
      responden dengan jawaban dinamis, dan rekap per soal (distribusi +
      persentase, rata-rata/min/maks, contoh jawaban teks). Jawaban wajib
      lengkap; pilihan divalidasi terhadap opsi yang tersimpan pada soal.
      Migrasi `0023` menambah `survey_soal.pilihan`.
      *Belum: pengisian mandiri oleh warga, kategori/indikator/parameter ala
      OpenSID (Fase 3F), dan impor/ekspor respons.*
- [x] Grant & modul seed konsisten: modul `analisis-survei` diaktifkan di menu;
      operator `manage`, sekdes/kades `read` (berlaku setelah `npm run db:seed`).

**Selesai bila:** setiap menu admin membuka fitur yang benar-benar bisa dipakai
end-to-end; tidak ada action tanpa UI; `npm run check` hijau.

---

## Fase 3 — Paritas Admin OpenSID T1+T2 (10–14 minggu)

Rujuk `docs/PARITAS-OPENSID.md`. Urutan berdasarkan nilai bagi desa dan
ketergantungan halaman publik.

### 3A. Kependudukan lanjutan (2 minggu)

- [ ] Log/riwayat penduduk (lahir, mati, pindah, datang).
- [ ] DPT.
- [ ] DTKS.
- [ ] Data suplemen.
- [ ] Statistik penduduk & bantuan (tabel + grafik).
- [ ] (P2) Stunting, vaksin/Covid, pendapat warga.

### 3B. Pertanahan & peta/GIS (3 minggu)

- [ ] Data persil, Cdesa, mutasi, rincian.
- [ ] Peta: area, garis, titik, polygon; editor sederhana.
- [ ] Layer batas desa/dusun.

### 3C. Pembangunan (2 minggu)

- [ ] Proyek pembangunan: rencana, realisasi, dokumentasi foto, hasil.
      *(Skema `pembangunan_proyek` + `pembangunan_dokumentasi` sudah dibuat di
      migrasi `0024`; backend & UI belum.)*
- [ ] Integrasi ke buku pembangunan & halaman publik.

### 3D. Pengaduan warga (1 minggu)

- [x] Backend pengaduan: skema `pengaduan` (migrasi `0024`), domain
      (`features/pengaduan/domain/pengaduan.ts`), use case + kirim warga
      (`application/use-cases.ts`, `kirim-pengaduan.ts`), media kategori
      `pengaduan`, dan Server Actions.
      *(Verifikasi 24 Okt 2026: migrate + seed sukses di DB dev, tabel
      `pengaduan` & indeks dikonfirmasi ada.)*
- [x] UI admin pengaduan `/pengaduan`: daftar berfilter, statistik, detail
      (tanggapan/status), publikasi ke web (`setPublikPengaduan`), dan hapus.
      *(Bukti: `src/app/(admin)/pengaduan/page.tsx`,
      `presentation/components/pengaduan-{detail-dialog,row-actions}.tsx`.
      Modul & ikon menu kini di-seed (`modules.ts` + grant: operator
      `manage`, sekdes/kades `read`) dan lampiran disajikan lewat route
      ber-otentikasi `src/app/api/pengaduan/lampiran/[...path]/route.ts`
      (izin `read` pengaduan, tenant dari sesi). Uji alur di browser masih
      menunggu.)*
- [x] Halaman publik pengaduan `/desa/pengaduan`: form kirim tanpa login
      (`publik-actions.ts` wired via `presentation/components/
      pengaduan-form-publik.tsx`) + daftar pengaduan yang dipublikasikan
      (identitas disamarkan). **Pelacakan mandiri** `/desa/pengaduan/lacak`:
      nomor tiket + salah satu identitas (NIK/telepon/email) diverifikasi di
      server (`application/lacak-pengaduan.ts`, `domain/identitasCocok`);
      identitas dikirim lewat Server Action, bukan URL. Sisa: notifikasi
      (email/WA) saat status berubah.

### 3E. Dokumen, produk hukum, surat dinas (2 minggu)

- [ ] Produk hukum/peraturan desa + unggah PDF.
- [ ] Informasi publik/dokumen.
- [ ] Surat dinas + arsip.

### 3F. Analisis penuh (2 minggu)

- [ ] Kategori, indikator, parameter, periode, respon, laporan, statistik
      jawaban.
- [ ] Impor/ekspor respon.

### 3G. Bumindes lengkap (1 minggu)

- [ ] Buku rencana/kegiatan/hasil pembangunan, kader, arsip, tanah kas.

### 3H. Operasional & keamanan (2 minggu)

- [ ] Backup/restore database + optimasi gambar.
- [ ] Audit log aktivitas.
- [ ] OTP/token & keamanan login tambahan.
- [ ] Notifikasi internal + mailbox.
- [ ] (P2) SMS/WA gateway.

### 3I. Opsional P3 (tidak memblokir "tidak kalah")

- [ ] Lapak, anjungan, buku tamu, kehadiran, pemilihan, sinergi program,
      plugin, sinkronisasi/OpenDK.

**Selesai bila:** T1 + T2 di matriks paritas berstatus ✅ atau 🟡 yang
terdokumentasi, dengan test.

---

## Fase 4 — Menyambungkan Web Publik ke Modul Baru (2–3 minggu)

- [ ] `/desa/pembangunan` memakai data Fase 3C.
- [x] `/desa/pengaduan` memakai data Fase 3D (termasuk form kirim) — selesai
      di Fase 3D lebih awal (lihat §3D).
- [ ] `/desa/peta` memakai data Fase 3B.
- [ ] `/desa/dokumen` + produk hukum memakai Fase 3E.
- [ ] `/desa/statistik` + `/desa/apbdes` final.
- [ ] `/desa/suplemen`, `/desa/dpt`, `/desa/idm`, `/desa/sdgs` bila datanya ada.
- [ ] Widget, slider, menu dinamis dari CMS.
- [ ] Audit tautan mati + uji aksesibilitas.
- [ ] Test regresi proxy & isolasi tenant.

---

## Fase 5 — Multi-Desa (4–6 minggu)

Aktivasi penuh setelah single-tenant stabil.

### 5A. Fondasi tenant

- [ ] Role `super-admin` (tanpa `villageId`).
- [ ] Tabel `village_domains` (banyak domain per desa: primary + alias),
      migrasi dari `villages.domain`.
- [ ] `resolveVillageByHost` final + wildcard `*.desa.id` + domain kustom.
- [ ] Semua staf wajib punya `villageId`; super admin memilih desa eksplisit.
- [ ] Isolasi data: semua query admin & publik ter-scope `villageId`.

### 5B. Super admin & provisioning

- [ ] Dashboard super admin: daftar desa, domain, status, admin, kuota.
- [ ] Wizard buat desa: identitas, domain, tema default, akun admin desa.
- [ ] Seed per desa: jenis surat, klasifikasi, syarat, buku bumindes, kategori
      inventaris, menu publik default.
- [ ] Nonaktifkan/arsipkan desa.
- [ ] Reset akses admin desa oleh super admin.

### 5C. Tema & domain per desa

- [ ] Tema aktif per desa (sudah disiapkan Fase 1D).
- [ ] Opsi tema per desa.
- [ ] Domain kustom + verifikasi kepemilikan + TLS.
- [ ] Media per desa (`storage/publik/<villageId>`), kuota.

### 5D. Warga & admin desa

- [ ] Warga terikat `resident.villageId`; tidak bisa lintas desa.
- [ ] Admin desa hanya melihat desanya.
- [ ] Login warga di domain desanya masing-masing.

### 5E. Uji multi-tenant

- [ ] Dua desa + dua domain: data, media, tema, metadata, sitemap tidak bocor.
- [ ] Uji beban dasar (ratusan desa) + cache per host.
- [ ] Audit keamanan: IDOR, path traversal, cross-tenant query.

**Selesai bila:** super admin bisa membuat desa baru lengkap dengan domain,
admin desa, tema, dan situs publik yang langsung hidup.

---

## Fase 6 — Hardening & Dokumentasi (2 minggu)

- [ ] Audit keamanan: otorisasi setiap action, scoping, sanitasi, unggahan,
      rate limit, session.
- [ ] Performance: query N+1, pagination, index DB, caching publik.
- [ ] Aksesibilitas & SEO menyeluruh.
- [ ] Backup/restore & runbook operasional.
- [ ] Sinkronkan `README.md`, `AGENTS.md`, `ARCHITECTURE.md`,
      `LOG-PERKEMBANGAN.md`, `RENCANA-PERBAIKAN.md`, `PARITAS-OPENSID.md`;
      pastikan tidak ada dokumen status baru di luar `docs/README.md`.
- [ ] Aturan: PR yang mengubah status fitur wajib memperbarui dokumen status.

---

## Urutan & Estimasi

| Fase | Isi | Estimasi | Milestone |
|---|---|---|---|
| 0 | Stabilisasi | 1 hari | **M0** build hijau, tree bersih |
| 1 | Web publik + tema + CMS | 3–4 minggu | **M1** wajah aplikasi selesai |
| 2 | Admin existing berfungsi penuh | 4–5 minggu | **M2** tidak ada menu mati |
| 3 | Paritas OpenSID T1+T2 | 10–14 minggu | **M3** setara OpenSID (T1+T2) |
| 4 | Sambungkan web publik ke modul baru | 2–3 minggu | **M4** situs publik penuh data |
| 5 | Multi-desa | 4–6 minggu | **M5** super admin + domain |
| 6 | Hardening & docs | 2 minggu | **M6** siap produksi |

**Total: ±7–8 bulan** (satu developer), **±4–5 bulan** (dua developer).
Fase 1 dan 2 tidak bisa paralel penuh karena berbagi skema konten/auth, tetapi
Fase 3A–3H bisa dipecah ke beberapa developer.

---

## Quality Gate (setiap fase)

1. `npm run check` + `npm run build` lulus.
2. Tidak ada impor `infrastructure` dari `presentation`/`app`.
3. Setiap action dipakai minimal satu komponen UI.
4. Setiap perubahan skema punya migrasi + snapshot ter-commit.
5. Test jalur sukses **dan** gagal (transisi, otorisasi, scoping, XSS).
6. Data warga dari sesi; `villageId` publik dari host.
7. Dokumentasi status diperbarui.

## Definition of Done (per fitur)

- UI mencakup seluruh operasi domain (bukan hanya daftar).
- Otorisasi di application layer.
- Validasi Zod di domain.
- Tidak ada tautan/aksi mati.
- Konten HTML tersanitasi.
- Status di dokumen sesuai kenyataan.

---

## Risiko Utama

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope "tidak kalah OpenSID" membengkak | Tidak pernah selesai | Target T1+T2, T3 opsional |
| Web publik dibangun sebelum skema stabil | Rework besar | Skema konten di 1C sebelum halaman |
| Tema runtime upload | Celah eksekusi kode | Tema compiled + opsi DB (1D.8) |
| PIN 6 digit | Brute force | Rate limit + lockout + reset operator |
| Approval berjenjang salah tahap | Aset berubah tanpa otorisasi | State machine + test |
| Asumsi satu desa terbawa | Multi-desa mustahil | Seam 1B sekarang |
| Cache lintas tenant | Kebocoran data | Cache key per host/desa |
| Lisensi GPL OpenSID | Kewajiban lisensi | Tiru perilaku, jangan salin kode/aset |
| Estimasi meleset | Kepercayaan turun | Milestone per fase, review tiap M |

---

## Status Dokumen

Diperbarui 23 Oktober 2026 dari audit dokumen vs kode. Urutan prioritas:
web publik → admin berfungsi → paritas OpenSID → multi-desa.

---

## Status Akhir (diperbarui 24 Oktober 2026)

| Fase | Status | Catatan |
|------|--------|---------|
| 0 — Stabilisasi | ✅ **Selesai** | Build hijau, tree bersih, migrasi ter-commit |
| 1 — Web Publik + Tema + CMS | 🟡 **Sebagian** | Fondasi, tema, dan CRUD CMS (menu/widget/slider/dokumen) selesai; halaman publik Pembangunan & Peta masih placeholder (Pengaduan sudah nyata di Fase 3D) |
| 2 — Admin existing berfungsi | 🟡 **Sebagian** | Inventaris, perangkat, surat, keuangan, CRUD CMS, **layanan mandiri warga (NIK+PIN)**, **bumindes**, **survei**, dan **pengaduan (admin + publik)** selesai; sisa 2E persuratan (template, TTE) dan cetak 2F |
| 3 — Paritas OpenSID T1+T2 | 🟡 **2D & 3D pengaduan berjalan** | 3 item pengaduan (backend, UI admin, publik) dicentang; ±27 item lain belum |
| 4 — Sambungkan web publik ke modul | 🔴 **Belum dimulai** | Pengaduan sudah ter-wire (dikerjakan dulu di 3D); pembangunan/peta & sisanya menunggu backend |
| 5 — Multi-desa | 🔴 **Belum dimulai** | Halaman `/super-admin` masih mockup statis (sudah ter-commit, tanpa backend dan tanpa RBAC nyata) |
| 6 — Hardening & Dokumentasi | 🔴 **Belum dimulai** | Tidak ada bukti audit keamanan |

**Keseluruhan: ±25%** (Fase 0, sebagian besar Fase 1, dan sebagian besar Fase 2).

Masalah kritis yang perlu diperbaiki sebelum lanjut:
1. ~~Verifikasi surat IDOR~~ — **selesai P0**: token acak + hash, tenant-aware, `await params`, dan halaman form token. QR gambar belum dibuat (baru tautan teks).
2. ~~Sebagian halaman publik masih mengimpor repository langsung~~ —
   **selesai**: beranda, berita, galeri, profil, pemerintahan, bantuan,
   halaman statis, dan pertanahan kini lewat use case publik; tidak ada lagi
   query `db` mentah di halaman publik.
3. RBAC: slug resource `pengaduan` + `pembangunan` sudah ditambahkan; halaman
   super-admin masih mockup dan belum menjadi fitur.
4. Route typo `pertanaha` → `pertanahan` (sudah diperbaiki).
5. ~~Halaman statistik publik hardcoded `"0"`~~ — **selesai**: memakai
   `getStatistikPublik()`.
6. Test integrasi HTTP untuk area warga (akses lintas warga, akun tanpa
   `residentId`, proteksi `requireWarga`) — R2. Test integrasi DB dasar
   sudah ada (`integrasi-warga.test.ts`).
