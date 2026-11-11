# Audit Tampilan Publik vs Kompetitor

> Audit 10 November 2026. Dokumen ini berisi **temuan dan rekomendasi**, bukan
> status implementasi. Status fitur tetap di
> [`../../STATUS-MODUL.md`](../../STATUS-MODUL.md); urutan kerja yang disepakati
> ada di [`../../RENCANA-PENGEMBANGAN.md`](../../RENCANA-PENGEMBANGAN.md).

## 1. Ruang lingkup dan metode

Yang dibandingkan:

- Tema publik proyek: `esensi` (bawaan) dan `natra`.
- Situs desa nyata: Digides (`digidemo.digitaldesa.id`) dan EasyDes
  (`cibentang.godesa.id`).
- Arah desain produk: SapaDesa, SINDES, dan DesaHub/site-desa.id.
- Demo OpenSID (`demosid.opendesa.id`) dibuka, tetapi isi halaman tidak
  terambil lengkap; klaim visual OpenSID di dokumen ini sengaja dibatasi.

Batas:

- Tidak ada screenshot atau pengukuran warna otomatis. Perbandingan warna
  bersifat strategi palet dan pembacaan kode, bukan sampling piksel.
- Fitur dan tampilan kompetitor dapat berubah; situs yang diakses adalah versi
  pada tanggal audit.
- Halaman publik yang butuh login (layanan mandiri) tidak dibandingkan.

## 2. Perbandingan blok beranda

| Blok | Esensi (kita) | Natra (kita) | Digides | EasyDes |
|---|---|---|---|---|
| Hero | Panel gradasi + satu berita unggulan | Blok warna + teks | Slider foto besar | Banner + identitas desa |
| Sambutan kepala desa | Diringkas menjadi teks hero | Diringkas menjadi teks hero | Blok khusus + foto | Blok panjang + foto/tanda tangan |
| Akses cepat | 4 kartu: Surat, APBDes, Statistik, Lapak | Tidak ada | Menu "Jelajahi" + bottom nav | 11 tile: Profil, Pemerintahan, Statistik, APBDes, Layanan, IDM, SDGs, Lapak, Peta, Album, Bansos |
| Statistik penduduk | 3 angka di hero + kartu sidebar | 4 kartu warna | 6 angka termasuk mutasi dan penduduk sementara | 4 angka |
| APBDes | Tidak ada di beranda | Tidak ada | Ringkasan pendapatan/belanja + detail | Progress bar per bidang + rincian |
| Perangkat desa | Tidak ada | Tidak ada | SOTK + "Lihat semua" | Daftar + status "Belum di kantor" |
| Agenda | Daftar 5 agenda | Daftar agenda | Ada | Kalender bulanan |
| Galeri/wisata/potensi | Tidak ada | Slider saja | Galeri, wisata, potensi | Album, lapak, peta |
| UMKM | Tidak ada; hanya tautan Lapak | Tidak ada | "Beli dari Desa" | "Lapak dan Jasa Warga" |
| Kontak | Kartu sidebar | Kartu di bawah | Footer lengkap + nomor penting + jam | "Temukan Kami" + peta |
| Statistik pengunjung | Tidak tampil | Tidak tampil | Hari ini, kemarin, minggu, bulan, total | Total pengunjung |
| Navigasi mobile | Menu dropdown | Menu dropdown | Bottom nav: Beranda, Pengaduan, Berita, Belanja | Menu + tile responsif |

Kesimpulan: beranda kita lebih rapi secara editorial, tetapi masih terasa
seperti **portal berita**, belum seperti **meja layanan warga**. Kompetitor
menaruh layanan, uang desa, dan identitas pemerintahan di atas; berita di bawah.

## 3. Warna

Yang sudah benar:

- Warna desa mengalir lewat `--pub-primary`, `--pub-secondary`,
  `--pub-radius`, dan `--pub-font` dari `themeCssVars()` di
  `src/features/publik/domain/theme.ts`.
- Ada perhitungan kontras WCAG: `kontrasTeks()` dan `warnaTeksAksen()`.
- Font bawaan Atkinson Hyperlegible sesuai audiens desa dan lansia.
- Esensi memakai permukaan bertingkat (halaman berwarna tipis, kartu putih).

Temuan:

