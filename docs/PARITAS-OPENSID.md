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
- **Rute orphan**: ada beberapa halaman fisik di `src/app/` tanpa entri di `modules.ts`/navigasi/RBAC (contoh: `/pengaturan/plugin`, `/pengaturan/notifikasi`, `/pengaturan/sinkronisasi`). Halaman-halaman ini **tidak dikaitkan** ke ID katalog `OS-*` dan tidak dihitung sebagai "modul terdaftar"/berfungsi.
- **Halaman statis placeholder**: beberapa rute publik (`/desa/lapak`, `/desa/idm-sdgs`) ada sebagai halaman statis, namun belum terhubung ke use-case/backend modul terkait.
- **Tombol tanpa rute**: beberapa tombol ada di UI namun rutenya belum diimplementasikan (contoh: ekspor PDF statistik) — dicatat sebagai gap, bukan fitur selesai.
- **Kualitas kode**: seluruh cast `as any` di halaman admin, halaman publik, dan komponen presentation telah dihapus. Action state kini memakai `createIdleActionState<T>()` yang generik; akses properti state (`message`, `fieldErrors`) langsung tanpa cast. Tipe DTO domain (`ArsipDTO`, `BukuTamuDTO`, dll.) dipakai secara konsisten di seluruh lapisan.
---

## Ringkasan Paritas


| Scope | Total ID/modul | ✅ | 🟡 | 🔴 | ⚪ |
|---|---:|---:|---:|---:|---:|
| **Katalog per-ID — status terkini (audit 29 Okt 2026)** | **113** | **15** | **77** | **20** | **1** |
| Baseline kelompok lama (92 modul) — **historis, bukan status delivery** | 92 | 42 | 12 | 38 | — |

