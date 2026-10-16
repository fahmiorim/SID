# LAMPIRAN 03 — ENUM & TABEL REFERENSI OpenSID

Dokumen ini merupakan hasil inventarisasi **semua ENUM** dan **tabel referensi** beserta isinya pada codebase OpenSID di `D:\laragon\www\opensid`, untuk dijadikan bahan seed pada aplikasi baru (Next.js + Drizzle).

Tanggal analisis: 2026-10-16. Repo sumber **tidak diubah**.

## Ringkasan Sumber Data

| Sumber | Path | Keterangan |
|---|---|---|
| Enum PHP (class + `all()`) | `app\Enums\*.php` | Sumber utama label nilai enum |
| Enum native PHP 8.1 | `app\Enums\{AsalTanahKas,PeristiwaPenduduk,PeristiwaKeluarga,PeruntukanTanahKas,InventarisMenu}Enum.php` | Berbasis `enum ... : int` + `label()` |
| Enum modul | `Modules\Analisis\Enums\*`, `Modules\Kehadiran\Enums\*` | Tabel referensi analisis + kehadiran |
| Seeder enum → tabel | `app\database\seeders\DataAwal\StrukturTabelSeeder.php` (method `insertEnumToTable()` & `addDataMaster()`) | Menentukan tabel referensi mana diisi enum apa |
| Seeder data awal | `app\database\seeders\DataAwal\DataAwalSeeder.php`, `RentangUmur.php`, `Twebaset.php`, `KeuanganManualRefKegiatan.php`, `SettingAplikasi.php`, `SettingModul.php`, `GisSimbol.php`, `GrupAkses.php` | Data master non-enum |
| Struktur tabel | `donjo-app\models\migrations\struktur_tabel\2023_12_22_015242_create_*_table.php` | Definisi kolom |
| Helper referensi | `donjo-app\helpers\opensid_helper.php` (fungsi `ref()`, ±baris 1797–1957) | Pemetaan kode referensi ke enum |
| Impor klasifikasi surat | `app\Imports\KlasifikasiSuratImports.php` | Membaca `klasifikasi-surat.xlsx` (data tidak ada di source) |
| Konstanta model | `app\Models\*.php` | Magic number (status surat, gizi, dll.) |

> Catatan: `insertEnumToTable()` mengisi kolom `id` = **key** enum dan `nama` = **value/label** enum (kecuali didefinisikan lain). Sebagian besar tabel referensi diedarkan ulang (`truncate`) setiap seeding.

---

# BAGIAN 1 — DAFTAR SEMUA ENUM (nama, lokasi, nilai → label)

## 1.1 Enum di `app\Enums\`

### AgamaEnum — `app\Enums\AgamaEnum.php`
| Nilai | Label |
|---|---|
| 1 | ISLAM |
| 2 | KRISTEN |
| 3 | KATHOLIK |
| 4 | HINDU |
| 5 | BUDHA |
| 6 | KHONGHUCU |
| 7 | Kepercayaan Terhadap Tuhan YME / Lainnya |

### AktifEnum — `app\Enums\AktifEnum.php`
| Nilai | Label |
|---|---|
| 1 | Aktif |
| 0 | Tidak Aktif |

### AsalDanaEnum — `app\Enums\AsalDanaEnum.php`
| Nilai | Label |
|---|---|
| 1 | Pusat |
| 2 | Provinsi |
| 3 | Kab/Kota |
| 4 | Dana Desa |
| 5 | Lain-lain (Hibah) |

### AsalTanahKasEnum (enum native) — `app\Enums\AsalTanahKasEnum.php`
| Nilai | Label |
|---|---|
| 1 | APB Desa |
| 2 | Perolehan Lainnya yang Sah |
| 3 | Kekayaan Asli Desa |

### AsuransiEnum — `app\Enums\AsuransiEnum.php`
| Nilai | Label |
|---|---|
| 1 | Tidak/Belum Punya |
| 2 | BPJS Penerima Bantuan Iuran |
| 3 | BPJS Non Penerima Bantuan Iuran |
| 4 | BPJS Bantuan Daerah |
| 99 | Asuransi Lainnya |

### BahasaEnum — `app\Enums\BahasaEnum.php`
| Nilai | Label |
|---|---|
| 1 | LATIN |
| 2 | DAERAH |
| 3 | ARAB |
| 4 | ARAB DAN LATIN |
| 5 | ARAB DAN DAERAH |
| 6 | ARAB, LATIN DAN DAERAH |

### BidangBelanjaEnum — `app\Enums\BidangBelanjaEnum.php`
| Nilai | Label |
|---|---|
| 1 | Bidang Penyelenggaran Pemerintahan Desa |
| 2 | Bidang Pelaksanaan Pembangunan Desa |
| 3 | Bidang Pembinaan Kemasyarakatan Desa |
| 4 | Bidang Pemberdayaan Masyarakat Desa |
| 5 | Bidang Penanggulangan Bencana, Darurat Dan Mendesak Desa |

### CacatEnum — `app\Enums\CacatEnum.php`
| Nilai | Label |
|---|---|
| 1 | CACAT FISIK |
| 2 | CACAT NETRA/BUTA |
| 3 | CACAT RUNGU/WICARA |
| 4 | CACAT MENTAL/JIWA |
| 5 | CACAT FISIK DAN MENTAL |
| 6 | CACAT LAINNYA |
| 7 | TIDAK CACAT |

### CaraKBEnum — `app\Enums\CaraKBEnum.php`
| Nilai | Label |
|---|---|
| 1 | Pil |
| 2 | IUD |
| 3 | Suntik |
| 4 | Kondom |
| 5 | Susuk KB |
| 6 | Sterilisasi Wanita |
| 7 | Sterilisasi Pria |
| 99 | Lainnya |
| 100 | Tidak Menggunakan |

### DerajatSuratEnum — `app\Enums\DerajatSuratEnum.php`
| Nilai | Label |
|---|---|
| 1 | Biasa |
| 2 | Segera |
| 3 | Sangat Segera |

### DokumenEnum — `app\Enums\DokumenEnum.php`
| Nilai | Label |
|---|---|
| 1 | Informasi Publik |
| 2 | Keputusan Kepala Desa |
| 3 | Peraturan |

### FirebaseEnum — `app\Enums\FirebaseEnum.php`
Bukan enum lookup; berisi konfigurasi string (API URL, SERVER_KEY, SENDER_ID, URL subscribe topik). Lihat catatan keamanan pada Bagian 4.

### GolonganDarahEnum — `app\Enums\GolonganDarahEnum.php`
| Nilai | Label |
|---|---|
| 1 | A |
| 2 | B |
| 3 | AB |
| 4 | O |
| 5 | A+ |
| 6 | A- |
| 7 | B+ |
| 8 | B- |
| 9 | AB+ |
| 10 | AB- |
| 11 | O+ |
| 12 | O- |
| 13 | TIDAK TAHU |

### HamilEnum — `app\Enums\HamilEnum.php`
| Nilai | Label |
|---|---|
| 1 | HAMIL |
| 2 | TIDAK HAMIL |

### HubunganRTMEnum — `app\Enums\HubunganRTMEnum.php`
| Nilai | Label |
|---|---|
| 1 | Kepala Rumah Tangga |
| 2 | Anggota |

### InventarisMenuEnum (enum native, unit) — `app\Enums\InventarisMenuEnum.php`
Case: `DAFTAR`, `MUTASI`, `LAPORAN`, `LAPORAN_MUTASI`
| Case | Label | tip |
|---|---|---|
| DAFTAR | Daftar Inventaris | 1 |
| MUTASI | Daftar Mutasi | 2 |
| LAPORAN | Laporan Semua Aset | 1 |
| LAPORAN_MUTASI | Laporan Aset Yang Dihapus | 2 |

### InventarisSubMenuEnum (const array) — `app\Enums\InventarisSubMenuEnum.php`
| key | slug | label | header |
|---|---|---|---|
| 0 | laporan_inventaris | Laporan Semua Aset | Laporan Keseluruhan Aset Desa |
| 1 | inventaris_tanah | Tanah | Inventaris Tanah |
| 2 | inventaris_peralatan | Peralatan Dan Mesin | Inventaris Peralatan dan Mesin |
| 3 | inventaris_gedung | Gedung dan Bangunan | Inventaris Gedung dan Bangunan |
| 4 | inventaris_jalan | Jalan, Irigasi, dan Jaringan | Inventaris Jalan, Irigasi, dan Jaringan |
| 5 | inventaris_asset | Aset Tetap Lainnya | Inventaris Aset Tetap Lainnya |
| 6 | inventaris_kontruksi | Konstruksi dalam pengerjaan | Inventaris Konstruksi dalam Pengerjaan |

### JabatanKelompokEnum — `app\Enums\JabatanKelompokEnum.php`
| Nilai | Label |
|---|---|
| 1 | KETUA |
| 2 | WAKIL KETUA |
| 3 | SEKRETARIS |
| 4 | BENDAHARA |
| 90 | ANGGOTA |

### JawabanKepuasanEnum — `app\Enums\JawabanKepuasanEnum.php`
| Nilai | Label |
|---|---|
| 1 | Sangat Puas |
| 2 | Puas |
| 3 | Cukup Puas |
| 4 | Tidak Puas |

### JenisKelaminEnum — `app\Enums\JenisKelaminEnum.php`
| Nilai | Label |
|---|---|
| 1 | Laki-laki |
| 2 | Perempuan |

### JenisPeraturan — `app\Enums\JenisPeraturan.php`
| Nilai | Label |
|---|---|
| 0 | Peraturan {Sebutan Desa} |
| 1 | Peraturan Kepala {Sebutan Desa} |
| 2 | Peraturan Bersama Kepala {Sebutan Desa} |

### KarakterSuratEnum — `app\Enums\KarakterSuratEnum.php`
| Nilai | Label |
|---|---|
| 1 | Biasa |
| 2 | Terbatas |
| 3 | Rahasia |

### KategoriDokumenPeraturanEnum — `app\Enums\KategoriDokumenPeraturanEnum.php`
| Nilai | Label |
|---|---|
| 1 | Informasi Publik |
| 2 | Keputusan Kepala Desa |
| 3 | Peraturan |

### KategoriPublicEnum — `app\Enums\KategoriPublicEnum.php`
| Nilai | Label |
|---|---|
| 1 | Informasi Berkala |
| 2 | Informasi Serta-merta |
| 3 | Informasi Setiap Saat |
| 4 | Informasi Dikecualikan |

### KategoriPublik — `app\Enums\KategoriPublik.php`
| Nilai | Label |
|---|---|
| 1 | Informasi Berkala |
| 2 | Informasi Serta-merta |
| 3 | Informasi Setiap Saat |
| 4 | Informasi Dikecualikan |

### KategoriPublikEnum — `app\Enums\KategoriPublikEnum.php`
| Nilai | Label |
|---|---|
| 1 | Informasi Berkala |
| 2 | Informasi Serta-merta |
| 3 | Informasi Setiap Saat |
| 4 | Informasi Dikecualikan |

### KeluargaSejahteraEnum — `app\Enums\KeluargaSejahteraEnum.php`
| Nilai | Label |
|---|---|
| 1 | KELUARGA PRA SEJAHTERA |
| 2 | KELUARGA SEJAHTERA I |
| 3 | KELUARGA SEJAHTERA II |
| 4 | KELUARGA SEJAHTERA III |
| 5 | KELUARGA SEJAHTERA III PLUS |

### KeuanganRefRek1Enum — `app\Enums\KeuanganRefRek1Enum.php`
| Nilai | Label |
|---|---|
| "1." | ASET |
| "2." | KEWAJIBAN |
| "3." | EKUITAS |
| "4." | PENDAPATAN |
| "5." | BELANJA |
| "6." | PEMBIAYAAN |
| "7." | NON ANGGARAN |

### ListSasaranEnum — `app\Enums\ListSasaranEnum.php`
| Nilai | Label |
|---|---|
| 1 | NIK / Nama Penduduk |
| 2 | No.KK / Nama Kepala Keluarga |
| 3 | No. RTM / Nama Kepala Rumah Tangga |
| 4 | Kode Kelompok / Nama Ketua Kelompok |

### OfflineModeEnum — `app\Enums\OfflineModeEnum.php`
| Nilai | Label |
|---|---|
| "0" | Web bisa diakses publik |
| "1" | Web hanya bisa diakses petugas web |
| "2" | Web non-aktif sama sekali |

