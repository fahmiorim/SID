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
- 251 test E2E; hanya **61** yang menjalankan aksi UI, 190 hanya smoke/URL/heading/body.
- 8 ID berstatus ✅ historis punya E2E interaktif, 8 ID hanya smoke, 32 ID berstatus ✅ historis tanpa rujukan E2E.
- 2 impor infrastruktur di `src/app/**` tersisa (disengaja/ditunda, lihat ARCHITECTURE.md); `src/features/*/presentation/**` sudah 0. Route publik desa, API publik, dan sitemap sudah 0.
- Tidak ada ID yang dinyatakan selesai penuh. Eksekusi suite E2E, pengujian provider, dan pemeriksaan visual seluruh halaman belum dilakukan.
- **Tampilan publik (9 November 2026):** menu header dikelompokkan dari 11 tautan datar menjadi 7 menu teratas dengan dropdown; header publik dirombak menjadi bilah kontak, identitas pemerintah desa, dan navigasi berwarna yang menempel; beranda memakai hero berita utama, akses cepat, kolom berita, dan sidebar data/agenda/kontak; footer menjadi empat kolom; menu mobile bertingkat; overflow horizontal pada lebar 1024 px dihilangkan; duplikasi bagian Kontak di beranda dihapus. Bukti: `src/features/publik/domain/menu.test.ts`, `src/themes/esensi/pages/home.tsx`, `src/themes/esensi/layout.tsx`, dan pemeriksaan render 1440/1024/390 px. Status `OS-WEB-001`/`OS-WEB-016` tetap **Sebagian** karena E2E perilaku belum ada.
- **Anjungan (9 November 2026):** UUID kosong tidak lagi ditolak; schema menormalisasi string kosong menjadi `null` dan use case mengisi `randomUUID()`. Halaman publik memakai `daftarAnjunganPublik`, bukan repository langsung. Test domain/use case 7 lulus. Status `OS-MOD-001` tetap **Sebagian** sampai alur kiosk, konfigurasi perangkat, dan E2E CRUD/tenant selesai.

## Backlog berprioritas

### P0 — keamanan data, otorisasi, dan bug yang terbukti

| # | ID | Perilaku target | Path terdampak | Bukti yang harus ditambahkan |
|---|---|---|---|---|
| 1 | `OS-MOD-001` | Form Anjungan bisa disimpan dengan UUID kosong (generate/normalisasi ke `null`); alur kiosk publik berfungsi; konfigurasi perangkat dipakai | `src/features/anjungan/domain/anjungan.ts`, `presentation/anjungan-actions.ts`, `src/app/(public)/desa/anjungan/page.tsx`, `tests/modul-tambahan.e2e.ts` | **UUID kosong selesai 9 November 2026:** normalisasi schema + generate otomatis; test domain (4) dan use case (3) lulus. Halaman publik memakai use case. E2E buat + tampil publik ditambahkan, belum dijalankan. Sisa: E2E ubah/aktif/nonaktif/tenant dan alur kiosk |
| 2 | Lintas-ID (`OS-WEB-*`, `OS-WIL-*`, `OS-POP-008`, `OS-OPS-011`) | Semua route memakai use case; halaman publik tidak memanggil repository 2 impor infrastruktur di `src/app/api/pengaduan/lampiran` dan `src/app/api/penduduk/nik` | **Route publik selesai 9 November 2026:** `(public)/desa/**`, `api/publik/**`, dan `sitemap.ts` 0 impor; guard `lapisan-publik.test.ts` lulus. `src/features/*/presentation/**` 0. Sisa: 2 route API di atas; test otorisasi/tenant per route belum ada |
| 3 | `OS-WGA-009`, `OS-SUR-013` | Pengiriman provider nyata atau mode nonaktif yang aman terdokumentasi | adapter notifikasi dan TTE | **Dokumentasi env selesai 9 November 2026:** `WHATSAPP_API_URL`/`WHATSAPP_TOKEN` ditambahkan ke `.env.example`; mode tanpa kredensial tercatat dilewati. Sisa: test adapter dengan server tiruan dan hasil uji dengan kredensial bila tersedia |

### P1 — E2E perilaku untuk alur inti yang masih smoke

Urutan berdasarkan risiko dan jumlah ID yang bergantung pada berkas tersebut.

