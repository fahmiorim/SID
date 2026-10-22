# Log Perkembangan

Catatan pekerjaan yang **sudah selesai**. Status per milestone tetap di
[`RENCANA-PERBAIKAN.md`](./RENCANA-PERBAIKAN.md); dokumen ini hanya kronologi.

Format entri: tanggal — ringkasan — commit (bila ada).

---

## 2026-10-22 — Audit & konsolidasi dokumentasi

- Audit implementasi vs dokumentasi dan source OpenSID di
  `D:\laragon\www\opensid`.
- Membuat `PARITAS-OPENSID.md`: matriks 85 modul (16 ✅, 13 🟡, 56 🔴).
- Menyusun ulang `RENCANA-PERBAIKAN.md`: web publik → admin → paritas →
  multi-desa.
- Mengarsipkan 6 dokumen usang ke `docs/arsip/` dan menambahkan penanda
  "ARSIP HISTORIS".
- Menambahkan `docs/README.md` sebagai peta dokumentasi + aturan sumber
  kebenaran.
- Menghapus komponen placeholder yang tidak terpakai.
- Memperbaiki tautan mati di halaman `/desa`.

**Catatan:** pekerjaan fitur belum dimulai pada entri ini; fokusnya
membersihkan sumber yang saling bertentangan agar fase berikutnya tidak salah
acuan.

---

## 2026-10-23 — Fase 0 selesai kode + Fase 1A/1B (fondasi web publik)

**Fase 0 (stabilisasi kode):**

- `replaceGrants` kini melempar galat bila grant role merujuk modul tak dikenal;
  grant `peserta-bantuan` yang silent-skip dihapus (peserta dikelola dalam
  `program-bantuan`).
- Audit pola `[angka].` pada test: bersih.
- Migrasi & seed terverifikasi dari DB kosong; `db:migrate` idempoten; job CI
  `migrate` ditambahkan di `.github/workflows/ci.yml`.
- Migrasi baru `0017` (`villages.domain`, unik).

**Fase 1A (fondasi publik):**

- `src/proxy.ts`: allowlist publik baru (beranda, `/desa/*`, `/layanan-mandiri`,
  `/masuk`, `/verifikasi-surat`, berkas metadata) — `/sitemap.xml` &
  `/robots.txt` tidak lagi dialihkan ke login.
- Beranda nyata di `src/app/(public)/page.tsx`: hero identitas desa, statistik
  kependudukan (total/L/P/KK), surat terbit terbaru, kontak.
- `src/app/(public)/layout.tsx` + header (logo, nav, drawer mobile, CTA) dan
  footer.
- Halaman publik baru dengan data nyata: `/desa/profil`, `/desa/statistik`,
  `/desa/pemerintahan`, `/desa/kontak`, `/desa/apbdes` (transparansi, query
  publik tanpa izin), `/desa/bantuan`, `/desa/dokumen`; `/desa/berita` &
  `/desa/galeri` menampilkan empty state jujur.
- `/layanan-mandiri` publik = halaman informasi/CTA warga; halaman admin
  dipindah ke `/permohonan-surat` dan slug resource RBAC menjadi
  `permohonan-surat`.
- `sitemap.ts` + `robots.ts` sadar-host (multi-domain), berbagi
  `getRequestOrigin()`.

**Fase 1B (seam multi-domain, belum diaktifkan):**

- `domain/host.ts` (normalisasi host + alias `www`) dengan test.
- `resolveVillageByHost()` / `getIdentitasFromRequest()`: domain → alias `www`
  → fallback single-village → 404.
- `getIdentitasDesa(villageId)` wajib argumen; `getIdentitas()` sadar sesi.

**Verifikasi:** `npm run typecheck`, `lint`, `format:check` hijau; `vitest`
23 file / 293 test lulus; `npm run build` hijau (41 rute).

**Catatan:** semua perubahan **belum di-commit** (Fase 0.3/0.4). Fase 1C (skema
konten), 1D (mesin tema), 1E (halaman lanjutan), 1F (CMS) belum dimulai.

---

## 2026-10-23 — Commit Fase 0 + Fase 1C (skema konten & media)

