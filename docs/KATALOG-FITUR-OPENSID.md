# Katalog Fitur OpenSID — Baseline Paritas Lengkap

Dokumen ini adalah **katalog kebutuhan**, bukan laporan status. Tujuannya memastikan
setiap fitur yang terlihat di source OpenSID lokal memiliki tempat di rencana
pembangunan SID versi ini.

## Sumber dan batasan

Sumber pembanding yang dipakai:

- `/home/super/Projects/opensid/donjo-app/controllers/`
- `/home/super/Projects/opensid/donjo-app/controllers/fweb/`
- `/home/super/Projects/opensid/donjo-app/controllers/fmandiri/`
- `/home/super/Projects/opensid/donjo-app/controllers/internal_api/`
- `/home/super/Projects/opensid/donjo-app/controllers/external_api/`
- `/home/super/Projects/opensid/donjo-app/controllers/buku_umum/`
- `/home/super/Projects/opensid/resources/views/admin/`
- `/home/super/Projects/opensid/Modules/`
- `/home/super/Projects/opensid/storage/app/themes/`

OpenSID berlisensi GPL v3. Katalog ini hanya mencatat perilaku, alur, batasan,
dan keluaran yang perlu dipahami. **Kode, aset, template, dan source OpenSID
MUST NOT disalin.** Implementasi SID tetap orisinal dengan Next.js, TypeScript,
Drizzle, Server Actions, dan pola di `docs/ARCHITECTURE.md`.

Katalog mengikuti source lokal yang tersedia saat dokumen ini dibuat. Bila source
OpenSID diperbarui, lakukan inventaris ulang sebelum mengubah status paritas.

## Cara membaca status

- Status implementasi terkini hanya dicatat di
  [`PARITAS-OPENSID.md`](./PARITAS-OPENSID.md).
- Katalog ini mendefinisikan **cakupan yang wajib dipetakan**; baris tanpa status
  berarti bukan berarti sudah selesai.
- `OS-xxx` adalah ID stabil untuk issue, milestone, test, dan review.
- Register status awal `⚪` di `PARITAS-OPENSID.md` berarti ID sudah terdaftar
  tetapi belum direkonsiliasi per bukti; itu bukan klaim fitur belum tersedia.
- Fitur premium, modul tambahan, API, dan integrasi tetap masuk katalog. Jika
  perilaku provider tidak bisa direplikasi tanpa layanan eksternal, implementasi
  memakai adapter dengan mode nonaktif/manual yang terdokumentasi.

## Definition of Done per ID

Sebuah ID baru boleh diberi status penuh hanya jika kebutuhan yang relevan sudah
memiliki:

- domain rule, skema, migrasi, dan seed/reference bila diperlukan;
- application use case dengan otorisasi dan tenant scoping;
- repository/infrastructure sesuai batas lapisan;
- UI admin, publik, atau warga sesuai sumbernya;
- cetak, PDF, ekspor, impor, atau unggah bila sumber memilikinya;
- alur sukses, validasi, error, status transition, dan isolasi tenant yang diuji;
- route/menu/RBAC yang benar-benar tersambung;
- dokumentasi status di `PARITAS-OPENSID.md`.

Fitur hanya berupa schema, use case, route kosong, placeholder, atau mockup
belum memenuhi Definition of Done.

---