### PekerjaanEnum — `app\Enums\PekerjaanEnum.php`
| Nilai | Label |
|---|---|
| 1 | BELUM/TIDAK BEKERJA |
| 2 | MENGURUS RUMAH TANGGA |
| 3 | PELAJAR/MAHASISWA |
| 4 | PENSIUNAN |
| 5 | PEGAWAI NEGERI SIPIL (PNS) |
| 6 | TENTARA NASIONAL INDONESIA (TNI) |
| 7 | KEPOLISIAN RI (POLRI) |
| 8 | PERDAGANGAN |
| 9 | PETANI/PEKEBUN |
| 10 | PETERNAK |
| 11 | NELAYAN/PERIKANAN |
| 12 | INDUSTRI |
| 13 | KONSTRUKSI |
| 14 | TRANSPORTASI |
| 15 | KARYAWAN SWASTA |
| 16 | KARYAWAN BUMN |
| 17 | KARYAWAN BUMD |
| 18 | KARYAWAN HONORER |
| 19 | BURUH HARIAN LEPAS |
| 20 | BURUH TANI/PERKEBUNAN |
| 21 | BURUH NELAYAN/PERIKANAN |
| 22 | BURUH PETERNAKAN |
| 23 | PEMBANTU RUMAH TANGGA |
| 24 | TUKANG CUKUR |
| 25 | TUKANG LISTRIK |
| 26 | TUKANG BATU |
| 27 | TUKANG KAYU |
| 28 | TUKANG SOL SEPATU |
| 29 | TUKANG LAS/PANDAI BESI |
| 30 | TUKANG JAHIT |
| 31 | TUKANG GIGI |
| 32 | PENATA RIAS |
| 33 | PENATA BUSANA |
| 34 | PENATA RAMBUT |
| 35 | MEKANIK |
| 36 | SENIMAN |
| 37 | TABIB |
| 38 | PARAJI |
| 39 | PERANCANG BUSANA |
| 40 | PENTERJEMAH |
| 41 | IMAM MASJID |
| 42 | PENDETA |
| 43 | PASTOR |
| 44 | WARTAWAN |
| 45 | USTADZ/MUBALIGH |
| 46 | JURU MASAK |
| 47 | PROMOTOR ACARA |
| 48 | ANGGOTA DPR-RI |
| 49 | ANGGOTA DPD |
| 50 | ANGGOTA BPK |
| 51 | PRESIDEN |
| 52 | WAKIL PRESIDEN |
| 53 | ANGGOTA MAHKAMAH KONSTITUSI |
| 54 | ANGGOTA KABINET KEMENTERIAN |
| 55 | DUTA BESAR |
| 56 | GUBERNUR |
| 57 | WAKIL GUBERNUR |
| 58 | BUPATI |
| 59 | WAKIL BUPATI |
| 60 | WALIKOTA |
| 61 | WAKIL WALIKOTA |
| 62 | ANGGOTA DPRD PROVINSI |
| 63 | ANGGOTA DPRD KABUPATEN/KOTA |
| 64 | DOSEN |
| 65 | GURU |
| 66 | PILOT |
| 67 | PENGACARA |
| 68 | NOTARIS |
| 69 | ARSITEK |
| 70 | AKUNTAN |
| 71 | KONSULTAN |
| 72 | DOKTER |
| 73 | BIDAN |
| 74 | PERAWAT |
| 75 | APOTEKER |
| 76 | PSIKIATER/PSIKOLOG |
| 77 | PENYIAR TELEVISI |
| 78 | PENYIAR RADIO |
| 79 | PELAUT |
| 80 | PENELITI |
| 81 | SOPIR |
| 82 | PIALANG |
| 83 | PARANORMAL |
| 84 | PEDAGANG |
| 85 | PERANGKAT DESA |
| 86 | KEPALA DESA |
| 87 | BIARAWATI |
| 88 | WIRASWASTA |
| 89 | LAINNYA |

### PendidikanKKEnum — `app\Enums\PendidikanKKEnum.php`
| Nilai | Label |
|---|---|
| 1 | TIDAK/BELUM SEKOLAH |
| 2 | BELUM TAMAT SD/SEDERAJAT |
| 3 | TAMAT SD/SEDERAJAT |
| 4 | SLTP/SEDERAJAT |
| 5 | SLTA/SEDERAJAT |
| 6 | DIPLOMA I/II |
| 7 | AKADEMI/DIPLOMA III/S. MUDA |
| 8 | DIPLOMA IV/STRATA I |
| 9 | STRATA II |
| 10 | STRATA III |

### PendidikanSedangEnum — `app\Enums\PendidikanSedangEnum.php`
| Nilai | Label |
|---|---|
| 1 | BELUM MASUK TK/KELOMPOK BERMAIN |
| 2 | SEDANG TK/KELOMPOK BERMAIN |
| 3 | TIDAK PERNAH SEKOLAH |
| 4 | SEDANG SD/SEDERAJAT |
| 5 | TIDAK TAMAT SD/SEDERAJAT |
| 6 | SEDANG SLTP/SEDERAJAT |
| 19 | TIDAK TAMAT SLTP/SEDERAJAT |
| 7 | SEDANG SLTA/SEDERAJAT |
| 20 | TIDAK TAMAT SLTA/SEDERAJAT |
| 8 | SEDANG  D-1/SEDERAJAT |
| 9 | SEDANG D-2/SEDERAJAT |
| 10 | SEDANG D-3/SEDERAJAT |
| 11 | SEDANG  S-1/SEDERAJAT |
| 12 | SEDANG S-2/SEDERAJAT |
| 13 | SEDANG S-3/SEDERAJAT |
| 14 | SEDANG SLB A/SEDERAJAT |
| 15 | SEDANG SLB B/SEDERAJAT |
| 16 | SEDANG SLB C/SEDERAJAT |
| 17 | TIDAK DAPAT MEMBACA DAN MENULIS HURUF LATIN/ARAB |
| 18 | TIDAK SEDANG SEKOLAH |

### PendudukBidangEnum — `app\Enums\PendudukBidangEnum.php`
| Nilai | Label |
|---|---|
| 1 | Service Komputer |
| 2 | Operator Buldoser |
| 3 | Operator Komputer |
| 4 | Operator Genset |
| 5 | Service HP |
| 6 | Rias Pengantin |
| 7 | Design Grafis |
| 8 | Menjahit |
| 9 | Menulis |
| 10 | Reporter |
| 11 | Sosial Media Manajer |
| 12 | Manajemen Trainee |
| 13 | Kasir |
| 14 | HRD |
| 15 | Guru |
| 16 | Digital Marketing |
| 17 | Customer Services |
| 18 | Welder |
| 19 | Mekanik Alat Berat |
| 20 | Teknisi Listrik |
| 21 | Internet Marketing |

### PendudukKursusEnum — `app\Enums\PendudukKursusEnum.php`
| Nilai | Label |
|---|---|
| 1 | Kursus Komputer |
| 2 | Kursus Menjahit |
| 3 | Pelatihan Kelistrikan |
| 4 | Kursus Mekanik Motor |
| 5 | Pelatihan Security |
| 6 | Kursus Otomotif |
| 7 | Kursus Bahasa Inggris |
| 8 | Kursus Tata Kecantikan Kulit |
| 9 | Kursus Mengemudi |
| 10 | Kursus Tata Boga |
| 11 | Kursus Meubeler |
| 12 | Kursus Las |
| 13 | Kursus Sablon |
| 14 | Kursus Penerbangan |
| 15 | Kursus Desain Interior |
| 16 | Kursus Teknisi HP |
| 17 | Kursus Garment |
| 18 | Kursus Akupuntur |
| 19 | Kursus Senam |
| 20 | Kursus Pendidik PAUD |
| 21 | Kursus Baby Sitter |
| 22 | Kursus Desain Grafis |
| 23 | Kursus Bahasa Indonesia |
| 24 | Kursus Photografi |
| 25 | Kursus Expor Impor |
| 26 | Kursus Jurnalistik |
| 27 | Kursus Bahasa Arab |
| 28 | Kursus Bahasa Jepang |
| 29 | Kursus Anak Buah Kapal |
| 30 | Kursus Refleksi |
| 32 | Kursus Perhotelan |
| 33 | Kursus Tata Rias |
| 34 | Kursus Administrasi Perkantoran |
| 35 | Kursus Broadcasting |
| 36 | Kursus Kerajinan Tangan |
| 37 | Kursus Sosial Media Marketing |
| 38 | Kursus Internet Marketing |
| 39 | Kursus Sekretaris |
| 40 | Kursus Perpajakan |
| 41 | Kursus Publik Speaking |
| 42 | Kursus Publik Relation |
| 43 | Kursus Batik |
| 44 | Kursus Pengobatan Tradisional |

> Catatan: id 31 tidak ada (lompatan pada enum).

### PeristiwaKeluargaEnum (enum native) — `app\Enums\PeristiwaKeluargaEnum.php`
| Nilai | Label |
|---|---|
| 1 | Baru Lahir |
| 2 | Kepala Keluarga Mati |
| 3 | Kepala Keluarga Pindah |
| 4 | Kepala Keluarga Hilang |
| 5 | Keluarga Baru Datang |
| 6 | Kepala Keluarga Pergi |
| 11 | Kepala Keluarga Tidak Valid |
| 12 | Anggota Keluarga Pecah |
| 13 | Keluarga Hapus |
| 14 | Kepala Keluarga Kembali Hidup |

### PeristiwaPendudukEnum (enum native) — `app\Enums\PeristiwaPendudukEnum.php`
| Nilai | Label |
|---|---|
| 1 | Baru Lahir |
| 2 | Mati |
| 3 | Pindah Keluar |
| 4 | Hilang |
| 5 | Baru Pindah Masuk |
| 6 | Tidak Tetap Pergi |

### PerubahanDataPiEnum — `app\Enums\PerubahanDataPiEnum.php`
| Nilai (string) | Label |
|---|---|
| nama | NAMA |
| golongan_darah_id | GOLONGAN DARAH |
| alamat_sekarang | ALAMAT |
| nama_ayah | NAMA ORANG TUA (AYAH) |
| nama_ibu | NAMA ORANG TUA (IBU) |
| sex | JENIS KELAMIN |
| tanggallahir | TANGGAL LAHIR |
| status_kawin | STATUS PERKAWINAN |
| tanggalperkawinan | TANGGAL PERKAWINAN |
| warganegara_id | KEWARGANEGARAAN |
| dokumen_pasport | DOKUMEN IMIGRASI |

### PeruntukanTanahKasEnum (enum native) — `app\Enums\PeruntukanTanahKasEnum.php`
| Nilai | Label |
|---|---|
| 1 | Sewa |
| 2 | Pinjam Pakai |
| 3 | Kerjasama Pemanfaatan |
| 4 | Bangun Guna Serah atau Bangun Serah Guna |

### PindahEnum — `app\Enums\PindahEnum.php`
| Nilai | Label |
|---|---|
| 1 | Pindah keluar Desa/Kelurahan |
| 2 | Pindah keluar Kecamatan |
| 3 | Pindah keluar Kabupaten/Kota |
| 4 | Pindah keluar Provinsi |

### ReferensiEnum — `app\Enums\ReferensiEnum.php`
Pemetaan nama referensi → nama tabel.
| Konstanta | Nama Referensi | Tabel |
|---|---|---|
| JENIS_KELAMIN | Jenis Kelamin | tweb_penduduk_sex |
| STATUS_HUBUNGAN_DALAM_KELUARGA | Status Hubungan Dalam Keluarga | tweb_penduduk_hubungan |
| STATUS_HUBUNGAN_DALAM_RUMAH_TANGGA | Status Hubungan Dalam Rumah Tangga | tweb_rtm_hubungan |
| AGAMA | Agama | tweb_penduduk_agama |
| PENDIDIKAN_DALAM_KK | Pendidikan Dalam KK | tweb_penduduk_pendidikan_kk |
| PENDIDIKAN_SEDANG_DITEMPUH | Pendidikan Sedang Ditempuh | tweb_penduduk_pendidikan |
| PEKERJAAN | Pekerjaan | tweb_penduduk_pekerjaan |
| STATUS_PERKAWINAN | Status Perkawinan | tweb_penduduk_kawin |
| WARGA_NEGARA | Warga Negara | tweb_penduduk_warganegara |
| GOLONGAN_DARAH | Golongan Darah | tweb_golongan_darah |
| STATUS_PENDUDUK | Status Penduduk | tweb_penduduk_status |
| STATUS_DASAR | Status Dasar | tweb_status_dasar |
| CACAT | Cacat | tweb_cacat |
| SAKIT_MENAHUN | Sakit Menahun | *(tidak dipetakan ke tabel di enum)* |
| CARA_KB | Cara KB | tweb_cara_kb |
| ASURANSI | Asuransi | tweb_penduduk_asuransi |
| DUSUN | Dusun | tweb_wil_clusterdesa |
| KELUARGA_SEJAHTERA | Keluarga Sejahtera | tweb_keluarga_sejahtera |

