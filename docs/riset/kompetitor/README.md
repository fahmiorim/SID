# Riset Kompetitor SID

Folder ini memuat riset pasar tentang aplikasi Sistem Informasi Desa (SID) lain:
nama produk, model layanan, fitur, harga publik, kekuatan, dan kelemahan. Riset
ini dipakai untuk menentukan posisi produk dan prioritas pengembangan.

**Ini bukan status fitur proyek.** Status bukti implementasi tetap ada di
[`../../STATUS-MODUL.md`](../../STATUS-MODUL.md), scope di
[`../../CAKUPAN-OPENSID.md`](../../CAKUPAN-OPENSID.md), dan prioritas kerja di
[`../../RENCANA-PENGEMBANGAN.md`](../../RENCANA-PENGEMBANGAN.md).

## Dokumen

| Dokumen | Isi |
|---|---|
| [`LAPORAN.md`](./LAPORAN.md) | Ringkasan eksekutif, peta kompetitor, kelebihan/kekurangan proyek, perbandingan head-to-head, dan rekomendasi prioritas. |
| [`MATRIKS-FITUR.md`](./MATRIKS-FITUR.md) | Matriks fitur yang bisa diperbarui per kompetitor, lengkap dengan legenda dan sumber. |
| [`TAMPILAN-PUBLIK.md`](./TAMPILAN-PUBLIK.md) | Audit tampilan publik: blok beranda, warna, tata letak, konten yang perlu ditambah/dikurangi, dan urutan perbaikan. |

## Metode dan batas

- Data dikumpulkan pada **10 November 2026** dari halaman resmi vendor, panduan
  resmi, dokumentasi regulator, dan repo publik.
- Fitur dan harga kompetitor adalah **klaim vendor**, bukan hasil uji independen.
  Harga dapat berubah dan beberapa vendor tidak mencantumkan harga.
- Tanda `—` pada matriks berarti fitur **tidak ditemukan di sumber publik**,
  bukan bukti bahwa fitur tersebut tidak ada.
- Halaman yang sepenuhnya dirender JavaScript bisa tidak terbaca utuh; dalam
  kasus itu dipakai potongan resmi dari mesin pencari dan dicatat di sumber.
- Riset ini tidak menyalin kode atau aset OpenSID. OpenSID tetap menjadi acuan
  perilaku, bukan sumber kode.

## Cara memperbarui

1. Perbarui tanggal riset di `LAPORAN.md` dan `MATRIKS-FITUR.md`.
2. Ubah sel matriks hanya jika ada sumber publik yang eksplisit; cantumkan URL
   sumber di bagian bawah matriks.
3. Jika temuan mengubah prioritas produk, catat tindak lanjutnya di
   [`../../RENCANA-PENGEMBANGAN.md`](../../RENCANA-PENGEMBANGAN.md).
4. Jika temuan mengubah perilaku fitur, perbarui bukti di
   [`../../STATUS-MODUL.md`](../../STATUS-MODUL.md).
5. Jangan memakai dokumen ini untuk mengklaim fitur proyek "selesai".
