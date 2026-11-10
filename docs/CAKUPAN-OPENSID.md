# Cakupan Rebuild OpenSID

## Tujuan

Membangun ulang secara **orisinal** seluruh fitur dan modul yang tersedia pada snapshot OpenSID acuan, termasuk modul tambahan dan fitur opsional/tidak aktif. OpenSID menjadi acuan perilaku dan keluaran, bukan sumber kode atau aset.

## Pengecualian yang disepakati

1. **OpenDK:** tidak membangun fitur integrasi yang khusus mengirim/menerima data ke OpenDK, sinkronisasi, pesan OpenDK, atau alur yang memerlukan layanan OpenDK. Fitur lokal desa—misalnya data, surat, laporan, dan APBDes—tetap masuk target bila dapat digunakan tanpa OpenDK.
2. **SMS:** tidak membangun fungsi SMS, termasuk inbox/outbox, antrean, gateway, broadcast, pengiriman, dan penerimaan SMS.
3. **Covid-19 dan Vaksin Covid:** tidak membangun dashboard, pendataan, pemantauan, laporan, impor/ekspor, API, atau halaman publik yang khusus untuk Covid-19 dan vaksinasi Covid. Data kesehatan umum—posyandu, KIA, ibu hamil, pemantauan anak, dan stunting—tetap masuk target.

Tidak ada pengecualian lain yang ditetapkan. Email, WhatsApp, TTE, API, Siskeudes, dan integrasi lainnya harus diinventarisasi dan dipetakan sebagai fitur; keputusan teknis atau kebutuhan provider dicatat terpisah.

## Snapshot acuan

- Path lokal yang diberikan: `D:/laragon/www/opensid`
- Versi tag: `v2607.0.1`
- Commit: `661a8884a8d02c26b1877d1cdddda0a06dd41361`
- Tanggal commit: 24 Juli 2026
- Lisensi: GPL v3 — implementasi proyek ini harus tetap orisinal.

## Status inventaris

Katalog aktif memuat 112 ID: 111 ID audit awal ditambah `OS-WEB-020` (agenda kegiatan desa) yang dipetakan 10 November 2026. Angka itu adalah jumlah kebutuhan yang sudah dipetakan pada katalog tersebut, bukan jumlah total fitur OpenSID dan bukan batas akhir pekerjaan. Inventaris menyeluruh belum selesai. Audit lanjutan perlu menelusuri modul, route, halaman, alur, keluaran, dan dependensi fitur di snapshot di atas; folder atau controller saja tidak cukup untuk menyatakan suatu fitur telah dipetakan.

Status kode dan test yang dapat dibuktikan saat ini diringkas di [`STATUS-MODUL.md`](./STATUS-MODUL.md). Prioritas perbaikan dan pengujian ada di [`RENCANA-PENGEMBANGAN.md`](./RENCANA-PENGEMBANGAN.md). Aturan teknis tetap ada di [`ARCHITECTURE.md`](./ARCHITECTURE.md); dokumen status lama disimpan di [`arsip/status-sebelum-audit/`](./arsip/status-sebelum-audit/).
