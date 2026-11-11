# Riset OpenSID — Indeks Referensi Historis

Folder ini berisi hasil reverse engineering terhadap source OpenSID lokal. Isinya
menjelaskan perilaku, alur, keluaran, risiko, dan struktur sistem acuan. Dokumen
ini **bukan status proyek** dan bukan roadmap aktif.

Sejak 10 November 2026, folder ini juga memuat riset kompetitor pasar di
[`kompetitor/`](./kompetitor/README.md). Riset tersebut menjelaskan nama produk,
fitur, harga, dan posisi proyek — bukan status implementasi fitur.

## Aturan penggunaan

- Scope fitur aktif ada di [`../CAKUPAN-OPENSID.md`](../CAKUPAN-OPENSID.md).
- Status bukti implementasi ada di [`../STATUS-MODUL.md`](../STATUS-MODUL.md).
- Prioritas, audit, dan urutan kerja ada di [`../RENCANA-PENGEMBANGAN.md`](../RENCANA-PENGEMBANGAN.md).
- Konvensi implementasi ada di [`../ARCHITECTURE.md`](../ARCHITECTURE.md).
- Klaim lama, estimasi lama, dan rekomendasi stack lama di folder ini tidak boleh
  mengalahkan dokumen aktif.
- Source pembanding: `/home/super/Projects/opensid`. OpenSID GPL v3; jangan
  menyalin kode, aset, template, atau secret.
- Nama tabel, kolom, route, dan controller di sini adalah data hasil riset,
  bukan instruksi untuk menyalin struktur lama.

## Jalur baca berdasarkan kebutuhan

| Kebutuhan | Dokumen utama |
|---|---|
| Gambaran sistem, aktor, domain, dan business rules | [`ANALISIS-SISTEM-ACUAN.md`](./ANALISIS-SISTEM-ACUAN.md) |
| Persuratan, template, kode isian, syarat, verifikasi | [`LAMPIRAN-01-PERSURATAN.md`](./LAMPIRAN-01-PERSURATAN.md) |
| RBAC, role, modul, dan wilayah scoping | [`LAMPIRAN-02-RBAC.md`](./LAMPIRAN-02-RBAC.md) |
| Enum, kode referensi, dan data seed acuan | [`LAMPIRAN-03-ENUM-REFERENSI.md`](./LAMPIRAN-03-ENUM-REFERENSI.md) |
| Relasi dan inventaris tabel acuan | [`LAMPIRAN-05-ERD-LENGKAP.md`](./LAMPIRAN-05-ERD-LENGKAP.md) |
| Cetak, PDF, Excel, Word, dan laporan | [`LAMPIRAN-06-SPESIFIKASI-OUTPUT.md`](./LAMPIRAN-06-SPESIFIKASI-OUTPUT.md) |
| Pemetaan modul → controller → model → tabel | [`LAMPIRAN-07-MATRIKS-MODUL.md`](./LAMPIRAN-07-MATRIKS-MODUL.md) |
| Alur bisnis per domain | [`LAMPIRAN-08-ALUR-BISNIS.md`](./LAMPIRAN-08-ALUR-BISNIS.md) |
| Integrasi dan temuan keamanan | [`LAMPIRAN-09-INTEGRASI-KEAMANAN.md`](./LAMPIRAN-09-INTEGRASI-KEAMANAN.md) |
| Keuangan/APBDes dan Siskeudes | [`LAMPIRAN-10-DEEP-DIVE-KEUANGAN.md`](./LAMPIRAN-10-DEEP-DIVE-KEUANGAN.md) |
| Inventaris/aset dan bug source acuan | [`LAMPIRAN-11-DEEP-DIVE-INVENTARIS.md`](./LAMPIRAN-11-DEEP-DIVE-INVENTARIS.md) |
| Bantuan sosial dan DTKS | [`LAMPIRAN-12-BANTUAN-DTKS.md`](./LAMPIRAN-12-BANTUAN-DTKS.md) |
| Mesin analisis/survei dan scoring | [`LAMPIRAN-13-DEEP-DIVE-ANALISIS.md`](./LAMPIRAN-13-DEEP-DIVE-ANALISIS.md) |
| Riset kompetitor SID: nama, fitur, harga, posisi pasar | [`kompetitor/README.md`](./kompetitor/README.md) |
| Audit tampilan publik: konten, warna, tata letak, rencana perbaikan | [`kompetitor/TAMPILAN-PUBLIK.md`](./kompetitor/TAMPILAN-PUBLIK.md) |

## Artefak historis

[`openapi.yaml`](./openapi.yaml) adalah kontrak REST historis dari analisis awal.
Aplikasi SID saat ini memakai Server Actions dan Route Handlers; file ini tidak
menjadi kontrak API aktif.

Artefak migrasi lama yang disebut di catatan historis sudah tidak digunakan:

- `drizzle/schema.ts`;
- `drizzle/README.md`;
- `migration/p0-import.sql`;
- `LAMPIRAN-04-MAPPING-MIGRASI-P0.md`.

Jangan membuat ulang artefak tersebut kecuali strategi produk berubah secara
sengaja dan didokumentasikan di dokumen aktif.

## Temuan yang wajib diperlakukan sebagai risiko

Riset menemukan beberapa kelemahan pada sistem acuan yang tidak boleh diwarisi:

- secret Firebase/FCM dan kredensial integrasi tertanam;
- kunci enkripsi statis;
- password admin default;
- hash MD5 untuk PIN/token lama;
- pengecualian CSRF terlalu luas;
- validasi file dan endpoint yang terlalu longgar;
- bug penghapusan inventaris dan ketidakkonsistenan view;
- SQL mentah dan `catch` yang tidak efektif di sebagian modul analisis.

Implementasi modern wajib memakai environment secret, hash modern, otorisasi di
use case, validasi MIME/magic bytes, tenant scoping, audit, dan adapter integrasi.

## Cara mengubah hasil riset menjadi pekerjaan

1. Temukan perilaku di dokumen riset.
2. Petakan ke scope dan ID `OS-*` yang sesuai; inventaris aktif ada di dokumen cakupan dan audit.
3. Tambahkan acceptance criteria, dependensi, dan tindak lanjut ke rencana pengembangan.
4. Implementasikan dengan arsitektur proyek saat ini, bukan struktur OpenSID.
5. Catat bukti UI, test, dan status di dokumen status modul.

Tanggal riset historis tidak menentukan status. Bila source OpenSID berubah,
inventaris ulang katalog sebelum memperbarui status.
