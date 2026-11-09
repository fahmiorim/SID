# Audit Status Modul

Tanggal audit: 9 November 2026. Dokumen ini adalah **hasil audit struktur dan bukti pengujian** terhadap 111 ID katalog OpenSID yang tersimpan di [`arsip/status-sebelum-audit/`](./arsip/status-sebelum-audit/). Scope produk dan pengecualian ada di [`CAKUPAN-OPENSID.md`](./CAKUPAN-OPENSID.md); backlog perbaikan ada di [`RENCANA-PENGEMBANGAN.md`](./RENCANA-PENGEMBANGAN.md).

Covid-19 dan Vaksin Covid berada di luar scope, sehingga controller `Covid19`, `Vaksin_covid`, dan halaman `fweb/Vaksin` tidak dihitung sebagai gap. Audit ini **tidak** menyatakan ada fitur yang selesai penuh. Yang diperiksa adalah keberadaan dan keterhubungan UI/route, aksi/use case, otorisasi/tenant, keluaran, serta bukti test. Eksekusi seluruh suite E2E, pengujian provider eksternal nyata, dan pemeriksaan manual setiap halaman **belum dilakukan**.

## Metode audit

1. Mengambil 111 ID dari katalog historis dan 102 baris register per-ID. Sembilan ID tidak memiliki baris register: `OS-WGA-001`, `OS-WGA-002`, `OS-WGA-003`, `OS-WGA-006`, `OS-WGA-007`, `OS-WGA-010`, `OS-WGA-011`, `OS-MOD-001`, `OS-MOD-003`.
2. Memeriksa keberadaan path yang dirujuk register (halaman, route handler, action/use case, repository, migrasi, test) dengan pemindaian filesystem. Temuan "path hilang" pada skrip awal berasal dari pemetaan route-group dan ekstensi test, bukan path yang benar-benar tidak ada.
3. Menghitung kedalaman E2E dengan AST TypeScript: jumlah `test()`, jumlah test yang memuat aksi UI (`.fill`, `.tap`, `.click`, `.setInputFiles`, `.selectOption`, `.press`, `.check`, `.uncheck`), dan jumlah aksi. Jumlah test saja **bukan bukti perilaku**.
4. Menelusuri otorisasi dan tenant secara spot-check: halaman admin mengambil `villageId` dari sesi, halaman publik dari host; use case memanggil `requirePermission`; halaman warga memakai `requireWarga`.
5. Mengukur pelanggaran batas lapisan: impor runtime langsung ke `features/*/infrastructure` atau `@/db` dari `src/app/**` dan `src/features/*/presentation/**`.
6. Audit vertikal mendalam untuk `OS-MOD-001` Anjungan, termasuk reproduksi validasi schema; bug UUID kosong kemudian diperbaiki.

## Arti status di tabel

- **Struktur lengkap**: path UI/route, aksi/use case, RBAC/tenant, dan test unit/integrasi yang dirujuk register terverifikasi ada. Ini **bukan bukti fitur selesai**; kedalaman E2E dicatat di kolom terpisah.
- **Struktur terverifikasi**: ID tidak punya baris register, tetapi path dan test yang disebut di rencana historis terverifikasi ada pada audit ini.
- **Sebagian**: setidaknya satu unsur (operasi, keluaran, alur, otorisasi, test, atau integrasi) belum lengkap menurut register dan/atau temuan audit.
- **Bug**: ada perilaku yang dapat direproduksi sebagai kegagalan.
- **Belum diaudit**: dipakai untuk hal yang tidak diperiksa dalam audit ini — eksekusi E2E, provider eksternal nyata, dan pemeriksaan visual seluruh halaman.

## Angka inventaris (hasil hitung ulang)

