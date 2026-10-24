# Log Perkembangan

Catatan pekerjaan yang sudah selesai, diverifikasi, dan ter-commit.
Aturan: satu klaim = satu bukti (path file + test). Jangan klaim "selesai"
untuk fitur yang hanya berupa placeholder tanpa backend.

---

## 2026-10-24 — Refactor use-case publik + backend pengaduan (3D) + skema pembangunan

Tercatat pada commit `9509c76` (use case publik), `52fe71b` (pengaduan),
`5e93972` (skema 0023–0024), `af846f2` (sesi warga per halaman):

- **Refactor use case publik**: halaman publik tidak lagi mengimpor repository
  langsung. Baru: `features/publik/application/konten-publik.ts` (beranda,
  berita, galeri, profil, pemerintahan, halaman statis),
  `bantuan/application/publik-use-cases.ts` (halaman bantuan), dan
  `pertanahan-publik.ts` (pengganti query `db` mentah di `/desa/pertanahan`;
  data sementara dari inventaris hingga modul pertanahan ada). Halaman yang
  dirombak: `page.tsx` publik yang tercantum di `git status` (beranda, berita,
  galeri, pemerintahan, profil, bantuan, halaman, pertanahan).
- **3D Pengaduan — backend saja** (belum ada UI): domain murni
  `features/pengaduan/domain/pengaduan.ts` (kategori, status, format nomor
  tiket, `samarkanNama`), use case `application/use-cases.ts`,
  `application/kirim-pengaduan.ts` (unggah lampiran ke media kategori
  `pengaduan`), repository, dan Server Actions. Skema `pengaduan` dibuat di
  migrasi `0024` (unik `(village_id, nomor_tiket)`, index publik & status).
  Slug RBAC `pengaduan` ditambahkan ke `resources.ts`; modul belum diaktifkan
  di menu.
- **Skema pembangunan (3C)**: `pembangunan_proyek` + `pembangunan_dokumentasi`
  di migrasi `0024` + `schema/pembangunan.ts`; slug RBAC `pembangunan`.
  Backend & UI belum ada.
- **Area warga**: `verifyWargaPage()` baru di `src/lib/dal.ts` untuk gerbang
  halaman paralel; halaman `(warga)` memakainya.
- **Bukti**: `npm run check` hijau (469 test / 42 file) dan `npm run build`
  hijau. Test domain pengaduan/pembangunan belum dibuat; halaman publik
  pengaduan & pembangunan masih placeholder.

---

## 2026-10-24 — 2G: analisis & survei

Tercatat pada commit `1470775` (+ skema di `5e93972`).

- **Lapisan**: `features/survey/{domain,application,infrastructure,presentation}`.
  Domain memuat tipe soal (`text`/`number`/`choice`), skema zod, parsing opsi,
  validasi jawaban, dan rekap murni; use case menegakkan izin serta memastikan
  survei induk milik desa sesi (tabel anak tidak menyimpan `village_id`).
- **UI admin**: `/analisis-survei` (ringkasan + daftar + CRUD survei) dan
  `/analisis-survei/[id]` (builder pertanyaan dengan opsi 2–10, responden dengan
  field jawaban dinamis, rekap per soal). Jawaban wajib lengkap; pilihan
  divalidasi terhadap opsi yang tersimpan, bukan nilai kiriman klien.
- **Rekap**: distribusi + persentase untuk pilihan ganda, rata-rata/min/maks
  untuk angka, dan contoh jawaban untuk isian.
- **Skema**: migrasi `0023` menambah `survey_soal.pilihan` (JSON array).
- **Seed**: modul `analisis-survei` diaktifkan di menu; operator `manage`,
  sekdes/kades `read`. Jalankan `npm run db:seed`.
- **Bukti**: `npm run check` hijau (469 test / 42 file, termasuk 20 test baru
  `domain/survey.test.ts`) dan `npm run build` hijau. **Belum diuji ke DB**
  karena MySQL dev tidak aktif; jalankan `npm run db:migrate` + `npm run db:seed`
  lalu uji alur survei di browser.