**Commit Fase 0:** seluruh pekerjaan berjalan di-commit per domain (9 commit
`07268d1`..`98f40c2`: db, inventaris, bumindes, layanan-mandiri, persuratan,
keuangan, kependudukan, publik, docs).

**Fase 1C (skema konten & media):**

- `src/db/schema/content.ts` + migrasi `0018`: `profil_desa`, `jabatan_perangkat`,
  `perangkat_desa`, `berita_kategori`, `berita`, `galeri_album`, `galeri_foto`,
  `menu_publik`, `widget`, `slider`, `dokumen_publik`, `halaman_statis`. Semua
  membawa `village_id`; slug unik **per desa**.
- `features/publik/domain/slug.ts` (`buatSlug`, `slugUnik`) + test.
- `features/publik/infrastructure/media-storage.ts` (pola `laporan-storage.ts`):
  simpan/baca/hapus media per tenant + `simpanUnggahanMedia`.
- `features/publik/domain/media.ts`: allowlist MIME, batas ukuran, nama aman,
  ekstensi dari MIME + test.
- `/api/publik/media/[...path]`: penyaji media sadar-tenant (segmen pertama
  wajib = `villageId` host; tolak traversal; cache immutable).
- `features/publik/infrastructure/content-repository.ts`: query publik
  (berita, kategori, galeri, slider, profil, perangkat, dokumen, menu, widget,
  halaman, slug untuk sitemap) — semua difilter `villageId`.
- `src/lib/sanitize.ts` (`sanitasiHtml`, `teksPolos`) + test XSS; komponen
  render `_components/konten-html.tsx` (sanitasi lapisan kedua).
- Halaman publik kini berisi data nyata: beranda (sambutan, slider, berita
  terbaru), `/desa/berita` (+ filter kategori) & `/desa/berita/[slug]`,
  `/desa/galeri` & `/desa/galeri/[slug]`, `/desa/profil` (visi/misi/sejarah/
  lokasi), `/desa/pemerintahan` (SOTK), `/desa/dokumen`, dan
  `/desa/halaman/[slug]`. Header memakai menu DB (`menu_publik`) dengan fallback
  statis. `sitemap.ts` memuat berita/album/halaman per tenant.
- Seed konten awal (`db/seed/data/konten.ts` + `seedKonten`): profil, jabatan +
  perangkat contoh, kategori berita, satu berita, tiga dokumen, menu bawaan.
  Idempoten.

**Verifikasi:** `npm run check` hijau (typecheck + lint + format + vitest
26 file / 321 test); `npm run build` hijau; `db:migrate` + `db:seed` idempoten
dari DB kosong; smoke test HTTP: seluruh halaman publik 200, media sadar-tenant
(404 desa lain, 400 traversal).

**Catatan:** pekerjaan ini belum di-commit. Fase berikutnya: 1D (mesin tema),
1E (halaman lanjutan), 1F (CMS konten), 1B.5/1B.6 (cache/cookie per-tenant +
test isolasi dua desa).

---

## 2026-10-23 — Fase 1D (mesin tema) selesai

**Skema & domain:**

- `src/db/schema/theme.ts` + migrasi `0019`: tabel `theme` (`village_id`,
  `slug`, `nama`, `versi`, `sumber`, `aktif`, `opsi` JSON; unik per
  `(village_id, slug)`).
- `features/publik/domain/theme.ts`: `ThemeManifest`, `THEME_SLOTS`,
  `themeOptionsSchema` (Zod), `parseThemeOptions` (toleran data lama),
  `themeCssVars`, `kontrasTeks`. Test: 12 kasus.
- `features/publik/domain/tema.ts`: resource RBAC `tema`, skema form admin,
  `opsiKeForm`.
- `features/publik/infrastructure/theme-repository.ts`: baca/tulis tema per desa;
  `application/tema-use-cases.ts`: `getTemaAktif` (cache per request),
  `simpanPengaturanTema`, `gantiTemaAktif` — otorisasi diperiksa di use case.

**Tema terpasang** (`src/themes/`):

- Kontrak `kontrak.ts` (`ThemeComponents`) + props per slot di `types.ts` +
  registry statis `registry.ts` (slug asing → tema bawaan, tanpa import dinamis)
  + katalog manifest murni `manifests.ts` (aman diimpor skrip seed).