## A. Kependudukan, keluarga, dan sosial

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-POP-001 | Penduduk: CRUD, pencarian, filter lanjutan, pagination, detail, cetak, dan ekspor | `Penduduk.php`, `views/admin/penduduk/` |
| OS-POP-002 | Riwayat penduduk: lahir, mati, pindah, datang, perubahan status dasar, dan cetak | `Penduduk_log.php`, `views/admin/penduduk_log/` |
| OS-POP-003 | Keluarga/KK: anggota, kepala keluarga, perubahan anggota, riwayat, cetak KK | `Keluarga.php`, `AnggotaKeluarga.php` |
| OS-POP-004 | Rumah tangga/RTM: kelas sosial, BDT, anggota, filter, dan laporan | `Rtm.php`, `views/admin/penduduk/rtm/` |
| OS-POP-005 | DPT: pemutakhiran pemilih, pencarian, rekap, cetak, dan daftar publik | `Dpt.php`, `fweb/Dpt.php` |
| OS-POP-006 | DTKS: data terpadu, impor, anggota, detail, dan laporan | `Dtks.php`, `views/admin/dtks/` |
| OS-POP-007 | Data suplemen: definisi jenis, isian, pendataan, impor, detail, cetak | `Suplemen.php`, `fweb/Suplemen.php` |
| OS-POP-008 | Stunting: KIA, ibu hamil, pemantauan anak, skor, rekap, dan cetak | `Stunting.php`, `Stunting_rekapitulasi.php`, `fweb/Stunting.php` |
| OS-POP-009 | Vaksin/Covid: pendataan, status, rekap, dan publikasi yang relevan | `Vaksin_covid.php`, `Covid19.php`, `fweb/Vaksin.php` |
| OS-POP-010 | Rentang umur, statistik penduduk, statistik rentan, dan laporan periodik | `Rentang_umur.php`, `Statistik.php`, `Laporan_penduduk.php`, `Laporan_rentan.php` |
| OS-POP-011 | Program bantuan: definisi program, sasaran, periode, asal dana, dan status | `Program_bantuan.php` |
| OS-POP-012 | Peserta bantuan: penduduk/KK/RTM, kartu peserta, pembersihan, impor, ekspor, cetak | `Peserta_bantuan.php`, `BantuanPeserta.php` |
| OS-POP-013 | Statistik bantuan per program, wilayah, periode, dan kategori sasaran | `Statistik_bantuan.php` |
| OS-POP-014 | Pendapat warga dan jajak pendapat | `Pendapat.php`, `fweb/` terkait |
| OS-POP-015 | Daftar kontak penduduk/kelompok untuk komunikasi administratif | `daftar_kontak/`, `grup_kontak/` |

## B. Wilayah, peta, dan pertanahan

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-WIL-001 | Dusun, RW, RT: CRUD, hierarki, kode, rekap, dan cetak | `Wilayah.php`, `fweb/WilayahAdministratif.php` |
| OS-WIL-002 | GIS area: pembuatan, ubah, hapus, metadata, dan peta | `Area.php`, `fweb/Peta.php` |
| OS-WIL-003 | GIS garis/jalan: geometri, atribut, tampilan, dan cetak | `Line.php`, `fweb/Peta.php` |
| OS-WIL-004 | GIS titik/lokasi: koordinat, simbol, atribut, dan tampilan publik | `Point.php`, `Simbol.php`, `fweb/Peta.php` |
| OS-WIL-005 | GIS polygon/batas: geometri, layer, dan publikasi | `Polygon.php`, `fweb/Peta.php` |
| OS-WIL-006 | Data persil, Cdesa, rincian, dan mutasi tanah | `internal_api/*`, `views/admin/pertanahan/` |
| OS-WIL-007 | Peta kantor, peta wilayah administratif, dan layer batas desa/dusun | `views/admin/wilayah/`, `views/admin/gis/` |
| OS-WIL-008 | Referensi simbol peta dan konfigurasi visual GIS | `Simbol.php`, `views/admin/simbol/` |

