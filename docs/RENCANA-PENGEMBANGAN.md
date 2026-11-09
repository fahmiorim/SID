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
- 51 folder fitur, 154 file test unit/integrasi, 202 `page.tsx`, 78 `route.ts`, 55 berkas E2E.
- Hitung ulang 9 November 2026: 56 berkas, 192 `test()`, **142** memuat aksi UI, 50 non-interaktif. Pola hitungnya berbeda dari AST audit awal (251 test/61 interaktif), jadi angka lama tidak dibandingkan langsung.
- 8 ID berstatus ✅ historis punya E2E interaktif, 8 ID hanya smoke, 32 ID berstatus ✅ historis tanpa rujukan E2E.
- 0 impor infrastruktur di `src/app/**` dan `src/features/*/presentation/**`; route publik desa, API publik, dan sitemap juga 0.
- Tidak ada ID yang dinyatakan selesai penuh. Suite E2E dijalankan 10 November 2026 terhadap build produksi (**178/178 lulus**); `npm run build` lulus. Pengujian provider nyata dan pemeriksaan visual seluruh halaman belum dilakukan.
- **Tampilan publik (9 November 2026):** menu header dikelompokkan dari 11 tautan datar menjadi 7 menu teratas dengan dropdown; header publik dirombak menjadi bilah kontak, identitas pemerintah desa, dan navigasi berwarna yang menempel; beranda memakai hero berita utama, akses cepat, kolom berita, dan sidebar data/agenda/kontak; footer menjadi empat kolom; menu mobile bertingkat; overflow horizontal pada lebar 1024 px dihilangkan; duplikasi bagian Kontak di beranda dihapus. Bukti: `src/features/publik/domain/menu.test.ts`, `src/themes/esensi/pages/home.tsx`, `src/themes/esensi/layout.tsx`, dan pemeriksaan render 1440/1024/390 px. Status `OS-WEB-001`/`OS-WEB-016` tetap **Sebagian** karena E2E perilaku belum ada.
- **Anjungan (9 November 2026):** UUID kosong tidak lagi ditolak; schema menormalisasi string kosong menjadi `null` dan use case mengisi `randomUUID()`. Halaman publik memakai `daftarAnjunganPublik`, bukan repository langsung. Test domain/use case 7 lulus. Daftar publik hanya menampilkan `status = aktif`; browser kiosk membuat UUID sendiri di `localStorage`, mencerminkannya ke cookie `anjungan_uuid`, dan halaman menampilkan nama perangkat terdaftar. Orientasi layar memilih tata letak (potret lebih sempit). Permohonan surat tanpa akun selesai: halaman `permohonan` digerbangi perangkat + `permohonanSuratTanpaAkun`, login NIK + tanggal lahir, sesi guest token HMAC (cookie HttpOnly 30 menit), keyboard virtual, dan pengajuan berbagi `simpanPermohonanSurat` dengan warga; unit test anjungan 31 lulus. Status `OS-MOD-001` tetap **Sebagian** sampai E2E CRUD/tenant dan E2E kiosk berjalan.

### E2E perilaku (9 November 2026)

**Pembaruan 10 November 2026:** suite penuh dijalankan terhadap build produksi (`npm run build` + `npm start`, bukan `next dev`) dengan 6 worker: **56 berkas, 178 test, 178 lulus dalam 146,68 detik**. Kegagalan yang berpindah-pindah pada dev server hilang setelah pindah ke server produksi. Uji yang memilih penduduk `option` pertama diganti penduduk seed `Warga Uji E2E` agar tidak bertabrakan dengan fixture paralel. Dialog pembatalan permohonan warga (`OS-WGA-004`) menutup setelah Server Action sukses; penantian simpan tema/inventaris/bantuan/RTM/pengaduan diperbaiki agar tidak memotong request.