| Ukuran | Jumlah | Catatan |
|---|---:|---|
| ID katalog | 111 | 111 ID unik; tidak ada duplikat |
| Baris register per-ID | 102 | 48 ✅ dan 54 🟡 menurut register historis |
| ID tanpa baris register | 9 | 7 terverifikasi struktur, 1 bug (`OS-MOD-001`; UUID diperbaiki 9 November 2026), 1 terverifikasi (`OS-MOD-003`) |
| Folder fitur `src/features` | 51 | Termasuk fitur lokal mandiri |
| File test unit/integrasi di fitur | 154 | Bukan jumlah skenario |
| Halaman `page.tsx` | 202 | Belum dikelompokkan admin/publik/warga |
| Route handler `route.ts` | 78 | Termasuk API publik/eksternal |
| Berkas E2E | 55 | `tests/**/*.e2e.ts` |
| Test E2E | 251 | Hasil AST seluruh berkas |
| Test E2E yang berinteraksi UI | 61 (24%) | Sisanya hanya memuat halaman, heading, body, atau HTTP |
| Test E2E non-interaktif | 190 (76%) | Belum membuktikan aksi pengguna |
| Aksi UI di E2E | 425 | Terpusat di sedikit berkas |
| Impor infrastruktur langsung | 31 impor infrastruktur + 2 impor `@/db` pada 33 berkas | Sisa dari `src/app/**` dan `src/features/*/presentation/**`; route `(public)/desa`, `api/publik`, dan `sitemap.ts` sudah 0 dan dijaga `lapisan-publik.test.ts` |

Angka ini adalah temuan struktur pada 9 November 2026, bukan persentase paritas dan bukan coverage. Setelah pembersihan route publik, pengukuran ulang menemukan 31 impor infrastruktur + 2 impor `@/db` pada 33 berkas; `ARCHITECTURE.md` sudah disinkronkan dengan angka ini.

## Kedalaman E2E: bukti yang benar-benar berinteraksi

Delapan ID berstatus ✅ historis memiliki E2E yang menjalankan aksi UI; beberapa ID sebagian juga memilikinya. Sisanya yang berstatus ✅ hanya memiliki smoke test atau tidak dirujuk E2E sama sekali.

| Berkas E2E | Test | Test beraksi | Aksi | ID utama |
|---|---:|---:|---:|---|
| `verifikasi-berjenjang` | 7 | 7 | 74 | `OS-SUR-007` |
| `permohonan-warga` | 5 | 5 | 42 | `OS-WGA-004`, `OS-WGA-005`, `OS-SUR-002` |
| `gis-layer` | 4 | 4 | 35 | `OS-WIL-002`–`OS-WIL-005` |
| `gis-pertanahan` | 7 | 1 | 33 | `OS-WIL-006` |
| `survei-publik` | 4 | 2 | 29 | `OS-ANA-006` |
| `surat-flow` | 6 | 5 | 23 | `OS-SUR-002` |
| `analisis-survei` | 8 | 4 | 19 | `OS-ANA-001`–`OS-ANA-006` |
| `surat-lengkap` | 4 | 4 | 18 | `OS-SUR-001`, `OS-SUR-003`, `OS-SUR-004`, `OS-SUR-006` |
| `web-berita-galeri` | 3 | 2 | 16 | `OS-WEB-002`, `OS-WEB-004` |
| `web-dokumen` | 1 | 1 | 16 | `OS-WEB-005` |
| `dokumen-publik` | 2 | 2 | 14 | `OS-GOV-010` |
| `idm` | 4 | 2 | 13 | `OS-GOV-006` |
| `lapak-keranjang` | 1 | 1 | 13 | `OS-MOD-004` |
| `arsip-nomor-surat` | 1 | 1 | 12 | `OS-SUR-006` |
| `pelanggan-kerjasama` | 1 | 1 | 12 | `OS-MOD-005` |

Contoh smoke yang sering dikutip sebagai bukti CRUD, tetapi tidak menjalankan satu pun aksi UI:

| Berkas E2E | Test | Test beraksi | Temuan |
|---|---:|---:|---|
| `rtm-dpt` | 18 | 0 | Hanya memuat halaman/heading dan memeriksa teks |
| `keuangan` | 11 | 0 | Tidak membuat/mengubah data keuangan |
| `pemerintahan` | 8 | 0 | Tidak menguji CRUD pemerintahan |
| `warga-mandiri` | 8 | 0 | Tidak menguji login, pesan, izin, atau lapak warga |
| `penduduk` | 7 | 0 | Tidak menguji CRUD/impor/ekspor penduduk |
| `modul-tambahan` | 4 | 0 | Disebut uji CRUD, tetapi hanya memeriksa heading/body |
| `kesehatan` | 2 | 0 | Tidak menguji input data kesehatan |

## Status per ID (111 ID)

Kolom **E2E** menyebut berkas yang dirujuk register beserta hasil hitung AST. "Smoke" berarti tidak ada aksi UI di berkas itu. Status pada kolom kedua adalah hasil audit struktur, bukan status penyelesaian fitur.

