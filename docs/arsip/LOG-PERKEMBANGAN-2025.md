> **ARSIP HISTORIS.** Log aktif ada di
> [`../LOG-PERKEMBANGAN.md`](../LOG-PERKEMBANGAN.md). Lihat
> [`README.md`](./README.md).

# Log Perkembangan - Analisis/Survei (P3 - Kerangka)

Menambah kerangka Analisis/Survei (indikator) agar tidak kosong:
- Skema: survey, survey_soal, survey_jawaban, survey_responden
- Repo + actions sederhana
- UI dasar `/analisis-survei`
Biarkan bertahap, sesuai kebutuhan lapangan.

# Log Perkembangan - Realisasi Triwulan (Fase 3B)

Mengganti laporan triwulan yang sebelumnya menebak angka dari realisasi tahunan:
- Skema + migrasi `0014`: tabel `keuangan_triwulan` (per desa, tahun, bidang `5.x`, TW I–IV).
- Domain: `buildTriwulanRows` hanya menjumlahkan nilai triwulan tersimpan; tidak ada pembagian otomatis.
- Repo/use-case/action: baca & upsert realisasi triwulan, validasi kode bidang dan nilai non-negatif.
- UI: form input di `/keuangan/triwulan` (khusus pengguna dengan hak ubah) + laporan memakai data riil.
- Modul `laporan-triwulan` diaktifkan kembali.
