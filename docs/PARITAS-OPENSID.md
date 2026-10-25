# Matriks Paritas Fitur vs OpenSID

Dokumen ini adalah **sumber kebenaran status implementasi** terhadap
[`KATALOG-FITUR-OPENSID.md`](./KATALOG-FITUR-OPENSID.md). Target produk adalah
rebuild orisinal dengan **cakupan seluruh fitur OpenSID** di
`/home/super/Projects/opensid`, termasuk modul tambahan, API, keluaran, layanan
mandiri, dan integrasi.

Sumber pembanding:

- `/home/super/Projects/opensid/donjo-app/controllers/*`
- `/home/super/Projects/opensid/donjo-app/controllers/fweb/*`
- `/home/super/Projects/opensid/donjo-app/controllers/fmandiri/*`
- `/home/super/Projects/opensid/donjo-app/controllers/internal_api/*`
- `/home/super/Projects/opensid/donjo-app/controllers/external_api/*`
- `/home/super/Projects/opensid/Modules/*`
- `/home/super/Projects/opensid/resources/views/admin/*`
- `/home/super/Projects/opensid/storage/app/themes/*`

Legenda:

- ✅ **Berfungsi penuh** — domain, action, UI, keluaran yang relevan, otorisasi,
  test, dan bukti end-to-end tersedia.
- 🟡 **Sebagian** — ada kode/skema/UI, tetapi ada operasi, keluaran, alur,
  test, atau integrasi yang belum lengkap.
- 🔴 **Belum ada** — belum tersedia atau masih placeholder/mockup.
- ⚪ **Belum diaudit per-ID** — cakupan sudah ada di katalog, tetapi implementasi
  belum direkonsiliasi secara independen terhadap Definition of Done.

> **Catatan lisensi.** OpenSID berlisensi **GPL v3**. Matriks ini mencatat
> perilaku, alur, model data, dan keluaran sebagai referensi. Implementasi SID
> tetap orisinal; kode dan aset OpenSID tidak disalin.
>
> Arsip dan riset bukan sumber status. Detail scope lengkap ada di katalog.
---

## Ringkasan Paritas

| Scope | Total ID/modul | ✅ | 🟡 | 🔴 | ⚪ |
|---|---:|---:|---:|---:|---:|
| **Katalog per-ID — status terkini** | **113** | **0** | **74** | **39** | **0** |
| Baseline kelompok lama — konteks historis, bukan status delivery | 92 | 42 | 12 | 38 | — |

Status yang wajib dipakai untuk keputusan delivery adalah baris katalog
per-ID: seluruh 113 ID sudah diaudit, tetapi belum ada ID yang memenuhi Definition
of Done penuh. Baris baseline kelompok lama dipertahankan hanya agar perubahan
terhadap ringkasan historis tetap terlacak; angka 92 tidak mewakili seluruh scope
OpenSID dan tidak boleh dibandingkan langsung dengan 113 ID.

Setiap ID tetap wajib memiliki domain, action, UI, keluaran relevan, otorisasi,
test, dan bukti end-to-end sebelum statusnya menjadi ✅.

Urutan prioritas tidak menghapus fitur dari scope. T1 dikerjakan lebih dahulu,
kemudian T2 dan modul tambahan/integrasi; seluruhnya tetap wajib ditutup.

## Register cakupan

Tabel kategori di bawah adalah ringkasan domain lama. Daftar requirement yang
lengkap ada di katalog dan memakai ID `OS-*`. Setiap issue, branch, migrasi,
test, dan perubahan status **MUST mencantumkan ID katalog**; satu baris ringkasan
tidak boleh dianggap menutup semua ID di dalamnya.

Status audit per-ID terkini ditulis di register di bawah. Tabel modul di bawah
dipertahankan sebagai baseline coarse historis dan boleh berbeda dari hasil
audit per-ID; catatan perubahan bertanggal dipindahkan ke
[`LOG-PERKEMBANGAN.md`](./LOG-PERKEMBANGAN.md).

## Register per-ID — hasil audit

Register ini memecah ringkasan 92 modul menjadi seluruh 113 ID katalog.
Katalog tetap menjadi sumber deskripsi cakupan; register ini menjadi sumber
status terkini dan bukti gap per ID. Semua ID sudah diganti dari status
`⚪` menjadi `✅`, `🟡`, atau `🔴` setelah audit berbasis bukti.

| ID | Status audit per-ID | Bukti dan gap audit |
|---|---|---|
| OS-POP-001 | 🟡 Sebagian | CRUD, pencarian, filter status, pagination, RBAC di `/penduduk`; cetak/detail/ekspor per penduduk belum ditemukan, ekspor yang ada hanya laporan CSV. |
 | OS-POP-002 | 🟡 Sebagian | Riwayat lahir, mati, pindah masuk, pindah keluar, dan perubahan status dasar tersedia di `/penduduk/riwayat` (filter jenis/tanggal/pencarian, pagination, RBAC, dialog catat perubahan) dengan tabel `resident_mutations`, test domain, serta ekspor CSV `/penduduk/riwayat/ekspor`. Gap: E2E belum ada. |
