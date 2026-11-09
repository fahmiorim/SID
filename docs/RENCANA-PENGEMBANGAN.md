# Rencana Pengembangan

Tujuan: menuntaskan rebuild orisinal semua fitur OpenSID dalam scope pada [`CAKUPAN-OPENSID.md`](./CAKUPAN-OPENSID.md). Bukti struktur dan status per ID dicatat di [`STATUS-MODUL.md`](./STATUS-MODUL.md). Dokumen di `arsip/status-sebelum-audit/` hanya catatan sejarah, bukan backlog yang sudah diverifikasi.

audit inventaris dan audit struktur sudah selesai untuk 111 ID. Yang belum selesai adalah **perbaikan gap dan pengujian perilaku**. Setiap perbaikan harus dibuktikan dengan uji unit, uji integrasi, dan uji E2E yang relevan.

## Prinsip kerja

- Jangan menyatakan modul selesai dari nama folder, route, jumlah test, atau smoke test saja.
- Setiap fitur perlu jejak **kebutuhan OpenSID → UI/route → aksi/use case → validasi + izin/tenant → hasil yang terlihat → test perilaku**.
- ID katalog lama dipakai sebagai referensi kerja; temuan audit boleh menambah atau mengoreksi statusnya.
- Untuk setiap gap, tulis file yang menjadi bukti, perilaku yang kurang, test yang membuktikan perbaikan, dan hasil test. Jangan mengubah status keseluruhan domain bila baru satu alur selesai.
- Fitur eksternal diuji dengan adapter/test double. Status integrasi provider nyata tetap terbuka sampai dapat diverifikasi dengan kredensial.
- Terapkan `villageId` publik dari host dan admin dari sesi; jangan mempercayai input klien.

## Status audit

- 111 ID katalog, 102 baris register historis, 9 ID tanpa baris register yang kini dipetakan eksplisit.
- 52 folder fitur, 183 file test unit/integrasi, 204 `page.tsx`, 78 `route.ts`, 58 berkas E2E.
- Hitung ulang 10 November 2026: 58 berkas, **179 test**; rincian kedalaman aksi per berkas dicatat di [`STATUS-MODUL.md`](./STATUS-MODUL.md). Aksi melalui helper tidak selalu terhitung, jadi angka ini bukan coverage.
- 8 ID berstatus ✅ historis punya E2E interaktif, 8 ID hanya smoke, 32 ID berstatus ✅ historis tanpa rujukan E2E.
- 0 impor infrastruktur di `src/app/**` dan `src/features/*/presentation/**`; route publik desa, API publik, dan sitemap juga 0.
- Tidak ada ID yang dinyatakan selesai penuh. P0 selesai 10 November 2026 dengan bukti E2E Anjungan 2/2 dan uji adapter/route; suite penuh 57 berkas/180 test dijalankan terhadap build produksi, dengan satu flake berbeda pada dua run paralel yang keduanya lulus saat dijalankan sendiri. Pengujian provider nyata dan pemeriksaan visual seluruh halaman belum dilakukan.
- **Tampilan publik (9 November 2026):** menu header dikelompokkan dari 11 tautan datar menjadi 7 menu teratas dengan dropdown; header publik dirombak menjadi bilah kontak, identitas pemerintah desa, dan navigasi berwarna yang menempel; beranda memakai hero berita utama, akses cepat, kolom berita, dan sidebar data/agenda/kontak; footer menjadi empat kolom; menu mobile bertingkat; overflow horizontal pada lebar 1024 px dihilangkan; duplikasi bagian Kontak di beranda dihapus. Bukti: `src/features/publik/domain/menu.test.ts`, `src/themes/esensi/pages/home.tsx`, `src/themes/esensi/layout.tsx`, dan pemeriksaan render 1440/1024/390 px. Status `OS-WEB-001` tetap **Sebagian** karena cakupan E2E publik belum menyeluruh; `OS-WEB-016`/`OS-WEB-017` sudah punya E2E tema interaktif.
- **Aksesibilitas publik (10 November 2026):** audit halaman publik yang baru diuji menambahkan tautan "Lewati ke konten utama" + `main#konten-utama` pada tema `esensi`/`natra` (`ThemeSkipLink`), `aria-current` pada filter kategori berita, `alt=""` untuk sampul berita/galeri yang berada di dalam tautan berjudul, `aria-hidden` untuk batang progres pembangunan dan ikon dekoratif, `role="region"` + label desa pada peta Leaflet, serta `ThemePageHeader` pada halaman IDM publik agar tipografinya setara halaman publik lain. Rincian dan bukti E2E ada di [`STATUS-MODUL.md`](./STATUS-MODUL.md).
- **Aksesibilitas admin (10 November 2026):** kerangka admin mendapat tautan "Lewati ke konten utama" + `main#konten-utama` lewat komponen `SkipLink` bersama (dipakai juga tema publik), `scope="col"` sebagai default `TableHead`, `aria-label` pada tabel penduduk/surat, nama aksesibel untuk tombol ikon tabel rentang umur, `role="alert"` pada galat validasi field penduduk, teks tutup dialog berbahasa Indonesia, dan `aria-disabled` tanpa atribut `disabled` pada tautan paginasi. Bukti: test aksesibilitas admin di `tests/penduduk.e2e.ts`; rincian di [`STATUS-MODUL.md`](./STATUS-MODUL.md).
- **Anjungan (9 November 2026):** UUID kosong tidak lagi ditolak; schema menormalisasi string kosong menjadi `null` dan use case mengisi `randomUUID()`. Halaman publik memakai `daftarAnjunganPublik`, bukan repository langsung. Test domain/use case 7 lulus. Daftar publik hanya menampilkan `status = aktif`; browser kiosk membuat UUID sendiri di `localStorage`, mencerminkannya ke cookie `anjungan_uuid`, dan halaman menampilkan nama perangkat terdaftar. Orientasi layar memilih tata letak (potret lebih sempit). Permohonan surat tanpa akun selesai: halaman `permohonan` digerbangi perangkat + `permohonanSuratTanpaAkun`, login NIK + tanggal lahir, sesi guest token HMAC (cookie HttpOnly 30 menit), keyboard virtual, dan pengajuan berbagi `simpanPermohonanSurat` dengan warga; unit test anjungan 31 lulus. Status `OS-MOD-001` tetap **Sebagian** sampai E2E CRUD/tenant dan E2E kiosk berjalan.