## C. Pemerintahan dan tata kelola desa

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-GOV-001 | Identitas desa, kepala desa, alamat, kontak, logo, tanda tangan, dan stempel | `Setting.php`, `Setting_aplikasi.php`, `Identitas_desa.php` |
| OS-GOV-002 | Perangkat/pamong desa: CRUD, jabatan, periode, foto, status, dan penanda tangan | `Pamong.php`, `Jabatan.php`, `Pengurus.php` |
| OS-GOV-003 | SOTK: bagan organisasi, hubungan jabatan, tampilan, dan cetak | `fweb/Sotk.php`, `views/admin/pengurus/` |
| OS-GOV-004 | Lembaga desa: master, CRUD, anggota, jabatan, dan laporan | `Lembaga.php`, `Lembaga_master.php`, `Lembaga_anggota.php` |
| OS-GOV-005 | Kelompok masyarakat: master kategori, CRUD, anggota, jabatan, dan cetak | `Kelompok.php`, `Kelompok_master.php`, `Kelompok_anggota.php` |
| OS-GOV-006 | Status desa, IDM, SDGs, indikator, nilai, dan laporan | `Status_desa.php`, `fweb/Idm.php`, `fweb/Sdgs.php` |
| OS-GOV-007 | Pemilihan desa: kandidat, pemilih, hasil, dan rekap | `Pemilihan.php` |
| OS-GOV-008 | Sinergi program dan pemetaan program lintas pihak | `Sinergi_program.php` |
| OS-GOV-009 | Pembangunan: proyek, rencana, anggaran, realisasi, dokumentasi, hasil, dan publikasi | `Plan.php`, `Pembangunan_dokumentasi.php`, `fweb/Pembangunan.php` |
| OS-GOV-010 | Informasi publik, produk hukum, peraturan, embed, dokumen, dan arsip | `InformasiPublik.php`, `fweb/InformasiPublik.php`, `fweb/Peraturan.php`, `Embed.php` |

## D. Persuratan dan layanan administrasi

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-SUR-001 | Master jenis surat, kode isian, placeholder, formula, dan template | `Surat_master.php`, `views/admin/pengaturan_surat/` |
| OS-SUR-002 | Surat warga: sumber penduduk, isian dinamis, pengikut, penduduk luar, dan konsep | `Surat.php`, `views/admin/surat/` |
| OS-SUR-003 | Syarat surat: master, wajib/opsional, lampiran, dan validasi pengajuan | `Syaratan_surat.php`, `views/admin/syaratan_surat/` |
| OS-SUR-004 | Klasifikasi surat dan relasi kode/jenis | `Klasifikasi.php` |
| OS-SUR-005 | Permohonan surat dari admin dan warga, status, pemeriksaan, pengembalian, pembatalan | `Surat_mohon.php`, `Permohonan_surat_admin.php` |
| OS-SUR-006 | Empat pola penomoran, kode wilayah, nomor otomatis, dan arsip nomor | `Surat.php`, `views/admin/surat/nomor_surat.blade.php` |
| OS-SUR-007 | Verifikasi berjenjang kepala desa/sekretaris/operator | `Surat.php`, `views/admin/permohonan_surat/` |
| OS-SUR-008 | Cetak HTML, PDF, kop, logo, tanda tangan, stempel, QR, dan token verifikasi | `Surat_dinas_cetak.php`, `Qr_code.php`, `fweb/Verifikasi_surat.php` |
| OS-SUR-009 | Surat masuk: disposisi, lampiran, cetak, dan pencarian | `buku_umum/Surat_masuk.php`, `views/admin/surat_masuk/` |
| OS-SUR-010 | Surat keluar: ekspedisi, lampiran, cetak, dan pencarian | `buku_umum/Surat_keluar.php`, `views/admin/surat_keluar/` |
| OS-SUR-011 | Surat dinas: penulisan, cetak, arsip fisik/digital, dan lampiran | `Surat_dinas.php`, `Surat_dinas_arsip.php` |
| OS-SUR-012 | Buku agenda, log surat, ekspedisi, dan rekam jejak | `LogSurat.php`, `LogSuratDinas.php`, `buku_umum/Ekspedisi.php` |
| OS-SUR-013 | TTE/BSrE dan provider tanda tangan melalui adapter | `external_api/Tte.php`, `external_api/Sign.php` |
| OS-SUR-014 | Pengaturan lampiran, batas ukuran, tipe berkas, dan penyajian aman | `Pengaturan_lampiran.php`, `Lampiran.php` |

