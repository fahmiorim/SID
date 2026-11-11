# Laporan Riset Kompetitor SID

> Data dikumpulkan 10 November 2026. Fitur dan harga kompetitor adalah klaim
> vendor, bukan hasil uji independen. Lihat legenda dan sumber di
> [`MATRIKS-FITUR.md`](./MATRIKS-FITUR.md).

## 1. Ringkasan eksekutif

**Kita tidak kalah di fitur dasar. Kita kalah di ekosistem, kepatuhan regulasi,
dan kesiapan operasional.**

- Secara **rekayasa**, proyek ini termasuk yang paling modern di antara pemain
  yang dibandingkan: Next.js 16/React 19, TypeScript, MySQL/Drizzle,
  multi-tenant berbasis host, RBAC, audit, rate limit terpusat di database,
  API + OpenAPI, dan CI yang menjalankan migrasi idempoten, seed, smoke HTTP,
  serta E2E browser.
- Secara **kelengkapan produk**, kita masih di bawah OpenSID, Digides, EasyDes,
  dan SapaDesa. Yang paling mencolok: belum ada integrasi **Siskeudes**,
  **Prodeskel**, **DTSEN**, **PPID**, **PBB-P2**, dan **Data Presisi**.
- Secara **adopsi**, kita belum punya cerita. OpenSID sudah 22.069 terpasang dan
  8.376 desa aktif online (profil OpenDesa 2024); Digides 3.824 desa terdaftar;
  EasyDes, Simdesa, dan Nagari masing-masing mengklaim 500+ desa.
- Pasar SID besar dan sedang dipaksa berbenah: Siskeudes sudah dipakai di
  **75.265 desa**, dan Permendesa PDT **13/2025** mewajibkan Platform SID yang
  interoperabel dengan SPBE/Satu Data, memiliki SIG Desa, keamanan data, dan
  pencadangan.
- **Vonis:** proyek ini kuat sebagai **fondasi platform multi-desa** untuk
  DPMD/kabupaten atau integrator. Belum siap sebagai **produk SID siap jual**
  untuk desa tunggal yang hari ini butuh Siskeudes, Prodeskel, DTSEN, dan
  pendampingan.

## 2. Peta kompetitor

Harga adalah klaim vendor per November 2026.

| Kompetitor | Model | Skala/klaim | Fitur pembeda | Harga publik |
|---|---|---|---|---|
| **OpenSID / OpenDesa** | Open source GPL v3, self-hosted, komunitas + layanan premium | 22.069 terpasang, 8.376 aktif, 460 kabupaten (2024) | 30+ jenis surat, penduduk/KK/mutasi, buku administrasi, surat dinas, kehadiran, E-Stunting, TTE, Anjungan, Buku Tamu, Lapak, APBDes, OpenDK/OpenKab, Prodeskel & PPID (premium), DTSEN, Data Presisi, PBB (premium), Android (premium), API Satu Data, 2FA/OTP Telegram/email | Gratis; premium sekitar Rp1,02 jt/tahun; hosting Rp0,82–2,35 jt/tahun |
| **Digides / DigitalDesa** | SaaS + paket offline/hardware | 3.824 desa, 343 kabupaten, 53.754 pengguna | 32 jenis administrasi, 57 format persuratan, Siskeudes Online, PBB-P2, bansos, mobile warga, ANDI Smart (anjungan), absensi & buku tamu, WebGIS, PENDEKAR (monitoring), online/offline, marketplace, website profil | Online sekitar Rp9,2 jt/tahun; paket offline/hardware Rp40 jt + Rp2,5 jt/tahun; full offline Rp87,5 jt |
| **EasyDes** | SaaS all-in-one | 60 fitur; aplikasi Android 5K+ unduhan | Penduduk/keluarga/statistik, surat, PBB, TTE, absensi sidik jari/wajah, panic button, ID card, dokumen digital, produk hukum, IDM/SDGs, dashboard Smart Village kecamatan | Basic Rp2 jt/tahun; Gold Pro Rp2,5 jt/tahun; Platinum sekabupaten (hubungi) |
| **SapaDesa** | SaaS + opsi source code | 30+ grup modul, 142+ halaman, klaim paritas OpenSID | Prodeskel & DTSEN auto-sync, PPID, Data Presisi, Anjungan, Buku Tamu, kesehatan/posyandu, keuangan, pertanahan, 6 level role, migrasi dari OpenSID, NestJS + React + PostgreSQL | Klaim Rp315 rb sekali bayar untuk full source code — perlu verifikasi karena sangat agresif |
| **Simdesa** | SaaS | 500+ desa | AI assistant, "Lapor Pak" terhubung Polsek/Puskesmas/Damkar, marketplace, mobile, pendampingan | Tidak publik |
| **Nagari Digital** | SaaS | 500+ desa | AI template surat, smart report, keuangan, website, migrasi gratis, klaim uptime 99,9% | Rp10 jt/15 jt/17,999 jt per tahun; maksimum 1.000–2.000 penduduk |
| **iDESA** | SaaS/super app | 168+ desa, 93+ pengguna (klaim situs) | Siskeudes Link, mobile geo-attendance, perjalanan dinas/cuti online, SFT bansos, dashboard kecamatan/DPMD, BUMDes Finance & Kopdes (segera), MoU BUMDes Kemendes 2023 | Tidak publik |
| **SINDES.id** | SaaS | Target 75.265 desa | TTE BSrE BSSN, offline-first PWA, AI penulis berita, PPID, SDGs/IDM, grafik APBDes, peta PBB, enkripsi NIK, dukungan SPBE | Tidak publik |
| **DesaHub / site-desa.id** | SaaS multi-tenant | 14 desa | CMS desa, surat + QR, GIS, APBDes, PPID, mall UMKM, mobile, klaim SPBE/ISO 27001 | Tidak publik |
| **SINDEN** | SaaS | Baru, skala kecil | Dashboard kades, surat, keuangan, PBB-P2, absensi, audit trail | Rp5 jt/tahun |
| **SIDesa Jateng** | Platform pemerintah provinsi | Seluruh desa Jawa Tengah | SITKD (aset desa), BANKEU PEMDES (verifikasi bantuan keuangan), GEODESA (geospasial) | Layanan provinsi |