- `esensi` (default, satu kolom) dan `natra` (aksen berwarna); `natra`
  mengekspor ulang halaman `esensi` yang tidak dikustomisasi.
- `features/publik/application/siapkan-tema.ts`: resolusi desa dari host, menu
  publik, tema aktif, dan CSS variable; dipakai `(public)/layout.tsx`.
- Seluruh halaman rute publik kini hanya mengambil data lalu memilih komponen
  tema; komponen lama `_components/public-{header,footer,placeholder}.tsx` dan
  `konten-html.tsx` dihapus (dipindah ke `src/themes/ui.tsx`).
- `domain/menu.ts` memuat `susunMenu` + navigasi bawaan (dipindah dari
  presentasi).

**Admin:**

- `/konten/tema`: kartu pilihan tema + form opsi (warna, font, kelengkungan,
  hero, varian header, susunan beranda, menu/kontak footer), dengan pratinjau
  aktif. `presentation/tema-actions.ts` memanggil use case; modul `tema`
  ditambahkan ke seed (`Konten` → `tema`) beserta grant operator/sekdes/kades.

**Verifikasi:** `npm run check` hijau (29 file / 339 test), `npm run build`
hijau; migrasi `0019` + `db:seed` idempoten; ganti tema lewat DB terlihat
langsung di situs publik (atribut tema + CSS variable berubah).

**Catatan:** `1A.5`, `1B.5`, `1B.6`, `1E` (halaman lanjutan), dan `1F` (CMS
konten) masih terbuka. Lihat status di `RENCANA-PERBAIKAN.md`.

---

## 2026-10-23 — Fase 1B.6 (uji isolasi tenant)

- Aturan host → desa diekstrak ke `features/desa/domain/tenant.ts`
  (`susunPetaDesa`, `villageIdDariHost`) — murni, tanpa DB atau `next/headers`.
- `resolveVillageByHost` memuat `listVillageDomains()` sekali per permintaan
  lalu memakai aturan tersebut; query per kandidat (`getVillageIdByDomain`)
  dan `countVillages` dihapus.
- `domain/tenant.test.ts`: dua desa/dua host tidak saling bocor, normalisasi
  port/huruf/`www`, host asing → `null` saat multi-desa, fallback hanya untuk
  instalasi satu desa, dan instalasi kosong.

**Verifikasi:** `npm run check` hijau (30 file / 348 test). Uji HTTP dengan dua
host nyata menyusul bersama aktivasi multi-desa.

---

## 2026-10-23 — Fase 1F.1–1F.2 (CMS berita & kategori)

- Resource & modul baru: `berita` (`/konten/berita`) dan `berita-kategori`
  (`/konten/berita/kategori`), dengan grant operator (`manage`) serta
  sekdes/kades (`read`). Seed kini menyiapkan 39 modul.
- `features/konten`: domain (skema form, status draf/terbit, slug, tanggal
  terbit efektif), repository scoped `villageId`, use case dengan otorisasi,
  slug unik per desa, kategori tervalidasi milik desa yang sama, sanitasi HTML
  saat simpan, serta unggah sampul (gambar) dan lampiran (PDF) memakai
  penyimpanan media 1C.
- Admin: `/konten/berita` (pencarian, filter status, paginasi, headline),
  `/konten/berita/baru`, `/konten/berita/[id]`, dan pengelolaan kategori.
  Menghapus berita ikut membersihkan media; mengganti media menghapus berkas
  lama; kategori yang dihapus membuat berita menjadi tanpa kategori.
- Test domain: 11 kasus (validasi form, slug, kategori, tanggal terbit).

**Verifikasi:** `npm run check` hijau (31 file / 359 test), `npm run build`
hijau (rute `/konten/berita`, `/konten/berita/[id]`, `/baru`, `/kategori`).
`db:seed` idempoten. Runtime: seluruh halaman admin 200 untuk sesi operator,
daftar menampilkan berita seed, filter `draft`/`published`/pencarian bekerja,
dan CRUD repository (kategori + berita, termasuk slug) diuji langsung ke DB dev
lalu dibersihkan.

**Belum diuji:** submit form lewat browser (Server Action + unggah berkas);
galeri, profil, perangkat, menu, widget, slider, dan dokumen belum dibangun.