## E. Keuangan, buku administrasi, dan aset

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-FIN-001 | APBDes: struktur rekening, pagu, tahun, bidang, kegiatan, dan sumber dana | `Keuangan_laporan.php`, `Laporan_apbdes.php` |
| OS-FIN-002 | Realisasi, laporan per bidang, RP APBDes, dan agregasi rekening | `Keuangan_laporan.php` |
| OS-FIN-003 | Keuangan manual, saldo, pembukuan, dan rekonsiliasi | `Keuangan_manual.php`, `views/admin/keuangan/` |
| OS-FIN-004 | Dokumen keuangan, laporan periodik, lampiran, impor, dan ekspor | `Dokumen.php`, `views/admin/dokumen/` |
| OS-FIN-005 | Sisa lebih antartahun dan kesinambungan tahun anggaran | `Keuangan_laporan.php`, `keuangan/` |
| OS-FIN-006 | Transparansi APBDes, realisasi, dan dokumen di situs publik | `fweb/Statistik.php`, `fweb/InformasiPublik.php` |
| OS-FIN-007 | Inventaris aset enam kategori: tanah, peralatan, gedung, jalan, konstruksi, aset lain | `Inventaris.php`, `InventarisTanah.php`, `InventarisPeralatan.php`, `InventarisGedung.php`, `InventarisJalan.php`, `InventarisKontruksi.php` |
| OS-FIN-008 | Mutasi aset, kondisi, lokasi, penghapusan, laporan, dan cetak kekayaan desa | `Asset.php`, `Api_inventaris_asset.php`, `Laporan_inventaris.php` |
| OS-FIN-009 | Buku administrasi umum dan buku sekretariat | `buku_umum/`, `views/admin/bumindes/umum/` |
| OS-FIN-010 | Buku penduduk induk, KTP/KK, mutasi, rekap, dan penduduk sementara | `views/admin/bumindes/penduduk/` |
| OS-FIN-011 | Buku tanah desa dan tanah kas desa | `views/admin/bumindes/arsip/`, `views/admin/dokumen/tanah_kas_desa/` |
| OS-FIN-012 | Buku rencana, kegiatan, hasil pembangunan, kader, dan arsip | `views/admin/bumindes/pembangunan/`, `views/admin/bumindes/arsip/` |
| OS-FIN-013 | Buku agenda, lembaran desa, pengurus, dan dokumen sekretariat | `buku_umum/`, `views/admin/dokumen/` |

## F. Situs publik dan tema

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-WEB-001 | Beranda, headline, sambutan, statistik ringkas, agenda, dan slider | `fweb/Utama.php` |
| OS-WEB-002 | Artikel, berita, arsip, kategori, detail, dan pencarian | `fweb/Artikel.php`, `fweb/Arsip.php` |
| OS-WEB-003 | Profil desa, pemerintahan, perangkat, SOTK, dan lembaga | `fweb/Pemerintah.php`, `fweb/Sotk.php`, `fweb/Lembaga.php` |
| OS-WEB-004 | Galeri album, foto, detail, dan publikasi | `fweb/Galeri.php` |
| OS-WEB-005 | Informasi publik, produk hukum, peraturan, dokumen, dan embed | `fweb/InformasiPublik.php`, `fweb/Peraturan.php`, `fweb/Embed.php` |
| OS-WEB-006 | Statistik penduduk, bantuan, dan statistik desa | `fweb/Statistik.php` |
| OS-WEB-007 | Peta dan wilayah administratif | `fweb/Peta.php`, `fweb/WilayahAdministratif.php` |
| OS-WEB-008 | Pembangunan dan dokumentasi proyek | `fweb/Pembangunan.php` |
| OS-WEB-009 | Pengaduan publik, widget, daftar terpublikasi, dan detail | `fweb/Pengaduan.php` |
| OS-WEB-010 | Kelompok, lembaga, dan anggota yang boleh dipublikasikan | `fweb/Kelompok.php`, `fweb/Lembaga.php` |
| OS-WEB-011 | Inventaris/aset yang boleh ditampilkan secara publik | `fweb/Inventaris.php` |
| OS-WEB-012 | Bantuan, suplemen, kesehatan, vaksin, dan DPT publik | `internal_api/BantuanPeserta.php`, `fweb/{Suplemen,Kesehatan,Vaksin,Dpt}.php` |
| OS-WEB-013 | IDM, SDGs, analisis, dan statistik hasil pendataan | `fweb/Idm.php`, `fweb/Sdgs.php`, `fweb/Analisis.php` |
| OS-WEB-014 | Lapak, produk warga, dan peta produk | `fweb/Lapak.php`, `Modules/Lapak/` |
| OS-WEB-015 | Kontak, komentar, pengunjung, dan umpan balik | `fweb/` terkait, `Kontak.php`, `Komentar.php`, `Pengunjung.php` |
| OS-WEB-016 | Menu, widget, slider, teks berjalan, sosial media, dan konfigurasi web | `Menu.php`, `Web_widget.php`, `Slider.php`, `Teks_berjalan.php`, `Sosmed.php` |
| OS-WEB-017 | Tema, konfigurasi tema, pemindaian, aktivasi, dan komponen tema | `Theme.php`, `Pindai_tema.php`, `AktivasiTemaController.php`, `storage/app/themes/` |
| OS-WEB-018 | Sitemap, OG image, metadata, dan route publik | `Sitemap.php`, `fweb/OgImage.php` |
| OS-WEB-019 | Verifikasi surat melalui token/QR | `fweb/Verifikasi_surat.php` |