Suite penuh 9 November 2026 (historis): 56 berkas, 194 test, 190 lulus, 335 detik (run sebelum batch keempat; setelah batch keempat total 189 test). Empat kegagalan: satu assertion rapuh di `kelompok-laporan` (nama penduduk seed, sudah diganti bukti struktural) dan tiga kegagalan yang hanya muncul saat paralel (`keluarga`, `rtm-dpt`, `permohonan-warga`, semuanya lulus saat dijalankan sendiri). Setelah perbaikan, `kelompok-laporan` lulus 4/4.

Berkas yang ditulis ulang/diperbaiki: `penduduk` (8 test/32 aksi), `keluarga` (1/19), `rtm-dpt` (2/20), `keuangan` (5/18), `pemerintahan` (3/19), `kelompok-laporan` (3/22), `wilayah-pemerintahan` (3/14), `pembangunan-buku` (1/17), `pemilihan` (2/3), `bantuan-laporan` (3/25), `statistik-bantuan` (3/5), `ekspor-statistik` (6/0), `analisis-survei` (7/34), `survei-publik` (2/1), `gis-pertanahan` (7/30), `web-publik` (15/4), `web-berita-galeri` (3/16), `umpan-balik` (2/8), `verifikasi-berjenjang` (8/77), `pengaduan` (1/15), `inventaris-bumindes` (2/10), `tema` (1/6), `plugin` (1/2), `warga-mandiri` (1/24), `dtks-impor` (1/8), `keuangan-lanjutan` (2/21), `bantuan-warga` (1/1), `pendapat` (2/7), `idm` (3/16). Data uji dibersihkan lewat helper di `tests/support/database.ts` pada blok `finally`.

Bug produksi yang ditemukan dan diperbaiki: `optionalDigits` di `src/lib/forms.ts`; loop muat ulang pada dialog anggota rumah tangga, anggota kelompok, dan peserta bantuan (termasuk `onChanged` setelah hapus); `bidang-filter.tsx` baru; form SiLPA bersarang; agregasi `saveKeuanganNilai`; filter `status=semua` pada pembangunan; tombol cetak tema; pencarian DTKS memakai `EXISTS` agar tidak 500; impor dokumen laporan mengirim nama field yang tidak dibaca aksi dan memanggil aksi di luar transition; deteksi duplikat pendapat menelusuri `error.cause` Drizzle; halaman SDGs admin kini menghormati `?tahun=`.

Verifikasi: `prettier --check tests src` bersih, `npm run lint` 0 error (2 warning `no-console`), `npm run check` lulus, suite E2E 190/194. `npm run build` dan ulangan suite penuh setelah perbaikan terakhir belum dijalankan.

Berkas yang masih perlu ditulis ulang menjadi alur interaktif: `ops`/`ops-sistem`, `surat-konten`, `modul-tambahan`, `kesehatan`, `publik-apbdes`, `peta-publik`, `sitemap`, `api-publik`, `backup-database`, `disposisi-ekspedisi-agenda`, `email-webhook`, `surat-dinas`, `sinergi`, `lapak-keranjang`, `pelanggan-kerjasama`.

Catatan `dtks-impor`: berkas CSV dibuat dari RTM fixture di `tests/support/database.ts`; alur menguji ringkasan impor, baris hasil, metadata/anggota di dialog Kelola, perubahan status, dan impor ulang `0 formulir dibuat; 1 dilewati`.

Catatan batch keempat: plugin diuji dengan menyiapkan satu status aktif lewat `tests/support/database.ts`, lalu memastikan nonaktivasi tersimpan dan aktivasi tanpa environment menghasilkan pesan yang terlihat (`belum dapat diaktifkan: environment ...`). Pengaduan memakai nomor tiket dari DB untuk melacak; status `diproses` dan tanggapan operator diverifikasi ulang dari halaman lacak publik.

Gap verifikasi surat ditutup: `verifySuratData` memakai `validateVerification` dan menolak pembuat pada tahap persetujuan (sekdes/kades); tahap operator tetap sah karena operator menyusun konsep. Bukti: unit + E2E 8/8.