| # | Berkas E2E | Kondisi sekarang | ID yang terdampak | Skenario minimum |
|---|---|---|---|---|
| 1 | `tests/penduduk.e2e.ts` | 7 test, 0 aksi | `OS-POP-001`, `OS-POP-002` | Tambah → cari/filter → detail → ubah → ekspor/cetak |
| 2 | `tests/rtm-dpt.e2e.ts` | 18 test, 0 aksi | `OS-POP-004`, `OS-POP-005`, `OS-POP-007` | CRUD RTM, anggota, DPT, rekap, tolak duplikat |
| 3 | `tests/keuangan.e2e.ts` | 11 test, 0 aksi | `OS-FIN-001`–`OS-FIN-003` | Input pagu/realisasi → laporan → ekspor; nilai tersimpan dicek dari UI/DB |
| 4 | `tests/warga-mandiri.e2e.ts` | 8 test, 0 aksi | `OS-WGA-001`, `OS-WGA-002`, `OS-WGA-003`, `OS-WGA-006`, `OS-WGA-007`, `OS-WGA-010`, `OS-WGA-011` | Login, kirim pesan, verifikasi surat, CRUD lapak, ajukan izin |
| 5 | `tests/pemerintahan.e2e.ts` | 8 test, 0 aksi | `OS-GOV-002`–`OS-GOV-005` | CRUD perangkat/lembaga/kelompok, laporan anggota, ekspor |
| 6 | `tests/modul-tambahan.e2e.ts` | 4 test, 1 aksi | `OS-MOD-001`, `OS-MOD-002`, `OS-MOD-003` | CRUD anjungan, buku tamu, rekap kehadiran |
| 7 | `tests/web-publik.e2e.ts` | 30 test, 4 aksi | `OS-WEB-001`–`OS-WEB-019` | Beranda, berita, galeri, dokumen, statistik, kontak, umpan balik |
| 8 | `tests/kesehatan.e2e.ts` | 2 test, 0 aksi | `OS-POP-008` | Input KIA/ibu hamil/pemantauan anak dan ekspor |

### P2 — gap fungsional per ID

Gap per ID yang belum tertutup tercantum pada kolom "Gap tersisa" di `STATUS-MODUL.md`. Kelompok yang paling sering muncul:

- **Keluaran belum diuji E2E:** ekspor PDF statistik (`OS-POP-010`, `OS-POP-013`), laporan resmi bantuan (`OS-POP-011`), impor DTKS/peserta (`OS-POP-006`, `OS-POP-012`), buku pembangunan (`OS-GOV-009`), laporan IDM (`OS-GOV-006`), ekspor kelompok (`OS-GOV-004`, `OS-GOV-005`).
- **Alur publik belum lengkap:** beranda/berita/galeri (`OS-WEB-001`, `OS-WEB-002`, `OS-WEB-004`), statistik (`OS-WEB-006`), peta (`OS-WEB-007`), pembangunan (`OS-WEB-008`), pengaduan (`OS-WEB-009`), inventaris (`OS-WEB-011`), suplemen (`OS-WEB-012`), analisis publik (`OS-WEB-013`), umpan balik (`OS-WEB-015`), tema (`OS-WEB-016`, `OS-WEB-017`).
- **GIS:** cetak peta dan CRUD layer (`OS-WIL-002`–`OS-WIL-008`); E2E interaktif baru mencakup layer dan sebagian pertanahan.
- **Analisis/survei:** E2E untuk indikator, sasaran, laporan skor, formulir eksternal (`OS-ANA-002`–`OS-ANA-006`).
- **Operasional:** preferensi menu, pengaturan, OTP, inbox email, cakupan audit, restore, plugin, API publik (`OS-OPS-002`–`OS-OPS-008`, `OS-OPS-011`).
- **Layanan warga:** pembatalan permohonan (`OS-WGA-004`), bukti provider (`OS-WGA-009`), unduh dokumen kerja sama yang ditolak (`OS-MOD-005`).

### P3 — konsistensi dokumen dan alat

- `ARCHITECTURE.md` sudah disinkronkan: 2 impor di `src/app/**`; `src/features/*/presentation/**` 0. Pertahankan angka ini saat menyentuh berkas sisa.
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

- `npm run typecheck` dan ESLint pada berkas Anjungan serta layer publik yang diubah: lulus.
- `npm run test`: **172 file / 1.414 test** pada 9 November 2026 — **1.381 lulus, 33 dilewati, 1 suite gagal** (`verifikasi-restore.integration.test.ts`) karena MySQL lokal tidak tersedia. Test Anjungan 7/7 lulus; guard layer publik dan 2 route API publik 4/4 lulus; termasuk `src/db/paritas-register.test.ts` (4/4) dan `src/features/publik/domain/menu.test.ts` (4/4).
- Prettier `--check` pada `docs/STATUS-MODUL.md`, `docs/RENCANA-PENGEMBANGAN.md`, dan `docs/README.md`: lulus.
- `npm run lint` penuh, `npm run check`, `npm run build`, dan suite E2E **belum** dijalankan; E2E terarah tidak dapat start karena MySQL lokal tidak tersedia.

## Kriteria tutup milestone

1. Setiap ID punya baris status dengan bukti UI, aksi, izin/tenant, keluaran, dan test.
2. Tidak ada impor infrastruktur langsung dari halaman publik/admin.
3. Alur inti tiap modul punya E2E yang benar-benar berinteraksi, bukan smoke.
4. Provider eksternal diuji dengan kredensial atau mode nonaktif terdokumentasi.
5. Seluruh quality gate dan E2E lulus, atau kegagalannya dicatat dengan penyebab.
