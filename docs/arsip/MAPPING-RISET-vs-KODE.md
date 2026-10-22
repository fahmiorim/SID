> **ARSIP HISTORIS — jangan dipakai untuk status fitur.**
> Digantikan oleh [`../PARITAS-OPENSID.md`](../PARITAS-OPENSID.md). Lihat
> [`README.md`](./README.md).

# Pemetaan Riset vs Kode Saat Ini (SID Desa)

Dokumen ini melacak kesesuaian fitur/modul antara `docs/riset/*` dengan implementasi saat ini di `src/`. 
Tujuannya untuk mengukur dan menargetkan peningkatan persentase kesesuaian secara terarah.

Terakhir diperbarui: 2025-10-20

## Ringkasan Kesesuaian Saat Ini

| Kategori | Target Ideal | Saat Ini | Status |
|----------|-------------|----------|--------|
| **Inti (Kependudukan, Keluarga, Wilayah, RTM)** | 95% | ~95% | ✓ Baik |
| **Autentikasi & RBAC** | 95% | ~90% | ✓ Baik (penyederhanaan level lebih baik) |
| **Persuratan (dasar)** | 90% | ~75% | ⚠ Perlu dilengkapi |
| **Keuangan APBDes** | 90% | ~75% | ⚠ Perlu dilengkapi |
| **Bantuan Sosial** | 85% | ~70% | ⚠ Perlu dilengkapi |
| **Inventaris & Aset** | 80% | ~10-20% | ✗ Gap besar |
| **Analisis/Survei** | 60% | 0% | ✗ Belum ada |
| **Bumindes, Web, Layanan Mandiri** | 60% | ~30% | ✗ Perlu pengembangan |
| **Keseluruhan (Fungsional Inti)** | 85% | ~75% | ⚠ Dalam proses |

## Matriks Perbandingan Per Modul

### A. Autentikasi, RBAC & Pengaturan

| Fitur dari Riset | Ada di Kode | Status | Prioritas | Catatan |
|-------------------|-------------|--------|-----------|---------|
| Login username/password | `src/features/auth/`, `src/lib/auth.ts` | Ada | - | Menggunakan better-auth ✓ |
| Role/Grup pengguna | `src/features/rbac/`, `src/features/pengguna/` | Ada | - | Skema lebih bersih dengan `read/write/manage` |
| Matriks izin per modul | `src/features/rbac/` | Ada | - | `role_permissions` dengan level |
| Pewarisan anak→induk | `computeEffectivePermissions()` di rbac | Ada | - | Implementasi sesuai pola riset ✓ |
| Super admin bypass | `requirePermission`/logic di rbac | Ada | - | `slug === "administrator"` bypass ✓ |
| Modul `beranda` selalu terbaca | Ada di logic RBAC | Ada | - | Sesuai ✓ |
| Batasi wilayah per pengguna | Belum teridentifikasi jelas | Sebagian | P2 | Ada konsep tenant `village_id` tapi scoping wilayah per user belum terimplementasi penuh seperti di riset |
| OTP/2FA | Tidak ada | Belum | P3 | Riset punya OTP & 2FA, belum diprioritaskan |
| Reset password | Melalui better-auth | Ada | - | Tergantung konfigurasi better-auth |

### B. Kependudukan, Keluarga, Wilayah, RTM

| Fitur dari Riset | Ada di Kode | Status | Prioritas | Catatan |
|-------------------|-------------|--------|-----------|---------|
| Data penduduk lengkap | `src/features/penduduk/` | Ada | - | Sudah lengkap |
| Kartu Keluarga | `src/features/keluarga/` | Ada | - | Kepala keluarga diturunkan dari anggota ✓ (lebih baik dari riset) |
| Wilayah administratif (Dusun/RW/RT) | `src/features/wilayah/` | Ada | - | Ada |
| Rumah Tangga (RTM) | `src/features/rumah-tangga/` | Ada | - | Keanggotaan eksklusif ✓ |
| Referensi (agama, pendidikan, pekerjaan, dll.) | `src/features/penduduk/` (referensi) | Ada | - | Global tanpa `village_id` ✓ |
| Log/mutasi penduduk | Belum terlihat eksplisit | Belum/Sedikit | P2 | Riset punya `log_penduduk`, `log_keluarga` untuk audit trail |
| Validasi NIK unik per desa | Ada di skema/use-case | Ada | - | Sesuai |

### C. Persuratan