### SakitMenahunEnum — `app\Enums\SakitMenahunEnum.php`
| Nilai | Label |
|---|---|
| 1 | JANTUNG |
| 2 | LEVER |
| 3 | PARU-PARU |
| 4 | KANKER |
| 5 | STROKE |
| 6 | DIABETES MELITUS |
| 7 | GINJAL |
| 8 | MALARIA |
| 9 | LEPRA/KUSTA |
| 10 | HIV/AIDS |
| 11 | GILA/STRESS |
| 12 | TBC |
| 13 | ASTHMA |
| 15 | ZOONOTIK |
| 14 | TIDAK ADA/TIDAK SAKIT |

### SasaranEnum — `app\Enums\SasaranEnum.php`
| Nilai | Label |
|---|---|
| 1 | Penduduk |
| 2 | Keluarga / KK |
| 3 | Rumah Tangga |
| 4 | Kelompok/Organisasi Kemasyarakatan |

### SatuanWaktuEnum — `app\Enums\SatuanWaktuEnum.php`
| Nilai | Label |
|---|---|
| 1 | Hari |
| 2 | Minggu |
| 3 | Bulan |
| 4 | Tahun |

### SHDKEnum (Status Hubungan Dalam Keluarga) — `app\Enums\SHDKEnum.php`
| Nilai | Label |
|---|---|
| 1 | KEPALA KELUARGA |
| 2 | SUAMI |
| 3 | ISTRI |
| 4 | ANAK |
| 5 | MENANTU |
| 6 | CUCU |
| 7 | ORANGTUA |
| 8 | MERTUA |
| 9 | FAMILI LAIN |
| 10 | PEMBANTU |
| 11 | LAINNYA |

### SistemEnum — `app\Enums\SistemEnum.php`
| Nilai | Label |
|---|---|
| 1 | Website |
| 2 | Administrator |
| 4 | Kehadiran |

### StatusDasarEnum — `app\Enums\StatusDasarEnum.php`
| Nilai | Label |
|---|---|
| 1 | Hidup |
| 2 | Mati |
| 3 | Pindah |
| 4 | Hilang |
| 6 | Pergi |
| 9 | Tidak Valid |

### StatusDasarKKEnum — `app\Enums\StatusDasarKKEnum.php`
| Nilai | Label |
|---|---|
| 1 | KK Aktif |
| 2 | KK Hilang/Pindah/Mati |
| 3 | KK Kosong |

### StatusEnum — `app\Enums\StatusEnum.php`
| Nilai | Label |
|---|---|
| 1 | Ya |
| 0 | Tidak |

### StatusKawinEnum — `app\Enums\StatusKawinEnum.php`
| Nilai | Label |
|---|---|
| 1 | BELUM KAWIN |
| 2 | KAWIN |
| 3 | CERAI HIDUP |
| 4 | CERAI MATI |

### StatusKawinSpesifikEnum — `app\Enums\StatusKawinSpesifikEnum.php`
| Nilai | Label |
|---|---|
| 1 | BELUM KAWIN |
| 2 | KAWIN TERCATAT |
| 21 | KAWIN BELUM TERCATAT |
| 3 | CERAI HIDUP TERCATAT |
| 31 | CERAI HIDUP BELUM TERCATAT |
| 4 | CERAI MATI |

### StatusKTPEnum — `app\Enums\StatusKTPEnum.php`
| Nilai | Label |
|---|---|
| 2 | BELUM REKAM |
| 3 | SUDAH REKAM |
| 4 | CARD PRINTED |
| 5 | PRINT READY RECORD |
| 6 | CARD SHIPPED |
| 7 | SENT FOR CARD PRINTING |
| 8 | CARD ISSUED |
| 1 | BELUM WAJIB |

### StatusPendudukEnum — `app\Enums\StatusPendudukEnum.php`
| Nilai | Label |
|---|---|
| 1 | TETAP |
| 2 | TIDAK TETAP |

### StatusPengaduanEnum — `app\Enums\StatusPengaduanEnum.php`
| Nilai | Label |
|---|---|
| 1 | Menunggu Diproses |
| 2 | Sedang Diproses |
| 3 | Selesai Diproses |

### StatusRekamEnum — `app\Enums\StatusRekamEnum.php`
| Nilai | Label |
|---|---|
| 1 | BELUM |
| 2 | KTP-EL |
| 3 | KIA |

### StatusRTMEnum — `app\Enums\StatusRTMEnum.php`
| Nilai | Label |
|---|---|
| 1 | Ya |
| 0 | Tidak |
| 2 | Tanpa Kepala Keluarga |

### StatusSuratKecamatanEnum — `app\Enums\StatusSuratKecamatanEnum.php`
| Nilai | Label |
|---|---|
| 1 | Tidak Aktif |
| 2 | Belum Dikirim |
| 3 | Sudah Dikirim |

### SukuEnum — `app\Enums\SukuEnum.php` (262 nilai; key=value keduanya string)
Nilai const → value (label suku). Dipakai pada field `suku` (disimpan sebagai **string**, bukan id).
```
ACEH=Aceh; ALAS=Alas; ALOR=Alor; AMBON=Ambon; AMPANA=Ampana; ANAK_DALAM=Anak Dalam;
ANEUK_JAMEE=Aneuk Jamee; ARAB_ORANG_HADHRAMI=Arab: Orang Hadhrami; ARU=Aru; ASMAT=Asmat;
BARE'E=Bare'e; BANTEN=Banten; BESEMAH=Besemah; BALI=Bali; BALANTAK=Balantak; BANGGAI=Banggai;
BADUY=Baduy; BAJAU=Bajau; BANJAR=Banjar; BATAK=Batak; BATAK_KARO=Batak Karo; MANDAILING=Mandailing;
ANGKOLA=Angkola; TOBA=Toba; PAKPAK=Pakpak; SIMALUNGUN=Simalungun; BATIN=Batin; BAWEAN=Bawean;
BENTONG=Bentong; BERAU=Berau; BETAWI=Betawi; BIMA=Bima; BOTI=Boti; BOLANG_MONGONDOW=Bolang Mongondow;
BUGIS=Bugis; BUNGKU=Bungku; BURU=Buru; BUOL=Buol; BULUNGAN=Bulungan; BUTON=Buton; BONAI=Bonai;
CHAM=Cham; CIREBON=Cirebon; DAMAL=Damal; DAMPELES=Dampeles; DANI=Dani; DAIRI=Dairi; DAYA=Daya;
DAYAK=Dayak; DOMPU=Dompu; DONGGO=Donggo; DONGGA=Dongga; DONDO=Dondo; DURI=Duri; EROPA=Eropa;
FLORES=Flores; LAMAHOLOT=Lamaholot; GAYO=Gayo; GORONTALO=Gorontalo; GUMAI=Gumai; INDIA=India;
JAWA=Jawa; TENGGER=Tengger; OSING=Osing; SAMIN=Samin; JAMBI=Jambi; JEPANG=Jepang; KEI=Kei;
KAILI=Kaili; KAMPAR=Kampar; KAUR=Kaur; KAYU_AGUNG=Kayu Agung; KERINCI=Kerinci; KOMERING=Komering;
KONJO_PEGUNUNGAN=Konjo Pegunungan; KONJO_PESISIR=Konjo Pesisir; KOTO=Koto; KUBU=Kubu; KULAWI=Kulawi;
KUTAI=Kutai; KLUET=Kluet; KOREA=Korea; KRUI=Krui; LAUT=Laut,; LAMPUNG=Lampung; LEMATANG=Lematang;
LEMBAK=Lembak; LINTANG=Lintang; LOM=Lom; LORE=Lore; LUBU=Lubu; MORONENE=Moronene; MADURA=Madura;
MAKASSAR=Makassar; MAMASA=Mamasa; MANDA=Manda; MELAYU=Melayu; MENTAWAI=Mentawai; MINAHASA=Minahasa;
PONOSAKAN=Ponosakan; MINANGKABAU=Minangkabau; MONGONDOW=Mongondow; MORI=Mori; MUKO_MUKO=Muko-Muko;
MUNA=Muna; MUYU=Muyu; MEKONGGA=Mekongga; MORO=Moro; NIAS=Nias; NGADA=Ngada; OGAN=Ogan; OCU=Ocu;
PADOE=Padoe; PAPUA=Papua; PALEMBANG=Palembang; PAMONA=Pamona; PESISI=Pesisi; PASIR=Pasir; PUBIAN=Pubian;
PATTAE=Pattae; PAKISTANI=Pakistani; PERANAKAN=Peranakan; RAWA=Rawa; REJANG=Rejang; ROTE=Rote;
RONGGA=Rongga; ROHINGYA=Rohingya; SABU=Sabu; SALUAN=Saluan; SAMBAS=Sambas; SANGI=Sangi; SASAK=Sasak;
SEKAK_BANGKA=Sekak Bangka; SEKAYU=Sekayu; SEMENDO=Semendo; SERAWAI=Serawai; SIMEULUE=Simeulue;
SIGULAI=Sigulai; SULUK=Suluk; SUMBAWA=Sumbawa; SUMBA=Sumba; SUNDA=Sunda; SUNGKAI=Sungkai; TALAU=Talau;
TALANG_MAMAK=Talang Mamak; TAMIANG=Tamiang; TERNATE=Ternate; TIDORE=Tidore; TIDUNG=Tidung; TIMOR=Timor;
TIONGHOA=Tionghoa; TOJO=Tojo; TORAJA=Toraja; TOLAKI=Tolaki; TOLI_TOLI=Toli Toli; TOMINI=Tomini;
UNA_UNA=Una-una; ULU=Ulu; WOLIO=Wolio;
AMPU=Ampu; AMBACANG_LILIN=Ambacang Lilin; ANDOMO=Andomo; BACIN=Bacin;
BALAIMANSIANG_MANSIANG=Balaimansiang (Mansiang); BALAIGAMBA=Balaigamba; BANUHAMPU=Banuhampu;
BARINGIN=Baringin; BARIANG=Bariang; BAPAYUANG=Bapayuang; BARAGUANG=Baraguang; BULUHKASOK=Buluhkasok;
BATUPAEK=Batupaek; BATUKAMBIANG=Batukambiang; BENDANG=Bendang; BICU=Bicu; BODI=Bodi; BONUO=Bonuo;
CANIAGO=Caniago; CUPAK=Cupak; DALIMO=Dalimo; DOMO=Domo; DURIAN=Durian; GALAPUANG=Galapuang;
GANTIANG=Gantiang; GUCI=Guci; GUDAM=Gudam; GUGUN=Gugun; HARAU=Harau; JAMBAK=Jambak; KABARU=Kabaru;
KALUMPANG=Kalumpang; KATAPANG=Katapang; KAMPAI=Kampai; KOTO_MINANGKABAU=Koto (Minangkabau);
KORONGGADANG=Koronggadang; KORONGPANJANG=Korongpanjang; KORONGDALAM=Korongdalam; KUTIANYIA=Kutianyia;
LIMOPANJANG=Limopanjang; LIMOSINGKEK=Limosingkek; LIMOKORONG=Limokorong; LUBUKBATANG=Lubukbatang;
MAIH=Maih; MALAYU=Malayu; MANDAILING_MINANGKABAU=Mandailing (Minangkabau); MANDALIKO=Mandaliko;
MEJAN=Mejan; MUAROBASA=Muarobasa; NANLIMO=Nanlimo; NANANAM=Nananam; NANTUJUAH=Nantujuah;
NANSAMBILAN=Nansambilan; NANGKOPUH_KONDANG_KOPUH=Nangkopuh/Kondang Kopuh; NILIANG=Niliang;
PAGACANCANG=Pagacancang; PARIKCANCANG=Parikcancang; PANGIAN=Pangian; PAROBEK=Parobek;
PANAMPUANG=Panampuang; PAUH=Pauh; PANAI=Panai; PANAI_LINJUANG=Panai Linjuang; PANYALAI=Panyalai;
PIBODA_PAYOBADA=Piboda (Payobada); PILIANG=Piliang; PINYANGEK=Pinyangek; PITOPANG=Pitopang;
PUNGKUIK=Pungkuik; PONGGANG=Ponggang; RABU=Rabu; RAJODANI=Rajodani; SALAYAN=Salayan; SALO=Salo;
SAMBILAN=Sambilan; SIKUMBANG=Sikumbang; SIJANGKO=Sijangko; SIMAUANG=Simauang; SIGANDANG=Sigandang;
SIDAUA=Sidaua; SIMABUA=Simabua; SINAPA=Sinapa; SINGKUAN=Singkuan; SINGKUANG=Singkuang; SIPISANG=Sipisang;
SITABEK=Sitabek; SITIMBAGO=Sitimbago; SITUNGGANG=Situnggang; SOBORANG=Soborang; SUMAGEK=Sumagek;
SUMPU=Sumpu; SUMPADANG=Sumpadang; SUPANJANG=Supanjang; TAMPUNIK=Tampunik; TANJUANG=Tanjuang;
TAMBANGPADANG=Tambangpadang; TIGOLAREH=Tigolareh; TOBO=Tobo; TONGAH=Tongah; TOLANG=Tolang; TUJUAH=Tujuah;
TUJUAHINDU=Tujuahindu; TIGONINIAK=Tigoniniak; LAINNYA=Lainnya
```
> Sebagian nilai memiliki spasi/trailing space (mis. `Bulungan `, `Dani `, `Eropa `). Untuk seed, **trim** disarankan.

