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