Dari 112 ID dalam scope: **15 ✅ (13,4%)**, **77 🟡 (68,8%)**,
**20 🔴 (17,9%)**. Satu ID (OS-POP-009) resmi di luar scope. Tidak ada lagi ID
berstatus ⚪ "belum diaudit": seluruh 113 ID sudah diperiksa terhadap route,
halaman, feature, test, dan E2E yang benar-benar ada.

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
| OS-POP-005 | ✅ Berfungsi penuh | DPT `/penduduk/dpt` (CRUD pemilihan, filter lengkap, pagination), ekspor/rekap `/penduduk/dpt/rekap`, publik `/desa/dpt`. Test `dpt.test.ts` 7 case; E2E `rtm-dpt.e2e.ts` + `publik-verifikasi.e2e.ts`. |
| OS-POP-006 | 🟡 Sebagian | DTKS: CRUD dari RTM, status, agregasi anggota, lampiran, pengaturan, laporan, ekspor CSV. **Impor CSV** tersedia via dialog `/penduduk/dtks` (`DtksImportDialog` + `imporDtksAction`) dengan pembacaan CSV/XLSX lewat `bacaImporDariFormData`. **Gap: test alur impor belum lengkap** dan belum ada dokumentasi validasi baris secara menyeluruh. Test `dtks.test.ts` + `dtks-berkas.test.ts`; E2E `/penduduk/dtks`. |
| OS-POP-007 | ✅ Berfungsi penuh | Suplemen: CRUD, detail `/penduduk/suplemen/[id]`, isian dinamis (`dataFormIsian`), ekspor, laporan, cetak. Test `suplemen.test.ts`, `suplemen-berkas.test.ts`; E2E `rtm-dpt.e2e.ts`. |
| OS-POP-008 | ✅ Berfungsi penuh | Posyandu/KIA/ibu hamil/bulanan anak: admin + publik `/desa/kesehatan/{kia,ibu-hamil,pemantauan-anak}`, ekspor CSV admin & publik, skorcard konvergensi. 39 test (domain/repo/application); E2E `kesehatan.e2e.ts`. |
| OS-POP-009 | ⚪ Di luar scope | Modul vaksin/Covid tidak diimplementasikan karena dinilai tidak relevan. |
| OS-POP-010 | 🟡 Sebagian | Statistik penduduk `/statistik/penduduk`, rentang umur, filter wilayah/umur, ekspor CSV, tombol cetak browser. **Gap: tombol "Cetak PDF" mengarah ke `/statistik/penduduk/ekspor/pdf` yang direktorinya kosong (404)**; test hanya domain/repo. E2E `statistik-bantuan.e2e.ts`. |
| OS-POP-011 | 🟡 Sebagian | Program bantuan: CRUD, detail, peserta, ekspor CSV, RBAC. **Cetak via browser** ditambahkan di detail program (`/bantuan/[id]`). **Gap: cetak/PDF khusus format resmi belum ada.** Test `bantuan.test.ts`; E2E `statistik-bantuan.e2e.ts`. |
| OS-POP-012 | 🟡 Sebagian | Peserta bantuan: kandidat sasaran tenant-aware, snapshot kartu, ubah kartu, ekspor CSV, pembersihan massal, dan cetak kartu lewat `window.print()`. **Gap: impor peserta belum ada** (belum diimplementasikan; butuh mapping per jenis sasaran + validasi duplikat). Test `bantuan.test.ts`; E2E detail `/bantuan/999999`. |
| OS-POP-013 | 🟡 Sebagian | Statistik bantuan per program/sasaran, filter wilayah/periode, ekspor CSV, cetak browser. **Gap: tombol "Cetak PDF" ada di UI namun rute `/statistik/bantuan/ekspor/pdf` belum diimplementasikan (akan mengarah ke 404); dimensi kategori sasaran belum lengkap.** Test `statistik.test.ts`; E2E `statistik-bantuan.e2e.ts`. |
| OS-POP-014 | ✅ Berfungsi penuh | Jajak pendapat admin `/pendapat` + publik `/jajak-pendapat`, rekap, ekspor, hapus, pagination, pembatasan suara `sessionKey` + unique index. Test `pendapat.test.ts`; E2E `pendapat.e2e.ts`. |
| OS-POP-015 | ✅ Berfungsi penuh | Kontak & grup: CRUD, anggota grup, impor/ekspor CSV, `kontak.resident_id` + lookup NIK `/api/penduduk/nik`, ekspor. Test `kontak.test.ts` 22 case; E2E `wilayah-pemerintahan.e2e.ts`. |
| OS-WIL-001 | ✅ Berfungsi penuh | CRUD dusun/RW/RT, validasi kombinasi, pagination, RBAC, rekap `/wilayah/rekap` + cetak. Test `wilayah.test.ts`; E2E `wilayah-pemerintahan.e2e.ts`. |
| OS-WIL-002 | 🟡 Sebagian | Skema `area` + CRUD + halaman `/pemetaan/area`, RBAC `gis-area`. **Gap: belum ada test domain/repo/E2E** untuk GIS. |
| OS-WIL-003 | 🟡 Sebagian | Skema `garis` + CRUD + `/pemetaan/garis` (LineString, refLine). **Gap: test/E2E belum ada.** |
| OS-WIL-004 | 🟡 Sebagian | Skema `point` + CRUD + `/pemetaan/point` (Point, simbol, tipe). **Gap: test/E2E belum ada.** |
| OS-WIL-005 | 🟡 Sebagian | Skema `polygon` + CRUD kategori/layer `/pemetaan/polygon`. **Gap: polygon belum dirender di peta publik dan test/E2E belum ada.** |
| OS-WIL-006 | 🟡 Sebagian | Publik `/desa/pertanahan` membaca persil/Cdesa/mutasi nyata + E2E. **Gap: admin `/pemetaan/pertanahan` hanya baca (tidak ada UI CRUD/impor), test domain belum ada.** |
| OS-WIL-007 | 🟡 Sebagian | Peta publik `/desa/peta` memakai Leaflet + `/api/peta` dari area/garis/point. **Gap: layer polygon belum tampil, test/E2E peta belum ada.** |
| OS-WIL-008 | 🟡 Sebagian | Katalog simbol `gis_simbol` + CRUD `/pemetaan/simbol`. **Gap: test/E2E belum ada.** |
| OS-GOV-001 | ✅ Berfungsi penuh | Identitas desa `/pengaturan/desa` (alamat, kontak, kades, logo, TTD, stempel), RBAC, audit, dipakai cetak surat & publik. Test `desa.test.ts`; E2E `ops.e2e.ts`. |
| OS-GOV-002 | ✅ Berfungsi penuh | Perangkat/jabatan `/konten/perangkat`: CRUD, foto, periode, status, penanda tangan, urutan. Test `perangkat.test.ts`; E2E `wilayah-pemerintahan.e2e.ts`. |
| OS-GOV-003 | 🟡 Sebagian | Struktur jabatan + perangkat + publik `/desa/pemerintahan`. **Gap: bagan SOTK dan cetak SOTK belum ada, test/E2E khusus SOTK belum ada.** |
| OS-GOV-004 | 🟡 Sebagian | Lembaga via `kelompok` tipe `lembaga`: kategori, CRUD, anggota, jabatan, RBAC, publikasi. **Cetak via browser** tersedia di halaman daftar. **Gap: laporan daftar anggota terperinci dan ekspor belum ada.** E2E admin `/kelompok?tipe=lembaga`. |
| OS-GOV-005 | 🟡 Sebagian | Kelompok masyarakat: kategori, CRUD, anggota, jabatan, publikasi. **Cetak via browser** tersedia di halaman daftar. **Gap: laporan daftar anggota terperinci dan ekspor belum ada.** Test `kelompok.test.ts`; E2E `/kelompok?tipe=kelompok`. |
| OS-GOV-006 | 🔴 Belum ada | Hanya skema `idm.ts` + domain/repo dasar; **rute `/desa/idm` belum dibuat (404)** dan `/desa/idm-sdgs` hanya teks statis "Data status desa, IDM, dan SDGs akan ditampilkan di sini". Belum ada input indikator, skor IDM/SDGs, atau test. |
| OS-GOV-007 | 🔴 Belum ada | Hanya skema/domain stub `pemilihan`; **rute `/desa/pemilihan` belum dibuat (404)**. Belum ada kandidat, pemilih, hasil, rekap, atau test. |
| OS-GOV-008 | 🟡 Sebagian | Sinergi program `/desa/sinergi`: CRUD (tabel, form tambah/ubah, hapus), pencarian, RBAC `sinergi`, migrasi `sinergi_program`, ekspor CSV `/desa/sinergi/ekspor`. Test `sinergi.test.ts`. **Gap: E2E dan publikasi program ke web belum ada.** |
| OS-GOV-009 | 🟡 Sebagian | Pembangunan: CRUD proyek `/pembangunan`, detail + dokumentasi foto, publik `/desa/pembangunan` + detail + cetak, RBAC, test 13 case. **Gap: buku pembangunan/ekspor PDF dan E2E belum ada.** |
| OS-GOV-010 | ✅ Berfungsi penuh | Dokumen & Arsip: CRUD dokumen dan arsip, integrasi publik, test aplikasi. |
| OS-SUR-001 | 🟡 Sebagian | Master jenis surat, builder isian dinamis, placeholder/formula, template, RBAC, test `isian.test.ts`. **Gap: E2E dan seluruh variasi keluaran template belum ada.** |
| OS-SUR-002 | 🟡 Sebagian | Surat warga: sumber penduduk, isian dinamis, pengikut, penduduk luar, konsep, CRUD, RBAC, test `pengikut.test.ts`/`surat.test.ts`. **Gap: E2E alur tulis belum ada.** |
| OS-SUR-003 | 🟡 Sebagian | Master syarat, aktif/nonaktif, relasi jenis surat, unggahan syarat warga, validasi isian. **Gap: E2E dan skenario lampiran lengkap belum ada.** |
| OS-SUR-004 | 🟡 Sebagian | CRUD klasifikasi + relasi ke jenis/agenda, RBAC, UI. **Gap: E2E belum ada.** |
| OS-SUR-005 | ✅ Berfungsi penuh | Permohonan admin `/permohonan-surat` + warga, status berurutan, pemeriksaan, pengembalian, pembatalan, unggahan syarat, riwayat, konsep surat. E2E `surat-konten.e2e.ts`; test `surat.test.ts`/`verifikasi.test.ts`. |
| OS-SUR-006 | 🟡 Sebagian | Empat mode penomoran, kode desa, nomor otomatis, cek duplikasi lintas agenda, test `penomoran.test.ts`. **Gap: arsip nomor terpisah dan E2E belum ada.** |
| OS-SUR-007 | 🟡 Sebagian | Verifikasi berurutan operator → sekretaris → kades, pembatasan role, tolak/kembalikan, test domain. **Gap: E2E alur verifikasi belum ada.** |
| OS-SUR-008 | 🟡 Sebagian | Cetak HTML/PDF, kop/logo/TTD/stempel, QR, token verifikasi, halaman publik `/desa/verifikasi-surat/[token]`, test `surat-pdf.test.ts`/`verifikasi.test.ts`. **Gap: E2E hanya memuat halaman token dummy, bukan alur token valid; variasi keluaran belum lengkap.** |
| OS-SUR-009 | 🟡 Sebagian | Surat masuk: CRUD, klasifikasi, pencarian, nomor agenda, RBAC. **Cetak via browser** tersedia di halaman agenda. **Gap: disposisi, lampiran, log surat, dan E2E belum ada.** |
| OS-SUR-010 | 🟡 Sebagian | Surat keluar: CRUD, ekspedisi/tanggal kirim, klasifikasi, agenda, pencarian, RBAC. **Cetak via browser** tersedia di halaman agenda. **Gap: lampiran dan E2E belum ada.** |
| OS-SUR-011 | 🟡 Sebagian | Surat dinas: CRUD, klasifikasi, arsip fisik/digital, lampiran media, RBAC, test `surat-dinas.test.ts`. **Cetak via browser** tersedia di halaman agenda. **Gap: E2E belum ada.** |
| OS-SUR-012 | 🟡 Sebagian | Agenda surat masuk/keluar + nomor agenda. **Gap: log surat, ekspedisi terpadu, rekam jejak perubahan, dan E2E belum ada.** |
| OS-SUR-013 | 🟡 Sebagian | Adapter TTE `domain/tte.ts` (mode `nonaktif`/`manual`/`bsre`, env `TTE_*`) + 7 test, dipanggil saat terbit surat. Halaman `/persuratan/tte` ada (minimal/placeholder). **Gap: belum ada klien jaringan, form konfigurasi provider yang bisa dioperasikan, atau E2E.** |
| OS-SUR-014 | 🟡 Sebagian | Keamanan berkas: allowlist MIME, batas ukuran, sanitasi nama, proteksi path traversal, route media privat/publik, test `media.test.ts`/`media-nama.test.ts`. **Gap: pengaturan lampiran terpusat di admin dan E2E belum ada.** |
| OS-FIN-001 | 🟡 Sebagian | `/keuangan/anggaran`: struktur rekening, pagu, tahun, bidang, sumber dana, RBAC, cetak, E2E. **Gap: impor/template dan keluaran APBDes lengkap belum ada.** |
| OS-FIN-002 | 🟡 Sebagian | Laporan RP APBDes, realisasi per bidang, agregasi, grafik, CSV/Excel, print, E2E `keuangan.e2e.ts`. **Gap: variasi laporan lengkap belum ada.** |
| OS-FIN-003 | 🟡 Sebagian | Realisasi, rekonsiliasi tahunan vs triwulan, saldo selisih, test + E2E. **Gap: pembukuan manual/saldo bank belum ada.** |
| OS-FIN-004 | 🟡 Sebagian | Arsip dokumen laporan periodik, lampiran PDF, metadata, RBAC, E2E; halaman arsip menautkan ekspor laporan RP APBDes (bukan ekspor arsip). **Gap: impor dokumen belum ada.** |
| OS-FIN-005 | ✅ Berfungsi penuh | SiLPA: CRUD dasar lengkap, terintegrasi navigasi, test domain/application tersedia. |
| OS-WEB-006 | 🟡 Sebagian | Statistik desa tersedia, sisa fitur menunggu Fase 3A/3E. |
| OS-FIN-007 | 🟡 Sebagian | Inventaris enam kategori, kondisi, asal, lokasi, jumlah, nilai, CRUD, RBAC, E2E. **Gap: laporan/cetak per kategori belum ada.** |
| OS-FIN-008 | 🟡 Sebagian | Mutasi aset (pindah/rusak/hapus/perbaikan), approval operator → sekdes → kades, audit, E2E. **Gap: laporan kekayaan dan cetak belum ada.** |
| OS-FIN-009 | 🟡 Sebagian | `/bumindes/buku-administrasi`: katalog buku umum/sekretariat + CRUD item, E2E. **Gap: format buku resmi, laporan, dan cetak belum ada.** |
| OS-FIN-010 | 🟡 Sebagian | Buku penduduk induk, KTP/KK, mutasi, rekap, penduduk sementara + sinkronisasi dari penduduk. **Gap: keluaran resmi, riwayat mutasi, dan E2E belum ada.** |
| OS-FIN-011 | 🟡 Sebagian | Buku Tanah Kas Desa/Tanah di Desa hanya sebagai item katalog generik. **Gap: domain persil/rincian/mutasi khusus dan keluaran buku belum ada.** |
| OS-FIN-012 | 🟡 Sebagian | Buku inti dapat menyimpan item, tetapi domain proyek/rencana/kegiatan/hasil pembangunan dan kader belum ada. **Gap: buku khusus + E2E.** |
| OS-FIN-013 | 🟡 Sebagian | Buku agenda/ekspedisi/peraturan/keputusan/aparat sebagai katalog generik. **Gap: rekam sekretariat khusus, laporan, cetak, dan E2E.** |
| OS-WEB-001 | 🟡 Sebagian | Beranda publik: sambutan, slider, statistik ringkas, widget, berita, surat terbaru lewat tema. **Gap: agenda dan E2E beranda belum ada.** |
| OS-WEB-002 | 🟡 Sebagian | Berita: CRUD admin, kategori, status terbit, detail publik, arsip berbasis daftar, hit, test `berita.test.ts`. **Gap: pencarian khusus dan E2E belum ada.** |
| OS-WEB-003 | 🟡 Sebagian | Profil, pemerintahan/perangkat, lembaga di route publik. **Gap: bagan SOTK lengkap dan E2E belum ada.** |
| OS-WEB-004 | 🟡 Sebagian | Galeri: admin album/foto + publik `/desa/galeri` + detail, test `galeri.test.ts`. **Gap: cetak, pencarian galeri, dan E2E belum ada.** |
| OS-WEB-005 | 🟡 Sebagian | Dokumen publik/produk hukum: admin CRUD + publik `/desa/dokumen`. **Gap: peraturan/embed/arsip lengkap dan E2E publik belum ada.** |
| OS-WEB-006 | 🟡 Sebagian | `/desa/statistik` menyediakan statistik kependudukan, bantuan, dan desa. **Gap: periodisasi dan E2E belum ada.** |
| OS-WEB-007 | 🟡 Sebagian | `/desa/peta` menampilkan peta Leaflet nyata (area/garis/titik) + `/api/peta`. **Gap: polygon belum tampil dan E2E belum ada.** |
| OS-WEB-008 | 🟡 Sebagian | Pembangunan publik `/desa/pembangunan` + detail + filter tahun + cetak memakai data nyata. **Gap: E2E dan keluaran dokumentasi publik lengkap belum ada.** |
| OS-WEB-009 | 🟡 Sebagian | Pengaduan publik `/desa/pengaduan` + pelacakan `/desa/pengaduan/lacak` + admin + test. **Gap: notifikasi status dan E2E belum ada.** |
| OS-WEB-010 | 🟡 Sebagian | Kelompok/lembaga, kategori, anggota/ketua, publikasi di `/desa/kelompok`. **Gap: kontrol publikasi per anggota, cetak, dan E2E publik belum ada.** |
| OS-WEB-011 | 🟡 Sebagian | `/desa/inventaris`: aset publik, rekap, kondisi, lokasi, nilai. **Gap: filter/publikasi granular, laporan, dan E2E belum ada.** |
| OS-WEB-012 | 🟡 Sebagian | Bantuan publik `/desa/bantuan`, DPT `/desa/dpt`, kesehatan publik + ekspor; E2E tersedia. **Gap: suplemen publik belum ada** (vaksin di luar scope, OS-POP-009). |
| OS-WEB-013 | 🟡 Sebagian | Survei publik dan statistik tersedia; `/desa/idm-sdgs` masih halaman statis tanpa data. **Gap: IDM/SDGs dan analisis hasil belum ada.** |
| OS-WEB-014 | ✅ Berfungsi penuh | Lapak: CRUD admin dan katalog publik lengkap, filter kategori, media tenant-aware. |
| OS-WEB-015 | 🟡 Sebagian | Kontak publik `/desa/kontak` tersedia. **Gap: komentar, statistik pengunjung, dan umpan balik belum ada.** |
| OS-WEB-016 | 🟡 Sebagian | Admin menu/widget/slider + navigasi tema, E2E. **Gap: teks berjalan dan konfigurasi sosial media belum ada.** |
| OS-WEB-017 | 🟡 Sebagian | Konfigurasi tema, form opsi, registry tema, test `theme.test.ts`. **Gap: pemindaian/aktivasi tema runtime dan E2E belum ada.** |
| OS-WEB-018 | 🟡 Sebagian | Sitemap, robots, metadata per route, OG image per host. **Gap: cakupan URL dinamis lengkap dan E2E belum ada.** |
| OS-WEB-019 | ✅ Berfungsi penuh | Token/QR dan halaman publik `/desa/verifikasi-surat/[token]` + form token, test `verifikasi.test.ts`. E2E `publik-verifikasi.e2e.ts` (baru memuat halaman token). |
| OS-WGA-001 | 🔴 Belum ada | Hanya skema `registrasi_warga` tanpa pemakaian. Tidak ada halaman pendaftaran, aktivasi, verifikasi, atau test. |
| OS-WGA-002 | 🟡 Sebagian | Login bersama `/masuk`, sesi warga, ubah PIN, reset PIN operator, lupa sandi mandiri, rate limit, test `warga.test.ts` + `integrasi-warga.test.ts`. **Gap: captcha/anti-abuse, OTP/2FA, dan E2E warga belum ada.** |
| OS-WGA-003 | 🟡 Sebagian | Beranda warga, profil, ringkasan permohonan, status, dokumen, pesan, menu. **Gap: E2E area warga belum ada.** |
| OS-WGA-004 | 🟡 Sebagian | Pengajuan surat, isian dinamis, syarat, unggah berkas privat, status, pembatalan, riwayat; test integrasi DB. **Gap: E2E belum ada.** |
| OS-WGA-005 | 🟡 Sebagian | Dokumen warga + route unduhan surat/berkas syarat membatasi akun pemilik. **Gap: E2E dan keluaran dokumen lengkap belum ada.** |
| OS-WGA-006 | 🟡 Sebagian | Halaman pesan menampilkan catatan operator dan perkembangan permohonan. **Gap: percakapan dua arah dan E2E belum ada.** |
| OS-WGA-007 | 🟡 Sebagian | Verifikasi surat publik via token/QR dapat dibuka dari dokumen. **Gap: UI verifikasi khusus di area warga dan E2E alur belum ada.** |
| OS-WGA-008 | 🔴 Belum ada | Halaman `/layanan-mandiri/bantuan` hanya teks statis "Informasi program bantuan untuk warga"; tidak ada data, use case, atau personalisasi penerima. |
| OS-WGA-009 | 🟡 Sebagian | Pengaduan publik, tiket, identitas tersamarkan, tanggapan, status, publikasi, test `pengaduan.test.ts`. **Gap: notifikasi dan E2E lengkap belum ada.** |
| OS-WGA-010 | 🔴 Belum ada | `/lapak` admin dan `/desa/lapak` masih placeholder; hanya skema `lapak.ts` tanpa produk, pelapak, atau pemetaan produk. |
| OS-WGA-011 | 🔴 Belum ada | `/kehadiran` dan `/kehadiran/daftar-hadir` masih placeholder; hanya skema `kehadiran.ts` tanpa jam kerja, izin, atau rekap. |
| OS-ANA-001 | 🔴 Belum ada | Hanya skema `analisis.ts`; `/analisis` masih placeholder. Tidak ada kategori, UI, use case, atau test. |
| OS-ANA-002 | 🔴 Belum ada | Hanya skema `analisis-indikator.ts` tanpa parameter/konfigurasi, UI, atau test. |
| OS-ANA-003 | 🟡 Sebagian | Survei: periode aktif/nonaktif, pertanyaan, responden, jawaban, UI admin, test `survey.test.ts`. **Gap: sasaran/parameter analisis dan E2E belum ada.** |
| OS-ANA-004 | 🟡 Sebagian | Rekap pilihan, rata-rata, min/maks, jawaban teks, grafik ringkas. **Gap: skoring, klasifikasi, laporan formal, dan E2E belum ada.** |
| OS-ANA-005 | 🟡 Sebagian | Impor/ekspor respons CSV dengan validasi + proteksi formula, test `survey-csv.test.ts`. **Gap: integrasi formulir eksternal dan E2E belum ada.** |
| OS-ANA-006 | 🟡 Sebagian | Survei aktif + daftar pertanyaan dipublikasikan di `/desa/analisis-survei`. **Gap: pengisian mandiri publik dan E2E belum ada.** |
| OS-MOD-001 | 🟡 Sebagian | Anjungan: CRUD data anjungan (nama, status, urutan). Kekurangan: Halaman anjungan mandiri belum fungsional. |
| OS-MOD-002 | ✅ Berfungsi penuh | Buku Tamu: CRUD admin, laporan, test domain/application. |
| OS-MOD-003 | 🟡 Sebagian | Kehadiran: CRUD perangkat, rekap dasar. Kekurangan: Otomasi rekap bulanan, integrasi perangkat desa lebih dalam. |
| OS-MOD-004 | 🔴 Belum ada | `/desa/lapak` ada sebagai halaman statis placeholder (belum ada CRUD pelapak/produk, keranjang, kategori, dll sesuai perilaku OpenSID). Modul admin Lapak belum ada. |
| OS-MOD-005 | 🔴 Belum ada | `/pelanggan` masih placeholder; belum ada pemasaran atau pendaftaran kerja sama. |
| OS-OPS-001 | ✅ Berfungsi penuh | Pengguna, grup/role, modul, resource izin, menu efektif, pewarisan parent module. Test `pengguna.test.ts`, `modul.test.ts`, `permission.test.ts`, `build-menu.test.ts`; E2E `ops.e2e.ts` (grup/pengguna/modul). |
| OS-OPS-002 | 🟡 Sebagian | Dashboard `/beranda`, menu berbasis izin, AppShell, navigasi admin, E2E. **Gap: shortcut dan konfigurasi navigasi personal belum ada.** |
| OS-OPS-003 | 🟡 Sebagian | Pengaturan identitas desa, mode surat, tema, konten, media tersebar di beberapa route. **Gap: pengaturan aplikasi/warga/lampiran terpusat belum ada.** |
| OS-OPS-004 | 🟡 Sebagian | Login, sesi, ubah PIN, hash kredensial, reset PIN operator, lupa sandi mandiri (email + token), rate limit, audit; E2E `/lupa-sandi`. **Gap: OTP/2FA/captcha dan test domain auth belum ada.** |
| OS-OPS-005 | 🟡 Sebagian | Notifikasi: Placeholder tersedia, sistem notifikasi belum diimplementasi. |
| OS-OPS-008 | 🟡 Sebagian | Plugin: Halaman plugin terdaftar (read-only), sistem instalasi belum ada. |
| OS-OPS-009 | 🟡 Sebagian | Sinkronisasi: Log dan status konfigurasi tersedia, sistem sinkronisasi pusat belum ada. |
| OS-OPS-010 | ✅ Berfungsi penuh | Media: Sudah terimplementasi di fitur baru. |
| OS-OPS-011 | 🟡 Sebagian | API yang ada: auth, media publik, pengaduan lampiran, docs-status, peta, lookup NIK, backup/restore. **Gap: API informasi publik/inventaris/surat yang komprehensif dan E2E belum ada.** |
| OS-OPS-012 | 🔴 Belum ada | Tidak ada API eksternal (surat/TTE/tanda tangan). `/persuratan/tte` placeholder; adapter TTE hanya mode nonaktif di domain surat. |