### E2E perilaku (pembaruan 10 November 2026)

**P1 selesai 10 November 2026.** Tujuh berkas E2E dijalankan terfokus terhadap build produksi: 32 test lulus, termasuk DPT lewat UI, KIA/ibu hamil/pemantauan anak, buku tamu CRUD, peta dan statistik publik, proyek pembangunan di halaman publik, cetak album galeri, serta impor peserta bantuan. Dua bug produksi ditemukan dan diperbaiki: jam masuk/keluar buku tamu tidak pernah dikirim ke repository, dan impor peserta gagal validasi karena field kartu opsional tidak dinormalisasi. P2 mulai dari impor peserta (`OS-POP-012`) dan cetak album (`OS-WEB-004`).

**Pembaruan 10 November 2026:** suite penuh dijalankan terhadap build produksi (`npm run build` + `npm start`, bukan `next dev`) dengan 6 worker: **56 berkas, 178 test, 178 lulus dalam 146,68 detik**. Kegagalan yang berpindah-pindah pada dev server hilang setelah pindah ke server produksi. Uji yang memilih penduduk `option` pertama diganti penduduk seed `Warga Uji E2E` agar tidak bertabrakan dengan fixture paralel. Dialog pembatalan permohonan warga (`OS-WGA-004`) menutup setelah Server Action sukses; penantian simpan tema/inventaris/bantuan/RTM/pengaduan diperbaiki agar tidak memotong request.

Suite penuh 9 November 2026 (historis): 56 berkas, 194 test, 190 lulus, 335 detik (run sebelum batch keempat; setelah batch keempat total 189 test). Empat kegagalan: satu assertion rapuh di `kelompok-laporan` (nama penduduk seed, sudah diganti bukti struktural) dan tiga kegagalan yang hanya muncul saat paralel (`keluarga`, `rtm-dpt`, `permohonan-warga`, semuanya lulus saat dijalankan sendiri). Setelah perbaikan, `kelompok-laporan` lulus 4/4.