- **Batasan**: pengisian mandiri oleh warga, kategori/indikator/parameter ala
  OpenSID, serta impor/ekspor respons belum tersedia.

## 2026-10-24 — 2D: buku administrasi desa (Bumindes)

Tercatat pada commit `013e22a`.

- **Lapisan**: `domain/bumindes.ts` (katalog buku inti, skema zod item, helper
  nomor urut), `application/use-cases.ts` (izin `read/update/delete` + tenant),
  `presentation/actions.ts` kini hanya memanggil use case. `/bumindes`,
  `/bumindes/buku-administrasi`, dan halaman detail tidak lagi mengimpor
  repository/db.
- **Katalog buku inti**: A1–A8 (administrasi umum), B1–B5 (penduduk induk,
  KTP/KK, mutasi, rekapitulasi, sementara), E1 (tanah di desa). Seed
  idempoten: kode bawaan lama ditata ulang lebih dulu (`B1` Tanah Kas Desa →
  `A5`, `C1` Agenda → `A6`, `C2` Ekspedisi → `A7`, `D1` Tanda Tangan → `A8`,
  `B2` Tanah di Desa → `E1`) tanpa melepas item, lalu buku yang belum ada
  ditambahkan. Desa baru langsung mendapat seluruh katalog.
- **CRUD item**: dialog tambah/ubah (nomor urut, tanggal, uraian, keterangan),
  hapus berkonfirmasi, nomor urut berikutnya disarankan otomatis. Keunikan
  nomor urut diperiksa server per (desa, buku) dan ditolak sebagai konflik;
  indeks unik DB belum dipasang karena data lama mungkin sudah berisi nomor
  ganda.
- **Hak akses**: operator mendapat `manage` untuk modul `bumindes` agar dapat
  menghapus item (sebelumnya `write` sehingga hapus hanya bisa super admin).
  Jalankan `npm run db:seed` agar grant ini berlaku.
- **Bukti**: `npm run check` hijau (449 test / 41 file, termasuk 13 test baru
  `domain/bumindes.test.ts`) dan `npm run build` hijau. **Belum diverifikasi
  ke DB** karena MySQL dev tidak aktif saat pengerjaan; uji reconcile seed pada
  desa yang sudah punya buku lama masih perlu dilakukan setelah DB hidup.

## 2026-10-24 — 2C: akun warga (NIK + PIN) & layanan mandiri

Tercatat pada commit `91cbf4b` (+ gerbang halaman di `af846f2`); status dokumen
otoritatif sudah diperbarui agar tidak mendahului kode.

- **Akun warga**: operator membuat akun dari baris tabel penduduk
  (`penduduk-row-actions.tsx` → `KredensialWargaDialog`). PIN 6 digit dibuat
  acak (`generatePin`), ditampilkan **sekali** dengan tombol salin, dan hanya
  hash-nya disimpan. Penduduk wajib berstatus hidup dan punya NIK 16 digit;
  satu penduduk hanya boleh punya satu akun (indeks unik `users.resident_id`,
  migrasi `0022`).
- **Login**: `username` = NIK, password = PIN. `minPasswordLength` better-auth
  diturunkan ke 6, kebijakan staf ≥ 8 tetap di `domain/pengguna.ts`; rate limit
  login 5 percobaan/menit untuk `/sign-in/username`. `signInAction` membaca
  `residentId`/`mustChangePin` dari DB lalu mengarahkan warga ke
  `/layanan-mandiri/ubah-pin` atau `/layanan-mandiri/beranda`, dan menolak
  akun staf yang mencoba masuk area warga.
