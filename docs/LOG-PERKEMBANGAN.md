# Log Perkembangan

Catatan kronologis pekerjaan. Status fitur **tidak** diambil dari log ini;
sumber status tetap [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).

## 2026-11-05 — Batch 2 keuangan: laporan realisasi format resmi

- Laporan realisasi APBDes format resmi `/keuangan/laporan/realisasi`:
  hierarki akun → bidang → rincian, baris JUMLAH per akun,
  SURPLUS/(DEFISIT), PEMBIAYAAN NETTO, dan SiLPA tahun berjalan. Tautan
  "Rincian Realisasi" ditambahkan di `/keuangan/laporan`.
- Domain murni `src/features/keuangan/domain/laporan-realisasi.ts` memakai
  aritmetika sen (`bigint`), mengosongkan persentase pembiayaan seperti format
  rujukan, dan menyusun CSV; ekspor di
  `/keuangan/laporan/realisasi/ekspor`. Test `laporan-realisasi.test.ts`
  (12 case: hierarki, total, surplus/SiLPA, selisih negatif, CSV).
- Konfirmasi gap lama: impor/template APBDes (`apbdes-import.ts`) dan
  pembukuan manual kas (`/keuangan/pembukuan`) sudah ada, sehingga
  `OS-FIN-001`/`002`/`003` dinaikkan ke ✅. Sisa Batch 2 hanya E2E
  (`OS-FIN-004`, `OS-FIN-006`).
- Perbaikan quality gate: timeout eksplisit 30 dtk untuk dua test impor
  `exceljs` (gagal saat 104 worker paralel) dan `ApbdesTemplateButton` menjadi
  tautan biasa tanpa `window.location.href` (menghapus warning lint).
- Dokumen diperbarui: `PARITAS-OPENSID.md` (register 35 ✅ / 77 🟡 / 0 🔴 / 1 ⚪,
  tabel domain menambah baris GOV dan FIN), `RENCANA-PERBAIKAN.md` (progres
  Batch 2, status Fase 2, 3G).
- Verifikasi: `npm run check` lulus (typecheck, lint tanpa warning,
  format, 997 test) dan `npm run build` lulus. E2E tidak dijalankan.

## 2026-11-04 — Batch 1 persuratan: TTE, API eksternal, arsip, permohonan

- TTE operasional: konfigurasi non-rahasia per desa (`tte_config`, resource dan
  menu `tte`), form `/persuratan/tte`, passphrase hanya dari `TTE_PASSWORD`,
  klien BSrE `buatKlienBsre` (Basic Auth, form-data, timeout, respons PDF/JSON
  URL/base64). Surat terbit menyimpan PDF bertanda tangan di media privat
  `surat-tte`, disajikan lewat route PDF admin/warga berizin; kegagalan TTE
  tidak memblokir penerbitan. Migrasi `0066_add_tte_file_and_config_unique`.
- API eksternal ber-API key: `POST /api/eksternal/tte/tanda-tangan` dan
  `GET /api/eksternal/surat/[nomor]`, tenant dari host, audit
  `api.eksternal.tte.sign`.
- Klasifikasi: impor CSV/XLSX kode lama dengan upsert transaksional + dialog
  template; test `klasifikasi-berkas.test.ts`.
- Arsip nomor: filter tahun/jenis/klasifikasi, pagination 25 baris, ekspor CSV
  `/persuratan/surat/arsip/ekspor`; test `arsip-nomor.test.ts`.
- Permohonan: filter tanggal/jenis/status, rekap per jenis, ekspor CSV
  `/permohonan-surat/ekspor`, dan notifikasi email perubahan status ke akun
  warga via Resend (dilewati aman tanpa email/kredensial). Test
  `permohonan-berkas.test.ts`.
- Dokumen diperbarui: `PARITAS-OPENSID.md` (`OS-SUR-004/005/006/007/013`,
  `OS-OPS-012` 🔴→🟡; register 21 ✅ / 91 🟡 / 0 🔴), `RENCANA-PERBAIKAN.md`
  (progres dan sisa Batch 1), `src/lib/docs-status.ts`, `.env.example`.
- Verifikasi: `npm run typecheck`, `npm run lint`, `npm run format:check`,
  `npm run test` (930/930), dan `npm run build` semuanya lulus. E2E tidak
  dijalankan. Batch 1 belum selesai: varian keluaran `OS-SUR-001/002/008`,
  lampiran disposisi/ekspedisi `OS-SUR-009/010/012`, pengaturan lampiran
  `OS-SUR-014`, validasi `OS-SUR-003`, dan `OS-SUR-011` (E2E-only) tersisa.

## 2026-11-04 — Rute IDM kanonis, halaman status jujur, lapisan domain

