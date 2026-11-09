# Arsip Dokumentasi

Folder ini menyimpan dokumen yang **sudah tidak berlaku**. Isinya dipertahankan
untuk jejak keputusan, bukan untuk dijadikan acuan kerja.

**Jangan memakai dokumen di folder ini untuk menentukan status fitur, prioritas,
scope, atau arsitektur.** Gunakan dokumen aktif di [`../README.md`](../README.md):

- [`../CAKUPAN-OPENSID.md`](../CAKUPAN-OPENSID.md) — scope dan pengecualian.
- [`../STATUS-MODUL.md`](../STATUS-MODUL.md) — temuan kode/test dan batas audit.
- [`../RENCANA-PENGEMBANGAN.md`](../RENCANA-PENGEMBANGAN.md) — audit, perbaikan, dan pengujian.
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — konvensi teknis.

Katalog, paritas, roadmap, dan log yang aktif sebelum penyederhanaan disimpan
utuh di [`status-sebelum-audit/`](./status-sebelum-audit/). Dokumen di folder itu
adalah snapshot lama; isi statusnya belum diverifikasi ulang dan tidak boleh
menjadi sumber klaim penyelesaian saat ini.

| Dokumen | Digantikan oleh | Alasan |
|---|---|---|
| `MAPPING-RISET-vs-KODE.md` | `../STATUS-MODUL.md` | Persentase & status usang |
| `RINGKASAN-PERKEMBANGAN.md` | `../RENCANA-PENGEMBANGAN.md` | Klaim "selesai" tidak sesuai UI |
| `SISA-GAP.md` | `../RENCANA-PENGEMBANGAN.md` | Mengklaim P0 selesai padahal belum |
| `REKOMENDASI-SELANJUTNYA.md` | `../RENCANA-PENGEMBANGAN.md` | Urutan prioritas sudah berubah |
| `LOG-PERKEMBANGAN-2025.md` | `../RENCANA-PENGEMBANGAN.md` | Log lama, tidak lengkap |
| `PEMETAAN-UX-OPENSID.md` | `../STATUS-MODUL.md` | Status kedaluwarsa; detail UX tetap jadi referensi |

File-file ini **sengaja tidak dihapus** karena berguna untuk audit keputusan
lama dan mengetahui mengapa scope/rencana pernah berubah. Menyimpannya di
folder arsip mencegah sejarah tercampur dengan dokumentasi aktif.

Aturan: jangan menambah dokumen baru ke folder ini kecuali benar-benar sudah
digantikan oleh dokumentasi aktif. Simpan dokumen yang diganti utuh dan
jelaskan penggantinya di README indeks terkait.