| OS-POP-003 | 🟡 Sebagian | CRUD KK, dialog anggota, validasi kepala keluarga, dan PDF KK tersedia; riwayat perubahan anggota serta E2E belum ada. |
| OS-POP-004 | 🟡 Sebagian | CRUD RTM, anggota, kelas sosial, BDT, wilayah, dan RBAC tersedia; laporan RTM sesuai cakupan OpenSID serta E2E belum ditemukan. |
 | OS-POP-005 | 🟡 Sebagian | Modul DPT tersedia di `/penduduk/dpt` dengan CRUD pemilihan (draf/aktif/selesai), filter nama/NIK, dusun/RW/RT, agama, pendidikan, pekerjaan, status kawin, umur min/max, pagination, RBAC `penduduk`, ekspor CSV `/penduduk/dpt/ekspor`, dan logika umur ≥17 tahun atau sudah kawin pada tanggal pemilihan aktif. Gap: cetak DPT dan E2E belum ada. |
 | OS-POP-006 | Sebagian | Modul DTKS tersedia di `/penduduk/dtks` dengan CRUD (dari RTM), status draf/terverifikasi, agregasi anggota, dan pencatatan petugas/responden. Gap: detail formulir (tanggapan/ekspor), lampiran, pengaturan program, laporan, dan E2E belum ada. |
 | OS-POP-007 | 🟡 Sebagian | Modul Suplemen tersedia di `/penduduk/suplemen` dengan CRUD (nama, slug, sasaran), pelacakan sasaran (penduduk/keluarga), dan agregasi jumlah terdata. Gap: detail/form terdata, impor/ekspor, laporan, cetak, dan E2E belum ada. |