| Fitur dari Riset | Ada di Kode | Status | Prioritas | Catatan |
|-------------------|-------------|--------|-----------|---------|
| Jenis/klasifikasi surat (master) | `src/features/surat/` + `src/app/(admin)/persuratan/jenis/`, `klasifikasi/` | Ada | - | Sudah ada |
| Layanan surat (konsep → terbit) | `src/features/surat/application/surat-use-cases.ts` | Ada | - | Alur dasar ada |
| Agenda surat masuk/keluar | `src/app/(admin)/persuratan/surat-masuk/`, `surat-keluar/` | Ada | - | Ada |
| Cetak HTML/PDF | Ada di use-case + halaman cetak | Ada | - | `pdf-lib` tersedia |
| Penomoran otomatis (4 mode) | `buildSuratNumber()` di domain | Sebagian | **P0** | Hanya mode dasar, perlu dukung semua mode dari riset + deteksi duplikat |
| Verifikasi berjenjang (operator→sekdes→kades) | Belum terlihat | Belum | **P0** | Sangat penting untuk parity |
| Template TinyMCE + form isian dinamis | Template sederhana via string | Sebagian | **P0** | Perlu `form_isian` JSON, `kode_isian` kustom |
| Ekspansi placeholder `klgx_*` | Belum ada | Belum | **P0** | Untuk anggota keluarga di surat |
| TTE (BSRE) | Tidak ada | Belum | P1 | Integrasi eksternal, bisa ditunda |
| QR verifikasi publik | Tidak ada | Belum | P1 | Bisa ditunda awal |
| Syarat surat per jenis | Tidak ada eksplisit | Belum | P1 | Perlu master syarat |
| Permohonan surat mandiri | Tidak ada | Belum | P2 | Layanan mandiri terpisah |

### D. Keuangan (APBDes)

| Fitur dari Riset | Ada di Kode | Status | Prioritas | Catatan |
|-------------------|-------------|--------|-----------|---------|
| Pohon rekening (COA) | `src/features/keuangan/` | Ada | - | `keuangan_template` |
| Pagu anggaran & realisasi per tahun | Ada | Ada | - | Sesuai Lapis A |
| Agregasi ke rekening induk | Ada di logic | Ada | - | Sudah ada |
| RP APBDes (ringkasan) | Ada | Ada | - | Sesuai |
| Realisasi belanja per bidang | Ada | Ada | - | Sesuai |
| Ekspor CSV/Excel | Ada | Ada | - | Sudah ada |
| Arsip dokumen laporan per semester | `keuangan_laporan` | Ada | - | Sesuai |
| Laporan triwulan | Tidak terlihat | **Selesai** (`keuangan_triwulan`, input + laporan per bidang) | **P0** | Sering diminta, ada di riset LAMPIRAN-10 |
| Impor Siskeudes (Lapis B) | Tidak ada | Belum | P1 | Kompleks, bisa bertahap |
| Lapis C (rincian kegiatan/sub-kegiatan) | Tidak ada | Belum | P2 | Belum terimplementasi |
| SiLPA otomatis antartahun | Tidak ada | Belum | P2 | Perlu perhitungan otomatis |

### E. Bantuan Sosial

| Fitur dari Riset | Ada di Kode | Status | Prioritas | Catatan |
|-------------------|-------------|--------|-----------|---------|
| Program bantuan (definisi) | `src/features/bantuan/` | Ada | - | Sesuai |
| Peserta bantuan (penduduk/keluarga/RTM) | Ada | Ada | - | Penautan FK eksplisit ✓ |
| Snapshot kartu peserta | Ada | Ada | - | Sesuai |
| Dedupe peserta per program | Ada | Ada | - | Sesuai |
| Sebaran peserta per wilayah | Ada | Ada | - | Sesuai |
| Status masa aktif dihitung | Ada di logic | Ada | - | Lebih baik dari tersimpan |
| Penautan ke kelompok | Tidak terlihat | Belum | P1 | Ada di roadmap |
| Unggah berkas kartu | Tidak ada | Belum | P1 | Belum ada |
| Ekspor/import peserta Excel | Tidak ada | Belum | P1 | Belum ada |
| Integrasi DTKS/Regsosek | Tidak ada | Belum | P2 | Fondasi bisa disiapkan |

### F. Inventaris & Aset

