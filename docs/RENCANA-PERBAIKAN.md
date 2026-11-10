# Rencana Perbaikan — Fase dan Status Milestone

Tujuan: menutup gap rebuild orisinal OpenSID untuk 111 ID katalog, dengan bukti
perilaku yang bisa diperiksa. Dokumen ini mencatat **fase kerja dan status
milestone**. Rinciannya ada di:

- [`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md) — apa yang harus ada (scope).
- [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md) — status per ID dan gap tersisa.
- [`STATUS-MODUL.md`](./STATUS-MODUL.md) — audit struktur, kedalaman E2E, dan bukti per ID.
- [`RENCANA-PENGEMBANGAN.md`](./RENCANA-PENGEMBANGAN.md) — backlog teknis per prioritas.

`PARITAS-OPENSID.md` adalah register yang diperiksa test; dokumen arsip di
`arsip/status-sebelum-audit/` tidak dipakai untuk menentukan status.

## Definisi status milestone

| Status | Arti |
|---|---|
| Selesai | Semua ID di fase punya bukti UI/aksi + test perilaku, dan gate lulus |
| Berjalan | Sebagian ID sudah punya bukti; sisanya tercatat sebagai gap di PARITAS |
| Belum | Belum dikerjakan, atau menunggu sesuatu di luar kendali repo |
| Terblokir | Butuh kredensial/lingkungan yang tidak tersedia; adapter boleh diuji dengan test double |

Klaim "selesai" wajib menyebut halaman/action yang dipakai, ID katalog, dan test
yang benar-benar dijalankan. Keberadaan folder, route, atau smoke test bukan bukti.

## Ringkasan fase

| Fase | Isi | Status | Bukti |
|---|---|---|---|
| F0 | Inventarisasi katalog dan audit struktur 111 ID | Selesai 10 November 2026 | Tabel status per ID di `STATUS-MODUL.md`; katalog dan register aktif dijaga `src/db/paritas-register.test.ts` |
| F1 | P0: otorisasi/tenant, kebocoran lapisan, bug yang terbukti | Selesai 10 November 2026 | Anjungan (`OS-MOD-001`) CRUD/tenant/kiosk; 0 impor infrastruktur di route & presentation; adapter notifikasi/BSrE diuji dengan server lokal |
| F2 | P1: E2E perilaku alur inti | Selesai 10 November 2026 | 8 berkas P1, 32/32 test pada build produksi |
| F3 | P2: gap fungsional dan keluaran per ID | Berjalan | Keluaran utama tertutup (lihat daftar di bawah); 18 ID belum punya rujukan E2E |
| F4 | Stabilitas suite E2E | Selesai 10 November 2026 | 5 flake ditutup di akar; suite penuh 62 berkas/195 test lulus berturut-turut |
| F5 | P3: konsistensi dokumen dan guard | Selesai untuk dokumen; guard perlu diperluas | Katalog/paritas/rencana aktif, `RENCANA-PENGEMBANGAN.md` disinkronkan, guard dokumen + lapisan publik |
| F6 | Provider eksternal nyata dan pemeriksaan visual | Terblokir / Belum | `OS-WGA-009`, `OS-SUR-013` menunggu kredensial; 204 halaman belum diperiksa visual |

## F0 — Audit inventaris dan struktur

Selesai. Hasil yang dipakai sebagai dasar fase lain:

- 111 ID katalog, 52 folder fitur, 204 `page.tsx`, 78 `route.ts`, 183 berkas test unit/integrasi.
- 62 berkas E2E, 195 test di runner, 908 aksi UI literal; 109 dari 193 deklarasi test memuat aksi UI.
- 0 impor infrastruktur langsung dari `src/app/**` dan `src/features/*/presentation/**`.

## F1 — P0 keamanan, otorisasi, dan bug terbukti

Selesai 10 November 2026.

- `OS-MOD-001` Anjungan: UUID kosong dinormalisasi, CRUD admin, aktif/nonaktif, isolasi tenant, dan kiosk (NIK/tanggal lahir salah, login, pilih surat, kirim, nomor antrian, perangkat tanpa izin 404) diuji lewat UI. Dua bug ditemukan lewat E2E: `?jenis` kosong dianggap `0` sehingga 404 setelah login, dan toast hapus hilang karena revalidasi.
- Lintas-ID: route publik, API publik, dan sitemap 0 impor infrastruktur; route sensitif (lampiran pengaduan, lookup NIK, TTE eksternal, surat eksternal) punya test otorisasi/tenant.
- Adapter provider: notifikasi dan BSrE diuji dengan server HTTP lokal, termasuk mode nonaktif. Kredensial nyata tetap belum ada, jadi status ID provider tidak dinaikkan.

## F2 — P1 E2E perilaku alur inti

Selesai 10 November 2026: 8 berkas P1 dijalankan pada build produksi, 32/32 lulus,
mencakup DPT, KIA/ibu hamil/pemantauan anak, buku tamu, peta dan statistik publik,
pembangunan publik, cetak album galeri, dan impor peserta bantuan. Dua bug produksi
ditemukan: jam masuk/keluar buku tamu tidak pernah dikirim ke repository, dan impor
peserta gagal validasi karena field kartu opsional tidak dinormalisasi.

## F3 — P2 gap fungsional dan keluaran

Berjalan. Pada 10 November 2026, register mencatat: **72 ID** punya E2E interaktif,
**18 ID** belum dirujuk E2E, **12 ID** terverifikasi struktur tanpa E2E, **4 ID**
Sebagian, **2 ID** hanya smoke, **2 ID** terverifikasi + E2E, dan **1 ID** hanya
diuji jalur penolakan. Tidak ada ID yang dinyatakan selesai penuh.

Gap P2 yang masih terbuka:

1. **Persuratan:** notifikasi email perubahan status (butuh Resend) dan PDF per varian template belum diuji; `OS-SUR-014` baru membuktikan simpan/reset pengaturan lampiran, belum penolakan MIME/ukuran lewat UI.
2. **E2E belum dirujuk (18 ID):** `OS-FIN-005`, `OS-FIN-007`–`OS-FIN-013`, `OS-SUR-009`/`010`/`012`, `OS-POP-007`/`010`/`015`, `OS-OPS-001`/`010`/`012`, `OS-GOV-001`.
3. **Smoke/hanya penolakan:** `OS-POP-013` dan `OS-MOD-002` (smoke), `OS-ANA-005` (jalur sukses bertoken belum diuji).
4. **Sebagian:** `OS-GOV-007`, `OS-SUR-002`, `OS-SUR-013`, `OS-WGA-009`; rincian gap per ID ada di [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).
5. **Anjungan:** konfigurasi printer/IP belum dipakai di alur cetak; verifikasi visual varian orientasi belum dilakukan.

## F4 — Stabilitas suite E2E

Selesai 10 November 2026. Lima flake ditutup di akarnya, tanpa jeda tambahan:
dialog DPT tidak lagi memuat ulang halaman, locator PDF mengikuti menu `Aksi surat …`,
test beranda tidak merebut `heroJudul` global, test peta menunggu geometri Leaflet,
dan toast pembangunan tidak lagi ambigu. Pemuatan ulang penuh terakhir di aplikasi
(Reset pengaturan lampiran) diganti `router.refresh()` dan dijaga
`tests/pengaturan-lampiran.e2e.ts`. Suite penuh pada build produksi: 62 berkas/195 test lulus.

## F5 — Konsistensi dokumen dan guard

Selesai untuk dokumen aktif: katalog, paritas, dan rencana perbaikan tersedia;
`STATUS-MODUL.md` dan `RENCANA-PENGEMBANGAN.md` memakai angka inventaris terbaru;
`src/db/paritas-register.test.ts` memastikan setiap ID katalog punya baris di
PARITAS dan STATUS-MODUL.

Sisa F5: perluas guard lapisan (`lapisan-publik.test.ts`) ke route admin/warga
saat migrasi berjalan, dan jaga agar angka 0 impor infrastruktur tidak naik.

## F6 — Provider nyata dan pemeriksaan visual

Belum/terblokir. Yang dibutuhkan:

- Kredensial WhatsApp/email (`OS-WGA-009`) dan BSrE/TTE (`OS-SUR-013`) untuk membuktikan pengiriman nyata, bukan hanya adapter.
- Pemeriksaan visual seluruh halaman (204 `page.tsx`) pada lebar desktop dan seluler; status UI saat ini berasal dari pembacaan kode dan test.

## Urutan kerja berikutnya

1. Tutup 18 ID tanpa rujukan E2E, dimulai dari yang berisiko tinggi: persuratan (`OS-SUR-009`/`010`/`012`) dan keuangan (`OS-FIN-005`, `OS-FIN-007`–`013`).
2. Lengkapi jalur sukses `OS-ANA-005` dan keluaran yang belum diuji (PDF per varian, notifikasi email).
3. Tutup gap Sebagian sebelum menambah fitur baru.
4. Setelah kredensial tersedia, jalankan verifikasi provider nyata lalu naikkan status ID terkait.
5. Jalankan gate (`npm run lint`, `npm run format:check`, `npm run test`, `npm run check`, `npm run build`) dan suite E2E pada build produksi sebelum setiap commit.

## Aturan pembaruan

- Setiap perubahan fitur memetakan ID `OS-*` dan memperbarui `PARITAS-OPENSID.md` serta baris terkait di `STATUS-MODUL.md` pada commit yang sama.
- Menutup satu alur tidak menaikkan status domain secara keseluruhan.
- Status "Selesai" hanya untuk fase yang seluruh ID-nya punya bukti perilaku dan gate lulus.