Berkas yang ditulis ulang/diperbaiki: `penduduk` (8 test/26 aksi), `keluarga` (1/19), `rtm-dpt` (2/22), `keuangan` (5/18), `pemerintahan` (3/19), `kelompok-laporan` (3/22), `wilayah-pemerintahan` (3/14), `pembangunan-buku` (1/17), `pemilihan` (2/3), `bantuan-laporan` (3/25), `statistik-bantuan` (3/5), `ekspor-statistik` (6/0), `analisis-survei` (7/34), `survei-publik` (2/1), `gis-pertanahan` (7/30), `web-publik` (15/4), `web-berita-galeri` (3/16), `umpan-balik` (2/8), `verifikasi-berjenjang` (8/77), `pengaduan` (1/17), `inventaris-bumindes` (2/10), `tema` (1/6), `plugin` (1/2), `warga-mandiri` (1/24), `dtks-impor` (1/8), `keuangan-lanjutan` (2/21), `bantuan-warga` (1/1), `pendapat` (2/7), `idm` (3/16). Data uji dibersihkan lewat helper di `tests/support/database.ts` pada blok `finally`.

Bug produksi yang ditemukan dan diperbaiki: `optionalDigits` di `src/lib/forms.ts`; loop muat ulang pada dialog anggota rumah tangga, anggota kelompok, dan peserta bantuan (termasuk `onChanged` setelah hapus); `bidang-filter.tsx` baru; form SiLPA bersarang; agregasi `saveKeuanganNilai`; filter `status=semua` pada pembangunan; tombol cetak tema; pencarian DTKS memakai `EXISTS` agar tidak 500; impor dokumen laporan mengirim nama field yang tidak dibaca aksi dan memanggil aksi di luar transition; deteksi duplikat pendapat menelusuri `error.cause` Drizzle; halaman SDGs admin kini menghormati `?tahun=`.

Verifikasi 9 November 2026 (historis): `prettier --check tests src` bersih, `npm run lint` 0 error (2 warning `no-console`), `npm run check` lulus, suite E2E 190/194. Hasil ini digantikan pembaruan 10 November 2026: suite produksi 178/178 lulus dan `npm run build` lulus.

Berkas yang masih perlu ditulis ulang menjadi alur interaktif penuh: `ops`/`ops-sistem`, `surat-konten`, `publik-apbdes`, `peta-publik`, `sitemap`, `api-publik`, `backup-database`, `disposisi-ekspedisi-agenda`, `email-webhook`, `surat-dinas`. `modul-tambahan` dan `kesehatan` sudah ditulis ulang; `sinergi`, `lapak-keranjang`, dan `pelanggan-kerjasama` sudah memiliki aksi UI.

Catatan `dtks-impor`: berkas CSV dibuat dari RTM fixture di `tests/support/database.ts`; alur menguji ringkasan impor, baris hasil, metadata/anggota di dialog Kelola, perubahan status, dan impor ulang `0 formulir dibuat; 1 dilewati`.

Catatan batch keempat: plugin diuji dengan menyiapkan satu status aktif lewat `tests/support/database.ts`, lalu memastikan nonaktivasi tersimpan dan aktivasi tanpa environment menghasilkan pesan yang terlihat (`belum dapat diaktifkan: environment ...`). Pengaduan memakai nomor tiket dari DB untuk melacak; status `diproses` dan tanggapan operator diverifikasi ulang dari halaman lacak publik.

Gap verifikasi surat ditutup: `verifySuratData` memakai `validateVerification` dan menolak pembuat pada tahap persetujuan (sekdes/kades); tahap operator tetap sah karena operator menyusun konsep. Bukti: unit + E2E 8/8.

## Backlog berprioritas

### P0 — keamanan data, otorisasi, dan bug yang terbukti