1. **Header bisa gagal kontras untuk warna terang.** `esensi/layout.tsx` dan
   `natra/layout.tsx` memakai latar `--pub-primary-text` (warna yang sudah
   digelapkan) dengan teks `--pub-primary-foreground` (dihitung terhadap warna
   primer asli). Untuk primer kuning/oranye terang, hasilnya teks gelap di latar
   gelap.
2. **Kebocoran token di APBDes.** Pill tahun aktif memakai `bg-primary` dan
   `text-primary-foreground` (palet admin), bukan `--pub-primary`
   (`src/themes/esensi/pages/apbdes.tsx`).
3. **Natra mengabaikan opsi kelengkungan.** Banyak sudut ditulis
   `rounded-2xl`/`rounded-3xl`; `--pub-radius` hanya dipakai sebagian.
4. **Pratinjau Natra tidak sesuai.** `warnaPratinjau: "#e64946"` (merah), tetapi
   palet bawaan tetap hijau dari opsi tema.
5. **Dekorasi berlebih.** Hero Esensi memakai tiga lapis gradient dan dua glow;
   Natra memakai gradient primer ke sekunder. Untuk situs pemerintah, foto desa
   dan data lebih dipercaya daripada efek "startup".

Rekomendasi: hitung warna teks per permukaan, ganti gradient hero dengan foto
atau ilustrasi desa, kurangi glow. Dark mode tidak diprioritaskan.

## 4. Tata letak

Kuat:

- `TEMA_WADAH` (84rem) dengan gutter bertingkat.
- Header Esensi tiga lapis: bilah kontak, identitas pemerintah, navigasi sticky.
- Esensi memakai dua kolom dengan sidebar sticky; lebih terbaca daripada Natra
  yang menumpuk semua bagian.
- Skip link, focus ring, dan `prefers-reduced-motion` untuk teks berjalan.

Temuan:

- **Dua tema bukan dua pengalaman.** Natra hanya menimpa `layout` dan `home`;
  23 halaman lain memakai komponen Esensi (`src/themes/natra/index.tsx`).
- **Target sentuh menu 36 px** (`size-9`) di kedua tema; nyaman minimal 44 px.
- **Belum ada bottom navigation** di mobile seperti Digides.
- **Halaman di luar tema tidak konsisten.** `/desa/kesehatan/kia`, `/desa/dpt`,
  `/desa/pengaduan`, dan `/desa/anjungan` memakai header/tabel/Card sendiri,
  bukan `ThemePageHeader`/`ThemeCard`.
- **Footer terlalu tipis.** Belum ada jam pelayanan, nomor penting, peta situs,
  status "terakhir diperbarui", dan kredit.

## 5. Konten yang perlu ditambah

P0:

1. **Akses cepat 8 layanan di kedua tema**: Surat, APBDes, Statistik, Bansos,
   IDM/SDGs, Kesehatan, Pengaduan, Lapak.
2. **Ringkasan APBDes + bar realisasi di beranda**; grafik di `/desa/apbdes`.
3. **Sambutan kepala desa + foto + 3–4 perangkat** di beranda.
4. **Kalender agenda bulanan**, bukan hanya daftar.
5. **Pencarian global di header** untuk berita, dokumen, dan lapak.
6. **Footer informatif**: jam pelayanan, nomor penting, peta situs, total
   pengunjung, "diperbarui pada".

P1:

7. Peta "Temukan kami" (embed OSM) di kontak/beranda.
8. Sorotan potensi/UMKM/wisata; Lapak sudah ada tetapi tidak pernah difeature.
9. Infografis statistik dan unduh PDF APBDes.
10. Tombol bagikan dan cetak di berita/APBDes.

Catatan navigasi: `PUBLIC_NAV` di `src/features/publik/domain/menu.ts` belum
memuat `/desa/kesehatan/*`, `/desa/idm-sdgs`, `/desa/bantuan`, `/desa/suplemen`,
`/desa/verifikasi-surat`, dan `/desa/anjungan`. Halaman itu ada, tetapi tidak
dapat ditemukan dari menu bawaan.

## 6. Konten yang perlu dikurangi

1. **Nama pemohon surat di beranda.** `listSuratTerbitTerbaru()` mengembalikan
   `namaPemohon` (`src/features/desa/application/statistik-desa.ts`) dan kedua
   tema menampilkannya. Ini membocorkan nama warga di halaman publik.
2. **Feed "Surat Layanan Terbaru"**. Kompetitor memakai CTA layanan, bukan daftar
   permohonan. Ganti dengan kartu "Ajukan Surat" + agregat jumlah.
