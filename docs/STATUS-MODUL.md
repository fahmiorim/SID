# Audit Status Modul

Tanggal audit struktur: 9 November 2026; pembaruan verifikasi: 10 November 2026. Dokumen ini adalah **hasil audit struktur dan bukti pengujian** terhadap 111 ID katalog OpenSID yang tersimpan di [`arsip/status-sebelum-audit/`](./arsip/status-sebelum-audit/). Scope produk dan pengecualian ada di [`CAKUPAN-OPENSID.md`](./CAKUPAN-OPENSID.md); backlog perbaikan ada di [`RENCANA-PENGEMBANGAN.md`](./RENCANA-PENGEMBANGAN.md).

Covid-19 dan Vaksin Covid berada di luar scope, sehingga controller `Covid19`, `Vaksin_covid`, dan halaman `fweb/Vaksin` tidak dihitung sebagai gap. Audit ini **tidak** menyatakan ada fitur yang selesai penuh. Yang diperiksa adalah keberadaan dan keterhubungan UI/route, aksi/use case, otorisasi/tenant, keluaran, serta bukti test. Pengujian provider eksternal nyata dan pemeriksaan manual setiap halaman **belum dilakukan**. Suite E2E sudah dijalankan pada 9 November 2026 dan 10 November 2026; hasil terbaru dicatat di bagian [Pembaruan 10 November 2026](#pembaruan-10-november-2026--p0-dan-suite-e2e-build-produksi).

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
| Folder fitur `src/features` | 52 | Termasuk fitur lokal mandiri |
| File test unit/integrasi di fitur | 183 | Bukan jumlah skenario |
| Halaman `page.tsx` | 204 | Belum dikelompokkan admin/publik/warga |
| Route handler `route.ts` | 78 | Termasuk API publik/eksternal |
| Berkas E2E | 58 | `tests/**/*.e2e.ts` |
| Test E2E | 179 | Runner menjalankan **179 test**; rincian aksi per berkas ada di tabel kedalaman E2E |
| Test E2E yang berinteraksi UI | 89 (50%) | Memuat minimal satu aksi UI literal (`.fill`, `.tap`, `.click`, `.selectOption`, dst.); aksi lewat helper tidak selalu terhitung |
| Test E2E non-interaktif | 89 (50%) | Belum membuktikan aksi pengguna secara langsung |
| Aksi UI literal di E2E | 706 | Bukan coverage dan bukan bukti paritas |
| Impor infrastruktur langsung | 0 impor di `src/app/**`; `src/features/*/presentation/**` 0 | Route lampiran pengaduan memakai `bacaLampiranPengaduan` (validasi jalur ada di use case); `api/penduduk/nik` memakai use case penduduk |

Angka inventaris di atas dihitung ulang 10 November 2026, bukan persentase paritas dan bukan coverage. Hitungan E2E memakai deklarasi `test(` di awal baris; runner melaporkan 180 test karena beberapa berkas memperluas test/fixture. Hitungan aksi hanya mencakup pemanggilan literal, sehingga aksi melalui helper bisa tidak terhitung. Pengukuran ulang setelah pemindahan ke use case menemukan 0 impor di `src/app/**` dan 0 di `src/features/*/presentation/**`; `ARCHITECTURE.md` sudah disinkronkan dengan angka ini.

## Kedalaman E2E: bukti yang benar-benar berinteraksi

Delapan ID berstatus ✅ historis memiliki E2E yang menjalankan aksi UI; beberapa ID sebagian juga memilikinya. Sisanya yang berstatus ✅ hanya memiliki smoke test atau tidak dirujuk E2E sama sekali.

| Berkas E2E | Test | Test beraksi | Aksi | ID utama |
|---|---:|---:|---:|---|
| `verifikasi-berjenjang` | 8 | 8 | 77 | `OS-SUR-007` |
| `permohonan-warga` | 5 | 5 | 41 | `OS-WGA-004`, `OS-WGA-005`, `OS-SUR-002` |
| `gis-layer` | 4 | 4 | 35 | `OS-WIL-002`–`OS-WIL-005` |
| `gis-pertanahan` | 7 | 1 | 30 | `OS-WIL-006` |
| `survei-publik` | 2 | 1 | 1 | `OS-ANA-006` |
| `surat-flow` | 6 | 5 | 23 | `OS-SUR-002` |
| `analisis-survei` | 7 | 4 | 34 | `OS-ANA-001`–`OS-ANA-006` |
| `surat-lengkap` | 4 | 4 | 18 | `OS-SUR-001`, `OS-SUR-003`, `OS-SUR-004`, `OS-SUR-006` |
| `web-berita-galeri` | 3 | 2 | 16 | `OS-WEB-002`, `OS-WEB-004` |
| `web-dokumen` | 1 | 1 | 16 | `OS-WEB-005` |
| `dokumen-publik` | 2 | 2 | 14 | `OS-GOV-010` |
| `idm` | 3 | 2 | 16 | `OS-GOV-006` |
| `pendapat` | 2 | 2 | 7 | `OS-POP-014` |
| `lapak-keranjang` | 1 | 1 | 13 | `OS-MOD-004` |
| `arsip-nomor-surat` | 1 | 1 | 12 | `OS-SUR-006` |
| `pelanggan-kerjasama` | 3 | 1 | 12 | `OS-MOD-005` |
| `publik-verifikasi` | 3 | 2 | 11 | `OS-SUR-008`, `OS-WEB-019` |

Contoh berkas yang masih perlu diperluas (10 November 2026):

| Berkas E2E | Test | Test beraksi | Temuan |
|---|---:|---:|---|
| `modul-tambahan` | 2 | 1 | Buku tamu CRUD lewat UI (termasuk jam masuk/keluar); rekap kehadiran dicek sebagai smoke |
| `kesehatan` | 2 | 1 | Posyandu → KIA → ibu hamil → pemantauan anak lewat dialog, lalu ekspor CSV; satu test publik |

## Pembaruan 10 November 2026 — P0 dan suite E2E build produksi

**P0 selesai 10 November 2026.** Anjungan (`OS-MOD-001`) sekarang memiliki E2E CRUD admin, ubah aktif/nonaktif, isolasi tenant, hapus, serta alur kiosk lengkap (verifikasi NIK/tanggal lahir salah, login benar, pilih surat, kirim, nomor antrian, baris DB, perangkat tanpa izin 404). Dua bug ditemukan lewat E2E: `?jenis` kosong dianggap `0` sehingga halaman 404 setelah login, dan toast hapus hilang karena revalidasi melepas komponen; keduanya diperbaiki. Uji integrasi repository menambah bukti update/delete lintas desa. Adapter notifikasi dan BSrE diuji dengan server HTTP lokal (sukses, HTTP gagal, respons JSON, mode nonaktif), dan route lampiran pengaduan, lookup NIK, TTE eksternal, serta surat eksternal mendapat test otorisasi/tenant. Kredensial provider nyata tetap belum tersedia.

Suite penuh dijalankan terhadap build produksi (`npm run build` + `npm start`, bukan `next dev`): **58 berkas, 179 test**. Run terakhir menghasilkan **178 lulus**; satu flake `surat-flow` (baris PDF hilang karena data antar-test) lulus **7/7** saat berkasnya dijalankan sendiri. Test P0 Anjungan lulus **2/2**. Kegagalan yang semula berpindah-pindah pada dev server hilang setelah pindah ke server produksi. Uji yang memilih `option` penduduk pertama diganti penduduk seed `Warga Uji E2E` agar tidak bertabrakan dengan fixture paralel yang dibersihkan. Dialog pembatalan permohonan warga (`OS-WGA-004`) kini menutup setelah Server Action sukses, dan penantian simpan pada tema, inventaris, bantuan, RTM, serta pengaduan tidak lagi memotong request.

## Pembaruan 10 November 2026 — P1 dan P2

**P1 selesai 10 November 2026.** Tujuh berkas E2E terfokus dijalankan terhadap build produksi: **32/32 test lulus**. Bukti perilaku: DPT membuat pemilihan aktif, menolak pemilihan aktif kedua, memfilter pemilih, mengekspor CSV, dan membuka rekap (`OS-POP-005`); kesehatan membuat posyandu, KIA, ibu hamil, pemantauan anak, lalu mengekspor CSV (`OS-POP-008`); buku tamu menambah/mengubah/menghapus dengan jam masuk tersimpan (`OS-MOD-002`); peta, statistik, inventaris, dan pembangunan dibaca di halaman publik; berita tampil dan dicari; galeri menampilkan album.

**P2 mulai 10 November 2026.** Impor peserta bantuan (`OS-POP-012`) diuji dari program kosong: tombol Impor tersedia, CSV menautkan NIK, baris peserta muncul, dan impor ulang menghasilkan `0 peserta ditambahkan; 1 sudah terdaftar`. Cetak album galeri (`OS-WEB-004`) dibuktikan memanggil `window.print`. Test tidak menambah assertion palsu; data dibersihkan di `finally`.

Bug produksi yang diperbaiki: (1) form pemilihan DPT memakai `value` tanpa `onChange` sehingga tidak bisa diisi, kini `defaultValue` + `key`; (2) jam masuk/keluar buku tamu dibaca dari form tetapi tidak pernah diteruskan ke repository, dan tampilan kini dinormalisasi `HH:MM`; (3) dialog buku tamu memiliki form bersarang dan tombol hapus mengirim objek, kini satu form + aksi menerima `id`; (4) impor peserta melewatkan field kartu opsional sehingga `pesertaFormSchema.parse` melempar ZodError, kini field kosong dinormalisasi sebelum dilengkapi dari data master; (5) tombol Impor peserta kini tetap tersedia saat program belum punya peserta.

Test baru/diperluas: `tests/bantuan-impor-peserta.e2e.ts` (1 test), `tests/kesehatan.e2e.ts` (2/1), `tests/modul-tambahan.e2e.ts` (2/1), `tests/penduduk.e2e.ts` (DPT), `tests/web-publik.e2e.ts` (peta/statistik/inventaris), `tests/web-berita-galeri.e2e.ts` (status berita + cetak album), dan `tests/pembangunan-buku.e2e.ts` (proyek tampil publik).

Quality gate 10 November 2026: `npm run lint` 0 error (2 warning `no-console`), `npm run format:check` lulus, `npm run test` 183 berkas/1.474 test lulus, `npm run check` lulus, dan `npm run build` lulus.

**P2 — `OS-MOD-005` ditutup 10 November 2026.** Gap "E2E belum membuktikan unduh dokumen berhasil dan ditolak untuk akses tanpa izin/lintas desa" diselesaikan dengan tiga test di `tests/pelanggan-kerjasama.e2e.ts`: (1) tautan "Lihat dokumen" mengembalikan `200` dengan `Content-Type` PDF, `Content-Disposition: inline`, magic `%PDF-`, dan ukuran > 0; (2) `/pelanggan/abc/dokumen` → `400`, ID pelanggan milik desa lain → `404`, ID yang tidak ada → `404`; (3) sesi warga tanpa izin `pelanggan` → `403` tanpa menyajikan berkas, dan permintaan tanpa cookie sesi dialihkan ke `/masuk?next=`. Fixture desa lain dibuat dan dibersihkan lewat `tests/support/database.ts`, sehingga tidak ada baris yatim setelah test. Verifikasi: E2E berkas ini 5/5 lulus (3 test + 2 setup sesi) terhadap build produksi, `npm run build` lulus, `npm run lint` 0 error, `tsc --noEmit` lulus, dan Prettier bersih.

**P2 — `OS-WEB-012` dan `OS-ANA-002`/`OS-ANA-003`/`OS-ANA-004` ditutup 10 November 2026.** Suplemen publik kini punya bukti E2E tersendiri di `web-publik` (18 test): fixture suplemen bersasaran keluarga dengan satu data terhimpun tampil di `/desa/suplemen` sebagai "Sasaran: Keluarga (KK) · 1 data"; halaman detail menampilkan "1 data terhimpun", daftar "Kolom data" berisi nama kolom, sedangkan nilai isian tidak muncul; setelah fixture dihapus, slug lamanya 404. Untuk analisis, `analisis-survei` (7 test) kini dirujuk eksplisit: indikator dengan kode/nama/bobot lalu dihapus (`OS-ANA-002`), survei dengan sasaran + periode dan status `Aktif` (`OS-ANA-003`), serta laporan skor formal yang menampilkan responden, rata-rata skor, distribusi klasifikasi, dan skor per responden beserta CSV-nya (`OS-ANA-004`). Baris `OS-ANA-005` hanya dikoreksi: endpoint token sudah diuji menolak tanpa token, tetapi jalur sukses bertoken tetap belum diuji E2E. Verifikasi: E2E build produksi `web-publik` 18/18 + `analisis-survei` 7/7 (26/26 termasuk setup sesi), `npm run build` lulus, `tsc --noEmit` lulus, Prettier bersih.

**P2 — `OS-WEB-013` ditutup 10 November 2026.** Test baru di `web-publik` (19 test) membuat survei aktif dengan tiga pertanyaan (pilihan, angka, teks) dan dua responden, lalu membuktikan halaman `/desa/analisis-survei` menampilkan "3 pertanyaan", "2 responden", distribusi "2 (100%)", rata-rata "5 dari 2 jawaban", dan "2 jawaban (isi tidak dipublikasikan)" tanpa memuat nama/NIK responden maupun isi jawaban teks. Filter "Periode hasil" menyaring rekap ke tahun berjalan dan menyediakan tautan "Hapus filter"; survei desa lain tidak muncul di daftar dan halaman `/isi`-nya 404. Test ini juga menemukan bug nyata: subquery berkorelasi `listSurveiPublik()` dirender Drizzle dengan nama kolom tanpa kualifikasi sehingga `id` di subquery menunjuk `survey_soal.id`, dan hitungan soal/responden selalu tampil 0; hitungan kini diambil lewat query agregat terpisah. Verifikasi: `web-publik` 19/19 + setup sesi (20/20) pada build produksi, `npm run build` lulus, `tsc --noEmit` lulus, `npm run lint` 0 error, Prettier bersih.

**P2 — `OS-WEB-019` ditutup 10 November 2026.** `publik-verifikasi` (3 test) kini juga menguji jalur form token yang dipakai pemindai kode QR: `/desa/verifikasi-surat` menampilkan isian "Token verifikasi", token berformat salah dialihkan ke `/desa/verifikasi-surat/token-tidak-valid` dan berakhir di "Surat Tidak Ditemukan", sedangkan token 64 hex milik desa ini menampilkan nomor surat dan status "Siap Diambil" tanpa sesi. Setelah surat fixture dihapus, tokennya kembali "Surat Tidak Ditemukan". Verifikasi: `publik-verifikasi` 3/3 pada build produksi, `tsc --noEmit` lulus, `npm run lint` 0 error, Prettier bersih.

**P2 — `OS-WEB-011` ditutup 10 November 2026.** Test baru di `web-publik` (20 test) membuat satu barang inventaris bersasaran kategori unik di desa sendiri dan satu barang pada desa fixture lain. Halaman `/desa/inventaris` menampilkan barang sendiri, tidak menampilkan barang desa lain, lalu filter "Cari barang" + "Terapkan" menghasilkan "1 barang cocok dengan filter."; unduhan `/desa/inventaris/ekspor?q=...` mengembalikan `200` `text/csv` dengan `Content-Disposition` berkas `inventaris-*.csv`, memuat judul kolom "Nama Barang" dan barang yang difilter, tanpa barang desa lain. Verifikasi: `web-publik` 20/20 + setup sesi pada build produksi, `tsc --noEmit` lulus, `npm run lint` 0 error, Prettier bersih.

**Perbaikan hitungan tabel anak 10 November 2026.** Test `OS-WEB-013` menemukan pola subquery berkorelasi yang dirender Drizzle tanpa kualifikasi tabel (`where \`survey_id\` = \`id\``), sehingga `id` menunjuk tabel dalam dan hitungan selalu 0. Pola yang sama diperbaiki di daftar survei admin (soal/responden per survei, jawaban per responden), anggota per KK, terdata per suplemen, anggota per DTKS, perangkat per jabatan, foto per album admin, dan foto aktif per album publik — semuanya kini memakai query agregat `GROUP BY` yang dibatasi id induk. Daftar survei admin dibuktikan E2E: setelah satu pertanyaan dibuat baris menampilkan 1 soal dan 0 responden, dan setelah warga mengisi menjadi 1 soal dan 1 responden.

## Pembaruan 10 November 2026 — audit tampilan & aksesibilitas publik

Audit halaman publik yang baru diuji (beranda, berita, galeri, dokumen, peta, pembangunan, pengaduan, statistik, inventaris, bantuan, suplemen, IDM/SDGs, survei, kontak) menemukan delapan masalah dan memperbaikinya tanpa mengubah desain:

1. Tidak ada jalan pintas melewati header/navigasi — `ThemeSkipLink` (`src/themes/ui.tsx`) dipasang di tema `esensi` dan `natra`, dengan `main#konten-utama` + `tabIndex={-1}` sebagai sasaran fokus.
2. Filter kategori berita hanya membedakan pilihan aktif lewat warna — kini `aria-current="page"` pada tautan aktif ("Semua" atau kategori terpilih).
3. Sampul berita/galeri berada di dalam tautan yang judulnya sudah menjadi nama aksesibel — `alt` judul/nama album membuatnya diumumkan dua kali; kini `alt=""`. Foto album tanpa judul tidak lagi meminjam nama album.
4. Batang progres pembangunan hanya penguat visual — diberi `aria-hidden` karena persentase sudah tersedia sebagai teks.
5. Peta Leaflet tidak punya nama aksesibel — kontainer kini `role="region"` + `aria-label={`Peta interaktif ${desaName}`}`.
6. Label statistik peta memakai campuran bahasa ("layer polygon") — diseragamkan menjadi "layer poligon".
7. Ikon dekoratif pada berita detail, galeri detail, dokumen, kontak, dan pembangunan diberi `aria-hidden`.
8. Halaman IDM/SDGs publik memakai `PageHeader` admin (judul `text-xl`/`2xl`) sehingga lebih kecil dari halaman publik lain — kini `ThemePageHeader` (`text-3xl`/`4xl`).

Bukti E2E baru pada `web-publik`: (a) tautan lewati + `main#konten-utama` `tabindex=-1` dan hanya satu `main` per halaman; (b) tepat satu tautan filter ber-`aria-current` saat tanpa filter. Test lama tidak dilonggarkan.

Verifikasi: `npm run lint` 0 error (2 warning `no-console` lama), `npm run format:check` lulus, `npm run test` 183 berkas/1.474 test lulus, `npm run check` lulus, `npm run build` lulus. E2E terhadap build produksi (`npm start`, port 3010): `web-publik` 17/17, `web-berita-galeri` 3/3, `web-dokumen` 1/1.

## Pembaruan 10 November 2026 — audit aksesibilitas admin

Audit difokuskan pada kerangka admin dan halaman yang paling sering dipakai (beranda, penduduk, surat, statistik rentang umur, inventaris). Temuan dan perbaikan:

1. `AppShell` tidak punya jalan pintas melewati header + sidebar, dan `<main>`-nya tanpa sasaran fokus. Kini `SkipLink` bersama (`src/components/shared/skip-link.tsx`) dipakai shell admin sekaligus tema publik (`ThemeSkipLink`), dengan `main#konten-utama` + `tabIndex={-1}`.
2. `TableHead` tidak menetapkan `scope`, sehingga pembaca layar tidak mengaitkan sel data dengan kolomnya. Kini `scope="col"` menjadi default komponen bersama; tabel penduduk dan surat diberi `aria-label` (`Daftar penduduk`, `Daftar surat`).
3. Tombol ikon tanpa nama pada tabel rentang umur statistik (`Pencil`/`Trash2`) kini berlabel "Ubah rentang …" dan "Hapus rentang …". Tombol aksi tabel penduduk, surat, inventaris, kelompok, dan berita memang sudah berlabel.
4. Tombol tutup dialog memakai teks Inggris "Close" pada antarmuka berbahasa Indonesia; kini "Tutup" dan ikon `X` ditandai dekoratif.
5. Pesan validasi field pada formulir penduduk tidak diumumkan pembaca layar; kini dibungkus `role="alert"` (`aria-invalid` per field sudah ada sebelumnya).
6. Tombol paginasi penduduk menerima atribut `disabled` pada elemen `<a>` (tidak valid) sekaligus `aria-disabled`; atribut `disabled` dihapus, status nonaktif tetap disampaikan lewat `aria-disabled` + gaya.
7. Ikon dekoratif pada filter penduduk, keadaan tabel kosong, tombol cetak, dan chevron sidebar ditandai `aria-hidden`.

Bukti E2E baru: test `penduduk` "aksesibilitas admin: tautan lewati, landmark konten, dan header tabel" memeriksa tautan lewati, `main#konten-utama` bertabindex `-1` dengan tepat satu `main`, `aria-label` tabel, seluruh `th` ber-`scope="col"`, serta nol tombol tabel tanpa nama. Test yang sama membuka `/konten/berita` dan `/keuangan/anggaran` dan memastikan tidak ada tombol terlihat tanpa nama aksesibel.

Pemindaian `src/features/konten` dan `src/features/keuangan` menemukan 13 kandidat tombol; 12 di antaranya positif palsu karena teksnya berasal dari ekspresi (`{isPending ? … : "Simpan"}`). Celah nyata hanya tombol hapus baris pada dialog impor laporan keuangan (ikon `X` tanpa nama), kini `aria-label="Hapus baris N"`. Tombol ikon tabel konten (berita, kategori, jabatan, perangkat, galeri, CMS) dan keuangan (jurnal, pembukuan, aksi dokumen) sudah memiliki `aria-label` sebelumnya.

Pemindaian serupa pada `src/features/penduduk`, `src/features/surat`, dan `src/features/inventaris` (beserta rute `src/app/(admin)/penduduk`, `persuratan`, dan `inventaris`) menghasilkan 24 kandidat dan **semuanya positif palsu**: teks tombol berasal dari ekspresi (`{isPending ? … : "Simpan"}`, `{deleting ? "Menghapus..." : "Hapus"}`, `{item.label}`), sementara tombol ikon tabel (ubah/hapus barang, kategori inventaris, aksi surat) sudah ber-`aria-label`. Tidak ada perubahan kode yang diperlukan; sebagai gantinya bukti E2E diperluas agar test aksesibilitas admin juga membuka `/persuratan/surat` dan `/inventaris` dan memastikan nol tombol terlihat tanpa nama aksesibel.

**Nama aksesibel saat pending (10 November 2026).** Pemindaian 177 tombol ber-spinner di `src` menemukan 6 tombol yang mengganti seluruh labelnya dengan spinner sehingga kehilangan nama tepat saat pengguna menunggu: tolak izin kehadiran (`izin-admin-panel.tsx`), hapus & simpan dokumen warga (`dokumen-warga-manager.tsx`), simpan pemilihan DPT (`dpt/election-dialog.tsx`), serta kirim kode & verifikasi kontak warga (`verifikasi-kontak-card.tsx`). Spinner kini tampil bersama label tetap, ikonnya `aria-hidden`, dan tombol menandai `aria-busy` saat pending. Tombol lain yang sudah memakai pola spinner + teks atau teks "Menyimpan…" tidak diubah. Verifikasi: pemindai ulang seluruh `src` melaporkan **0** tombol kehilangan nama dari 177 tombol ber-spinner, `npm run check` lulus (183 berkas/1.474 test), `npm run build` lulus, dan E2E build produksi `penduduk` 9/9 serta `warga-mandiri` 1/1 (11/11 termasuk auth setup).

Verifikasi: `npm run lint` 0 error (2 warning `no-console` lama), `npm run format:check` lulus, `npm run test` 183 berkas/1.474 test lulus, `npm run check` lulus, `npm run build` lulus. E2E build produksi: `penduduk` 9/9 (termasuk test aksesibilitas baru).

## Pembaruan 9 November 2026 — eksekusi suite E2E

Suite dijalankan pada dev server lokal: **56 berkas, 194 test, 190 lulus** dalam 335 detik (run 23:02, sebelum batch keempat; setelah batch keempat total 189 test). Empat kegagalan: `kelompok-laporan` (assertion bergantung nama penduduk seed; sudah diperbaiki) dan `keluarga`, `rtm-dpt`, `permohonan-warga` yang hanya gagal saat suite paralel dan lulus ketika dijalankan sendiri. Setelah perbaikan assertion, `kelompok-laporan` lulus 4/4; pada saat itu suite penuh belum dijalankan ulang setelah perbaikan terakhir.

Berkas yang ditulis ulang atau diperbaiki pada 9 November 2026:

| Berkas E2E | Test | Aksi UI | Bukti perilaku | ID |
|---|---:|---:|---|---|
| `penduduk` | 9 | 26 | CRUD, detail/cetak, catat kelahiran, filter + tautan CSV, DPT, suplemen, DTKS, laporan kependudukan, aksesibilitas shell/tabel admin | `OS-POP-001`–`OS-POP-007` |
| `keluarga` | 1 | 19 | Tambah KK, detail, ubah alamat, hapus | `OS-POP-003` |
| `rtm-dpt` | 2 | 22 | CRUD rumah tangga + tautkan anggota, laporan rekap | `OS-POP-004` |
| `keuangan` | 5 | 18 | Pagu/realisasi APBDes tersimpan, laporan + filter bidang, triwulan, SiLPA, rekonsiliasi | `OS-FIN-001`–`OS-FIN-003` |
| `pemerintahan` | 3 | 19 | Lembaga CRUD + anggota, kelompok tersimpan di laporan, SOTK admin/publik | `OS-GOV-002`–`OS-GOV-005` |
| `kelompok-laporan` | 3 | 22 | Kategori kelompok, anggota + jabatan, keluarkan anggota, ekspor CSV | `OS-GOV-004`, `OS-GOV-005` |
| `wilayah-pemerintahan` | 3 | 14 | Dusun CRUD + pencarian, rekap wilayah, referensi wilayah | `OS-WIL-001` |
| `pembangunan-buku` | 1 | 17 | Tambah proyek, ubah progres, hapus | `OS-GOV-009` |
| `pemilihan` | 2 | 3 | Admin membuat pemilihan; publik menampilkan kandidat, suara, pemenang (data disiapkan lewat DB, dibersihkan di `finally`) | `OS-GOV-007` |
| `bantuan-laporan` | 3 | 25 | Program CRUD, peserta dari dialog, laporan resmi + CSV | `OS-POP-011` |
| `statistik-bantuan` | 3 | 5 | Filter umur/sasaran, tautan ekspor, CSV | `OS-POP-010`, `OS-POP-013` |
| `ekspor-statistik` | 6 | 0 | PDF penduduk/bantuan, kind tak dikenal, filter pada tautan, penolakan tanpa sesi/warga | `OS-POP-010`, `OS-POP-013` |
| `analisis-survei` | 7 | 34 | Kategori/indikator/survei CRUD, jawaban warga → rekap admin, ekspor, token API | `OS-ANA-001`–`OS-ANA-006` |
| `survei-publik` | 2 | 1 | Survei aktif tampil + dapat dibuka; survei nonaktif disembunyikan | `OS-ANA-006` |
| `gis-pertanahan` | 7 | 30 | Area/garis/point/polygon, persil/CDESA/mutasi, peta cetak, simbol | `OS-WIL-006` |
| `web-publik` | 20 | 8 | Beranda, profil, berita, galeri, dokumen, peta, pembangunan, pengaduan, APBDes, kontak, suplemen, analisis publik; tautan lewati + `aria-current` filter kategori | `OS-WEB-001`–`OS-WEB-019` |
| `web-berita-galeri` | 3 | 16 | Berita buat/tampil/detail/cari, galeri album + detail | `OS-WEB-002`, `OS-WEB-004` |
| `umpan-balik` | 2 | 8 | Warga kirim umpan balik; admin menandai baru → dibaca → ditindaklanjuti | `OS-WEB-009`, `OS-WEB-015` |
| `pengaduan` | 1 | 17 | Kirim pengaduan tanpa akun, lacak dengan nomor tiket + identitas, operator menanggapi, status dan tanggapan terlihat pelapor | `OS-WEB-009` |
| `inventaris-bumindes` | 2 | 10 | Tambah barang, ubah lokasi, hapus lewat dialog konfirmasi; pintu masuk Bumindes | `OS-INV-001`, `OS-BUM-001` |
| `tema` | 1 | 6 | Simpan teks berjalan + tautan Facebook, nilai bertahan setelah muat ulang dan tampil di beranda publik, lalu dipulihkan | `OS-WEB-016`, `OS-WEB-017` |
| `plugin` | 1 | 2 | Nonaktivasi plugin tersimpan; aktivasi ditolak saat environment wajib belum diisi | `OS-OPS-008` |
| `keuangan-lanjutan` | 2 | 21 | Impor PDF tersimpan + unduh, catat penyerahan, tolak duplikat, hapus; pagu/realisasi/triwulan tampil di APBDes publik | `OS-FIN-004`, `OS-FIN-006` |
| `bantuan-warga` | 1 | 1 | Login warga, buka menu Bantuan dari beranda, program aktif/selesai tampil, program tanpa peserta tidak bocor | `OS-WGA-008` |
| `dtks-impor` | 1 | 8 | Impor CSV menautkan nomor RTM, menyalin anggota, verifikasi status, dan impor ulang idempoten | `OS-POP-006` |
| `warga-mandiri` | 1 | 24 | Login warga (captcha), pesan, lapak tambah/ubah/hapus + katalog publik, izin, verifikasi surat via token, dan registrasi mandiri yang disetujui admin (PIN tampil sekali) | `OS-WGA-001`, `OS-WGA-002`, `OS-WGA-003`, `OS-WGA-006`, `OS-WGA-007`, `OS-WGA-010`, `OS-WGA-011` |
| `pendapat` | 2 | 7 | Kirim publik tercatat, kiriman kedua ditolak, rekap + ekspor CSV, hapus admin | `OS-POP-014` |
| `idm` | 3 | 16 | Indikator tiga dimensi + rekap, ekspor CSV, capaian SDGs isi/ubah/hapus, halaman publik tanpa sesi | `OS-GOV-006` |
| `verifikasi-berjenjang` | 8 | 77 | Operator → sekdes → kades, penolakan tiap tahap, RBAC warga, pembuat ditolak saat menyetujui tahap kades; status dicek di DB + badge, nomor surat, catatan penolakan | `OS-SUR-007` |

Bug produksi yang ditemukan dan diperbaiki:

- `src/lib/forms.ts`: `optionalDigits` menangani input opsional tanpa memaksa digit.
- Dialog anggota memuat ulang terus-menerus (`rumah-tangga-members-dialog.tsx`, `anggota-dialog.tsx`, `peserta-dialog.tsx`); penghapusan anggota/peserta kini memanggil `onChanged` agar daftar induk ikut menyegarkan.
- `bidang-filter.tsx` baru; form SiLPA tidak lagi bersarang; agregasi `saveKeuanganNilai` menyimpan nilai dengan benar; filter `status=semua` pada pembangunan; perbaikan cetak tema (`print-button.tsx`, `themes/ui.tsx`).
- Impor dokumen laporan tidak pernah mengirim aksi: FormData memakai nama `berkas[i]`/`judul[i]` sementara aksi membaca `berkas`/`judul-i`, dan aksi dipanggil di luar transition. Kini aksi server dipanggil dalam `useTransition` dengan nama field yang sama.
- Pencarian DTKS (`/penduduk/dtks?search=...`) tidak lagi 500: filter nama/NIK memakai `EXISTS` sehingga query hitung tidak merujuk tabel yang tidak di-join dan baris tidak terduplikasi.
- Pendapat publik menampilkan pesan "Terjadi kesalahan pada server" saat sesi sudah pernah memilih: `ER_DUP_ENTRY` dibungkus Drizzle di `error.cause`, bukan `error.code`. Deteksi kini menelusuri rantai `cause` sehingga pesan duplikat yang ramah tampil.
- Halaman SDGs admin mengabaikan `?tahun=` dan selalu memakai tahun terbaru, sehingga tautan dari halaman IDM tidak konsisten. `ringkasanIdmPublik` kini menerima tahun pilihan admin.

Quality gate sebelum P0: `prettier --check tests src` bersih, `npm run lint` 0 error (2 warning `no-console` di `umpan-balik`), `npm run check` (typegen + tsc + ESLint) lulus. Setelah P0/P1/P2, hasil terbaru ada di bagian pembaruan di atas (183 berkas/1.474 test unit; 58 berkas/179 test E2E).

Sisa kelompok yang belum ditulis ulang menjadi alur interaktif penuh: `ops`/`ops-sistem`, `surat-konten`, `publik-apbdes`, `peta-publik`, `sitemap`, `api-publik`, `backup-database`, `disposisi-ekspedisi-agenda`, `email-webhook`, `surat-dinas`. `modul-tambahan` dan `kesehatan` sudah ditulis ulang; `sinergi`, `lapak-keranjang`, dan `pelanggan-kerjasama` sudah memiliki aksi UI.

Gap verifikasi surat sudah ditutup: `verifySuratData` memanggil `validateVerification`, sehingga pembuat tidak dapat menyetujui tahap sekdes/kades. Tahap operator tetap boleh karena operator menyusun konsep (alur OpenSID). Bukti: unit `verifikasi.test.ts` dan E2E 8/8.

## Status per ID (111 ID)

Kolom **E2E** menyebut berkas yang dirujuk register beserta hasil hitung AST. "Smoke" berarti tidak ada aksi UI di berkas itu. Angka per-ID dapat lebih tinggi daripada hitungan literal di tabel inventaris karena aksi melalui helper juga dihitung. Status pada kolom kedua adalah hasil audit struktur, bukan status penyelesaian fitur.

| ID | Hasil audit | Gap tersisa | E2E yang dirujuk |
|---|---|---|---|
| OS-POP-001 | Struktur lengkap; ada E2E interaktif | Alur CRUD, detail, filter, ekspor CSV, suplemen, DTKS; audit aksesibilitas admin: tautan lewati + `main#konten-utama`, tabel ber-`aria-label`, header kolom `scope="col"`, tombol aksi berlabel | `penduduk` 9 test/9 beraksi |
| OS-POP-002 | Struktur lengkap; ada E2E interaktif | Alur CRUD, pencarian, dan cetak biodata | `penduduk` 9 test (termasuk audit aksesibilitas) |
| OS-POP-003 | Struktur lengkap; ada E2E interaktif | CRUD KK, detail, ubah alamat | `keluarga` 1 test/1 beraksi |
| OS-POP-004 | Struktur lengkap; ada E2E interaktif | CRUD rumah tangga + anggota, laporan rekap | `rtm-dpt` 2 test/2 beraksi |
| OS-POP-005 | Struktur lengkap; ada E2E interaktif | Pemilihan aktif, tolak aktif kedua, filter pemilih, CSV, rekap | `penduduk` 9 test (termasuk audit aksesibilitas) |
| OS-POP-006 | Struktur terverifikasi | Impor CSV menautkan RTM, menyalin anggota, dan idempoten | `dtks-impor` 1 test/1 beraksi |
| OS-POP-007 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-POP-008 | Struktur lengkap; ada E2E interaktif | Posyandu, KIA, ibu hamil, anak, ekspor CSV | `kesehatan` 2 test/1 beraksi |
| OS-POP-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-POP-011 | Struktur lengkap; ada E2E interaktif | — | `bantuan-laporan` 3 test/3 beraksi |
| OS-POP-012 | Struktur lengkap; ada E2E interaktif | Impor CSV pada program kosong + impor ulang idempoten | `bantuan-impor-peserta` 1 test/1 beraksi |
| OS-POP-013 | Struktur lengkap; E2E hanya smoke | Ekspor PDF diuji tanpa aksi UI | `ekspor-statistik` 6 test/smoke |
| OS-POP-014 | Struktur lengkap; ada E2E interaktif | — | `pendapat` 2 test/7 beraksi |
| OS-POP-015 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WIL-001 | Struktur lengkap; ada E2E interaktif | — | `wilayah-pemerintahan` 3 test/1 beraksi |
| OS-WIL-002 | Sebagian | E2E cetak peta. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-003 | Sebagian | E2E. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-004 | Sebagian | E2E. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-005 | Sebagian | E2E GIS lebih luas. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-006 | Struktur lengkap; ada E2E interaktif | — | `gis-pertanahan` 7 test/1 beraksi |
| OS-WIL-007 | Sebagian | E2E halaman cetak peta. | `peta-publik` 1 test/smoke |
| OS-WIL-008 | Sebagian | E2E. | tidak dirujuk |
| OS-GOV-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-GOV-002 | Struktur lengkap; ada E2E interaktif | — | `pemerintahan` 3 test/2 beraksi |
| OS-GOV-003 | Sebagian | E2E bagan SOTK/cetak belum ada | `pemerintahan` 3 test/2 beraksi |
| OS-GOV-004 | Struktur lengkap; ada E2E interaktif | — | `kelompok-laporan` 3 test/3 beraksi |
| OS-GOV-005 | Struktur lengkap; ada E2E interaktif | — | `kelompok-laporan` 3 test/3 beraksi |
| OS-GOV-006 | Struktur lengkap; ada E2E interaktif | — | `idm` 3 test/16 beraksi |
| OS-GOV-007 | Sebagian | E2E admin + publik ada; kandidat publik memakai data DB, bukan input UI | `pemilihan` 2 test/2 beraksi |
| OS-GOV-008 | Struktur lengkap; ada E2E interaktif | — | `sinergi` 4 test/1 interaktif |
| OS-GOV-009 | Struktur lengkap; ada E2E interaktif | — | `pembangunan-buku` 1 test/1 beraksi |
| OS-GOV-010 | Struktur lengkap; ada E2E interaktif | — | `dokumen-publik` 2 test/2 beraksi |
| OS-SUR-001 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-002 | Sebagian | E2E. | `surat-flow` 6 test/5 interaktif; `permohonan-warga` 5 test/5 interaktif |
| OS-SUR-003 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-004 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-005 | Sebagian | E2E rekap/notifikasi. | `permohonan-warga` 5 test/5 interaktif |
| OS-SUR-006 | Struktur lengkap; ada E2E interaktif | — | `arsip-nomor-surat` 1 test/1 interaktif; `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-007 | Struktur lengkap; ada E2E interaktif | Pembuat ditolak memverifikasi tahap sekdes/kades; status dicek di DB + badge, nomor surat dan catatan penolakan terlihat pengguna | `verifikasi-berjenjang` 8 test/8 beraksi |
| OS-SUR-008 | Sebagian | E2E cetak per varian template. | `publik-verifikasi` 2 test/1 interaktif |
| OS-SUR-009 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-011 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `surat-dinas` 1 test/smoke |
| OS-SUR-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-013 | Sebagian | Adapter BSrE diuji server HTTP lokal (PDF langsung/JSON+unduh/nonaktif); verifikasi provider nyata belum. | `tte-server.test.ts` 3 test |
| OS-SUR-014 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-001 | Struktur lengkap; ada E2E interaktif | Pagu/realisasi APBDes tersimpan | `keuangan` 5 test/5 beraksi |
| OS-FIN-002 | Struktur lengkap; ada E2E interaktif | Laporan + filter bidang | `keuangan` 5 test/5 beraksi |
| OS-FIN-003 | Struktur lengkap; ada E2E interaktif | Realisasi triwulan tersimpan | `keuangan` 5 test/5 beraksi |
| OS-FIN-004 | Struktur terverifikasi | Impor PDF tersimpan, diunduh, diserahkan, duplikat ditolak, dan dihapus | `keuangan-lanjutan` 2 test/2 beraksi |
| OS-FIN-005 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-006 | Struktur terverifikasi | Pagu, realisasi, dan triwulan tampil di `/desa/apbdes` | `keuangan-lanjutan` 2 test/2 beraksi |
| OS-FIN-007 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-008 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-009 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-011 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-FIN-013 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WEB-001 | Sebagian | Cakupan E2E publik belum menyeluruh; header/beranda/footer dirombak menjadi portal desa, menu publik 7 grup + dropdown, duplikasi Kontak dihapus. Audit 10 November 2026 menambahkan tautan "Lewati ke konten utama" + `main#konten-utama` pada tema `esensi` dan `natra`. | `web-publik` 20 test/8 beraksi |
| OS-WEB-002 | Struktur lengkap; ada E2E interaktif | Filter kategori aktif ditandai `aria-current`; sampul kartu `alt=""` agar nama tautan tidak diumumkan ganda | `web-berita-galeri` 3 test/2 beraksi |
| OS-WEB-003 | Sebagian | E2E profil/pemerintahan/SOTK publik belum ada | tidak dirujuk |
| OS-WEB-004 | Struktur lengkap; ada E2E interaktif | Album, detail, dan cetak album; sampul dekoratif, foto tanpa judul tidak lagi meminjam nama album sebagai `alt` | `web-berita-galeri` 3 test/2 beraksi |
| OS-WEB-005 | Struktur lengkap; ada E2E interaktif | Dokumen dibuat, difilter, dicari, dan sematan sandbox | `web-dokumen` 1 test/1 beraksi |
| OS-WEB-006 | Sebagian | E2E publik membaca statistik; cakupan tenant/ekspor belum | `web-publik` 20 test |
| OS-WEB-007 | Sebagian | Peta Leaflet dan cetak dibuka lewat UI; cakupan layer lebih luas belum. Peta interaktif kini ber-`role="region"` dengan label desa, dan label ringkasan memakai "layer poligon". | `web-publik` 20 test |
| OS-WEB-008 | Sebagian | Proyek baru tampil di halaman publik; filter tahun dicek | `pembangunan-buku` 1 test/1 beraksi |
| OS-WEB-009 | Struktur lengkap; ada E2E interaktif | — | `pengaduan` 1 test/1 beraksi; `umpan-balik` 2 test/2 beraksi |
| OS-WEB-010 | Sebagian | Daftar kelompok dan tombol cetak tampil; alur cetak penuh belum | `web-publik` 20 test |
| OS-WEB-011 | Struktur lengkap; ada E2E interaktif | Filter kata kunci lewat formulir menampilkan pesan hasil; ekspor CSV mengikuti filter yang sama (`text/csv` + `Content-Disposition`); barang desa lain tidak tampil di daftar maupun CSV. | `web-publik` 20 test/8 beraksi |
| OS-WEB-012 | Struktur terverifikasi; ada E2E interaktif | Daftar dan detail suplemen tampil dengan sasaran serta jumlah data; hanya nama kolom isian yang dipublikasikan, nilai isian tidak; slug yang sudah dihapus 404. | `web-publik` 20 test/8 beraksi |
| OS-WEB-013 | Struktur lengkap; ada E2E interaktif | Rekap publik per pertanyaan (distribusi pilihan, rata-rata angka, jumlah jawaban teks tanpa isi), jumlah soal/responden, dan filter periode tahun; nama/NIK responden serta isi jawaban teks tidak tampil; survei desa lain tidak muncul dan `/isi` desa lain 404. | `web-publik` 20 test/8 beraksi |
| OS-WEB-014 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-WEB-015 | Struktur lengkap; ada E2E interaktif | — | `umpan-balik` 2 test/2 beraksi |
| OS-WEB-016 | Struktur lengkap; ada E2E interaktif | — | `tema` 1 test/1 beraksi |
| OS-WEB-017 | Sebagian | E2E tema terbatas pada teks berjalan dan tautan Facebook | `tema` 1 test/1 beraksi |
| OS-WEB-018 | Struktur lengkap; E2E hanya smoke | E2E belum berinteraksi | `sitemap` 2 test/smoke |
| OS-WEB-019 | Struktur lengkap; ada E2E interaktif | Form token (jalur kode QR) mengalihkan ke halaman token publik; token valid 64 hex menampilkan jenis, nomor, dan status surat; token berformat salah maupun token yang sudah dihapus menampilkan "Surat Tidak Ditemukan" tanpa membocorkan data. | `publik-verifikasi` 3 test/2 beraksi |
| OS-WGA-001 | Struktur terverifikasi | Registrasi mandiri `/desa/registrasi-warga`, persetujuan `/penduduk/registrasi`, captcha + OTP/email; test `captcha.test.ts`, `verifikasi-kontak.test.ts` | `warga-mandiri` 1 test/1 beraksi |
| OS-WGA-002 | Struktur terverifikasi | Login `/masuk`, sesi warga, PIN, OTP faktor kedua, rate limit; test `warga.test.ts`, `integrasi-warga.test.ts` | `warga-mandiri` 1 test/1 beraksi |
| OS-WGA-003 | Struktur terverifikasi | Beranda/profil/ringkasan layanan warga di `/layanan-mandiri`; test `integrasi-warga.test.ts` | `warga-mandiri` 1 test/1 beraksi |
| OS-WGA-004 | Struktur lengkap; ada E2E interaktif | Pembatalan oleh warga sebelum diambil, alasan wajib | `permohonan-warga` 5 test/5 beraksi |
| OS-WGA-005 | Struktur lengkap; ada E2E interaktif | — | `permohonan-warga` 5 test/5 interaktif |
| OS-WGA-006 | Struktur terverifikasi | Pesan dua arah `/layanan-mandiri/pesan` + `/pesan-warga`; test `pesan-warga.test.ts` | `warga-mandiri` 1 test/1 beraksi |
| OS-WGA-007 | Struktur terverifikasi | Verifikasi surat area warga `/layanan-mandiri/verifikasi-surat`; test `verifikasi.test.ts` | `warga-mandiri` 1 test/1 beraksi |
| OS-WGA-008 | Struktur terverifikasi | Program tanpa peserta tidak tampil | `bantuan-warga` 1 test/1 beraksi |
| OS-WGA-009 | Sebagian | Adapter WhatsApp diuji server HTTP lokal (lewati tanpa env, sukses, HTTP 500, DB gagal); kredensial provider nyata belum. | `kirim-notifikasi.test.ts` 4 test |
| OS-WGA-010 | Struktur terverifikasi | Lapak warga `/layanan-mandiri/lapak` + katalog publik; test `lapak.test.ts` | `warga-mandiri` 1 test/1 beraksi |
| OS-WGA-011 | Struktur terverifikasi | Kehadiran `/kehadiran`, izin warga `/layanan-mandiri/izin`, keputusan `/kehadiran/izin`; test `kehadiran.test.ts` | `warga-mandiri` 1 test/1 beraksi |
| OS-ANA-001 | Struktur lengkap; ada E2E interaktif | Kategori analisis CRUD | `analisis-survei` 7 test/4 beraksi |
| OS-ANA-002 | Struktur lengkap; ada E2E interaktif | Indikator dibuat dengan kode, nama, dan bobot 50 lalu dihapus | `analisis-survei` 7 test/4 beraksi |
| OS-ANA-003 | Struktur lengkap; ada E2E interaktif | Survei dibuat dengan sasaran dan periode, status `Aktif` tampil di daftar | `analisis-survei` 7 test/4 beraksi |
| OS-ANA-004 | Struktur lengkap; ada E2E interaktif | Laporan skor menampilkan responden, rata-rata skor, distribusi klasifikasi, dan skor per responden; CSV memuat responden; ID tidak valid ditolak `400` | `analisis-survei` 7 test/4 beraksi |
| OS-ANA-005 | Struktur lengkap; E2E hanya penolakan | Endpoint formulir eksternal diuji menolak permintaan tanpa token (`401`); jalur sukses bertoken belum diuji E2E | `analisis-survei` 7 test/4 beraksi |
| OS-ANA-006 | Struktur lengkap; ada E2E interaktif | — | `analisis-survei` 7 test/4 beraksi; `survei-publik` 2 test/1 beraksi |
| OS-MOD-001 | Struktur lengkap; ada E2E interaktif | CRUD, aktif/nonaktif, hapus, isolasi tenant, login NIK/tanggal lahir, pengajuan surat, nomor antrian, dan gerbang perangkat tanpa izin sudah diuji. Konfigurasi printer/IP belum dipakai di alur cetak. | `anjungan` 2 test/2 beraksi; integrasi tenant; unit anjungan 31 |
| OS-MOD-002 | Struktur lengkap; E2E hanya smoke | Buku tamu belum diuji berinteraksi | `modul-tambahan` 4 test/1 beraksi |
| OS-MOD-003 | Struktur terverifikasi | Rekap kehadiran `/kehadiran/rekap` + ekspor; use case memakai repository yang ada; test `kehadiran.test.ts` | tidak dirujuk |
| OS-MOD-004 | Struktur lengkap; ada E2E interaktif | — | `lapak-keranjang` 1 test/1 interaktif |
| OS-MOD-005 | Struktur terverifikasi; ada E2E interaktif | Unduhan menyajikan PDF `inline`; ID tidak valid 400, pelanggan desa lain 404, akun warga 403, dan permintaan tanpa sesi dialihkan ke `/masuk`. | `pelanggan-kerjasama` 3 test/1 interaktif |
| OS-OPS-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-OPS-002 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-003 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-004 | Sebagian | Gap: E2E aktivasi, login, dan jalur kegagalan OTP belum memadai. | tidak dirujuk |
| OS-OPS-005 | Sebagian | E2E penerimaan webhook, alur inbox/balasan dan filter kanal. | tidak dirujuk |
| OS-OPS-006 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-007 | Sebagian | Gap: E2E restore. | `backup-database` 1 test/smoke |
| OS-OPS-008 | Struktur lengkap; ada E2E interaktif | Aktivasi ditolak saat env wajib kosong | `plugin` 1 test/1 beraksi |
| OS-OPS-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-OPS-011 | Sebagian | E2E. | tidak dirujuk |
| OS-OPS-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
Catatan tabel:

- Rekonsiliasi historis 57 ✅ / 54 🟡 **tidak diwarisi**. Register 102 baris berisi 48 ✅ dan 54 🟡; sembilan ID tanpa baris kemudian dihitung sebagai ✅ tanpa bukti per-ID. Audit ini memberi baris eksplisit untuk kesembilan ID tersebut, dan menemukan satu di antaranya bug (`OS-MOD-001`).
- `OS-MOD-001` dan `OS-MOD-003` tidak memiliki baris register; statusnya diisi dari pemeriksaan kode dan test pada audit ini.
- Kolom E2E kosong berarti register tidak merujuk berkas E2E untuk ID tersebut. Itu bukan berarti tidak ada test unit/integrasi.

## Modul di luar 111 ID

Audit register tidak mencakup controller OpenSID `Periksa`. Sebagai gantinya dibangun modul **Pemeriksaan Data** (`/periksa`, resource RBAC `periksa`) yang bersifat baca saja: lima pemeriksaan penduduk (NIK kosong, NIK bukan 16 angka, tanggal lahir kosong, tanpa KK, tanpa hubungan keluarga), tiga pemeriksaan keluarga (KK tanpa anggota, tanpa kepala, kepala ganda), dan satu pemeriksaan menu (menu tanpa induk). Setiap temuan menautkan ke halaman perbaikan yang sudah ada (`/penduduk`, `/keluarga`, `/pengaturan/modul`). Path: `src/features/periksa/**`, halaman `src/app/(admin)/periksa/page.tsx`, seed modul di `src/db/seed/data/modules.ts`. Belum ada E2E, dan menu baru muncul setelah seed dijalankan ulang.

## Temuan lintas modul

### 1. Batas lapisan masih bocor

Tersisa **0 impor** langsung ke `@/db` atau `features/*/infrastructure` dari `src/app/**` dan **0** dari `src/features/*/presentation/**`. `api/pengaduan/lampiran` memakai use case yang memvalidasi jalur media. Route `src/app/(public)/desa/**`, `src/app/api/publik/**`, dan `src/app/sitemap.ts` juga 0 dan dijaga `src/features/publik/application/lapisan-publik.test.ts`. Route admin/warga/API lain sudah melewati use case yang memeriksa izin dan tenant.

Tabel sebaran impor lama dihapus karena sudah tidak berlaku setelah migrasi ke use case. Angka 0 di atas adalah hasil hitung ulang 10 November 2026, bukan jaminan bahwa setiap route sudah memiliki test otorisasi/tenant per route.

### 2. Tenant dan otorisasi

- Halaman admin yang diperiksa mengambil `villageId` dari sesi, bukan dari input klien.
- Halaman publik yang diperiksa menyelesaikan desa dari host.
- Use case pada modul yang diaudit memanggil `requirePermission`; halaman warga memakai `requireWarga`.
- Route admin/warga yang sudah dipindahkan ke use case belum diaudit ulang satu per satu untuk izin dan isolasi tenant; pemindahan ini tidak boleh dianggap bukti keamanan tanpa test otorisasi.

### 3. Provider eksternal

`OS-WGA-009` (WhatsApp/email) dan `OS-SUR-013` (BSrE/TTE) masih bergantung pada kredensial dan sandbox yang tidak tersedia. Test adapter dan pencatatan percobaan bukan bukti pengiriman ke provider nyata.

### 4. Cakupan E2E tidak merata

Pada hitung ulang 10 November 2026, 89 dari 178 deklarasi test E2E memuat aksi UI literal; suite penuh 57 berkas/180 test dijalankan terhadap build produksi. Alur berisiko tinggi yang sudah punya bukti interaktif: verifikasi berjenjang, permohonan warga, penduduk/keluarga/RTM, keuangan, pemerintahan/kelompok, bantuan, analisis/survei, GIS, berita/galeri, umpan balik, pengaduan, tema, warga mandiri, pemilihan, dan anjungan/kiosk. Klaim "sudah diuji E2E" pada ID lain tetap perlu diperiksa terhadap kolom E2E di atas.

## Audit vertikal: Anjungan (`OS-MOD-001`)

**Kesimpulan: alur CRUD admin, isolasi tenant, dan kiosk sudah dibuktikan E2E. Konfigurasi printer/IP belum dipakai di alur cetak; provider eksternal tidak termasuk ID ini.**

| Bagian | Bukti yang ditelusuri | Temuan |
|---|---|---|
| UI admin | `src/app/(admin)/anjungan/page.tsx`, `src/features/anjungan/presentation/components/anjungan-manager.tsx` | Daftar dan form tambah/ubah/hapus tersedia. Form memuat UUID, IP/MAC, printer, keyboard, orientasi, opsi surat tanpa akun, dan status. |
| Aksi / validasi | `src/features/anjungan/presentation/anjungan-actions.ts`, `src/features/anjungan/application/anjungan-use-cases.ts`, `src/features/anjungan/domain/anjungan.ts` | Server Action mengambil `villageId` dari sesi; use case mengecek izin dan memvalidasi Zod sebelum mutasi. |
| Penyimpanan / tenant | `src/features/anjungan/infrastructure/anjungan-repository.ts`, `src/db/schema/anjungan.ts`, `src/db/migrations/0079_add_anjungan_kiosk_fields.sql` | Repository memfilter list/update/delete menurut `villageId`; kolom konfigurasi kiosk sudah dimigrasikan. |
| Halaman publik | `src/app/(public)/desa/anjungan/page.tsx` | Desa dari host; hanya perangkat `aktif = 1` dan `status = aktif` tampil; kartu memakai use case dan mengenali perangkat dari cookie `anjungan_uuid`. |
| Test browser | `tests/anjungan.e2e.ts` | 2 test/2 beraksi. CRUD admin, ubah aktif/nonaktif, hapus, tenant desa lain, login kiosk, pengajuan surat, nomor antrian, baris DB, dan perangkat tanpa izin 404. |
| Test unit/domain | `src/features/anjungan/` | Test schema (4) dan use case (3) ditambahkan; keduanya lulus 9 November 2026. |

**Bug yang sudah diperbaiki:** (9 November 2026) string UUID kosong dinormalisasi menjadi `null` lalu diisi `randomUUID()`; (10 November 2026) `?jenis` kosong dianggap `0` sehingga halaman kiosk 404 setelah login, dan toast hapus hilang karena `revalidatePath` melepas komponen sebelum efek toast berjalan. Parsing jenis surat dan urutan toast/refresh sudah diperbaiki.

**Gap tersisa:** pemakaian konfigurasi perangkat/printer di alur cetak; verifikasi visual seluruh varian orientasi. Alur CRUD, tenant, aktif/nonaktif, dan kiosk tidak lagi menjadi gap.

## Hal yang belum bisa disimpulkan

1. **Eksekusi suite E2E**: sudah dijalankan 10 November 2026 terhadap build produksi, 57 berkas/180 test; dua run paralel masing-masing 179/180 dengan flake berbeda yang lulus sendiri. Test P0 Anjungan 2/2 lulus. Flake suite penuh masih perlu distabilkan.
2. **Pemeriksaan visual seluruh 204 halaman**: tidak dilakukan; status UI berasal dari pembacaan kode dan test.
3. **Provider eksternal nyata**: tidak diuji tanpa kredensial.
4. **Isolasi tenant pada route yang dipindahkan**: route sensitif yang diuji (lampiran pengaduan, NIK, TTE eksternal, surat eksternal) sudah punya bukti; belum semua route diperiksa satu per satu.
5. **Persentase paritas**: tidak dihitung; jumlah ID atau test bukan ukuran paritas.

## Kesimpulan

Audit struktur selesai untuk seluruh 111 ID. Tidak ada ID yang dinyatakan selesai penuh. Per 10 November 2026, 89 dari 178 deklarasi test E2E memuat aksi UI literal dan suite penuh 57 berkas/180 test dijalankan terhadap build produksi; belasan ID yang sebelumnya hanya smoke (penduduk, keluarga, RTM, keuangan, pemerintahan, kelompok, pembangunan, bantuan, analisis, berita/galeri, umpan balik, pengaduan, tema, warga mandiri) kini punya bukti interaktif. P0 Anjungan sudah ditutup dengan E2E CRUD/tenant/kiosk. Prioritas berikutnya adalah menstabilkan flake suite penuh, memverifikasi provider nyata bila kredensial tersedia, menutup kebocoran lapisan yang tersisa, dan menulis ulang berkas yang masih smoke (`kesehatan`, `modul-tambahan`, dan daftar di bagian pembaruan). Daftar kerja berurutan ada di [`RENCANA-PENGEMBANGAN.md`](./RENCANA-PENGEMBANGAN.md).