Catatan: **Siskeudes, Prodeskel, DTSEN, dan SIKD/OM-SPAN** bukan kompetitor
produk, tetapi standar nasional yang harus diintegrasikan. OpenSID menyebut
OpenDK/OpenKab; proyek ini justru mengecualikan OpenDK di
[`../../CAKUPAN-OPENSID.md`](../../CAKUPAN-OPENSID.md).

## 3. Kelebihan nyata proyek ini

1. **Multi-tenant by design, bukan tempelan.**  
   `src/features/multi-desa` mengelola provisioning desa, domain, dan isolasi
   host; ada `isolasi-host.integration.test.ts` dan
   `isolasi-village.integration.test.ts`. Ini jarang dimiliki SID self-hosted
   dan menjadi modal untuk model "satu instalasi untuk satu kabupaten".

2. **Arsitektur modern dan konsisten.**  
   53 folder fitur dengan lapisan domain/application/infrastructure/presentation,
   TypeScript, Zod, Drizzle, better-auth. Menambah fitur atau mengaudit batas
   tenant jauh lebih mudah daripada codebase PHP legacy.

3. **Keamanan tenant dan kontrol akses serius.**  
   `villageId` tidak diterima dari klien; RBAC resource/action; audit log; rate
   limit sliding-window di MySQL dengan HMAC; login OTP; backup/restore +
   verifikasi restore.

4. **Situs publik yang lebih peduli aksesibilitas.**  
   Dua tema (Natra, Esensi), slot halaman, Atkinson Hyperlegible, kontras, focus
   ring, skip link, reduced motion, manifest per desa.

5. **Cakupan administratif sudah lebar.**  
   112 ID katalog, 206 halaman, 79 route API: surat masuk/keluar, disposisi,
   ekspedisi, agenda, keuangan APBDes, kesehatan/posyandu, kehadiran, anjungan,
   buku tamu, lapak, GIS, IDM/SDGs, survei, pengaduan, DPT dengan redaksi NIK.

6. **API-first.**  
   `api-eksternal` punya OpenAPI dan API key; `api-publik` melayani data publik.
   Ini fondasi untuk Satu Data/SPBE yang tidak dimiliki banyak pesaing SaaS
   kecil.

7. **Disiplin verifikasi.**  
   184 berkas unit/1.489 test, 63 berkas E2E/195 `test()`, CI menjalankan
   migrasi dari DB kosong dua kali, seed, smoke HTTP, dan E2E browser.

8. **Kode orisinal, tidak terkontaminasi GPL OpenSID.**  
   Karena tidak menyalin OpenSID, proyek bebas menentukan lisensi komersial —
   asalkan lisensi proyek segera ditetapkan.

## 4. Kekurangan: diurutkan berdasarkan dampak

### P0 — menghambat adopsi dan kepatuhan

1. **Tidak ada integrasi Siskeudes.**  
   Modul keuangan adalah buku APBDes dengan impor template Excel/CSV
   (`apbdes-import.ts`), bukan baca/tulis format Siskeudes. Padahal Siskeudes
   adalah standar nasional di 75.265 desa. Akibatnya desa harus input ganda dan
   angka APBDes berisiko tidak cocok dengan laporan resmi. Digides dan iDESA
   sudah menjual integrasi ini secara eksplisit.

