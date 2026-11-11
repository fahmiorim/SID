# Rencana Perbaikan — Fase dan Status Milestone

Tujuan: menutup gap rebuild orisinal OpenSID untuk 112 ID katalog (111 ID audit awal + `OS-WEB-020`), dengan bukti
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
| F0 | Inventarisasi katalog (112 ID) dan audit struktur 111 ID | Selesai 10 November 2026 | Tabel status per ID di `STATUS-MODUL.md`; katalog dan register aktif dijaga `src/db/paritas-register.test.ts` |
| F1 | P0: otorisasi/tenant, kebocoran lapisan, bug yang terbukti | Selesai 10 November 2026 | Anjungan (`OS-MOD-001`) CRUD/tenant/kiosk; 0 impor infrastruktur di route & presentation; adapter notifikasi/BSrE diuji dengan server lokal |
| F2 | P1: E2E perilaku alur inti | Selesai 10 November 2026 | 8 berkas P1, 32/32 test pada build produksi |
| F3 | P2: gap fungsional dan keluaran per ID | Berjalan | Keluaran utama tertutup (lihat daftar di bawah); 0 ID tanpa rujukan E2E |
| F4 | Stabilitas suite E2E | Selesai 10 November 2026 | 5 flake ditutup di akar; run penuh terakhir 62 berkas/195 test lulus berturut-turut; runner kini 63 berkas |
| F5 | P3: konsistensi dokumen dan guard | Selesai untuk dokumen; guard perlu diperluas | Katalog/paritas/rencana aktif, `RENCANA-PENGEMBANGAN.md` disinkronkan, guard dokumen + lapisan publik |
| F6 | Provider eksternal nyata dan pemeriksaan visual | Terblokir / Belum | `OS-WGA-009`, `OS-SUR-013` menunggu kredensial; 206 halaman belum diperiksa visual |

## F0 — Audit inventaris dan struktur

Selesai. Hasil yang dipakai sebagai dasar fase lain:

- 112 ID katalog, 53 folder fitur, 206 `page.tsx`, 79 `route.ts`, 184 berkas test unit/integrasi.
- 63 berkas E2E, 195 `test()`, 927 aksi UI literal; 111 dari 195 deklarasi test memuat aksi UI.
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

Berjalan. Per 11 November 2026, register mencatat: **107 ID** punya E2E interaktif,
**0 ID** belum dirujuk E2E, **0 ID** terverifikasi struktur tanpa E2E, **3 ID**
Sebagian, **0 ID** hanya smoke, **2 ID** terverifikasi + E2E, dan **0 ID** hanya
diuji jalur penolakan. Tidak ada ID yang dinyatakan selesai penuh.

Gap P2 yang masih terbuka:

1. **Persuratan:** notifikasi email perubahan status belum diuji karena provider belum dikonfigurasi. PDF per varian sudah diuji; `OS-SUR-014` membuktikan penolakan MIME lewat UI, sedangkan batas ukuran dan sanitasi nama masih unit/integrasi.
2. **Warga:** OTP/email (butuh provider) dan rate limit OTP belum E2E; ubah PIN sudah dibuktikan lewat UI.
3. **Sebagian:** `OS-SUR-002`, `OS-SUR-013`, `OS-WGA-009`; rincian gap per ID ada di [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).
4. **Anjungan:** konfigurasi printer/IP belum dipakai di alur cetak; verifikasi visual varian orientasi belum dilakukan.

Ditutup 11 November 2026: laporan/ekspor DTKS, ekspor CSV/Excel keuangan, dokumen APBDes publik, kandidat pemilihan lewat UI, balasan operator `/pesan-warga`, keputusan izin `/kehadiran/izin`, ubah PIN warga, PDF per varian, dan penolakan MIME disposisi.

## F4 — Stabilitas suite E2E

Selesai 10 November 2026. Lima flake ditutup di akarnya, tanpa jeda tambahan:
dialog DPT tidak lagi memuat ulang halaman, locator PDF mengikuti menu `Aksi surat …`,
test beranda tidak merebut `heroJudul` global, test peta menunggu geometri Leaflet,
dan toast pembangunan tidak lagi ambigu. Pemuatan ulang penuh terakhir di aplikasi
(Reset pengaturan lampiran) diganti `router.refresh()` dan dijaga
`tests/pengaturan-lampiran.e2e.ts`. Run penuh terakhir pada build produksi: 62 berkas/195 test lulus; runner kini mencakup 63 berkas setelah `agenda-publik.e2e.ts` ditambahkan.

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
- Pemeriksaan visual: 53 halaman publik dan 139 route admin/warga sudah diaudit pada 1440/390 px; 15 halaman admin ber-segmen dinamis belum tercakup crawl statis.

## Pembaruan 10 November 2026 — privasi DPT dan agenda publik

Audit halaman publik terhadap OpenSID menemukan dua kebocoran dan beberapa
halaman di luar kerangka tema. Perbaikannya:

