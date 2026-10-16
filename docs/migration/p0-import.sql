-- =====================================================================
-- IMPOR DATA P0: OpenSID (legacy) -> Skema Aplikasi Baru (Opsi A)
-- =====================================================================
-- Sumber : database legacy OpenSID   : `opensid_legacy`  (mis. MySQL/MariaDB)
-- Target : database aplikasi baru     : `desa_new`
--
-- Strategi Opsi A: nama tabel & kolom dipertahankan; ID & kode enum tetap.
-- Karena itu mayoritas impor = INSERT ... SELECT 1:1.
--
-- PRASYARAT
--   1. Jalankan `npx drizzle-kit migrate` di DB target (membuat tabel baru).
--   2. Pastikan kedua DB dapat diakses dari server yang sama.
--   3. Backup DB target sebelum impor.
--   4. Jalankan dalam transaksi; cek hasil COUNT(*) tiap langkah.
--
-- CATATAN PENTING
--   - Multi-desa: skrip ini untuk SATU desa (satu `config_id`).
--     Untuk >1 desa, jalankan per config_id dan sesuaikan filter.
--   - Password lama (MD5) TIDAK kompatibel -> password_hash di-NULL-kan dan
--     must_reset_password=1 agar pengguna reset via aplikasi baru.
--   - Tanggal '0000-00-00' / '0000-00-00 00:00:00' -> NULL.
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- ---------------------------------------------------------------------
-- 1. config (identitas & tenant)
-- ---------------------------------------------------------------------
INSERT INTO desa_new.config
  (id, app_key, nama_desa, kode_desa, kode_pos, nama_kecamatan, kode_kecamatan,
   nama_kepala_camat, nip_kepala_camat, nama_kabupaten, kode_kabupaten,
   nama_propinsi, kode_propinsi, logo, lat, lng, alamat_kantor, email_desa,
   telepon, website)
SELECT
   id, app_key, nama_desa, kode_desa, kode_pos, nama_kecamatan, kode_kecamatan,
   nama_kepala_camat, nip_kepala_camat, nama_kabupaten, kode_kabupaten,
   nama_propinsi, kode_propinsi, logo, lat, lng, alamat_kantor, email_desa,
   telepon, website
FROM opensid_legacy.config;

-- ---------------------------------------------------------------------
-- 2. user_grup -> user_grup
-- ---------------------------------------------------------------------
INSERT INTO desa_new.user_grup (id, config_id, nama, slug, jenis)
SELECT id, config_id, nama, slug, jenis
FROM opensid_legacy.user_grup;

-- ---------------------------------------------------------------------
-- 3. setting_modul -> setting_modul
-- ---------------------------------------------------------------------
INSERT INTO desa_new.setting_modul
  (id, config_id, modul, slug, url, aktif, ikon, ikon_kecil, urut, level, hidden, parent)
SELECT
   id, config_id, modul, slug, url, IFNULL(aktif,1), ikon, ikon_kecil,
   IFNULL(urut,0), IFNULL(level,0), IFNULL(hidden,0), parent
FROM opensid_legacy.setting_modul;

-- ---------------------------------------------------------------------
-- 4. grup_akses -> grup_akses   (akses dipertahankan: 1/3/7)
-- ---------------------------------------------------------------------
INSERT INTO desa_new.grup_akses (id, config_id, id_grup, id_modul, akses)
SELECT id, config_id, id_grup, id_modul, IFNULL(akses,0)
FROM opensid_legacy.grup_akses;

-- ---------------------------------------------------------------------
-- 5. user -> user   (password direset)
-- ---------------------------------------------------------------------
INSERT INTO desa_new.user
  (id, config_id, username, password_hash, must_reset_password, id_grup, pamong_id,
   email, email_verified_at, active, nama, foto, phone, company, last_login)
SELECT
   id, config_id, username,
   NULL,                                  -- password_hash: hash MD5 lama tidak dipakai
   1,                                     -- must_reset_password
   id_grup, pamong_id,
   email, email_verified_at, IFNULL(active,1), nama, foto, phone, company, last_login
FROM opensid_legacy.user;

-- ---------------------------------------------------------------------
-- 6. setting_aplikasi -> setting_aplikasi
-- ---------------------------------------------------------------------
INSERT INTO desa_new.setting_aplikasi
  (id, config_id, judul, `key`, value, keterangan, jenis, `option`, attribute, kategori)
SELECT id, config_id, judul, `key`, value, keterangan, jenis, `option`, attribute, kategori
FROM opensid_legacy.setting_aplikasi;