| # | ID | Perilaku target | Path terdampak | Bukti yang harus ditambahkan |
|---|---|---|---|---|
| 1 | `OS-MOD-001` | Form Anjungan bisa disimpan dengan UUID kosong (generate/normalisasi ke `null`); alur kiosk publik berfungsi; konfigurasi perangkat dipakai | `src/features/anjungan/domain/anjungan.ts`, `presentation/anjungan-actions.ts`, `src/app/(public)/desa/anjungan/page.tsx`, `tests/anjungan.e2e.ts` | **Selesai 10 November 2026.** UUID kosong dinormalisasi dan digenerate otomatis; CRUD admin, ubah aktif/nonaktif, isolasi tenant, dan penghapusan diuji lewat UI (`tests/anjungan.e2e.ts` 1 test). Kiosk diuji ujung-ke-ujung: cookie perangkat, NIK/tanggal lahir salah ditolak, login benar, pilih surat, kirim, nomor antrian, baris DB, dan perangkat tanpa izin 404 (1 test). Bug ditemukan: `?jenis` kosong dianggap `0` sehingga halaman 404 setelah login; parsing diperbaiki. Toast hapus juga diperbaiki agar tampil sebelum refresh baris. Test isolasi tenant repository lulus.
| 2 | Lintas-ID (`OS-WEB-*`, `OS-WIL-*`, `OS-POP-008`, `OS-OPS-011`) | Semua route memakai use case; halaman publik tidak memanggil repository; route sensitif punya bukti otorisasi/tenant | **Selesai 10 November 2026.** 0 impor infrastruktur di `src/app/**` dan `src/features/*/presentation/**`; guard `lapisan-publik.test.ts` lulus. Test route baru: lampiran pengaduan (401/403/404 lintas desa/traversal/200), lookup NIK (401/400/404/200/403), TTE eksternal (API key, tenant dari key, PDF, 422), dan surat eksternal (API key, tenant dari key, validasi, 404). Route NIK kini memakai `getCurrentUser` agar tanpa sesi menghasilkan 401, bukan redirect, dan memetakan `FORBIDDEN` ke 403.
| 3 | `OS-WGA-009`, `OS-SUR-013` | Pengiriman provider nyata atau mode nonaktif yang aman terdokumentasi | adapter notifikasi dan TTE | **Selesai untuk adapter/mode aman 10 November 2026.** `kirim-notifikasi.test.ts` memakai server HTTP lokal: tanpa env dilewati tanpa request, sukses mengirim method/auth/body dan mencatat bukti DB, HTTP 500 menghasilkan `sukses:false`, kegagalan insert tidak melempar. `tte-server.test.ts` menguji BSrE ke server lokal: PDF langsung, respons JSON + unduh berkas, dan mode nonaktif tidak menyentuh server. Kredensial provider nyata tetap belum tersedia; status ID provider tetap **Sebagian** sampai verifikasi nyata.

### P1 — E2E perilaku untuk alur inti yang masih smoke

Urutan berdasarkan risiko dan jumlah ID yang bergantung pada berkas tersebut.