- **Area warga** `(warga)`: beranda (ringkasan + permohonan terbaru), ajukan
  surat (isian dinamis + unggah syarat), riwayat dengan catatan operator,
  dokumen (unduh PDF + tautan verifikasi), pesan, profil, dan ubah PIN.
  `verifyWargaSession` menjaga layout; `requireWarga`/`requireWargaAktif`
  menjaga action & route. `residentId` selalu dari sesi.
- **Pengajuan surat**: syarat diambil dari `letter_requirements` (bukan `"[]"`),
  divalidasi lengkap, lalu berkas disimpan di media privat kategori
  `permohonan`. Route `/api/publik/media/*` menolak kategori tersebut; unduhan
  hanya lewat route ber-otentikasi (pemilik atau operator).
- **Operator**: `/permohonan-surat` menampilkan kartu status, filter, detail
  permohonan, dan aksi proses/kembalikan/batalkan. “Buat konsep surat” memakai
  use case persuratan (penomoran tidak diduplikasi), menyimpan
  `permohonan_surat.letter_id`, lalu status permohonan menjadi 2. Saat Kades
  menerbitkan surat status menjadi 3; saat surat ditolak menjadi 5 dengan
  alasan.
- **Migrasi**: `0022` menambahkan `permohonan_surat.letter_id` + FK + indeks,
  serta indeks unik `users.resident_id`.
- **Bukti**: `npm run check` hijau (436 test / 40 file) dan `npm run build`
  hijau. Test domain: `src/features/warga/domain/warga.test.ts` (5) dan
  `src/features/layanan-mandiri/domain/layanan-mandiri.test.ts` (4).
  **Belum ada** test integrasi HTTP/DB untuk akses lintas warga, akun tanpa
  `residentId`, atau paksa ganti PIN.

## 2026-10-23 — 2B: perangkat desa & lembaga

- Modul jabatan master sudah tersedia di `/konten/perangkat` lewat
  `JabatanManager`; tidak memerlukan route terpisah.
- `/kelompok` menangani kelompok & lembaga (filter tipe, kategori, CRUD) serta
  anggota lewat `AnggotaDialog`; halaman publik `/desa/pemerintahan` dan
  `/desa/kelompok` mengembalikan 200 pada build produksi.
- Bukti: `perangkat.test.ts`, `kelompok.test.ts`, smoke test 23 Okt 2026.

## 2026-10-23 — 1G: verifikasi tema, konten, dan Lighthouse

- **Tema & opsi**: uji admin `/konten/tema` pada build produksi `next start`;
  mengganti tema esensi → natra dan menyimpan warna primer/radius/judul hero
  langsung terlihat di beranda publik tanpa rebuild. `revalidatePath` layout +
  halaman publik `force-dynamic` menjaga perilaku ini. Bukti: uji browser 23
  Okt 2026, `theme.test.ts`, `registry.test.ts`.
- **Konten publik**: draft dan berita `published` berjadwal tidak muncul di
  `/desa/berita`; detail keduanya 404. Slug duplikat ditolak indeks unik
  (`ER_DUP_ENTRY`). HTML berisi `<script>`, `onerror=`, dan `javascript:` yang
  disisipkan langsung ke DB tersanitasi saat render. Slug kategori/album/jabatan
  kini menyisakan ruang akhiran unik agar tetap muat kolom. Bukti: uji integrasi
  `next start` + DB dev, `slug.test.ts`, `berita.test.ts`, `galeri.test.ts`,
  `perangkat.test.ts`, `media.test.ts`, `sanitize.test.ts`.
- **Lighthouse mobile** (build produksi): performance 97, accessibility 100
  setelah kontras teks footer dinaikkan ke `text-foreground/70`.
- **Verifikasi**: `npm run check` (423 tes / 38 file), `npm run build`, dan
  Lighthouse 12 lulus. P1 selesai; lanjut Fase 2.

## 2026-10-23 — Perbaikan P0 (blocker kompilasi, tenant, token verifikasi)