-- ---------------------------------------------------------------------
-- 7. Tabel referensi (rename + impor 1:1)
-- ---------------------------------------------------------------------
INSERT INTO desa_new.ref_agama      (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_agama;
INSERT INTO desa_new.ref_pekerjaan  (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_pekerjaan;
INSERT INTO desa_new.ref_pendidikan_kk (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_pendidikan_kk;
INSERT INTO desa_new.ref_pendidikan_sedang (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_pendidikan;
INSERT INTO desa_new.ref_status_kawin (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_kawin;
INSERT INTO desa_new.ref_shdk        (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_hubungan;
INSERT INTO desa_new.ref_warganegara (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_warganegara;
INSERT INTO desa_new.ref_jenis_kelamin (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_sex;
INSERT INTO desa_new.ref_status_penduduk (id, nama) SELECT id, nama FROM opensid_legacy.tweb_penduduk_status;
INSERT INTO desa_new.ref_cacat       (id, nama) SELECT id, nama FROM opensid_legacy.tweb_cacat;
INSERT INTO desa_new.ref_keluarga_sejahtera (id, nama) SELECT id, nama FROM opensid_legacy.tweb_keluarga_sejahtera;
INSERT INTO desa_new.ref_rtm_hubungan (id, nama) SELECT id, nama FROM opensid_legacy.tweb_rtm_hubungan;
-- Asuransi/golongan darah/cara KB/sakit menahun biasanya dari tabel referensi;
-- sesuaikan nama tabel sumber bila berbeda.
-- INSERT INTO desa_new.ref_asuransi (id, nama) SELECT id, nama FROM opensid_legacy.ref_asuransi;
-- INSERT INTO desa_new.ref_golongan_darah (id, nama) SELECT id, nama FROM opensid_legacy.ref_golongan_darah;
-- INSERT INTO desa_new.ref_cara_kb (id, nama) SELECT id, nama FROM opensid_legacy.ref_cara_kb;
-- INSERT INTO desa_new.ref_sakit_menahun (id, nama) SELECT id, nama FROM opensid_legacy.ref_sakit_menahun;
-- INSERT INTO desa_new.ref_hamil (id, nama) SELECT id, nama FROM opensid_legacy.ref_penduduk_hamil;

-- ---------------------------------------------------------------------
-- 8. tweb_wil_clusterdesa -> tweb_wil_clusterdesa
-- ---------------------------------------------------------------------
INSERT INTO desa_new.tweb_wil_clusterdesa
  (id, config_id, rt, rw, dusun, id_kepala, lat, lng, zoom, path, map_tipe,
   warna, border, urut, urut_cetak)
SELECT
   id, config_id, rt, rw, dusun, id_kepala, lat, lng, zoom, path, map_tipe,
   warna, border, IFNULL(urut,0), IFNULL(urut_cetak,0)
FROM opensid_legacy.tweb_wil_clusterdesa;

-- ---------------------------------------------------------------------
-- 9. tweb_keluarga -> tweb_keluarga   (NIK/KK dinormalisasi digit)
-- ---------------------------------------------------------------------
INSERT INTO desa_new.tweb_keluarga
  (id, config_id, no_kk, nik_kepala, tgl_daftar, kelas_sosial, tgl_cetak_kk,
   alamat, id_cluster, updated_by, updated_at)
SELECT
   id, config_id,
   NULLIF(REGEXP_REPLACE(IFNULL(no_kk,''), '[^0-9]', ''), ''),
   NULLIF(REGEXP_REPLACE(IFNULL(nik_kepala,''), '[^0-9]', ''), ''),
   NULLIF(tgl_daftar, '0000-00-00 00:00:00'),
   kelas_sosial,
   NULLIF(tgl_cetak_kk, '0000-00-00 00:00:00'),
   alamat, id_cluster, updated_by, updated_at
FROM opensid_legacy.tweb_keluarga;

-- ---------------------------------------------------------------------
-- 10. tweb_penduduk -> tweb_penduduk
-- ---------------------------------------------------------------------
INSERT INTO desa_new.tweb_penduduk
  (id, config_id, nama, nik, id_kk, kk_level, id_rtm, rtm_level, sex,
   tempatlahir, tanggallahir, agama_id, pendidikan_kk_id, pendidikan_sedang_id,
   pekerjaan_id, status_kawin, warganegara_id, dokumen_pasport, dokumen_kitas,
   ayah_nik, ibu_nik, nama_ayah, nama_ibu, foto, golongan_darah_id, id_cluster,
   status, alamat_sebelumnya, alamat_sekarang, status_dasar, hamil, cacat_id,
   sakit_menahun_id, akta_lahir, akta_perkawinan, tanggalperkawinan,
   akta_perceraian, tanggalperceraian, cara_kb_id, telepon, tanggal_akhir_paspor,
   no_kk_sebelumnya, ktp_el, status_rekam, waktu_lahir, tempat_dilahirkan,
   jenis_kelahiran, kelahiran_anak_ke, penolong_kelahiran, berat_lahir,
   panjang_lahir, tag_id_card, id_asuransi, no_asuransi, email, email_token,
   email_tgl_kadaluarsa, email_tgl_verifikasi, bahasa_id, ket, negara_asal,
   tempat_cetak_ktp, tanggal_cetak_ktp, suku, bpjs_ketenagakerjaan, hubung_warga)
SELECT
   id, config_id, nama,
   NULLIF(REGEXP_REPLACE(IFNULL(nik,''), '[^0-9]', ''), ''),
   NULLIF(id_kk, 0), kk_level,
   NULLIF(id_rtm, ''),                 -- id_rtm string->int
   rtm_level, sex,
   tempatlahir,
   NULLIF(tanggallahir, '0000-00-00'),
   agama_id, pendidikan_kk_id, pendidikan_sedang_id, pekerjaan_id, status_kawin,
   warganegara_id, dokumen_pasport, dokumen_kitas, ayah_nik, ibu_nik, nama_ayah,
   nama_ibu, foto, golongan_darah_id, id_cluster, status, alamat_sebelumnya,
   alamat_sekarang, status_dasar,
   CASE WHEN hamil IN (1,2) THEN hamil ELSE NULL END,   -- 1=Hamil,2=Tidak; 0->NULL
   cacat_id, sakit_menahun_id, akta_lahir, akta_perkawinan,
   NULLIF(tanggalperkawinan, '0000-00-00'), akta_perceraian,
   NULLIF(tanggalperceraian, '0000-00-00'), cara_kb_id, telepon,
   NULLIF(tanggal_akhir_paspor, '0000-00-00'),
   no_kk_sebelumnya, IFNULL(ktp_el,0), status_rekam, waktu_lahir,
   tempat_dilahirkan, jenis_kelahiran, kelahiran_anak_ke, penolong_kelahiran,
   berat_lahir, panjang_lahir, tag_id_card, id_asuransi, no_asuransi, email,
   email_token, email_tgl_kadaluarsa, email_tgl_verifikasi, bahasa_id, ket,
   negara_asal, tempat_cetak_ktp, NULLIF(tanggal_cetak_ktp, '0000-00-00'),
   suku, bpjs_ketenagakerjaan, hubung_warga
FROM opensid_legacy.tweb_penduduk;

-- ---------------------------------------------------------------------
-- 11. tweb_desa_pamong -> tweb_desa_pamong
-- ---------------------------------------------------------------------
INSERT INTO desa_new.tweb_desa_pamong
  (pamong_id, config_id, pamong_nama, gelar_depan, gelar_belakang, pamong_nip,
   pamong_niap, pamong_nik, pamong_pin, pamong_tag_id_card, pamong_status,
   pamong_ttd, pamong_ub, pamong_tgl_terdaftar, foto, id_pend, pamong_tempatlahir,
   pamong_tanggallahir, pamong_sex, pamong_pendidikan, pamong_agama, pamong_nosk,
   pamong_tglsk, pamong_masajab, urut, pamong_pangkat, pamong_nohenti,
   pamong_tglhenti, atasan, jabatan_id)
SELECT
   pamong_id, config_id, pamong_nama, gelar_depan, gelar_belakang, pamong_nip,
   pamong_niap, pamong_nik, pamong_pin, pamong_tag_id_card, IFNULL(pamong_status,1),
   IFNULL(pamong_ttd,0), IFNULL(pamong_ub,0),
   NULLIF(pamong_tgl_terdaftar, '0000-00-00'), foto, id_pend, pamong_tempatlahir,
   NULLIF(pamong_tanggallahir, '0000-00-00'), pamong_sex, pamong_pendidikan,
   pamong_agama, pamong_nosk, NULLIF(pamong_tglsk, '0000-00-00'), pamong_masajab,
   IFNULL(urut,0), pamong_pangkat, pamong_nohenti,
   NULLIF(pamong_tglhenti, '0000-00-00'), atasan, jabatan_id
FROM opensid_legacy.tweb_desa_pamong;

-- ---------------------------------------------------------------------
-- 12. ref_syarat_surat
-- ---------------------------------------------------------------------
INSERT INTO desa_new.ref_syarat_surat (ref_syarat_id, config_id, ref_syarat_nama)
SELECT ref_syarat_id, config_id, ref_syarat_nama
FROM opensid_legacy.ref_syarat_surat;

-- ---------------------------------------------------------------------
-- 13. tweb_surat_format  (syarat_surat: validasi JSON bila perlu)
-- ---------------------------------------------------------------------
INSERT INTO desa_new.tweb_surat_format
  (id, config_id, nama, url_surat, kode_surat, lampiran, kunci, favorit, jenis,
   mandiri, masa_berlaku, satuan_masa_berlaku, qr_code, qr_code_tte, logo_garuda,
   kecamatan, syarat_surat, template, template_desa, form_isian, kode_isian,
   orientasi, ukuran, margin, margin_global, footer, header, format_nomor,
   format_nomor_global, sumber_penduduk_berulang)
SELECT
   id, config_id, nama, url_surat, kode_surat, lampiran, IFNULL(kunci,0),
   IFNULL(favorit,0), IFNULL(jenis,4), IFNULL(mandiri,0), masa_berlaku,
   satuan_masa_berlaku, IFNULL(qr_code,0), IFNULL(qr_code_tte,0),
   IFNULL(logo_garuda,0), IFNULL(kecamatan,0),
   CASE WHEN JSON_VALID(syarat_surat) THEN syarat_surat ELSE NULL END,
   template, template_desa, form_isian, kode_isian, orientasi, ukuran, margin,
   IFNULL(margin_global,0), IFNULL(footer,1), IFNULL(header,1), format_nomor,
   IFNULL(format_nomor_global,1), IFNULL(sumber_penduduk_berulang,0)
FROM opensid_legacy.tweb_surat_format;

-- ---------------------------------------------------------------------
-- 14. urls
-- ---------------------------------------------------------------------
INSERT INTO desa_new.urls (id, config_id, url, alias, created)
SELECT id, config_id, url, alias, created FROM opensid_legacy.urls;

-- ---------------------------------------------------------------------
-- 15. klasifikasi_surat, lampiran_surat
-- ---------------------------------------------------------------------
INSERT INTO desa_new.klasifikasi_surat (id, config_id, kode, nama, uraian, enabled)
SELECT id, config_id, kode, nama, uraian, IFNULL(enabled,1) FROM opensid_legacy.klasifikasi_surat;

INSERT INTO desa_new.lampiran_surat
  (id, config_id, slug, nama, jenis, template, template_desa, status)
SELECT id, config_id, slug, nama, IFNULL(jenis,2), template, template_desa, IFNULL(status,1)
FROM opensid_legacy.lampiran_surat;

-- ---------------------------------------------------------------------
-- 16. log_penduduk
-- ---------------------------------------------------------------------
INSERT INTO desa_new.log_penduduk
  (id, config_id, id_pend, kode_peristiwa, meninggal_di, jam_mati, sebab,
   penolong_mati, akta_mati, alamat_tujuan, tgl_lapor, tgl_peristiwa, catatan,
   no_kk, nama_kk, ref_pindah, maksud_tujuan_kedatangan)
SELECT
   id, config_id, id_pend, kode_peristiwa, meninggal_di, jam_mati, sebab,
   penolong_mati, akta_mati, alamat_tujuan,
   NULLIF(tgl_lapor, '0000-00-00 00:00:00'),
   NULLIF(tgl_peristiwa, '0000-00-00 00:00:00'),
   catatan, no_kk, nama_kk, ref_pindah, maksud_tujuan_kedatangan
FROM opensid_legacy.log_penduduk;

-- ---------------------------------------------------------------------
-- 17. log_keluarga
-- ---------------------------------------------------------------------
INSERT INTO desa_new.log_keluarga
  (id, config_id, id_kk, id_peristiwa, tgl_peristiwa, id_pend, updated_by, id_log_penduduk)
SELECT
   id, config_id, id_kk, id_peristiwa,
   NULLIF(tgl_peristiwa, '0000-00-00 00:00:00'),
   id_pend, updated_by, id_log_penduduk
FROM opensid_legacy.log_keluarga;

-- ---------------------------------------------------------------------
-- 18. log_surat   (nik_non_warga: decimal -> varchar)
-- ---------------------------------------------------------------------
INSERT INTO desa_new.log_surat
  (id, config_id, id_format_surat, id_pend, id_pamong, nama_pamong, nama_jabatan,
   id_user, tanggal, bulan, tahun, no_surat, nama_surat, lampiran, nik_non_warga,
   nama_non_warga, keterangan, lokasi_arsip, urls_id, status, log_verifikasi, tte,
   verifikasi_operator, verifikasi_sekdes, verifikasi_kades, isi_surat, kecamatan,
   pemohon, deleted_at)
SELECT
   id, config_id, id_format_surat, id_pend, id_pamong, nama_pamong, nama_jabatan,
   id_user, tanggal, bulan, tahun, no_surat, nama_surat, lampiran,
   CAST(nik_non_warga AS CHAR), nama_non_warga, keterangan, lokasi_arsip, urls_id,
   IFNULL(status,0), log_verifikasi, IFNULL(tte,0), verifikasi_operator,
   verifikasi_sekdes, verifikasi_kades, isi_surat, IFNULL(kecamatan,0), pemohon,
   deleted_at
FROM opensid_legacy.log_surat;

-- ---------------------------------------------------------------------
-- 19. permohonan_surat
-- ---------------------------------------------------------------------
INSERT INTO desa_new.permohonan_surat
  (id, config_id, id_pemohon, id_surat, isian_form, status, alasan, keterangan,
   no_hp_aktif, syarat, no_antrian, created_at, updated_at)
SELECT
   id, config_id, id_pemohon, id_surat,
   CASE WHEN JSON_VALID(isian_form) THEN isian_form ELSE NULL END,
   IFNULL(status,0), alasan, keterangan, no_hp_aktif, syarat, no_antrian,
   created_at, updated_at
FROM opensid_legacy.permohonan_surat;

-- ---------------------------------------------------------------------
-- 20. surat_masuk & surat_keluar
-- ---------------------------------------------------------------------
INSERT INTO desa_new.surat_masuk
  (id, config_id, nomor_urut, tanggal_penerimaan, nomor_surat, kode_surat,
   tanggal_surat, pengirim, isi_singkat, isi_disposisi, berkas_scan, lokasi_arsip)
SELECT id, config_id, nomor_urut,
   NULLIF(tanggal_penerimaan, '0000-00-00'), nomor_surat, kode_surat,
   NULLIF(tanggal_surat, '0000-00-00'), pengirim, isi_singkat, isi_disposisi,
   berkas_scan, lokasi_arsip
FROM opensid_legacy.surat_masuk;

INSERT INTO desa_new.surat_keluar
  (id, config_id, nomor_urut, nomor_surat, kode_surat, tanggal_surat,
   tanggal_catat, tujuan, isi_singkat, berkas_scan, ekspedisi, tanggal_pengiriman,
   tanda_terima, keterangan, lokasi_arsip)
SELECT id, config_id, nomor_urut, nomor_surat, kode_surat,
   NULLIF(tanggal_surat, '0000-00-00'), tanggal_catat, tujuan, isi_singkat,
   berkas_scan, IFNULL(ekspedisi,0), NULLIF(tanggal_pengiriman, '0000-00-00'),
   tanda_terima, keterangan, lokasi_arsip
FROM opensid_legacy.surat_keluar;

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- VERIFIKASI (jalankan setelah commit)
-- =====================================================================
-- SELECT 'config' t, COUNT(*) n FROM desa_new.config
-- UNION ALL SELECT 'user_grup', COUNT(*) FROM desa_new.user_grup
-- UNION ALL SELECT 'user', COUNT(*) FROM desa_new.user
-- UNION ALL SELECT 'tweb_wil_clusterdesa', COUNT(*) FROM desa_new.tweb_wil_clusterdesa
-- UNION ALL SELECT 'tweb_keluarga', COUNT(*) FROM desa_new.tweb_keluarga
-- UNION ALL SELECT 'tweb_penduduk', COUNT(*) FROM desa_new.tweb_penduduk
-- UNION ALL SELECT 'tweb_surat_format', COUNT(*) FROM desa_new.tweb_surat_format
-- UNION ALL SELECT 'log_surat', COUNT(*) FROM desa_new.log_surat
-- UNION ALL SELECT 'permohonan_surat', COUNT(*) FROM desa_new.permohonan_surat
-- UNION ALL SELECT 'log_penduduk', COUNT(*) FROM desa_new.log_penduduk
-- UNION ALL SELECT 'log_keluarga', COUNT(*) FROM desa_new.log_keluarga;

-- Cek orphan FK:
-- SELECT COUNT(*) FROM desa_new.tweb_penduduk p
--   LEFT JOIN desa_new.tweb_keluarga k ON k.id = p.id_kk
--   WHERE p.id_kk IS NOT NULL AND k.id IS NULL;