---

## 2026-10-23 — Fase 1F.3 (CMS galeri)

- Modul & resource `galeri` (`/konten/galeri`): operator `manage`, sekdes/kades
  `read`; seed kini menyiapkan 40 modul.
- `features/konten`: domain album/foto (validasi, slug, batas 20 berkas per
  unggah), repository scoped `villageId`, use case dengan otorisasi.
- Unggah: sampul album + banyak foto sekali kirim; MIME/ukuran divalidasi lewat
  helper bersama baru `features/publik/application/simpan-berkas-media.ts`
  (dipakai juga oleh berita). Berkas yang gagal tidak membatalkan berkas lain
  dan alasannya dikembalikan ke UI.
- Pembersihan: ganti sampul menghapus berkas lama; hapus foto menghapus
  berkasnya; hapus album mengumpulkan jalur foto **sebelum** baris dihapus lalu
  membersihkan disk (FK `cascade` hanya menghapus baris).
- Admin: `/konten/galeri` (daftar album, sampul, jumlah foto, status) dan
  `/konten/galeri/[id]` (unggah banyak foto, ubah judul/keterangan/urutan,
  aktif, penanda slider, hapus).
- Test domain: 6 kasus (album, foto, slug).

**Verifikasi:** `npm run check` hijau (32 file / 365 test), `npm run build`
hijau (`/konten/galeri`, `/konten/galeri/[id]`), `db:seed` idempoten.
Runtime: CRUD album/foto + unggah PNG nyata ke `storage/media` diuji ke DB dev;
album uji tampil di `/konten/galeri`, `/konten/galeri/[id]`, `/desa/galeri`, dan
`/desa/galeri/<slug>`, lalu dihapus beserta berkasnya (terverifikasi bersih).

**Belum diuji:** unggah lewat form browser (Server Action). Berikutnya: 1F.4
profil & perangkat desa, lalu 1F.5 menu/widget/slider dan 1F.6 dokumen.

---

## 2026-10-23 — Fase 1F.4 (CMS profil desa & perangkat desa)

- Modul & resource `profil-desa` (`/konten/profil`) dan `perangkat-desa`
  (`/konten/perangkat`): operator `manage`, sekdes/kades `read`; seed kini
  menyiapkan 42 modul.
- `features/konten` profil: form visi (teks), misi (satu butir per baris),
  sejarah & sambutan (HTML disanitasi), koordinat divalidasi `lat, lng`;
  repository `upsertProfil` (satu baris per desa); seed desa baru tetap mengisi
  `PROFIL_SEED` sehingga instalasi tidak kosong.
- `features/konten` perangkat: CRUD perangkat (gelar, NIP/NIK, jenis kelamin,
  tanggal lahir, foto, status, urutan, penanda tangan) dan katalog jabatan
  (slug unik, urutan). Jabatan yang dihapus tidak menghapus perangkat — FK
  `set null`, perangkat hanya kehilangan jabatan.
- Berkas: foto lama dibersihkan saat diganti/dihapus; perangkat yang masih
  dirujuk tidak dihapus filenya sebelum baris dihapus.
- Admin: `/konten/profil` (form tunggal + pratinjau tautan situs) dan
  `/konten/perangkat` (tabel aparatur + pengelolaan jabatan dalam satu halaman).
- Test domain: 11 kasus (profil: koordinat, isian kosong; perangkat: slug
  jabatan, NIK 16 angka, tanggal, status/jenis kelamin, label, normalisasi
  pilihan kosong). Sanitasi HTML terjadi di use case.

**Verifikasi:** `npm run check` hijau (34 file / 376 test), `npm run build`
hijau (`/konten/profil`, `/konten/perangkat`), `db:seed` idempoten. Runtime:
simpan profil + CRUD perangkat/jabatan + unggah foto nyata diuji ke DB dev,
halaman publik `/desa/profil` dan `/desa/pemerintahan` merender data baru tanpa
sesi, penghapusan jabatan menyisakan perangkat dengan jabatan kosong, lalu data
uji dibersihkan.

**Belum diuji:** submit form lewat browser (Server Action + unggah berkas).
Berikutnya: 1F.5 menu/widget/slider, lalu 1F.6 dokumen publik.
