# Rancangan: Menutup Gap Katalog dan Memperbaiki Bug

Tanggal: 2026-11-09

## Tujuan

Meneruskan proyek SID Desa sampai seluruh kebutuhan dalam katalog `OS-*` memiliki implementasi dan bukti yang sesuai, serta memperbaiki bug nyata yang ditemukan selama pengerjaan. Targetnya adalah kualitas yang dapat diverifikasi; tidak ada klaim bahwa perangkat lunak bebas bug secara mutlak.

## Cakupan dan bukan cakupan

- Menangani gap fungsional dan E2E pada seluruh ID katalog dalam `docs/PARITAS-OPENSID.md`, bukan hanya menambah pemeriksaan halaman.
- Menutup perilaku lewat UI dan aksi/use case, otorisasi dan scoping tenant, keluaran yang disyaratkan, serta pengujian yang relevan untuk tiap ID.
- Memperbaiki regresi yang ditemukan dan memperbarui register paritas serta roadmap untuk ID yang terdampak.
- Tidak mengubah fitur di luar katalog kecuali perbaikan diperlukan untuk memenuhi perilaku atau kualitas yang diminta.
- Tidak menjanjikan nihil bug; setiap laporan menyebut pemeriksaan yang benar-benar dijalankan dan keterbatasannya.

## Pendekatan yang dipertimbangkan

1. **Sweep E2E saja:** cepat menambah pemeriksaan browser, tetapi membiarkan gap fungsional yang tertulis di register. Tidak cukup untuk tujuan.
2. **Mengerjakan semua domain paralel:** berpotensi mempercepat, tetapi menambah risiko benturan pada skema, fixture, rute bersama, dan dokumen register. Tidak dipilih untuk workspace yang sudah memiliki perubahan lokal.
3. **Batch berurutan sesuai roadmap:** meninjau perubahan lokal terlebih dahulu, menyelesaikan gap dan bug per batch, lalu memverifikasi dan memperbarui bukti sebelum lanjut. Dipilih karena sesuai urutan resmi `RENCANA-PERBAIKAN.md` dan menjaga tiap increment dapat ditinjau.

## Urutan pengerjaan

1. Inventaris working tree dan perubahan E2E lokal; pertahankan perubahan yang belum ditinjau dan jangan menjalankan skrip sementara yang efeknya belum dipahami.
2. Rekonsiliasi tiap gap aktual terhadap katalog, register paritas, rute/UI/use case, serta test yang sudah ada. Jangan mengasumsikan label `Gap: E2E` berarti fitur sudah layak tanpa uji perilaku.
3. Lanjutkan batch aktif menurut urutan `RENCANA-PERBAIKAN.md`; tutup perilaku fungsional yang masih kurang dan tambahkan/benahi E2E yang membuktikan hasilnya. Gunakan test terfokus dan verifikasi per increment.
4. Setelah batch, perbarui status hanya dengan bukti; jalankan quality gate yang relevan dan lanjutkan batch berikutnya.
5. Pada akhir rangkaian, rekonsiliasi semua ID katalog dan jalankan quality gate proyek yang ditentukan `AGENTS.md`.

## Batasan dan bukti

- Ikuti konvensi Next.js lokal, arsitektur di `docs/ARCHITECTURE.md`, dan aturan tenant: ID publik dari host, admin dari sesi.
- Setiap perubahan fitur mencantumkan ID `OS-*` terdampak serta memperbarui `PARITAS-OPENSID.md` dan/atau `RENCANA-PERBAIKAN.md`.
- Jangan menyalin kode atau aset OpenSID.
- Integrasi provider eksternal yang membutuhkan kredensial atau sandbox hanya dapat dinyatakan terverifikasi setelah pengujian nyata yang sah tersedia. Uji mock mengonfirmasi kontrak lokal, bukan bukti pengiriman/provider produksi; blocker yang belum dapat diuji tetap dicatat terbuka.
- Jangan menghapus, mengganti, atau mengklaim berhasilnya perubahan working tree pengguna tanpa meninjaunya.

## Kriteria penerimaan

- Setiap gap katalog yang bisa ditutup lokal memiliki bukti implementasi dan test yang sesuai; celah provider yang memerlukan akses eksternal disebut terang sebagai blocker, bukan disamarkan sebagai lulus.
- E2E menguji hasil/perilaku penting, bukan hanya keberadaan halaman, dan suite yang ditambahkan dapat dipilih serta dijalankan oleh runner proyek.
- Register dan roadmap konsisten dengan bukti terkini.
- Quality gate yang diminta proyek dijalankan pada kondisi akhir; hasil dan keterbatasan dilaporkan apa adanya.

## Keputusan yang masih menjadi pilihan implementasi

Detail pemecahan tiap batch, test fixtures, dan urutan subfitur ditentukan dari kode dan gap aktual saat batch tersebut dimulai. Perubahan lokal yang belum ditinjau tidak dianggap bagian dari rancangan sampai lolos pemeriksaan.