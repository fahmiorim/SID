# Log Perkembangan

Catatan pekerjaan yang sudah selesai, diverifikasi, dan ter-commit.
Aturan: satu klaim = satu bukti (path file + test). Jangan klaim "selesai"
untuk fitur yang hanya berupa placeholder tanpa backend.

---

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