3. **Gradient/glow berlebih** dan hero 4,1 rem yang berisiko memotong nama desa
   panjang.
4. **Menu "Partisipasi" berisi DPT/Pemilihan** di navigasi utama; pindahkan ke
   grup "Informasi" atau "Warga".
5. **Slider + berita bersamaan** di Natra; sering menampilkan konten yang sama
   dua kali.

## 7. Yang perlu diperbaiki

- Kontras header dan hero untuk warna primer terang.
- Token `bg-primary` di APBDes menjadi `--pub-primary`.
- Radius Natra mengikuti `--pub-radius`.
- Target sentuh minimal 44 px.
- Header semua halaman publik memakai `ThemePageHeader`/`ThemeCard`.
- Tampilkan `StatistikPengunjungWidget` yang sudah ada tetapi tidak diimpor
  (`src/features/kontak/presentation/components/statistik-pengunjung-widget.tsx`).
- Ganti `<img>` mentah dengan `next/image` + `sizes` untuk LCP hero/berita.
- Tambahkan guard `prefers-reduced-motion` untuk animasi masuk
  `#konten-utama > *`.
- Tambahkan empty state dengan CTA, bukan teks "belum ada" saja.

## 8. Yang perlu dibangun ulang (terbatas)

1. **Design system publik kecil**: `Section`, `QuickGrid`, `StatBand`,
   `DataTable`, `PageHeader`, dan `Hero` dengan varian `foto`/`warna`/`polos`.
   Migrasikan 5–6 halaman yang masih ad-hoc.
2. **Komposisi beranda**: warga → layanan → transparansi → kabar → agenda,
   dengan hero berisi identitas, sambutan singkat, dan foto.
3. **Strategi tema**: satu tema inti + 2–3 varian hero/warna, daripada dua tema
   yang 90% sama. Jika Natra dipertahankan, jadikan hero foto penuh, tanpa
   sidebar, dan tipografi berbeda.

## 9. Urutan kerja yang disarankan

| Prioritas | Pekerjaan | Dampak | Perkiraan |
|---|---|---|---|
| P0 | Hapus nama pemohon; ganti CTA surat | Privasi + relevansi | 0,5 hari |
| P0 | Perbaiki kontras header/hero, token APBDes, radius Natra | Warna desa tidak rusak | 1 hari |
| P0 | 8 tile akses cepat + lengkapi menu bawaan | Warga menemukan fitur | 1–2 hari |
| P0 | Ringkasan APBDes + bar realisasi di beranda | Transparansi terlihat | 1–2 hari |
| P0 | Sambutan kades + perangkat di beranda | Rasa pemerintahan desa | 1 hari |
| P1 | Kalender agenda + pencarian header | Navigasi konten | 2 hari |
| P1 | Footer informatif + widget pengunjung | Kepercayaan | 0,5 hari |
| P1 | Satukan header halaman ad-hoc | Konsistensi visual | 1–2 hari |
| P2 | Bottom nav + target 44 px | Pengalaman HP | 1 hari |
| P2 | Chart APBDes/statistik + PDF | Kualitas transparansi | 2–3 hari |

**Status 10 November 2026.** Enam baris P0 sudah dikerjakan di kode: nama
pemohon dihapus, kontras header/hero/APBDes diperbaiki dengan token turunan,
radius Natra mengikuti opsi tema, delapan tile akses cepat + menu bawaan
lengkap, ringkasan APBDes + bar, serta sambutan kades + perangkat. Dari P1,
footer informatif dan widget pengunjung sudah tampil, sedangkan header KIA,
DPT, dan Pengaduan sudah disatukan (anjungan sengaja belum karena tata letak
kiosk). Kalender agenda + pencarian header belum dikerjakan. Dari P2, target
sentuh 44 px dan bottom nav mobile sudah selesai (lihat 9.2); chart/PDF belum. Bukti: 26 test domain tema/menu, `npm run check` (0 error, 1.490 test), build
produksi, serta E2E build produksi `web-publik` 24/24, `tema` 1/1, dan
`publik-apbdes` 1/1 (27/27 termasuk setup auth). Test `web-publik` membuktikan menu tujuh grup, delapan
tile akses cepat, sambutan/perangkat, nama pemohon surat tidak tampil, dan
widget pengunjung di kontak. Sisa: chart/PDF, header anjungan, dan `next/image`.