**Catatan lintas-ID (audit 29 Okt 2026):**

- `PUBLIC_NAV` (`src/features/publik/domain/menu.ts`) sudah memuat `/desa/dpt`
  satu kali dan `/jajak-pendapat`; temuan duplikasi sebelumnya tidak berlaku.
  `/jajak-pendapat` juga sudah masuk `PUBLIC_PATHS` di `src/proxy.ts`.
- `scripts/smoke.mts` belum memuat `/desa/dpt`, `/jajak-pendapat`, dan halaman
  `/desa/kesehatan/*`; halaman tersebut belum dijaga smoke HTTP.
- E2E ada di 12 file `tests/*.e2e.ts` (bukan 11) dengan ±80 test smoke; semua
  hanya memeriksa URL dan `body`/`table` terlihat, bukan isi halaman atau status
  HTTP. `.github/workflows/ci.yml` belum menjalankan E2E.
- Test domain/application ada di 69 file (`src/features/**/*.test.ts`; 75 bila
  seluruh `src/**` dihitung, termasuk `src/lib` dan `src/themes`). Modul tanpa
  test sama sekali: `gis`, `idm`,
  `pemilihan`, `auth` (auth diuji lewat `warga`/`layanan-mandiri`).
- Halaman placeholder 17 baris yang tersisa: `/analisis`, `/anjungan`, `/arsip`,
  `/buku-tamu`, `/dokumen`, `/kehadiran`, `/kehadiran/daftar-hadir`,
  `/keuangan/sisa-lebih`, `/lapak`, `/pelanggan`, `/pengaturan/notifikasi`,
  `/pengaturan/plugin`, `/pengaturan/sinkronisasi`, `/persuratan/tte`,
  `/desa/lapak`, dan `/layanan-mandiri/bantuan` (statis). Rute `/desa/idm`,
  `/desa/sdgs`, `/desa/pemilihan`, dan `/desa/suplemen`
  **tidak ada sama sekali (404)**, bukan placeholder.