2. **Tidak ada Prodeskel, DTSEN, PPID, PBB-P2, dan Data Presisi.**  
   OpenSID menyediakan Prodeskel/PPID (premium), DTSEN, dan Data Presisi;
   Digides punya Prodeskel dan PBB-P2; SapaDesa mengklaim auto-sync
   Prodeskel/DTSEN; SINDES punya PPID dan peta PBB. Ketiadaan ini menyangkut
   kewajiban administratif dan keterbukaan informasi.

3. **Tidak ada jalur migrasi dari OpenSID/Excel.**  
   Ini penghalang adopsi nomor satu. Nagari menawarkan migrasi gratis; EasyDes
   punya paket migrasi; SapaDesa punya tools migrasi OpenSID → PostgreSQL.

4. **Belum selaras dengan Permendesa PDT 13/2025 dan SPBE.**  
   Regulasi menghendaki Platform SID/Satu iDesa, SIG Desa, interoperabilitas
   dengan aplikasi SPBE daerah/pusat, keamanan data, dan pencadangan. Proyek
   punya GIS dan API, tetapi belum ada pemetaan standar data, layanan
   interoperabilitas, atau kemitraan platform.

5. **Lisensi proyek belum ada.**  
   Tidak ada `LICENSE` dan tidak ada field `license` di `package.json`. Ini
   risiko hukum nyata jika proyek dipakai desa, dinas, atau mitra.

### P1 — menghambat daya saing produk

6. **Mobile dan offline tertinggal.**  
   Hanya ada `manifest.ts`; tidak ada service worker, antrean offline, atau
   aplikasi Android/iOS. Digides, EasyDes, dan OpenSID (premium) punya app;
   SINDES mengklaim offline-first PWA.

7. **Pustaka surat masih tipis.**  
   Seed hanya 6 jenis surat (`S-01`, `S-02`, `S-07`, `S-11`, `S-41`, `500`).
   OpenSID punya 30+ surat; Digides 57 format sesuai Permendagri 109/2019.

8. **Buku administrasi belum lengkap 32 jenis.**  
   `BUKU_INTI` mengelompokkan buku A/B/E (umum, penduduk, tanah) dan modul
   keuangan/pembangunan terpisah. Digides menjual "32 jenis administrasi sesuai
   Permendagri 47/2016".

9. **Tidak ada BUMDes finance, koperasi, dan dashboard supra-desa.**  
   67.320 desa punya BUMDes, baru 22.980 berbadan hukum — pasar besar yang belum
   disentuh. iDESA menyiapkan BUMDes Finance/Kopdes.

10. **TTE/WhatsApp/email belum terbukti produksi.**  
    Adapter TTE ada (`OS-SUR-013`, skema `tte.ts`), tetapi belum ada bukti
    kredensial BSrE produksi. WhatsApp baru berupa provider di modul pengaduan;
    belum ada bukti gateway aktif.

11. **2FA belum setara OpenSID.**  
    Login OTP ada, tetapi belum ada authenticator/TOTP atau OTP Telegram seperti
    OpenSID.

### P2 — kesiapan operasi dan skala

12. **Belum ada paket instalasi.**  
    Tidak ada Dockerfile/compose/installer. OpenSID punya ekosistem hosting dan
    panduan XAMPP; Digides menjual perangkat siap pasang.

13. **Penyimpanan file lokal.**  
    Media dan laporan keuangan disimpan di `storage/` pada disk aplikasi,
    menghambat deployment multi-instance dan pemindahan beban.

14. **Belum ada observability dan queue.**  
    Hanya `logger.ts`; tidak ada metrics, tracing, error tracking, atau job
    queue. Notifikasi berjalan sinkron.

15. **Pengerasan keamanan belum lengkap.**  
    NIK disimpan sebagai `varchar(16)` biasa tanpa enkripsi tingkat aplikasi.
    Tidak ada CSP/HSTS/X-Frame-Options di `next.config` (jika reverse proxy
    tidak menambahkannya, publikasi internet akan lemah). Belum ada malware scan
    unggahan, penetration test, atau kebijakan retensi data.

16. **Kualitas belum merata.**  
    Menurut `docs/STATUS-MODUL.md`: 18 ID belum punya E2E, 4 parsial, 1
    terblokir. Audit visual 206 halaman belum selesai. Tidak ada coverage
    threshold.

17. **Belum ada paket komersial.**  
    Tidak ada demo, onboarding, pelatihan operator, SLA, harga, atau dokumentasi
    pengguna akhir. OpenSID menang lewat komunitas; Digides/EasyDes/Nagari
    menang lewat pendampingan.