### SumberDanaEnum — `app\Enums\SumberDanaEnum.php`
| Nilai | Label |
|---|---|
| 1 | Pendapatan Asli Desa (PAD) |
| 2 | Pendapatan Transfer (Dana Desa) |
| 3 | Pendapatan Transfer (Bagian dari Hasil Pajak dan Retribusi Daerah Kabupaten/Kota) |
| 4 | Pendapatan Transfer (Alokasi Dana Desa) |
| 5 | Pendapatan Transfer (Bantuan Keuangan dari APBD Provinsi) |
| 6 | Pendapatan Transfer (Bantuan Keuangan APBD Kabupaten/Kota) |
| 7 | Pendapatan Lain |

### TampilanArtikelEnum — `app\Enums\TampilanArtikelEnum.php`
| Nilai | Label |
|---|---|
| 1 | Konten + Sidebar Kanan |
| 2 | Konten + Sidebar Kiri |
| 3 | Konten Lebar Penuh |

### TipeLinkEnum — `app\Enums\TipeLinkEnum.php`
| Nilai | Label |
|---|---|
| 1 | Artikel Statis |
| 8 | Kategori Artikel |
| 2 | Statistik Penduduk |
| 3 | Statistik Keluarga |
| 4 | Statistik Program Bantuan |
| 12 | Statistik Kesehatan |
| 5 | Halaman Statis Lain |
| 6 | Artikel Keuangan |
| 7 | Kelompok |
| 11 | Lembaga |
| 9 | Data Suplemen |
| 10 | Status IDM |
| 88 | Embed |
| 99 | Eksternal |

### WargaNegaraEnum — `app\Enums\WargaNegaraEnum.php`
| Nilai | Label |
|---|---|
| 1 | WNI |
| 2 | WNA |
| 3 | DUA KEWARGANEGARAAN |

## 1.2 Enum di `app\Enums\Dtks\`

### DtksEnum — `app\Enums\Dtks\DtksEnum.php`
| Nilai | Label |
|---|---|
| 1 (REGSOS_EK2021_RT) | REGSOS-EK2021.RT |
| 2 (REGSOS_EK2022_K) | REGSOSEK2022.K |
| VERSION_CODE | 2 (konstanta versi) |

### Regsosek2022kEnum — `app\Enums\Dtks\Regsosek2022kEnum.php`
Enum besar berisi banyak array referensi kuesioner Regsosek 2022 (kondisi bangunan, air, listrik, bahan bakar, jamban, pendidikan, pekerjaan, usaha, internet, kesehatan, dll.). Semua nilai adalah kode → label.

**Tidak disalin utuh di sini** (24 KB) karena berupa banyak array tanpa nama konstanta yang jelas di source. Rujuk file: `app\Enums\Dtks\Regsosek2022kEnum.php`. Contoh array penting (nilai → label):
| Kode | Label |
|---|---|
| YA_TIDAK: 1 / 2 | Ya / Tidak |
| Status KK: 0 / 1 / 2 | KK Sesuai / Keluarga Induk / Keluarga pecahan |
| Kelayakan: 1–5 | Terisi lengkap / Terisi tidak lengkap / Tidak ada responden / Responden menolak / Keluarga pindah |
| Kepemilikan rumah: 1–6 | Milik sendiri / Kontrak/sewa / Bebas sewa / Dinas / Lainnya / Menumpang & Kepemilikan Bersama |
| Bahan bakar memasak: 1–12 | Listrik / Gas 5,5kg / Gas 12kg / Gas 3kg / Gas kota / Biogas / Minyak tanah / Briket / Arang / Kayu bakar / Lainnya / Tidak memasak |
| Pendidikan: 1/2/3 | Tidak/belum pernah sekolah / Masih sekolah / Tidak bersekolah lagi |
| Ijazah: 01–23 | Paket A, SDLB, SD, MI, SPM/PDF Ula, Paket B, SMP LB, SMP, MTs, SPM/PDF Wustha, Paket C, SMLB, SMA, MA, SMK, MAK, SPM/PDF Ulya, D1/D2/D3, D4/S1, Profesi, S2, S3, Tidak Punya Ijazah SD |
| Lapangan usaha: 01–26 | Pertanian padi & palawija, Hortikultura, Perkebunan, Perikanan, Peternakan, … , Aktivitas badan internasional |
| Status pekerjaan: 1–8 | Berusaha sendiri, … , Pekerja keluarga/tidak dibayar |
| Penyakit: 01–18 | Tidak Ada, Hipertensi, Rematik, Asma, Masalah jantung, Diabetes, TBC, Stroke, Kanker, Gagal ginjal, Haemophilia, HIV/AIDS, Kolesterol, Sirosis Hati, Thalasemia, Leukemia, Alzheimer, Lainnya |
| Jaminan kesehatan: 0/1/2/4/8/99 | Tidak memiliki / PBI-JKN / JKN Mandiri / JKN Pemberi Kerja / Jamkes lainnya / Lainnya |

> `[data tidak ditemukan]` nama konstanta resmi tiap array di file (hanya berisi `public const X = [...]`). Untuk seed portabel, ekstrak manual dari file.

## 1.3 Enum di `app\Enums\Statistik\`

### StatistikEnum — `app\Enums\Statistik\StatistikEnum.php`
| Nilai | Label |
|---|---|
| 'penduduk' | Penduduk |
| 'keluarga' | Keluarga / KK |

### StatistikPendudukEnum — `app\Enums\Statistik\StatistikPendudukEnum.php`
Berisi `['key','slug','label']` per jenis statistik penduduk:
| key | slug | label |
|---|---|---|
| 13 | rentang-umur | Rentang Umur |
| 15 | kategori-umur | Kategori Umur |
| 0 | pendidikan-dalam-kk | Pendidikan Dalam KK |
| 14 | pendidikan-sedang-ditempuh | Pendidikan Sedang Ditempuh |
| 1 | pekerjaan | Pekerjaan |
| 2 | status-perkawinan | Status Perkawinan |
| 3 | agama | Agama |
| 4 | jenis-kelamin | Jenis Kelamin |
| 'hubungan_kk' | hubungan-dalam-kk | Hubungan Dalam KK |
| 5 | warga-negara | Warga Negara |
| 6 | status-penduduk | Status Penduduk |
| 7 | golongan-darah | Golongan Darah |
| 9 | penyandang-disabilitas | Penyandang Disabilitas |
| 10 | penyakit-menahun | Penyakit Menahun |
| 16 | akseptor-kb | Akseptor KB |
| 17 | akta-kelahiran | Akta Kelahiran |
| 18 | kepemilikan-ktp | Kepemilikan KTP |
| 19 | asuransi-kesehatan | Asuransi Kesehatan |
| 'covid' | status-covid | Status Covid |
| 'suku' | suku-etnis | Suku / Etnis |
| 'marga' | marga | Marga |
| 'adat' | adat | Adat |
| 'pekerja_migran' | pekerja_migran | Pekerja Migran |
| 'bpjs-tenagakerja' | bpjs-ketenagakerjaan | BPJS Ketenagakerjaan |
| 'status-asuransi-kesehatan' | status_asuransi_kesehatan | Status Kepersertaan Asuransi Kesehatan |
| 'hamil' | status-kehamilan | Status Kehamilan |
| 'kia' | kepemilikan-kia | Kepemilikan KIA |
| 'akta-kematian' | kepemilikan-akta-kematian | Kepemilikan Akta Kematian |

### StatistikKeluargaEnum — `app\Enums\Statistik\StatistikKeluargaEnum.php`
| key | slug | label | url |
|---|---|---|---|
| kelas_sosial | kelas-sosial | Kelas Sosial | statistik/kelas-sosial |

### StatistikRtmEnum — `app\Enums\Statistik\StatistikRtmEnum.php`
| key | slug | label |
|---|---|---|
| bdt | bdt | BDT |
| dtsen | dtsen | DTSEN |

### StatistikJenisBantuanEnum — `app\Enums\Statistik\StatistikJenisBantuanEnum.php`
| key | slug | label |
|---|---|---|
| bantuan_penduduk | bantuan-penduduk | Bantuan Penduduk |
| bantuan_keluarga | bantuan-keluarga | Bantuan Keluarga |

## 1.4 Enum di `Modules\`

### AnalisisRefStateEnum — `Modules\Analisis\Enums\AnalisisRefStateEnum.php`
| Nilai | Label |
|---|---|
| 1 | Belum Entri / Pedataan |
| 2 | Sedang Dalam Pendataan |
| 3 | Selesai Entri / Pedataan |

### AnalisisRefSubjekEnum — `Modules\Analisis\Enums\AnalisisRefSubjekEnum.php`
| Nilai | Label |
|---|---|
| 1 | Penduduk |
| 2 | Keluarga / KK |
| 3 | Rumah Tangga |
| 4 | Kelompok |
| 5 | Desa |
| 6 | Dusun |
| 7 | Rukun Warga (RW) |
| 8 | Rukun Tetangga (RT) |

### AnalisisTipeIndikatorEnum — `Modules\Analisis\Enums\AnalisisTipeIndikatorEnum.php`
| Nilai | Label |
|---|---|
| 1 | Pilihan (Tunggal) |
| 2 | Pilihan (Ganda) |
| 3 | Isian angka |
| 4 | Isian Tulisan |

### StatusApproval — `Modules\Kehadiran\Enums\StatusApproval.php`
| Nilai (string) | Label |
|---|---|
| pending | Menunggu Persetujuan |
| approved | Disetujui |
| rejected | Ditolak |

### JenisIzin — `Modules\Kehadiran\Enums\JenisIzin.php`
| Nilai (string) | Label | maxDays |
|---|---|---|
| izin | Izin | 3 |
| sakit | Sakit | null |
| dinas_luar_kota | Dinas Luar Kota | null |
| cuti | Cuti | 12 |
| lainnya | Lainnya | 1 |

---

# BAGIAN 2 — TABEL REFERENSI + ISI DATA

**Sumber utama seed:** `app\database\seeders\DataAwal\StrukturTabelSeeder.php` (method `addDataMaster()`), plus `DataAwalSeeder.php`, `RentangUmur.php`.
**Struktur kolom:** `donjo-app\models\migrations\struktur_tabel\2023_12_22_015242_create_<nama>_table.php`.

## 2.1 Tabel referensi kependudukan (diisi dari Enum)

### tweb_penduduk_agama — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: `insertEnumToTable('tweb_penduduk_agama', AgamaEnum::class)` (StrukturTabelSeeder.php:610)
| id | nama |
|---|---|
| 1 | ISLAM |
| 2 | KRISTEN |
| 3 | KATHOLIK |
| 4 | HINDU |
| 5 | BUDHA |
| 6 | KHONGHUCU |
| 7 | Kepercayaan Terhadap Tuhan YME / Lainnya |

### tweb_penduduk_sex — kolom: `id` (int PK), `nama` (varchar 15, null)
Sumber: baris 617 (JenisKelaminEnum)
| id | nama |
|---|---|
| 1 | Laki-laki |
| 2 | Perempuan |

### tweb_penduduk_hubungan (SHDK) — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: baris 612 (SHDKEnum)
| id | nama |
|---|---|
| 1 | KEPALA KELUARGA |
| 2 | SUAMI |
| 3 | ISTRI |
| 4 | ANAK |
| 5 | MENANTU |
| 6 | CUCU |
| 7 | ORANGTUA |
| 8 | MERTUA |
| 9 | FAMILI LAIN |
| 10 | PEMBANTU |
| 11 | LAINNYA |

### tweb_penduduk_pekerjaan — kolom: `id` (int PK), `nama` (varchar 100, null)
Sumber: baris 614 (PekerjaanEnum) — 89 baris (id 1–89), lihat tabel PekerjaanEnum di Bagian 1.

