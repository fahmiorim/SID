# Rancangan: Menyelaraskan dokumentasi dengan target rebuild OpenSID

Tanggal: 2026-11-09

## Tujuan

Membuat seluruh dokumentasi aktif menggambarkan maksud produk yang telah disepakati: membangun ulang secara orisinal semua fitur dan modul OpenSID yang teridentifikasi, kecuali OpenDK, SMS, serta Covid-19 dan Vaksin Covid. Katalog 111 ID yang ada menjadi inventaris awal, bukan batas akhir scope atau jumlah total fitur OpenSID.

## Keputusan produk

- **Masuk cakupan:** semua fitur dan modul yang ditemukan di source OpenSID, termasuk fitur yang opsional atau tidak aktif pada instalasi tertentu. Folder/modul saja belum cukup sebagai bukti inventaris; perilaku dan permukaan fiturnya perlu ditelusuri.
- **OpenDK dikecualikan:** sinkronisasi, laporan/unggahan khusus ke OpenDK, pesan OpenDK, serta alur lain yang membutuhkan atau berkomunikasi dengan OpenDK tidak dibangun.
- **SMS dikecualikan:** UI, antrean, gateway, pengiriman/penerimaan, broadcast, dan operasi khusus SMS tidak dibangun.
- **Covid-19 dan Vaksin Covid dikecualikan:** dashboard, pendataan, pemantauan, laporan, impor/ekspor, API, dan halaman publik khusus Covid-19/vaksinasi Covid tidak dibangun. Data kesehatan umum—posyandu, KIA, ibu hamil, pemantauan anak, dan stunting—tetap masuk cakupan.
- Fungsi administrasi desa yang tetap bekerja mandiri tidak dikecualikan hanya karena OpenSID juga dapat mengirim datanya ke OpenDK. Contoh: data penduduk, laporan APBDes, surat, dan laporan lokal tetap dinilai sebagai fitur tersendiri jika tidak bergantung pada OpenDK.
- Email, WhatsApp, TTE, API umum, dan integrasi lain tetap dipetakan. Status pembangunan atau kebutuhan provider masing-masing tidak berubah hanya karena keputusan scope ini.
- Implementasi tetap orisinal. Source OpenSID menjadi referensi perilaku dan inventaris, bukan sumber untuk menyalin kode atau aset.

## Pendekatan yang dipilih

1. Mempertahankan ID `OS-*` yang ada agar bukti/status historis tetap tertelusur, sambil menyatakan eksplisit bahwa 111 ID bukan scope final.
2. Mengaudit ulang source lokal yang ditunjuk pengguna. Menambahkan ID baru hanya saat fitur yang belum tercakup sudah diverifikasi dan requirement-nya terpisah dengan jelas.
3. Mencatat pengecualian sebagai ID/komponen scope tersendiri dengan status `⚪`, alasan, dan batas yang jelas. Memisahkan fitur lokal dari integrasi OpenDK bila fitur lokal tetap berguna tanpa integrasi.
4. Menyesuaikan README, peta dokumentasi, roadmap, register paritas, prinsip arsitektur, dan indeks riset agar tidak membatasi pekerjaan pada katalog lama.
5. Mempertahankan dokumen riset/arsip sebagai bukti historis; menandai rekomendasi lama yang bertentangan sebagai non-otoritatif, tanpa menghapus sejarah.

## Batas inventaris

Source di `D:/laragon/www/opensid` menjadi sumber acuan lokal. Inventaris ulang harus menelusuri fitur dalam seluruh source yang tersedia, termasuk modul opsional/tidak aktif, fitur inti, controller pendukung, route/UI, keluaran, serta integrasi. Nama controller atau jumlah file bukan fitur dengan sendirinya; setiap kemampuan perlu dipetakan dan dideduplikasi menjadi requirement perilaku yang dapat diuji.

Selama audit belum tuntas:

- Sebut 111 sebagai jumlah ID pada katalog saat ini, bukan jumlah total target.
- Jangan mengklaim scope sudah lengkap hanya dari direktori `Modules` atau daftar controller.
- Catat snapshot berdasarkan path dan metadata versi/commit yang dapat diverifikasi; jika metadata tidak tersedia, nyatakan demikian.
- Jangan menandai fitur terimplementasi atau dikecualikan tanpa bukti dan batas eksplisit.

## Dokumen yang disentuh setelah persetujuan

Perubahan ini adalah penyelarasan dokumentasi saja. Kode produk dan status implementasi fitur tidak berubah.

- `docs/README.md`: otoritas, definisi scope dan urutan acuan.
- `docs/KATALOG-FITUR-OPENSID.md`: status sebagai inventaris awal, metode audit, pemisahan requirement, pengecualian OpenDK/SMS, dan backlog ID hasil audit.
- `docs/PARITAS-OPENSID.md`: catatan bahwa hitungan 111 adalah snapshot katalog lama; status hanya untuk ID yang sudah diinventarisasi; entri pengecualian tidak disamakan dengan fitur yang belum diaudit.
- `docs/RENCANA-PERBAIKAN.md`: tujuan akhir, milestone inventaris penuh sebelum klaim selesai, tahapan implementasi/rebuild, dan hapus pernyataan bahwa fitur di luar katalog bukan target.
- `README.md` dan `AGENTS.md`: tujuan produk dan aturan kerja yang konsisten.
- `docs/ARCHITECTURE.md`: referensi scope ke katalog/hasil inventaris, tanpa mengubah keputusan teknis tak terkait.
- `docs/riset/README.md` dan riset integrasi/modul terkait: membedakan temuan historis dari keputusan scope aktif.
- `docs/superpowers/specs/2026-11-09-close-catalog-gaps-design.md`: tandai superseded karena scope yang menyebut katalog lama sebagai batas tidak lagi berlaku.

## Kriteria penerimaan dokumentasi

- Semua dokumen aktif menyebut rebuild seluruh fitur OpenSID terinventarisasi, kecuali OpenDK, SMS, serta Covid-19 dan Vaksin Covid.
- Tidak ada kalimat aktif yang menyatakan fitur yang belum tercantum di 111 ID otomatis di luar target.
- Katalog dan register memakai mekanisme ID stabil dan hitungan yang dapat diverifikasi, sambil membedakan jumlah 111 ID pada katalog saat ini dari hasil inventaris final.
- OpenDK, SMS, serta Covid-19/Vaksin Covid masing-masing memiliki batas pengecualian yang dapat diuji; fitur lokal yang independen tidak salah dikecualikan.
- Area yang belum bisa diverifikasi terhadap source ditandai terbuka, bukan diisi dengan asumsi.
- Tautan internal dan referensi status konsisten; riwayat dokumen tidak dihapus.
- Tidak ada perubahan kode produk pada tahap penyelarasan scope dokumentasi ini.

## Pertanyaan implementasi yang dibiarkan terbuka

Audit source menentukan granularitas dan ID baru yang diperlukan. Snapshot `D:/laragon/www/opensid` dipakai sebagai baseline lokal; bila repo/versi source berubah, catat versi/commit yang benar-benar tersedia sebelum mengklaim inventaris final. Bagian OpenDK yang ikut terpaket pada fungsi lokal harus dipilah berdasarkan apakah alur tetap berguna dan berjalan tanpa OpenDK.