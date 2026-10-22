---## 2026-10-26 — Fase 3 (Prioritas T1+T2)

- **APBDes publik** (`/desa/apbdes`): Halaman publik laporan anggaran dan keuangan desa menggunakan schema `keuangan` dengan kolom `templateUuid`, `tahun`, `anggaran`, `realisasi`
- **Status Desa & IDM** (`/desa/status-des`): Halaman profil desa lengkap dengan field nama desa, kecamatan, kabupaten, provinsi, kepala desa, NIP, kode desa, dan ringkasan inventaris per kategori
- **IDM & SDGs** (`/desa/idm-sdgs`): Halaman laporan keuangan triwulan (TW I-IV) per bidang beserta indikator SDG 1 (Kemiskinan) dan SDG 8 (Ekonomi) dengan perhitungan persentase realisasi terhadap pagu
- **Produk Hukum (Surat)** (`/desa/surat`): Daftar jenis surat publik (Keterangan, Kelahiran, Kematian, Perkawinan) dengan tautan ke halaman verifikasi surat `/verifikasi-surat/[token]`
- **Analisis & Survei** (`/desa/analisis-survei`): Halaman hasil survei dan kuesioner masyarakat desa dengan tampilan survey aktif dan daftar pertanyaanine

- Verifikasi: `npm run check` hijau (typecheck, lint, format), `npm run test` 389 test lulus.

Sampai Fase 3 selesai, dapat melanjutkan ke fase berikutnya.

---## 2026-10-26 — Fase 4 (Prioritas T4)

- **Pembangunan** (`/desa/pembangunan`): Halaman publik laporan proyek pembangunan desa dengan realisasi dan pagu anggaran
- **Pengaduan** (`/desa/pengaduan`): Halaman masukan dan pengaduan warga desa untuk ditangani oleh admin
- **Peta** (`/desa/peta`): Halaman peta area dan batas wilayah desa
- **Dokumen** (`/desa/dokumen`): Daftar dokumen administrasi publik (surat keterangan, kelahiran, kematian, perkawinan)
- **Statistik** (`/desa/statistik`): Halaman statistik lengkap desa (penduduk, penerima bantuan, anggaran)

- Penambahan: 5 halaman baru dibuat dari nol dengan struktur UI konsisten
- Fix: IDM & SDGs (`/desa/idm-sdgs`) dibaiki parameter search `?tahun=` dari URL query string
- Verifikasi: `npm run check` hijau (typecheck, lint, format), `npm run test` 389 test lulus.

Sampai Fase 4 selesai, dapat melanjutkan ke Fase 5 multi-desa.