- **`OS-POP-005`**: `/desa/dpt` tidak lagi mengirim NIK ke browser. Redaksi
dilakukan di use case (`keDptPublik`) sehingga NIK bukan hanya disembunyikan di
JSX; pencarian publik hanya mencocokkan nama, bukan NIK.
- **`OS-WEB-020` (baru)**: agenda publik punya tabel sendiri (`agenda_kegiatan`)
dengan status `tayang` eksplisit. Sebelumnya beranda dan `/api/publik/surat`
membaca `bumindes_agenda` — buku agenda surat yang memuat nomor surat dan
asal/tujuan instansi — sehingga metadata persuratan bocor. Halaman admin
`/konten/agenda` (resource `agenda`) mengelola agenda; halaman publik
`/desa/agenda` hanya membaca baris yang ditayangkan dan tanggal mendatang.
- **`OS-WEB-001`, `OS-WEB-007`, `OS-WEB-008`**: peta dan pembangunan memakai
slot tema (`peta`, `pembangunan`) sehingga header/footer desa konsisten;
jajak pendapat dipindah ke route group `(public)` agar ikut kerangka tema.
Navigasi menambah Agenda, Peta, Kelompok, Inventaris, Status Desa, dan
Pengaduan tanpa mengubah tujuh grup utama. Footer menautkan Agenda dan Peta.

Bukti: `agenda.test` (7 test domain), `dpt.test` (redaksi NIK), dan
`agenda-publik` 1 test/1 beraksi pada build produksi. Migrasi: `0098_create_agenda_kegiatan.sql`.

## Pembaruan 10 November 2026 — kerangka visual publik

Keluhan "kontainer kurang lebar dan desain terasa seperti buatan AI" ditelusuri ke
tiga sebab nyata, bukan sekadar selera:

- **Lebar dan pembungkus ganda.** Isi publik memakai `max-w-6xl` (72rem) di
  dalam `main` tema, sementara `/desa/dpt`, `/desa/lapak*`, dan
  `/desa/kesehatan/*` menambahkan `max-w-6xl px-4 py-8` lagi di dalamnya. Lebar
  efektif menyusut dan gutter bertumpuk. Kini satu konstanta `TEMA_WADAH`
  (84rem/1344 px, gutter 16→32 px) dipakai header, isi, dan footer tema
  `esensi` maupun `natra`, dan pembungkus ganda dihapus.
- **Footer menggantung.** Wrapper tema memakai `min-h-full` yang tidak berlaku
  karena induknya bukan tinggi tetap; pada halaman pendek footer berhenti
  160–236 px di atas dasar viewport. Diganti `min-h-dvh`.
- **Pola template dan kontrol netral.** Hero bergradasi dengan badge pil, empat
  kartu ikon identik, dan judul bagian berpola sama diganti masthead editorial,
  strip akses cepat bergaris rambut, dan judul bagian bergaris atas. Primitif
  `ThemePageHeader`, `ThemeStatGrid`, dan `ThemeEmpty` dirapikan; `/desa/lapak`
  memakai `ThemePageHeader`/`ThemeCard` agar tidak lagi bergaya panel admin.
  Di dalam `[data-theme]`, `--primary`/`--primary-foreground`/`--ring` dipetakan
  ke `--pub-primary`, sehingga tombol submit tidak lagi hitam netral;
  `.tema-button-primary` (dipakai tombol cari/terapkan di berita, dokumen,
  inventaris, galeri, survei) sebelumnya tidak punya definisi CSS dan kini
  mengikuti warna desa.

ID terdampak: `OS-WEB-001` (kerangka beranda dan footer), `OS-WEB-014` (lapak),
`OS-POP-005` (halaman DPT hanya berubah kerangka, redaksi NIK tidak disentuh).

Bukti: `npm run typecheck`, `npm run lint`, dan `npm run test` (184 berkas/1489
test). Render 1440/1920/390 px pada `/`, `/desa/agenda`, `/desa/dpt`,
`/desa/lapak`, dan `/desa/berita`: `main` 1344 px, tanpa overflow horizontal,
footer mencapai dasar viewport. Pemeriksaan visual 206 halaman pada F6 tetap
belum selesai; yang diperiksa hanya rute di atas.

### Tipografi dan aksesibilitas (`OS-WEB-017`)

Arah desain diambil dari skill `ui-ux-pro-max` yang dipasang di
`.agents/skills/ui-ux-pro-max` (MIT, data lokal + `search.py`, tanpa panggilan
jaringan). Kueri yang dipakai: `"government services portal" --domain product`
→ rekomendasi *Accessible & Ethical + Inclusive Design*, pola *Service Directory
+ Search*; `"accessible government readable" --domain typography` → pasangan
font **Atkinson Hyperlegible**; `"touch target focus ring" --domain ux`.
Rekomendasi palet statis (biru/hijau) **tidak** dipakai karena warna tetap milik
setiap desa lewat `--pub-*`.

Yang diterapkan:

- **Font `aksesibel` (Atkinson Hyperlegible)** ditambahkan ke `FONT_CHOICES` dan
  menjadi bawaan opsi tema; operator tetap dapat memilih bawaan sistem,
  sans-serif, atau serif. Font dimuat lewat `next/font` (`--font-atkinson`).