## 5. Head-to-head singkat

**vs OpenSID/OpenDesa.** OpenSID menang di ekosistem, modul regulasi, komunitas,
dan adopsi. Proyek ini menang di arsitektur, multi-tenant, aksesibilitas, API,
dan kualitas kode. Untuk desa tunggal, OpenSID masih pilihan default; untuk
kabupaten yang ingin platform modern, proyek ini punya cerita.

**vs Digides.** Digides paling lengkap secara operasional: 32 administrasi, 57
surat, Siskeudes Online, PBB, Android, offline, hardware, pendampingan. Proyek
ini lebih terbuka dan modern, tetapi belum punya kedalaman administrasi dan
integrasi nasionalnya.

**vs EasyDes/SINDEN/Nagari.** Mereka menang di harga jelas, onboarding, dan
fitur siap pakai (TTE, Android, PBB, AI). Proyek ini menang di arsitektur dan
keamanan tenant. Untuk desa kecil dengan anggaran Rp2–5 jt/tahun, mereka lebih
mudah dijual.

**vs SapaDesa.** Pembanding paling dekat: klaim paritas OpenSID, stack
NestJS/React/PostgreSQL, Prodeskel/DTSEN auto-sync, source code murah. Proyek ini
unggul di tenancy, test, dan aksesibilitas; mereka unggul di kelengkapan modul
dan paket komersial.

**vs iDESA/SINDES.** iDESA kuat di Siskeudes Link, mobile, SFT bansos, dan
dashboard supra-desa; SINDES kuat di TTE BSrE, offline PWA, PPID, dan narasi
SPBE. Proyek ini belum punya jawaban setara untuk integrasi keuangan dan
kepatuhan.

**vs DesaHub/SIDesa Jateng.** DesaHub menunjukkan bahwa multi-tenant SaaS sudah
jadi model pasar; SIDesa Jateng menunjukkan bahwa platform provinsi menuntut
SITKD/BANKEU/GEODESA. Proyek ini punya mesin multi-tenant, tetapi belum punya
konektor ke ekosistem daerah.

## 6. Rekomendasi prioritas

**P0 — agar layak diadopsi:**

1. Importer/exporter **Siskeudes** (minimal APBDes + realisasi, lalu API/SIKD).
2. **Prodeskel** dan **DTSEN** (impor/ekspor + pemetaan data penduduk/keluarga).
3. Modul **PPID** (daftar informasi, permohonan, keberatan) dan **PBB-P2** dasar.
4. **Importer OpenSID/Excel** untuk penduduk, KK, surat, dan APBDes.
5. Tetapkan **lisensi** dan dokumen kepatuhan UU PDP; enkripsi NIK at-rest.
6. Peta interoperabilitas **SPBE/Satu Data/SIG Desa** sesuai Permendesa 13/2025.

**P1 — agar kompetitif:**

7. Pustaka **30+ surat** dan **32 buku administrasi** sesuai Permendagri.
8. **Android/PWA offline** dengan antrean sinkronisasi.
9. **TTE BSrE** dan **WhatsApp/email** produksi, plus 2FA TOTP.
10. **BUMDes finance/koperasi** dan dashboard agregat kecamatan/DPMD.
11. Audit visual dan aksesibilitas 206 halaman; naikkan cakupan E2E 18 ID yang
    tersisa.

**P2 — agar skalabel:**

12. Docker/compose/installer, object storage, job queue, metrics/tracing, backup
    terenkripsi.
13. Header keamanan (CSP/HSTS), malware scan, penetration test.
14. Demo, panduan operator, pelatihan, SLA, dan paket harga.

## 7. Vonis

**Untuk desa tunggal yang butuh SID lengkap hari ini:** belum. OpenSID, Digides,
dan EasyDes lebih siap.

**Untuk DPMD/kabupaten yang ingin satu instalasi multi-desa dengan domain dan
isolasi data:** ini peluang terbaik. Belum ada pesaing self-hosted yang
menggabungkan multi-tenant, aksesibilitas, API, dan test discipline seperti ini.

**Untuk integrator/ISV:** fondasi teknisnya paling bersih di antara yang
dibandingkan, tetapi harus dilengkapi lisensi, konektor regulasi, dan paket
operasi.

Kalimat pendeknya: **proyek ini unggul di kualitas rekayasa, bukan di
kelengkapan produk atau ekosistem.** Jangan mengejar 112 ID berikutnya;
lengkapi dulu lima fondasi: Siskeudes, Prodeskel/DTSEN, PPID/PBB, migrasi
OpenSID, dan lisensi.