### tweb_penduduk_pendidikan — kolom: `id` (tinyint PK), `nama` (varchar 50)
Sumber: baris 615 (PendidikanSedangEnum)
| id | nama |
|---|---|
| 1 | BELUM MASUK TK/KELOMPOK BERMAIN |
| 2 | SEDANG TK/KELOMPOK BERMAIN |
| 3 | TIDAK PERNAH SEKOLAH |
| 4 | SEDANG SD/SEDERAJAT |
| 5 | TIDAK TAMAT SD/SEDERAJAT |
| 6 | SEDANG SLTP/SEDERAJAT |
| 7 | SEDANG SLTA/SEDERAJAT |
| 8 | SEDANG  D-1/SEDERAJAT |
| 9 | SEDANG D-2/SEDERAJAT |
| 10 | SEDANG D-3/SEDERAJAT |
| 11 | SEDANG  S-1/SEDERAJAT |
| 12 | SEDANG S-2/SEDERAJAT |
| 13 | SEDANG S-3/SEDERAJAT |
| 14 | SEDANG SLB A/SEDERAJAT |
| 15 | SEDANG SLB B/SEDERAJAT |
| 16 | SEDANG SLB C/SEDERAJAT |
| 17 | TIDAK DAPAT MEMBACA DAN MENULIS HURUF LATIN/ARAB |
| 18 | TIDAK SEDANG SEKOLAH |
| 19 | TIDAK TAMAT SLTP/SEDERAJAT |
| 20 | TIDAK TAMAT SLTA/SEDERAJAT |

### tweb_penduduk_pendidikan_kk — kolom: `id` (int PK), `nama` (varchar 50)
Sumber: baris 616 (PendidikanKKEnum)
| id | nama |
|---|---|
| 1 | TIDAK/BELUM SEKOLAH |
| 2 | BELUM TAMAT SD/SEDERAJAT |
| 3 | TAMAT SD/SEDERAJAT |
| 4 | SLTP/SEDERAJAT |
| 5 | SLTA/SEDERAJAT |
| 6 | DIPLOMA I/II |
| 7 | AKADEMI/DIPLOMA III/S. MUDA |
| 8 | DIPLOMA IV/STRATA I |
| 9 | STRATA II |
| 10 | STRATA III |

### tweb_penduduk_kawin — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: baris 613 (StatusKawinEnum)
| id | nama |
|---|---|
| 1 | BELUM KAWIN |
| 2 | KAWIN |
| 3 | CERAI HIDUP |
| 4 | CERAI MATI |

### tweb_golongan_darah — kolom: `id` (int PK), `nama` (varchar 15, null)
Sumber: baris 609 (GolonganDarahEnum)
| id | nama |
|---|---|
| 1 | A |
| 2 | B |
| 3 | AB |
| 4 | O |
| 5 | A+ |
| 6 | A- |
| 7 | B+ |
| 8 | B- |
| 9 | AB+ |
| 10 | AB- |
| 11 | O+ |
| 12 | O- |
| 13 | TIDAK TAHU |

### tweb_cacat — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: baris 607 (CacatEnum)
| id | nama |
|---|---|
| 1 | CACAT FISIK |
| 2 | CACAT NETRA/BUTA |
| 3 | CACAT RUNGU/WICARA |
| 4 | CACAT MENTAL/JIWA |
| 5 | CACAT FISIK DAN MENTAL |
| 6 | CACAT LAINNYA |
| 7 | TIDAK CACAT |

### tweb_cara_kb — kolom: `id` (tinyint PK), `nama` (varchar 50), `sex` (tinyint, null)
Sumber: baris 608 (CaraKBEnum). Karena enum hanya (id, nama), kolom `sex` = **NULL** untuk semua baris.
| id | nama | sex |
|---|---|---|
| 1 | Pil | NULL |
| 2 | IUD | NULL |
| 3 | Suntik | NULL |
| 4 | Kondom | NULL |
| 5 | Susuk KB | NULL |
| 6 | Sterilisasi Wanita | NULL |
| 7 | Sterilisasi Pria | NULL |
| 99 | Lainnya | NULL |
| 100 | Tidak Menggunakan | NULL |

### tweb_penduduk_asuransi — kolom: `id` (tinyint PK), `nama` (varchar 50)
Sumber: baris 611 (AsuransiEnum)
| id | nama |
|---|---|
| 1 | Tidak/Belum Punya |
| 2 | BPJS Penerima Bantuan Iuran |
| 3 | BPJS Non Penerima Bantuan Iuran |
| 4 | BPJS Bantuan Daerah |
| 99 | Asuransi Lainnya |

### tweb_penduduk_warganegara — kolom: `id` (int PK), `nama` (varchar 25, null)
Sumber: baris 619 (WargaNegaraEnum)
| id | nama |
|---|---|
| 1 | WNI |
| 2 | WNA |
| 3 | DUA KEWARGANEGARAAN |

### tweb_penduduk_status — kolom: `id` (int PK), `nama` (varchar 50, null)
Sumber: baris 618 (StatusPendudukEnum)
| id | nama |
|---|---|
| 1 | TETAP |
| 2 | TIDAK TETAP |

### tweb_status_dasar — kolom: `id` (int PK), `nama` (varchar 50, null)
Sumber: baris 621 (StatusDasarEnum)
| id | nama |
|---|---|
| 1 | Hidup |
| 2 | Mati |
| 3 | Pindah |
| 4 | Hilang |
| 6 | Pergi |
| 9 | Tidak Valid |

### tweb_rtm_hubungan — kolom: `id` (tinyint PK), `nama` (varchar 20)
Sumber: baris 620 (HubunganRTMEnum)
| id | nama |
|---|---|
| 1 | Kepala Rumah Tangga |
| 2 | Anggota |

### tweb_keluarga_sejahtera — kolom: `id` (int PK default 0), `nama` (varchar 100, null)
Sumber: baris 1285 (KeluargaSejahteraEnum)
| id | nama |
|---|---|
| 1 | KELUARGA PRA SEJAHTERA |
| 2 | KELUARGA SEJAHTERA I |
| 3 | KELUARGA SEJAHTERA II |
| 4 | KELUARGA SEJAHTERA III |
| 5 | KELUARGA SEJAHTERA III PLUS |

## 2.2 Tabel referensi lain — isi dari `ref_*`

### ref_penduduk_bahasa — kolom: `id` (int PK), `nama` (varchar 50), `inisial` (varchar 10)
Sumber: insert manual (StrukturTabelSeeder.php:593–600)
| id | nama | inisial |
|---|---|---|
| 1 | Latin | L |
| 2 | Daerah | D |
| 3 | Arab | A |
| 4 | Arab dan Latin | AL |
| 5 | Arab dan Daerah | AD |
| 6 | Arab, Latin dan Daerah | ALD |

### ref_penduduk_bidang — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: baris 602 (PendudukBidangEnum) — id 1–21, lihat tabel PendudukBidangEnum.

### ref_penduduk_hamil — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: baris 603 (HamilEnum)
| id | nama |
|---|---|
| 1 | HAMIL |
| 2 | TIDAK HAMIL |

### ref_penduduk_kursus — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: baris 604 (PendudukKursusEnum) — id 1–44 (tanpa 31), lihat tabel PendudukKursusEnum.

### ref_penduduk_suku — kolom: `id` (int PK), `suku` (varchar 100), `deskripsi` (text)
Struktur: `2023_12_22_015242_create_ref_penduduk_suku_table.php`
**ISI DATA: `[data tidak ditemukan]`** — tidak ada seeder/insert untuk tabel ini di codebase. Daftar suku tersedia sebagai konstanta `SukuEnum` (262 nilai, Bagian 1) dan dipakai langsung oleh form penduduk (bukan dari tabel). Untuk seed aplikasi baru, isi dari SukuEnum.

### ref_peristiwa — kolom: `id` (int PK), `nama` (varchar 50)
Sumber: baris 605 (PeristiwaPendudukEnum)
| id | nama |
|---|---|
| 1 | Baru Lahir |
| 2 | Mati |
| 3 | Pindah Keluar |
| 4 | Hilang |
| 5 | Baru Pindah Masuk |
| 6 | Tidak Tetap Pergi |

### ref_pindah — kolom: `id` (tinyint PK), `nama` (varchar 50)
Sumber: baris 606 (PindahEnum)
| id | nama |
|---|---|
| 1 | Pindah keluar Desa/Kelurahan |
| 2 | Pindah keluar Kecamatan |
| 3 | Pindah keluar Kabupaten/Kota |
| 4 | Pindah keluar Provinsi |

### ref_asal_tanah_kas — kolom: `id` (int PK), `nama` (text)
Sumber: baris 622 (AsalTanahKasEnum)
| id | nama |
|---|---|
| 1 | APB Desa |
| 2 | Perolehan Lainnya yang Sah |
| 3 | Kekayaan Asli Desa |

### ref_peruntukan_tanah_kas — kolom: `id` (int PK), `nama` (text)
Sumber: baris 623 (PeruntukanTanahKasEnum)
| id | nama |
|---|---|
| 1 | Sewa |
| 2 | Pinjam Pakai |
| 3 | Kerjasama Pemanfaatan |
| 4 | Bangun Guna Serah atau Bangun Serah Guna |

### ref_dokumen — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: insert manual (StrukturTabelSeeder.php:676–680)
| id | nama |
|---|---|
| 1 | Informasi Publik |
| 2 | SK Kades |
| 3 | Perdes |

### ref_status_covid — kolom: `id` (int PK), `nama` (varchar 100)
Sumber: insert manual (StrukturTabelSeeder.php:583–591)
| id | nama |
|---|---|
| 1 | Kasus Suspek |
| 2 | Kasus Probable |
| 3 | Kasus Konfirmasi |
| 4 | Kontak Erat |
| 5 | Pelaku Perjalanan |
| 6 | Discarded |
| 7 | Selesai Isolasi |

### ref_persil_kelas — kolom: `id` (int PK), `tipe` (varchar 20), `kode` (varchar 20), `ndesc` (text, null)
Sumber: insert manual (StrukturTabelSeeder.php:514–563)
| id | tipe | kode | ndesc |
|---|---|---|---|
| 1 | BASAH | S-I | Persawahan Dekat dengan Pemukiman |
| 2 | BASAH | S-II | Persawahan Agak Dekat dengan Pemukiman |
| 3 | BASAH | S-III | Persawahan Jauh dengan Pemukiman |
| 4 | BASAH | S-IV | Persawahan Sangat Jauh dengan Pemukiman |
| 5 | KERING | D-I | Lahan Kering Dekat dengan Pemukiman |
| 6 | KERING | D-II | Lahan Kering Agak Dekat dengan Pemukiman |
| 7 | KERING | D-III | Lahan Kering Jauh dengan Pemukiman |
| 8 | KERING | D-IV | Lahan Kering Sanga Jauh dengan Pemukiman |

### ref_persil_mutasi — kolom: `id` (tinyint PK), `nama` (varchar 20), `ndesc` (text, null)
Sumber: insert manual (StrukturTabelSeeder.php:565–581)
| id | nama | ndesc |
|---|---|---|
| 1 | Jual Beli | Didapat dari proses Jual Beli |
| 2 | Hibah | Didapat dari proses Hibah |
| 3 | Waris | Didapat dari proses Waris |

### ref_sinkronisasi — kolom: `tabel`, `server`, `jenis_update`, `tabel_hapus`
Sumber: insert manual (StrukturTabelSeeder.php:1270–1283)
| tabel | server | jenis_update | tabel_hapus |
|---|---|---|---|
| tweb_keluarga | 6 | 1 | log_keluarga |
| tweb_penduduk | 6 | 1 | log_hapus_penduduk |

### ref_jabatan — kolom: `id` (int PK), `config_id`, `nama` (varchar 100), `tupoksi` (longtext, null), `jenis` (bool)
Sumber: `DataAwalSeeder.php:355–368` (`tambah_jabatan()`)
| id | nama | jenis |
|---|---|---|
| 1 | Kepala {Sebutan Desa} | 1 (KADES – `RefJabatan::KADES`) |
| 2 | Sekretaris | 2 (SEKDES – `RefJabatan::SEKDES`) |

### ref_syarat_surat — kolom: `ref_syarat_id` (int PK), `config_id`, `ref_syarat_nama`
Sumber: `DataAwalSeeder.php:450–491`
| ref_syarat_id | ref_syarat_nama |
|---|---|
| 1 | Surat Pengantar RT/RW |
| 2 | Fotokopi KK |
| 3 | Fotokopi KTP |
| 4 | Fotokopi Surat Nikah/Akta Nikah/Kutipan Akta Perkawinan |
| 5 | Fotokopi Akta Kelahiran/Surat Kelahiran bagi keluarga yang mempunyai anak |
| 6 | Surat Pindah Datang dari tempat asal |
| 7 | Surat Keterangan Kematian dari Rumah Sakit, Rumah Bersalin Puskesmas, atau visum Dokter |
| 8 | Surat Keterangan Cerai |
| 9 | Fotokopi Ijasah Terakhir |
| 10 | SK. PNS/KARIP/SK. TNI – POLRI |
| 11 | Surat Keterangan Kematian dari Kepala Desa/Kelurahan |
| 12 | Surat imigrasi / STMD (Surat Tanda Melapor Diri) |