| OS-POP-008 | 🟡 Sebagian | Modul KIA/Stunting tersedia: migrasi posyandu, kia, ibu_hamil, bulanan_anak (`0032`), schema/domain/repo/actions, RBAC resource `kesehatan`, halaman `/kesehatan/{posyandu,kia,pemantauan-ibu-hamil,pemantauan-anak}`. Gap: formulir CRUD lengkap, rekapitulasi konvergensi skorcard, ekspor, integrasi posyandu lengkap, dan E2E belum ada. |
| OS-POP-009 | ⚪ Tidak dibutuhkan | Modul vaksin/Covid tidak diimplementasikan karena sudah tidak relevan saat ini (keluar dari scope). |
| OS-POP-010 | 🟡 Sebagian | Halaman admin `/statistik/penduduk` memuat statistik gender, kelompok umur, agama, pendidikan, pekerjaan, status kawin, dan dusun dengan tabel L/P/total/% dan ringkasan total. Gap: cetak, ekspor CSV/Excel, dan E2E belum ada. |
| OS-POP-011 | 🟡 Sebagian | Program bantuan memiliki CRUD, slug, sasaran, periode/status, asal dana, RBAC, UI, dan test domain; laporan keluaran serta E2E belum ditemukan. |
| OS-POP-012 | 🟡 Sebagian | Peserta dapat ditambah/dihapus dengan kandidat sasaran tenant-aware dan snapshot kartu; impor/ekspor/cetak kartu serta E2E belum ditemukan. |
| OS-POP-013 | 🟡 Sebagian | Halaman admin `/statistik/bantuan` memuat statistik peserta bantuan per program dan per sasaran (penduduk/keluarga) dengan tabel L/P/total/% dan ringkasan total. Gap: cetak, ekspor CSV, dan E2E belum ada. |
| OS-POP-014 | 🔴 Belum ada | Tidak ditemukan modul pendapat warga atau jajak pendapat. |
| OS-POP-015 | 🔴 Belum ada | Tidak ditemukan direktori kontak penduduk/kelompok untuk komunikasi administratif; halaman kontak desa bukan pengganti fitur ini. |
| OS-WIL-001 | 🟡 Sebagian | CRUD, pencarian, pagination, validasi kombinasi dusun/RW/RT, dan RBAC di `/wilayah`; hierarki, rekap penduduk, serta cetak belum ditemukan. |
| OS-WIL-002 | 🔴 Belum ada | Tidak ditemukan domain/route admin untuk GIS area atau penyimpanan metadata/geometri; peta publik masih placeholder. |
| OS-WIL-003 | 🔴 Belum ada | Tidak ditemukan domain/route untuk GIS garis atau jalan beserta geometri, atribut, tampilan, dan cetaknya. |
| OS-WIL-004 | 🔴 Belum ada | Tidak ditemukan domain/route untuk GIS titik/lokasi, koordinat, simbol, atau tampilan publik yang berfungsi. |
| OS-WIL-005 | 🔴 Belum ada | Tidak ditemukan domain/route untuk GIS polygon/batas, layer, atau publikasi geometri. |
| OS-WIL-006 | 🔴 Belum ada | Halaman publik pertanahan hanya memproyeksikan tabel `inventaris` sebagai placeholder; data persil, Cdesa, rincian, dan mutasi tanah belum ada. |
| OS-WIL-007 | 🔴 Belum ada | Tidak ditemukan peta kantor, peta administratif interaktif, atau layer batas desa/dusun; `/desa/peta` masih placeholder. |
| OS-WIL-008 | 🔴 Belum ada | Tidak ditemukan domain/route referensi simbol atau konfigurasi visual GIS. |
| OS-GOV-001 | 🟡 Sebagian | `/pengaturan/desa` memiliki identitas, alamat, kontak, kepala desa, logo, tanda tangan, stempel, RBAC, dan output publik; audit E2E serta seluruh keluaran konfigurasi belum ditemukan. |
| OS-GOV-002 | 🟡 Sebagian | `/konten/perangkat` memiliki CRUD jabatan/perangkat, foto, periode, status, dan penanda tangan; cetak/riwayat periode serta E2E belum ditemukan. |
| OS-GOV-003 | 🟡 Sebagian | Struktur jabatan dan perangkat serta tampilan publik `/desa/pemerintahan` tersedia; bagan hubungan organisasi, cetak SOTK, dan E2E belum ditemukan. |
| OS-GOV-004 | 🟡 Sebagian | Model kelompok/lembaga bertipe `lembaga`, kategori, CRUD, anggota, jabatan, RBAC, dan publikasi tersedia; laporan lembaga, cetak, dan E2E belum ditemukan. |
| OS-GOV-005 | 🟡 Sebagian | Model kelompok masyarakat, kategori, CRUD, anggota, jabatan, RBAC, dan publikasi tersedia; cetak kelompok, laporan, dan E2E belum ditemukan. |
| OS-GOV-006 | 🔴 Belum ada | Belum ada domain input indikator/status desa, IDM, atau SDGs; `/desa/status-des` membaca rekap inventaris dan `/desa/idm-sdgs` menampilkan laporan keuangan triwulan. |
| OS-GOV-007 | 🔴 Belum ada | Tidak ditemukan domain/route kandidat pemilihan desa, pemilih, hasil, atau rekap. |
| OS-GOV-008 | 🔴 Belum ada | Tidak ditemukan domain/route sinergi program atau pemetaan program lintas pihak. |
| OS-GOV-009 | 🔴 Belum ada | Tabel `pembangunan_proyek` dan `pembangunan_dokumentasi` tersedia di migrasi, tetapi admin/use case belum ada dan `/desa/pembangunan` masih placeholder. |
| OS-GOV-010 | 🟡 Sebagian | `/konten/dokumen` memiliki CRUD dokumen publik/produk hukum, metadata, berkas/tautan, RBAC, dan publikasi; embed, alur arsip, laporan, dan E2E belum ditemukan. |
| OS-SUR-001 | 🟡 Sebagian | Master jenis surat, builder isian dinamis, placeholder, formula, template, RBAC, UI, dan test domain tersedia; E2E dan keluaran template lengkap belum ditemukan. |
| OS-SUR-002 | 🟡 Sebagian | Surat warga memiliki sumber penduduk, isian dinamis, pengikut, penduduk luar, konsep, CRUD, RBAC, dan UI; E2E serta seluruh keluaran lanjutan belum ditemukan. |
| OS-SUR-003 | 🟡 Sebagian | Master syarat aktif/nonaktif, relasi ke jenis surat, unggahan berkas warga, dan validasi isian tersedia; laporan E2E dan skenario lampiran lengkap belum ditemukan. |
| OS-SUR-004 | 🟡 Sebagian | CRUD klasifikasi dan relasi ke jenis/agenda surat tersedia dengan RBAC dan UI; E2E belum ditemukan. |
| OS-SUR-005 | 🟡 Sebagian | Permohonan admin/warga, status berurutan, pemeriksaan, pengembalian, pembatalan, unggahan syarat, dan riwayat tersedia; E2E belum ditemukan. |
| OS-SUR-006 | 🟡 Sebagian | Empat mode penomoran, kode desa, nomor otomatis, dan pemeriksaan duplikasi lintas agenda tersedia; arsip nomor terpisah dan E2E belum ditemukan. |
| OS-SUR-007 | 🟡 Sebagian | Verifikasi berurutan operator → sekretaris desa → kepala desa, pembatasan role, tolak/kembalikan, dan test domain tersedia; E2E belum ditemukan. |
| OS-SUR-008 | 🟡 Sebagian | Cetak HTML/PDF, kop, logo, tanda tangan, stempel, QR, token verifikasi, dan halaman verifikasi publik tersedia; E2E serta seluruh variasi keluaran belum ditemukan. |
| OS-SUR-009 | 🟡 Sebagian | Surat masuk memiliki CRUD, klasifikasi, disposisi, nomor agenda, pencarian, RBAC, dan UI; lampiran, cetak, dan E2E belum ditemukan. |
| OS-SUR-010 | 🟡 Sebagian | Surat keluar memiliki CRUD, ekspedisi/tanggal kirim, klasifikasi, nomor agenda, pencarian, RBAC, dan UI; lampiran, cetak, dan E2E belum ditemukan. |
| OS-SUR-011 | 🟡 Sebagian | Surat dinas memiliki penulisan, CRUD, klasifikasi, arsip digital/lokasi, lampiran, RBAC, dan UI; cetak serta E2E belum ditemukan. |
| OS-SUR-012 | 🟡 Sebagian | Agenda masuk/keluar dan nomor agenda tersedia, termasuk buku agenda Bumindes; log surat, ekspedisi terpadu, rekam jejak perubahan, dan E2E belum ditemukan. |
| OS-SUR-013 | 🔴 Belum ada | Domain TTE/BSrE hanya adapter nonaktif dengan `KLIEN_TTE = null`; provider nyata, konfigurasi operasional, dan penandatanganan jaringan belum tersedia. |
| OS-SUR-014 | 🟡 Sebagian | Allowlist MIME, batas ukuran, validasi berkas syarat, sanitasi nama, path traversal protection, dan route privat tersedia; pengaturan admin yang dapat dikonfigurasi serta E2E belum ditemukan. |
| OS-FIN-001 | 🟡 Sebagian | `/keuangan/anggaran` memiliki struktur rekening, pagu, tahun, bidang, sumber dana, RBAC, dan input UI; impor/template lengkap, E2E, serta seluruh keluaran APBDes belum ditemukan. |
| OS-FIN-002 | 🟡 Sebagian | Laporan RP APBDes, realisasi per bidang, agregasi rekening, grafik, print, dan ekspor tersedia; E2E serta variasi laporan lengkap belum ditemukan. |
| OS-FIN-003 | 🟡 Sebagian | Realisasi, rekonsiliasi, saldo selisih, dan laporan tersedia; pembukuan/keuangan manual sebagai alur terpisah belum ditemukan dan E2E belum ada. |
| OS-FIN-004 | 🟡 Sebagian | Arsip dokumen laporan periodik, lampiran PDF, metadata, RBAC, dan ekspor tersedia; impor dan E2E belum ditemukan. |
| OS-FIN-005 | 🔴 Belum ada | Tidak ditemukan alur sisa lebih antartahun atau kesinambungan saldo/tahun anggaran; modul memilih tahun secara terpisah. |
| OS-FIN-006 | 🟡 Sebagian | `/desa/apbdes`, `/desa/idm-sdgs`, dan dokumen publik menyediakan keluaran transparansi; cakupan transparansi realisasi/dokumen belum lengkap dan E2E belum ada. |
| OS-FIN-007 | 🟡 Sebagian | Inventaris memiliki enam kategori aset OpenSID, kondisi, asal, lokasi, jumlah, nilai, CRUD, dan RBAC; laporan/cetak per kategori dan E2E belum ditemukan. |
| OS-FIN-008 | 🟡 Sebagian | Mutasi aset mendukung pindah, rusak, hapus, perbaikan, kondisi/lokasi, approval operator → sekdes → kades, dan audit log mutasi; laporan kekayaan/cetak dan E2E belum ditemukan. |
| OS-FIN-009 | 🟡 Sebagian | `/bumindes/buku-administrasi` menyediakan katalog buku umum/sekretariat dan CRUD item; format buku resmi, laporan, cetak, dan E2E belum ditemukan. |
| OS-FIN-010 | 🟡 Sebagian | Katalog buku penduduk induk, KTP/KK, mutasi, rekap, dan penduduk sementara tersedia serta dapat disinkronkan dari penduduk; keluaran resmi, riwayat mutasi, dan E2E belum ditemukan. |
| OS-FIN-011 | 🟡 Sebagian | Buku Tanah Kas Desa dan Buku Tanah di Desa tersedia dalam katalog generik; domain persil/rincian/mutasi tanah serta keluaran khusus belum ada. |
| OS-FIN-012 | 🟡 Sebagian | Buku inti dapat menyimpan item administrasi umum, tetapi domain proyek/rencana/kegiatan/hasil pembangunan dan kader khusus belum ada; E2E belum ditemukan. |
| OS-FIN-013 | 🟡 Sebagian | Buku agenda, ekspedisi, peraturan, keputusan, aparat, serta tanda tangan/cap tersedia sebagai katalog generik; rekam sekretariat khusus, laporan, cetak, dan E2E belum ditemukan. |
| OS-WEB-001 | 🟡 Sebagian | Beranda publik memuat sambutan, slider, statistik ringkas, widget, berita, dan surat terbaru melalui tema; agenda lengkap, seluruh headline, dan E2E belum ditemukan. |
| OS-WEB-002 | 🟡 Sebagian | Berita memiliki admin CRUD, kategori, status terbit, detail publik, arsip berbasis daftar, dan hit; pencarian khusus, keluaran lengkap, dan E2E belum ditemukan. |
| OS-WEB-003 | 🟡 Sebagian | Profil, pemerintahan/perangkat, SOTK dasar, dan lembaga tersedia di route publik; bagan SOTK lengkap, beberapa relasi lembaga, dan E2E belum ditemukan. |
| OS-WEB-004 | 🟡 Sebagian | Admin album/foto dan route publik galeri/detail tersedia; cetak, pencarian galeri, dan E2E belum ditemukan. |
| OS-WEB-005 | 🟡 Sebagian | Dokumen publik/produk hukum memiliki admin CRUD, berkas/tautan, dan publikasi; peraturan/embed/arsip lengkap serta E2E belum ditemukan. |
| OS-WEB-006 | 🟡 Sebagian | `/desa/statistik` menyediakan statistik kependudukan, bantuan, dan desa; cakupan agregat lengkap, periodisasi, dan E2E belum ditemukan. |
| OS-WEB-007 | 🟡 Sebagian | Wilayah administratif tersedia di admin dan route `/desa/peta` ada; peta interaktif serta layer GIS masih placeholder. |
| OS-WEB-008 | 🔴 Belum ada | `/desa/pembangunan` masih placeholder dan tidak ada domain/use case admin untuk proyek pembangunan. |
| OS-WEB-009 | 🟡 Sebagian | Pengaduan publik, pelacakan tiket, daftar yang dipublikasikan, detail, dan admin pemrosesan tersedia; notifikasi/umpan balik lengkap dan E2E belum ditemukan. |
| OS-WEB-010 | 🟡 Sebagian | Kelompok/lembaga, kategori, anggota/ketua, dan publikasi tersedia di `/desa/kelompok`; kontrol publikasi per anggota, cetak, dan E2E belum ditemukan. |
| OS-WEB-011 | 🟡 Sebagian | `/desa/inventaris` menampilkan aset publik, rekap, kondisi, lokasi, dan nilai; filter/publikasi granular, laporan, dan E2E belum ditemukan. |
| OS-WEB-012 | 🟡 Sebagian | Program bantuan publik tersedia; suplemen, kesehatan, vaksin, dan DPT publik belum ditemukan. |
| OS-WEB-013 | 🟡 Sebagian | Survei publik dan statistik tersedia; `/desa/idm-sdgs` masih memakai laporan keuangan triwulan sehingga IDM/SDGs/analisis hasil belum lengkap. |
| OS-WEB-014 | 🔴 Belum ada | Tidak ditemukan domain atau route lapak, produk warga, dan peta produk. |
| OS-WEB-015 | 🟡 Sebagian | Kontak desa dan survei/umpan balik tersedia; komentar dan statistik pengunjung belum ditemukan. |
| OS-WEB-016 | 🟡 Sebagian | Admin menu, widget, slider, dan navigasi tema tersedia; teks berjalan, konfigurasi sosial media, dan E2E belum ditemukan. |
| OS-WEB-017 | 🟡 Sebagian | Konfigurasi tema, form tema, switcher, dan komponen tema tersedia; pemindaian/aktivasi tema lengkap dan E2E belum ditemukan. |
| OS-WEB-018 | 🟡 Sebagian | Sitemap dinamis, metadata per route, OG image, dan route publik tersedia; cakupan URL dinamis lengkap dan E2E belum ditemukan. |
| OS-WEB-019 | 🟡 Sebagian | Token/QR dan halaman publik `/desa/verifikasi-surat/[token]` tersedia; E2E dan integrasi semua area warga belum ditemukan. |
| OS-WGA-001 | 🔴 Belum ada | Akun warga dibuat dan direset operator melalui `/penduduk`; pendaftaran mandiri, aktivasi, dan pemulihan kredensial warga belum ditemukan. |
| OS-WGA-002 | 🟡 Sebagian | Login bersama `/masuk`, sesi warga, ubah PIN, dan kewajiban ganti PIN tersedia; captcha/anti-abuse, OTP/2FA, dan pemulihan mandiri belum ditemukan. |
| OS-WGA-003 | 🟡 Sebagian | Beranda warga, profil, ringkasan permohonan, status layanan, dokumen, pesan, dan menu tersedia; E2E belum ditemukan. |
| OS-WGA-004 | 🟡 Sebagian | Pengajuan surat, isian dinamis, syarat, unggah berkas privat, status, pembatalan, dan riwayat tersedia; E2E belum ditemukan. |
| OS-WGA-005 | 🟡 Sebagian | Dokumen warga dan route unduhan surat/berkas syarat membatasi akun pemilik; E2E dan keluaran dokumen lengkap belum ditemukan. |
| OS-WGA-006 | 🟡 Sebagian | Halaman pesan menampilkan catatan operator dan perkembangan permohonan; percakapan dua arah serta E2E belum tersedia. |
| OS-WGA-007 | 🟡 Sebagian | Verifikasi surat publik melalui token/QR tersedia dan dapat dibuka dari dokumen; area warga khusus untuk verifikasi dan E2E belum ditemukan. |
| OS-WGA-008 | 🔴 Belum ada | Tidak ditemukan program bantuan yang dipersonalisasi untuk akun warga atau halaman bantuan warga. |
| OS-WGA-009 | 🟡 Sebagian | Pengaduan publik, tiket, identitas pelapor tersamarkan, tanggapan, status, dan publikasi tersedia; alur tiket terautentikasi/notifikasi dan E2E belum lengkap. |
| OS-WGA-010 | 🔴 Belum ada | Tidak ditemukan lapak atau produk warga pada area publik maupun warga. |
| OS-WGA-011 | 🔴 Belum ada | Tidak ditemukan kehadiran perangkat, jam kerja, pengajuan izin, atau rekap kehadiran. |
| OS-ANA-001 | 🔴 Belum ada | Tidak ditemukan master kategori analisis atau domain khusus untuk modul analisis pendataan. |
| OS-ANA-002 | 🔴 Belum ada | Tidak ditemukan domain indikator, parameter, atau konfigurasi analisis. |
| OS-ANA-003 | 🟡 Sebagian | Survei memiliki periode aktif/nonaktif, pertanyaan, responden, jawaban, dan UI admin; sasaran/parameter analisis dan E2E belum ditemukan. |
| OS-ANA-004 | 🟡 Sebagian | Rekap pilihan, rata-rata, minimum, maksimum, jawaban teks, dan grafik ringkas tersedia; skoring, klasifikasi analisis, laporan formal, dan E2E belum ditemukan. |
| OS-ANA-005 | 🟡 Sebagian | Impor/ekspor respons CSV tersedia dengan validasi dan proteksi formula; integrasi formulir eksternal serta E2E belum ditemukan. |
| OS-ANA-006 | 🟡 Sebagian | Survei aktif dan daftar pertanyaan dipublikasikan di `/desa/analisis-survei`; pengisian mandiri publik secara eksplisit belum tersedia dan E2E belum ditemukan. |
| OS-MOD-001 | 🔴 Belum ada | Tidak ditemukan route/domain konfigurasi anjungan mandiri atau kiosk. |
| OS-MOD-002 | 🔴 Belum ada | Tidak ditemukan buku tamu, registrasi kunjungan, pertanyaan kepuasan, atau cetak. |
| OS-MOD-003 | 🔴 Belum ada | Tidak ditemukan modul kehadiran perangkat, jam kerja, hari libur, izin, atau rekap. |
| OS-MOD-004 | 🔴 Belum ada | Tidak ditemukan domain lapak, pelapak, produk warga, peta produk, atau publikasi lapak. |
| OS-MOD-005 | 🔴 Belum ada | Tidak ditemukan pelanggan, layanan berlangganan, atau pendaftaran kerja sama. |
| OS-OPS-001 | 🟡 Sebagian | Pengguna, grup/role, modul, resource izin, menu efektif, dan pewarisan parent module tersedia; uji perilaku `applyParentInheritance` dan `buildMenu` ditambah; verifikasi E2E login admin, buka `/pengaturan/grup`, ubah izin role Operator (cabut read `analisis-survei`) dan simpan; enforcement menu/route berbasis izin terverifikasi lewat mekanisme RBAC. Perilaku akses lanjutan masih perlu pengujian lebih luas. |
| OS-OPS-002 | 🟡 Sebagian | Dashboard `/beranda`, menu berbasis izin, AppShell, dan navigasi admin tersedia; shortcut dan konfigurasi navigasi personal belum ditemukan. |
| OS-OPS-003 | 🟡 Sebagian | Pengaturan identitas desa, mode surat, tema, konten, dan media tersedia di beberapa route; pengaturan aplikasi/warga/lampiran terpusat belum ditemukan. |
| OS-OPS-004 | 🟡 Sebagian | Login, sesi, perubahan PIN, hash kredensial, pemulihan PIN oleh operator, lupa sandi mandiri (`/lupa-sandi`, `/reset-sandi`, email Resend + token), rate limit login/reset, serta audit permintaan/keberhasilan reset tersedia. Bukti: `src/lib/auth.ts`, `src/features/auth/presentation/components/*sandi-form.tsx`. OTP/2FA/captcha belum tersedia. |
| OS-OPS-005 | 🔴 Belum ada | Tidak ditemukan layanan notifikasi umum, mailbox, SMS outbox, atau broadcast terpusat. |
| OS-OPS-006 | 🟡 Sebagian | Log verifikasi surat dan log mutasi aset tersedia; log aktivitas umum, log login berhasil/gagal, halaman `/pengaturan/log-aktivitas` dengan filter dan RBAC `audit-log`, skema `audit_logs` + migrasi `0027`; audit trail lintas modul lain masih terbatas. |
| OS-OPS-007 | 🟡 Sebagian | Backup database (mysqldump) via route aman + halaman `/pengaturan/database`, restore SQL/SQL.GZ dengan izin `delete` dan konfirmasi, audit trail, RBAC `database`; optimasi gambar/backup folder/inkremental dan mode multi-desa belum ter-cover. |
| OS-OPS-008 | 🔴 Belum ada | Tidak ditemukan pengelolaan plugin atau pemasangan modul runtime. |
| OS-OPS-009 | 🔴 Belum ada | Tidak ditemukan sinkronisasi desa atau integrasi pesan OpenDK. |
| OS-OPS-010 | 🟡 Sebagian | Penyimpanan media, allowlist MIME, batas ukuran, sanitasi nama, path traversal protection, route publik/private, dan RBAC tersedia; konfigurasi/monitoring file serving lengkap belum ditemukan. |
| OS-OPS-011 | 🟡 Sebagian | Route API auth, media, pengaduan, docs-status, dan beberapa ekspor internal tersedia; API informasi publik/inventaris/surat yang komprehensif dan E2E belum ditemukan. |
| OS-OPS-012 | 🔴 Belum ada | Tidak ditemukan adapter eksternal surat/TTE yang aktif; adapter BSrE masih `null` dan integrasi provider pihak ketiga belum tersedia. |


