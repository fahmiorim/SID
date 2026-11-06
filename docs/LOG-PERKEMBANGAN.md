# Log Perkembangan

Catatan kronologis pekerjaan. Status fitur **tidak** diambil dari log ini;
sumber status tetap [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).

## 2026-11-07 — Gelombang C–E tuntas non-E2E: email, OTP, form eksternal, API surat

- **`OS-WGA-001`** — verifikasi kontak kini mendukung email: kolom `kanal`
  (migrasi `0094`), target 150 karakter, kanal dipilih otomatis dari bentuk
  target, kode dikirim lewat Resend. Test domain `verifikasi-kontak.test.ts`.
- **`OS-WGA-002`** — OTP login sebagai faktor kedua sudah aktif: kode 6 digit
  via WhatsApp/email, diverifikasi sebelum sesi dibuat, aktivasi di profil,
  batas permintaan. Gap tinggal E2E.
- **`OS-ANA-001`** — ringkasan kategori ditambahkan ke ekspor CSV laporan skor.
- **`OS-ANA-005`** — token HMAC formulir eksternal (7 hari, terikat survei) dan
  endpoint `POST /api/publik/survei/[id]/respons` dengan validasi jawaban,
  desa dari host, dan rate limit per IP. Test token 5 kasus.
- **`OS-OPS-012`** — `POST /api/eksternal/surat` untuk mengajukan surat atas
  nama warga dari NIK: validasi isian, nomor antrean server, audit
  `api.eksternal.surat.create`; kontrak OpenAPI ikut diperbarui. **Ditambah
  unggahan syarat multipart** (`syarat.<id>`) dengan validasi pengaturan
  lampiran `permohonan` dan penyimpanan media privat.
- **`OS-ANA-005`** — detail survei admin kini punya kartu **embed iframe** siap
  tempel, tautan formulir, dan token API 7 hari yang dibuat server-side.
- Sisa non-E2E: bukti provider nyata `OS-WGA-009`/`OS-SUR-013` (kredensial).
  E2E ditunda.
- Verifikasi: `npm run check` lulus (150 file, 1317 test) dan `npm run build`
  lulus. `restore.test.ts` sempat memunculkan EPIPE flaky saat suite paralel;
  lulus saat dijalankan ulang dan pada gate kedua.

## 2026-11-07 — Gelombang C–E sebagian: rekap izin, kategori skor, OpenAPI, test PDF

- **`OS-WGA-011`** — izin disetujui kini memengaruhi rekap kehadiran
  perangkat. Izin ditautkan lewat NIK perangkat ↔ penduduk, dihitung per
  tanggal dalam periode rekap, tidak menggandakan tanggal yang sudah punya
  catatan kehadiran, dan cuti dihitung sebagai izin.
- **`OS-ANA-001`** — laporan skor survei menampilkan ringkasan per kategori
  (`rekapPerKategori`), termasuk indikator tanpa kategori. Ekspor CSV belum
  memuat ringkasan kategori.
- **`OS-OPS-012`** — `GET /api/eksternal/openapi` menyajikan kontrak OpenAPI
  3.1 (API key, TTE, verifikasi surat, format galat) yang disusun dari kode.
  Endpoint tulis surat belum ada.
- **`OS-POP-010`** — test rute `/statistik/penduduk/ekspor/pdf`: 401 tanpa
  sesi, 403 tanpa izin, 200 `application/pdf` + header unduhan + awalan
  `%PDF-`, dan `kind` bawaan.
- Sisa non-E2E: `OS-WGA-001` (email), `OS-WGA-002` (OTP/2FA login warga),
  `OS-ANA-005` (formulir eksternal), tulis surat `OS-OPS-012`; `OS-WGA-009`
  dan `OS-SUR-013` tertahan kredensial provider. E2E belum dijalankan.
- Verifikasi: `npm run check` lulus (148 file, 1307 test) dan `npm run build`
  lulus. E2E tidak dijalankan.

## 2026-11-07 — Gelombang B tuntas: dokumen, linimasa, anggota publik, umpan balik, tema

- **`OS-WEB-005`** — jenis produk hukum baku (`DOKUMEN_JENIS`) dipakai form
  admin (select) dan filter publik `/desa/dokumen`; arsip dokumen aktif
  dikelompokkan per tahun lalu jenis dan setiap kelompok dapat diklik. Embed
  hanya HTTPS dengan `iframe sandbox`. Domain `dokumen.ts` + test.
- **`OS-WEB-008`** — detail pembangunan menampilkan linimasa kronologis:
  mulai, dokumentasi (foto + keterangan), dan selesai. DTO dokumentasi kini
  membawa `createdAt`. Domain `linimasa.ts` + test.
- **`OS-WEB-010`** — kolom `kelompok_anggota.tampil_publik` (default tampil),
  tombol tampilkan/sembunyikan per anggota di dialog admin, dan daftar anggota
  terpublikasi di `/desa/kelompok` tanpa NIK; ketua/jumlah mengikuti anggota
  publik. Tombol cetak tersedia. Domain `ringkasAnggotaPublik` + test.
- **`OS-WEB-015`** — tabel `umpan_balik`, form umpan balik di `/desa/kontak`
  dengan captcha aritmetika bertanda tangan + honeypot, dan panel admin
  `/umpan-balik` (filter status, ubah baru/dibaca/ditindaklanjuti). Modul +
  RBAC `umpan-balik` (operator `manage`, sekdes/kades `read`).
