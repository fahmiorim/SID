# Dokumentasi

Mulai dari dokumen kerja ini:

1. [`CAKUPAN-OPENSID.md`](./CAKUPAN-OPENSID.md) — target rebuild, pengecualian, dan snapshot acuan.
2. [`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md) — 111 ID `OS-*` yang menjadi scope produk beserta keluaran wajibnya.
3. [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md) — status per ID terhadap katalog, disalin dari audit terkini.
4. [`STATUS-MODUL.md`](./STATUS-MODUL.md) — hasil audit struktur 111 ID, kedalaman bukti E2E, dan gap yang tersisa.
5. [`RENCANA-PENGEMBANGAN.md`](./RENCANA-PENGEMBANGAN.md) — urutan audit, perbaikan, dan pengujian.

Dokumen teknis tetap menjadi referensi implementasi: [`ARCHITECTURE.md`](./ARCHITECTURE.md) dan [`RUNBOOK-PEMULIHAN.md`](./RUNBOOK-PEMULIHAN.md). Bahan riset ada di [`riset/`](./riset/).

Versi katalog, paritas, roadmap, dan log sebelum audit disimpan utuh di [`arsip/status-sebelum-audit/`](./arsip/status-sebelum-audit/) sebagai riwayat. Gunakan arsip hanya untuk melihat keputusan/klaim pada waktu itu, **bukan** untuk menentukan scope/status terkini: katalog dan paritas aktif ada di atas, dan baris status per ID di `STATUS-MODUL.md` adalah sumber yang diperiksa test. Pengecualian scope saat ini: OpenDK, SMS, serta Covid-19 dan Vaksin Covid.

Aturan kerja: klaim “selesai” wajib menyebut bukti route/UI, aksi/use case, izin dan scoping tenant, serta test perilaku yang dijalankan. Daftar folder dan smoke test bukan bukti paritas.