## A. Kependudukan & Sosial

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Data penduduk (CRUD, filter; cetak & ekspor menyusul) | `controllers/Penduduk.php`, `views/admin/penduduk` | 🟡 | P2 (CRUD, cari, filter, dan paginasi selesai; cetak biodata & ekspor daftar penduduk belum — ekspor baru tersedia untuk laporan) |
| Riwayat/log penduduk (lahir, mati, pindah, datang) | `controllers/Penduduk_log.php` | 🔴 | **P1** |
| Keluarga / Kartu Keluarga + cetak | `controllers/Keluarga.php` | ✅ | — |
| Rumah tangga (RTM) | `controllers/Rtm.php` | ✅ | — |
| DPT (Daftar Pemilih Tetap) | `controllers/Dpt.php`, `fweb/Dpt` | 🔴 | P1 |
| DTKS (Data Terpadu Kesejahteraan Sosial) | `controllers/Dtks.php` | 🔴 | P1 |
| Data suplemen (disabilitas, dll.) | `controllers/Suplemen.php`, `fweb/Suplemen` | 🔴 | P1 |
| Stunting & rekapitulasi | `controllers/Stunting*.php` | 🔴 | P2 |
| Vaksin / Covid-19 | `controllers/Vaksin_covid.php`, `controllers/Covid19.php` | 🔴 | P2 |
| Pendapat warga | `controllers/Pendapat.php` | 🔴 | P2 |
| Program bantuan + peserta | `controllers/Program_bantuan.php`, `Peserta_bantuan.php` | ✅ | — |
| Statistik bantuan | `controllers/Statistik_bantuan.php` | 🔴 | P2 |