## 9.1 Audit visual seluruh halaman publik — 11 November 2026

Audit ini melengkapi perbandingan kompetitor di atas dengan pemeriksaan render
nyata, bukan hanya pembacaan kode. Metode: Chrome melalui Playwright, seluruh 53
halaman publik (52 di route group `(public)` + `/masuk`) × lebar 1440 dan 390 px
(106 tangkapan layar penuh). Audit pertama mencakup 46 route; tujuh halaman sisa
(pertanahan, cetak peta, cetak faktur, halaman statis, detail suplemen,
verifikasi token, dan permohonan kiosk) diperiksa terpisah. Tema aktif saat
audit: `esensi`.

Hasil akhir: 0 overflow horizontal, 0 gambar gagal dimuat, 0 error tak terduga,
dan tepat satu `h1` per halaman. `/desa/anjungan/permohonan` tetap 404 tanpa
sesi kiosk—itu gerbang akses, bukan cacat halaman. Slug/token palsu menampilkan
404/keadaan tidak ditemukan yang benar; detail suplemen dengan data nyata diuji
E2E.

| Temuan | Halaman | Perbaikan | Bukti |
|---|---|---|---|
| Bilah mobile hanya logo + satu ikon; menu/CTA tidak terlihat | Semua halaman Esensi | Menu berlabel di kiri, CTA "Layanan Mandiri" selalu tampil | `src/themes/esensi/layout.tsx`; screenshot 390 px |
| Banner 1600×620 dipotong di kotak 16:9 | Beranda | Rasio kartu disamakan `1600/620` di Esensi; slider Natra ikut disamakan | `src/themes/esensi/pages/home.tsx`, `src/themes/natra/pages/home.tsx` |
| APBDes tanpa nilai tampil sebagai Rp 0 | `/desa/apbdes` | Keadaan kosong per blok; tabel hanya saat ada nilai; kartu mobile | `src/themes/esensi/pages/apbdes.tsx` |
| Tabel surat terpotong di 390 px | `/desa/surat` | Kartu bertumpuk di bawah `md`, tabel penuh di `md+` | `src/themes/esensi/pages/surat.tsx` |
| Kartu perangkat terlalu tinggi; avatar ke-9 kosong | `/desa/pemerintahan` | Kartu horizontal di mobile; fallback gradasi + inisial dua huruf | `src/themes/esensi/pages/perangkat.tsx` |
| KIA dipaksa 520 px; DPT 6 kolom; SDGs 5 kolom | KIA, DPT, IDM/SDGs | KIA mengikuti lebar; DPT memakai kartu mobile; SDGs publik menyembunyikan Keterangan/Aksi di mobile | halaman KIA/DPT, `src/features/idm/presentation/components/sdgs-table.tsx` |
| `/masuk` tanpa `h1`; lupa/reset sandi menyisakan ruang kosong | Auth publik | `h1` pada nama aplikasi; `min-h-screen` dihapus dari isi halaman | `src/app/(auth)/masuk/page.tsx`, `src/app/(public)/lupa-sandi/page.tsx`, `reset-sandi/page.tsx` |
| Tabel 5–7 kolom terpotong di 390 px; header memakai gaya lepas | `/desa/pertanahan` | Header/kartu tema; kartu bertumpuk di mobile; tabel `md+` | `src/app/(public)/desa/pertanahan/page.tsx`; screenshot 390 px |
| Detail suplemen dan verifikasi token memakai gaya lepas | `/desa/suplemen/[slug]`, `/desa/verifikasi-surat/[token]` | `ThemePageHeader`/`ThemeCard`/`ThemeButton`, tipografi disamakan | halaman masing-masing; E2E `web-publik` detail suplemen |

Bukti akhir: `npm run check` lulus (184 berkas/1.490 test), `npm run build`
lulus (174 halaman), dan E2E build produksi `web-publik` 24/24,
`publik-apbdes` 1/1, `tema` 1/1 (27/27 termasuk setup auth). Audit dijalankan
ulang setelah build final dan melaporkan 53 halaman × 2 lebar tanpa overflow.
URL sisa hanya menampilkan 404/keadaan tidak ditemukan pada alamat yang memang
diuji sebagai tidak valid atau membutuhkan sesi kiosk.

