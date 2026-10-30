# Log Perkembangan

Catatan kronologis pekerjaan. Status fitur **tidak** diambil dari log ini;
sumber status tetap [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).

## 2026-10-29 — Audit ulang klaim dokumen vs kode

- Register paritas sebelumnya dinaikkan massal menjadi ✅ tanpa implementasi
  (entri "Bulk update sisa Sebagian ke Berfungsi penuh"). Audit ulang terhadap
  working tree mengoreksi hasilnya menjadi **15 ✅ / 77 🟡 / 20 🔴 / 1 ⚪**.
- Halaman placeholder 17 baris yang masih ada: `/analisis`, `/anjungan`,
  `/arsip`, `/buku-tamu`, `/dokumen`, `/kehadiran`, `/kehadiran/daftar-hadir`,
  `/keuangan/sisa-lebih`, `/lapak`, `/pelanggan`, `/pengaturan/notifikasi`,
  `/pengaturan/plugin`, `/pengaturan/sinkronisasi`, `/persuratan/tte`,
  `/desa/lapak`, dan `/layanan-mandiri/bantuan`. Rute `/desa/idm`, `/desa/sdgs`,
  `/desa/pemilihan`, `/desa/sinergi`, dan `/desa/suplemen` tidak ada sama sekali
  (404).
- Skema tanpa implementasi: `registrasi_warga`, `lapak`, `kehadiran`,
  `analisis`/`analisis_indikator`, `pemilihan`, `sinergi`, `sisa_lebih`,
  `tte_config`, `dokumen_desa`, `arsip`. Skema saja tidak dihitung sebagai fitur.
- Klaim yang terbukti berlebihan dan dikoreksi: "TTE lengkap dengan E2E"
  (hanya adapter nonaktif), "registrasi warga lengkap" (baru skema), "SiLPA
  lengkap" (placeholder), "statistik PDF" (hanya CSV + print), "impor DTKS"
  (hanya ekspor), "cetak kartu peserta" (belum ada).
- Quality gate dipulihkan agar klaim dokumen bisa dijalankan: import tak
  terpakai di `idm-repository.ts` dihapus, 10 file diformat Prettier, dan dua
  test usang diperbaiki (`wilayah.test.ts` menambahkan `urut` yang kini wajib;
  batas nomor kartu bantuan diselaraskan ke 60 karakter sesuai skema, migrasi,
  dan `maxLength` form). Hasil 29 Okt 2026: `npm run check` lulus (762 test,
  75 file) dan `npm run build` lulus.
- Dokumen yang disesuaikan: `PARITAS-OPENSID.md`, `RENCANA-PERBAIKAN.md`,
  `ARCHITECTURE.md`, `src/lib/docs-status.ts`, dan log ini.

## 2026-10-29 — Pertanahan publik + peta interaktif (OS-WIL-006/007)

- `/desa/pertanahan` memakai data persil/Cdesa/mutasi nyata lewat
  `listPertanahanPublik`; tabel Persil/Cdesa/Sertifikat/Mutasi.
- `/desa/peta` memakai Leaflet + `/api/peta` untuk area/garis/titik.
- Gap tersisa: layer polygon belum dirender, admin pertanahan masih baca,
  dan belum ada test/E2E GIS.

## 2026-10-29 — Penyelesaian bukti OS-POP 006–015 (sebagian)

- Test domain ditambah: DTKS validasi/batasan, suplemen isian dinamis, peserta
  bantuan, pendapat `sessionKey`, kontak validasi/CSV.
- E2E DTKS ditambahkan di `tests/rtm-dpt.e2e.ts`; dukungan `dataFormIsian`
  ditambahkan di skema suplemen; `kontak.resident_id` + lookup NIK
  `/api/penduduk/nik`.
- Status hasil audit: OS-POP-006/010/011/012/013 tetap 🟡 karena impor DTKS,
  keluaran PDF/cetak, dan cetak kartu belum ada.

## 2026-10-29 — GIS feature module (OS-WIL-002–005, 008)

- Skema + domain + repository + use case + actions + halaman admin untuk
  polygon, area, garis, point, simbol, dan persil.
- Gap: belum ada test domain/repo/E2E, dan polygon belum tampil di peta publik.

## 2026-10-29 — Kerangka modul yang belum diimplementasikan

- IDM, pemilihan, sinergi, registrasi warga, lapak, kehadiran, analisis,
  SiLPA, TTE, notifikasi, plugin, dan sinkronisasi baru memiliki skema dan/atau
  halaman placeholder. Untuk IDM/pemilihan/sinergi bahkan rute publiknya belum
  ada. Status tetap 🔴 atau 🟡 di register.

## Sebelum 29 Okt 2026

Riwayat pekerjaan sebelumnya (Fase 0–2, kependudukan, persuratan, keuangan,
inventaris, Bumindes, CMS, layanan mandiri) dapat dibaca di riwayat git
`docs/LOG-PERKEMBANGAN.md`. Ringkasan status terkini ada di
[`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md) dan
[`RENCANA-PERBAIKAN.md`](./RENCANA-PERBAIKAN.md).