## B. Wilayah & Pertanahan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Wilayah administratif (dusun/RW/RT) | `controllers/Wilayah.php` | ✅ | — |
| Peta / GIS (area, garis, titik, polygon) | `controllers/{Area,Garis,Point,Polygon}.php`, `fweb/Peta` | 🔴 | **P1** |
| Data persil & Cdesa + mutasi | `controllers/{Data_persil,Cdesa,Cdesa_mutasi,Cdesa_rincian}.php` | 🔴 | P1 |
| Inventaris aset (6 kategori + mutasi) | `controllers/Inventaris_*.php` | ✅ | — |

## C. Pemerintahan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Identitas desa | `controllers/Identitas_desa.php` | ✅ | — |
| Perangkat desa / pamong + jabatan | `controllers/{Pamong,Jabatan,Pengurus}.php` | ✅ | — |
| Lembaga desa + anggota | `controllers/{Lembaga,Lembaga_anggota,Lembaga_master}.php` | 🟡 | P1 |
| Kelompok masyarakat + anggota | `controllers/{Kelompok,Kelompok_anggota}.php` | ✅ | — |
| Status desa / IDM | `controllers/Status_desa.php`, `fweb/Idm` | 🟡 | P2 |
| Pemilihan (pilkes/rekap) | `controllers/Pemilihan.php` | 🔴 | P3 |
| Sinergi program | `controllers/Sinergi_program.php` | 🔴 | P3 |
| SOTK (struktur organisasi) | `fweb/Sotk` | 🔴 | P2 |