Sisa yang tercatat saat itu: bottom nav mobile, tabel lebar berdata pada
inventaris/triwulan, dan audit visual Natra; ketiganya ditutup di 9.2. Halaman
admin/warga belum masuk cakupan. Baris "Surat E2E Test" yang berulang berasal
dari data uji lokal, bukan cacat tata letak.

## 9.2 Bottom nav, tabel inventaris, dan audit Natra — 11 November 2026

Tiga sisa audit ditutup.

- **Bottom nav mobile.** Komponen bersama `src/themes/nav-bawah.tsx` dipakai
  layout Esensi dan Natra: lima tujuan (Beranda, Profil, APBDes, Layanan,
  Kontak), ikon + label, `aria-current="page"`, padding safe-area, hanya tampil
  di bawah `lg`, dan disembunyikan saat cetak. Layout memberi padding bawah agar
  baris terakhir footer tidak tertutup. E2E membuktikan lima tautan tampil di
  390 px, tautan aktif mengikuti halaman, dan bilah tersembunyi di 1280 px.
- **Inventaris dan triwulan.** Rekap kategori dan daftar barang inventaris
  menjadi kartu bertumpuk di bawah `md`; tabel penuh hanya di `md+`. Komponen
  triwulan memakai pola yang sama. Tampilan inventaris diuji dengan tiga barang
  sementara (3 jenis, 13 unit, Rp 25.000.000): tanpa overflow di 390/1440 px,
  kartu di mobile, tabel di desktop; data uji dihapus setelah tangkapan layar.
  Komponen triwulan belum punya route publik, sehingga perubahan itu adalah
  kesiapan komponen, bukan halaman yang bisa dibuka lewat URL.
- **Natra.** 46 route × 1440/390 px dengan tema Natra aktif: 0 overflow, 0
  gambar rusak, 0 error tak terduga, satu `h1` per halaman. Blok "Kontak Desa"
  ganda di beranda diperbaiki dengan deduplikasi `Set`; judul Sambutan/APBDes
  yang terdesak tautan di 390 px kini bertumpuk di bawah `sm`. Screenshot
  sebelum/sesudah ada di `scratch/audit-natra/`, tema dikembalikan ke Esensi.

Bukti akhir: `npm run check` lulus (184 berkas/1.490 test), `npm run build`
lulus (174 halaman), dan E2E build produksi `web-publik` 25/25,
`publik-apbdes` 1/1, `tema` 1/1, setup auth 1/1 (28/28). Sisa: chart/PDF APBDes,
header anjungan, `next/image`, E2E beranda dengan data keuangan nyata, dan audit
halaman admin/warga.

## 10. Bukti kode yang dirujuk

- `src/themes/esensi/layout.tsx`, `src/themes/natra/layout.tsx`
- `src/themes/nav-bawah.tsx`
- `src/themes/esensi/pages/home.tsx`, `src/themes/natra/pages/home.tsx`
- `src/themes/esensi/pages/apbdes.tsx`, `src/themes/esensi/pages/kontak.tsx`
- `src/themes/esensi/pages/inventaris.tsx`, `src/themes/esensi/pages/triwulan.tsx`
- `src/themes/esensi/theme.css`, `src/themes/natra/theme.css`
- `src/features/publik/domain/theme.ts`
- `src/features/publik/domain/menu.ts`
- `src/features/desa/application/statistik-desa.ts`
- `src/features/kontak/presentation/components/statistik-pengunjung-widget.tsx`
- `src/app/(public)/desa/kesehatan/kia/page.tsx`,
  `src/app/(public)/desa/dpt/page.tsx`,
  `src/app/(public)/desa/pengaduan/page.tsx`,
  `src/app/(public)/desa/anjungan/page.tsx`,
  `src/app/(public)/desa/pertanahan/page.tsx`,
  `src/app/(public)/desa/suplemen/[slug]/page.tsx`,
  `src/app/(public)/desa/verifikasi-surat/[token]/page.tsx`

## 11. Cara memperbarui

1. Catat temuan baru dengan path kode atau URL sumber.
2. Pindahkan pekerjaan yang disetujui ke
   [`../../RENCANA-PENGEMBANGAN.md`](../../RENCANA-PENGEMBANGAN.md).
3. Setelah dikerjakan, catat bukti UI/test di
   [`../../STATUS-MODUL.md`](../../STATUS-MODUL.md) dan perbarui status di sini
   dari "temuan" menjadi "selesai" hanya jika bukti sudah ada.