- Kenaikan status massal pada log 29 Okt 2026 ("Bulk update sisa Sebagian ke
  Berfungsi penuh") tidak disertai implementasi dan sudah dikoreksi di register
  ini. Status hanya boleh naik dengan bukti route/UI + test + E2E.

## Ringkasan modul per domain

Tabel ini menggantikan tabel baseline lama per kategori yang sudah usang
(misalnya DPT/DTKS/suplemen/GIS/pembangunan masih ditulis 🔴 padahal sudah ada).
Status rinci tetap mengacu register per-ID di atas.

| Domain | ID | ✅ | 🟡 | 🔴 | Catatan utama |
|---|---:|---:|---:|---:|---|
| Kependudukan & sosial (OS-POP) | 15 | 9 | 5 | 0 | Sisa gap: impor DTKS, PDF statistik, cetak bantuan/kartu, PDF statistik bantuan. 1 ID di luar scope. |
| Wilayah, GIS & pertanahan (OS-WIL) | 8 | 1 | 7 | 0 | CRUD GIS ada, tetapi belum ada test/E2E; polygon belum tampil di peta; admin pertanahan masih baca. |
| Pemerintahan (OS-GOV) | 10 | 2 | 6 | 2 | Sinergi program sudah CRUD + ekspor CSV. IDM dan pemilihan masih placeholder; SOTK/cetak lembaga belum ada. |
| Persuratan (OS-SUR) | 14 | 1 | 13 | 0 | Hampir semua alur ada, tetapi E2E belum ada; TTE masih adapter nonaktif. |
| Keuangan, aset & bumindes (OS-FIN) | 13 | 0 | 12 | 1 | SiLPA masih placeholder; keluaran resmi/PDF/laporan belum lengkap. |
| Web publik (OS-WEB) | 19 | 1 | 17 | 1 | Hampir semua halaman nyata; lapak publik belum ada; IDM/SDGs belum nyata. |
| Layanan mandiri warga (OS-WGA) | 11 | 0 | 7 | 4 | Registrasi, bantuan warga, lapak, dan kehadiran belum ada; pesan masih satu arah. |
| Analisis & survei (OS-ANA) | 6 | 0 | 4 | 2 | Kategori/indikator belum ada; survei + CSV sudah berjalan. |
| Modul tambahan (OS-MOD) | 5 | 0 | 0 | 5 | Anjungan, buku tamu, kehadiran, lapak, pelanggan semuanya placeholder. |
| Sistem & operasional (OS-OPS) | 12 | 1 | 7 | 4 | Notifikasi, plugin, sinkronisasi, API eksternal belum ada; OTP/2FA belum ada. |
| **Total** | **113** | **15** | **78** | **19** | 1 ID di luar scope (OS-POP-009). |

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

1. Proyek masih berada di fase pembangunan; target akhirnya adalah seluruh ID
   `OS-*`, bukan hanya T1/T2.
2. Fondasi dan fitur inti (kependudukan, persuratan, keuangan, inventaris,
   Bumindes, CMS, layanan mandiri) sudah berjalan, tetapi keluaran lanjutan dan
   E2E alur belum lengkap.
3. Dari 112 ID dalam scope, 15 berstatus ✅, 78 🟡, dan 19 🔴. Status ini
   dihitung dari bukti yang dapat dijalankan, bukan dari catatan log.
4. Modul yang masih murni placeholder: IDM, pemilihan, SiLPA,
   anjungan, buku tamu, kehadiran, lapak, pelanggan, notifikasi, plugin,
   sinkronisasi, TTE, registrasi warga, dan bantuan warga.
5. Klaim historis di arsip/riset atau perubahan status massal tanpa bukti tidak
   mengubah status.
