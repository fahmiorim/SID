# Rencana Pembangunan Menyeluruh — SID Desa

Dokumen ini adalah rencana pembangunan untuk **rebuild orisinal dengan cakupan
fitur OpenSID lengkap**. Urutan kerja tetap memprioritaskan:

1. **Web publik dibangun sempurna lebih dulu** — itu wajah aplikasi.
2. **Semua fitur admin yang sudah ada wajib berfungsi penuh.**
3. **Seluruh fitur OpenSID dipetakan dan ditutup bertahap** — lihat
   [`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md) dan statusnya di
   [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).
4. **Multi-desa dibangun setelah domain dan quality gate stabil.**

Katalog adalah scope produk. T1/T2/T3 hanya urutan prioritas; T3 bukan lagi
fitur yang boleh hilang dari target akhir.

Rujukan paritas: `docs/PARITAS-OPENSID.md`, dipetakan dari source OpenSID lokal
di `/home/super/Projects/opensid`.

---

## Asumsi & Keputusan

| # | Keputusan | Catatan |
|---|---|---|
| 1 | Web publik di `/`, admin di `/beranda` | Sesuai keputusan sebelumnya |
| 2 | Konten berita memakai **HTML + sanitizer** | `sanitize-html`, allowlist ketat |
| 3 | Akun warga **diajukan mandiri, disetujui operator** | Form `/desa/registrasi-warga`; operator menyetujui di `/penduduk/registrasi`; PIN tampil sekali |
| 4 | Login warga **NIK + PIN** | Meniru alur OpenSID; PIN 6 digit, bisa diganti |
| 5 | Tema publik dipasang di build, opsi diubah dari admin | Next.js tidak aman memuat kode tema saat runtime |
| 6 | Multi-desa: subdomain `*.desa.id` + domain kustom | Aktivasi penuh setelah domain tunggal stabil |
| 7 | Target paritas **seluruh katalog OpenSID** | T1/T2/T3 hanya urutan prioritas, bukan pengecualian |
| 8 | Integrasi eksternal memakai adapter | Provider dapat nonaktif/manual, secret wajib dari environment |

Estimasi terdahulu hanya berlaku untuk target parsial. Estimasi penyelesaian
seluruh katalog tidak ditentukan sebelum inventaris detail dan acceptance
criteria per ID selesai.

---

## Rencana Penutupan Gap Non-E2E (4 November 2026)

Tujuan: **setiap ID katalog hanya menyisakan gap E2E**. Seluruh pekerjaan
fungsional dikerjakan lebih dulu; penambahan dan eksekusi E2E ditunda ke fase
terpisah setelah batch non-E2E selesai.

**Gap non-E2E** meliputi: UI/CRUD yang belum ada, aksi/use case, otorisasi atau
scoping tenant, keluaran (PDF/CSV/print/QR), impor/unggah, laporan/rekap,
integrasi/adapter, serta unit/integration test yang belum ada. **Gap E2E**
adalah khusus ketiadaan atau perluasan uji browser (`tests/*.e2e.ts`).

**Aturan kerja:**

1. Sebelum batch dimulai, salin gap per-ID dari `PARITAS-OPENSID.md`.
2. Kerjakan seluruh gap non-E2E; jangan menambah atau menjalankan E2E.
3. Setelah batch, perbarui baris PARITAS. Jika hanya E2E tersisa, tulis
   `Gap: E2E`; jangan menaikkan status ke ✅ sebelum E2E tersedia.
4. Sertakan test non-E2E (unit, integrasi DB, HTTP smoke) pada perubahan.
5. Batch selesai bila seluruh ID di dalamnya lolos checklist "E2E-only":
   UI/aksi ada; CRUD/keluaran lengkap; otorisasi + tenant diuji non-E2E;
   impor/unggah/laporan yang diminta katalog ada; baris PARITAS tidak lagi
   menyebut gap selain E2E.

Saat ini ada **77 ID** dengan gap (77 🟡 + 0 🔴). Dua ID sudah E2E-only dan
tidak masuk batch: `OS-SUR-011` dan `OS-WGA-003`.

| Batch | ID | Fokus non-E2E | Kriteria selesai |
|---|---|---|---|
| 0 — Fondasi & kejujuran | Lintas-ID: `OS-GOV-006`, `OS-WEB-013`, `OS-OPS-005`, `OS-OPS-008`, `OS-OPS-009` | Rute IDM kanonis (`/idm` dialihkan), halaman status tanpa data contoh, pelanggaran lapisan domain | **Selesai 4 Nov 2026** untuk bagian yang tercantum; ID tetap 🟡 karena gap fungsional/E2E lain |
| 1 — Persuratan & TTE | `OS-SUR-001`–`OS-SUR-010`, `OS-SUR-012`–`OS-SUR-014`; `OS-OPS-012` | Varian template/PDF, QR/stempel, syarat, klasifikasi, disposisi/ekspedisi, verifikasi per peran, TTE client, API eksternal | Semua alur/keluaran ada + test non-E2E |
| 2 — Keuangan, aset, bumindes | `OS-FIN-001`–`OS-FIN-004`, `OS-FIN-006`–`OS-FIN-013` | Impor/template APBDes, varian laporan, pembukuan manual, impor dokumen, laporan aset, format buku resmi | **Non-E2E selesai 5 Nov 2026**; sisa `OS-FIN-004`/`OS-FIN-006` hanya E2E |
| 3 — Pemerintahan & kependudukan | `OS-GOV-003`–`OS-GOV-007`, `OS-GOV-009`; `OS-POP-006`, `OS-POP-010`–`OS-POP-013` | SOTK/cetak, laporan lembaga, keluaran IDM/SDGs, kandidat/hasil pemilihan, buku pembangunan, impor DTKS, PDF statistik, kartu/impor peserta | Laporan/keluaran ada + test |
| 4 — GIS & pertanahan | `OS-WIL-002`–`OS-WIL-008` | Test use case/repository, CRUD admin pertanahan, cetak peta/layer | Test non-E2E ada; CRUD lengkap |
| 5 — Web publik | `OS-WEB-001`–`OS-WEB-013`, `OS-WEB-015`–`OS-WEB-018` | Agenda, pencarian berita/galeri, SOTK, publikasi anggota, laporan, komentar/pengunjung, sosmed, teks berjalan, URL sitemap dinamis | Keluaran/UI ada + test |
| 6 — Layanan warga | `OS-WGA-001`–`OS-WGA-002`, `OS-WGA-004`–`OS-WGA-007`, `OS-WGA-009`–`OS-WGA-011` | Anti-abuse/verifikasi akun, pesan dua arah, UI verifikasi warga, lapak/produk warga, izin + rekap kehadiran | Alur warga ada + test integrasi |
| 7 — Analisis & survei | `OS-ANA-001`–`OS-ANA-006` | Parameter/bobot/skoring, klasifikasi, laporan formal, pengisian mandiri publik, integrasi formulir eksternal | Skoring/laporan ada + test |
| 8 — Modul tambahan & sistem | `OS-MOD-001`, `OS-MOD-003`–`OS-MOD-005`; `OS-OPS-002`–`OS-OPS-009`, `OS-OPS-011` | Kiosk anjungan, otomasi kehadiran, entitas pelapak/keranjang, langganan, notifikasi, plugin, sinkronisasi, API publik/inventaris/surat | Modul/alur/API ada + test |
| E2E (ditunda) | Seluruh ID yang masih 🟡 hanya karena E2E | Penambahan/perluasan uji browser | Dikerjakan setelah batch 0–8 |

**Urutan eksekusi:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → E2E. Batch 1–3
didahulukan karena menutup keluaran inti yang menahan banyak ID; batch 4–8
menyusul. Setiap batch harus memperbarui `PARITAS-OPENSID.md` pada PR yang sama.

**Progres:** Batch 0 selesai 4 Nov 2026 (IDM/status pages + pelanggaran lapisan
domain). **Batch 1 — Persuratan & TTE selesai 5 Nov 2026**:

- Selesai non-E2E: `OS-SUR-001`/`002`/`008` (varian keluaran template/PDF),
  `OS-SUR-003` (validasi lampiran syarat warga via pengaturan kategori
  "permohonan" + validasi isian), `OS-SUR-004` (impor klasifikasi + test),
  `OS-SUR-005` (rekap/filter/ekspor permohonan + notifikasi email), `OS-SUR-006` (filter,
  pagination, ekspor CSV arsip nomor), `OS-SUR-007` (verifikasi per peran),
  `OS-SUR-009`/`010`/`012` (lampiran disposisi/ekspedisi + log ekspedisi),
  `OS-SUR-013` (konfigurasi TTE per desa, klien BSrE, penyimpanan PDF TTE),
  `OS-SUR-014` (pengaturan lampiran terpusat, tertaut dari `/persuratan/surat`),
  `OS-OPS-012` (API eksternal TTE + metadata/verifikasi surat ber-API key + rate limit).
- Batch 1 **selesai sebagian** — audit ulang 5 Nov mengonfirmasi seluruh gap
  fungsional lain tertutup. Sisa non-E2E: `OS-OPS-012` (kontrak OpenAPI +
  endpoint tulis surat) dan `OS-SUR-013` (verifikasi provider BSrE nyata,
  bergantung kredensial). Gap E2E: `OS-SUR-011` (E2E-only, di luar batch) serta
  `OS-SUR-002`/`003`/`007`/`008` (E2E lanjutan).

**Batch 2 — Keuangan, aset, bumindes (selesai non-E2E 5 Nov 2026):**

- `OS-FIN-001` ✅: impor CSV/XLSX + unduh template XLSX sudah ada
  (`apbdes-import.ts` + test); ditambah **laporan realisasi format resmi**
  `/keuangan/laporan/realisasi` dengan hierarki akun, JUMLAH per akun,
  SURPLUS/(DEFISIT), PEMBIAYAAN NETTO, dan SiLPA. Domain murni
  `laporan-realisasi.ts` + `laporan-realisasi.test.ts` (12 test), ekspor CSV
  `/keuangan/laporan/realisasi/ekspor`.
- `OS-FIN-002` ✅: laporan RP APBDes + per bidang + grafik tetap; rincian
  realisasi resmi menjadi keluaran tambahan dengan CSV.
- `OS-FIN-003` ✅: pembukuan manual kas `/keuangan/pembukuan` (CRUD, saldo
  berjalan, izin `update`/`delete`, scoping tenant) sudah tersedia; saldo
  rekening koran bank tetap di luar cakupan.
- `OS-FIN-004` 🟡 (E2E impor) dan `OS-FIN-006` 🟡 (E2E periode publik):
  gap non-E2E tidak tersisa.
- `OS-FIN-007`–`OS-FIN-013` sudah ✅ (inventaris, neraca, bumindes).
- Audit 5 Nov: halaman `/keuangan/laporan`, laporan realisasi, dan ekspor
  CSV/Excel kini memeriksa resource `laporan-keuangan` (bukan `keuangan`),
  sehingga sekretaris desa dan kepala desa dapat membuka menu Laporan sesuai
  izin baca yang diberikan.

**Batch 3 — Pemerintahan & kependudukan (progres 5 Nov 2026):**

- Selesai non-E2E: `OS-GOV-003` (bagan SOTK `/konten/perangkat/sotk` + cetak +
  test), `OS-GOV-004`/`005` (laporan anggota terperinci `/kelompok/laporan` +
  ekspor CSV `/kelompok/ekspor` + test), `OS-GOV-006` (ekspor laporan IDM & SDGs
  `/desa/idm/ekspor` + test), `OS-GOV-009` (buku pembangunan `/pembangunan/buku`
  + ekspor CSV + test), `OS-POP-011` (laporan resmi program bantuan
  `/bantuan/[id]/cetak`).
- Ditutup 5 Nov 2026: `OS-GOV-007` (tabel `pemilihan_kandidat`, CRUD kandidat
  + perolehan suara, rekap & pemenang di admin dan publik, jumlah DPT),
  `OS-POP-006` (pemetaan impor DTKS di domain `rencanaImporDtks` + test baris
  ganda/tidak ditemukan), `OS-POP-012` (impor peserta per sasaran + template +
  test), `OS-POP-013` (filter kategori sasaran pada halaman & ekspor CSV/PDF,
  tautan unduh PDF, dan hitungan peserta per sasaran yang tidak lagi menghitung
  program kosong).
- Seluruh ID Batch 3 tetap 🟡 dengan `Gap: E2E` karena uji browser untuk
  keluaran baru belum ditambahkan (sesuai aturan batch: E2E ditunda).

**Batch 4 — GIS & pertanahan (non-E2E selesai 5 Nov 2026):**

- CRUD layer peta diaktifkan lewat komponen bersama `EntityManager`:
  `/pemetaan/area`, `/pemetaan/garis`, `/pemetaan/point`, `/pemetaan/polygon`
  (tautan `/pemetaan/polygon/form` yang 404 dihapus), dan `/pemetaan/simbol`.
- `/pemetaan/pertanahan` kini CRUD persil, Cdesa, dan mutasi (tambah/ubah/hapus
  berizin, scoped desa); use case `updateCdesa`/`updateCdesaMutasi` dan aksi
  barunya ditambahkan.
- Keluaran **cetak peta** publik `/desa/peta/cetak`: SVG area/garis/titik +
  legenda, tanpa tile daring, memakai domain murni `peta-cetak.ts` + test.
- Test baru: domain `pertanahan.test.ts` dan `peta-cetak.test.ts`, perluasan
  `gis/application/use-cases.test.ts` (area/garis/point/simbol/persil/Cdesa/
  mutasi), serta `gis-repository.integration.test.ts` untuk isolasi tenant,
  penyaringan layer nonaktif, dan penolakan ubah/hapus lintas desa.
- Seluruh ID Batch 4 (`OS-WIL-002`–`OS-WIL-008`) tetap 🟡 dengan `Gap: E2E`
  sampai uji browser untuk keluaran baru tersedia.
---

## Kondisi Awal (snapshot historis sebelum Fase 0)

Bagian ini menjelaskan masalah pada awal audit, bukan klaim kondisi working tree
saat ini. Status terbaru ada di tabel Status Akhir dan quality gate harus
dijalankan ulang sebelum milestone baru.

| Masalah | Bukti | Dampak |
|---|---|---|
| Build gagal | `src/features/surat/domain/isian.test.ts:50` (`TS2532`) | Tidak bisa deploy |
| 95 file belum di-commit | `git status` | Pekerjaan tanpa titik aman |
| Migrasi `0010`–`0016` untracked | `src/db/migrations` | Clone bersih kehilangan tabel |
| Halaman publik diblokir | `src/proxy.ts` hanya mengizinkan `/masuk` | Web publik tidak bisa diakses |
| Root bukan beranda desa | `src/app/page.tsx` redirect | Wajah aplikasi belum ada |
| Asumsi satu desa | `getIdentitasDesa()` = `orderBy(id).limit(1)` | Multi-desa butuh refactor |
| Dokumentasi lama | `README.md`, `docs/arsip/` | Sudah dipisahkan; jangan dipakai sebagai status aktif |

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

**Kriteria historis:** `npm run check` + `npm run build` pernah hijau dan tree
bersih pada milestone awal. Ini bukan klaim bahwa quality gate working tree saat
ini hijau; lihat **Status Akhir** dan jalankan ulang semua check sebelum
menutup milestone baru.

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
> (tidak ada lagi query `db` mentah di halaman publik). `/desa/pembangunan`,
> `/desa/peta`, dan `/desa/pertanahan` kini memakai data nyata (3B/3C/3D). Smoke
> test HTTP publik sudah tersedia; test integrasi lintas warga
> (akses antarwarga, `residentId`, dan otorisasi area warga) masih belum ada.

### 1A. Fondasi publik

- [x] **1A.1** Perbaiki `src/proxy.ts`: publik = `/`, `/desa/*`,
      `/layanan-mandiri` (halaman informasi), `/masuk`, plus berkas metadata
      (`/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/icon.svg`,
      `/opengraph-image`); sisanya terproteksi. Manifest & gambar OG dibuat
      sebagai metadata route per desa pada 25 Okt 2026 (Fase 4).
      Sejak 2C, `/layanan-mandiri/*` (dasbor warga)
      **wajib sesi**, dan pengalihan pengguna yang sudah login ditangani
      `/masuk` di server agar akun staf dan warga diarahkan ke area berbeda.
- [x] **1A.2** Beranda desa di `src/app/(public)/page.tsx` (redirect dihapus);
      `src/app/page.tsx` lama dihapus, `/desa` dialihkan ke `/`.
- [x] **1A.3** `src/app/(public)/layout.tsx`: header (logo, menu, drawer mobile,
      CTA Layanan Mandiri) + footer (tautan + kontak). *Mode gelap belum*
      (menyusul bersama mesin tema 1D).
- [x] **1A.4** `generateMetadata` per halaman + `sitemap.ts` + `robots.ts` sadar
      host (multi-domain). Manifest PWA & gambar OG per host ditambahkan 25 Okt
      2026 (lihat Fase 4). *JSON-LD belum.*
- [x] **1A.5** Halaman 404/error publik yang rapi:
      `src/app/not-found.tsx` (URL tak cocok), `src/app/(public)/not-found.tsx`
      (hasil `notFound()` dari rute publik, tetap memakai tema desa), dan
      `src/app/(public)/error.tsx` memakai prop `retry` Next 16. Smoke test:
      `/desa/tidak-ada`, `/desa/halaman/tidak-ada`, dan
      `/desa/berita/tidak-ada` mengembalikan status 404.

### 1B. Seam multi-domain (fondasi selesai, aktivasi penuh belum)

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
- [x] `/desa/pemerintahan`: perangkat + jabatan + foto (SOTK). Rute lama
      `/desa/perangkat` tidak ada.
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
- [x] `/desa/idm-sdgs` adalah halaman publik kanonis; rute lama `/idm`
      dialihkan permanen ke sana. Admin mengelola indikator dan capaian SDGs di
      `/desa/idm` dan `/desa/idm-sdgs`. Bukti:
      `features/idm/domain/idm.test.ts`, `tests/idm.e2e.ts` (CRUD admin; publik
      `/desa/idm-sdgs`), migrasi `0061_create_idm_sdgs.sql`. Keluaran laporan
      dan E2E isolasi tenant masih perlu dilengkapi (lihat `OS-GOV-006` /
      `OS-WEB-013`).
- [x] `/desa/surat`: daftar jenis surat dari DB lewat
      `listJenisSuratPublik()` + slot tema `surat`; tautan verifikasi menuju
      halaman form token yang valid. Smoke test 200.
- [x] `/desa/analisis-survei`: daftar survei aktif lewat
      `listSurveiPublik()` + slot tema `survei`; menampilkan jumlah
      pertanyaan/responden dan daftar pertanyaan. Pengisian mandiri belum
      tersedia. Smoke test 200.
- [x] `/desa/pembangunan` dan `/desa/peta` — memakai data nyata Fase 3B/3C
      (pembangunan + detail + cetak; peta Leaflet area/garis/titik/polygon).
      (`/desa/pengaduan` keluar dari daftar ini: sudah memakai data 3D.)
- [ ] `/desa/suplemen` masih menunggu backend publik. Halaman publik lapak
      (`/desa/lapak`), pemilihan (admin `/pemerintahan/pemilihan`, publik
      `/desa/pemilihan`), dan registrasi akun warga
      (`/desa/registrasi-warga`) sudah memakai data/aksi nyata. `/desa/idm-sdgs`
      (publik kanonis; `/idm` dialihkan ke sana; admin: `/desa/idm`) memakai
      data IDM/SDGs. Lihat status tiap ID di `PARITAS-OPENSID.md`.

### 1F. CMS konten

- [x] **1F.1** Resource & modul seed: `berita`, `berita-kategori`, `galeri`,
      `profil-desa`, `perangkat-desa`, `menu-publik`, `widget`, `slider`,
      `dokumen-publik`, `tema`, dan `super-admin` sudah punya slug resource +
      entri `modules.ts`. Operator mendapat `manage` untuk sepuluh modul CMS
      (tema, berita, berita-kategori, galeri, profil, perangkat, menu, widget,
      slider, dokumen); sekdes/kades `read`. Halaman `/super-admin` sendiri
      masih mockup dan belum menjadi fitur (Fase 5).
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
- [x] Semua halaman publik bisa dibuka tanpa sesi. *(Sejak 25 Okt 2026
      dibuktikan otomatis: `npm run smoke` memeriksa 24 halaman publik + 2
      berkas metadata (26 URL) wajib 200, tiga kasus 404, dan seluruh tautan
      internal pada build produksi `next start`; lulus tanpa tautan mati.)*
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
- [x] Tidak ada tautan 404. *(Dijelaskan oleh `npm run smoke`: penelusuran
      tautan internal dari halaman publik (detail berita + filter kategori)
      tidak menemukan 404; kasus 404 yang diharapkan tetap sesuai.)*
- [x] Lighthouse mobile ≥ 90 untuk performance & accessibility (target awal).
      *(Pengukuran manual; belum ada artefak yang bisa dijalankan ulang.)*
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
      anggota. **Cetak via browser** tersedia di halaman daftar.
      **Gap: laporan daftar anggota terperinci dan ekspor belum ada.**
- [x] Data perangkat dipakai halaman publik `/desa/pemerintahan` (bukan
      `/desa/perangkat`) lewat `listPerangkatDesa` + slot tema `perangkat`;
      `/desa/kelompok` menampilkan kelompok & lembaga. Smoke test produksi
      23 Okt 2026: keduanya 200. **Cetak via browser** tersedia di halaman daftar
      kelompok/lembaga. **Gap: laporan terperinci dan ekspor belum ada.**

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
      Modul `permohonan-surat` aktif di menu sejak 25 Okt 2026 dengan operator
      `manage` serta sekretaris desa & kepala desa `read`. Peran read hanya
      melihat detail: tombol proses/kembalikan/batalkan disembunyikan
      (`canManage`), dan server tetap menolak aksi tanpa izin `update`.
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
- [x] E2E alur inti surat warga (`tests/permohonan-warga.e2e.ts`; OS-WGA-004/005,
      OS-SUR-002/003/005/007/008/014): unggah syarat, kontrol unduhan lintas
      warga, pemeriksaan operator, verifikasi tiga tahap, terbit, dan unduh PDF
      privat oleh pemilik. Pembatalan/pengembalian dan variasi form belum
      tercakup dalam E2E.
- [x] Pendaftaran mandiri akun warga (OS-WGA-001): `/desa/registrasi-warga`
      memvalidasi NIK terhadap penduduk hidup desa, menolak duplikat/akun yang
      sudah ada; operator menyetujui/menolak di `/penduduk/registrasi`, dan
      persetujuan membuat akun NIK + PIN yang ditampilkan sekali. Modul + RBAC
      `registrasi-warga` terdaftar. **Gap: captcha/anti-abuse, verifikasi
      HP/email, notifikasi otomatis, audit khusus, dan E2E.**

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
      yang belum ada secara idempoten. Ringkasan buku B1–B5 dapat diisi lewat
      tombol **Sinkronisasi dari Penduduk** (`sinkronisasiBumindesAction`) di
      `/bumindes/buku-administrasi`; bukan proses otomatis terjadwal.
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
      **Cetak via browser** tersedia di halaman agenda. **Gap: E2E belum ada.**
- [x] TTE/BSRE: adapter mode `nonaktif`/`manual`/`bsre` (default nonaktif). Scaffolding di `domain/tte.ts`
      (murni + 7 test): konfigurasi dari env `TTE_*` (`parseKonfigTte`,
      mode `nonaktif`/`manual`/`bsre` — nilai asing jatuh aman ke nonaktif),
      tipe adapter `KlienTte` siap ditukar dengan klien jaringan nanti.
      `terbitkanSurat` memanggil `prosesTteSurat` (repo `setSuratTte`) yang
      keluar segera saat nonaktif — penerbitan surat tidak pernah diblokir;
      hasil `ok: false` hanya dicatat.

- [x] Arsip nomor OS-SUR-006: migrasi membentuk snapshot nomor terbit dan
      mem-backfill surat lama; penerbitan menyimpan arsip dalam transaksi yang
      sama; nomor arsip ikut mencegah pemakaian ulang setelah surat dihapus.
      UI `/persuratan/surat/arsip` menyediakan pencarian nomor/jenis dan tahun
      (maksimal 200 hasil). Test integrasi memeriksa nomor tetap ada, duplikasi
      tetap ditolak, dan sequence berlanjut setelah surat sumber dihapus.
      **Gap: E2E halaman arsip belum ada.**

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
- [x] Rekonsiliasi realisasi (P2, 24 Okt 2026): `/keuangan/rekonsiliasi`
      membandingkan realisasi tahunan APBDes dengan jumlah TW I–IV per bidang
      belanja (`domain/rekonsiliasi.ts` + 7 test), menampilkan selisih per
      bidang, status cocok/perlu dicek, dan total tahun. Murni baca; tautan
      tersedia dari halaman APBDes & Laporan Triwulan. Saldo rekening koran
      bank belum dicatat aplikasi (di luar cakupan).

### 2G. Analisis/survei (5 hari)

- [x] Modul `survey` penuh: builder soal, responden, jawaban, rekap.
      `features/survey/{domain,application,infrastructure,presentation}`.
      `/analisis-survei` berisi daftar + CRUD survei; `/analisis-survei/[id]`
      berisi builder pertanyaan (isian, angka, pilihan ganda 2–10 opsi),
      responden dengan jawaban dinamis, dan rekap per soal (distribusi +
      persentase, rata-rata/min/maks, contoh jawaban teks). Jawaban wajib
      lengkap; pilihan divalidasi terhadap opsi yang tersimpan pada soal.
      Migrasi `0023` menambah `survey_soal.pilihan`.
      **Ekspor/impor respons** (24 Okt 2026): `/analisis-survei/[id]/ekspor`
      mengunduh CSV (`Nama;NIK;Tanggal;<jawaban per soal>`), dan kartu
      "Ekspor & Impor Respons" menerima unggahan CSV dengan laporan
      diimpor/ditolak per baris (`domain/survey-csv.ts` + 13 test).
      *Belum: pengisian mandiri oleh warga dan kategori/indikator/parameter
      ala OpenSID (Fase 3F).*
- [x] Grant & modul seed konsisten: modul `analisis-survei` diaktifkan di menu;
      operator `manage`, sekdes/kades `read` (berlaku setelah `npm run db:seed`).

**Status Fase 2:** sebagian besar fitur sudah berjalan, tetapi fase belum penuh.
Fitur utama yang sudah jadi termasuk layanan mandiri warga, Bumindes
(sinkronisasi data penduduk), persuratan, keuangan (termasuk pembukuan manual
kas dan laporan realisasi resmi), inventaris, dan CMS.
Yang masih tersisa adalah notifikasi status pengaduan (WhatsApp) dan beberapa
keluaran lanjutan.

---

## Fase 3 — Paritas seluruh katalog OpenSID

Rujuk [`docs/KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md) untuk
seluruh ID kebutuhan dan `docs/PARITAS-OPENSID.md` untuk status. Urutan
implementasi berdasarkan ketergantungan domain, risiko, dan nilai operasional;
tidak ada kategori yang dikeluarkan dari target akhir.

### 3A. Kependudukan lanjutan (2 minggu)

  - [x] `OS-POP-006`: DTKS (Data Terpadu Kesejahteraan Sosial) — CRUD dari RTM di `/penduduk/dtks`, status/agregasi/anggota, lampiran, pengaturan program, laporan, ekspor CSV, dan **impor CSV/XLSX** via `DtksImportDialog` + `imporDtksAction` (menghubungkan RTM ke formulir DTKS). RBAC `penduduk`. E2E `/penduduk/dtks`. Test `dtks.test.ts`, `dtks-berkas.test.ts` (termasuk `rencanaImporDtks`: RTM tidak ditemukan, baris ganda, normalisasi). **Gap: E2E.**
  - [x] `OS-POP-002`: log/riwayat penduduk (lahir, mati, pindah, datang, perubahan
       status dasar) — `/penduduk/riwayat`, migrasi `0028`, test domain, dialog
       catat perubahan, cetak, ekspor CSV `/penduduk/riwayat/ekspor`, E2E (`tests/penduduk.e2e.ts`). Gap: —.
- [x] `OS-POP-001`: Data penduduk dasar — CRUD, pencarian, filter status, pagination, RBAC di `/penduduk`, halaman detail biodata `/penduduk/[id]`, cetak biodata per penduduk `/penduduk/[id]/cetak`, dan ekspor CSV daftar `/penduduk/ekspor`. Filter lanjutan (agama, pendidikan, pekerjaan, wilayah, umur) sudah terpasang di UI. E2E (`tests/penduduk.e2e.ts`) sudah ada. Tidak ada gap kritis.
- [x] `OS-POP-005`: DPT (Daftar Pemilih Tetap) — `/penduduk/dpt`, migrasi `elections` (`0029`), CRUD pemilihan (draf/aktif/selesai), filter lengkap, pagination, ekspor CSV, logika umur ≥17 atau sudah kawin pada tanggal pemilihan aktif, RBAC `penduduk`, tombol cetak, halaman rekap `/penduduk/dpt/rekap` + `/penduduk/dpt/rekap/ekspor`, dan halaman publik `/desa/dpt`. Test domain `dpt.test.ts` (7 case: buildDptCsv, hitungRekapDpt, buildDptRekapCsv, nama berkas) dan E2E smoke `/penduduk/dpt` (`tests/rtm-dpt.e2e.ts`). Tidak ada gap kritis.
- [x] `OS-POP-007`: Data suplemen. `/penduduk/suplemen` dengan CRUD (nama, slug, sasaran), pelacakan sasaran (penduduk/keluarga), dan agregasi jumlah terdata. Dialog `suplemen-terdata-dialog` sudah mengelola terdata penduduk/keluarga. Halaman detail `/[id]`, ekspor per suplemen, serta laporan + ekspornya tersedia. Isian dinamis (`dataFormIsian`) sudah disajikan di form terdata, dan cetak tersedia. Test domain `suplemen.test.ts` (18 case) dan `suplemen-berkas.test.ts` (10 case) tersedia; E2E smoke `/penduduk/suplemen`, `/penduduk/suplemen/1` ada. Gap: —.
  - [x] `OS-POP-010`, `OS-POP-013`: Statistik penduduk (`/statistik/penduduk` dengan gender, umur, agama, pendidikan, pekerjaan, status kawin, dusun) dan statistik bantuan (`/statistik/bantuan` per program/sasaran) tersedia dengan tabel L/P/total/% dan ringkasan. Ekspor CSV penduduk lewat `/statistik/penduduk/ekspor`. CRUD rentang umur `/statistik/rentang-umur` + ekspor dan pemilih `kind` + ekspor statistik bantuan sudah tersedia. Filter wilayah (dusun/RW/RT) dan periode (umur min/max) di statistik penduduk; filter wilayah (dusun/RW/RT) dan periode (mulai/akhir) di statistik bantuan; tombol Cetak (window.print) di keduanya sudah tersedia. E2E smoke tersedia. Gap statistik penduduk: rute `/statistik/penduduk/ekspor/pdf` belum diimplementasikan (tombol PDF dihapus agar tidak mengarah 404); saat ini hanya ekspor CSV yang tersedia. Statistik bantuan kini punya filter kategori sasaran yang diteruskan ke ekspor CSV dan PDF, tombol Unduh PDF tertaut ke `/statistik/bantuan/ekspor/pdf`, dan hitungan per sasaran memakai jumlah peserta (bukan baris program). **Gap: E2E ekspor PDF.**
  - [x] `OS-POP-011`: Program bantuan: CRUD, detail, peserta, ekspor CSV, RBAC. **Cetak via browser** tersedia di detail program (`/bantuan/[id]`). **Gap: cetak/PDF format resmi belum ada.** Test `bantuan.test.ts`; E2E `statistik-bantuan.e2e`.
  - [x] `OS-POP-012`: Peserta bantuan: kandidat sasaran tenant-aware, snapshot kartu, ubah kartu, ekspor CSV, pembersihan massal, cetak kartu via `window.print()`. **Impor peserta** CSV/XLSX via `PesertaImportDialog` + `imporPesertaAction` (kolom identitas per sasaran, unduh template, domain `impor-peserta.ts` + test). **Gap: E2E.** Test `bantuan.test.ts`; E2E detail `/bantuan/999999`.
- [x] `OS-POP-008`: Modul KIA/Stunting lengkap (migrasi `0032`, schema/domain/repo/actions, RBAC resource `kesehatan`). Halaman admin `/kesehatan/{posyandu,kia,pemantauan-ibu-hamil,pemantauan-anak}` dengan CRUD + filter posyandu client-side di tiga tabel. Halaman publik `/desa/kesehatan/{kia,ibu-hamil,pemantauan-anak}` dengan tabel baca-only + route CSV export publik. Skorcard konvergensi desa `buildSkorcardKonvergensi` (Tabel 1-4) sesuai OpenSID. Test: domain `kesehatan.test.ts` 31 case, repository `kesehatan-repository.test.ts` 4 case, application `export-use-cases.test.ts` 4 case = 39 total. E2E `tests/kesehatan.e2e.ts`.
- [x] `OS-POP-014`: Pendapat warga/jajak pendapat — migrasi `0032`, schema/domain/repo/actions, RBAC resource `pendapat`, halaman admin `/pendapat` (rekap + daftar + pagination + filter), halaman publik `/jajak-pendapat`. Rute publik `/jajak-pendapat` sudah masuk `PUBLIC_PATHS` di `src/proxy.ts` dan tautan menu publik di `PUBLIC_NAV`. Test domain `pendapat.test.ts` sudah tersedia. Ekspor CSV `/pendapat/ekspor`, hapus dari UI (`PendapatRowActions` + toast), pagination, umpan balik sukses/gagal, tautan menu publik sudah tersedia. **Pembatasan suara per warga/session via `sessionKey` (hash residentId + IP) dengan unique constraint sudah diimplementasikan (migrasi `0037`)**. Gap: filter lanjutan opsional (belum blocker).
- [x] `OS-POP-015`: Direktori kontak (daftar kontak eksternal + grup kontak) — migrasi `0032`, schema/domain/repo/actions, RBAC resource `daftar-kontak`/`grup-kontak`, halaman `/hubung-warga/daftar-kontak`, `/hubung-warga/grup-kontak`. Impor CSV (`KontakImporDialog`), ekspor CSV daftar & grup kontak, pengiriman pesan (mailto/tel/tg links di tabel), kolom `residentId` di skema (FK ke residents), form input NIK, lookup NIK `/api/penduduk/nik`, dan test domain `kontak.test.ts` (22 case). E2E smoke tersedia. (*OS-POP-009* dikeluarkan dari scope karena tidak relevan.)

### 3B. Pertanahan & peta/GIS (3 minggu)

- [x] `OS-WIL-006`: data persil, Cdesa, mutasi, rincian — skema + publik
      `/desa/pertanahan` + E2E. Sisa: admin pertanahan baru baca (belum CRUD/impor)
      dan test domain belum ada.
- [x] `OS-WIL-002`–`OS-WIL-005`: CRUD area, garis, titik, polygon + halaman admin.
      Sisa: test/E2E GIS, dan polygon belum dirender di peta publik.
- [x] `OS-WIL-007`–`OS-WIL-008`: peta publik Leaflet (area/garis/titik) + API
      `/api/peta` + katalog simbol. Sisa: layer polygon, test/E2E.\n\n**Catatan teknis migrasi:** Migrasi `0039` (`gis_map_and_tenant_hardening`) adalah migrasi hardening satu kali yang menambahkan konstriaint foreign key dan backfill `village_id` ke `cdesa_rincian`. Migrasi `0040` awalnya dianggap duplikat karena kontennya identik dengan `0039`, namun ternyata `0039` sudah tercatat di jurnal migrasi (`meta/_journal.json` idx 39) sedangkan `0040` belum pernah dijalankan — lalu diasalkan dan dihapus (file `0040_gis_map_and_tenant_hardening.sql` dan entri journal-nya). Skema saat ini sudah konsisten dengan asumsi migrasi 0039 telah dieksekusi, sehingga data `cdesa_rincian.village_id` sudah terisi dan relasi ke `villages.id` aktif.

### 3C. Pembangunan (2 minggu)

- [x] `OS-GOV-008`: sinergi program `/desa/sinergi` — CRUD (tabel, form,
      hapus), pencarian, RBAC `sinergi`, migrasi `sinergi_program`, ekspor CSV,
      test `sinergi.test.ts`. Publikasi web lewat slot tema `sinergi`
      (`/desa/sinergi-program`, menu Informasi Publik) dan E2E
      `tests/sinergi.e2e.ts` (muat, tambah/hapus, ekspor CSV, publik tanpa sesi).
      Gap: —.
- [x] `OS-GOV-009`: proyek pembangunan: rencana, realisasi, dokumentasi foto,
      hasil, dan halaman publik. Domain/repo/use case/actions + admin
      `/pembangunan` (detail + dokumentasi) + publik `/desa/pembangunan`
      (ringkasan, filter tahun, detail + cetak) + RBAC `pembangunan`.
      *(Sisa: buku pembangunan/ekspor PDF, E2E.)*

### 3D. Pengaduan warga (1 minggu)

- [x] `OS-WGA-009`, `OS-WEB-009`: backend pengaduan: skema `pengaduan`
      (migrasi `0024`), domain (`features/pengaduan/domain/pengaduan.ts`),
      use case + kirim warga (`application/use-cases.ts`,
      `kirim-pengaduan.ts`), media kategori `pengaduan`, dan Server Actions.
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
      identitas dikirim lewat Server Action, bukan URL. Email notifikasi status
      memakai Resend dengan sender dari environment (`RESEND_API_KEY` +
      `RESEND_FROM`); status domain diformat dan respons gagal provider tidak
      disamarkan sebagai sukses. Operator melihat status notifikasi pada toast
      (Resend menerima / dilewati / gagal), tetapi kegagalan email tidak
      membatalkan simpan status/tanggapan. Test `notification.test.ts`,
      `env.test.ts`, dan `presentation/actions.test.ts`; smoke browser lokal
      membuktikan warning saat email dilewati serta status tersimpan. Sisa:
      verifikasi pengiriman provider nyata, WhatsApp, dan E2E siklus lengkap.

### 3E. Dokumen, produk hukum, dan informasi publik (2 minggu)

- [x] `OS-GOV-010`: `/konten/dokumen` + publik `/desa/dokumen` (CRUD metadata,
      berkas/tautan, unggah PDF lewat UI, publikasi, E2E). Sisa: embed/peraturan
      dan alur arsip.
- [x] `OS-SUR-011`: surat dinas + arsip — selesai di Fase 2E; implementasi ada
      di `/persuratan/surat-dinas`.

### 3F. Analisis penuh (2 minggu)

- [ ] `OS-ANA-001`–`OS-ANA-004`: kategori, indikator, parameter, periode,
      respon, laporan, dan statistik jawaban.
- [x] `OS-ANA-005`: impor/ekspor respons — versi survei selesai 24 Okt 2026
      (CSV di `/analisis-survei/[id]/ekspor` + impor per baris). Sisa: format
      kategori–indikator–parameter OpenSID.

### 3G. Bumindes lengkap (1 minggu)

- [x] `OS-FIN-011`–`OS-FIN-013`: buku tanah kas, rencana/kegiatan/hasil
      pembangunan, kader, arsip, peraturan/aparat/agenda sekretariat — CRUD/UI
      `/bumindes/{tanah-kas,pembangunan,sekretariat}` dengan keluaran buku resmi
      (cetak + CSV). Status ✅ di `PARITAS-OPENSID.md`.

### 3H. Operasional & keamanan (2 minggu)

  - [x] `OS-OPS-007`: backup/restore database SQL/SQL.GZ (mysqldump/mysql), halaman `/pengaturan/database`, RBAC `database`, izin `delete` untuk restore + konfirmasi, audit log. **Tersedia/berfungsi** saat ini; optimasi (backup folder/inkremental, penanganan besar) masih menyusul. |
 - [x] `OS-OPS-006`: audit log aktivitas (login berhasil/gagal, halaman `/pengaturan/log-aktivitas`, RBAC `audit-log`, migrasi `0027`). |
 - [x] `OS-OPS-004`: lupa sandi mandiri (email/token), perkuatan rate limit login/reset, audit login/reset, link lupa sandi di halaman masuk. OTP/2FA/captcha menyusul. |
- [ ] `OS-OPS-005`: notifikasi internal, mailbox, dan SMS/WA gateway.

### 3I. Modul tambahan OpenSID

- [ ] `OS-MOD-001`: Anjungan mandiri. Admin `/anjungan` sudah CRUD penuh
      (modul + RBAC); sisa: alur kiosk publik dan test/E2E.
- [x] `OS-GOV-007`: Pemilihan desa. Admin `/pemerintahan/pemilihan` (CRUD
      pemilihan + dialog kandidat/suara) dan publik `/desa/pemilihan` (kandidat,
      rekap, pemenang). Kandidat disimpan di `pemilihan_kandidat` dengan nomor
      urut unik; rekap memakai domain `hitungRekapSuara` + test. Jumlah DPT
      ditampilkan dari modul DPT aktif. Gap: E2E pemilihan.
- [x] `OS-MOD-002`: Buku tamu — CRUD admin dan laporan; domain/application
      test tersedia. Bukti route `/buku-tamu`, modul + RBAC `buku-tamu`, dan fitur
      `src/features/buku-tamu/`.
- [ ] `OS-MOD-003`: Kehadiran perangkat. Admin `/kehadiran` sudah CRUD + modul;
      sisa: jam kerja, hari libur, izin, rekap bulanan otomatis, dan E2E.
- [ ] `OS-MOD-004`: Lapak dan produk warga. Admin `/lapak` + publik
      `/desa/lapak` sudah berdata dan berfilter; sisa: pelapak/produk terpisah,
      keranjang, peta produk, dan cetak.
- [ ] `OS-MOD-005`: Pelanggan/layanan kerja sama. `/pelanggan` sudah CRUD +
      modul; sisa: alur pendaftaran kerja sama, status langganan, dan test/E2E.

### 3J. Integrasi, API, dan kompatibilitas keluaran

- [ ] `OS-OPS-011`: API internal dengan kontrak, auth, rate limit, audit, dan
      error yang terdokumentasi.
- [x] `OS-OPS-012`: API eksternal dasar ber-API key
      (`POST /api/eksternal/tte/tanda-tangan`, `GET /api/eksternal/surat/[nomor]`),
      tenant dari host, audit, error JSON. Sisa: kontrak OpenAPI, rate limit,
      endpoint tulis surat, dan E2E.
- [x] `OS-SUR-013`: TTE operasional — konfigurasi non-rahasia per desa
      (`tte_config`), form `/persuratan/tte`, passphrase hanya dari
      `TTE_PASSWORD`, klien BSrE `buatKlienBsre` (+19 test), PDF bertanda tangan
      disimpan di media privat dan disajikan lewat route berizin. Sisa: uji
      provider nyata dan E2E. 
- [ ] Integrasi OpenDK, Siskeudes, Google Forms, email, SMS/WA, Telegram/FCM,
      dan storage eksternal memakai adapter tanpa secret di source.
- [ ] Setiap keluaran katalog memiliki cetak/PDF, impor/ekspor, unggah/unduh,
      QR/token, atau rekap bila perilaku OpenSID memilikinya.

### 3K. Penutupan katalog dan regresi

- [ ] Setiap ID `OS-*` mempunyai status dan bukti route/UI/test di matriks
      paritas.
- [ ] Tidak ada halaman placeholder, mockup, menu mati, action tanpa UI, atau
      status `✅` tanpa bukti yang dapat dijalankan.
- [x] Halaman minimal/orphan yang punya fitur nyata (`buku-tamu`, `arsip`,
      `kehadiran`, `lapak`, `pelanggan`, `anjungan`, `analisis`, `pemilihan`,
      `registrasi-warga`) sudah terdaftar di modul/menu/RBAC. Halaman
      `/pengaturan/notifikasi`, `/pengaturan/plugin`, dan
      `/pengaturan/sinkronisasi` kini menyatakan fiturnya belum tersedia tanpa
      data contoh; `/persuratan/tte` read-only; `/docs-status` halaman
      pengembangan.
- [ ] Inventaris ulang source OpenSID lokal setelah setiap rilis acuan.
- [ ] Uji unit, integrasi DB, HTTP smoke, E2E admin, E2E warga, E2E publik,
      isolasi tenant, migrasi DB kosong, dan build produksi lulus.
**Selesai bila:** seluruh ID di katalog berstatus ✅ dengan bukti implementasi
end-to-end. Status 🟡 atau 🔴 berarti target belum selesai.

## Fase 4 — Menyambungkan Web Publik ke Modul Baru (2–3 minggu)

Fokus: menyiapkan halaman publik yang telah ter-bangun di Fase 1 untuk
terkoneksi dengan modul admin yang sudah fungsi di Fase 2.

- [x] `/desa/pembangunan` memakai data Fase 3C (+ detail + cetak).
- [x] `/desa/pengaduan` memakai data Fase 3D (termasuk form kirim) — selesai
      di Fase 3D lebih awal (lihat §3D).
- [x] `/desa/peta` memakai data Fase 3B (Leaflet area/garis/titik/polygon).
      Sisa: E2E.
- [x] `/desa/dokumen` + produk hukum memakai Fase 3E. Sisa: embed/peraturan
      (unggah PDF tersedia di `/konten/dokumen`).
- [x] `/desa/statistik` + `/desa/apbdes` memakai use case publik. Sisa: finalisasi
      periodisasi dan E2E.
- [x] `/desa/dpt` dan `/desa/kesehatan/*` memakai data; `/desa/idm-sdgs`
      (publik kanonis; `/idm` dialihkan) dan `/desa/idm` (admin) memakai use
      case IDM/SDGs (lihat `OS-GOV-006` dan `OS-WEB-013`). `/desa/suplemen`
      masih menunggu backend publik.
- [x] `/desa/lapak` memakai data nyata dengan pencarian + filter kategori;
      sisa: entitas pelapak/produk terpisah dan keranjang.
- [x] `/pengaturan/plugin`, `/pengaturan/sinkronisasi`, dan
      `/pengaturan/notifikasi` menampilkan status "belum tersedia" tanpa data
      contoh. Belum ada implementasi fungsional.

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
- [ ] Sinkronkan `AGENTS.md`, `README.md`, `docs/README.md`,
      `KATALOG-FITUR-OPENSID.md`, `ARCHITECTURE.md`, `LOG-PERKEMBANGAN.md`,
      `RENCANA-PERBAIKAN.md`, dan `PARITAS-OPENSID.md`; pastikan tidak ada
      dokumen status baru di luar peta dokumentasi.
- [ ] Aturan: PR yang mengubah status fitur wajib memperbarui dokumen status.

---

## Urutan & Estimasi

| Fase | Isi | Estimasi | Milestone |
|---|---|---|---|
| 0 | Stabilisasi | 1 hari | **M0** build hijau, tree bersih |
| 1 | Web publik + tema + CMS | 3–4 minggu | **M1** wajah aplikasi selesai |
| 2 | Admin existing berfungsi penuh | 4–5 minggu | **M2** tidak ada menu mati |
| 3 | Paritas seluruh katalog OpenSID | re-estimasi setelah inventaris ID | **M3** seluruh katalog selesai |
| 4 | Sambungkan web publik ke modul baru | 2–3 minggu setelah backend | **M4** situs publik penuh data |
| 5 | Multi-desa | 4–6 minggu | **M5** super admin + domain |
| 6 | Hardening & docs | 2 minggu setelah fitur | **M6** siap produksi |

Estimasi Fase 3 tidak dikunci sebelum setiap ID katalog memiliki acceptance
criteria dan dependensi. Angka lama 7–8 bulan hanya catatan estimasi target
parsial, bukan janji penyelesaian seluruh OpenSID.
Fase 1 dan 2 tidak bisa paralel penuh karena berbagi skema konten/auth; setelah
itu pekerjaan dapat dipecah berdasarkan domain tanpa melewati quality gate.

---

## Quality Gate (setiap fase)

1. `npm run check` + `npm run build` lulus.
2. Tidak ada impor `infrastructure` dari `presentation`/`app`, kecuali adapter
   binary/media yang sudah didokumentasikan.
3. Setiap action dipakai minimal satu komponen UI.
4. Setiap perubahan skema punya migrasi + snapshot ter-commit.
5. Test jalur sukses **dan** gagal (transisi, otorisasi, scoping, XSS).
6. Data warga dari sesi; `villageId` publik dari host.
7. Semua ID katalog memiliki status dan bukti.
8. Dokumentasi status diperbarui.

## Definition of Done (per fitur)

- UI mencakup seluruh operasi domain (bukan hanya daftar).
- Otorisasi di application layer.
- Validasi Zod di domain.
- Tidak ada tautan/aksi mati, placeholder, mockup, atau action tanpa UI.
- Konten HTML tersanitasi dan unggahan divalidasi.
- Semua keluaran yang diwajibkan sumber tersedia.
- Status di dokumen sesuai kenyataan dan menunjuk ke test yang dapat dijalankan.

---

## Risiko Utama

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope membesar karena target seluruh OpenSID | Tidak pernah selesai | Katalog ID, dependency graph, milestone per domain, dan review berkala |
| Tema runtime upload | Celah eksekusi kode | Tema compiled + opsi DB (1D.8) |
| PIN 6 digit | Brute force | Rate limit + lockout + reset operator |
| Approval berjenjang salah tahap | Aset berubah tanpa otorisasi | State machine + test |
| Asumsi satu desa terbawa | Multi-desa mustahil | Seam 1B sekarang |
| Cache lintas tenant | Kebocoran data | Cache key per host/desa |
| Lisensi GPL OpenSID | Kewajiban lisensi | Tiru perilaku, jangan salin kode/aset |
| Estimasi meleset | Kepercayaan turun | Milestone per fase, review tiap M |

---

## Status Dokumen

Diperbarui 29 Oktober 2026 dari audit dokumen vs kode (angka & status
diselaraskan kembali dengan route, halaman, test, dan E2E yang benar-benar ada).
Audit konsistensi 4 November 2026 mengoreksi URL publik IDM, status halaman
notifikasi/plugin/sinkronisasi, klaim unggah PDF dokumen, mode adapter TTE, dan
asumsi akun warga. Tindak lanjut hari yang sama: `/idm` dialihkan permanen ke
`/desa/idm-sdgs`, halaman status dibuat jujur, dan pelanggaran lapisan domain
`@/db` dihapus. Urutan prioritas: web publik → admin berfungsi → paritas
OpenSID → multi-desa.

---

## Status Akhir (diperbarui 5 November 2026)

| Fase | Status | Catatan |
|------|--------|---------|
| 0 — Stabilisasi | ✅ **Terverifikasi pada snapshot 31 Okt** | `npm run check` dan build pernah lulus pada snapshot 31 Okt 2026. Itu bukti historis; jalankan quality gate ulang sebelum menutup milestone baru. |
| 1 — Web Publik + Tema + CMS | 🟡 **Sebagian** | Fondasi, tema, dan sebagian besar CMS selesai; pembangunan/peta/pertanahan memakai data. `/desa/lapak` memakai katalog + pencarian/filter nyata; IDM/SDGs sudah memakai data nyata. |
| 2 — Admin existing berfungsi | 🟡 **Sebagian** | Banyak modul inti berjalan; pembukuan manual, notifikasi, dan beberapa keluaran lanjutan masih tersisa. |
| 3 — Paritas seluruh katalog OpenSID | 🔴 **Belum selesai** | Register 113 ID: 35 berfungsi penuh, 77 sebagian, 0 belum ada; `OS-POP-009` di luar scope. Batch 2 menaikkan `OS-FIN-001`/`002`/`003`; sisa gap Batch 2 hanya E2E. Register diverifikasi `src/db/paritas-register.test.ts`. |
| 4 — Sambungkan web publik ke modul | 🟡 **Sebagian** | Pengaduan, pembangunan, peta, pertanahan, IDM/SDGs, lapak, widget/CMS, manifest, dan OG sudah tersambung; sisa gap ada di keluaran analisis dan entitas pelapak. |
| 5 — Multi-desa | 🟡 **Fondasi** | Resolusi host dan isolasi publik tersedia; provisioning, super-admin, domain kustom, dan uji penuh belum. |
| 6 — Hardening & Dokumentasi | 🔴 **Belum selesai** | E2E domain admin/warga, audit keamanan menyeluruh, dan runbook belum lengkap; workflow CI telah dikonfigurasi untuk menjalankan suite browser E2E. |

**Keseluruhan fase:** tidak boleh disamakan dengan persentase paritas fitur.
Paritas harus dihitung dari seluruh ID katalog dan hanya boleh meningkat jika
status per ID memiliki bukti UI, test, dan quality gate.

**Catatan rute:** `/pengaturan/plugin`, `/pengaturan/notifikasi`, dan
`/pengaturan/sinkronisasi` menampilkan status "belum tersedia" tanpa data contoh;
ketiganya belum menjadi modul operasional. `/desa/lapak` memakai data nyata
(katalog + pencarian/filter); halaman IDM/SDGs memakai data (admin `/desa/idm`
dan `/desa/idm-sdgs`, publik `/desa/idm-sdgs`; rute lama `/idm` dialihkan ke
sana). Admin pemilihan berada di `/pemerintahan/pemilihan`, sedangkan halaman
publiknya di `/desa/pemilihan`.

Masalah kritis yang perlu diperbaiki sebelum lanjut:
1. ~~Verifikasi surat IDOR~~ — **selesai P0**: token acak + hash, tenant-aware, `await params`, dan halaman form token. QR gambar dibuat 24 Okt 2026 (SVG di halaman cetak, PNG di PDF).
2. ~~Sebagian halaman publik masih mengimpor repository langsung~~ —
   **selesai**: beranda, berita, galeri, profil, pemerintahan, bantuan,
   halaman statis, dan pertanahan kini lewat use case publik; tidak ada lagi
   query `db` mentah di halaman publik.
3. RBAC: slug resource `pengaduan` + `pembangunan` sudah ditambahkan; halaman
   super-admin masih mockup dan belum menjadi fitur.
4. Route typo `pertanaha` → `pertanahan` (sudah diperbaiki).
5. ~~Halaman statistik publik hardcoded `"0"`~~ — **selesai**: memakai
   `getStatistikPublik()`.
6. E2E warga surat (`tests/permohonan-warga.e2e.ts`) membuktikan kepemilikan
   lampiran/PDF dan alur sampai surat terbit. **Masih perlu** uji HTTP khusus
   akun tanpa `residentId`, proteksi `requireWarga`, serta operasi selain surat.
7. ~~`npm run lint` gagal karena scaffold `docs-status`~~ — **selesai**:
   lint lulus tanpa error maupun warning (29 Okt 2026).
8. ~~`npm run typecheck` gagal pada docs-status, Bumindes, dan E2E~~ —
   **selesai**: `npm run typecheck` lulus.
9. ~~`docs-status` masih scaffold~~ — **selesai**: API, model typed, halaman
   admin, dan smoke E2E sudah tersedia.
10. E2E kini berjumlah 25 berkas (`tests/*.e2e.ts`, 103 test) dan dijalankan
    CI lewat `npx e2e run`; alur surat warga, admin+publik Sinergi, verifikasi
    publik, dan statistik sudah lulus pada DB bermigrasi + ter-seed. Kualitasnya
    belum merata: hanya `permohonan-warga.e2e.ts` dan `sinergi.e2e.ts` yang
    meng-assert kode status HTTP; sisanya memeriksa URL/teks/visibilitas.
    Smoke HTTP publik tidak menggantikan uji interaksi/otorisasi/unggah/transaksi.
11. Isolasi `villageId` untuk SiLPA, Lapak, Buku Tamu, Arsip, dan Kehadiran
    diuji di lapisan data oleh `src/features/isolasi-village.integration.test.ts`
    (dua desa nyata, termasuk uji update/delete lintas desa). Berkas scaffold
    `tests/isolation.e2e.ts` yang hanya memeriksa URL sudah dihapus.
12. Rute orphan yang punya fitur nyata (`buku-tamu`, `arsip`, `kehadiran`,
    `lapak`, `pelanggan`, `anjungan`, `analisis`, `pemilihan`,
    `registrasi-warga`) sudah didaftarkan di modul/menu/RBAC (4 Nov 2026).
    Sisa: `/pengaturan/plugin`, `/pengaturan/notifikasi`,
    `/pengaturan/sinkronisasi`, `/persuratan/tte`, dan `/docs-status` belum
    menjadi modul operasional.
13. ~~Pencarian lapak, arsip, pelanggan, dan suplemen memakai `ilike`~~
    **selesai**: MySQL/MariaDB tidak mendukung `ILIKE`, sehingga pencarian
    gagal `ER_PARSE_ERROR`. Diganti `like` (collation bawaan case-insensitive)
    dan dibuktikan `isolasi-village.integration.test.ts`.
