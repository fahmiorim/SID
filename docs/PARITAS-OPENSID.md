# Paritas OpenSID — Status per ID

Dokumen ini menyalin **tabel Status per ID (112 ID)** dari [`STATUS-MODUL.md`](./STATUS-MODUL.md) pada
10 November 2026. Katalog kebutuhannya ada di [`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md).
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
| Struktur lengkap; ada E2E interaktif | 73 |
| Struktur lengkap; E2E tidak dirujuk | 18 |
| Struktur terverifikasi | 12 |
| Sebagian | 4 |
| Struktur lengkap; E2E hanya smoke | 2 |
| Struktur terverifikasi; ada E2E interaktif | 2 |
| Struktur lengkap; E2E hanya penolakan | 1 |
| **Total** | **112** |

Tidak ada ID yang dinyatakan selesai penuh. 18 ID belum punya rujukan E2E dan
4 ID berstatus Sebagian; rincian gap ada di kolom terakhir tabel.

## Register per ID

| ID | Status audit | Gap tersisa | Bukti E2E |
|---|---|---|---|
| OS-POP-001 | Struktur lengkap; ada E2E interaktif | Alur CRUD, detail, filter, ekspor CSV, suplemen, DTKS; audit aksesibilitas admin: tautan lewati + `main#konten-utama`, tabel ber-`aria-label`, header kolom `scope="col"`, tombol aksi berlabel | `penduduk` 9 test/9 beraksi |
| OS-POP-002 | Struktur lengkap; ada E2E interaktif | Alur CRUD, pencarian, dan cetak biodata | `penduduk` 9 test (termasuk audit aksesibilitas) |
| OS-POP-003 | Struktur lengkap; ada E2E interaktif | CRUD KK, detail, ubah alamat | `keluarga` 1 test/1 beraksi |
| OS-POP-004 | Struktur lengkap; ada E2E interaktif | CRUD rumah tangga + anggota, laporan rekap | `rtm-dpt` 2 test/2 beraksi |
| OS-POP-005 | Struktur lengkap; ada E2E interaktif | Pemilihan aktif, tolak aktif kedua, filter pemilih, CSV, rekap; **daftar publik tidak lagi memuat NIK dan hanya mencari nama** (redaksi di use case, bukan hanya tampilan) | `penduduk` 9 test (termasuk audit aksesibilitas) + `dpt.test` |
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
| OS-WIL-002 | Struktur lengkap; ada E2E interaktif | Area dibuat merujuk kategori polygon, tampil di legenda peta cetak, keterangan diubah, lalu area/polygon dihapus dan legenda ikut bersih. | `gis-area` 1 test/1 beraksi |
| OS-WIL-003 | Struktur lengkap; ada E2E interaktif | Garis dibuat dari dialog dengan path GeoJSON LineString, keterangan diubah, lalu dihapus; tabel memperbarui tiap langkah. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-004 | Struktur lengkap; ada E2E interaktif | Titik dibuat dengan path GeoJSON Point dan tipe, tipe diubah, lalu dihapus. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-005 | Struktur lengkap; ada E2E interaktif | Layer polygon dibuat dengan warna dan tipe root, warna diubah, lalu dihapus; layer aktif dipakai peta publik. | `gis-layer` 4 test/4 beraksi |
| OS-WIL-006 | Struktur lengkap; ada E2E interaktif | — | `gis-pertanahan` 7 test/1 beraksi |
| OS-WIL-007 | Struktur lengkap; ada E2E interaktif | Peta publik menampilkan layer polygon, garis, dan titik buatan desa; kontrol layer dapat menyembunyikan lalu menampilkan kembali tiap kelompok; peta cetak memuat geometri SVG dan legenda ketiga kelompok. | `web-publik` 23 test |
| OS-WIL-008 | Struktur lengkap; ada E2E interaktif | Simbol dibuat dengan keterangan, keterangan diubah, lalu dihapus dari katalog global. | `gis-layer` 4 test/4 beraksi |
| OS-GOV-001 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-GOV-002 | Struktur lengkap; ada E2E interaktif | — | `pemerintahan` 3 test/2 beraksi |
| OS-GOV-003 | Struktur lengkap; ada E2E interaktif | Perangkat baru dari form admin muncul di bagian pelaksana bagan; bagian Kepala Desa, Sekretariat, dan Perangkat Pelaksana tampil; tombol cetak memanggil `window.print()`. | `pemerintahan` 4 test/3 beraksi |
| OS-GOV-004 | Struktur lengkap; ada E2E interaktif | — | `kelompok-laporan` 3 test/3 beraksi |
| OS-GOV-005 | Struktur lengkap; ada E2E interaktif | — | `kelompok-laporan` 3 test/3 beraksi |
| OS-GOV-006 | Struktur lengkap; ada E2E interaktif | — | `idm` 3 test/16 beraksi |
| OS-GOV-007 | Sebagian | E2E admin + publik ada; kandidat publik memakai data DB, bukan input UI | `pemilihan` 2 test/2 beraksi |
| OS-GOV-008 | Struktur lengkap; ada E2E interaktif | — | `sinergi` 4 test/1 interaktif |
| OS-GOV-009 | Struktur lengkap; ada E2E interaktif | — | `pembangunan-buku` 1 test/1 beraksi |
| OS-GOV-010 | Struktur lengkap; ada E2E interaktif | — | `dokumen-publik` 2 test/2 beraksi |
| OS-SUR-001 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-002 | Sebagian | Unduh PDF per status sudah diuji: surat terbit menampilkan menu `Unduh PDF` dengan berkas `application/pdf` `inline` berawalan `%PDF-`, surat konsep hanya menawarkan Pratinjau. Gap tersisa: notifikasi email perubahan status dan PDF per varian template. | `surat-flow` 7 test/6 interaktif; `permohonan-warga` 5 test/5 interaktif |
| OS-SUR-003 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-004 | Struktur lengkap; ada E2E interaktif | — | `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-005 | Struktur lengkap; ada E2E interaktif | Rekap per jenis surat memuat lima kolom untuk permohonan baru, filter `?status=1` menampilkannya dan `?status=3` menyembunyikannya, serta ekspor CSV membawa filter, NIK pemohon, dan nama jenis. Notifikasi email perubahan status belum diuji karena memerlukan Resend. | `permohonan-rekap` 1 test/1 beraksi; `permohonan-warga` 5 test/5 interaktif |
| OS-SUR-006 | Struktur lengkap; ada E2E interaktif | — | `arsip-nomor-surat` 1 test/1 interaktif; `surat-lengkap` 4 test/4 interaktif |
| OS-SUR-007 | Struktur lengkap; ada E2E interaktif | Pembuat ditolak memverifikasi tahap sekdes/kades; status dicek di DB + badge, nomor surat dan catatan penolakan terlihat pengguna | `verifikasi-berjenjang` 8 test/8 beraksi |
| OS-SUR-008 | Struktur lengkap; ada E2E interaktif | Pemilih "Varian" di halaman cetak mengubah tata letak: potrait `max-w-[210mm]` + `p-10`, landscape `max-w-[297mm]`, compact `p-6`; nomor surat dan kode QR verifikasi ikut tampil. PDF per varian belum diuji. | `surat-cetak-varian` 1 test/1 beraksi; `publik-verifikasi` 3 test/2 interaktif |
| OS-SUR-009 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-011 | Struktur lengkap; ada E2E interaktif | Surat dinas dicatat lewat dialog (nomor, penerima, perihal, isi), ditemukan lewat pencarian, perihal diubah, lalu dihapus dengan konfirmasi. | `surat-dinas` 1 test/1 beraksi |
| OS-SUR-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-SUR-013 | Sebagian | Adapter BSrE diuji server HTTP lokal (PDF langsung/JSON+unduh/nonaktif); verifikasi provider nyata belum. | `tte-server.test.ts` 3 test |
| OS-SUR-014 | Struktur lengkap; ada E2E interaktif | Simpan dan reset pengaturan lampiran per kategori diuji lewat UI; validasi MIME/ukuran, sanitasi nama, dan penyajian berkas aman masih dibuktikan test unit/integrasi (`media.test.ts`, `media-nama.test.ts`), belum lewat E2E. | `pengaturan-lampiran` 1 test/1 beraksi |
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
| OS-OPS-002 | Struktur lengkap; ada E2E interaktif | Dialog "Atur shortcut" berisi pilihan menu dan aturan enam pilihan; penyimpanan berhasil dan kartu shortcut tetap sama setelah beranda dimuat ulang. Pengurutan drag-and-drop belum diautomasi. | `ops-sistem` 9 test/6 beraksi |
| OS-OPS-003 | Struktur lengkap; ada E2E interaktif | Jumlah berita beranda diubah lewat `/pengaturan/aplikasi`, tersimpan, dan terbaca kembali setelah muat ulang; nilai seed dipulihkan di akhir test. | `ops-sistem` 9 test/6 beraksi |
| OS-OPS-004 | Struktur lengkap; ada E2E interaktif | Aktivasi OTP dari halaman profil mengubah status menjadi Aktif, dan penonaktifan mengembalikannya; login dengan kode OTP belum diautomasi karena kode dikirim ke provider. | `ops-sistem` 9 test/6 beraksi |
| OS-OPS-005 | Struktur lengkap; ada E2E interaktif | Pesan kotak masuk (payload webhook) tampil dengan pengirim dan isi, "Tandai dibaca" mengurangi jumlah pesan baru, dan filter kanal `?kanal=email` aktif. Balasan email belum diuji karena memerlukan Resend. | `ops-sistem` 9 test/6 beraksi |
| OS-OPS-006 | Struktur lengkap; ada E2E interaktif | Perubahan pengaturan menghasilkan baris "Ubah pengaturan aplikasi" yang dapat dicari lewat `?q=pengaturan`. | `ops-sistem` 9 test/6 beraksi |
| OS-OPS-007 | Struktur lengkap; ada E2E interaktif | `/api/database/backup?format=sql` menyajikan berkas SQL berisi `CREATE TABLE` dengan `Content-Disposition` `.sql`; restore menolak berkas non-SQL `400` tanpa menyentuh database. Restore berkas valid tetap memerlukan `mysql` di PATH. | `ops-sistem` 9 test/6 beraksi |
| OS-OPS-008 | Struktur lengkap; ada E2E interaktif | Aktivasi ditolak saat env wajib kosong | `plugin` 1 test/1 beraksi |
| OS-OPS-010 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |
| OS-OPS-011 | Struktur lengkap; ada E2E interaktif | Informasi dan dokumen memakai paginasi `page`/`pageSize` (bawaan 20, maksimum 100) serta menolak nilai salah dengan `400`; dokumen mengembalikan `data` array + metadata; inventaris mendukung `search` dan hanya memuat barang desa pemilik host; surat membatasi agenda lewat `limit` dan menyertakan jenis surat; OpenAPI 3.1 memakai origin host dan memuat seluruh jalur; permintaan ke-61 per menit per IP per endpoint ditolak `429`. | `api-publik` 5 test/5 beraksi |
| OS-OPS-012 | Struktur lengkap; E2E tidak dirujuk | Belum ada E2E perilaku | tidak dirujuk |

## Catatan

- ID tanpa rujukan E2E (18): OS-POP-007, OS-POP-010, OS-POP-015, OS-GOV-001, OS-SUR-009, OS-SUR-010, OS-SUR-012, OS-FIN-005, OS-FIN-007, OS-FIN-008, OS-FIN-009, OS-FIN-010, OS-FIN-011, OS-FIN-012, OS-FIN-013, OS-OPS-001, OS-OPS-010, OS-OPS-012.
- ID berstatus Sebagian (4): OS-GOV-007, OS-SUR-002, OS-SUR-013, OS-WGA-009.
- Provider eksternal yang menunggu kredensial: `OS-WGA-009` (WhatsApp/email) dan `OS-SUR-013`
  (BSrE/TTE). Keduanya tetap Sebagian sampai ada bukti pengiriman ke provider nyata;
  pengujian adapter dengan server lokal bukan bukti tersebut.
- Belum ada rujukan E2E tidak sama dengan belum ada test: bukti unit/integrasi per ID tercatat
  di tabel audit `STATUS-MODUL.md`.
