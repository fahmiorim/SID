# Paritas OpenSID — Status per ID

Dokumen ini menyalin **tabel Status per ID (112 ID)** dari [`STATUS-MODUL.md`](./STATUS-MODUL.md) pada
11 November 2026. Katalog kebutuhannya ada di [`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md).
Sumber kebenaran baris adalah `STATUS-MODUL.md`; salinan ini dijaga `src/db/paritas-register.test.ts`
agar setiap ID katalog punya baris di kedua dokumen.

Register historis (57 ✅ / 54 🟡) **tidak dipakai lagi**: dokumen itu ada di
[`arsip/status-sebelum-audit/`](./arsip/status-sebelum-audit/) dan hanya jejak historis.

## Legenda status

Status adalah hasil audit struktur (kode, UI, aksi/use case, otorisasi, keluaran, test), bukan
persentase paritas dan bukan klaim "fitur selesai penuh".

| Status audit | Arti |
|---|---|
| Struktur lengkap; ada E2E interaktif | UI, aksi, dan test ada; minimal satu E2E menjalankan aksi UI |
| Struktur terverifikasi; ada E2E interaktif | Struktur terverifikasi dan E2E-nya berinteraksi |
| Struktur lengkap; E2E hanya penolakan | E2E baru menguji penolakan; jalur sukses belum |
| Struktur lengkap; E2E hanya smoke | E2E hanya memuat halaman/URL tanpa aksi UI |
| Struktur lengkap; E2E tidak dirujuk | UI/aksi/test ada, belum ada E2E yang merujuk ID ini |
| Struktur terverifikasi | Domain/use case/test ada, belum diverifikasi end-to-end lewat UI |
| Sebagian | Ada bagian yang belum lengkap atau menunggu provider/kredensial |

## Ringkasan

| Status audit | Jumlah ID |
|---|---:|
| Struktur lengkap; ada E2E interaktif | 107 |
| Struktur lengkap; E2E tidak dirujuk | 0 |
| Struktur terverifikasi | 0 |
| Sebagian | 3 |
| Struktur lengkap; E2E hanya smoke | 0 |
| Struktur terverifikasi; ada E2E interaktif | 2 |
| Struktur lengkap; E2E hanya penolakan | 0 |
| **Total** | **112** |

Tidak ada ID yang dinyatakan selesai penuh. Tidak ada ID tanpa rujukan E2E;
3 ID berstatus Sebagian, dan rincian gap ada di kolom terakhir tabel.

## Register per ID

| ID | Status audit | Gap tersisa | Bukti E2E |
|---|---|---|---|
| OS-POP-001 | Struktur lengkap; ada E2E interaktif | Alur CRUD, detail, filter, ekspor CSV, suplemen, DTKS; audit aksesibilitas admin: tautan lewati + `main#konten-utama`, tabel ber-`aria-label`, header kolom `scope="col"`, tombol aksi berlabel | `penduduk` 9 test/9 beraksi |
| OS-POP-002 | Struktur lengkap; ada E2E interaktif | Alur CRUD, pencarian, dan cetak biodata | `penduduk` 9 test (termasuk audit aksesibilitas) |
| OS-POP-003 | Struktur lengkap; ada E2E interaktif | CRUD KK, detail, ubah alamat | `keluarga` 1 test/1 beraksi |
| OS-POP-004 | Struktur lengkap; ada E2E interaktif | CRUD rumah tangga + anggota, laporan rekap | `rtm-dpt` 2 test/2 beraksi |
| OS-POP-005 | Struktur lengkap; ada E2E interaktif | Pemilihan aktif, tolak aktif kedua, filter pemilih, CSV, rekap; **daftar publik tidak lagi memuat NIK dan hanya mencari nama** (redaksi di use case, bukan hanya tampilan) | `penduduk` 9 test (termasuk audit aksesibilitas) + `dpt.test` |
| OS-POP-006 | Struktur lengkap; ada E2E interaktif | Impor CSV, anggota, detail/status, laporan rekap, dan ekspor daftar sudah E2E | `dtks-impor` 1 test/8 beraksi |
| OS-POP-007 | Struktur lengkap; ada E2E interaktif | — | `suplemen-data` 1 test/1 beraksi: definisi dan keterangan diubah, penduduk terdata dengan isian dinamis, CSV memuat kolom, impor CSV menambah sasaran, cetak tersedia, hapus membersihkan data |
| OS-POP-008 | Struktur lengkap; ada E2E interaktif | Posyandu, KIA, ibu hamil, anak, ekspor CSV | `kesehatan` 2 test/1 beraksi |
| OS-POP-010 | Struktur lengkap; ada E2E interaktif | — | `statistik-penduduk` 1 test/1 beraksi: filter dusun/umur mengubah total dan gender, kategori rentan, ekspor CSV/PDF, laporan kependudukan, rentang umur tambah/ubah/hapus |
| OS-POP-011 | Struktur lengkap; ada E2E interaktif | — | `bantuan-laporan` 3 test/3 beraksi |
| OS-POP-012 | Struktur lengkap; ada E2E interaktif | Impor CSV pada program kosong + impor ulang idempoten | `bantuan-impor-peserta` 1 test/1 beraksi |
| OS-POP-013 | Struktur lengkap; ada E2E interaktif | Peserta program dihitung, filter jenis/sasaran lewat form, CSV/PDF mengikuti filter | `statistik-bantuan` 4 test |
| OS-POP-014 | Struktur lengkap; ada E2E interaktif | — | `pendapat` 2 test/7 beraksi |
| OS-POP-015 | Struktur lengkap; ada E2E interaktif | — | `kontak-grup` 1 test/1 beraksi: lookup NIK mengisi nama (bug `label`/`name` diperbaiki), kontak CRUD dengan tautan telepon/email/Telegram, ekspor CSV, grup + anggota, hapus |
| OS-WIL-001 | Struktur lengkap; ada E2E interaktif | — | `wilayah-pemerintahan` 3 test/1 beraksi |
| OS-WIL-002 | Struktur lengkap; ada E2E interaktif | Area dibuat merujuk kategori polygon, tampil di legenda peta cetak, keterangan diubah, lalu area/polygon dihapus dan legenda ikut bersih. | `gis-area` 1 test/1 beraksi |
| OS-WIL-003 | Struktur lengkap; ada E2E interaktif | Garis dibuat dari dialog dengan path GeoJSON LineString, keterangan diubah, lalu dihapus; tabel memperbarui tiap langkah. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-004 | Struktur lengkap; ada E2E interaktif | Titik dibuat dengan path GeoJSON Point dan tipe, tipe diubah, lalu dihapus. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-005 | Struktur lengkap; ada E2E interaktif | Layer polygon dibuat dengan warna dan tipe root, warna diubah, lalu dihapus; layer aktif dipakai peta publik. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-006 | Struktur lengkap; ada E2E interaktif | — | `gis-pertanahan` 7 test/1 beraksi |
| OS-WIL-007 | Struktur lengkap; ada E2E interaktif | Peta publik menampilkan layer polygon, garis, dan titik buatan desa; kontrol layer dapat menyembunyikan lalu menampilkan kembali tiap kelompok; peta cetak memuat geometri SVG dan legenda ketiga kelompok. | `web-publik` 23 test |
| OS-WIL-008 | Struktur lengkap; ada E2E interaktif | Simbol dibuat dengan keterangan, keterangan diubah, lalu dihapus dari katalog global. | `gis-layer` 4 test/4 beraksi |
| OS-GOV-001 | Struktur lengkap; ada E2E interaktif | Formulir `/pengaturan/desa` mengubah kepala desa, NIP, alamat, email, telepon, dan website; unggahan tanda tangan/stempel tersimpan; nilai terbaca ulang dan tampil di `/desa/kontak`; email `a@b` ditolak tanpa mengubah data. | `identitas-desa` 1 test/1 beraksi |
| OS-GOV-002 | Struktur lengkap; ada E2E interaktif | — | `pemerintahan` 3 test/2 beraksi |
| OS-GOV-003 | Struktur lengkap; ada E2E interaktif | Perangkat baru dari form admin muncul di bagian pelaksana bagan; bagian Kepala Desa, Sekretariat, dan Perangkat Pelaksana tampil; tombol cetak memanggil `window.print()`. | `pemerintahan` 4 test/3 beraksi |
| OS-GOV-004 | Struktur lengkap; ada E2E interaktif | — | `kelompok-laporan` 3 test/3 beraksi |
| OS-GOV-005 | Struktur lengkap; ada E2E interaktif | — | `kelompok-laporan` 3 test/3 beraksi |
| OS-GOV-006 | Struktur lengkap; ada E2E interaktif | — | `idm` 3 test/16 beraksi |
| OS-GOV-007 | Struktur lengkap; ada E2E interaktif | Pemilihan dan dua kandidat dibuat lewat UI; publik menampilkan kandidat, 10 suara sah, dan pemenang | `pemilihan` 2 test/8 beraksi |
| OS-GOV-008 | Struktur lengkap; ada E2E interaktif | — | `sinergi` 4 test/1 interaktif |
| OS-GOV-009 | Struktur lengkap; ada E2E interaktif | — | `pembangunan-buku` 1 test/1 beraksi |
| OS-GOV-010 | Struktur lengkap; ada E2E interaktif | — | `dokumen-publik` 2 test/2 beraksi |
| OS-SUR-001 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-002 | Sebagian | Unduh PDF per status diuji; `?varian=` kini mengubah badan surat dan orientasi PDF (potrait/landscape/compact). Gap tersisa: notifikasi email perubahan status tanpa provider. | `surat-flow` 7 test/6 interaktif; `permohonan-warga` 5 test/5 interaktif; `surat-cetak-varian` 1 test |
| OS-SUR-003 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-004 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-005 | Struktur lengkap; ada E2E interaktif | Rekap per jenis surat memuat lima kolom untuk permohonan baru, filter `?status=1` menampilkannya dan `?status=3` menyembunyikannya, serta ekspor CSV membawa filter, NIK pemohon, dan nama jenis. Notifikasi email perubahan status belum diuji karena memerlukan Resend. | `permohonan-rekap` 1 test/1 beraksi; `permohonan-warga` 5 test/5 interaktif |
| OS-SUR-006 | Struktur lengkap; ada E2E interaktif | — | `arsip-nomor-surat` 1 test/1 interaktif; `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-007 | Struktur lengkap; ada E2E interaktif | Pembuat ditolak memverifikasi tahap sekdes/kades; status dicek di DB + badge, nomor surat dan catatan penolakan terlihat pengguna | `verifikasi-berjenjang` 8 test/8 beraksi |
| OS-SUR-008 | Struktur lengkap; ada E2E interaktif | Pemilih "Varian" mengubah tata letak cetak: potrait `max-w-[210mm]` + `p-10`, landscape `max-w-[297mm]`, compact `p-6`; nomor surat dan kode QR tetap tampil. PDF mengikuti `?varian=` dan ukuran halaman potrait/landscape/compact sudah diuji. | `surat-cetak-varian` 1 test/1 beraksi; `publik-verifikasi` 3 test/2 interaktif |
| OS-SUR-009 | Struktur lengkap; ada E2E interaktif | Surat masuk dicatat lewat dialog, ditemukan lewat pencarian, diberi disposisi (instruksi, penerima, batas waktu) yang dicek ulang di DB, dan daftar dapat dicetak. Dialog disposisi kini menutup setelah simpan berhasil. | `disposisi-ekspedisi-agenda` 1 test/1 beraksi |
| OS-SUR-010 | Struktur lengkap; ada E2E interaktif | Surat keluar dicatat lewat dialog, ditemukan lewat pencarian, dicatat ekspedisinya (tanggal, penerima, cara kirim) yang dicek ulang di DB, dan daftar dapat dicetak. Dialog ekspedisi kini menutup setelah simpan berhasil. | `disposisi-ekspedisi-agenda` 1 test/1 beraksi |
| OS-SUR-011 | Struktur lengkap; ada E2E interaktif | Surat dinas dicatat lewat dialog (nomor, penerima, perihal, isi), ditemukan lewat pencarian, perihal diubah, lalu dihapus dengan konfirmasi. | `surat-dinas` 1 test/1 beraksi |
| OS-SUR-012 | Struktur lengkap; ada E2E interaktif | Buku Agenda (A6) dan Ekspedisi (A7) membaca langsung surat masuk/keluar tanpa penyalinan manual; cetak/ekspor tanpa parameter hanya surat masuk, `jenis=keluar` hanya surat keluar. Halaman `/persuratan/log-surat` menampilkan disposisi/ekspedisi dengan nomor, perihal, asal/tujuan, catatan, filter jenis, dan pencarian. | `agenda-log-surat` 1 test/1 beraksi |
| OS-SUR-013 | Sebagian | Adapter BSrE diuji server HTTP lokal (PDF langsung/JSON+unduh/nonaktif); verifikasi provider nyata belum. | `tte-server.test.ts` 3 test |
| OS-SUR-014 | Struktur lengkap; ada E2E interaktif | Simpan/reset pengaturan diuji; unggahan `text/html` dan berkas di atas batas ukuran ditolak lewat UI. Nama berkas traversal `../../laporan.php.pdf` tersimpan sebagai `<desa>/surat/<cap>-laporan-php.pdf`; ekstensi mengikuti MIME, bukan nama kiriman. | `pengaturan-lampiran` 1 test/1 beraksi; `disposisi-ekspedisi-agenda` 1 test/40 beraksi |
| OS-FIN-001 | Struktur lengkap; ada E2E interaktif | Pagu/realisasi APBDes tersimpan | `keuangan` 5 test/5 beraksi |
| OS-FIN-002 | Struktur lengkap; ada E2E interaktif | Laporan + filter bidang | `keuangan` 5 test/5 beraksi |
| OS-FIN-003 | Struktur lengkap; ada E2E interaktif | Realisasi triwulan tersimpan | `keuangan` 5 test/5 beraksi |
| OS-FIN-004 | Struktur lengkap; ada E2E interaktif | Impor PDF, unduh, penyerahan, duplikat, hapus, serta ekspor CSV dan Excel laporan sudah E2E | `keuangan-lanjutan` 2 test/21 beraksi |
| OS-FIN-005 | Struktur lengkap; ada E2E interaktif | CRUD SiLPA; jumlah satu tahun dijumlahkan dan ditulis ke rekening pembiayaan 6.1.1 APBDes tahun yang sama; perubahan dan penghapusan memperbarui APBDes serta laporan realisasi resmi. | `sisa-lebih-antartahun` 1 test/1 beraksi; CRUD di `keuangan` |
| OS-FIN-006 | Struktur lengkap; ada E2E interaktif | Pagu, realisasi, triwulan, dan daftar dokumen APBDes yang diserahkan tampil di `/desa/apbdes`; dokumen dapat diunduh publik | `keuangan-lanjutan` 2 test/23 beraksi |
| OS-FIN-007 | Struktur lengkap; ada E2E interaktif | Kategori golongan "Peralatan & Mesin" dibuat lewat dialog, dipakai barang bernilai Rp 4.500.000, muncul di laporan terfilter dan neraca, serta tidak dapat dihapus selama masih dipakai. | `inventaris-aset` 2 test/2 beraksi |
| OS-FIN-008 | Struktur lengkap; ada E2E interaktif | Mutasi pindah lokasi diajukan lewat UI, disetujui operator → sekdes → kades, lalu lokasi barang benar-benar berubah dan baris menjadi Disetujui; toast tahap akhir tidak lagi hilang karena komponen aksi unmount. | `inventaris-aset` 2 test/2 beraksi |
| OS-FIN-009 | Struktur lengkap; ada E2E interaktif | Item buku administrasi ditambahkan lewat dialog, diubah, lalu tampil di halaman cetak resmi buku yang sama. | `bumindes-buku` 1 test/1 beraksi |
| OS-FIN-010 | Struktur lengkap; ada E2E interaktif | Sinkronisasi penduduk membuat item B1–B5 (bukan hanya memperbarui item lama); angka B1/B2/B4/B5 dibandingkan dengan tabel sumber; B3 memuat hitungan mutasi dan tercetak sebagai buku resmi. | `bumindes-penduduk` 1 test/1 beraksi |
| OS-FIN-011 | Struktur lengkap; ada E2E interaktif | Persil dan mutasi tanah kas tampil di daftar, halaman cetak ber-kop, dan CSV resmi; mutasi cetak memuat nomor persil. | `bumindes-tanah` 1 test/1 beraksi |
| OS-FIN-012 | Struktur lengkap; ada E2E interaktif | Kegiatan pembangunan dan kader tampil di daftar, halaman cetak, dan CSV; keduanya memakai tabel buku administrasi, bukan proyek publik. | `bumindes-pembangunan` 1 test/1 beraksi |
| OS-FIN-013 | Struktur lengkap; ada E2E interaktif | Peraturan, aparat, agenda masuk, dan ekspedisi tampil di buku; cetak agenda hanya memuat surat masuk, cetak ekspedisi hanya surat keluar, dan CSV mengikuti pemisahan yang sama. | `bumindes-sekretariat` 1 test/1 beraksi |
| OS-WEB-001 | Struktur lengkap; ada E2E interaktif | Header publik berisi tujuh menu bergrup (Beranda, Profil, Informasi, Transparansi, Potensi, Partisipasi, Kontak); dropdown Informasi terbuka saat hover dan tautannya dapat diklik; grup aktif ditandai `aria-current`; bilah kontak (email) tampil; akses cepat beranda (Layanan Surat, APBDes, Statistik, Lapak Desa) tersedia; footer empat kolom berisi identitas, Jelajahi, Transparansi, dan Kontak; tautan "Lewati ke konten utama" + `main#konten-utama` dapat difokuskan. | `web-publik` 23 test/10 beraksi |
| OS-WEB-002 | Struktur lengkap; ada E2E interaktif | Filter kategori aktif ditandai `aria-current`; sampul kartu `alt=""` agar nama tautan tidak diumumkan ganda | `web-berita-galeri` 3 test/2 beraksi |
| OS-WEB-003 | Struktur lengkap; ada E2E interaktif | Profil menampilkan identitas wilayah, visi, dan misi dari data desa; pemerintahan menampilkan perangkat aktif beserta jabatannya dan bagan SOTK (kepala, sekretaris, staf). | `web-publik` 23 test/11 beraksi |
| OS-WEB-004 | Struktur lengkap; ada E2E interaktif | Album, detail, dan cetak album; sampul dekoratif, foto tanpa judul tidak lagi meminjam nama album sebagai `alt` | `web-berita-galeri` 3 test/2 beraksi |
| OS-WEB-005 | Struktur lengkap; ada E2E interaktif | Dokumen dibuat, difilter, dicari, dan sematan sandbox | `web-dokumen` 1 test/1 beraksi |
| OS-WEB-006 | Struktur lengkap; ada E2E interaktif | Statistik publik memuat kependudukan, bantuan, keuangan, dan realisasi triwulan; sebaran dusun dan unduhan `/desa/statistik/ekspor` (`text/csv`, `Content-Disposition` `statistik-*.csv`) hanya memuat dusun desa pemilik host, tanpa dusun desa lain dan tanpa data pribadi. | `web-publik` 23 test/11 beraksi |
| OS-WEB-007 | Struktur lengkap; ada E2E interaktif | Peta interaktif menampilkan layer polygon (area), garis, dan titik buatan desa; kontrol layer memuat ketiga kelompok, masing-masing dapat disembunyikan/ditampilkan kembali; peta cetak memuat geometri SVG dan legenda area, "Garis / Jalan", serta "Titik Lokasi". Peta ber-`role="region"` dengan label desa; ikon marker memakai aset bundling `/_next/static/media/` (bukan path halaman yang 404) dan terbukti termuat. | `web-publik` 23 test |
| OS-WEB-008 | Struktur lengkap; ada E2E interaktif | Dua proyek berbeda tahun tampil di halaman publik; filter tahun lewat pilihan + "Terapkan" hanya menampilkan proyek tahun itu; "Semua tahun" (parameter tahun kosong) mengembalikan daftar penuh, dan tahun tidak valid jatuh ke semua tahun. | `pembangunan-buku` 1 test/1 beraksi |
| OS-WEB-009 | Struktur lengkap; ada E2E interaktif | — | `pengaduan` 1 test/1 beraksi; `umpan-balik` 2 test/2 beraksi |
| OS-WEB-020 | Struktur lengkap; ada E2E interaktif | Agenda kegiatan bersumber dari `agenda_kegiatan` dengan status tayang eksplisit; draf tidak tampil di `/desa/agenda` maupun beranda; admin menambah agenda lewat `/konten/agenda` | `agenda-publik` 1 test/1 beraksi; `agenda.test` 7 test |
| OS-WEB-010 | Struktur lengkap; ada E2E interaktif | Kelompok uji beserta anggota tampil di `/desa/kelompok`; "Daftar anggota (1)" membuka daftar publik; tombol "Cetak daftar anggota" benar-benar memanggil `window.print()` (dipalsukan di test untuk membuktikan pemanggilan). | `kelompok-laporan` 3 test/1 beraksi |
| OS-WEB-011 | Struktur lengkap; ada E2E interaktif | Filter kata kunci lewat formulir menampilkan pesan hasil; ekspor CSV mengikuti filter yang sama (`text/csv` + `Content-Disposition`); barang desa lain tidak tampil di daftar maupun CSV. | `web-publik` 23 test/11 beraksi |
| OS-WEB-012 | Struktur terverifikasi; ada E2E interaktif | Daftar dan detail suplemen tampil dengan sasaran serta jumlah data; hanya nama kolom isian yang dipublikasikan, nilai isian tidak; slug yang sudah dihapus 404. | `web-publik` 23 test/11 beraksi |
| OS-WEB-013 | Struktur lengkap; ada E2E interaktif | Rekap publik per pertanyaan (distribusi pilihan, rata-rata angka, jumlah jawaban teks tanpa isi), jumlah soal/responden, dan filter periode tahun; nama/NIK responden serta isi jawaban teks tidak tampil; survei desa lain tidak muncul dan `/isi` desa lain 404. | `web-publik` 23 test/11 beraksi |
| OS-WEB-014 | Struktur lengkap; ada E2E interaktif | Katalog publik menampilkan lapak hasil pencarian, jumlah produk, tautan produk; halaman peta menampilkan produk berkoordinat di peta Leaflet. | `web-publik` 23 test/11 beraksi |
| OS-WEB-015 | Struktur lengkap; ada E2E interaktif | — | `umpan-balik` 2 test/2 beraksi |
| OS-WEB-016 | Struktur lengkap; ada E2E interaktif | — | `tema` 1 test/1 beraksi |
| OS-WEB-017 | Struktur lengkap; ada E2E interaktif | Opsi warna primer/sekunder, tipografi (bawaan sistem, sans-serif, serif, dan **Atkinson Hyperlegible** sebagai bawaan), kelengkungan sudut, gaya header, judul/tombol hero, teks berjalan, dan sosmed tersimpan setelah muat ulang serta terpakai di situs publik (`--pub-primary`, `--pub-primary-text`, `--pub-secondary`, `--pub-radius`, `--pub-font`, header berwarna, tombol hero); nilai awal dipulihkan. | `tema` 1 test/1 beraksi; `theme.test` 21 test |
| OS-WEB-018 | Struktur lengkap; ada E2E interaktif | Sitemap memakai origin host untuk setiap `<loc>`, memuat halaman turunan dan produk lapak dinamis, serta tidak memuat rute admin dan tidak mengulang `<loc>` yang sama; robots menolak area privat termasuk `/layanan-mandiri` dan menunjuk sitemap host; setiap halaman publik punya title/description dan OG title/description yang sama, OG image absolut per host yang benar-benar terunduh sebagai PNG 1200×630. | `sitemap` 3 test/3 beraksi |
| OS-WEB-019 | Struktur lengkap; ada E2E interaktif | Form token (jalur kode QR) mengalihkan ke halaman token publik; token valid 64 hex menampilkan jenis, nomor, dan status surat; token berformat salah maupun token yang sudah dihapus menampilkan "Surat Tidak Ditemukan" tanpa membocorkan data. | `publik-verifikasi` 3 test/2 beraksi |
| OS-WGA-001 | Struktur lengkap; ada E2E interaktif | Registrasi mandiri, captcha, persetujuan admin, dan PIN sementara sudah E2E; OTP/email belum E2E | `warga-mandiri` 2 test/41 beraksi |
| OS-WGA-002 | Struktur lengkap; ada E2E interaktif | Login captcha, sesi, validasi konfirmasi, ubah PIN, dan login dengan PIN baru sudah E2E; OTP/rate limit unit/integrasi | `warga-mandiri` 2 test/41 beraksi |
| OS-WGA-003 | Struktur lengkap; ada E2E interaktif | Beranda menampilkan identitas dan tiga kartu ringkasan; tautan Profil membuka data warga dan username | `warga-mandiri` 2 test/41 beraksi |
| OS-WGA-004 | Struktur lengkap; ada E2E interaktif | Pembatalan oleh warga sebelum diambil, alasan wajib | `permohonan-warga` 5 test/5 beraksi |
| OS-WGA-005 | Struktur lengkap; ada E2E interaktif | — | `permohonan-warga` 5 test/5 interaktif |
| OS-WGA-006 | Struktur lengkap; ada E2E interaktif | Warga mengirim pesan; operator membuka percakapan dan membalas lewat `/pesan-warga` | `warga-mandiri` 2 test/41 beraksi |
| OS-WGA-007 | Struktur lengkap; ada E2E interaktif | Token valid menampilkan surat terbit; token tidak dikenal menampilkan pesan tidak ditemukan | `warga-mandiri` 2 test/41 beraksi |
| OS-WGA-008 | Struktur lengkap; ada E2E interaktif | Program aktif dan selesai yang menautkan warga tampil; program tanpa peserta tidak bocor | `bantuan-warga` 1 test/1 beraksi |
| OS-WGA-009 | Sebagian | Adapter WhatsApp diuji server HTTP lokal (lewati tanpa env, sukses, HTTP 500, DB gagal); kredensial provider nyata belum. | `kirim-notifikasi.test.ts` 4 test |
| OS-WGA-010 | Struktur lengkap; ada E2E interaktif | Lapak ditambah, alamat diubah, tampil di katalog publik, lalu dihapus | `warga-mandiri` 2 test/41 beraksi |
| OS-WGA-011 | Struktur lengkap; ada E2E interaktif | Warga mengajukan izin; operator menyetujui lewat `/kehadiran/izin` dan status berubah menjadi Disetujui | `warga-mandiri` 2 test/41 beraksi |
| OS-ANA-001 | Struktur lengkap; ada E2E interaktif | Kategori analisis CRUD | `analisis-survei` 8 test/4 beraksi |
| OS-ANA-002 | Struktur lengkap; ada E2E interaktif | Indikator dibuat dengan kode, nama, dan bobot 50 lalu dihapus | `analisis-survei` 8 test/4 beraksi |
| OS-ANA-003 | Struktur lengkap; ada E2E interaktif | Survei dibuat dengan sasaran dan periode, status `Aktif` tampil di daftar | `analisis-survei` 8 test/4 beraksi |
| OS-ANA-004 | Struktur lengkap; ada E2E interaktif | Laporan skor menampilkan responden, rata-rata skor, distribusi klasifikasi, dan skor per responden; CSV memuat responden; ID tidak valid ditolak `400` | `analisis-survei` 8 test/4 beraksi |
| OS-ANA-005 | Struktur lengkap; ada E2E interaktif | Token embed dari halaman admin dipakai `POST` ke endpoint eksternal; respons `201` dan responden tampil di rekap; tanpa token tetap `401` | `analisis-survei` 8 test |
| OS-ANA-006 | Struktur lengkap; ada E2E interaktif | — | `analisis-survei` 8 test/4 beraksi; `survei-publik` 2 test/1 beraksi |
| OS-MOD-001 | Struktur lengkap; ada E2E interaktif | CRUD, aktif/nonaktif, hapus, isolasi tenant, login NIK/tanggal lahir, pengajuan surat, nomor antrian, dan gerbang perangkat tanpa izin sudah diuji. Alamat printer perangkat tampil sebagai tujuan pada bukti cetak kiosk dan tombol Cetak bukti memanggil `window.print`; cetak langsung ke IP tetap memerlukan print bridge. | `anjungan` 2 test/2 beraksi; integrasi tenant; unit anjungan 31 |
| OS-MOD-002 | Struktur lengkap; ada E2E interaktif | Buku tamu ditambah, keperluan diubah, lalu dihapus lewat UI | `modul-tambahan` 2 test |
| OS-MOD-003 | Struktur lengkap; ada E2E interaktif | Kehadiran dicatat/dihapus lewat UI, rekap difilter bulan/tahun, angka dan CSV diperiksa; daftar perangkat kini dikirim ke dialog | `modul-tambahan` 2 test |
| OS-MOD-004 | Struktur lengkap; ada E2E interaktif | — | `lapak-keranjang` 1 test/1 interaktif |
| OS-MOD-005 | Struktur terverifikasi; ada E2E interaktif | Unduhan menyajikan PDF `inline`; ID tidak valid 400, pelanggan desa lain 404, akun warga 403, dan permintaan tanpa sesi dialihkan ke `/masuk`. | `pelanggan-kerjasama` 3 test/1 interaktif |
| OS-OPS-001 | Struktur lengkap; ada E2E interaktif | CRUD modul lewat UI; grup baru diberi izin baca modul anak, pengguna baru dibuat lalu login, menu induk Pengaturan muncul karena pewarisan, dan modul tanpa izin menampilkan “Akses ditolak”. Bug parser key izin 3-bagian diperbaiki. | `pengguna-grup-akses` 2 test/2 beraksi; unit permission 10 |
| OS-OPS-002 | Struktur lengkap; ada E2E interaktif | Dialog "Atur shortcut" berisi pilihan menu dan aturan enam pilihan; drag-and-drop diuji mengubah urutan, urutan disimpan lewat hidden input sesuai hasil seret, dan kartu tetap sama setelah beranda dimuat ulang. | `ops-sistem` 10 test/7 beraksi |
| OS-OPS-003 | Struktur lengkap; ada E2E interaktif | Jumlah berita beranda diubah lewat `/pengaturan/aplikasi`, tersimpan, dan terbaca kembali setelah muat ulang; nilai seed dipulihkan di akhir test. | `ops-sistem` 10 test/7 beraksi |
| OS-OPS-004 | Struktur lengkap; ada E2E interaktif | Aktivasi OTP dari halaman profil mengubah status menjadi Aktif, login dengan kode OTP fixture berhasil membuat sesi, dan penonaktifan mengembalikannya. Pengiriman kode lewat provider tetap belum diuji. | `ops-sistem` 10 test/7 beraksi |
| OS-OPS-005 | Struktur lengkap; ada E2E interaktif | Pesan kotak masuk (payload webhook) tampil dengan pengirim dan isi, "Tandai dibaca" mengurangi jumlah pesan baru, dan filter kanal `?kanal=email` aktif. Balasan email belum diuji karena memerlukan Resend. | `ops-sistem` 10 test/7 beraksi |
| OS-OPS-006 | Struktur lengkap; ada E2E interaktif | Perubahan pengaturan menghasilkan baris "Ubah pengaturan aplikasi" yang dapat dicari lewat `?q=pengaturan`. | `ops-sistem` 10 test/7 beraksi |
| OS-OPS-007 | Struktur lengkap; ada E2E interaktif | `/api/database/backup?format=sql` menyajikan berkas SQL berisi `CREATE TABLE` dengan `Content-Disposition` `.sql`; restore menolak berkas non-SQL `400` tanpa menyentuh database, dan restore SQL valid dijalankan `mysql` lalu verifikasi skema serta redirect `restored=1` dibuktikan. `mysql` tetap harus ada di PATH server. | `ops-sistem` 10 test/7 beraksi |
| OS-OPS-008 | Struktur lengkap; ada E2E interaktif | Aktivasi ditolak saat env wajib kosong | `plugin` 1 test/1 beraksi |
| OS-OPS-010 | Struktur lengkap; ada E2E interaktif | Unggah logo PNG lewat `/pengaturan/desa` tersimpan di kategori `umum`; route publik menyajikan `image/png` + `nosniff` + cache immutable, menolak host desa lain dan kategori `permohonan` (404) meski berkas privat ada di disk, serta menyandbox SVG dengan CSP. Unggah `text/html` ditolak dan logo lama tetap. Lampiran pengaduan privat menolak warga (403) dan tamu (401). | `media-unggah-akses` 2 test/2 beraksi |
| OS-OPS-011 | Struktur lengkap; ada E2E interaktif | Informasi dan dokumen memakai paginasi `page`/`pageSize` (bawaan 20, maksimum 100) serta menolak nilai salah dengan `400`; dokumen mengembalikan `data` array + metadata; inventaris mendukung `search` dan hanya memuat barang desa pemilik host; surat membatasi agenda lewat `limit` dan menyertakan jenis surat; OpenAPI 3.1 memakai origin host dan memuat seluruh jalur; permintaan ke-61 per menit per IP per endpoint ditolak `429`. | `api-publik` 5 test/5 beraksi |
| OS-OPS-012 | Struktur lengkap; ada E2E interaktif | Dua API key desa berbeda di-scope lewat hash; `POST /api/eksternal/surat` membuat permohonan di desa kunci (villageId klien diabaikan) dan mencatat audit; OpenAPI 3.1 memuat semua jalur; verifikasi token lewat GET/POST berhasil dan kunci desa lain 404; TTE menolak non-PDF 415. Provider TTE nyata belum diuji. | `api-eksternal` 2 test/2 beraksi |

## Catatan

- ID tanpa rujukan E2E (0): tidak ada.
- ID berstatus Sebagian (3): OS-SUR-002, OS-SUR-013, OS-WGA-009.
- Provider eksternal yang menunggu kredensial: `OS-WGA-009` (WhatsApp/email) dan `OS-SUR-013`
  (BSrE/TTE). Keduanya tetap Sebagian sampai ada bukti pengiriman ke provider nyata;
  pengujian adapter dengan server lokal bukan bukti tersebut.
- Belum ada rujukan E2E tidak sama dengan belum ada test: bukti unit/integrasi per ID tercatat
  di tabel audit `STATUS-MODUL.md`.