## 2.3 Tabel referensi non-kependudukan (isi lengkap)

### tweb_status_ktp — kolom: `id` (tinyint PK), `nama` (varchar 50), `ktp_el` (tinyint), `status_rekam` (varchar 50)
Sumber: insert manual (StrukturTabelSeeder.php:625–674)
| id | nama | ktp_el | status_rekam |
|---|---|---|---|
| 1 | BELUM REKAM | 1 | 2 |
| 2 | SUDAH REKAM | 2 | 3 |
| 3 | CARD PRINTED | 2 | 4 |
| 4 | PRINT READY RECORD | 2 | 5 |
| 5 | CARD SHIPPED | 2 | 6 |
| 6 | SENT FOR CARD PRINTING | 2 | 7 |
| 7 | CARD ISSUED | 2 | 8 |
| 8 | BELUM WAJIB | 1 | 1 |

> Perhatikan: `StatusKTPEnum` (1=BELUM WAJIB, 2=BELUM REKAM, …) sebenarnya memetakan kolom `status_rekam`, bukan `id`. Saat migrasi, jangan samakan id enum dengan id tabel.

### tweb_penduduk_umur (rentang umur) — kolom: `id` (int PK), `config_id`, `nama` (varchar 25), `dari` (int), `sampai` (int), `status` (int)
Sumber: `app\database\seeders\DataAwal\RentangUmur.php` (dipanggil `DataAwalSeeder.php:646`)
| id | nama | dari | sampai | status |
|---|---|---|---|---|
| 1 | BALITA | 0 | 5 | 0 |
| 2 | ANAK-ANAK | 6 | 17 | 0 |
| 3 | DEWASA | 18 | 30 | 0 |
| 4 | TUA | 31 | 99999 | 0 |
| 5 | Di bawah 1 Tahun | 0 | 1 | 1 |
| 6 | 2 s/d 4 Tahun | 2 | 4 | 1 |
| 7 | 5 s/d 9 Tahun | 5 | 9 | 1 |
| 8 | 10 s/d 14 Tahun | 10 | 14 | 1 |
| 9 | 15 s/d 19 Tahun | 15 | 19 | 1 |
| 10 | 20 s/d 24 Tahun | 20 | 24 | 1 |
| 11 | 25 s/d 29 Tahun | 25 | 29 | 1 |
| 12 | 30 s/d 34 Tahun | 30 | 34 | 1 |
| 13 | 35 s/d 39 Tahun | 35 | 39 | 1 |
| 14 | 40 s/d 44 Tahun | 40 | 44 | 1 |
| 15 | 45 s/d 49 Tahun | 45 | 49 | 1 |
| 16 | 50 s/d 54 Tahun | 50 | 54 | 1 |
| 17 | 55 s/d 59 Tahun | 55 | 59 | 1 |
| 18 | 60 s/d 64 Tahun | 60 | 64 | 1 |
| 19 | 65 s/d 69 Tahun | 65 | 69 | 1 |
| 20 | 70 s/d 74 Tahun | 70 | 74 | 1 |
| 21 | 75 Tahun ke Atas | 75 | 99999 | 1 |

### media_sosial — kolom: `id` (int PK), `config_id`, `gambar` (text), `link` (text), `nama` (varchar 100), `tipe` (bool), `enabled` (int)
Sumber: `DataAwalSeeder.php:255–302`
| nama | gambar | tipe | enabled |
|---|---|---|---|
| Facebook | fb.png | 1 | 1 |
| Twitter | twt.png | 1 | 1 |
| YouTube | yb.png | 1 | 1 |
| Instagram | ins.png | 1 | 1 |
| WhatsApp | wa.png | 1 | 1 |
| Telegram | tg.png | 1 | 2 |

### kehadiran_jam_kerja — kolom: `id` (int PK), `config_id`, `nama_hari` (varchar 65), `jam_masuk` (time), `jam_keluar` (time), `status` (bool), `keterangan` (text)
Sumber: `DataAwalSeeder.php:305–352`
| nama_hari | jam_masuk | jam_keluar | status |
|---|---|---|---|
| Senin | 08:00:00 | 16:00:00 | 1 |
| Selasa | 08:00:00 | 16:00:00 | 1 |
| Rabu | 08:00:00 | 16:00:00 | 1 |
| Kamis | 08:00:00 | 16:00:00 | 1 |
| Jumat | 08:00:00 | 16:00:00 | 1 |
| Sabtu | 08:00:00 | 16:00:00 | 0 |
| Minggu | 08:00:00 | 16:00:00 | 0 |

### anjungan_menu — kolom: `id` (int PK), `config_id`, `nama`, `icon` (text), `link` (text), `link_tipe` (tinyint), `urut` (tinyint), `status` (int)
Sumber: `DataAwalSeeder.php:371–442`
| nama | icon | link | link_tipe | urut | status |
|---|---|---|---|---|---|
| Peta Desa | peta.svg | peta | 5 | 1 | 1 |
| Informasi Pubik | protected.svg | informasi_publik | 5 | 2 | 1 |
| Data Pekerjaan | statistik.svg | statistik/1 | 2 | 3 | 1 |
| Layanan Mandiri | mandiri.svg | layanan-mandiri/beranda | 5 | 4 | 1 |
| Lapak | lapak.svg | lapak | 5 | 5 | 1 |
| Keuangan | keuangan.svg | artikel/100 | 6 | 6 | 1 |
| IDM 2021 | idm.svg | status-idm/2021 | 10 | 7 | 1 |

### klasifikasi_surat — kolom: `id`, `config_id`, `kode` (varchar 50), `nama` (text), `uraian` (mediumText), `enabled` (int)
Sumber: `app\Imports\KlasifikasiSuratImports.php` membaca file `klasifikasi-surat.xlsx` dari `DEFAULT_LOKASI_IMPOR`.
**ISI DATA: `[data tidak ditemukan]`** di source code (berupa file Excel, bukan baris literal).

### analisis_ref_state — kolom: `id`, `nama`
Sumber: baris 510 (AnalisisRefStateEnum) — lihat Bagian 1.4.

### analisis_ref_subjek — kolom: `id`, `subjek`
Sumber: baris 511, kolom `['id','subjek']` (AnalisisRefSubjekEnum).

### analisis_tipe_indikator — kolom: `id`, `tipe`
Sumber: baris 512, kolom `['id','tipe']` (AnalisisTipeIndikatorEnum).

## 2.4 Tabel referensi keuangan (manual)

### keuangan_manual_ref_bidang — kolom: `id` (int PK), `Kd_Bid` (varchar 50), `Nama_Bidang` (varchar 250)
Sumber: StrukturTabelSeeder.php:682–708
| id | Kd_Bid | Nama_Bidang |
|---|---|---|
| 1 | 00.0000.01 | BIDANG PENYELENGGARAN PEMERINTAHAN DESA |
| 2 | 00.0000.02 | BIDANG PELAKSANAAN PEMBANGUNAN DESA |
| 3 | 00.0000.03 | BIDANG PEMBINAAN KEMASYARAKATAN DESA |
| 4 | 00.0000.04 | BIDANG PEMBERDAYAAN MASYARAKAT DESA |
| 5 | 00.0000.05 | BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA |

### keuangan_manual_ref_rek1 — kolom: `id` (int PK), `Akun` (varchar 100), `Nama_Akun` (varchar 100)
Sumber: StrukturTabelSeeder.php:710–718
| id | Akun | Nama_Akun |
|---|---|---|
| 1 | 1. | ASET |
| 2 | 2. | KEWAJIBAN |
| 3 | 3. | EKUITAS |
| 4 | 4. | PENDAPATAN |
| 5 | 5. | BELANJA |
| 6 | 6. | PEMBIAYAAN |
| 7 | 7. | NON ANGGARAN |

### keuangan_manual_ref_rek2 — kolom: `id`, `Akun` (varchar 100), `Kelompok` (varchar 100), `Nama_Kelompok` (varchar 100)
Sumber: StrukturTabelSeeder.php:720–825
| id | Akun | Kelompok | Nama_Kelompok |
|---|---|---|---|
| 1 | 1. | 1.1. | Aset Lancar |
| 2 | 1. | 1.2. | Investasi |
| 3 | 1. | 1.3. | Aset Tetap |
| 4 | 1. | 1.4. | Dana Cadangan |
| 5 | 1. | 1.5. | Aset Tidak Lancar Lainnya |
| 6 | 2. | 2.1. | Kewajiban Jangka Pendek |
| 7 | 3. | 3.1. | Ekuitas |
| 8 | 4. | 4.1. | Pendapatan Asli Desa |
| 9 | 4. | 4.2. | Pendapatan Transfer |
| 10 | 4. | 4.3. | Pendapatan Lain-lain |
| 11 | 5. | 5.1. | Belanja Pegawai |
| 12 | 5. | 5.2. | Belanja Barang dan Jasa |
| 13 | 5. | 5.3. | Belanja Modal |
| 14 | 5. | 5.4. | Belanja Tidak Terduga |
| 15 | 6. | 6.1. | Penerimaan Pembiayaan |
| 16 | 6. | 6.2. | Pengeluaran Pembiayaan |
| 17 | 7. | 7.1. | Perhitungan Fihak Ketiga |

