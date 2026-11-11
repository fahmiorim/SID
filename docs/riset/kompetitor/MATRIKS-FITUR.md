# Matriks Fitur Kompetitor SID

> Diperbarui 10 November 2026. Matriks ini merangkum fitur yang **disebut
> eksplisit** di sumber publik masing-masing vendor. Ini bukan hasil uji
> independen dan bukan status implementasi proyek.

## Legenda

| Tanda | Arti |
|---|---|
| ✅ | Tersedia dan disebut eksplisit di sumber publik. |
| ◐ | Sebagian, hanya di paket premium, atau masih perlu verifikasi. |
| — | Tidak ditemukan di sumber publik; bukan berarti fitur tidak ada. |
| n/a | Tidak relevan untuk model produk tersebut. |

## Matriks fitur inti

| Kapabilitas | Proyek ini | OpenSID | Digides | EasyDes | SapaDesa | iDESA | SINDES |
|---|---|---|---|---|---|---|---|
| Penduduk, KK, mutasi, statistik | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ◐ |
| Persuratan + arsip | ✅ (6 template) | ✅ (30+) | ✅ (57 format) | ✅ | ✅ | ✅ | ✅ |
| APBDes/keuangan desa | ◐ (buku APBDes) | ◐ (premium) | ✅ (Siskeudes Online) | ✅ | ✅ | ✅ | ◐ |
| Integrasi Siskeudes | — | — | ✅ | — | — | ✅ (Siskeudes Link) | — |
| Prodeskel | — | ✅ (premium) | ✅ | — | ✅ | — | — |
| DTSEN | — | ✅ | — | — | ✅ | — | — |
| PPID | — | ✅ (premium) | — | — | ✅ | — | ✅ |
| PBB-P2 | — | ✅ (premium) | ✅ | ✅ | — | — | ✅ |
| Data Presisi | — | ✅ | — | — | ✅ | — | — |
| Web publik/CMS | ✅ (2 tema) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Layanan mandiri warga | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Anjungan/buku tamu | ✅ | ✅ | ✅ | ◐ | ✅ | — | — |
| Kehadiran perangkat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Kesehatan/posyandu | ✅ | ✅ | — | ◐ | ✅ | — | — |
| Mobile native | — | ◐ (premium) | ✅ | ✅ | — | ✅ | — |
| Offline/PWA | ◐ (manifest saja) | ◐ (instalasi lokal) | ✅ | ◐ | — | — | ✅ (offline PWA) |
| BUMDes/koperasi | — (lapak katalog) | — | — | ◐ (aset) | — | ◐ (segera) | — |
| Dashboard kecamatan/kabupaten | ◐ (kelola tenant) | ✅ (OpenDK/OpenKab) | ✅ (PENDEKAR) | ✅ (Smart Village) | ✅ (OpenDK) | ✅ | — |
| Multi-tenant | ✅ | — (satu desa/instalasi) | ✅ | ◐ (per kabupaten) | ◐ (SaaS) | ✅ | ✅ |
| TTE BSrE | ◐ (adapter) | ✅ | ◐ | ✅ | ◐ | — | ✅ |
| AI assistant | — | — | — | — | — | — | ✅ |
| API/OpenAPI | ✅ | ✅ (API Satu Data) | — | — | — | — | — |
| Lisensi jelas | — | ✅ (GPL v3) | — | — | ◐ (source code) | — | — |
| Harga publik | — | ✅ | ◐ (mulai) | ✅ | ◐ (klaim) | — | — |

## Pemain lain

| Kompetitor | Fitur kunci | Catatan untuk proyek ini |
|---|---|---|
| **Simdesa** | AI assistant, "Lapor Pak" terhubung Polsek/Puskesmas/Damkar, marketplace, mobile, 500+ desa | Kuat di narasi layanan darurat dan AI; proyek ini belum punya keduanya. |
| **Nagari Digital** | AI template surat, smart report, keuangan, website, migrasi gratis, 500+ desa | Menang di kesederhanaan SaaS, harga jelas, dan batas penduduk; fitur lebih dangkal. |
| **DesaHub** | Multi-tenant SaaS, CMS, surat + QR, GIS, APBDes, PPID, mall UMKM, mobile, 14 desa | Model paling dekat dengan multi-tenant proyek ini, tetapi skalanya masih kecil. |
| **SINDEN** | Dashboard kades, surat, keuangan, PBB-P2, absensi, audit trail, Rp5 jt/tahun | Pesaing harga rendah; kedalaman fitur dan skala belum terbukti. |
| **SIDesa Jateng** | SITKD (aset), BANKEU PEMDES (bantuan keuangan), GEODESA (geospasial) | Contoh tuntutan integrasi platform provinsi yang belum dipenuhi proyek ini. |

## Sumber per kompetitor

- **OpenSID/OpenDesa:** [Panduan OpenSID — Halaman Administrasi](https://panduan.opendesa.id/id/opensid/halaman-administrasi), [Profil OpenDesa 2024](https://opendesa.id/wp-content/uploads/2024/10/Profil-OpenDesaa.pdf), [repo OpenSID](https://github.com/OpenSID/OpenSID).
- **Digides:** [Fitur Administrasi](https://digitaldesa.id/fitur/administrasi), [beranda](https://digitaldesa.id/), [paket layanan](https://digitaldesa.id/paket-layanan).
- **EasyDes:** [beranda EasyDes](https://easydes.id/), [aplikasi Android](https://play.google.com/store/apps/details?id=id.co.easystem.easydes).
- **SapaDesa:** [Aplikasi Desa](https://sapadesa.com/aplikasi-desa).
- **Simdesa:** [beranda Simdesa](https://simdesa.id/).
- **Nagari Digital:** [beranda Nagari Digital](https://nagari.digital/).
- **iDESA:** [beranda iDESA](https://idesa.co.id/).
- **SINDES:** [beranda SINDES](https://www.sindes.id/), [modul produk](https://sindes.id/produk).
- **DesaHub:** [site-desa.id](https://site-desa.id/).
- **SINDEN:** [sinden.id](https://www.sinden.id/).
- **SIDesa Jateng:** [sidesa.jatengprov.go.id](https://sidesa.jatengprov.go.id/).
- **Standar nasional:** [BPKP Siskeudes](https://www.bpkp.go.id/id/produkLayanan/produk/pY/sistem-keuangan-desa-siskeudes), [Permendesa 13/2025](https://peraturan.bpk.go.id/Details/342744/permendesa-pdt-kemendesa-pdt-no-13-tahun-2025), [DTSEN BPS](https://blitarkota.bps.go.id/id/news/2025/04/17/205/pemutakhiran-mandiri-data-tunggal-sosial-dan-ekonomi-nasional--dtsen-.html).

## Cara memperbarui

1. Ubah sel hanya jika ada sumber publik yang eksplisit; jangan mengisi `✅`
   berdasarkan asumsi.
2. Tambahkan URL sumber baru di bagian "Sumber per kompetitor".
3. Perbarui tanggal "Diperbarui" di atas.
4. Jika perubahan memengaruhi prioritas produk, catat di
   [`../../RENCANA-PENGEMBANGAN.md`](../../RENCANA-PENGEMBANGAN.md).
5. Jangan memakai matriks ini untuk mengklaim fitur proyek sudah selesai.
