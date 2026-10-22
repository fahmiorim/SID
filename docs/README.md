# Dokumentasi — Peta & Aturan

Dokumen ini adalah **pintu masuk** semua dokumentasi. Tujuannya mencegah agent
atau kontributor memakai dokumen lama yang sudah tidak sesuai kode.

## Sumber Kebenaran

Baca dengan urutan ini:

| Urutan | Dokumen | Untuk apa | Otoritatif? |
|---|---|---|---|
| 1 | [`RENCANA-PERBAIKAN.md`](./RENCANA-PERBAIKAN.md) | Prioritas, fase, estimasi, status milestone | ✅ **Ya** untuk rencana & status |
| 2 | [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md) | Perbandingan fitur vs OpenSID | ✅ **Ya** untuk paritas fitur |
| 3 | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Konvensi kode, lapisan, skema, RBAC | ✅ **Ya** untuk cara menulis kode |
| 4 | [`LOG-PERKEMBANGAN.md`](./LOG-PERKEMBANGAN.md) | Catatan pekerjaan yang sudah selesai | Catatan historis aktif |
| 5 | [`riset/`](./riset/) | Analisis mendalam sistem acuan (OpenSID) | Referensi, **bukan** status |
| 6 | [`arsip/`](./arsip/) | Dokumen yang sudah digantikan | ❌ **Jangan** dipakai untuk status |

## Aturan Wajib

1. **Status fitur hanya boleh diambil dari `RENCANA-PERBAIKAN.md` dan
   `PARITAS-OPENSID.md`.** Jangan percaya klaim "selesai" di dokumen arsip,
   komentar kode lama, atau README yang belum diperbarui.
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
├─ PARITAS-OPENSID.md         # matriks paritas OpenSID (otoritatif)
├─ ARCHITECTURE.md            # konvensi teknis (otoritatif)
├─ LOG-PERKEMBANGAN.md        # catatan pekerjaan selesai
├─ riset/                     # analisis sistem acuan (referensi)
└─ arsip/                     # dokumen usang (historis, jangan dipakai)
```

## Untuk Agent

Sebelum mengerjakan fitur:

1. Baca `RENCANA-PERBAIKAN.md` → tentukan fase & milestone yang sedang aktif.
2. Baca `PARITAS-OPENSID.md` → pastikan fitur yang sama belum ada / sudah ada.
3. Baca `ARCHITECTURE.md` → ikuti lapisan & konvensi.
4. Cek `git log`/`git status` → jangan menimpa pekerjaan yang belum di-commit.
5. Setelah selesai: jalankan `npm run check` + `npm run build`, lalu perbarui
   status di dua dokumen otoritatif.