### keuangan_manual_ref_rek3 — kolom: `id`, `Kelompok` (varchar 100), `Jenis` (varchar 100), `Nama_Jenis` (varchar 100)
Sumber: StrukturTabelSeeder.php:827–1268 (73 baris)
| id | Kelompok | Jenis | Nama_Jenis |
|---|---|---|---|
| 1 | 1.1. | 1.1.1. | Kas dan Bank |
| 2 | 1.1. | 1.1.2. | Piutang |
| 3 | 1.1. | 1.1.3. | Persediaan |
| 4 | 1.2. | 1.2.1. | Penyertaan Modal Pemerintah Desa |
| 5 | 1.3. | 1.3.1. | Tanah |
| 6 | 1.3. | 1.3.2. | Peralatan dan Mesin |
| 7 | 1.3. | 1.3.3. | Gedung dan Bangunan |
| 8 | 1.3. | 1.3.4. | Jalan, Irigasi dan Jaringan |
| 9 | 1.3. | 1.3.5. | Aset Tetap Lainnya |
| 10 | 1.3. | 1.3.6. | Konstruksi Dalam Pengerjaan |
| 11 | 1.3. | 1.3.7. | Aset Tak Berwujud |
| 12 | 1.3. | 1.3.8. | Akumulasi Penyusutan Aktiva Tetap |
| 13 | 1.4. | 1.4.1. | Dana Cadangan |
| 14 | 1.5. | 1.5.1. | Tagihan Piutang Penjualan Angsuran |
| 15 | 1.5. | 1.5.2. | Tagihan Tuntutan Ganti Kerugian Daerah |
| 16 | 1.5. | 1.5.3. | Kemitraan dengan Pihak Ketiga |
| 17 | 1.5. | 1.5.4. | Aktiva Tidak Berwujud |
| 18 | 1.5. | 1.5.5. | Aset Lain-lain |
| 19 | 2.1. | 2.1.1. | Hutang Perhitungan Pihak Ketiga |
| 20 | 2.1. | 2.1.2. | Hutang Bunga |
| 21 | 2.1. | 2.1.3. | Hutang Pajak |
| 22 | 2.1. | 2.1.4. | Pendapatan Diterima Dimuka |
| 23 | 2.1. | 2.1.5. | Bagian Lancar Hutang Jangka Panjang |
| 24 | 2.1. | 2.1.6. | Hutang Jangka Pendek Lainnya |
| 25 | 3.1. | 3.1.1. | Ekuitas |
| 26 | 3.1. | 3.1.2. | Ekuitas SAL |
| 27 | 4.1. | 4.1.1. | Hasil Usaha Desa |
| 28 | 4.1. | 4.1.2. | Hasil Aset Desa |
| 29 | 4.1. | 4.1.3. | Swadaya, Partisipasi dan Gotong Royong |
| 30 | 4.1. | 4.1.4. | Lain-Lain Pendapatan Asli Desa |
| 31 | 4.2. | 4.2.1. | Dana Desa |
| 32 | 4.2. | 4.2.2. | Bagi Hasil Pajak dan Retribusi |
| 33 | 4.2. | 4.2.3. | Alokasi Dana Desa |
| 34 | 4.2. | 4.2.4. | Bantuan Keuangan Provinsi |
| 35 | 4.2. | 4.2.5. | Bantuan Keuangan Kabupaten/Kota |
| 36 | 4.3. | 4.3.1. | Penerimaan dari Hasil Kerjasama Antar Desa |
| 37 | 4.3. | 4.3.2. | Penerimaan dari Hasil Kerjasama dengan Pihak Ketiga |
| 38 | 4.3. | 4.3.3. | Penerimaan Bantuan dari Perusahaan yang Berlokasi di Desa |
| 39 | 4.3. | 4.3.4. | Hibah dan Sumbangan dari Pihak Ketiga |
| 40 | 4.3. | 4.3.5. | Koreksi Kesalahan Belanja Tahun-tahun Sebelumnya |
| 41 | 4.3. | 4.3.6. | Bunga Bank |
| 42 | 4.3. | 4.3.9. | Lain-lain Pendapatan Desa Yang Sah |
| 43 | 5.1. | 5.1.1. | Penghasilan Tetap dan Tunjangan Kepala Desa |
| 44 | 5.1. | 5.1.2. | Penghasilan Tetap dan Tunjangan Perangkat Desa |
| 45 | 5.1. | 5.1.3. | Jaminan Sosial Kepala Desa dan Perangkat Desa |
| 46 | 5.1. | 5.1.4. | Tunjangan BPD |
| 47 | 5.2. | 5.2.1. | Belanja Barang Perlengkapan |
| 48 | 5.2. | 5.2.2. | Belanja Jasa Honorarium |
| 49 | 5.2. | 5.2.3. | Belanja Perjalanan Dinas |
| 50 | 5.2. | 5.2.4. | Belanja Jasa Sewa |
| 51 | 5.2. | 5.2.5. | Belanja Operasional Perkantoran |
| 52 | 5.2. | 5.2.6. | Belanja Pemeliharaan |
| 53 | 5.2. | 5.2.7. | Belanja Barang dan Jasa yang Diserahkan kepada Masyarakat |
| 54 | 5.3. | 5.3.1. | Belanja Modal Pengadaan Tanah |
| 55 | 5.3. | 5.3.2. | Belanja Modal Pengadaan Peralatan, Mesin dan Alat Berat |
| 56 | 5.3. | 5.3.3. | Belanja Modal Kendaraan |
| 57 | 5.3. | 5.3.4. | Belanja Modal Gedung, Bangunan dan Taman |
| 58 | 5.3. | 5.3.5. | Belanja Modal Jalan/Prasarana Jalan |
| 59 | 5.3. | 5.3.6. | Belanja Modal Jembatan |
| 60 | 5.3. | 5.3.7. | Belanja Modal Irigasi/Embung/Drainase/Air Limbah/Persampahan |
| 61 | 5.3. | 5.3.8. | Belanja Modal Jaringan/Instalasi |
| 62 | 5.3. | 5.3.9. | Belanja Modal Lainnya |
| 63 | 5.4. | 5.4.1. | Belanja Tidak Terduga |
| 64 | 6.1. | 6.1.1. | SILPA Tahun Sebelumnya |
| 65 | 6.1. | 6.1.2. | Pencairan Dana Cadangan |
| 66 | 6.1. | 6.1.3. | Hasil Penjualan Kekayaan Desa Yang Dipisahkan |
| 67 | 6.1. | 6.1.9. | Penerimaan Pembiayaan Lainnya |
| 68 | 6.2. | 6.2.1. | Pembentukan Dana Cadangan |
| 69 | 6.2. | 6.2.2. | Penyertaan Modal Desa |
| 70 | 6.2. | 6.2.9. | Pengeluaran Pembiayaan Lainnya |
| 71 | 7.1. | 7.1.1. | Perhitungan PFK - Potongan Pajak |
| 72 | 7.1. | 7.1.2. | Perhitungan PFK - Potongan Pajak Daerah |
| 73 | 7.1. | 7.1.3. | Perhitungan PFK - Uang Muka dan Jaminan |

> Tabel keuangan lain: `keuangan_manual_ref_kegiatan` (seeder `KeuanganManualRefKegiatan.php`, 56 KB), `keuangan_manual_rinci_tpl` (`DataAwalSeeder.php:691`), `tweb_aset` (seeder `Twebaset.php`, 1,5 MB, `DB::table('tweb_aset')->insert($data)` baris 38303). Isi tidak disalin (sangat besar) — ekstrak langsung dari file seeder bila diperlukan.

## 2.5 Tabel/view lain yang relevan (bukan referensi nilai)
| Nama | Jenis | Sumber |
|---|---|---|
| keluarga_aktif | VIEW SQL | `ViewKeluargaAktifSeeder.php` (filter `tweb_penduduk.status_dasar = 1`) |
| penduduk_hidup | VIEW | `ViewPendudukHidupSeeder.php` |
| dokumen_hidup | VIEW | `ViewDokumenHidupSeeder.php` |
| master_inventaris | VIEW | `ViewMasterInventarisSeeder.php` |
| rekap_mutasi_inventaris | VIEW | `ViewRekapMutasiInventarisSeeder.php` |

---

# BAGIAN 3 — MAGIC NUMBER PENTING DI MODEL

Sumber: konstanta `app\Models\*.php`.

## 3.1 Kependudukan
| Model / konstanta | Nilai | Arti |
|---|---|---|
| `LogPenduduk::PENOLONG_MATI` | 1 Dokter; 2 Tenaga Kesehatan; 3 Kepolisian; 4 Lainnya | Penolong kematian |
| `LogPenduduk::PENYEBAB_KEMATIAN` | 1 Sakit biasa/tua; 2 Wabah Penyakit; 3 Kecelakaan; 4 Kriminalitas; 5 Bunuh Diri; 6 Lainnya | Penyebab kematian |
| `Penduduk::TEMPAT_LAHIR` | 1 RS/RB; 2 Puskesmas; 3 Polindes; 4 Rumah; 5 Lainnya | Tempat lahir |
| `Penduduk::JENIS_KELAHIRAN` | 1 Tunggal; 2 Kembar 2; 3 Kembar 3; 4 Kembar 4 | Jenis kelahiran |
| `Penduduk::PENOLONG_KELAHIRAN` | 1 Dokter; 2 Bidan Perawat; 3 Dukun; 4 Lainnya | Penolong kelahiran |
| `Anak::STATUS_GIZI_ANAK` | 1 Sehat/Normal (N); 2 Gizi Kurang (GK); 3 Gizi Buruk (GB); 4 Stunting (S) | Status gizi anak (konst. NORMAL=1, GIZI_KURANG=2, GIZI_BURUK=3, STUNTING=4) |
| `Anak::STATUS_TIKAR_ANAK` | 1 TD; 2 M; 3 K; 4 H | Kartu menuju sehat (Tidak Diukur/Merah/Kuning/Hijau) |
| `Anak::STATUS_IMUNISASI_CAMPAK` | 1 Belum; 2 Sudah | Imunisasi campak |
| `IbuHamil::STATUS_KEHAMILAN_IBU` | 1 Normal (N); 2 Risiko Tinggi (Risti); 3 Kekurangan Energi Kronis (KEK) | Status kehamilan ibu |
| `Anak::TB_SANGAT_PENDEK` / `TB_PENDEK` | 2 / 3 | Kategori tinggi badan |
| kolom `tweb_penduduk.wajib_ktp` | 'WAJIB' / 'BELUM' (string) | Hasil `Penduduk_model::is_wajib_ktp()`; bukan tabel |
| kolom `tweb_penduduk.status_dasar` | StatusDasarEnum (1,2,3,4,6,9) | Status dasar penduduk |
| kolom `tweb_penduduk.status` | StatusPendudukEnum (1 TETAP, 2 TIDAK TETAP) | Status penduduk |
| kolom `tweb_keluarga` (filter) | StatusDasarKKEnum (1 KK Aktif; 2 KK Hilang/Pindah/Mati; 3 KK Kosong) | Status KK (dipakai `Keluarga` controller, `Shortcut`) |
| kolom `tweb_rtm` (status) | StatusRTMEnum (1 Ya; 0 Tidak; 2 Tanpa Kepala Keluarga) | Status RTM |

## 3.2 Surat & layanan
| Model / konstanta | Nilai | Arti |
|---|---|---|
| `LogSurat::KONSEP` / `CETAK` | 0 / 1 | `log_surat.status` (cast boolean): draft / tercetak |
| `LogSurat::PERIKSA` / `TERIMA` / `TOLAK` | 0 / 1 / -1 | `log_surat.verifikasi`: diperiksa / diterima / ditolak |
| `LogSuratDinas` | sama (0,1,-1 / 0,1) | Status surat dinas |
| `PermohonanSurat::STATUS_PERMOHONAN` | 0 Belum Lengkap; 1 Sedang Diperiksa; 2 Menunggu Tandatangan; 3 Siap Diambil; 4 Sudah Diambil; 5 Dibatalkan | Status permohonan surat warga |
| `FormatSurat::RTF` / `TINYMCE` | [1,2] / [3,4] | Tipe template surat |
| `FormatSurat::TINYMCE_SISTEM` / `TINYMCE_DESA` | 3 / 4 | Asal template surat |
| `FormatSurat::JENIS_SURAT` | 3 Surat Sistem; 4 Surat Desa | Jenis surat |
| `FormatSurat::MASA_BERLAKU` | d Hari; w Minggu; M Bulan; y Tahun | Satuan masa berlaku |
| `FormatSurat::MARGINS` | kiri 3; atas 2; kanan 2; bawah 2.5 | Margin default |
| `FormatSurat::ORIENTATAIONS` | 'Potrait','Lanscape' | Orientasi |
| `FormatSurat::SIZES` | A1..A6, F4 | Ukuran kertas |
| `FormatSurat::ATTRIBUTES` | text/number/email/url/date/time/textarea/select-manual/select-otomatis/hari/... | Tipe atribut isian form surat |
| `LampiranSurat::JENIS_LAMPIRAN` | 1 Lampiran Sistem; 2 Lampiran Desa | Jenis lampiran surat |
| `DerajatSuratEnum` / `KarakterSuratEnum` | lihat Bagian 1 | Sifat surat |
| `StatusSuratKecamatanEnum` | 1 Tidak Aktif; 2 Belum Dikirim; 3 Sudah Dikirim | Status kirim ke kecamatan |

## 3.3 Umum / modul
| Model / konstanta | Nilai | Arti |
|---|---|---|
| `StatusPengaduanEnum` | 1 Menunggu Diproses; 2 Sedang Diproses; 3 Selesai Diproses | Status pengaduan |
| `JawabanKepuasanEnum` | 1 Sangat Puas; 2 Puas; 3 Cukup Puas; 4 Tidak Puas | Survey kepuasan |
| `SuplemenTerdata::PENDUDUK` / `KELUARGA` | 1 / 2 | Sasaran terdata suplemen |
| `SasaranEnum` / `ListSasaranEnum` | lihat Bagian 1 | Sasaran program |
| `GrupAkses` | 1 BACA; 3 UBAH; 7 HAPUS | Bitmask hak akses |
| `Modul` | PARENT 0; LOCK 0; UNLOCK 1; SHOW 0; SHOW_S 1; HIDDEN 2 | Status modul |
| `RefJabatan` | 1 KADES; 2 SEKDES | Jenis jabatan |
| `Dokumen` | DOKUMEN_WARGA 1; ENABLE 1; DISABLE 0 | Dokumen |
| `Kategori` | ENABLE 1; LOCK 0; UNLOCK 1 | Kategori |
| `Komentar` | ACTIVE 1; NONACTIVE 2; UNREAD 3; TIPE_MASUK 2; TIPE_KELUAR 1; LOCK 1; UNLOCK 2; ROOT 0; CHILD 2 | Komentar |
| `PesanMandiri` | READ 1; UNREAD 2; MASUK 1; KELUAR 2 | Pesan layanan mandiri |
| `Gawai` | ANJUNGAN 1; GAWAI 2; KEHADIRAN 3 | Jenis perangkat |
| `InventarisMenuEnum` | tip 1 daftar/laporan; 2 mutasi | Menu inventaris |
| `StatistikPengunjung` | 1 Hari Ini; 2 Kemarin; 3 Minggu Ini; 4 Bulan Ini; 5 Tahun Ini | Periode statistik pengunjung |
| `Widget` | WIDGET_SISTEM 1; WIDGET_STATIS 2 | Jenis widget |
| `UserGrup` | ADMINISTRATOR/OPERATOR/REDAKSI/KONTRIBUTOR; SISTEM 1; DESA 2 | Grup pengguna |
| `SistemEnum` | 1 Website; 2 Administrator; 4 Kehadiran | Konteks sistem |
| `SumberDanaEnum`, `BidangBelanjaEnum`, `KeuanganRefRek1Enum` | lihat Bagian 1 | Keuangan desa |

