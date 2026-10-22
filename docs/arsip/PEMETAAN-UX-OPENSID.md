> **ARSIP HISTORIS — status di dokumen ini sudah kedaluwarsa.**
> Status fitur terkini ada di [`../PARITAS-OPENSID.md`](../PARITAS-OPENSID.md).
> Detail alur UX tetap berguna sebagai referensi implementasi. Lihat
> [`README.md`](./README.md).

# Pemetaan UX/Proses Bisnis vs OpenSID (Riset)

Tujuan: memastikan pengalaman pengguna (operator warga/desa) bagi yang pernah pakai OpenSID tetap terasa **sama**. Fokus pada alur kerja, langkah-langkah, nama menu, terminologi, dan kelengkapan fitur kritis — bukan kesamaan teknis/struktur tabel.

Terakhir diperbarui: 2025-10-20

## Prinsip Penilaian

Penilaian berdasarkan **kesamaan UX & alur proses bisnis**:
- `Sama` = Urutan langkah, nama menu/form, perilaku & hasilnya bisa dipahami pengguna OpenSID tanpa perlu belajar ulang
- `Hampir Sama` = Ada perbedaan kecil (penyederhanaan) tapi tidak menghilangkan atau memotong langkah kritis
- `Beda (Lebih Baik)` = Disederhanakan/di-perbaiki tapi alur intinya tetap terjaga, tidak memotong proses wajib
- `Kurang` = Ada langkah/proses yang terpotong atau fitur yang hilang sehingga operator harus kerja dengan cara berbeda
- `Belum` = Belum ada

## Ringkasan Kesamaan UX/Alur

| Modul | Kesamaan UX | Status | Penjelasan |
|---|---|---|---|
| **Kependudukan** | ~95–98% | Sama | Alur input/edit KK, penduduk, mutasi sangat mirip. Perbaikan kepala keluarga (otomatis dari anggota) justru mempermudah, tidak memotong proses. |
| **Keluarga & RTM** | ~98% | Sama/Beda (Lebih Baik) | RTM eksklusif lebih jelas, alur tetap sama bagi operator. |
| **Wilayah (Dusun/RW/RT)** | 100% | Sama | Tidak ada perbedaan berarti. |
| **RBAC/Pengguna** | ~95% | Hampir Sama | Konsep grup hak akses sama (mirip dengan grup_akses OpenSID). Penyederhanaan level `read/write/manage` lebih intuitif, tidak menghilangkan fungsi. |
| **Persuratan** | ~80% | Hampir Sama | Alur konsep→pratinjau→cetak→arsip mirip. Yang kurang: verifikasi berjenjang, form isian dinamis lengkap, ekspansi `klgx_*`, mode penomoran lengkap (4 mode). Ini yang bisa bikin terasa "ada yang kurang" bagi user OpenSID. |
| **Surat Masuk/Keluar** | ~90% | Hampir Sama | Agenda & arsip sudah ada. Alur pencatatan & penelusuran mirip. Perlu lengkapi alur verifikasi/tindak lanjut sesuai OpenSID. |
| **Keuangan APBDes** | ~85% | Hampir Sama | Alur input anggaran→realisasi→laporan RP APBDes mirip. Yang kurang: laporan **triwulan** (sering dipakai di lapangan). Lapis C bisa disederhanakan tapi laporan yang wajib harus tersedia. |
| **Bantuan Sosial** | ~90% | Hampir Sama | Proses entri program→peserta→cetak kartu mirip. Kurang: ekspor/import Excel, kelengkapan alur validasi peserta. |
| **Inventaris/Aset** | ~20% | Kurang | Ini yang paling terasa beda. OpenSID punya alur inventaris (kategori, mutasi: pindah/rusak/hapus) yang lengkap. Saat ini belum ada, operator OpenSID akan merasa ada fitur penting yang hilang. |
| **Layanan Mandiri** | ~40% | Kurang | Alur permohonan surat warga (mandiri) belum terimplementasi penuh sesuai OpenSID (form isian, syarat, status permohonan, cetak). |
| **Bumindes/Buku Administrasi** | ~50% | Sebagian | Ada beberapa buku, tapi cakupan belum selengkap OpenSID. Tidak kritis untuk semua desa. |
| **Analisis/Survei** | 0% | Belum | Tidak ada di kode saat ini. Bagi desa yang pakai fitur ini akan terasa kurang. Tapi tidak semua desa menggunakannya. |
| **Web Publik** | ~30% | Kurang | Belum ada padanan yang cukup kuat vs OpenSID. |

