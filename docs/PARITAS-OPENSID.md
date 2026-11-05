# Matriks Paritas Fitur vs OpenSID

Dokumen ini adalah **sumber kebenaran status implementasi** terhadap
[`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md). Target produk adalah
rebuild orisinal dengan **cakupan seluruh fitur OpenSID** di
`/home/super/Projects/opensid`, termasuk modul tambahan, API, keluaran, layanan
mandiri, dan integrasi.

Sumber pembanding:

- `/home/super/Projects/opensid/donjo-app/controllers/*`
- `/home/super/Projects/opensid/donjo-app/controllers/fweb/*`
- `/home/super/Projects/opensid/donjo-app/controllers/fmandiri/*`
- `/home/super/Projects/opensid/donjo-app/controllers/internal_api/*`
- `/home/super/Projects/opensid/donjo-app/controllers/external_api/*`
- `/home/super/Projects/opensid/Modules/*`
- `/home/super/Projects/opensid/resources/views/admin/*`
- `/home/super/Projects/opensid/storage/app/themes/*`

Legenda:

- ✅ **Berfungsi penuh** — domain, action, UI, keluaran yang relevan, otorisasi,
  test, dan bukti end-to-end tersedia.
- 🟡 **Sebagian** — ada kode/skema/UI, tetapi ada operasi, keluaran, alur,
  test, atau integrasi yang belum lengkap.
- 🔴 **Belum ada** — belum tersedia atau masih placeholder/mockup.
- ⚪ **Di luar scope** — ID sengaja tidak diimplementasikan.

## Catatan Umum

- Status hanya boleh diambil dari bukti nyata di kode (rute, UI, action/use-case, test). 
- **Rute orphan**: modul yang sebelumnya orphan (`buku-tamu`, `arsip`, `kehadiran`, `lapak`, `pelanggan`, `anjungan`, `analisis`, `pemilihan`, `registrasi-warga`) kini terdaftar di `modules.ts`, resource RBAC, grant role, dan navigasi. Sisa halaman tanpa entri modul/navigasi: `/pengaturan/plugin`, `/pengaturan/notifikasi`, `/pengaturan/sinkronisasi`, dan `/docs-status` (halaman pengembangan). Tiga yang pertama tetap dihitung lewat ID katalognya (`OS-OPS-008`, `OS-OPS-005`, `OS-OPS-009`); `/docs-status` tidak dipetakan ke katalog. `/persuratan/tte` kini modul `tte` dengan resource RBAC sendiri. Tidak satu pun dihitung sebagai modul operasional.
- **Halaman status jujur**: `/pengaturan/notifikasi`, `/pengaturan/plugin`, dan `/pengaturan/sinkronisasi` kini menyatakan fiturnya belum tersedia dan tidak menampilkan data contoh. Pusat notifikasi, registri plugin, dan sinkronisasi pusat tetap belum diimplementasikan.
- **Halaman statis placeholder**: tidak ada lagi halaman publik berstatus placeholder untuk lapak; `/desa/lapak`, `/desa/pemilihan`, dan `/desa/registrasi-warga` memakai data/aksi nyata. Halaman IDM/SDGs juga memakai use case dan data nyata. Halaman publik IDM ada di `/desa/idm-sdgs` (kanonis); rute lama `/idm` dialihkan permanen ke sana, sedangkan `/desa/idm` adalah halaman admin.
- **Tombol dan rute**: ekspor PDF statistik sudah punya rute nyata (`/statistik/penduduk/ekspor/pdf`, `/statistik/bantuan/ekspor/pdf`); yang tersisa adalah E2E-nya, bukan rutenya.
- **Kedalaman bukti E2E**: sebagian E2E yang dirujuk hanya memuat halaman/URL (mis. kontak, backup database, IDM admin). Status ✅ tetap berarti UI+aksi+otorisasi+test tersedia, tetapi tidak menjamin setiap interaksi sudah diuji end-to-end; gap E2E dicatat per ID.
- **Kualitas kode**: seluruh cast `as any` di halaman admin, halaman publik, dan komponen presentation telah dihapus. Action state kini memakai `createIdleActionState<T>()` yang generik; akses properti state (`message`, `fieldErrors`) langsung tanpa cast. Tipe DTO domain (`ArsipDTO`, `BukuTamuDTO`, dll.) dipakai secara konsisten di seluruh lapisan.
---

## Ringkasan Paritas


| Scope | Total ID/modul | ✅ | 🟡 | 🔴 | ⚪ |
|---|---:|---:|---:|---:|---:|---:|
| **Katalog per-ID — register direkonsiliasi (5 Nov 2026)** | **113** | **35** | **77** | **0** | **1** |
| Baseline kelompok lama (92 modul) — **historis, bukan status delivery** | 92 | 42 | 12 | 38 | — |

Dari 112 ID dalam scope: **35 ✅ (31,3%)**, **77 🟡 (68,8%)**,
**0 🔴 (0%)**. Satu ID (`OS-POP-009`) resmi di luar scope. Semua 113 ID
katalog kini memiliki tepat satu baris status; status penuh tetap memerlukan
bukti UI, aksi, otorisasi, keluaran, dan pengujian sesuai Definition of Done.
Angka ini dapat diverifikasi ulang dengan `src/db/paritas-register.test.ts`
(katalog vs register) dan `src/db/migrasi-paritas.test.ts` (skema vs migrasi).

Angka baseline 92 modul dipertahankan sebagai catatan historis dan tidak boleh
dibandingkan langsung dengan 113 ID katalog.

Angka ini menggantikan klaim sebelumnya (2 ✅ / 80 🟡 / 30 🔴) dan klaim
sementara "hampir semua ✅" yang tidak didukung kode. Baris 92 modul
dipertahankan hanya agar angka historis (42 ✅ = 52,2%) tetap terlacak; angka
itu **bukan** status delivery dan tidak boleh dibandingkan langsung dengan 113
ID katalog.

Urutan prioritas tidak menghapus fitur dari scope. T1 dikerjakan lebih dahulu,
kemudian T2 dan modul tambahan/integrasi; seluruhnya tetap wajib ditutup.

## Register cakupan

Tabel kategori di bawah adalah ringkasan domain. Daftar requirement yang
lengkap ada di katalog dan memakai ID `OS-*`. Setiap issue, branch, migrasi,
test, dan perubahan status **MUST mencantumkan ID katalog**; satu baris ringkasan
tidak boleh dianggap menutup semua ID di dalamnya.

## Register per-ID — hasil audit

| ID | Status | Bukti dan gap |
|---|---|---|
| OS-POP-001 | ✅ Berfungsi penuh | CRUD/cari/filter lanjutan/pagination/RBAC di `/penduduk`; detail `/penduduk/[id]`, cetak `/penduduk/[id]/cetak`, ekspor CSV `/penduduk/ekspor`. Test `penduduk.test.ts` + `penduduk-filter.test.ts` + `laporan-penduduk.test.ts`; E2E `tests/penduduk.e2e.ts`. |
| OS-POP-002 | ✅ Berfungsi penuh | Riwayat lahir/mati/pindah masuk/keluar/perubahan status di `/penduduk/riwayat`, dialog catat perubahan, cetak, ekspor `/penduduk/riwayat/ekspor`. Test `riwayat-penduduk.test.ts`; E2E `tests/penduduk.e2e.ts`. |
| OS-POP-003 | ✅ Berfungsi penuh | CRUD KK, anggota, validasi kepala keluarga, riwayat anggota, PDF `/keluarga/[id]/pdf`. Test `keluarga.test.ts` + `anggota-log.test.ts`; E2E `tests/keluarga.e2e.ts`. |
| OS-POP-004 | ✅ Berfungsi penuh | CRUD RTM/anggota/kelas sosial/BDT + laporan `/rumah-tangga/laporan` + ekspor. Test `rumah-tangga.test.ts`, `rumah-tangga-rekap.test.ts`, `rumah-tangga-filter.test.ts`; E2E `tests/rtm-dpt.e2e.ts`. |
| OS-POP-005 | ✅ Berfungsi penuh | DPT `/penduduk/dpt` (CRUD pemilihan, filter lengkap, pagination), ekspor/rekap `/penduduk/dpt/rekap`, publik `/desa/dpt`. Test `dpt.test.ts` 7 case; E2E `rtm-dpt.e2e.ts` (muat halaman DPT, rekap, ekspor CSV). |
| OS-POP-006 | 🟡 Sebagian | DTKS: CRUD dari RTM, status, agregasi anggota, lampiran, pengaturan, laporan, ekspor CSV. **Impor CSV** tersedia via dialog `/penduduk/dtks` (`DtksImportDialog` + `imporDtksAction`) dengan pembacaan CSV/XLSX lewat `bacaImporDariFormData`. Pemetaan baris impor kini ada di domain (`rencanaImporDtks`) dan diuji: nomor RTM tidak ditemukan, baris ganda, dan normalisasi spasi. Test `dtks.test.ts` + `dtks-berkas.test.ts`; **Gap: E2E impor DTKS**. |
| OS-POP-007 | ✅ Berfungsi penuh | Suplemen: CRUD, detail `/penduduk/suplemen/[id]`, isian dinamis (`dataFormIsian`), ekspor, laporan, cetak. Test `suplemen.test.ts`, `suplemen-berkas.test.ts`; E2E `rtm-dpt.e2e.ts`. |
| OS-POP-008 | ✅ Berfungsi penuh | Posyandu/KIA/ibu hamil/bulanan anak: admin + publik `/desa/kesehatan/{kia,ibu-hamil,pemantauan-anak}`, ekspor CSV admin & publik, skorcard konvergensi. 39 test (domain/repo/application); E2E `kesehatan.e2e.ts`. |
| OS-POP-009 | ⚪ Di luar scope | Modul vaksin/Covid tidak diimplementasikan karena dinilai tidak relevan. |
| OS-POP-010 | 🟡 Sebagian | Statistik penduduk `/statistik/penduduk`, rentang umur, filter wilayah/umur, ekspor CSV, cetak browser, dan ekspor PDF `/statistik/penduduk/ekspor/pdf`. **Gap: test hanya domain/repo; E2E khusus ekspor PDF belum ada.** E2E `statistik-bantuan.e2e.ts`. |
| OS-POP-011 | 🟡 Sebagian | Program bantuan: CRUD, detail, peserta, ekspor CSV, RBAC. **Cetak via browser** ditambahkan di detail program (`/bantuan/[id]`). **Laporan resmi** `/bantuan/[id]/cetak` ber-kop desa (identitas program, daftar peserta, kolom tanda tangan) tertaut dari halaman detail. **Gap: E2E laporan resmi belum ada.** Test `bantuan.test.ts`; E2E `statistik-bantuan.e2e.ts`. |
| OS-POP-012 | 🟡 Sebagian | Peserta bantuan: kandidat sasaran tenant-aware, snapshot kartu, ubah kartu, ekspor CSV, pembersihan massal, dan cetak kartu lewat `window.print()`. **Impor peserta** CSV/XLSX via `PesertaImportDialog` + `imporPesertaAction` dengan kolom identitas per sasaran (NIK / No. KK / No. RTM / kode kelompok), unduh template, dan domain `impor-peserta.ts` + test (kode ganda, tidak ditemukan, sudah terdaftar). **Gap: E2E impor peserta.** Test `bantuan.test.ts`; E2E detail `/bantuan/999999`. |
| OS-POP-013 | 🟡 Sebagian | Statistik bantuan per program/sasaran, filter wilayah/periode, ekspor CSV, cetak browser, dan ekspor PDF `/statistik/bantuan/ekspor/pdf`. Filter **kategori sasaran** kini tersedia di halaman dan diteruskan ke ekspor CSV/PDF; tombol Unduh PDF ditautkan ke rute nyata. Hitungan per sasaran memakai jumlah peserta (`COUNT(bantuan_peserta.id)`) sehingga program tanpa peserta tidak lagi terhitung. **Gap: E2E ekspor PDF.** Test `statistik.test.ts`; E2E `statistik-bantuan.e2e.ts`. |
| OS-POP-014 | ✅ Berfungsi penuh | Jajak pendapat admin `/pendapat` + publik `/jajak-pendapat`, rekap, ekspor, hapus, pagination, pembatasan suara `sessionKey` + unique index. Test `pendapat.test.ts`; E2E `pendapat.e2e.ts`. |
| OS-POP-015 | ✅ Berfungsi penuh | Kontak & grup: CRUD, anggota grup, impor/ekspor CSV, `kontak.resident_id` + lookup NIK `/api/penduduk/nik`, ekspor. Test `kontak.test.ts` 22 case; E2E `wilayah-pemerintahan.e2e.ts`. |
| OS-WIL-001 | ✅ Berfungsi penuh | CRUD dusun/RW/RT, validasi kombinasi, pagination, RBAC, rekap `/wilayah/rekap` + cetak. Test `wilayah.test.ts`; E2E `wilayah-pemerintahan.e2e.ts`. |
| OS-WIL-002 | 🟡 Sebagian | GIS area: metadata, CRUD area `/pemetaan/area` (dialog `EntityManager`), relasi ke layer polygon, aturan domain `gis.test.ts`, test use case + repository (isolasi desa), dan peta publik `/desa/peta`. **Peta cetak statis** `/desa/peta/cetak` (SVG area/garis/titik + legenda, domain `peta-cetak.ts` + test) tertaut dari peta publik. **Gap: E2E cetak peta.** |
| OS-WIL-003 | 🟡 Sebagian | Skema `garis` + CRUD `/pemetaan/garis` (LineString, refLine) lewat dialog `EntityManager`; test use case (parent sendiri ditolak) + repository isolasi tenant. **Gap: E2E.** |
| OS-WIL-004 | 🟡 Sebagian | Skema `point` + CRUD `/pemetaan/point` (Point, simbol, tipe, layer) lewat `EntityManager`; test use case + repository isolasi tenant. **Gap: E2E.** |
| OS-WIL-005 | 🟡 Sebagian | Skema `polygon` + CRUD kategori/layer `/pemetaan/polygon` (tautan form lama yang 404 diganti dialog `EntityManager`). Layer poligon dihubungkan ke API `/api/peta` dan dirender di peta publik dengan pengelompokan per layer. Test use case + repository (termasuk penyaringan layer nonaktif). **Gap: E2E GIS lebih luas.** |
| OS-WIL-006 | 🟡 Sebagian | Publik `/desa/pertanahan` membaca persil/Cdesa/mutasi nyata + E2E. Admin `/pemetaan/pertanahan` kini **CRUD persil, Cdesa, dan mutasi** (tambah/ubah/hapus berizin) lengkap dengan luasan dan tanggal. Test domain `pertanahan.test.ts` + repository isolasi tenant + test use case. **Gap: E2E CRUD pertanahan.** |
| OS-WIL-007 | 🟡 Sebagian | Peta publik `/desa/peta` memakai Leaflet + `/api/peta` dari area/garis/point/polygon, plus **peta cetak statis** `/desa/peta/cetak` yang tidak bergantung tile daring. E2E `tests/peta-publik.e2e.ts` lulus; domain `peta-cetak.test.ts` menguji proyeksi & legenda. **Gap: E2E halaman cetak peta.** |
| OS-WIL-008 | 🟡 Sebagian | Katalog simbol `gis_simbol` + CRUD `/pemetaan/simbol` lewat `EntityManager`; test use case + repository (katalog global). **Gap: E2E.** |
| OS-GOV-001 | ✅ Berfungsi penuh | Identitas desa `/pengaturan/desa` (alamat, kontak, kades, logo, TTD, stempel), RBAC, audit, dipakai cetak surat & publik. Test `desa.test.ts`; E2E `ops.e2e.ts`. |
| OS-GOV-002 | ✅ Berfungsi penuh | Perangkat/jabatan `/konten/perangkat`: CRUD, foto, periode, status, penanda tangan, urutan. Test `perangkat.test.ts`; E2E `wilayah-pemerintahan.e2e.ts`. |
| OS-GOV-003 | 🟡 Sebagian | Struktur jabatan + perangkat + publik `/desa/pemerintahan`. **Bagan SOTK** di `/konten/perangkat/sotk` (kepala desa → sekretariat → perangkat pelaksana, diturunkan dari jabatan perangkat aktif) dengan tombol cetak; domain murni `features/konten/domain/sotk.ts` + 6 test. **Gap: E2E bagan SOTK belum ada.** |
| OS-GOV-004 | 🟡 Sebagian | Lembaga via `kelompok` tipe `lembaga`: kategori, CRUD, anggota, jabatan, RBAC, publikasi. **Cetak via browser** tersedia di halaman daftar. **Laporan anggota terperinci** `/kelompok/laporan` (jabatan, NIK, nomor keanggotaan per kelompok) + ekspor CSV `/kelompok/ekspor`; domain `laporan-anggota.ts` + test. **Gap: E2E halaman laporan/ekspor belum ada.** E2E admin `/kelompok?tipe=lembaga`. |
| OS-GOV-005 | 🟡 Sebagian | Kelompok masyarakat: kategori, CRUD, anggota, jabatan, publikasi. **Cetak via browser** tersedia di halaman daftar. **Laporan anggota terperinci** `/kelompok/laporan` (jabatan, NIK, nomor keanggotaan per kelompok) + ekspor CSV `/kelompok/ekspor`; domain `laporan-anggota.ts` + test. **Gap: E2E halaman laporan/ekspor belum ada.** Test `kelompok.test.ts`; E2E `/kelompok?tipe=kelompok`. |
| OS-GOV-006 | 🟡 Sebagian | IDM/SDGs: admin `/desa/idm` dan `/desa/idm-sdgs`; publik `/desa/idm-sdgs` (kanonis), rute lama `/idm` dialihkan permanen ke sana. Use case dan rekap skor tersedia. Bukti: `src/features/idm/domain/idm.test.ts`, `tests/idm.e2e.ts` (CRUD admin; publik `/desa/idm-sdgs`), migrasi `0061_create_idm_sdgs.sql`. **Ekspor laporan** `/desa/idm/ekspor?tahun=` memuat rekap tiga dimensi, rincian indikator, dan capaian 18 tujuan SDGs (domain `laporan-idm.ts` + test). **Gap: E2E ekspor laporan belum ada.** |
| OS-GOV-007 | 🟡 Sebagian | Admin `/pemerintahan/pemilihan` dengan CRUD pemilihan (tahun, jenis, tanggal, keterangan), otorisasi `pemilihan`, dan halaman publik `/desa/pemilihan`. **Kandidat & hasil** ditambahkan lewat tabel `pemilihan_kandidat` (nomor urut unik per pemilihan, keterangan, jumlah suara), CRUD berizin di dialog `/pemerintahan/pemilihan`, rekap suara + pemenang (domain `hitungRekapSuara` + test), dan tampilan kandidat/hasil di publik `/desa/pemilihan`. Jumlah daftar pemilih (DPT) ditampilkan dari modul DPT aktif. **Gap: E2E pemilihan.** |
| OS-GOV-008 | ✅ Berfungsi penuh | Sinergi program `/desa/sinergi`: CRUD (tabel, form tambah/ubah, hapus), pencarian, RBAC `sinergi`, migrasi `sinergi_program`, ekspor CSV `/desa/sinergi/ekspor`. Publikasi tema `/desa/sinergi-program` (slot `sinergi` + menu Informasi Publik). Test `sinergi.test.ts`; E2E `tests/sinergi.e2e.ts` (muat, tambah/hapus, ekspor, publik tanpa sesi). |
| OS-GOV-009 | 🟡 Sebagian | Pembangunan: CRUD proyek `/pembangunan`, detail + dokumentasi foto, publik `/desa/pembangunan` + detail + cetak, RBAC, test 13 case. **Buku pembangunan** `/pembangunan/buku` (rekap per tahun: jumlah proyek per status, total anggaran, progres rata-rata, rincian proyek, siap cetak) + ekspor CSV `/pembangunan/buku/ekspor` (domain `buku-pembangunan.ts` + 8 test). **Gap: E2E buku pembangunan belum ada.** |
| OS-GOV-010 | ✅ Berfungsi penuh | Dokumen & Arsip: CRUD dokumen (`/konten/dokumen`) dan arsip (`/arsip`), integrasi publik `/desa/dokumen`, RBAC. Test `dokumen.test.ts`, `dokumen-publik.integration.test.ts`, `arsip.test.ts`, dan isolasi tenant `isolasi-village.integration.test.ts`. |
| OS-SUR-001 | 🟡 Sebagian | Master jenis surat, builder isian dinamis, placeholder/formula, template, RBAC, test `isian.test.ts`. **Gap: E2E.** Varian template/PDF (default, landscape, compact) tersedia di cetak & PDF. |
| OS-SUR-002 | 🟡 Sebagian | Surat warga: sumber penduduk, isian dinamis, pengikut, penduduk luar, dan konsep; RBAC serta pembatasan kepemilikan berkas. Test `surat.test.ts`, `isian.test.ts`, `pengikut.test.ts`; E2E `tests/surat-flow.e2e.ts` dan `tests/permohonan-warga.e2e.ts`. **Gap: E2E.** Varian template/PDF (default, landscape, compact) tersedia di cetak & PDF. |
| OS-SUR-003 | 🟡 Sebagian | Master syarat, aktif/nonaktif, relasi jenis surat, unggahan syarat warga, validasi isian. E2E mengunggah PDF syarat dan menguji unduh hanya oleh pemilik. **Gap: E2E.** Validasi lampiran syarat warga memakai pengaturan terpusat kategori "permohonan" (MIME/ukuran), sedangkan lampiran surat memakai kategori "surat". Test `media.test.ts`/`media-nama.test.ts`. |
| OS-SUR-004 | 🟡 Sebagian | Klasifikasi surat: CRUD `/persuratan/klasifikasi`, relasi kode/jenis surat, RBAC `klasifikasi-surat`, impor CSV/XLSX kode lama dengan upsert per kode. Test `klasifikasi-berkas.test.ts` (normalisasi, duplikat, batas panjang). **Gap: E2E.** |
| OS-SUR-005 | 🟡 Sebagian | Permohonan surat dari admin dan warga: daftar `/permohonan-surat`, status, pemeriksaan syarat, pengembalian, pembatalan, RBAC; E2E `tests/permohonan-warga.e2e.ts`. Rekap per jenis + filter tanggal/jenis/status + ekspor CSV (`permohonan-berkas.test.ts`), notifikasi email perubahan status ke akun warga via Resend (dilewati aman bila email/Resend tidak ada), termasuk saat surat terbit. **Gap: E2E rekap/notifikasi.** |
| OS-SUR-006 | 🟡 Sebagian | Empat mode penomoran, kode desa, nomor otomatis, cek duplikasi lintas agenda, dan arsip nomor persisten pada `/persuratan/surat/arsip` (termasuk backfill surat terbit lama); test integrasi `penomoran-archive.integration.test.ts`. Filter tahun/jenis/klasifikasi, pagination 25 baris, dan ekspor CSV tersedia; test `arsip-nomor.test.ts`. E2E `tests/arsip-nomor-surat.e2e.ts`. **Gap: E2E filter/pagination lanjutan.** |
| OS-SUR-007 | 🟡 Sebagian | Verifikasi berjenjang: transisi status di `surat-use-cases.ts`, pembatasan per peran (`roleCanVerifyStep`: operator/sekretaris-desa/kepala-desa) di `surat.test.ts`, halaman publik verifikasi + E2E `tests/publik-verifikasi.e2e.ts`. **Gap: E2E per tahap dan per peran.** |
| OS-SUR-008 | 🟡 Sebagian | Cetak HTML/PDF, kop/logo/TTD/stempel, QR, token verifikasi, varian template/PDF (default/landscape/compact), halaman publik `/desa/verifikasi-surat/[token]`, test `surat-pdf.test.ts`/`verifikasi.test.ts`. E2E `tests/publik-verifikasi.e2e.ts` menguji verifikasi publik via token valid dan unduh PDF surat terbit. **Gap: E2E cetak per varian template.** |
| OS-SUR-009 | ✅ Berfungsi penuh | Surat masuk: CRUD, klasifikasi, pencarian, nomor agenda, RBAC. Disposisi detail, log agenda, **lampiran disposisi (maks 5 berkas, validasi MIME/ukuran via pengaturan terpusat kategori "surat")**, cetak via browser tersedia. Test `media.test.ts`, `media-nama.test.ts`. |
| OS-SUR-010 | ✅ Berfungsi penuh | Surat keluar: CRUD, ekspedisi/tanggal kirim, klasifikasi, agenda, pencarian, RBAC. Ekspedisi surat keluar (pengiriman, cara, resi, catatan), **lampiran ekspedisi (maks 5 berkas, validasi MIME/ukuran via pengaturan terpusat kategori "surat")**, log agenda tersedia; cetak via browser. |
| OS-SUR-011 | 🟡 Sebagian | Surat dinas: CRUD, klasifikasi, arsip fisik/digital, lampiran media, RBAC, test `surat-dinas.test.ts`. **Cetak via browser** tersedia di halaman agenda. **Gap: E2E belum ada.** |
| OS-SUR-012 | ✅ Berfungsi penuh | Agenda surat masuk/keluar + nomor agenda. Log agenda untuk surat masuk/keluar, disposisi, dan ekspedisi sudah ditambahkan. **Ekspedisi terpadu lintas modul (`unified_shipments`) dan rekam jejak detail per field (`surat_audit_trail`) tersedia.** |
| OS-SUR-013 | 🟡 Sebagian | TTE operasional: konfigurasi non-rahasia per desa di `tte_config` + resource/menu `tte`, form `/persuratan/tte`, passphrase hanya dari `TTE_PASSWORD`, klien BSrE `buatKlienBsre` (Basic Auth, form-data, timeout, dukungan PDF langsung/JSON URL/base64), 19 test domain. Surat terbit disimpan sebagai PDF bertanda tangan privat dan disajikan lewat route PDF berizin. **Gap: verifikasi terhadap provider BSrE nyata dan E2E.** |
| OS-SUR-014 | ✅ Berfungsi penuh | Keamanan berkas: allowlist MIME, batas ukuran, sanitasi nama, proteksi path traversal, route media privat/publik, test `media.test.ts`/`media-nama.test.ts`. **Pengaturan lampiran terpusat di admin (`/pengaturan/lampiran` kategori "surat") dengan validasi MIME/ukuran/jumlah via DB; E2E membuktikan lampiran hanya bisa diunduh pemilik.** |
| OS-FIN-001 | ✅ Berfungsi penuh | `/keuangan/anggaran`: struktur rekening, pagu, tahun, bidang, sumber dana, RBAC, cetak, E2E `keuangan.e2e.ts`. **Impor CSV/XLSX + unduh template XLSX** (`apbdes-import.ts`, `apbdes-import.test.ts`, `ApbdesImportDialog`, `ApbdesTemplateButton`) dan **laporan realisasi format resmi** `/keuangan/laporan/realisasi` (hierarki akun, JUMLAH, SURPLUS/(DEFISIT), PEMBIAYAAN NETTO, SiLPA) dengan domain `laporan-realisasi.ts` + 12 test. |
| OS-FIN-002 | ✅ Berfungsi penuh | Laporan RP APBDes, realisasi per bidang, agregasi, grafik, CSV/Excel, print, E2E `keuangan.e2e.ts`. **Rincian realisasi resmi** `/keuangan/laporan/realisasi` + ekspor CSV `/keuangan/laporan/realisasi/ekspor`, mengikuti susunan laporan rujukan (akun → bidang → rincian, persentase pembiayaan dikosongkan). |
| OS-FIN-003 | ✅ Berfungsi penuh | Realisasi, rekonsiliasi tahunan vs triwulan, saldo selisih, test + E2E. **Pembukuan manual kas** `/keuangan/pembukuan` (`pembukuan-use-cases.ts`, `pembukuan.test.ts`): CRUD transaksi pendapatan/belanja, saldo berjalan dari selisih, izin `update`/`delete`, scoping `villageId`. Saldo rekening koran bank tidak dicatat (di luar cakupan; dibandingkan lewat halaman rekonsiliasi). |
| OS-FIN-004 | 🟡 Sebagian | Arsip dokumen laporan periodik, lampiran PDF, metadata, RBAC, E2E. **Ditambah impor banyak dokumen sekaligus**: dialog unggah multi-PDF + metadata per berkas (judul, jenis, tahun, semester), validasi MIME PDF/ukuran ≤ 8 MB/keunikan periode di domain `laporan-dokumen-impor.ts` (test `laporan-dokumen-impor.test.ts`), use case `imporDokumenLaporan`, server action `imporDokumenLaporanAction`, disimpan ke media privat kategori laporan. **Gap: E2E impor belum ada.** |
| OS-FIN-005 | ✅ Berfungsi penuh | SiLPA: CRUD `/keuangan/sisa-lebih`, RBAC `keuangan-sisa-lebih`, validasi domain, dan isolasi `villageId`. Test `sisa-lebih.test.ts` + `isolasi-village.integration.test.ts`. |
| OS-FIN-006 | 🟡 Sebagian | Transparansi APBDes dan laporan triwulan publik memakai use case `getLaporanApbdesPublik()` / `getLaporanTriwulanPublik()` pada `/desa/apbdes`. **Ditambah dimensi periode (tahun + triwulan) pada keluaran publik**: `getLaporanApbdesPublik()` kini menyertakan ringkasan realisasi per triwulan (`ringkasRealisasiPeriode()`, test `laporan-triwulan.test.ts`) yang ditampilkan tema beserta filter tahun. Ditambah E2E `tests/publik-apbdes.e2e.ts` (lulus). **Gap: E2E periode publik bisa diperluas.** |
| OS-FIN-007 | ✅ Berfungsi penuh | Inventaris enam kategori, kondisi, asal, lokasi, jumlah, nilai, CRUD, RBAC, E2E. **Ditambah laporan per kategori `/inventaris/laporan` (rekap unit + nilai, filter kategori, cetak `window.print`, ekspor CSV `/inventaris/laporan/ekspor`) dengan domain murni `rekapPerKategori`/`buildInventarisCsv` + test `laporan-inventaris.test.ts`.** |
| OS-FIN-008 | ✅ Berfungsi penuh | Mutasi aset (pindah/rusak/hapus/perbaikan), approval operator → sekdes → kades, audit, E2E. **Ditambah neraca kekayaan aset `/inventaris/neraca` (total nilai per kategori + kondisi baik/rusak ringan/rusak berat, grand total, cetak) dengan domain murni `neracaAset` + test `laporan-inventaris.test.ts`.** |
| OS-FIN-009 | ✅ Berfungsi penuh | `/bumindes/buku-administrasi`: katalog buku umum/sekretariat + CRUD item, keluaran resmi cetak/CSV untuk semua buku (A1-A8,B1-B5,E1), layout kop desa seragam. |
| OS-FIN-010 | ✅ Berfungsi penuh | Buku penduduk (B1-B5) + keluaran resmi cetak/CSV, riwayat mutasi penduduk tercatat (format tabel resmi B3), tersedia melalui buku administrasi dan utilitas bumindes. |
| OS-FIN-011 | ✅ Berfungsi penuh | Domain & tabel `bumindes_tanah_kas` + `bumindes_tanah_kas_mutasi`, CRUD/UI `/bumindes/tanah-kas`, keluaran buku E1 resmi (cetak + CSV) beserta rekap mutasi. |
| OS-FIN-012 | ✅ Berfungsi penuh | Domain & tabel `bumindes_pembangunan` + `bumindes_kader`, CRUD/UI `/bumindes/pembangunan` (dan buku kader), keluaran buku resmi (cetak + CSV). |
| OS-FIN-013 | ✅ Berfungsi penuh | Domain & tabel `bumindes_peraturan`, `bumindes_aparat`, `bumindes_agenda`, CRUD/UI `/bumindes/sekretariat` (peraturan/aparat/agenda/ekspedisi), keluaran buku resmi (cetak + CSV). |
| OS-WEB-001 | 🟡 Sebagian | Beranda publik: sambutan, slider, statistik ringkas, widget, berita, surat, agenda melalui tema. **Gap: E2E beranda belum ada.** |
| OS-WEB-002 | 🟡 Sebagian | Berita: CRUD admin, kategori, status terbit, detail publik, arsip berbasis daftar, hit, test `berita.test.ts`, pencarian khusus dengan escaping wildcard LIKE. **Gap: E2E belum ada.** |
| OS-WEB-003 | 🟡 Sebagian | Profil, pemerintahan/perangkat, lembaga di route publik. **Gap: bagan SOTK lengkap dan E2E belum ada.** |
| OS-WEB-004 | 🟡 Sebagian | Galeri: admin album/foto + publik `/desa/galeri` + detail, test `galeri.test.ts`, pencarian album dengan escaping wildcard LIKE. **Gap: cetak dan E2E belum ada.** |
| OS-WEB-005 | 🟡 Sebagian | Dokumen publik/produk hukum: admin CRUD + publik `/desa/dokumen`. **Gap: peraturan/embed/arsip lengkap dan E2E publik belum ada.** |
| OS-WEB-006 | 🟡 Sebagian | `/desa/statistik` menyediakan statistik kependudukan, bantuan, dan desa. **Gap: periodisasi dan E2E belum ada.** |
| OS-WEB-007 | 🟡 Sebagian | `/desa/peta` menampilkan peta Leaflet nyata (area/garis/titik/polygon) + `/api/peta`. **Gap: E2E hanya memuat halaman; coverage layer belum diperluas.** |
| OS-WEB-008 | 🟡 Sebagian | Pembangunan publik `/desa/pembangunan` + detail + filter tahun + cetak memakai data nyata. **Gap: E2E dan keluaran dokumentasi publik lengkap belum ada.** |
| OS-WEB-009 | 🟡 Sebagian | Pengaduan publik `/desa/pengaduan` + pelacakan `/desa/pengaduan/lacak` + admin. Email perubahan status via Resend memakai `RESEND_API_KEY` dan `RESEND_FROM`, label status domain benar, serta respons error provider dicatat sebagai gagal. Operator menerima toast: email diterima Resend (bukan bukti terkirim) atau peringatan bila pengiriman dilewati/gagal; status pengaduan tetap tersimpan. Test `notification.test.ts`, `env.test.ts`, dan `presentation/actions.test.ts`. **Gap: WhatsApp, bukti pengiriman ke provider nyata, dan E2E alur pengaduan lengkap.** |
| OS-WEB-010 | 🟡 Sebagian | Kelompok/lembaga, kategori, anggota/ketua, publikasi di `/desa/kelompok`. **Gap: kontrol publikasi per anggota, cetak, dan E2E publik belum ada.** |
| OS-WEB-011 | 🟡 Sebagian | `/desa/inventaris`: aset publik, rekap, kondisi, lokasi, nilai. **Gap: filter/publikasi granular, laporan, dan E2E belum ada.** |
| OS-WEB-012 | 🟡 Sebagian | Bantuan publik `/desa/bantuan`, DPT `/desa/dpt`, kesehatan publik + ekspor; E2E tersedia. **Gap: suplemen publik belum ada** (vaksin di luar scope, OS-POP-009). |
| OS-WEB-013 | 🟡 Sebagian | Survei/statistik publik dan data IDM/SDGs nyata pada `/desa/idm-sdgs` (rute lama `/idm` dialihkan ke sana); use case `ringkasanIdmPublik()` memuat data berdasarkan desa. **Gap: analisis hasil pendataan dan E2E publik/isolasi tenant belum lengkap.** |
| OS-WEB-014 | ✅ Berfungsi penuh | Lapak: CRUD admin `/lapak` (modul + RBAC `lapak`), katalog publik `/desa/lapak` dengan pencarian dan filter kategori, tautan menu publik, dan sitemap. Pencarian memakai `LIKE` (sebelumnya `ILIKE` yang tidak didukung MySQL sehingga gagal 500); test `lapak.test.ts`, `isolasi-village.integration.test.ts`. |
| OS-WEB-015 | 🟡 Sebagian | Kontak publik `/desa/kontak` tersedia. **Gap: komentar, statistik pengunjung, dan umpan balik belum ada.** |
| OS-WEB-016 | 🟡 Sebagian | Admin menu/widget/slider + navigasi tema, E2E. **Gap: teks berjalan dan konfigurasi sosial media belum ada.** |
| OS-WEB-017 | 🟡 Sebagian | Konfigurasi tema, form opsi, registry tema, test `theme.test.ts`. **Gap: pemindaian/aktivasi tema runtime dan E2E belum ada.** |
| OS-WEB-018 | 🟡 Sebagian | Sitemap dinamis per host, robots.txt, metadata per route, OG image per host. **Gap: cakupan URL dinamis ditambah (pengaduan, lapak, kesehatan, pertanahan, peta, kontak, verifikasi surat); E2E belum ada.** |
| OS-WEB-019 | ✅ Berfungsi penuh | Token/QR dan halaman publik `/desa/verifikasi-surat/[token]` + form token, test `verifikasi.test.ts`. E2E `publik-verifikasi.e2e.ts` menjalankan alur warga → verifikasi berjenjang → token publik, ditambah smoke halaman token. |
| OS-WGA-001 | 🟡 Sebagian | Pendaftaran mandiri `/desa/registrasi-warga` (NIK harus cocok penduduk hidup desa, cegah duplikat/akun yang sudah ada) + admin `/penduduk/registrasi` untuk menyetujui/menolak; persetujuan membuat akun NIK + PIN yang ditampilkan sekali. **Gap: captcha/anti-abuse, verifikasi via HP/email, notifikasi otomatis, audit khusus, dan test/E2E belum ada.** |
| OS-WGA-002 | 🟡 Sebagian | Login bersama `/masuk`, sesi warga, ubah PIN, reset PIN operator, lupa sandi mandiri, rate limit login username (5/menit), test `warga.test.ts` + `integrasi-warga.test.ts`; login warga sukses dipakai dalam `tests/permohonan-warga.e2e.ts`. **Gap: captcha/anti-abuse, OTP/2FA, serta E2E khusus kegagalan login/rate limit belum ada.** |
| OS-WGA-003 | 🟡 Sebagian | Beranda warga, profil, ringkasan permohonan, status, dokumen, pesan, menu. **Gap: E2E untuk area warga di luar alur surat belum ada.** |
| OS-WGA-004 | 🟡 Sebagian | Pengajuan surat, isian dinamis, syarat, unggah berkas privat, status, pembatalan, riwayat; test integrasi DB. E2E `tests/permohonan-warga.e2e.ts` membuktikan pengajuan, pemeriksaan operator, verifikasi berjenjang, status terbit, dan kontrol pemilik. **Ditambah pembatalan permohonan oleh warga (sebelum diambil) dengan alasan wajib dan E2E skenario penolakan/pengembalian. Gap: variasi form belum dicakup E2E.** |
| OS-WGA-005 | 🟡 Sebagian | Dokumen warga + route unduhan surat/berkas syarat membatasi akun pemilik. E2E menguji unduh lampiran dan PDF surat terbit oleh pemilik serta 404 bagi akun warga lain. **Gap: cakupan daftar/jenis dokumen warga lainnya belum lengkap.** |
| OS-WGA-006 | 🟡 Sebagian | Halaman pesan menampilkan catatan operator dan perkembangan permohonan. **Gap: percakapan dua arah dan E2E belum ada.** |
| OS-WGA-007 | 🟡 Sebagian | Verifikasi surat publik via token/QR dapat dibuka dari dokumen. **Gap: UI verifikasi khusus di area warga dan E2E alur belum ada.** |
| OS-WGA-008 | ✅ Berfungsi penuh | `/layanan-mandiri/bantuan` kini berada di area warga terproteksi dan menampilkan program yang menautkan penduduk, KK, RTM, atau kelompoknya sebagai penerima. `getBantuanDiterimaWargaData` memakai residentId dari sesi; query membatasi desa, memvalidasi sasaran program, dan tidak membocorkan data kartu. Test integrasi `src/features/bantuan/integrasi-warga.test.ts` memeriksa semua jenis sasaran serta isolasi warga/tenant; E2E `tests/bantuan-warga.e2e.ts` memeriksa login, halaman, dan data program. UI membedakan status masa program dari bukti pencairan. |
| OS-WGA-009 | 🟡 Sebagian | Pengaduan publik, tiket, identitas tersamarkan, tanggapan, status, publikasi, dan email status via Resend dengan sender terkonfigurasi. Kegagalan/dilewati email dilaporkan kepada operator tanpa membatalkan status yang tersimpan. Test notifikasi/provider, konfigurasi env, dan action; smoke browser lokal mengonfirmasi status tersimpan dan toast peringatan saat Resend tidak dikonfigurasi. **Gap: WhatsApp, bukti pengiriman ke provider nyata, dan E2E alur lengkap.** |
| OS-WGA-010 | 🟡 Sebagian | Area warga belum punya lapak/produk sendiri; katalog publik `/desa/lapak` sudah berisi data. **Gap: CRUD pelapak/produk oleh warga, kaitan `residentId`, dan publikasi produk per warga belum ada.** |
| OS-WGA-011 | 🟡 Sebagian | Kehadiran perangkat admin `/kehadiran` (CRUD, tabel, dialog, test domain) dan `/kehadiran/daftar-hadir`, kini terdaftar sebagai modul + RBAC. **Gap: pengajuan izin dari area warga, jam kerja/hari libur, dan rekap bulanan otomatis belum ada.** |
| OS-ANA-001 | 🟡 Sebagian | Kategori analisis `/analisis`: use case, server actions, UI CRUD, RBAC `analisis`, dan modul menu. **Gap: test domain/E2E dan pemakaian kategori pada laporan belum ada.** |
| OS-ANA-002 | 🟡 Sebagian | Indikator analisis `/analisis`: CRUD (kode, nama, kategori, keterangan) dengan validasi kategori per desa. **Gap: parameter, bobot/skoring, dan test/E2E belum ada.** |
| OS-ANA-003 | 🟡 Sebagian | Survei: periode aktif/nonaktif, pertanyaan, responden, jawaban, UI admin, test `survey.test.ts`. **Gap: sasaran/parameter analisis dan E2E belum ada.** |
| OS-ANA-004 | 🟡 Sebagian | Rekap pilihan, rata-rata, min/maks, jawaban teks, grafik ringkas. **Gap: skoring, klasifikasi, laporan formal, dan E2E belum ada.** |
| OS-ANA-005 | 🟡 Sebagian | Impor/ekspor respons CSV dengan validasi + proteksi formula, test `survey-csv.test.ts`. **Gap: integrasi formulir eksternal dan E2E belum ada.** |
| OS-ANA-006 | 🟡 Sebagian | Survei aktif + daftar pertanyaan dipublikasikan di `/desa/analisis-survei`. **Gap: pengisian mandiri publik dan E2E belum ada.** |
| OS-MOD-001 | 🟡 Sebagian | Anjungan: modul + RBAC `anjungan`, CRUD admin lengkap (tambah/ubah/hapus, status, urutan, dialog). **Gap: alur kiosk/anjungan publik yang benar-benar berfungsi dan test/E2E belum ada.** |
| OS-MOD-002 | ✅ Berfungsi penuh | Buku Tamu: CRUD admin `/buku-tamu`, laporan, modul + RBAC `buku-tamu`. Test `buku-tamu.test.ts` + isolasi tenant `isolasi-village.integration.test.ts`. |
| OS-MOD-003 | 🟡 Sebagian | Kehadiran: CRUD perangkat, rekap dasar. Kekurangan: Otomasi rekap bulanan, integrasi perangkat desa lebih dalam. |
| OS-MOD-004 | 🟡 Sebagian | Lapak admin `/lapak` (modul + RBAC) dan publik `/desa/lapak` dengan data nyata, pencarian, filter kategori, serta menu bawaan. **Gap: entitas pelapak/produk terpisah, keranjang, peta produk, dan cetak belum ada.** |
| OS-MOD-005 | 🟡 Sebagian | Pelanggan `/pelanggan`: CRUD (nama, kontak, alamat, keterangan), modul + RBAC `pelanggan`. **Gap: pendaftaran kerja sama/langganan, status berlangganan, dan test/E2E belum ada.** |
| OS-OPS-001 | ✅ Berfungsi penuh | Pengguna, grup/role, modul, resource izin, menu efektif, pewarisan parent module. Test `pengguna.test.ts`, `modul.test.ts`, `permission.test.ts`, `build-menu.test.ts`; E2E `ops.e2e.ts` (grup/pengguna/modul). |
| OS-OPS-002 | 🟡 Sebagian | Dashboard `/beranda`, menu berbasis izin, AppShell, navigasi admin, E2E. **Gap: shortcut dan konfigurasi navigasi personal belum ada.** |
| OS-OPS-003 | 🟡 Sebagian | Pengaturan identitas desa, mode surat, tema, konten, media tersebar di beberapa route. **Gap: pengaturan aplikasi/warga/lampiran terpusat belum ada.** |
| OS-OPS-004 | 🟡 Sebagian | Login, sesi, ubah PIN, hash kredensial, reset PIN operator, lupa sandi mandiri (email + token), rate limit, audit; E2E `/lupa-sandi`. **Gap: OTP/2FA/captcha dan test domain auth belum ada.** |
| OS-OPS-005 | 🟡 Sebagian | Belum ada UI notifikasi: halaman `/pengaturan/notifikasi` menyatakan pusat notifikasi/mailbox/SMS belum tersedia. Email status pengaduan memakai Resend (`OS-WEB-009`/`OS-WGA-009`), tetapi pusat notifikasi/mailbox/SMS belum ada. |
| OS-OPS-006 | 🟡 Sebagian | Audit aktivitas keamanan tersedia melalui `recordAuditEvent()`, `/pengaturan/log-aktivitas`, filter, pagination, serta test domain/repository. **Gap: cakupan audit seluruh domain dan alur E2E belum lengkap.** |
| OS-OPS-007 | 🟡 Sebagian | Backup SQL/SQL.GZ dan restore melalui `/pengaturan/database`, use case berizin dan audit; test domain tersedia. **Ditambah E2E `tests/backup-database.e2e.ts` (lulus). Gap: E2E restore dan pengujian operasi database besar/pemulihan belum lengkap.** |
| OS-OPS-008 | 🟡 Sebagian | Halaman `/pengaturan/plugin` menyatakan registri/instalasi plugin belum tersedia dan tidak menampilkan plugin aktif; registri plugin, instalasi, dan aktivasi belum ada. |
| OS-OPS-009 | 🟡 Sebagian | Halaman `/pengaturan/sinkronisasi` menyatakan integrasi/log sinkronisasi belum tersedia dan tidak menampilkan data contoh; sinkronisasi pusat/OpenDK nyata belum ada. |
| OS-OPS-010 | ✅ Berfungsi penuh | Media: unggah/optimasi gambar, penamaan aman, route media publik/privat; test `media.test.ts` dan `media-nama.test.ts`. |
| OS-OPS-011 | 🟡 Sebagian | API yang ada: auth, media publik, pengaduan lampiran, docs-status, peta, lookup NIK, backup/restore. **Gap: API informasi publik/inventaris/surat yang komprehensif dan E2E belum ada.** |
| OS-OPS-012 | 🟡 Sebagian | API eksternal ber-API key (`EKSTERNAL_API_KEY`, SHA-256 + `timingSafeEqual`, rate limit 100 permintaan/menit per kunci): `POST /api/eksternal/tte/tanda-tangan` (PDF → PDF bertanda tangan), `GET /api/eksternal/surat/[token]` (metadata non-pribadi; token 64 hex), dan `POST /api/eksternal/surat/verifikasi`. Tenant dari host, audit `api.eksternal.*`. **Gap: kontrak OpenAPI, endpoint tulis surat, dan E2E.** |
**Catatan lintas-ID (direkonsiliasi 5 Nov 2026):**
- Register ini mencakup seluruh 113 ID katalog tepat satu kali; ringkasan domain
  dihitung langsung dari status per-ID di atas.
- Implementasi IDM/SDGs sudah tersedia pada admin dan situs publik, dengan unit
  test domain dan alur E2E di `tests/idm.e2e.ts`; status tetap 🟡 sampai keluaran
  laporan dan isolasi lintas-tenant diuji lengkap.
- `.github/workflows/ci.yml` menjalankan migrasi, seed, smoke HTTP, dan suite
  E2E browser pada build produksi; hasil E2E diunggah sebagai artefak.
- Pembaruan 5 Nov 2026 (audit Batch 1–2): Batch 1 (Persuratan & TTE) hampir selesai non-E2E. `OS-SUR-001`/`002`/`008` (varian template/PDF), `OS-SUR-003` (validasi lampiran syarat warga via pengaturan kategori "permohonan"), `OS-SUR-009`/`010`/`012` (lampiran disposisi/ekspedisi), `OS-SUR-014` (pengaturan lampiran terpusat, kini tertaut dari `/persuratan/surat`), dan API eksternal dasar `OS-OPS-012` termasuk rate limit tersedia. Sisa non-E2E: `OS-OPS-012` (kontrak OpenAPI + endpoint tulis surat) dan `OS-SUR-013` (verifikasi provider BSrE nyata, bergantung kredensial). Gap E2E: `OS-SUR-011` (E2E-only) serta `OS-SUR-002`/`003`/`007`/`008` (E2E lanjutan).
- Angka resmi **35 ✅ / 77 🟡 / 0 🔴 / 1 ⚪**. Batch 2 bagian keuangan menaikkan `OS-FIN-001`, `OS-FIN-002`, dan `OS-FIN-003` ke ✅; sisa gap Batch 2 adalah E2E (`OS-FIN-004`, `OS-FIN-006`).

## Ringkasan modul per domain

Tabel ini menggantikan tabel baseline lama per kategori yang sudah usang
(misalnya DPT/DTKS/suplemen/GIS/pembangunan masih ditulis 🔴 padahal sudah ada).
Status rinci tetap mengacu register per-ID di atas.

| Domain | ID | ✅ | 🟡 | 🔴 | Catatan utama |
|---|---:|---:|---:|---:|---|
| Kependudukan & sosial (OS-POP) | 15 | 9 | 5 | 0 | Sisa gap: impor DTKS, keluaran statistik/bantuan; 1 ID di luar scope. |
| Wilayah, GIS & pertanahan (OS-WIL) | 8 | 1 | 7 | 0 | Polygon sudah dirender per layer di peta publik; admin pertanahan masih baca dan test GIS belum lengkap. |
| Persuratan (OS-SUR) | 14 | 4 | 10 | 0 | Alur inti berjalan; TTE operasional (provider BSrE), API eksternal dasar, arsip/permohonan diperluas. **Lampiran disposisi/ekspedisi, ekspedisi terpadu, pengaturan lampiran terpusat, validasi lampiran komprehensif, varian template/PDF (default/landscape/compact) selesai.** Sisa: E2E (`OS-SUR-011` E2E-only, lainnya 🟡 hanya gap E2E). |
| Web publik (OS-WEB) | 19 | 2 | 17 | 0 | IDM/SDGs nyata; katalog lapak + pencarian/filter berjalan, sisa gap analisis hasil dan entitas pelapak. |
| Layanan mandiri warga (OS-WGA) | 11 | 1 | 10 | 0 | Registrasi mandiri dan bantuan personal tersedia; lapak/kehadiran warga dan pesan dua arah belum. |
| Analisis & survei (OS-ANA) | 6 | 0 | 6 | 0 | Survei, kategori, dan indikator tersedia; parameter, skoring, dan analisis formal belum lengkap. |
| Modul tambahan (OS-MOD) | 5 | 1 | 4 | 0 | Buku tamu, anjungan, kehadiran, lapak, dan pelanggan punya CRUD; alur publik/kerja sama belum lengkap. |
| Sistem & operasional (OS-OPS) | 12 | 2 | 10 | 0 | Audit log dan backup tersedia sebagian; API eksternal dasar ada, notifikasi/plugin/sinkronisasi belum lengkap. |
| Pemerintahan & pemerintahan desa (OS-GOV) | 10 | 4 | 6 | 0 | SOTK/cetak, laporan lembaga, keluaran IDM, kandidat/hasil pemilihan, dan buku pembangunan masih menjadi gap. |
| Keuangan, aset & bumindes (OS-FIN) | 13 | 11 | 2 | 0 | APBDes + impor/template + laporan realisasi resmi, keuangan manual, inventaris + neraca, dan bumindes selesai; sisa E2E impor dokumen (`OS-FIN-004`) dan periode publik (`OS-FIN-006`). |
| **Total** | **113** | **35** | **77** | **0** | 1 ID di luar scope (`OS-POP-009`). |

## Peta Prioritas Implementasi

Prioritas hanya menentukan urutan kerja, bukan scope produk.

### Gelombang 1 — Operasi harian

Penduduk + log, KK, RTM, surat lengkap + verifikasi publik, keuangan +
transparansi, inventaris + mutasi berjenjang, Bumindes inti, bantuan, layanan
mandiri warga, web publik + tema, pengaturan, kelompok/lembaga, dan perangkat.

### Gelombang 2 — Transparansi dan domain desa

Pembangunan + dokumentasi, pengaduan, pertanahan/persil, DPT/DTKS/suplemen,
statistik, peta/GIS, produk hukum, IDM/SDGs, analisis penuh, surat dinas,
backup database, audit log, dan keluaran lanjutan.

### Gelombang 3 — Ekosistem dan integrasi

Lapak, anjungan, buku tamu, kehadiran, pelanggan, SMS/mailbox/notifikasi,
plugin, sinkronisasi/OpenDK, optimasi gambar, pemilihan, sinergi program,
vaksin/Covid, API internal/eksternal, TTE/BSrE, dan adapter pihak ketiga.

Semua gelombang wajib selesai untuk mencapai target produk. Status ✅ baru boleh
diberikan setelah Definition of Done di katalog terpenuhi.

---

## Kesimpulan

1. Proyek masih berada di fase pembangunan; target akhirnya seluruh ID `OS-*`.
2. Register berisi 113 ID unik: 35 berfungsi penuh, 77 sebagian, 0 belum ada,
   dan 1 di luar scope. Persentase scope 112 ID: 31,3% penuh, 68,8% sebagian,
   dan 0% belum ada.
3. IDM/SDGs sudah memiliki halaman admin/publik, use case, unit test, dan E2E;
   statusnya sebagian karena keluaran laporan dan isolasi tenant belum lengkap.
4. Prioritas penutupan tetap pada gap keluaran, alur warga, analisis, GIS,
   modul tambahan, integrasi, dan hardening; lihat gap spesifik per ID di atas.
5. Status ✅ hanya diberikan setelah Definition of Done di katalog dibuktikan.