---

# BAGIAN 4 — REKOMENDASI SEED & SKEMA (Next.js + Drizzle)

## 4.1 Prinsip umum
1. **Pertahankan ID persis** seperti OpenSID untuk semua tabel referensi. Banyak kolom FK (`agama_id`, `pekerjaan_id`, `pendidikan_kk_id`, `status_kawin`, `warganegara_id`, `golongan_darah_id`, `cacat_id`, `cara_kb_id`, `asuransi_id`, `status_dasar`, `kk_level`, `rtm_level`, `id_cluster`) mengandalkan nilai numerik tersebut. Mengubah ID = harus migrasi data lama.
2. **Pisahkan dua jenis** referensi:
   - **Enum stabil & kecil** (jenis kelamin, status dasar, status kawin, warganegara, golongan darah, cacat, hamil, asuransi, pendidikan KK, pendidikan sedang, status penduduk, status KTP, SHDK, hubungan RTM, keluarga sejahtera) → cocok jadi **`pgEnum`** atau **konstanta TypeScript** + tabel lookup tipis.
   - **Katalog besar & bisa ditambah** (pekerjaan 89, suku 262, kursus 44, bidang 21, wilayah dusun) → **tabel lookup** yang bisa diedit pengguna.
3. Karena ada 4 varian `KategoriPublik*Enum` yang isinya sama, dan `DokumenEnum` == `KategoriDokumenPeraturanEnum`, lakukan **dedup** di aplikasi baru (satu sumber kebenaran).
4. `status_rekam` di `tweb_status_ktp` **berbeda** dari id. Jangan campur `StatusKTPEnum` dengan id tabel.

## 4.2 Nama tabel yang disarankan
| Tabel OpenSID | Nama baru disarankan | Strategi |
|---|---|---|
| tweb_penduduk_agama | ref_agama | lookup (id,nama) |
| tweb_penduduk_sex | ref_jenis_kelamin | pgEnum + lookup |
| tweb_penduduk_hubungan | ref_shdk | lookup (SHDK) |
| tweb_penduduk_pekerjaan | ref_pekerjaan | lookup besar |
| tweb_penduduk_pendidikan | ref_pendidikan_sedang | lookup |
| tweb_penduduk_pendidikan_kk | ref_pendidikan_kk | lookup |
| tweb_penduduk_kawin | ref_status_kawin | lookup + pgEnum |
| tweb_golongan_darah | ref_golongan_darah | lookup |
| tweb_cacat | ref_cacat | lookup |
| tweb_cara_kb | ref_cara_kb | lookup |
| tweb_penduduk_asuransi | ref_asuransi | lookup |
| tweb_penduduk_warganegara | ref_warganegara | lookup |
| tweb_penduduk_status | ref_status_penduduk | lookup |
| tweb_status_dasar | ref_status_dasar | pgEnum + lookup |
| tweb_rtm_hubungan | ref_hubungan_rtm | lookup |
| tweb_keluarga_sejahtera | ref_keluarga_sejahtera | lookup |
| tweb_status_ktp | ref_status_ktp | lookup (+ kolom ktp_el, status_rekam) |
| ref_penduduk_bahasa | ref_bahasa | lookup (id,nama,inisial) |
| ref_penduduk_bidang | ref_bidang_keahlian | lookup |
| ref_penduduk_hamil | ref_status_hamil | lookup |
| ref_penduduk_kursus | ref_kursus | lookup besar |
| ref_penduduk_suku | ref_suku | lookup besar (isi dari SukuEnum) |
| ref_peristiwa | ref_peristiwa | lookup |
| ref_pindah | ref_pindah | lookup |
| ref_asal_tanah_kas | ref_asal_tanah_kas | lookup |
| ref_peruntukan_tanah_kas | ref_peruntukan_tanah_kas | lookup |
| ref_dokumen | ref_dokumen | lookup |
| ref_status_covid | ref_status_covid | lookup |
| ref_persil_kelas / ref_persil_mutasi | ref_persil_kelas / ref_persil_mutasi | lookup |
| tweb_penduduk_umur | ref_rentang_umur | lookup (dari,tos,status) |
| ref_jabatan | ref_jabatan | lookup |
| ref_syarat_surat | ref_syarat_surat | lookup |
| media_sosial | ref_media_sosial | tabel |
| kehadiran_jam_kerja | ref_jam_kerja | tabel |
| analisis_ref_state / subjek / tipe_indikator | ref_analisis_* | lookup |
| keuangan_manual_ref_rek1/2/3, ref_bidang, ref_kegiatan | ref_keuangan_* | lookup keuangan |

## 4.3 Contoh skema Drizzle (PostgreSQL)

```ts
// db/schema/ref.ts
import { pgTable, smallint, varchar, text, integer, boolean, pgEnum, time } from 'drizzle-orm/pg-core'

// --- Enum stabil (nilai numeric tetap sama dengan OpenSID) ---
export const jenisKelaminEnum = pgEnum('jenis_kelamin', ['1', '2'])
export const statusDasarEnum  = pgEnum('status_dasar',  ['1', '2', '3', '4', '6', '9'])
export const statusKawinEnum  = pgEnum('status_kawin',  ['1', '2', '3', '4'])
export const wargaNegaraEnum  = pgEnum('warga_negara',  ['1', '2', '3'])
// ... dst.

// --- Lookup generik ---
export const refAgama = pgTable('ref_agama', {
  id: smallint('id').primaryKey(),      // 1..7
  nama: varchar('nama', { length: 100 }).notNull(),
})

export const refJenisKelamin = pgTable('ref_jenis_kelamin', {
  id: smallint('id').primaryKey(),      // 1,2
  nama: varchar('nama', { length: 15 }),
})

export const refPekerjaan = pgTable('ref_pekerjaan', {
  id: smallint('id').primaryKey(),      // 1..89
  nama: varchar('nama', { length: 100 }),
})

export const refSuku = pgTable('ref_suku', {
  id: integer('id').primaryKey(),       // generated (OpenSID tidak punya id; pakai string)
  nama: varchar('nama', { length: 150 }).notNull().unique(),
})

export const refStatusKtp = pgTable('ref_status_ktp', {
  id: smallint('id').primaryKey(),
  nama: varchar('nama', { length: 50 }).notNull(),
  ktpEl: smallint('ktp_el').notNull(),
  statusRekam: varchar('status_rekam', { length: 50 }).notNull(),
})

export const refRentangUmur = pgTable('ref_rentang_umur', {
  id: integer('id').primaryKey(),
  nama: varchar('nama', { length: 25 }),
  dari: integer('dari'),
  sampai: integer('sampai'),
  status: integer('status'),
})
```

> Catatan: PostgreSQL `pgEnum` menyimpan sebagai string. Bila tetap ingin numeric 1/2, simpan sebagai `smallint` + tabel lookup, bukan `pgEnum`. Pilih salah satu secara konsisten.

## 4.4 Contoh seed (ringkas)

```ts
// db/seed/ref-penduduk.ts
export const refAgamaData = [
  { id: 1, nama: 'ISLAM' },
  { id: 2, nama: 'KRISTEN' },
  { id: 3, nama: 'KATHOLIK' },
  { id: 4, nama: 'HINDU' },
  { id: 5, nama: 'BUDHA' },
  { id: 6, nama: 'KHONGHUCU' },
  { id: 7, nama: 'Kepercayaan Terhadap Tuhan YME / Lainnya' },
]

export const refJenisKelaminData = [
  { id: 1, nama: 'Laki-laki' },
  { id: 2, nama: 'Perempuan' },
]

export const refStatusDasarData = [
  { id: 1, nama: 'Hidup' }, { id: 2, nama: 'Mati' }, { id: 3, nama: 'Pindah' },
  { id: 4, nama: 'Hilang' }, { id: 6, nama: 'Pergi' }, { id: 9, nama: 'Tidak Valid' },
]
// ...lanjutkan untuk semua tabel di Bagian 2.
```

## 4.5 Catatan keamanan & kualitas data
- **Jangan** menyalin `FirebaseEnum` (`SERVER_KEY`/`SENDER_ID`) ke aplikasi baru — nilainya adalah kredensial dan sudah terbuka di source. Gunakan environment variable.
- Beberapa label PekerjaanEnum/PendidikanSedangEnum punya spasi ganda (mis. `SEDANG  D-1/SEDERAJAT`) dan SukuEnum punya trailing space. **Trim** saat seeding.
- `tweb_cara_kb.sex` tidak terisi dari enum (semua NULL) — putuskan apakah kolom tetap dipertahankan atau di-drop.
- `ref_penduduk_suku` **tidak pernah diisi** di OpenSID; pada aplikasi baru, seed dari `SukuEnum` (262 baris) sebagai sumber otoritatif.
- `Regsosek2022kEnum` sangat besar dan tidak ternamai; jika aplikasi baru tidak menangani DTKS/Regsosek, tabel terkait boleh dilewati.

---

## Lampiran: Daftar file enum lengkap
```
app\Enums\AgamaEnum.php                                     app\Enums\SistemEnum.php
app\Enums\AktifEnum.php                                     app\Enums\StatusDasarEnum.php
app\Enums\AsalDanaEnum.php                                  app\Enums\StatusDasarKKEnum.php
app\Enums\AsalTanahKasEnum.php                              app\Enums\StatusEnum.php
app\Enums\AsuransiEnum.php                                  app\Enums\StatusKawinEnum.php
app\Enums\BahasaEnum.php                                    app\Enums\StatusKawinSpesifikEnum.php
app\Enums\BaseEnum.php                                      app\Enums\StatusKTPEnum.php
app\Enums\BidangBelanjaEnum.php                             app\Enums\StatusPendudukEnum.php
app\Enums\CacatEnum.php                                     app\Enums\StatusPengaduanEnum.php
app\Enums\CaraKBEnum.php                                    app\Enums\StatusRekamEnum.php
app\Enums\DerajatSuratEnum.php                              app\Enums\StatusRTMEnum.php
app\Enums\DokumenEnum.php                                   app\Enums\StatusSuratKecamatanEnum.php
app\Enums\FirebaseEnum.php                                  app\Enums\SukuEnum.php
app\Enums\GolonganDarahEnum.php                             app\Enums\SumberDanaEnum.php
app\Enums\HamilEnum.php                                     app\Enums\TampilanArtikelEnum.php
app\Enums\HubunganRTMEnum.php                               app\Enums\TipeLinkEnum.php
app\Enums\InventarisMenuEnum.php                            app\Enums\WargaNegaraEnum.php
app\Enums\InventarisSubMenuEnum.php                         app\Enums\Dtks\DtksEnum.php
app\Enums\JabatanKelompokEnum.php                           app\Enums\Dtks\Regsosek2022kEnum.php
app\Enums\JawabanKepuasanEnum.php                           app\Enums\Statistik\StatistikEnum.php
app\Enums\JenisKelaminEnum.php                              app\Enums\Statistik\StatistikJenisBantuanEnum.php
app\Enums\JenisPeraturan.php                                app\Enums\Statistik\StatistikKeluargaEnum.php
app\Enums\KarakterSuratEnum.php                             app\Enums\Statistik\StatistikPendudukEnum.php
app\Enums\KategoriDokumenPeraturanEnum.php                  app\Enums\Statistik\StatistikRtmEnum.php
app\Enums\KategoriPublicEnum.php                            Modules\Analisis\Enums\AnalisisRefStateEnum.php
app\Enums\KategoriPublik.php                                Modules\Analisis\Enums\AnalisisRefSubjekEnum.php
app\Enums\KategoriPublikEnum.php                            Modules\Analisis\Enums\AnalisisTipeIndikatorEnum.php
app\Enums\KeluargaSejahteraEnum.php                         Modules\Kehadiran\Enums\StatusApproval.php
app\Enums\KeuanganRefRek1Enum.php                           Modules\Kehadiran\Enums\JenisIzin.php
app\Enums\ListSasaranEnum.php
app\Enums\OfflineModeEnum.php
app\Enums\PekerjaanEnum.php
app\Enums\PendidikanKKEnum.php
app\Enums\PendidikanSedangEnum.php
app\Enums\PendudukBidangEnum.php
app\Enums\PendudukKursusEnum.php
app\Enums\PeristiwaKeluargaEnum.php
app\Enums\PeristiwaPendudukEnum.php
app\Enums\PerubahanDataPiEnum.php
app\Enums\PeruntukanTanahKasEnum.php
app\Enums\PindahEnum.php
app\Enums\ReferensiEnum.php
app\Enums\SakitMenahunEnum.php
app\Enums\SasaranEnum.php
app\Enums\SatuanWaktuEnum.php
app\Enums\SHDKEnum.php
```