- `/idm` dialihkan permanen ke halaman kanonis `/desa/idm-sdgs`; komentar
  `src/lib/public-paths.ts` diperbarui.
- `/pengaturan/notifikasi` tidak lagi 404: menampilkan status "belum tersedia".
  `/pengaturan/plugin` dan `/pengaturan/sinkronisasi` tidak lagi menampilkan
  plugin/log contoh; keduanya menyatakan integrasinya belum tersedia.
- Pelanggaran lapisan domain dihapus: konstanta mutasi penduduk dipindah ke
  `src/lib/resident-mutation.ts`, sehingga domain penduduk tidak lagi mengimpor
  `@/db/schema`.
- Dokumen diperbarui: `PARITAS-OPENSID.md` (OS-GOV-006, OS-WEB-013,
  OS-OPS-005/008/009, catatan umum), `RENCANA-PERBAIKAN.md` (rute/halaman +
  rencana penutupan gap non-E2E), `ARCHITECTURE.md` (domain 0 pelanggaran).
- Verifikasi: `npm run typecheck`, `npm run lint`, `npm run format:check`, dan
  `npm run test` (898/898 lulus) — semuanya lulus. E2E tidak dijalankan.

## 2026-11-04 — Audit konsistensi dokumen vs kode

- Audit membandingkan seluruh dokumen aktif dengan kode dan hasil eksekusi.
  Register 113 ID tetap **21 ✅ / 90 🟡 / 1 🔴 / 1 ⚪** (baris register,
  ringkasan, dan `RENCANA-PERBAIKAN.md` konsisten); angka 22 ✅ / 89 🟡 pada
  entri di bawah dikoreksi.
- Koreksi klaim: `/pengaturan/notifikasi` ternyata `notFound()` (404), bukan
  placeholder; `/pengaturan/plugin` dan `/pengaturan/sinkronisasi` memakai data
  contoh hardcoded; halaman publik IDM ada di `/idm` (belum tertaut menu),
  bukan `/desa/idm`; polygon sudah dirender di `/desa/peta`; adapter TTE
  mendukung `nonaktif`/`manual`/`bsre` dengan klien jaringan `null`; unggah PDF
  `/konten/dokumen` sudah ada; rute ekspor PDF statistik sudah ada.
- Koreksi bukti: E2E DPT ada di `tests/rtm-dpt.e2e.ts` (bukan
  `publik-verifikasi.e2e.ts`); `import type` infrastruktur berjumlah 4 (bukan
  7); satu file domain masih mengimpor `@/db/schema`.
- Dokumen yang diperbarui: `PARITAS-OPENSID.md`, `RENCANA-PERBAIKAN.md`,
  `ARCHITECTURE.md`, `KATALOG-FITUR-OPENSID.md`, `README.md`,
  `LOG-PERKEMBANGAN.md`, dan `src/lib/docs-status.ts`.
- Verifikasi: `npm run typecheck`, `npm run lint`, dan `npm run format:check`
  lulus; `npm run test` run pertama 897/898 (timeout flaky di
  `spreadsheet.test.ts`), run ulang 898/898 lulus. Suite E2E **tidak**
  dijalankan pada mesin ini.

## 2026-11-04 — Penutupan rute orphan, CRUD modul yang belum ada

- Quality gate: debug `console.log` di alur dokumen/media dihapus, argumen
  `browser` yang tak terpakai di E2E diperbaiki, dan Prettier dijalankan pada
  file terdampak. `npm run typecheck` lulus. Test/E2E **tidak** dijalankan pada
  sesi ini.
- Modul orphan didaftarkan: `buku-tamu`, `arsip`, `kehadiran`, `lapak`,
  `pelanggan`, `anjungan`, `analisis`, `pemilihan`, dan `registrasi-warga`
  (`modules.ts` + resource RBAC + grant: sekdes/kades `read`, operator
  `manage`).
- Halaman `/dokumen` duplikat dihapus; `/konten/dokumen` menjadi kanonis dan
  sudah mendukung unggah PDF.
- CRUD baru: pemilihan desa (admin + publik), kategori & indikator analisis,
  anjungan, dan registrasi akun warga (pengajuan publik + persetujuan operator
  dengan PIN sekali tampil).
- UI mati diperbaiki: filter/pencarian lapak publik, tombol ubah/hapus
  pemilihan, serta tautan menu publik untuk lapak dan pemilihan.
- Status paritas: 21 ✅ / 90 🟡 / 1 🔴 / 1 ⚪ (dikoreksi pada audit 4 Nov 2026;
  sebelumnya tertulis 22 ✅ / 89 🟡). Sisa 🔴: `OS-OPS-012` (API eksternal).

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