| ID | Hasil audit | Gap tersisa | E2E yang dirujuk |
|---|---|---|---|
| OS-POP-001 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `penduduk` 7 test/smoke |
| OS-POP-002 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `penduduk` 7 test/smoke |
| OS-POP-003 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `keluarga` 4 test/smoke |
| OS-POP-004 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `rtm-dpt` 18 test/smoke |
| OS-POP-005 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-POP-006 | Sebagian | E2E impor sukses. | `dtks-impor` 3 test/2 interaktif |
| OS-POP-007 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-POP-008 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `kesehatan` 2 test/smoke |
| OS-POP-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-POP-011 | Sebagian | E2E laporan resmi belum ada. | tidak dirujuk |
| OS-POP-012 | Sebagian | E2E impor peserta. | tidak dirujuk |
| OS-POP-013 | Sebagian | E2E ekspor PDF. | tidak dirujuk |
| OS-POP-014 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-POP-015 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WIL-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WIL-002 | Sebagian | E2E cetak peta. | tidak dirujuk |
| OS-WIL-003 | Sebagian | E2E. | tidak dirujuk |
| OS-WIL-004 | Sebagian | E2E. | tidak dirujuk |
| OS-WIL-005 | Sebagian | E2E GIS lebih luas. | tidak dirujuk |
| OS-WIL-006 | Sebagian | E2E CRUD pertanahan. | tidak dirujuk |
| OS-WIL-007 | Sebagian | E2E halaman cetak peta. | `peta-publik` 1 test/smoke |
| OS-WIL-008 | Sebagian | E2E. | tidak dirujuk |
| OS-GOV-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-GOV-002 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-GOV-003 | Sebagian | E2E bagan SOTK/cetak belum ada | tidak dirujuk |
| OS-GOV-004 | Sebagian | E2E halaman laporan/ekspor belum ada. | tidak dirujuk |
| OS-GOV-005 | Sebagian | E2E halaman laporan/ekspor belum ada. | tidak dirujuk |
| OS-GOV-006 | Sebagian | E2E ekspor laporan belum ada. | `idm` 4 test/2 interaktif |
| OS-GOV-007 | Sebagian | E2E pemilihan. | tidak dirujuk |
| OS-GOV-008 | Struktur lengkap; ada E2E interaktif | — | `sinergi` 4 test/1 interaktif |
| OS-GOV-009 | Sebagian | E2E buku pembangunan belum ada. | tidak dirujuk |
| OS-GOV-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-001 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-002 | Sebagian | E2E. | `surat-flow` 6 test/5 interaktif; `permohonan-warga` 5 test/5 interaktif |
| OS-SUR-003 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-004 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-005 | Sebagian | E2E rekap/notifikasi. | `permohonan-warga` 5 test/5 interaktif |
| OS-SUR-006 | Struktur lengkap; ada E2E interaktif | — | `arsip-nomor-surat` 1 test/1 interaktif; `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-007 | Struktur lengkap; ada E2E interaktif | — | `verifikasi-berjenjang` 7 test/7 interaktif |
| OS-SUR-008 | Sebagian | E2E cetak per varian template. | `publik-verifikasi` 2 test/1 interaktif |
| OS-SUR-009 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-011 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `surat-dinas` 1 test/smoke |
| OS-SUR-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-013 | Sebagian | verifikasi terhadap provider BSrE nyata dan E2E. | tidak dirujuk |
| OS-SUR-014 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-002 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-003 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-004 | Sebagian | E2E impor belum membuktikan hasil penyimpanan | `keuangan-lanjutan` 4 test/2 interaktif |
| OS-FIN-005 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-006 | Sebagian | E2E filter periode dan data laporan belum dibuktikan | tidak dirujuk |
| OS-FIN-007 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-008 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-009 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-011 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-013 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WEB-001 | Sebagian | E2E beranda belum ada; header/beranda/footer dirombak menjadi portal desa, menu publik 7 grup + dropdown, duplikasi Kontak dihapus. | tidak dirujuk |
| OS-WEB-002 | Sebagian | E2E belum ada. | tidak dirujuk |
| OS-WEB-003 | Sebagian | E2E profil/pemerintahan/SOTK publik belum ada | tidak dirujuk |
| OS-WEB-004 | Sebagian | E2E galeri dan cetak album belum ada | tidak dirujuk |
| OS-WEB-005 | Sebagian | E2E. | tidak dirujuk |
| OS-WEB-006 | Sebagian | E2E belum ada. | tidak dirujuk |
| OS-WEB-007 | Sebagian | E2E hanya memuat halaman; coverage layer belum diperluas. | tidak dirujuk |
| OS-WEB-008 | Sebagian | E2E. | tidak dirujuk |
| OS-WEB-009 | Sebagian | E2E alur pengaduan lengkap. | tidak dirujuk |
| OS-WEB-010 | Sebagian | E2E. | tidak dirujuk |
| OS-WEB-011 | Sebagian | E2E filter/ekspor. | tidak dirujuk |
| OS-WEB-012 | Sebagian | E2E. | tidak dirujuk |
| OS-WEB-013 | Sebagian | E2E publik/isolasi tenant. | tidak dirujuk |
| OS-WEB-014 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WEB-015 | Sebagian | E2E. | tidak dirujuk |
| OS-WEB-016 | Sebagian | E2E. | tidak dirujuk |
| OS-WEB-017 | Sebagian | E2E. | tidak dirujuk |
| OS-WEB-018 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `sitemap` 2 test/smoke |
| OS-WEB-019 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WGA-001 | Struktur terverifikasi | Registrasi mandiri `/desa/registrasi-warga`, persetujuan `/penduduk/registrasi`, captcha + OTP/email; test `captcha.test.ts`, `verifikasi-kontak.test.ts` | `warga-mandiri` 8 test/smoke |
| OS-WGA-002 | Struktur terverifikasi | Login `/masuk`, sesi warga, PIN, OTP faktor kedua, rate limit; test `warga.test.ts`, `integrasi-warga.test.ts` | `warga-mandiri` 8 test/smoke |
| OS-WGA-003 | Struktur terverifikasi | Beranda/profil/ringkasan layanan warga di `/layanan-mandiri`; test `integrasi-warga.test.ts` | `warga-mandiri` 8 test/smoke |
| OS-WGA-004 | Sebagian | E2E pembatalan permohonan oleh warga (sebelum diambil, alasan wajib). | `permohonan-warga` 5 test/5 interaktif |
| OS-WGA-005 | Struktur lengkap; ada E2E interaktif | — | `permohonan-warga` 5 test/5 interaktif |
| OS-WGA-006 | Struktur terverifikasi | Pesan dua arah `/layanan-mandiri/pesan` + `/pesan-warga`; test `pesan-warga.test.ts` | `warga-mandiri` 8 test/smoke |
| OS-WGA-007 | Struktur terverifikasi | Verifikasi surat area warga `/layanan-mandiri/verifikasi-surat`; test `verifikasi.test.ts` | `warga-mandiri` 8 test/smoke |
| OS-WGA-008 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `bantuan-warga` 1 test/smoke |
| OS-WGA-009 | Sebagian | bukti pengiriman ke provider nyata (kredensial belum tersedia) dan E2E alur lengkap. | tidak dirujuk |
| OS-WGA-010 | Struktur terverifikasi | Lapak warga `/layanan-mandiri/lapak` + katalog publik; test `lapak.test.ts` | `warga-mandiri` 8 test/smoke |
| OS-WGA-011 | Struktur terverifikasi | Kehadiran `/kehadiran`, izin warga `/layanan-mandiri/izin`, keputusan `/kehadiran/izin`; test `kehadiran.test.ts` | `warga-mandiri` 8 test/smoke |
| OS-ANA-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-ANA-002 | Sebagian | E2E. | tidak dirujuk |
| OS-ANA-003 | Sebagian | E2E. | tidak dirujuk |
| OS-ANA-004 | Sebagian | E2E. | tidak dirujuk |
| OS-ANA-005 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-ANA-006 | Sebagian | E2E. | tidak dirujuk |
| OS-MOD-001 | Sebagian | Konfigurasi admin + daftar publik ada; UUID kosong kini dinormalisasi dan diisi otomatis, dengan test domain/use case. Alur kiosk publik, pemakaian konfigurasi perangkat, dan E2E CRUD/tenant belum ada. | `modul-tambahan` 4 test/1 interaktif |
| OS-MOD-002 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-MOD-003 | Struktur terverifikasi | Rekap kehadiran `/kehadiran/rekap` + ekspor; use case memakai repository yang ada; test `kehadiran.test.ts` | tidak dirujuk |
| OS-MOD-004 | Struktur lengkap; ada E2E interaktif | — | `lapak-keranjang` 1 test/1 interaktif |
| OS-MOD-005 | Sebagian | E2E belum membuktikan unduh dokumen berhasil dan ditolak untuk akses tanpa izin/lintas desa. | `pelanggan-kerjasama` 1 test/1 interaktif |
| OS-OPS-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-OPS-002 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-003 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-004 | Sebagian | Gap: E2E aktivasi, login, dan jalur kegagalan OTP belum memadai. | tidak dirujuk |
| OS-OPS-005 | Sebagian | E2E penerimaan webhook, alur inbox/balasan dan filter kanal. | tidak dirujuk |
| OS-OPS-006 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-007 | Sebagian | Gap: E2E restore. | `backup-database` 1 test/smoke |
| OS-OPS-008 | Sebagian | Gap: E2E plugin. | tidak dirujuk |
| OS-OPS-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-OPS-011 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
Catatan tabel:

- Rekonsiliasi historis 57 ✅ / 54 🟡 **tidak diwarisi**. Register 102 baris berisi 48 ✅ dan 54 🟡; sembilan ID tanpa baris kemudian dihitung sebagai ✅ tanpa bukti per-ID. Audit ini memberi baris eksplisit untuk kesembilan ID tersebut, dan menemukan satu di antaranya bug (`OS-MOD-001`).
- `OS-MOD-001` dan `OS-MOD-003` tidak memiliki baris register; statusnya diisi dari pemeriksaan kode dan test pada audit ini.
- Kolom E2E kosong berarti register tidak merujuk berkas E2E untuk ID tersebut. Itu bukan berarti tidak ada test unit/integrasi.

## Temuan lintas modul

### 1. Batas lapisan masih bocor

Terdapat **31 impor infrastruktur + 2 impor `@/db`** dari `src/app/**` atau `src/features/*/presentation/**` pada 33 berkas. Route `src/app/(public)/desa/**`, `src/app/api/publik/**`, dan `src/app/sitemap.ts` sudah **0** dan dijaga `src/features/publik/application/lapisan-publik.test.ts`; sisa berada di admin/warga/API internal dan presentation. Ini melewati use case, sehingga otorisasi dan tenant tidak selalu ditegakkan di satu tempat.

Sebaran terbesar:

| Lokasi | Impor langsung |
|---|---:|
| `src/app/(public)/desa/**`, `src/app/api/publik/**`, `src/app/sitemap.ts` | **0** |
| `src/app/(admin)/kesehatan/**` | 4 |
| `src/app/(admin)/statistik/**` | 4 (2 `@/db`) |
| `src/features/kesehatan/presentation/**` | 4 |
| `src/app/(admin)/penduduk/**` | 3 |
| `src/app/(admin)/hubung-warga/**` | 2 |
| `src/app/(warga)/layanan-mandiri/**` | 2 |
| `src/features/penduduk/presentation/**` | 2 |
| `src/app/(admin)/keluarga`, `layout`, `pengaturan`, `permohonan-surat`, `persuratan` | 5 |
| `src/app/api/eksternal`, `api/penduduk`, `api/pengaduan` | 4 |
| `src/features/{kontak,pendapat,survey}/presentation` | 3 |

Route publik desa, API publik, dan `sitemap.ts` sudah bersih; sisa pelanggaran berada di admin/warga/API internal dan presentation. Pembatasan lapisan ini harus diselesaikan sebelum klaim otorisasi seragam dapat dibuat.

### 2. Tenant dan otorisasi

- Halaman admin yang diperiksa mengambil `villageId` dari sesi, bukan dari input klien.
- Halaman publik yang diperiksa menyelesaikan desa dari host.
- Use case pada modul yang diaudit memanggil `requirePermission`; halaman warga memakai `requireWarga`.
- Namun 31 impor infrastruktur + 2 impor `@/db` pada 33 berkas sisa berarti tidak semua route melewati use case. Route tersebut **Belum diaudit** satu per satu untuk izin dan isolasi tenant, sehingga tidak boleh dianggap aman hanya karena halaman admin lain sudah benar.

### 3. Provider eksternal

`OS-WGA-009` (WhatsApp/email) dan `OS-SUR-013` (BSrE/TTE) masih bergantung pada kredensial dan sandbox yang tidak tersedia. Test adapter dan pencatatan percobaan bukan bukti pengiriman ke provider nyata.

### 4. Cakupan E2E tidak merata

Hanya 61 dari 251 test E2E yang menjalankan aksi UI. Sebaliknya, beberapa alur berisiko tinggi sudah punya bukti interaktif: verifikasi berjenjang, permohonan warga, GIS layer/pertanahan, survei publik, dan lapak/keranjang. Klaim "sudah diuji E2E" pada ID lain perlu diperiksa terhadap kolom E2E di atas.

## Audit vertikal: Anjungan (`OS-MOD-001`)

**Kesimpulan: sebagian — konfigurasi admin dan daftar publik ada; bug UUID kosong sudah diperbaiki, tetapi alur kiosk belum dibuktikan.**

| Bagian | Bukti yang ditelusuri | Temuan |
|---|---|---|
| UI admin | `src/app/(admin)/anjungan/page.tsx`, `src/features/anjungan/presentation/components/anjungan-manager.tsx` | Daftar dan form tambah/ubah/hapus tersedia. Form memuat UUID, IP/MAC, printer, keyboard, orientasi, opsi surat tanpa akun, dan status. |
| Aksi / validasi | `src/features/anjungan/presentation/anjungan-actions.ts`, `src/features/anjungan/application/anjungan-use-cases.ts`, `src/features/anjungan/domain/anjungan.ts` | Server Action mengambil `villageId` dari sesi; use case mengecek izin dan memvalidasi Zod sebelum mutasi. |
| Penyimpanan / tenant | `src/features/anjungan/infrastructure/anjungan-repository.ts`, `src/db/schema/anjungan.ts`, `src/db/migrations/0079_add_anjungan_kiosk_fields.sql` | Repository memfilter list/update/delete menurut `villageId`; kolom konfigurasi kiosk sudah dimigrasikan. |
| Halaman publik | `src/app/(public)/desa/anjungan/page.tsx` | Desa dari host; hanya `aktif = 1` tampil. Kartu hanya nama/deskripsi — tidak ada tautan, tombol, atau tahap kiosk. Halaman memanggil repository langsung. |
| Test browser | `tests/modul-tambahan.e2e.ts` | 4 test, 0 aksi UI. Skenario admin hanya memeriksa heading; skenario publik memeriksa URL/body. Tidak ada bukti CRUD, filter aktif, atau interaksi kiosk. |
| Test unit/domain | `src/features/anjungan/` | Test schema (4) dan use case (3) ditambahkan; keduanya lulus 9 November 2026. |

**Bug yang sudah diperbaiki (9 November 2026):** `anjunganFormSchema` sebelumnya memakai `z.string().uuid().optional().nullable()`, sehingga string kosong dari form gagal dengan `UUID tidak valid.` Schema sekarang menormalisasi string kosong/spasi menjadi `null`, dan use case membuat UUID perangkat baru dengan `randomUUID()` saat field kosong. Test domain (4) dan use case (3) lulus; halaman publik juga memakai use case, bukan repository langsung. E2E admin untuk menyimpan UUID kosong dan menampilkan layanan di publik sudah ditambahkan, tetapi belum dijalankan pada sesi ini.

**Gap tersisa:** alur publik yang menjalankan layanan dan mode surat tanpa akun; pemakaian konfigurasi perangkat/printer; E2E CRUD lengkap, aktif/nonaktif, peran tanpa izin, dan tenant silang.

## Hal yang belum bisa disimpulkan

1. **Eksekusi suite E2E**: tidak dijalankan dalam audit ini karena memerlukan build produksi, server, dan seed. Hasil E2E historis tidak diverifikasi ulang.
2. **Pemeriksaan visual seluruh 202 halaman**: tidak dilakukan; status UI berasal dari pembacaan kode dan test.
3. **Provider eksternal nyata**: tidak diuji tanpa kredensial.
4. **Isolasi tenant pada 33 berkas sisa impor langsung**: belum diperiksa route per route; route publik desa/API publik/sitemap sudah 0.
5. **Persentase paritas**: tidak dihitung; jumlah ID atau test bukan ukuran paritas.

## Kesimpulan

Audit struktur selesai untuk seluruh 111 ID. Tidak ada ID yang dinyatakan selesai penuh. Delapan ID berstatus ✅ historis memiliki E2E interaktif (beberapa ID sebagian juga memilikinya) dan delapan lainnya hanya smoke; 32 ID berstatus ✅ historis tidak merujuk E2E sama sekali. Prioritas berikutnya adalah menutup kebocoran lapisan yang tersisa, melanjutkan alur kiosk Anjungan, dan menambah E2E perilaku untuk alur inti yang masih smoke. Daftar kerja berurutan ada di [`RENCANA-PENGEMBANGAN.md`](./RENCANA-PENGEMBANGAN.md).