- **`OS-WEB-017`** — `pindaiManifestTema` memeriksa slug, versi semver, nama,
  serta slot dikenal/tidak ganda/lengkap; kartu tema menampilkan masalah dan
  tombol aktivasi nonaktif untuk manifest tidak valid (use case memvalidasi
  ulang). Tetap build-time, tanpa unggah/eksekusi kode.
- Migrasi `0089_gelombang_b_umpan_balik_dan_anggota_publik.sql` (tabel
  `umpan_balik`, kolom `tampil_publik`, FK + indeks).
- Dokumen diperbarui: `PARITAS-OPENSID.md` (lima baris ID, tetap 🟡
  `Gap: E2E`), `RENCANA-PERBAIKAN.md` (Gelombang B tuntas non-E2E), log ini.
- Verifikasi: `npm run check` lulus (147 file, 1303 test) dan `npm run build`
  lulus. E2E tidak dijalankan.

## 2026-11-07 — Gelombang B: filter inventaris publik, hasil survei publik, teks berjalan & sosmed

- **`OS-WEB-011`** — `/desa/inventaris` kini punya filter kategori, kondisi,
  lokasi, tahun, dan pencarian nama/kode/nomor inventaris. Rekap dan hitungan
  barang mengikuti hasil saringan. Ekspor baru `/desa/inventaris/ekspor`
  menghasilkan CSV dengan filter yang sama; tenant diambil dari host dan berkas
  memakai BOM UTF-8 serta proteksi formula. Domain murni
  `features/publik/domain/inventaris-publik.ts`, test 14 kasus.
- **`OS-WEB-013`** — `/desa/analisis-survei` menampilkan rekap agregat tanpa
  data pribadi: distribusi pilihan + persentase, rata-rata soal angka, jumlah
  jawaban teks (isi tidak dipublikasikan), dan jumlah responden unik. Filter
  periode tahun berasal dari `survey_responden.created_at` dan hanya memilih
  kolom agregat. Domain `features/publik/domain/hasil-survei.ts`, test 8 kasus.
- **`OS-WEB-016`** — opsi tema `teksBerjalan` (≤ 300 karakter) dan `sosmed[]`
  (tujuh platform, validasi http/https, platform ganda dibuang). Form
  `/konten/tema` menerima keduanya; tema `esensi` dan `natra` merender bilah
  teks berjalan di bawah header serta tautan sosial media di footer. Test
  `theme.test.ts` diperluas menjadi 17 kasus.
- Dokumen diperbarui: `PARITAS-OPENSID.md` (tiga baris ID di atas),
  `RENCANA-PERBAIKAN.md` (status Gelombang B dan sisa lima ID), log ini.
  Status tetap 🟡 dengan `Gap: E2E` sesuai aturan gelombang (E2E ditunda).
- Verifikasi: `npm run check` lulus (142 file, 1275 test) dan `npm run build`
  lulus.

## 2026-11-05 — Audit Batch 1–2: RBAC laporan, validasi syarat, dan tautan pengaturan lampiran

- Audit ulang Batch 1 & 2 terhadap kode (bukan hanya klaim dokumen). Dua cacat
  nyata diperbaiki:
  - Halaman `/keuangan/laporan` beserta ekspor CSV/Excel dan laporan realisasi
    memeriksa resource `keuangan`, padahal sekretaris desa dan kepala desa hanya
    diberi `laporan-keuangan: read`; akibatnya menu Laporan tampil tetapi
    halaman menolak akses. Use case kini memisahkan `bacaKeuangan` (APBDes,
    resource `keuangan`) dan pembacaan laporan (resource `laporan-keuangan`).
  - Unggah syarat permohonan warga memakai validasi hardcoded, bukan pengaturan
    lampiran terpusat. Kini memakai `getMediaSettings(villageId, "permohonan")`
    dan `validasiMediaDenganPengaturan`, sehingga batas MIME/ukuran dapat
    diubah operator.
- Halaman `/pengaturan/lampiran` sebelumnya yatim (tidak ada tautan/menu).
  Tombol "Pengaturan lampiran" ditambahkan pada aksi `/persuratan/surat`.
- Dokumen diperbarui: `PARITAS-OPENSID.md` — `OS-SUR-003` (kategori
  "permohonan"), `OS-SUR-008` (varian selesai, gap E2E cetak per varian),
  `OS-OPS-012` (endpoint `[token]` + `/verifikasi`, rate limit sudah ada);
  jumlah register tetap 35 ✅ / 77 🟡 / 0 🔴 / 1 ⚪.
- Regresi dijaga `keuangan-use-cases.test.ts` (3 case): APBDes memakai resource
  `keuangan`, laporan dan rincian realisasi memakai `laporan-keuangan`.
- Sisa non-E2E yang masih terbuka: `OS-OPS-012` (kontrak OpenAPI dan endpoint
  tulis surat) dan `OS-SUR-013` (verifikasi terhadap provider BSrE nyata, butuh
  kredensial). Gap Batch 2 hanya E2E (`OS-FIN-004`, `OS-FIN-006`).
- Verifikasi: `npm run check` lulus (1000 test) dan `npm run build` lulus. E2E
  tidak dijalankan.

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
  tidak memblokir penerbitan. Migrasi `0062_add_tte_file_and_config_unique`.
- API eksternal ber-API key: `POST /api/eksternal/tte/tanda-tangan`,
  `GET /api/eksternal/surat/[token]`, dan `POST /api/eksternal/surat/verifikasi`,
  tenant dari host, audit `api.eksternal.*`.
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
