> **ARSIP HISTORIS — jangan dipakai untuk prioritas kerja.**
> Digantikan oleh [`../RENCANA-PERBAIKAN.md`](../RENCANA-PERBAIKAN.md). Lihat
> [`README.md`](./README.md).

# Rekomendasi Selanjutnya

Berdasarkan pemetaan UX yang udah kita buat, selanjutnya ada 2 pilihan tergantung tujuan kamu.

## Pilihan 1: Lanjut ke Implementasi (Eksekusi Proyek)
Kita mulai tutup gap P0 supaya aplikasi terasa sama persis buat user OpenSID.

**Urutan eksekusi P0 (wajib biar nggak ada yang kurang):**

| Urutan | Modul | Fokus | Estimasi |
|---|---|---|---|
| **1. Persuratan** | `src/features/surat/` + skema DB | Verifikasi berjenjang (operator→sekdes→kades), form isian dinamis + ekspansi `klgx_*`, 4 mode penomoran, deteksi duplikat nomor | ~1–1.5 minggu |
| **2. Inventaris/Aset** | Buat feature baru `src/features/inventaris/` | Skema minimal + kategori, data inventaris, **mutasi** (pindah/rusak/hapus). Ini prioritas karena gap-nya paling besar & langsung terasa hilang | ~1–1.5 minggu |
| **3. Layanan Mandiri** | `src/features/layanan-mandiri/` (atau perluas `surat`) | Alur permohonan surat warga (syarat, status 0–5, approval admin, cetak setelah disetujui) | ~0.5–1 minggu |

**Setelah P0 selesai:** kesamaan UX naik ke **~91–93%** (sesuai target). Baru lanjut P1 (Laporan Triwulan Keuangan) kalau diperlukan.

## Pilihan 2: Lanjut Rapiin Dokumentasi Dulu
Bisa kita lengkapi checklist verifikasi per fitur (file terpisah) + hitung baseline persentase objektif per modul berdasarkan mapping UX ini. Ini berguna buat tracking progress nanti saat implementasi.

**Rekomendasi saya:** **Mulai Pilihan 1 (Implementasi P0)**. Karena tujuan utama kamu udah jelas: biar UX-nya sama buat pengguna OpenSID, nggak ada fitur yang kurang/proses yang dipotong. Jadi lebih efektif langsung eksekusi mulai dari Persuratan dulu.

Kamu mau mulai eksekusi dari **Persuratan (urutan #1)** atau ada preferensi lain?