## G. Layanan mandiri warga

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-WGA-001 | Pendaftaran/aktivasi akun warga dan pemulihan kredensial | `fmandiri/auth/` |
| OS-WGA-002 | Login warga, captcha/anti-abuse, sesi, dan ubah password/PIN | `fmandiri/`, `Securimage.php`, `Token.php` |
| OS-WGA-003 | Beranda warga, identitas, dan status layanan | `fmandiri/Beranda.php` |
| OS-WGA-004 | Pengajuan surat, isian dinamis, syarat, status, dan riwayat | `fmandiri/Surat.php` |
| OS-WGA-005 | Dokumen warga dan unduhan berkas yang terotorisasi | `fmandiri/Dokumen.php` |
| OS-WGA-006 | Pesan dua arah warga-desa | `fmandiri/Pesan.php` |
| OS-WGA-007 | Verifikasi surat dari area warga | `fmandiri/Verifikasi.php` |
| OS-WGA-008 | Bantuan yang diterima warga | `fmandiri/Bantuan.php` |
| OS-WGA-009 | Pengaduan, tiket, identitas pelapor, tanggapan, dan notifikasi | `fweb/Pengaduan.php`, `Pengaduan_admin.php` |
| OS-WGA-010 | Lapak dan produk warga | `fmandiri/Lapak.php`, `fmandiri/Produk.php` |
| OS-WGA-011 | Kehadiran perangkat dan pengajuan izin | `fmandiri/Kehadiran_perangkat.php`, `Modules/Kehadiran/` |

## H. Analisis, survei, dan statistik

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-ANA-001 | Kategori analisis | `Modules/Analisis/` |
| OS-ANA-002 | Indikator dan parameter analisis | `Modules/Analisis/` |
| OS-ANA-003 | Periode, sasaran, respon, dan jawaban | `Modules/Analisis/` |
| OS-ANA-004 | Skoring, klasifikasi, rekap, statistik, dan laporan | `Modules/Analisis/` |
| OS-ANA-005 | Impor/ekspor analisis dan integrasi formulir eksternal | `Modules/Analisis/` |
| OS-ANA-006 | Survei publik dan pengisian mandiri bila diaktifkan | `fweb/Analisis.php` |