| # | Berkas E2E | Kondisi sekarang | ID yang terdampak | Skenario minimum |
|---|---|---|---|---|
| 1 | `tests/penduduk.e2e.ts` | **Selesai 10 November 2026:** 9 test (CRUD, detail/cetak, filter, CSV, DPT aktif/filter/ekspor/rekap, suplemen, DTKS, aksesibilitas shell/tabel) | `OS-POP-001`, `OS-POP-002`, `OS-POP-005` | Tambah → cari/filter → detail → ubah → ekspor/cetak |
| 2 | `tests/rtm-dpt.e2e.ts` | **RTM selesai 9 November 2026:** 2 test/22 aksi; alur DPT ditutup di `penduduk` | `OS-POP-004`, `OS-POP-005`, `OS-POP-007` | CRUD RTM, anggota, DPT, rekap, tolak duplikat |
| 3 | `tests/keuangan.e2e.ts` | **Selesai 9 November 2026:** 5 test/18 aksi (APBDes, laporan + filter bidang, triwulan, SiLPA, rekonsiliasi) | `OS-FIN-001`–`OS-FIN-003` | Input pagu/realisasi → laporan → ekspor; nilai tersimpan dicek dari UI/DB |
| 4 | `tests/warga-mandiri.e2e.ts` | **Selesai 10 November 2026:** 1 test/24 aksi (login captcha, pesan, lapak, izin, verifikasi surat, registrasi mandiri) | `OS-WGA-001`, `OS-WGA-002`, `OS-WGA-003`, `OS-WGA-006`, `OS-WGA-007`, `OS-WGA-010`, `OS-WGA-011` | Login, kirim pesan, verifikasi surat, CRUD lapak, ajukan izin |
| 5 | `tests/pemerintahan.e2e.ts` | **Selesai 9 November 2026:** `pemerintahan` 3 test/19 aksi dan `kelompok-laporan` 3 test/22 aksi | `OS-GOV-002`–`OS-GOV-005` | CRUD perangkat/lembaga/kelompok, laporan anggota, ekspor |
| 6 | `tests/anjungan.e2e.ts` + `tests/modul-tambahan.e2e.ts` | **Selesai 10 November 2026:** anjungan 2 test CRUD/tenant/kiosk; `modul-tambahan` 2 test/1 interaktif untuk buku tamu dan rekap | `OS-MOD-001`, `OS-MOD-002`, `OS-MOD-003` | CRUD/tenant/kiosk anjungan; buku tamu; rekap kehadiran |
| 7 | `tests/web-publik.e2e.ts` | **Selesai untuk P1 10 November 2026:** `web-publik` 20 test mencakup peta + cetak, statistik, inventaris (filter + ekspor CSV), bantuan, suplemen (daftar, detail agregat, slug 404), IDM, analisis publik (rekap agregat + filter periode), serta audit aksesibilitas (tautan lewati + `main` dan `aria-current` filter berita); `web-berita-galeri` 3 test termasuk cetak album; `umpan-balik` 2/8; `survei-publik` 2/1 | `OS-WEB-001`–`OS-WEB-019` | Beranda, berita, galeri, dokumen, statistik, kontak, umpan balik |
| 8 | `tests/kesehatan.e2e.ts` | **Selesai 10 November 2026:** 2 test/1 interaktif (posyandu, KIA, ibu hamil, anak, ekspor CSV) | `OS-POP-008` | Input KIA/ibu hamil/pemantauan anak dan ekspor |

### P2 — gap fungsional per ID

Gap per ID yang belum tertutup tercantum pada kolom "Gap tersisa" di `STATUS-MODUL.md`. Kelompok yang paling sering muncul:

- **Keluaran P2 yang sudah diuji 10 November 2026:** impor peserta (`OS-POP-012`) diuji lewat CSV pada program kosong + impor ulang idempoten; cetak album galeri (`OS-WEB-004`) dibuktikan memanggil `window.print`; unduh dokumen kerja sama (`OS-MOD-005`) dibuktikan menyajikan PDF `inline` dan menolak ID tidak valid, desa lain, akun tanpa izin, serta permintaan tanpa sesi; suplemen publik (`OS-WEB-012`) dibuktikan menampilkan agregat tanpa nilai isian; laporan skor survei (`OS-ANA-004`) dibuktikan memuat responden, rata-rata, klasifikasi, dan CSV; analisis publik (`OS-WEB-013`) dibuktikan menampilkan rekap agregat tanpa identitas/isi jawaban, menyaring per tahun, dan menyembunyikan survei desa lain; verifikasi surat publik (`OS-WEB-019`) dibuktikan lewat form token/QR, token valid, dan penolakan token salah/hapus; inventaris publik (`OS-WEB-011`) dibuktikan memfilter lewat formulir dan mengekspor CSV yang sama tanpa barang desa lain. Hitungan tabel anak yang semula selalu 0 (survei, KK, suplemen, DTKS, jabatan, album) diperbaiki dengan query agregat dan daftar survei admin ikut diuji E2E. Ekspor PDF statistik, laporan bantuan, buku pembangunan, dan ekspor kelompok sudah beraksi.
- **Alur publik belum lengkap:** statistik (`OS-WEB-006`), peta (`OS-WEB-007`), pembangunan (`OS-WEB-008`), inventaris (`OS-WEB-011`), dan cakupan tema (`OS-WEB-017`). Peta, statistik, inventaris, pembangunan, berita, galeri, dokumen, pengaduan/lacak, umpan balik, suplemen (`OS-WEB-012`), analisis publik (`OS-WEB-013`), dan tema (`OS-WEB-016`) kini punya bukti interaksi; kedalaman tiap ID tetap dicatat di `STATUS-MODUL.md`.
- **GIS:** cetak peta dan CRUD layer (`OS-WIL-002`–`OS-WIL-008`); E2E interaktif sudah mencakup layer, pertanahan (persil/CDESA/mutasi), peta cetak, dan simbol.
- **Analisis/survei:** kategori/indikator/survei, alur jawaban warga → rekap admin, dan laporan skor beserta CSV-nya sudah beraksi (`OS-ANA-001`–`OS-ANA-006`); sisa jalur sukses formulir eksternal bertoken (baru penolakan tanpa token yang diuji).
- **Operasional:** preferensi menu, pengaturan, OTP, inbox email, cakupan audit, restore, dan API publik (`OS-OPS-002`–`OS-OPS-007`, `OS-OPS-011`); plugin (`OS-OPS-008`) sudah beraksi.
- **Layanan warga:** adapter provider (`OS-WGA-009`) sudah diuji dengan server lokal; bukti provider nyata masih menunggu kredensial. Unduh dokumen kerja sama (`OS-MOD-005`) kini dibuktikan E2E: PDF tersaji `inline`, ID tidak valid `400`, pelanggan desa lain `404`, akun tanpa izin `403`, dan tanpa sesi dialihkan ke `/masuk`. Pembatalan permohonan (`OS-WGA-004`) sudah beraksi.
- **Di luar katalog:** Pemeriksaan Data `/periksa` (padanan controller `Periksa` OpenSID) selesai 9 November 2026 sebagai pemeriksaan baca-saja; belum ada E2E dan menu baru aktif setelah seed ulang.