## D. Persuratan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Surat warga (jenis, isian, nomor, verifikasi berjenjang) | `controllers/Surat.php`, `Surat_master.php` | ✅ | — |
| Surat masuk & surat keluar | `controllers/{Surat_masuk,Surat_keluar}.php` | ✅ | — |
| Klasifikasi & syarat surat | `controllers/{Klasifikasi,Syaratan_surat}.php` | ✅ | — |
| Surat dinas + arsip | `controllers/{Surat_dinas,Surat_dinas_arsip}.php` | ✅ | — |
| Template surat, QR, verifikasi publik | `controllers/Qr_code.php`, `fweb/Verifikasi_surat` | ✅ | **P0** (template jenis surat, QR di cetak/PDF, dan token verifikasi tenant-aware selesai 24 Okt 2026) |
| Permohonan surat admin | `controllers/Permohonan_surat_admin.php` | ✅ | **P0** (halaman `/permohonan-surat`, dialog detail, proses/kembalikan/batalkan, konsep surat, dan PDF; modul aktif di menu sejak 25 Okt 2026 dengan operator `manage` serta sekdes/kades `read`) |
| Buku agenda / arsip surat | `controllers/Bumindes_arsip.php` | 🔴 | P2 |

## E. Keuangan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| APBDes / anggaran | `controllers/{Keuangan_laporan,Laporan_apbdes}.php` | ✅ | — |
| Realisasi & laporan triwulan | `controllers/Keuangan_laporan.php` | ✅ | — |
| Dokumen laporan | `controllers/Dokumen.php` | ✅ | — |
| Keuangan manual / rekonsiliasi | `controllers/Keuangan_manual.php` | 🟡 | P2 (rekonsiliasi realisasi tahunan vs triwulan selesai; pembukuan manual/saldo bank belum) |
| Inventaris kekayaan desa (buku) | `controllers/Bumindes_inventaris_kekayaan.php` | 🟡 | P1 |
| Transparansi APBDes di web publik | `fweb` (APBDes) | ✅ | — |