- **Inventaris/mutasi**: halaman dipecah menjadi server page + `MutasiManager`
  client. `getMutasiPageData()` kini mengembalikan opsi barang, `canWrite`, dan
  `canManage`; formulir memakai `ActionState` terbaru dan approval satu tahap
  (`setujui`/`tolak`) berfungsi. Bukti: `npm run typecheck`, `npm run build`,
  `npm run test` (391 tes).
- **APBDes publik**: memperbaiki destructuring `const [rows]` yang membuat
  `.map()` gagal; query kini memakai array baris.
- **Verifikasi surat**: token mentah disimpan bersama hash-nya, tautan
  verifikasi ditampilkan di halaman cetak, `params` di-`await`, dan
  `/desa/verifikasi-surat` ditambahkan sebagai form token. Proxy tidak lagi
  memuat path `/verifikasi-surat` yang tidak ada.
- **CMS tenant**: `/konten/dokumen` dan `/konten/menu` tidak lagi memakai
  `villageId` hardcoded atau mengimpor modul `server-only` di komponen client.
  Halaman kini membaca data nyata lewat use case; menu action memakai
  `resolveVillageId` + izin, dan update/delete menu dibatasi per desa.
- **Test**: menambah test token verifikasi (format, hash cocok, token unik).

Sisa P1: CRUD inventaris/kategori, CRUD menu/widget/slider/dokumen, dan
approval mutasi berjenjang + penerapan perubahan ke aset.

---

## 2026-10-23 — P1.0 & P1.1 (dokumentasi, CRUD inventaris, mutasi berjenjang)

- **Dokumentasi**: `PARITAS-OPENSID.md` dihitung ulang dari baris matriks —
  92 modul, 22 ✅ / 23 🟡 / 47 🔴, paritas kasar ±36%. Catatan duplikat di
  bagian Web Publik dihapus; status perangkat desa, inventaris, APBDes publik,
  status desa/IDM, dan verifikasi surat diselaraskan dengan kode. `README.md`
  dan `RENCANA-PERBAIKAN.md` tidak lagi mengklaim inventaris read-only atau
  UI warga/admin yang belum ada.
- **Inventaris CRUD**: `/inventaris` memakai `InventarisManager`; tambah/ubah
  barang lengkap (kategori, nilai, kondisi, lokasi, asal) dan hapus soft-delete.
  `/inventaris/kategori` menyediakan CRUD kategori dengan cek duplikat kode dan
  larangan hapus kategori yang masih dipakai. Modul `inventaris` dan
  `mutasi-inventaris` diaktifkan di seed; sekdes/kades mendapat akses baca
  inventaris dan tulis mutasi.
- **Mutasi berjenjang**: state machine `nextMutasiStep()` (operator → sekdes →
  kades), validasi role, larangan lompat tahap/approve ganda/self-approval,
  serta timeline tahap di UI. Perubahan aset diterapkan hanya di tahap akhir
  dalam satu transaksi: pindah → lokasi, rusak/perbaikan → kondisi, hapus →
  kurangi jumlah atau soft-delete. Tahap nonfinal hanya mencatat verifikator.
- **Migrasi**: `0021_bumpy_old_lace.sql` menambahkan kolom token verifikasi
  surat, `users.must_change_pin`/`users.resident_id`, dan
  `perangkat_desa.periode`; snapshot dan `_journal.json` ikut sehingga migrasi
  bersih tidak lagi tertinggal dari skema.
- **Bukti**: `npm run check` hijau (405 test) dan `npm run build` hijau.
  Test baru: `src/features/inventaris/domain/inventaris.test.ts` (14 test
  transisi dan perhitungan aset). Test integrasi DB untuk race/tenant belum ada;
  isolasi tenant saat ini ditegakkan lewat filter `village_id` di repository.

---

## 2026-10-23 — P1.2 (CRUD CMS menu, widget, slider, dokumen)