### P3 — konsistensi dokumen dan alat

- `ARCHITECTURE.md` sudah disinkronkan: 0 impor di `src/app/**`; `src/features/*/presentation/**` 0. Pertahankan angka 0 saat menyentuh berkas baru.
- Pertahankan guard `src/features/publik/application/lapisan-publik.test.ts` yang menolak impor infrastruktur baru dari route publik, dan perluas cakupannya ke admin/warga saat migrasi berjalan.
- Pertahankan `src/db/paritas-register.test.ts` sebagai pengunci frasa dokumen; tambahkan pemeriksaan bahwa setiap ID katalog punya baris di `STATUS-MODUL.md`.

## Rencana pengujian

1. **Unit/domain:** aturan validasi, transisi status, perhitungan, format, sanitasi, dan pemetaan keluaran.
2. **Aplikasi/integrasi:** aksi/use case, izin tiap peran, query repository, isolasi desa, kepemilikan lampiran, audit, dan migrasi bila relevan.
3. **Kontrak/rute:** input invalid, sesi/kunci, status error, format CSV/PDF/JSON, rate limit, dan header; uji hasil, bukan keberadaan route.
4. **E2E per modul:** satu siklus utama dari UI dengan peran yang benar (buat → ubah/status → lihat/cetak/ekspor), termasuk kasus ditolak dan tenant lain.
5. **Lintas modul/regresi:** skenario yang memakai data bersama—penduduk, surat, bantuan, keuangan, layanan warga, publikasi—dan host/tenant berbeda.
6. **Quality gate akhir:** `npm run lint`, `npm run format:check`, `npm run test`, `npm run check`, dan `npm run build`. Jalankan E2E sesuai konfigurasi proyek ketika milestone mencakup alur browser.

## Verifikasi dokumen ini

- `prettier --check .`: lulus (10 November 2026).
- `npm run lint`: 0 error (2 warning `no-console` historis di `tests/umpan-balik.e2e.ts`).
- `npm run test`: 183 berkas / 1.474 test lulus.
- `npm run check` (typegen + tsc + ESLint + format + unit): lulus.
- Suite E2E penuh: 58 berkas / 179 test terhadap build produksi (`npm run build` + `npm start`). Run terakhir 178 lulus; satu flake `surat-flow` (baris PDF hilang karena data antar-test) lulus 7/7 saat berkasnya dijalankan sendiri. Tujuh berkas P1/P2 terfokus lulus 32/32.
- `npm run build`: lulus.