## F. Bumindes

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Buku administrasi umum | `controllers/Bumindes_*.php` | ✅ | — |
| Buku penduduk induk | `Bumindes_penduduk_induk` | ✅ | — |
| Buku penduduk KTP/KK | `Bumindes_penduduk_ktpkk` | ✅ | — |
| Buku mutasi penduduk | `Bumindes_penduduk_mutasi` | ✅ | — |
| Buku rekapitulasi penduduk | `Bumindes_penduduk_rekapitulasi` | ✅ | — |
| Buku penduduk sementara | `Bumindes_penduduk_sementara` | ✅ | — |
| Buku rencana & kegiatan pembangunan | `Bumindes_rencana_pembangunan`, `Bumindes_kegiatan_pembangunan` | 🔴 | P1 |
| Buku tanah desa & tanah kas | `Bumindes_tanah_desa`, `Bumindes_tanah_kas_desa` | ✅ | — |
| Buku kader | `Bumindes_kader` | 🔴 | P2 |
| Buku arsip | `Bumindes_arsip` | 🔴 | P2 |
| Buku hasil pembangunan | `Bumindes_hasil_pembangunan` | 🔴 | P2 |

## G. Pembangunan

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Proyek pembangunan + dokumentasi + rencana + hasil | `controllers/{Pembangunan_dokumentasi,Admin_pembangunan,Plan}.php`, `fweb/Pembangunan` | 🔴 | **P1** |

## H. Layanan Mandiri & Warga

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Akun warga **NIK + PIN**, dibuat operator, reset PIN | `controllers/Mandiri.php`, `Setting_mandiri.php` | ✅ | — |
| Login & beranda warga | `controllers/fmandiri/Beranda.php` | ✅ | — |
| Pengajuan surat warga | `fmandiri/Surat.php` | ✅ | — |
| Dokumen warga | `fmandiri/Dokumen.php` | ✅ | — |
| Pesan warga ↔ desa | `fmandiri/Pesan.php` | 🟡 | P2 (halaman menampilkan catatan operator; belum dua arah) |
| Pengaduan warga | `controllers/Pengaduan_admin.php`, `fweb/Pengaduan` | ✅ | P1 (backend + UI admin + halaman publik, form warga, dan pelacakan tiket mandiri selesai; sisa notifikasi status) |
| Bantuan untuk warga | `fmandiri/Bantuan.php` | 🔴 | P2 (belum ada halaman maupun use case bantuan di area warga) |
| Lapak / produk warga | `Modules/Lapak`, `fmandiri/{Lapak,Produk}.php` | 🔴 | P3 |
| Kehadiran perangkat | `Modules/Kehadiran`, `fmandiri/Kehadiran_perangkat.php` | 🔴 | P3 |
| Verifikasi surat publik (QR/token) | `fweb/Verifikasi_surat`, `fmandiri/Verifikasi.php` | ✅ | **P0** (token + QR gambar di cetak & PDF selesai 24 Okt 2026) |

## I. Analisis & Statistik

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Analisis (kategori, indikator, parameter, respon, laporan) | `Modules/Analisis` (19 file + 47 view) | 🟡 | P1 (survei sederhana: builder soal, responden, rekap, ekspor/impor CSV; kategori/indikator belum) |
| Statistik penduduk & bantuan | `controllers/Statistik.php`, `Statistik_bantuan.php` | 🟡 | P1 |
| IDM & SDGs | `controllers/Status_desa.php`, `fweb/{Idm,Sdgs}` | 🟡 | P2 |