- **CRUD CMS**: `/konten/menu`, `/konten/widget`, `/konten/slider`, dan
  `/konten/dokumen` kini memakai satu `CmsCrudManager` bersama (dialog form,
  tabel, konfirmasi hapus, toast, error per-field). Halaman tetap server
  component dengan cek `NoAccess`; permission `read/update/delete` dipakai
  konsisten. Operator mendapat `manage`, sekdes/kades `read`.
- **Isolasi tenant**: `updateWidget`, `deleteWidget`, `updateDokumenPublik`,
  dan `deleteDokumenPublik` sekarang memfilter `village_id` + `id`. Sebelumnya
  hanya `id`, sehingga action dengan id desa lain bisa menyentuh baris tersebut.
  Use case juga memeriksa keberadaan baris di desa sesi sebelum update/delete.
- **Repository**: daftar admin memuat baris nonaktif (`includeInactive`);
  `listWidget`/`listDokumenPublik` mengembalikan `aktif` (widget juga `urut`);
  CRUD slider ditambahkan; slug dokumen dicek unik per desa dan dinormalisasi
  dengan `buatSlug`.
- **Validasi**: menu menolak induk hilang, diri sendiri, induk bertingkat,
  siklus, dan penghapusan menu yang masih punya submenu; dokumen mewajibkan
  berkas atau tautan; widget memvalidasi jenis 1–6 dan JSON `pengaturan`;
  slider mewajibkan gambar. Test baru: `domain/cms.test.ts` (10 test).
- **Batasan**: unggah berkas dokumen belum ada (path/URL manual); widget dan
  teks berjalan belum dirender di tema publik. Halaman publik yang masih query
  DB langsung tetap menjadi pekerjaan P1.3.
- **Bukti**: `npm run check` hijau (415 test) dan `npm run build` hijau.

---

## 2026-10-23 — Audit Dokumentasi vs Kode

### Temuan
- `LOG-PERKEMBANGAN.md` sebelumnya berisi klaim "Fase 3 & 4 selesai" yang tidak
  sesuai kode. Tiga halaman publik (Pembangunan, Pengaduan, Peta) hanya
  placeholder kosong dengan komentar TODO merujuk ke Fase 3B/3C/3D.
- Tidak ada feature module `pembangunan`, `pengaduan`, atau `peta` di
  `src/features/`. Backend belum dibangun.
- Halaman `/desa/apbdes`, `/desa/status-des`, `/desa/idm-sdgs`, `/desa/surat`,
  `/desa/analisis-survei` sudah ada dan query DB langsung, tetapi melanggar
  konvensi arsitektur (harusnya lewat use case, bukan langsung ke repository).
- Typo route: `src/app/(public)/desa/pertanaha/page.tsx` (kurang huruf 'n').
- `PARITAS-OPENSID.md` belum diperbarui sejak audit awal — matriks Web Publik
  masih menunjukkan 0 ✅ / 1 🟡 / 19 🔴 padahal banyak halaman sudah ada.

### Tindakan
- Tulis ulang `LOG-PERKEMBANGAN.md` ini dengan catatan yang akurat.
- Perbarui checklist `RENCANA-PERBAIKAN.md` Fase 1E untuk menandai halaman
  placeholder sebagai `[ ]` (belum selesai) dan halaman yang query DB sebagai
  🟡 sebagian.
- Status Akhir di `RENCANA-PERBAIKAN.md` dikoreksi: Fase 3–5 belum selesai.

---

## 2026-10-22 — Fase 1F.4–1F.6 (CMS Profil, Perangkat, Menu, Widget, Slider, Dokumen)

- **Profil desa** (`/konten/profil`): CRUD visi/misi/sejarah/sambutan/koordinat,
  HTML disanitasi. Bukti: `src/features/konten/*profil*`, halaman admin.
- **Perangkat desa** (`/konten/perangkat`): CRUD perangkat + jabatan + foto +
  penanda tangan. Bukti: `src/features/konten/*perangkat*`, halaman admin.