## Backlog berprioritas

### P0 — keamanan data, otorisasi, dan bug yang terbukti

| # | ID | Perilaku target | Path terdampak | Bukti yang harus ditambahkan |
|---|---|---|---|---|
| 1 | `OS-MOD-001` | Form Anjungan bisa disimpan dengan UUID kosong (generate/normalisasi ke `null`); alur kiosk publik berfungsi; konfigurasi perangkat dipakai | `src/features/anjungan/domain/anjungan.ts`, `presentation/anjungan-actions.ts`, `src/app/(public)/desa/anjungan/page.tsx`, `tests/modul-tambahan.e2e.ts` | **UUID kosong selesai 9 November 2026:** normalisasi schema + generate otomatis; test domain (4) dan use case (3) lulus. Halaman publik memakai use case. E2E buat + tampil publik ditambahkan, belum dijalankan. 9 November 2026: filter status publik, verifikasi perangkat via cookie, pembuatan UUID di browser kiosk, dan tata letak potret/lanskap selesai dengan test unit (18 test anjungan). 9 November 2026: permohonan tanpa akun (gerbang perangkat, login NIK + tanggal lahir, sesi guest token HMAC, keyboard virtual, ajukan lewat `simpanPermohonanSurat`) selesai dengan 31 test unit anjungan. Sisa: E2E ubah/aktif/nonaktif/tenant dan E2E kiosk |
| 2 | Lintas-ID (`OS-WEB-*`, `OS-WIL-*`, `OS-POP-008`, `OS-OPS-011`) | Semua route memakai use case; halaman publik tidak memanggil repository 2 impor infrastruktur di `src/app/api/pengaduan/lampiran` dan `src/app/api/penduduk/nik` | **Selesai 9 November 2026:** `(public)/desa/**`, `api/publik/**`, `sitemap.ts`, `src/app/**`, dan `src/features/*/presentation/**` 0 impor infrastruktur; route lampiran pengaduan memakai `bacaLampiranPengaduan`. Guard `lapisan-publik.test.ts` lulus. Sisa: test otorisasi/tenant per route (ditunda) |
| 3 | `OS-WGA-009`, `OS-SUR-013` | Pengiriman provider nyata atau mode nonaktif yang aman terdokumentasi | adapter notifikasi dan TTE | **Dokumentasi env selesai 9 November 2026:** `WHATSAPP_API_URL`/`WHATSAPP_TOKEN` ditambahkan ke `.env.example`; mode tanpa kredensial tercatat dilewati. Sisa: test adapter dengan server tiruan dan hasil uji dengan kredensial bila tersedia |

### P1 — E2E perilaku untuk alur inti yang masih smoke

Urutan berdasarkan risiko dan jumlah ID yang bergantung pada berkas tersebut.