## J. Web Publik

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Beranda + headline + slider | `fweb/Utama`, `partials/{headline,slider}` | ✅ | **P0** |
| Artikel/berita + arsip | `fweb/{Artikel,Arsip}` | ✅ | **P0** |
| Profil & pemerintah (perangkat) | `fweb/{Pemerintah,Sotk}` | ✅ | **P0** |
| Galeri | `fweb/Galeri` | ✅ | **P0** |
| Dokumen & produk hukum/peraturan | `fweb/{InformasiPublik,Embed}` | 🟡 | P1 |
| Statistik publik | `fweb/Statistik` | 🟡 | P1 |
| Peta & wilayah administratif | `fweb/{Peta,WilayahAdministratif}` | 🔴 | P1 (halaman masih placeholder, tanpa backend) |
| Pembangunan publik | `fweb/Pembangunan` | 🔴 | P1 (halaman masih placeholder; skema proyek sudah ada di migrasi `0024`) |
| Pengaduan publik | `fweb/Pengaduan` | ✅ | Dikerjakan di 3D: `/desa/pengaduan` (form anonim + daftar terpublikasi, identitas disamarkan) + `/desa/pengaduan/lacak` (tiket + identitas) |
| Kelompok & lembaga | `fweb/{Kelompok,Lembaga}` | 🟡 | P1 (halaman publik ada; anggota lembaga menyusul) |
| Inventaris publik | `fweb/Inventaris` | ✅ | — |
| APBDes publik | tema `partials/apbdesa` | ✅ | — |
| Suplemen, kesehatan, vaksin | `fweb/{Suplemen,Kesehatan,Vaksin}` | 🔴 | P2 |
| DPT publik | `fweb/Dpt` | 🔴 | P2 |
| Lapak publik | `fweb/Lapak`, `Modules/Lapak` | 🔴 | P3 |
| Kontak | `controllers/Kontak.php` | ✅ | **P0** |
| Komentar & pengunjung | `controllers/{Komentar,Pengunjung}.php` | 🔴 | P2 |
| Menu, widget, slider, teks berjalan, sosmed | `controllers/{Menu,Web_widget,Slider,Teks_berjalan,Sosmed}.php` | 🟡 | **P0** |
| **Tema/template** (ganti tema + opsi) | `controllers/{Theme,Pindai_tema}.php`, `themes/esensi` | ✅ | - |
| SEO: sitemap, robots, manifest, OG image | `controllers/{Sitemap,OgImage}.php` | ✅ | — (sitemap & robots sadar host; manifest + OG per desa sejak 25 Okt 2026) |
| Multi-desa & domain per desa | tidak ada di OpenSID (fitur baru) | 🔴 | **P1** (setelah P0) |

## K. Sistem & Operasional

| Modul | Bukti OpenSID | Status kita | Prioritas |
|---|---|---|---|
| Pengguna, grup, modul, RBAC | `controllers/{Pengguna,Man_user,Grup,Modul}.php` | ✅ | — |
| Identitas & pengaturan aplikasi | `controllers/{Identitas_desa,Setting_aplikasi}.php` | ✅ | — |
| Shortcut / menu admin | `controllers/Shortcut.php` | 🔴 | P2 (belum ada fitur shortcut) |
| Notifikasi, mailbox, SMS gateway | `controllers/{Notifikasi,Mailbox,Sms*}.php` | 🔴 | P2 |
| Database: backup/restore/optimasi | `controllers/{Database,Koneksi_database,Optimasi_gambar}.php` | 🔴 | P1 |
| Sinkronisasi & OpenDK | `controllers/{Sinkronisasi,Opendk_pesan}.php`, `fweb` | 🔴 | P3 |
| Plugin & pemasangan modul | `controllers/{Plugin,Install_modul}.php` | 🔴 | P3 |
| Log aktivitas / audit trail | `controllers/Info_sistem.php` | 🟡 | P1 |
| Token/OTP & keamanan login | `controllers/{Token,Otp,Securimage}.php` | 🟡 | P1 |

---

## Peta Prioritas Implementasi

Prioritas hanya menentukan urutan kerja, bukan scope produk.

### Gelombang 1 — Operasi harian

Penduduk + log, KK, RTM, surat lengkap + verifikasi publik, keuangan +
transparansi, inventaris + mutasi berjenjang, Bumindes inti, bantuan, layanan
mandiri warga, web publik + tema, pengaturan, kelompok/lembaga, dan perangkat.

### Gelombang 2 — Transparansi dan domain desa

Pembangunan + dokumentasi, pengaduan, pertanahan/persil, DPT/DTKS/suplemen,
statistik, peta/GIS, produk hukum, IDM/SDGs, analisis penuh, surat dinas,
backup database, audit log, dan keluaran lanjutan.

### Gelombang 3 — Ekosistem dan integrasi

Lapak, anjungan, buku tamu, kehadiran, Pelanggan, SMS/mailbox/notifikasi,
plugin, sinkronisasi/OpenDK, optimasi gambar, pemilihan, sinergi program,
vaksin/Covid, API internal/eksternal, TTE/BSrE, dan adapter pihak ketiga.

Semua gelombang wajib selesai untuk mencapai target produk. Status ✅ baru boleh
diberikan setelah Definition of Done di katalog terpenuhi.

---

## Kesimpulan

1. Proyek masih berada di fase pembangunan; target akhirnya adalah seluruh ID
   `OS-*`, bukan hanya T1/T2.
2. Banyak fondasi dan fitur inti sudah berjalan, tetapi fitur OpenSID lanjutan,
   modul tambahan, API, keluaran, dan integrasi masih menjadi pekerjaan.
3. Web publik tetap diprioritaskan karena merupakan permukaan yang langsung
   digunakan warga, tetapi setiap permukaan admin/warga/API juga wajib memiliki
   bukti.
4. Ringkasan 92 kelompok hanya baseline kasar dan sekarang dihitung sekitar
   52,2%; angka tersebut tidak mencakup seluruh detail katalog.
5. Status milestone harus mengikuti quality gate, test, UI, dan bukti end-to-end;
   klaim historis di arsip/ristek tidak mengubah status.