| Fitur dari Riset | Ada di Kode | Status | Prioritas | Catatan |
|-------------------|-------------|--------|-----------|---------|
| Inventaris (umum) | Hampir tidak ada | Belum | **P0** | Gap terbesar - hanya ada sedikit jejak |
| Kategori aset (tanah/gedung/jalan/peralatan/konstruksi) | Tidak ada | Belum | **P0** | Perlu dibangun |
| Mutasi aset (hapus/pindah/rusak) | Tidak ada | Belum | **P0** | Sangat penting, perlu menghindari bug yang disebut di riset |
| Laporan inventaris | Tidak ada | Belum | P1 | Perlu dibangun |
| Tanah Desa/Kas Desa | Tidak ada | Belum | P2 | Di luar scope awal mungkin |

### G. Lain-lain

| Fitur dari Riset | Ada di Kode | Status | Prioritas | Catatan |
|-------------------|-------------|--------|-----------|---------|
| Analisis/Survei (mesin indikator) | Tidak ada | Belum | P3 | Sangat kompleks, jarang prioritas awal |
| Bumindes (buku administrasi) | Sedikit | Sebagian | P2 | Ada beberapa buku, jauh lebih sedikit dari acuan |
| Layanan Mandiri (warga) | Tidak terlihat jelas | Belum/Sedikit | P2 | Belum terimplementasi signifikan |
| Web Publik Desa | Tidak terlihat | Belum/Sedikit | P2 | Belum ada |

## Rencana Aksi Konkret

### Fase 1: Audit & Mapping (Minggu 1) - SEGERA
- [x] Baca semua dokumen riset (sudah dilakukan)
- [x] Buat mapping ini (sudah dibuat)
- [ ] Buat checklist verifikasi per fitur dengan detail path file
- [ ] Hitung persentase per modul secara objektif

### Fase 2: Persuratan Lanjutan (Minggu 2) - PRIORITAS TERTINGGI
**Target: 75% → 90%**

**Yang perlu ditambahkan:**
1. **Verifikasi berjenjang** - Tambah status/verifikasi di skema surat (operator, sekdes, kades) + action
2. **Mode penomoran surat** - Perluas `buildSuratNumber` untuk dukung 4 mode seperti di riset
3. **Deteksi duplikat nomor** - Tambah validasi saat issue surat
4. **Form isian dinamis** - Skema untuk `form_isian` per jenis surat
5. **Ekspansi placeholder** - Tambah dukung `klgx_*` untuk anggota keluarga
6. **Syarat surat** - Master syarat + checklist

**File yang perlu dimodifikasi/dibuat:**
- `src/features/surat/domain/surat.ts` - perluas skema & logic penomoran
- `src/features/surat/application/surat-use-cases.ts` - tambah verifikasi
- `src/features/surat/infrastructure/surat-repository.ts` - query untuk verifikasi
- `src/features/surat/presentation/actions.ts` - actions verifikasi
- `src/db/schema/surat.ts` - perluas skema jika diperlukan

### Fase 3: Keuangan Triwulan (Minggu 3) - PRIORITAS
**Target: 75% → 90%**

**Yang perlu ditambahkan:**
1. **Laporan triwulan** - ✅ halaman input & laporan dari nilai tersimpan per triwulan
2. **Realisasi per bidang terperinci** - Sudah ada, perlu dipoles
3. **Struktur untuk impor Siskeudes** (pondasi)

### Fase 4: Inventaris Dasar (Minggu 4) - PRIORITAS TINGGI
**Target: 10% → ~70%**

**Yang perlu dibangun dari nol:**
1. **Skema** - `inventaris_asset`, `mutasi_inventaris_asset` minimal
2. **Domain** - validasi, aturan mutasi
3. **Repository** - CRUD + mutasi
4. **Use-case** - dengan validasi hapus yang aman (hindari bug)
5. **Presentation** - daftar, form, mutasi, laporan sederhana

**Kunci:** Mulai minimal, fokus pada alur mutasi yang benar.

## Rekomendasi

**Fokus pada "porting aturan", bukan "porting tabel":**
- Jangan buat 243 tabel, buat yang benar-benar dipakai
- Ambil logic kritis dari riset (penomoran, verifikasi, agregasi) dan sesuaikan dengan pola proyek
- Pertahankan perbaikan yang sudah ada (lebih baik dari acuan)

**Target realistis:** **~85% kesesuaian fungsional untuk modul inti** dalam 4-6 minggu ke depan dengan fokus pada Fase 2-4 di atas.

Saya siap mulai mengerjakan sesuai urutan prioritas. Mau mulai dari **Fase 2 (Persuratan Lanjutan)** atau ada prioritas lain yang lebih mendesak?