**Kesimpulan UX keseluruhan:** **~82–84%** terasa "sama" bagi pengguna OpenSID yang terbiasa. Bisa naik ke **~90%+** kalau kita tutup gap kritis (Persuratan verifikasi+form dinamis, Inventaris dasar+mutasi, Layanan Mandiri dasar).

## Analisis: Apakah ada proses yang dipotong?

Singkatnya: **Belum ada yang dipotong secara sengaja**. Yang ada adalah:
- **Belum diimplementasi** (gap) — bukan dipotong, tapi belum dibangun.
- **Disederhanakan** — alur jadi lebih sedikit klik/tahap, tapi hasil akhirnya sama. Ini justru lebih baik untuk UX.

Contoh penyederhanaan yang **tidak memotong proses**:
- Kepala keluarga otomatis diturunkan dari anggota KK → mengurangi langkah input, hasil tetap benar.
- RBAC `read/write/manage` → lebih intuitif vs angka 1/3/7, hak akses tetap terjaga.
- Status masa aktif bantuan dihitung otomatis → mengurangi input manual, proses validasi tetap ada.

Yang **berpotensi terasa "ada yang kurang/dipotong"** (bukan dipotong, tapi belum lengkap):
1. **Persuratan** – Tanpa verifikasi berjenjang, operator OpenSID akan merasa alurnya berbeda (biasanya ada tahapan persetujuan). Prosesnya belum lengkap, bukan dipotong.
2. **Inventaris/Aset** – Ini fitur penting di OpenSID. Kalau belum ada mutasi (pindah/rusak/hapus), operator akan langsung merasa ada fitur yang hilang.
3. **Layanan Mandiri (permohonan surat)** – Bagi desa yang mengaktifkan mandiri, alur warga mengajukan surat belum lengkap.

## Prioritas Agar Terasa "Sama" (Tidak Ada yang Kurang)

Berdasarkan "user yang pernah pakai OpenSID tidak merasa ada fitur yang kurang atau proses yang dipotong":

| Prioritas | Modul | Gap Kunci | Dampak Terhadap UX |
|---|---|---|---|
| **P0 (Wajib)** | **Persuratan** | Verifikasi berjenjang (operator→sekdes→kades), form isian dinamis + `klgx_*`, mode penomoran 4 mode, deteksi duplikat nomor | Tinggi. Ini alur inti layanan surat OpenSID. Tanpa ini terasa belum lengkap. |
| **P0 (Wajib)** | **Inventaris/Aset** | Minimal: kategori aset, data inventaris, **mutasi** (pindah, rusak, hapus). | Sangat tinggi. Langsung terasa "ada fitur yang hilang". Banyak desa aktif pakai ini. |
| **P0 (Wajib)** | **Layanan Mandiri** | Alur permohonan surat warga (form, syarat, status 0–5, cetak setelah disetujui) | Tinggi untuk desa yang pakai layanan mandiri. Operator/admin & warga akan merasakan perbedaan alur. |
| **P1 (Penting)** | **Keuangan** | Laporan **triwulan** APBDes | Sedang–Tinggi. Sering dipakai untuk pelaporan berkala, operator terbiasa ada ini. |
| **P1 (Penting)** | **Surat Masuk/Keluar** | Lengkapi alur agenda + penelusuran & integrasi dengan klasifikasi | Sedang. Sudah dekat, perlu penyempurnaan kecil. |
| **P2 (Opsional)** | **Bumindes** | Tambah buku administrasi yang umum dipakai | Rendah–Sedang. Tidak semua desa pakai semua buku. |
| **P3 (Bisa Ditunda)** | **Analisis/Survei** | Mesin indikator | Rendah. Tidak semua desa pakai. |

## Kesimpulan

**Bisa tembus >90% kesamaan UX/alur bisnis.** Target realistis:
- **Tanpa P0:** ~84% (terasa hampir sama, tapi masih ada yang "kurang" untuk user OpenSID)
- **Dengan P0 selesai (Persuratan + Inventaris + Layanan Mandiri):** **~91–93%** (akan terasa **sama** bagi pengguna OpenSID, tanpa ada fitur yang kurang atau proses yang terpotong)

Jadi intinya: beda proses bisnis **tidak** kita pakai sebagai alasan untuk membiarkan ada gap. Justru kita pertahankan perbaikan, dan kita tutup bagian yang **belum lengkap** (bukan dipotong) supaya alur kerjanya tetap terasa identik dari sudut pandang operator.