- **Menu, widget, slider** (`/konten/menu`, `/konten/widget`, `/konten/slider`):
  Halaman admin terbangun dan tervalidasi.
- **Dokumen publik** (`/konten/dokumen`): CRUD dokumen publik dengan form nama,
  slug, kategori, tahun, berkas/tautan, status.
- Verifikasi: `npm run check` hijau.

---

## 2026-10-22 — Fase 1E (Halaman Publik Gelombang 1)

Halaman publik berikut sudah dibuat dengan struktur UI konsisten:

| Halaman | Status | Bukti |
|---------|--------|-------|
| `/` beranda | ✅ Berfungsi | `src/app/(public)/page.tsx` |
| `/desa/berita` + detail | ✅ Berfungsi | `src/app/(public)/desa/berita/` |
| `/desa/galeri` + detail | ✅ Berfungsi | `src/app/(public)/desa/galeri/` |
| `/desa/pemerintahan` | ✅ Berfungsi | `src/app/(public)/desa/pemerintahan/page.tsx` |
| `/desa/bantuan` | ✅ Berfungsi | `src/app/(public)/desa/bantuan/page.tsx` |
| `/desa/halaman/[slug]` | ✅ Berfungsi | `src/app/(public)/desa/halaman/[slug]/page.tsx` |
| `/desa/kontak` | ✅ Berfungsi | `src/app/(public)/desa/kontak/page.tsx` |
| `/desa/apbdes` | 🟡 Query DB, UI dasar | `src/app/(public)/desa/apbdes/page.tsx` |
| `/desa/status-des` | 🟡 Query DB, profil lengkap | `src/app/(public)/desa/status-des/page.tsx` |
| `/desa/idm-sdgs` | 🟡 Query DB, realisasi=anggaran | `src/app/(public)/desa/idm-sdgs/page.tsx` |
| `/desa/surat` | 🟡 Hardcoded, bukan dari DB | `src/app/(public)/desa/surat/page.tsx` |
| `/desa/analisis-survei` | 🟡 Query DB, hanya judul | `src/app/(public)/desa/analisis-survei/page.tsx` |
| `/desa/pembangunan` | 🔴 Placeholder kosong | `src/app/(public)/desa/pembangunan/page.tsx` |
| `/desa/pengaduan` | 🔴 Placeholder kosong | `src/app/(public)/desa/pengaduan/page.tsx` |
| `/desa/peta` | 🔴 Placeholder kosong | `src/app/(public)/desa/peta/page.tsx` |
| `/desa/dokumen` | ✅ Ada | `src/app/(public)/desa/dokumen/page.tsx` |
| `/desa/statistik` | ✅ Ada | `src/app/(public)/desa/statistik/page.tsx` |
| `/verifikasi-surat/[token]` | ✅ Ada | `src/app/(public)/desa/verifikasi-surat/[token]/page.tsx` |

**Catatan:** Halaman 🟡 dan 🔴 belum memenuhi Definition of Done. Yang 🔴
menunggu backend Fase 3B/3C/3D dibangun terlebih dahulu.

---

## Sebelum 2026-10-22 — Fase 0, 1A–1D, 2A

Lihat commit history dan `RENCANA-PERBAIKAN.md` untuk detail checklist
yang sudah `[x]`. Ringkasan:

- **Fase 0**: Stabilisasi — build hijau, migrasi ter-commit, seed idempoten.
- **Fase 1A**: Fondasi publik — proxy, layout, metadata, sitemap.
- **Fase 1B**: Seam multi-domain — `resolveVillageByHost()`, tenant isolation.
- **Fase 1C**: Skema konten & media — migrasi 0018, slug unik, sanitasi unggahan.
- **Fase 1D**: Mesin tema — registry statis, kontrak, opsi per desa, dua tema.
- **Fase 2A**: Inventaris + approval berjenjang — state machine, mutasi, UI CRUD.
