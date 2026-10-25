# Dokumentasi — Peta & Aturan

Dokumen ini adalah **pintu masuk** semua dokumentasi. Tujuannya mencegah agent
atau kontributor memakai dokumen lama yang sudah tidak sesuai kode atau
melewatkan fitur OpenSID yang belum dipetakan.

## Sumber Kebenaran

Baca dengan urutan ini:

| Urutan | Dokumen | Untuk apa | Otoritatif? |
|---|---|---|---|
| 1 | [`RENCANA-PERBAIKAN.md`](./RENCANA-PERBAIKAN.md) | Prioritas, fase, estimasi, status milestone | ✅ **Ya** untuk rencana & status |
| 2 | [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md) | Status implementasi terhadap katalog fitur OpenSID | ✅ **Ya** untuk status paritas |
| 3 | [`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md) | Baseline cakupan fitur OpenSID yang wajib dipetakan | ✅ **Ya** untuk scope kebutuhan |
| 4 | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Konvensi kode, lapisan, skema, RBAC, dan quality gate | ✅ **Ya** untuk cara menulis kode |
| 5 | [`LOG-PERKEMBANGAN.md`](./LOG-PERKEMBANGAN.md) | Catatan pekerjaan yang sudah selesai | Catatan historis aktif |
| 6 | [`riset/`](./riset/) | Analisis mendalam sistem acuan (OpenSID) | Referensi, **bukan** status |
| 7 | [`arsip/`](./arsip/) | Dokumen yang sudah digantikan | ❌ **Jangan** dipakai untuk status |

`KATALOG-FITUR-OPENSID.md` mendefinisikan cakupan lengkap, sedangkan status
implementasi hanya boleh ditulis di `PARITAS-OPENSID.md`. Katalog tidak boleh
dipersempit menjadi T1/T2 bila target produk adalah seluruh fitur OpenSID.

## Batas tanggung jawab

| Dokumen | Boleh berisi | Tidak boleh berisi |
|---|---|---|
| `README.md` akar | quick start, teknologi, link dokumentasi | rincian status per domain |
| `RENCANA-PERBAIKAN.md` | urutan fase, milestone, acceptance, risiko | inventaris fitur yang tidak punya ID katalog |
| `KATALOG-FITUR-OPENSID.md` | seluruh requirement dan sumber OpenSID | klaim status terkini |
| `PARITAS-OPENSID.md` | status terkini, bukti, gap, prioritas | changelog bertanggal panjang |
| `ARCHITECTURE.md` | aturan teknis dan quality gate | status feature delivery |
| `LOG-PERKEMBANGAN.md` | kronologi bukti pekerjaan yang sudah dilakukan | roadmap baru atau prioritas baru |
| `riset/` | data reverse engineering dan temuan risiko | status proyek saat ini |
| `arsip/` | jejak dokumen yang sudah digantikan | dokumen aktif baru |


## Aturan Wajib

1. **Status fitur hanya boleh diambil dari `RENCANA-PERBAIKAN.md` dan
   `PARITAS-OPENSID.md`.** Cakupan fitur wajib diambil dari katalog. Jangan
   percaya klaim "selesai" di dokumen arsip, komentar kode lama, atau README
   yang belum diperbarui.
2. **Satu klaim = satu bukti.** Sebutkan path file + test. Jika belum ada UI,
   fitur belum "selesai" walau domain/action-nya ada.
3. **Ubah kode → ubah dokumen.** PR yang mengubah perilaku/status fitur wajib
   memperbarui `RENCANA-PERBAIKAN.md` (milestone) dan/atau
   `PARITAS-OPENSID.md` (status modul).
4. **Jangan menyalin kode/aset OpenSID.** OpenSID berlisensi GPL v3. Tiru
   perilaku, alur, dan model data; implementasi tetap orisinal.
5. **Multi-tenant:** `villageId` untuk halaman publik berasal dari **host**,
   untuk admin dari **sesi**. Jangan pernah menerimanya dari input klien.
6. **Dokumen baru** harus masuk daftar di file ini. Jangan membuat dokumen
   status baru yang bersaing dengan dua dokumen otoritatif di atas.

## Struktur

```
docs/
├─ README.md                  # file ini (peta & aturan)
├─ RENCANA-PERBAIKAN.md       # roadmap + status (otoritatif)
├─ PARITAS-OPENSID.md         # status paritas (otoritatif)
├─ KATALOG-FITUR-OPENSID.md   # baseline scope fitur lengkap
├─ ARCHITECTURE.md            # konvensi teknis & quality gate
├─ LOG-PERKEMBANGAN.md        # catatan pekerjaan selesai
├─ riset/                     # analisis sistem acuan (referensi)
└─ arsip/                     # dokumen usang (historis, jangan dipakai)
```

## Untuk Agent

Sebelum mengerjakan fitur:

1. Baca `RENCANA-PERBAIKAN.md` → tentukan fase & milestone yang sedang aktif.
2. Baca `KATALOG-FITUR-OPENSID.md` → temukan ID kebutuhan dan keluaran yang
   wajib dicakup.
3. Baca `PARITAS-OPENSID.md` → pastikan fitur yang sama belum ada / sudah ada.
4. Baca `ARCHITECTURE.md` → ikuti lapisan & konvensi.
5. Cek `git log`/`git status` → jangan menimpa pekerjaan yang belum di-commit.
6. Setelah selesai: jalankan `npm run check` + `npm run build`, lalu perbarui
   status di dua dokumen otoritatif.