- **Warna aksen sebagai teks kini dijamin kontras.** `warnaTeksAksen()`
  menggelapkan `warnaPrimer` bertahap sampai ≥ 4,5:1 terhadap latar terang, lalu
  diekspos sebagai `--pub-primary-text`; semua label/tautan tema memakainya.
  `kontrasTeks()` juga diganti dari perkiraan BT.601 ke rasio WCAG, sehingga
  warna rentang tengah (mis. `#16a34a`) mendapat teks gelap, bukan putih 3,3:1.
- **Target sentuh 44 px** untuk input/select dan tombol aksi di halaman warga
  (sebelumnya 36–40 px), **fokus keyboard 3 px** warna aksen dengan offset 2 px
  untuk semua kontrol dalam `[data-theme]`, dan **`prefers-reduced-motion`**
  mematikan transisi/animasi dekoratif.

Bukti: `theme.test` (21 test, termasuk kontras `#16a34a` dan `#ffd400`), render
verified pada lima rute di atas (font terhitung Atkinson, kontrol 44 px, outline
fokus 3 px).

## Pembaruan 10 November 2026 — gradasi dan komposisi beranda

Keluhan lanjutan "terlalu polos dan kurang premium, tata letaknya kurang ok"
ditelusuri ke penyebab komposisi, bukan sekadar warna:

- **Celah mati di hero.** Grid hero memakai `1fr` + 23–26rem, tetapi kolom teks
dibatasi `max-w-2xl`, sehingga separuh lebar kiri kosong; gambar `aspect-[4/5]`
memaksa panel setinggi ±560 px sementara isi teks ±520 px, membuat teks
mengambang di tengah. Kini kolom teks mengisi penuh (`1.06fr`), gambar mengikuti
tinggi panel (`lg:h-full`, min 25rem), dan isi diratakan `items-stretch`.
- **Semua permukaan putih bergaris 1 px.** Halaman, kartu, sidebar, dan footer
memakai latar yang sama sehingga tidak ada kedalaman. Ditambahkan token
`--pub-halaman`, `--pub-garis`, `--pub-bayang` serta kelas `.tema-kartu`,
`.tema-kartu-interaktif`, dan `.tema-hero` di `src/themes/esensi/theme.css`.
- **Berita utama berupa kotak gambar 21:9 kosong** selebar kolom. Diganti kartu
mendatar (gambar + teks) dengan daftar berita lain bergaris pisah, dan kartu
berita bersampul pada panel hero.
- **Sidebar berhenti lebih awal** dibanding kolom berita. Sidebar kini
`lg:sticky lg:top-20` sehingga tetap terbaca saat berita panjang.
- **Footer abu-abu pucat** diganti panel gelap bergradasi dari varian gelap warna
desa (teks putih 78–95%, kontras tetap lolos).

Gradasi (diminta eksplisit pengguna) diturunkan dari warna desa, bukan palet
tetap: `.tema-gradien` (primer → campuran sekunder → sekunder gelap) untuk tombol
hero, lencana agenda, monogram, dan bilah navigasi; `.tema-judul-gradien` untuk
judul hero; `.tema-garis-gradien` untuk garis judul bagian; wash radial + titik
halus pada panel hero; serta gradasi yang sama pada `.tema-button-primary` agar
tombol cari/terapkan di berita, dokumen, inventaris, galeri, dan survei seragam.
Arah gradasi selalu menuju warna yang lebih gelap, sehingga kontras teks tidak
pernah lebih buruk daripada warna dasar desa.

ID terdampak: `OS-WEB-001` (beranda, header, footer), `OS-WEB-014` (lapak ikut
memakai primitif bersama), `OS-WEB-017` (opsi warna/font/radius tetap menjadi
sumber semua aksen).

Bukti: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test`,
dan `npm run build`; render 1440 dan 390 px pada `/`, `/desa/berita`, dan
`/desa/lapak` tanpa overflow horizontal (`scrollWidth - clientWidth = 0`),
sidebar terhitung `position: sticky`, dan footer menempel di dasar viewport.

## Urutan kerja berikutnya

1. Tutup 4 ID berstatus Sebagian sebelum menambah fitur baru.
2. Lengkapi keluaran yang belum diuji (PDF per varian, notifikasi email) dan penolakan unggahan surat lewat UI.
3. Setelah kredensial tersedia, jalankan verifikasi provider nyata lalu naikkan status ID terkait.
4. Jalankan gate (`npm run lint`, `npm run format:check`, `npm run test`, `npm run check`, `npm run build`) dan suite E2E pada build produksi sebelum setiap commit.

## Aturan pembaruan

- Setiap perubahan fitur memetakan ID `OS-*` dan memperbarui `PARITAS-OPENSID.md` serta baris terkait di `STATUS-MODUL.md` pada commit yang sama.
- Menutup satu alur tidak menaikkan status domain secara keseluruhan.
- Status "Selesai" hanya untuk fase yang seluruh ID-nya punya bukti perilaku dan gate lulus.