| # | Berkas E2E | Kondisi sekarang | ID yang terdampak | Skenario minimum |
|---|---|---|---|---|
| 1 | `tests/penduduk.e2e.ts` | **Selesai 9 November 2026:** 8 test/32 aksi (CRUD, detail/cetak, filter, CSV, DPT, suplemen, DTKS) | `OS-POP-001`, `OS-POP-002` | Tambah → cari/filter → detail → ubah → ekspor/cetak |
| 2 | `tests/rtm-dpt.e2e.ts` | **Sebagian selesai:** 2 test/20 aksi (RTM + anggota, laporan rekap); DPT belum | `OS-POP-004`, `OS-POP-005`, `OS-POP-007` | CRUD RTM, anggota, DPT, rekap, tolak duplikat |
| 3 | `tests/keuangan.e2e.ts` | **Selesai 9 November 2026:** 5 test/18 aksi (APBDes, laporan + filter bidang, triwulan, SiLPA, rekonsiliasi) | `OS-FIN-001`–`OS-FIN-003` | Input pagu/realisasi → laporan → ekspor; nilai tersimpan dicek dari UI/DB |
| 4 | `tests/warga-mandiri.e2e.ts` | Belum: 8 test/0 aksi | `OS-WGA-001`, `OS-WGA-002`, `OS-WGA-003`, `OS-WGA-006`, `OS-WGA-007`, `OS-WGA-010`, `OS-WGA-011` | Login, kirim pesan, verifikasi surat, CRUD lapak, ajukan izin |
| 5 | `tests/pemerintahan.e2e.ts` | **Selesai 9 November 2026:** `pemerintahan` 3 test/19 aksi dan `kelompok-laporan` 3 test/22 aksi | `OS-GOV-002`–`OS-GOV-005` | CRUD perangkat/lembaga/kelompok, laporan anggota, ekspor |
| 6 | `tests/modul-tambahan.e2e.ts` | Belum: 4 test/3 aksi | `OS-MOD-001`, `OS-MOD-002`, `OS-MOD-003` | CRUD anjungan, buku tamu, rekap kehadiran |
| 7 | `tests/web-publik.e2e.ts` | **Sebagian selesai:** `web-publik` 15 test/4 aksi, `web-berita-galeri` 3/16, `umpan-balik` 2/8, `survei-publik` 2/1 | `OS-WEB-001`–`OS-WEB-019` | Beranda, berita, galeri, dokumen, statistik, kontak, umpan balik |
| 8 | `tests/kesehatan.e2e.ts` | Belum: 2 test/0 aksi | `OS-POP-008` | Input KIA/ibu hamil/pemantauan anak dan ekspor |

### P2 — gap fungsional per ID

Gap per ID yang belum tertutup tercantum pada kolom "Gap tersisa" di `STATUS-MODUL.md`. Kelompok yang paling sering muncul:

- **Keluaran belum diuji E2E:** impor peserta (`OS-POP-012`), cetak album galeri (`OS-WEB-004`). Ekspor PDF statistik, laporan bantuan, buku pembangunan, dan ekspor kelompok sudah beraksi.
- **Alur publik belum lengkap:** statistik (`OS-WEB-006`), peta (`OS-WEB-007`), pembangunan (`OS-WEB-008`), pengaduan/lacak (`OS-WEB-009`), inventaris (`OS-WEB-011`), suplemen (`OS-WEB-012`), analisis publik (`OS-WEB-013`), tema (`OS-WEB-016`, `OS-WEB-017`). Berita, galeri, dan umpan balik sudah beraksi.
- **GIS:** cetak peta dan CRUD layer (`OS-WIL-002`–`OS-WIL-008`); E2E interaktif sudah mencakup layer, pertanahan (persil/CDESA/mutasi), peta cetak, dan simbol.
- **Analisis/survei:** kategori/indikator/survei dan alur jawaban warga → rekap admin sudah beraksi (`OS-ANA-001`–`OS-ANA-006`); sisa laporan skor dan formulir eksternal.
- **Operasional:** preferensi menu, pengaturan, OTP, inbox email, cakupan audit, restore, plugin, API publik (`OS-OPS-002`–`OS-OPS-008`, `OS-OPS-011`).
- **Layanan warga:** bukti provider (`OS-WGA-009`) dan unduh dokumen kerja sama yang ditolak (`OS-MOD-005`); pembatalan permohonan (`OS-WGA-004`) sudah beraksi.
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
- `npm run lint`: 0 error, 2 warning `no-console` di `tests/umpan-balik.e2e.ts`.
- `npm run test`: 177 berkas / 1.446 test lulus.
- `npm run check` (typegen + tsc + ESLint + format + unit): lulus.
- Suite E2E penuh: 56 berkas / 178 test, **178 lulus** dalam 146,68 detik terhadap build produksi (`npm run build` + `npm start`).
- `npm run build`: lulus.