## I. Modul tambahan OpenSID

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-MOD-001 | Anjungan mandiri/kiosk: alur publik dan konfigurasi perangkat | `Modules/Anjungan/` |
| OS-MOD-002 | Buku tamu: keperluan, pertanyaan, registrasi, kepuasan, dan cetak | `Modules/BukuTamu/` |
| OS-MOD-003 | Kehadiran: jam kerja, hari libur, alasan keluar, izin, pengaduan, rekap | `Modules/Kehadiran/` |
| OS-MOD-004 | Lapak: kategori, pelapak, produk, peta, cetak, dan publikasi | `Modules/Lapak/` |
| OS-MOD-005 | Pelanggan/layanan berlangganan dan pendaftaran kerja sama | `Modules/Pelanggan/` |

## J. Sistem, keamanan, dan operasional

| ID | Cakupan perilaku | Sumber OpenSID |
|---|---|---|
| OS-OPS-001 | Pengguna, grup, modul, hak akses, menu, dan pewarisan akses | `Pengguna.php`, `Man_user.php`, `Grup.php`, `Modul.php` |
| OS-OPS-002 | Shortcut, dashboard, konfigurasi menu, dan navigasi administratif | `Shortcut.php`, `Main.php` |
| OS-OPS-003 | Pengaturan aplikasi, web, mandiri, surat, lampiran, dan tema | `Setting*.php`, `Pengaturan_lampiran.php` |
| OS-OPS-004 | Token, OTP, captcha, 2FA, rate limit, dan pemulihan akun | `Token.php`, `Otp.php`, `Securimage.php`, `auth/` |
| OS-OPS-005 | Notifikasi, mailbox, SMS outbox/pending/sent, dan broadcast | `Notif.php`, `NotifikasiController.php`, `Mailbox.php`, `Sms*.php` |
| OS-OPS-006 | Log aktivitas, log sistem, log surat, dan audit trail | `Info_sistem.php`, `LogSurat.php`, `LogSuratDinas.php` |
| OS-OPS-007 | Backup, restore, migrasi database, optimasi, dan pemulihan | `Koneksi_database.php`, `Tools.php`, `Optimasi_gambar.php`, `views/admin/database/` |
| OS-OPS-008 | Pengelolaan plugin dan pemasangan modul | `Plugin.php`, `Install_modul.php`, `views/admin/plugin/` |
| OS-OPS-009 | Sinkronisasi desa dan OpenDK | `Sinkronisasi.php`, `Opendk_pesan.php`, `views/admin/sinkronisasi/` |
| OS-OPS-010 | File serving, media, validasi unggahan, dan kontrol akses | `ServeFileController.php`, `Lampiran.php` |
| OS-OPS-011 | API informasi publik, inventaris, surat, dan integrasi internal | `controllers/internal_api/` |
| OS-OPS-012 | API eksternal surat, TTE, tanda tangan, dan layanan pihak ketiga | `controllers/external_api/` |

## K. Keluaran dan kompatibilitas

Setiap domain yang mempunyai keluaran di OpenSID harus memetakan jenis keluaran
berikut, bukan hanya halaman daftar:

- tampilan detail dan dialog aksi;
- cetak HTML dan PDF;
- ekspor CSV/Excel;
- impor CSV/Excel bila tersedia;
- unggah dan unduh berkas;
- QR/token/verifikasi bila tersedia;
- laporan periodik dan rekap agregat;
- tautan publik atau area warga bila tersedia.

Integrasi pihak ketiga ditulis sebagai kontrak adapter. Implementasi lokal wajib
memiliki mode `nonaktif` atau `manual` yang aman, tetapi status fitur tidak boleh
disebut selesai sebelum alur adapter, error, retry/idempotensi, secret, dan audit
sudah ditentukan.

## Prosedur penutupan katalog

Sebelum milestone paritas dinyatakan selesai:

1. setiap ID di atas memiliki baris status di `PARITAS-OPENSID.md`;
2. setiap status `✅` menunjuk ke route/UI dan test yang bisa dijalankan;
3. setiap status `🟡` menjelaskan bagian yang belum ada;
4. tidak ada route placeholder yang diberi status penuh;
5. source OpenSID diinventaris ulang untuk mencari controller, view, module, dan
   API baru;
6. `npm run check`, `npm run build`, migrasi dari DB kosong, dan smoke/E2E yang
   relevan lulus.
