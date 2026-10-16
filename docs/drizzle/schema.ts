/**
 * Skema Drizzle ORM — Modul Prioritas P0 (rebuild OpenSID)
 * Target: MySQL 8 / MariaDB.
 *
 * Strategi: **Opsi A — Kompatibel** (lihat LAMPIRAN-04).
 *   - Nama tabel & kolom legacy DIPERTAHANKAN (snake_case) agar impor 1:1.
 *   - ID numerik lama DIPERTAHANKAN (dipakai relasi logis OpenSID).
 *   - Kode enum numerik DIPERTAHANKAN (tinyint/smallint + komentar), bukan ENUM DB.
 *   - Tipe dinaikkan seperlunya (varchar length, boolean, datetime, json).
 *   - Kolom audit baru: created_at / updated_at / deleted_at pada tabel transaksional.
 *
 * Catatan: nama kolom yang di-rename lebih rapi (mis. id_kk -> keluarga_id) dapat
 * dilakukan bertahap (Opsi B) SETELAH aplikasi baru stabil. Untuk MVP, pakai nama legacy.
 *
 * Cara pakai:
 *   npm i drizzle-orm mysql2
 *   npm i -D drizzle-kit
 *   // drizzle.config.ts -> { dialect: 'mysql', schema: './drizzle/schema.ts', out: './drizzle' }
 *   npx drizzle-kit generate
 *   npx drizzle-kit migrate
 */

import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  char,
  date,
  datetime,
  index,
  int,
  json,
  longtext,
  mysqlTable,
  smallint,
  text,
  tinyint,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

// Factory functions (jangan pakai ulang instance builder antar-tabel).
const createdAt = () => datetime('created_at').default(sql`CURRENT_TIMESTAMP`);
const updatedAt = () =>
  datetime('updated_at').default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
const deletedAt = () => datetime('deleted_at');

/* ------------------------------------------------------------------ */
/* 1. Master tenant & RBAC                                            */
/* ------------------------------------------------------------------ */

/** `config` — identitas desa & tenant (multi-desa). PK = `config_id`. */
export const config = mysqlTable('config', {
  id: int('id').autoincrement().primaryKey(),
  appKey: varchar('app_key', { length: 255 }),
  namaDesa: varchar('nama_desa', { length: 100 }),
  kodeDesa: char('kode_desa', { length: 10 }),
  kodePos: varchar('kode_pos', { length: 5 }),
  namaKecamatan: varchar('nama_kecamatan', { length: 100 }),
  kodeKecamatan: char('kode_kecamatan', { length: 8 }),
  namaKepalaCamat: varchar('nama_kepala_camat', { length: 100 }),
  nipKepalaCamat: varchar('nip_kepala_camat', { length: 30 }),
  namaKabupaten: varchar('nama_kabupaten', { length: 100 }),
  kodeKabupaten: char('kode_kabupaten', { length: 4 }),
  namaPropinsi: varchar('nama_propinsi', { length: 100 }),
  kodePropinsi: char('kode_propinsi', { length: 2 }),
  logo: varchar('logo', { length: 255 }),
  lat: varchar('lat', { length: 30 }),
  lng: varchar('lng', { length: 30 }),
  alamatKantor: varchar('alamat_kantor', { length: 255 }),
  emailDesa: varchar('email_desa', { length: 100 }),
  telepon: varchar('telepon', { length: 30 }),
  website: varchar('website', { length: 255 }),
  jamKerja: text('jam_kerja'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** `user_grup` — role. jenis: 1=Sistem, 2=Desa. */
export const userGrup = mysqlTable(
  'user_grup',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    nama: varchar('nama', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    jenis: tinyint('jenis').notNull().default(2),
  },
  (t) => ({
    uqSlug: uniqueIndex('user_grup_config_slug_uq').on(t.configId, t.slug),
  }),
);

/** `setting_modul` — katalog modul/permission. `modul` = label. */
export const settingModul = mysqlTable(
  'setting_modul',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    modul: varchar('modul', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    url: varchar('url', { length: 255 }),
    aktif: boolean('aktif').notNull().default(true),
    ikon: varchar('ikon', { length: 100 }),
    ikonKecil: varchar('ikon_kecil', { length: 100 }),
    urut: int('urut').default(0),
    level: boolean('level').default(false),
    hidden: boolean('hidden').default(false),
    parent: int('parent'),
  },
  (t) => ({
    uqSlug: uniqueIndex('setting_modul_config_slug_uq').on(t.configId, t.slug),
    idxParent: index('setting_modul_parent_idx').on(t.parent),
  }),
);

/** `grup_akses` — hak akses role×modul. akses: 1=Baca, 3=Ubah, 7=Hapus. */
export const grupAkses = mysqlTable(
  'grup_akses',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    idGrup: int('id_grup').notNull().references(() => userGrup.id),
    idModul: int('id_modul').notNull().references(() => settingModul.id),
    akses: tinyint('akses').notNull().default(0),
  },
  (t) => ({
    uq: uniqueIndex('grup_akses_uq').on(t.configId, t.idGrup, t.idModul),
  }),
);

/** `user` — pengguna admin/SITEMAN. */
export const user = mysqlTable(
  'user',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    username: varchar('username', { length: 100 }).notNull(),
    /** Diisi hash bcrypt/argon2 baru; hash MD5 lama TIDAK dipakai -> paksa reset. */
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    mustResetPassword: boolean('must_reset_password').notNull().default(false),
    idGrup: int('id_grup').notNull().references(() => userGrup.id),
    pamongId: int('pamong_id'),
    email: varchar('email', { length: 255 }),
    emailVerifiedAt: datetime('email_verified_at'),
    active: boolean('active').notNull().default(true),
    nama: varchar('nama', { length: 100 }),
    foto: varchar('foto', { length: 255 }),
    phone: varchar('phone', { length: 30 }),
    company: varchar('company', { length: 100 }),
    lastLogin: datetime('last_login'),
    batasiWilayah: boolean('batasi_wilayah').notNull().default(false),
    /** JSON array id_cluster (pengganti kolom `akses_wilayah`). */
    aksesWilayah: json('akses_wilayah'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    uqUsername: uniqueIndex('user_config_username_uq').on(t.configId, t.username),
  }),
);

/** `setting_aplikasi` — pengaturan aplikasi per desa. */
export const settingAplikasi = mysqlTable(
  'setting_aplikasi',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    judul: varchar('judul', { length: 100 }),
    key: varchar('key', { length: 100 }).notNull(),
    value: text('value'),
    keterangan: varchar('keterangan', { length: 255 }),
    jenis: varchar('jenis', { length: 30 }),
    option: text('option'),
    attribute: text('attribute'),
    kategori: varchar('kategori', { length: 50 }),
  },
  (t) => ({
    uqKey: uniqueIndex('setting_aplikasi_config_key_uq').on(t.configId, t.key),
  }),
);

/* ------------------------------------------------------------------ */
/* 2. Tabel referensi (lookup) — impor 1:1, pertahankan ID            */
/* ------------------------------------------------------------------ */

const refTable = (name: string) =>
  mysqlTable(name, {
    id: int('id').notNull().primaryKey(),
    nama: varchar('nama', { length: 100 }).notNull(),
  });

export const refAgama = refTable('ref_agama');
export const refPekerjaan = refTable('ref_pekerjaan');
export const refPendidikanKk = refTable('ref_pendidikan_kk');
export const refPendidikanSedang = refTable('ref_pendidikan_sedang');
export const refStatusKawin = refTable('ref_status_kawin');
export const refShdk = refTable('ref_shdk');
export const refWarganegara = refTable('ref_warganegara');
export const refJenisKelamin = refTable('ref_jenis_kelamin');
export const refStatusPenduduk = refTable('ref_status_penduduk');
export const refGolonganDarah = refTable('ref_golongan_darah');
export const refCacat = refTable('ref_cacat');
export const refAsuransi = refTable('ref_asuransi');
export const refKeluargaSejahtera = refTable('ref_keluarga_sejahtera');
export const refRtmHubungan = refTable('ref_rtm_hubungan');
export const refHamil = refTable('ref_hamil');
export const refSakitMenahun = refTable('ref_sakit_menahun');
export const refCaraKb = refTable('ref_cara_kb');

/* ------------------------------------------------------------------ */
/* 3. Wilayah (struktur datar: dusun / RW / RT dalam satu tabel)      */
/* ------------------------------------------------------------------ */

/** `tweb_wil_clusterdesa` — wilayah. */
export const twebWilClusterdesa = mysqlTable(
  'tweb_wil_clusterdesa',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    rt: varchar('rt', { length: 10 }),
    rw: varchar('rw', { length: 10 }),
    dusun: varchar('dusun', { length: 100 }),
    idKepala: int('id_kepala'),
    lat: varchar('lat', { length: 30 }),
    lng: varchar('lng', { length: 30 }),
    zoom: int('zoom'),
    path: text('path'),
    mapTipe: varchar('map_tipe', { length: 30 }),
    warna: varchar('warna', { length: 30 }),
    border: varchar('border', { length: 30 }),
    urut: int('urut').default(0),
    urutCetak: int('urut_cetak').default(0),
  },
  (t) => ({
    idxCluster: index('wilayah_config_dusun_rw_rt_idx').on(t.configId, t.dusun, t.rw, t.rt),
  }),
);

/* ------------------------------------------------------------------ */
/* 4. Kependudukan                                                     */
/* ------------------------------------------------------------------ */

/** `tweb_keluarga` — Kartu Keluarga. */
export const twebKeluarga = mysqlTable(
  'tweb_keluarga',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    noKk: char('no_kk', { length: 16 }),
    nikKepala: char('nik_kepala', { length: 16 }),
    tglDaftar: datetime('tgl_daftar'),
    kelasSosial: int('kelas_sosial'),
    tglCetakKk: datetime('tgl_cetak_kk'),
    alamat: varchar('alamat', { length: 255 }),
    idCluster: int('id_cluster').references(() => twebWilClusterdesa.id),
    updatedBy: int('updated_by'),
    updatedAt: updatedAt(),
    createdAt: createdAt(),
    deletedAt: deletedAt(),
  },
  (t) => ({
    uqNoKk: uniqueIndex('keluarga_config_no_kk_uq').on(t.configId, t.noKk),
    idxCluster: index('keluarga_config_cluster_idx').on(t.configId, t.idCluster),
  }),
);

/** `tweb_penduduk` — data penduduk. */
export const twebPenduduk = mysqlTable(
  'tweb_penduduk',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    nama: varchar('nama', { length: 100 }),
    nik: char('nik', { length: 16 }),
    idKk: int('id_kk').references(() => twebKeluarga.id),
    kkLevel: smallint('kk_level'), // SHDK 1..11
    idRtm: int('id_rtm'),
    rtmLevel: smallint('rtm_level'), // 1=KRT, 2=Anggota
    sex: smallint('sex'), // 1=L, 2=P
    tempatlahir: varchar('tempatlahir', { length: 100 }),
    tanggallahir: date('tanggallahir'),
    agamaId: int('agama_id'),
    pendidikanKkId: int('pendidikan_kk_id'),
    pendidikanSedangId: int('pendidikan_sedang_id'),
    pekerjaanId: int('pekerjaan_id'),
    statusKawin: smallint('status_kawin'), // 1..4
    warganegaraId: smallint('warganegara_id'), // 1=WNI,2=WNA,3=Dua
    dokumenPasport: varchar('dokumen_pasport', { length: 30 }),
    dokumenKitas: varchar('dokumen_kitas', { length: 30 }),
    ayahNik: char('ayah_nik', { length: 16 }),
    ibuNik: char('ibu_nik', { length: 16 }),
    namaAyah: varchar('nama_ayah', { length: 100 }),
    namaIbu: varchar('nama_ibu', { length: 100 }),
    foto: varchar('foto', { length: 255 }),
    golonganDarahId: int('golongan_darah_id'), // 1..13
    idCluster: int('id_cluster').references(() => twebWilClusterdesa.id),
    status: smallint('status'), // 1=Tetap, 2=Tidak Tetap
    alamatSebelumnya: varchar('alamat_sebelumnya', { length: 255 }),
    alamatSekarang: varchar('alamat_sekarang', { length: 255 }),
    statusDasar: smallint('status_dasar'), // 1,2,3,4,6,9
    hamil: smallint('hamil'), // 1=Hamil, 2=Tidak Hamil
    cacatId: int('cacat_id'),
    sakitMenahunId: int('sakit_menahun_id'),
    aktaLahir: varchar('akta_lahir', { length: 50 }),
    aktaPerkawinan: varchar('akta_perkawinan', { length: 50 }),
    tanggalperkawinan: date('tanggalperkawinan'),
    aktaPerceraian: varchar('akta_perceraian', { length: 50 }),
    tanggalperceraian: date('tanggalperceraian'),
    caraKbId: smallint('cara_kb_id'),
    telepon: varchar('telepon', { length: 30 }),
    tanggalAkhirPaspor: date('tanggal_akhir_paspor'),
    noKkSebelumnya: char('no_kk_sebelumnya', { length: 16 }),
    ktpEl: boolean('ktp_el'),
    statusRekam: smallint('status_rekam'), // 1=Belum,2=KTP-el,3=KIA
    waktuLahir: varchar('waktu_lahir', { length: 10 }),
    tempatDilahirkan: smallint('tempat_dilahirkan'), // 1..5
    jenisKelahiran: smallint('jenis_kelahiran'), // 1..4
    kelahiranAnakKe: smallint('kelahiran_anak_ke'),
    penolongKelahiran: smallint('penolong_kelahiran'), // 1..4
    beratLahir: smallint('berat_lahir'),
    panjangLahir: varchar('panjang_lahir', { length: 10 }),
    tagIdCard: varchar('tag_id_card', { length: 50 }),
    idAsuransi: smallint('id_asuransi'), // 1..4,99
    noAsuransi: varchar('no_asuransi', { length: 50 }),
    email: varchar('email', { length: 255 }),
    emailToken: varchar('email_token', { length: 255 }),
    emailTglKadaluarsa: datetime('email_tgl_kadaluarsa'),
    emailTglVerifikasi: datetime('email_tgl_verifikasi'),
    bahasaId: smallint('bahasa_id'), // 1..6
    ket: varchar('ket', { length: 255 }),
    negaraAsal: varchar('negara_asal', { length: 100 }),
    tempatCetakKtp: varchar('tempat_cetak_ktp', { length: 100 }),
    tanggalCetakKtp: date('tanggal_cetak_ktp'),
    suku: varchar('suku', { length: 100 }),
    bpjsKetenagakerjaan: varchar('bpjs_ketenagakerjaan', { length: 50 }),
    hubungWarga: varchar('hubung_warga', { length: 50 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => ({
    uqNik: uniqueIndex('penduduk_config_nik_uq').on(t.configId, t.nik),
    idxKk: index('penduduk_config_id_kk_idx').on(t.configId, t.idKk),
    idxStatusDasar: index('penduduk_config_status_dasar_idx').on(t.configId, t.statusDasar),
    idxCluster: index('penduduk_config_cluster_idx').on(t.configId, t.idCluster),
  }),
);

/** `tweb_desa_pamong` — perangkat desa. PK = `pamong_id`. */
export const twebDesaPamong = mysqlTable('tweb_desa_pamong', {
  pamongId: int('pamong_id').autoincrement().primaryKey(),
  configId: int('config_id').notNull().references(() => config.id),
  pamongNama: varchar('pamong_nama', { length: 100 }),
  gelarDepan: varchar('gelar_depan', { length: 30 }),
  gelarBelakang: varchar('gelar_belakang', { length: 30 }),
  pamongNip: varchar('pamong_nip', { length: 30 }),
  pamongNiap: varchar('pamong_niap', { length: 30 }),
  pamongNik: char('pamong_nik', { length: 16 }),
  pamongPin: varchar('pamong_pin', { length: 255 }),
  pamongTagIdCard: varchar('pamong_tag_id_card', { length: 50 }),
  pamongStatus: boolean('pamong_status').default(true),
  pamongTtd: boolean('pamong_ttd').default(false),
  pamongUb: boolean('pamong_ub').default(false),
  pamongTglTerdaftar: date('pamong_tgl_terdaftar'),
  foto: varchar('foto', { length: 255 }),
  idPend: int('id_pend').references(() => twebPenduduk.id),
  pamongTempatlahir: varchar('pamong_tempatlahir', { length: 100 }),
  pamongTanggallahir: date('pamong_tanggallahir'),
  pamongSex: tinyint('pamong_sex'),
  pamongPendidikan: int('pamong_pendidikan'),
  pamongAgama: int('pamong_agama'),
  pamongNosk: varchar('pamong_nosk', { length: 50 }),
  pamongTglsk: date('pamong_tglsk'),
  pamongMasajab: varchar('pamong_masajab', { length: 50 }),
  urut: int('urut').default(0),
  pamongPangkat: varchar('pamong_pangkat', { length: 50 }),
  pamongNohenti: varchar('pamong_nohenti', { length: 50 }),
  pamongTglhenti: date('pamong_tglhenti'),
  atasan: int('atasan'),
  jabatanId: int('jabatan_id'),
});

/* ------------------------------------------------------------------ */
/* 5. Persuratan                                                       */
/* ------------------------------------------------------------------ */

/** `ref_syarat_surat`. PK = `ref_syarat_id`. */
export const refSyaratSurat = mysqlTable('ref_syarat_surat', {
  refSyaratId: int('ref_syarat_id').autoincrement().primaryKey(),
  configId: int('config_id').notNull().references(() => config.id),
  refSyaratNama: varchar('ref_syarat_nama', { length: 100 }),
});

/** `urls` — URL verifikasi/QR surat. */
export const urls = mysqlTable('urls', {
  id: int('id').autoincrement().primaryKey(),
  configId: int('config_id').notNull().references(() => config.id),
  url: varchar('url', { length: 255 }),
  alias: varchar('alias', { length: 100 }),
  created: datetime('created'),
});

/** `tweb_surat_format` — template & jenis surat. jenis: 3=Sistem, 4=Desa. */
export const twebSuratFormat = mysqlTable(
  'tweb_surat_format',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    nama: varchar('nama', { length: 100 }).notNull(),
    urlSurat: varchar('url_surat', { length: 100 }).notNull(),
    kodeSurat: varchar('kode_surat', { length: 10 }),
    lampiran: varchar('lampiran', { length: 100 }),
    kunci: boolean('kunci').default(false),
    favorit: boolean('favorit').default(false),
    jenis: tinyint('jenis').notNull().default(4),
    mandiri: boolean('mandiri').default(false),
    masaBerlaku: int('masa_berlaku'),
    satuanMasaBerlaku: char('satuan_masa_berlaku', { length: 1 }), // H/M/B/T
    qrCode: boolean('qr_code').default(false),
    qrCodeTte: boolean('qr_code_tte').default(false),
    logoGaruda: boolean('logo_garuda').default(false),
    kecamatan: boolean('kecamatan').default(false),
    /** JSON array `ref_syarat_id`. */
    syaratSurat: json('syarat_surat'),
    template: longtext('template'),
    templateDesa: longtext('template_desa'),
    formIsian: longtext('form_isian'),
    kodeIsian: longtext('kode_isian'),
    orientasi: varchar('orientasi', { length: 10 }).default('Potrait'),
    ukuran: varchar('ukuran', { length: 10 }).default('F4'),
    margin: text('margin'),
    marginGlobal: boolean('margin_global').default(false),
    footer: int('footer').default(1),
    header: int('header').default(1),
    formatNomor: varchar('format_nomor', { length: 100 }),
    formatNomorGlobal: boolean('format_nomor_global').default(true),
    sumberPendudukBerulang: boolean('sumber_penduduk_berulang').default(false),
  },
  (t) => ({
    uqUrl: uniqueIndex('surat_format_config_url_uq').on(t.configId, t.urlSurat),
  }),
);

/** `log_surat` — arsip surat. status: -1=Ditolak, 0=Konsep, 1=Cetak. */
export const logSurat = mysqlTable(
  'log_surat',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    idFormatSurat: int('id_format_surat').notNull().references(() => twebSuratFormat.id),
    idPend: int('id_pend').references(() => twebPenduduk.id),
    idPamong: int('id_pamong').references(() => twebDesaPamong.pamongId),
    namaPamong: varchar('nama_pamong', { length: 100 }),
    namaJabatan: varchar('nama_jabatan', { length: 100 }),
    idUser: int('id_user').references(() => user.id),
    tanggal: datetime('tanggal'),
    bulan: varchar('bulan', { length: 2 }),
    tahun: varchar('tahun', { length: 4 }),
    noSurat: varchar('no_surat', { length: 100 }),
    namaSurat: varchar('nama_surat', { length: 100 }),
    lampiran: varchar('lampiran', { length: 100 }),
    nikNonWarga: varchar('nik_non_warga', { length: 16 }),
    namaNonWarga: varchar('nama_non_warga', { length: 100 }),
    keterangan: text('keterangan'),
    lokasiArsip: varchar('lokasi_arsip', { length: 255 }),
    urlsId: int('urls_id').references(() => urls.id),
    status: tinyint('status').notNull().default(0),
    logVerifikasi: text('log_verifikasi'),
    tte: boolean('tte').default(false),
    verifikasiOperator: boolean('verifikasi_operator'),
    verifikasiSekdes: boolean('verifikasi_sekdes'),
    verifikasiKades: boolean('verifikasi_kades'),
    isiSurat: longtext('isi_surat'),
    kecamatan: boolean('kecamatan').default(false),
    pemohon: varchar('pemohon', { length: 100 }),
    deletedAt: deletedAt(),
  },
  (t) => ({
    idxPend: index('log_surat_config_id_pend_idx').on(t.configId, t.idPend),
    idxStatus: index('log_surat_config_status_idx').on(t.configId, t.status),
  }),
);

/** `permohonan_surat` — status 0..5 (PermohonanSurat::STATUS_PERMOHONAN). */
export const permohonanSurat = mysqlTable(
  'permohonan_surat',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    idPemohon: int('id_pemohon').notNull().references(() => twebPenduduk.id),
    idSurat: int('id_surat').notNull().references(() => twebSuratFormat.id),
    isianForm: json('isian_form'),
    status: tinyint('status').notNull().default(0),
    alasan: text('alasan'),
    keterangan: text('keterangan'),
    noHpAktif: varchar('no_hp_aktif', { length: 20 }),
    syarat: json('syarat'),
    noAntrian: varchar('no_antrian', { length: 20 }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    idxStatus: index('permohonan_surat_config_status_idx').on(t.configId, t.status),
  }),
);

/** `klasifikasi_surat`. */
export const klasifikasiSurat = mysqlTable('klasifikasi_surat', {
  id: int('id').autoincrement().primaryKey(),
  configId: int('config_id').notNull().references(() => config.id),
  kode: varchar('kode', { length: 50 }),
  nama: text('nama'),
  uraian: text('uraian'),
  enabled: boolean('enabled').default(true),
});

/** `lampiran_surat`. */
export const lampiranSurat = mysqlTable('lampiran_surat', {
  id: int('id').autoincrement().primaryKey(),
  configId: int('config_id').notNull().references(() => config.id),
  slug: varchar('slug', { length: 100 }),
  nama: varchar('nama', { length: 100 }),
  jenis: tinyint('jenis').default(2), // 1=Sistem, 2=Desa
  template: longtext('template'),
  templateDesa: longtext('template_desa'),
  status: boolean('status').default(true),
});

/** `surat_masuk`. */
export const suratMasuk = mysqlTable('surat_masuk', {
  id: int('id').autoincrement().primaryKey(),
  configId: int('config_id').notNull().references(() => config.id),
  nomorUrut: smallint('nomor_urut'),
  tanggalPenerimaan: date('tanggal_penerimaan'),
  nomorSurat: varchar('nomor_surat', { length: 100 }),
  kodeSurat: varchar('kode_surat', { length: 20 }),
  tanggalSurat: date('tanggal_surat'),
  pengirim: varchar('pengirim', { length: 150 }),
  isiSingkat: text('isi_singkat'),
  isiDisposisi: text('isi_disposisi'),
  berkasScan: varchar('berkas_scan', { length: 255 }),
  lokasiArsip: varchar('lokasi_arsip', { length: 255 }),
});

/** `surat_keluar`. */
export const suratKeluar = mysqlTable('surat_keluar', {
  id: int('id').autoincrement().primaryKey(),
  configId: int('config_id').notNull().references(() => config.id),
  nomorUrut: smallint('nomor_urut'),
  nomorSurat: varchar('nomor_surat', { length: 100 }),
  kodeSurat: varchar('kode_surat', { length: 20 }),
  tanggalSurat: date('tanggal_surat'),
  tanggalCatat: datetime('tanggal_catat'),
  tujuan: varchar('tujuan', { length: 150 }),
  isiSingkat: text('isi_singkat'),
  berkasScan: varchar('berkas_scan', { length: 255 }),
  ekspedisi: boolean('ekspedisi').default(false),
  tanggalPengiriman: date('tanggal_pengiriman'),
  tandaTerima: varchar('tanda_terima', { length: 100 }),
  keterangan: text('keterangan'),
  lokasiArsip: varchar('lokasi_arsip', { length: 255 }),
});

/* ------------------------------------------------------------------ */
/* 6. Log / peristiwa                                                  */
/* ------------------------------------------------------------------ */

/** `log_penduduk` — kode_peristiwa 1..6 (PeristiwaPendudukEnum). */
export const logPenduduk = mysqlTable(
  'log_penduduk',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    idPend: int('id_pend').notNull().references(() => twebPenduduk.id),
    kodePeristiwa: smallint('kode_peristiwa').notNull(),
    meninggalDi: varchar('meninggal_di', { length: 100 }),
    jamMati: varchar('jam_mati', { length: 10 }),
    sebab: varchar('sebab', { length: 100 }),
    penolongMati: varchar('penolong_mati', { length: 100 }),
    aktaMati: varchar('akta_mati', { length: 50 }),
    alamatTujuan: varchar('alamat_tujuan', { length: 255 }),
    tglLapor: datetime('tgl_lapor'),
    tglPeristiwa: datetime('tgl_peristiwa'),
    catatan: text('catatan'),
    noKk: char('no_kk', { length: 16 }),
    namaKk: varchar('nama_kk', { length: 100 }),
    refPindah: tinyint('ref_pindah'), // 1=Desa,2=Kecamatan,3=Kabupaten,4=Provinsi
    maksudTujuanKedatangan: varchar('maksud_tujuan_kedatangan', { length: 255 }),
    createdAt: createdAt(),
  },
  (t) => ({
    idxPend: index('log_penduduk_config_id_pend_idx').on(t.configId, t.idPend),
  }),
);

/** `log_keluarga` — id_peristiwa 1..6,11..14 (PeristiwaKeluargaEnum). */
export const logKeluarga = mysqlTable(
  'log_keluarga',
  {
    id: int('id').autoincrement().primaryKey(),
    configId: int('config_id').notNull().references(() => config.id),
    idKk: int('id_kk').notNull().references(() => twebKeluarga.id),
    idPeristiwa: smallint('id_peristiwa').notNull(),
    tglPeristiwa: datetime('tgl_peristiwa'),
    idPend: int('id_pend'),
    updatedBy: int('updated_by'),
    idLogPenduduk: int('id_log_penduduk'),
  },
  (t) => ({
    idxKk: index('log_keluarga_config_id_kk_idx').on(t.configId, t.idKk),
  }),
);

/* ------------------------------------------------------------------ */
/* 7. Relasi (opsional, untuk query bertipe)                          */
/* ------------------------------------------------------------------ */

export const configRelations = relations(config, ({ many }) => ({
  users: many(user),
  penduduk: many(twebPenduduk),
  keluarga: many(twebKeluarga),
}));

export const userGrupRelations = relations(userGrup, ({ one, many }) => ({
  config: one(config, { fields: [userGrup.configId], references: [config.id] }),
  users: many(user),
  akses: many(grupAkses),
}));

export const grupAksesRelations = relations(grupAkses, ({ one }) => ({
  grup: one(userGrup, { fields: [grupAkses.idGrup], references: [userGrup.id] }),
  modul: one(settingModul, { fields: [grupAkses.idModul], references: [settingModul.id] }),
}));

export const userRelations = relations(user, ({ one }) => ({
  config: one(config, { fields: [user.configId], references: [config.id] }),
  grup: one(userGrup, { fields: [user.idGrup], references: [userGrup.id] }),
}));

export const keluargaRelations = relations(twebKeluarga, ({ one, many }) => ({
  cluster: one(twebWilClusterdesa, {
    fields: [twebKeluarga.idCluster],
    references: [twebWilClusterdesa.id],
  }),
  anggota: many(twebPenduduk),
}));

export const pendudukRelations = relations(twebPenduduk, ({ one, many }) => ({
  keluarga: one(twebKeluarga, { fields: [twebPenduduk.idKk], references: [twebKeluarga.id] }),
  cluster: one(twebWilClusterdesa, {
    fields: [twebPenduduk.idCluster],
    references: [twebWilClusterdesa.id],
  }),
  logPenduduk: many(logPenduduk),
}));

export const suratFormatRelations = relations(twebSuratFormat, ({ many }) => ({
  arsip: many(logSurat),
}));

export const logSuratRelations = relations(logSurat, ({ one }) => ({
  format: one(twebSuratFormat, {
    fields: [logSurat.idFormatSurat],
    references: [twebSuratFormat.id],
  }),
  penduduk: one(twebPenduduk, { fields: [logSurat.idPend], references: [twebPenduduk.id] }),
  pamong: one(twebDesaPamong, { fields: [logSurat.idPamong], references: [twebDesaPamong.pamongId] }),
}));

export const logPendudukRelations = relations(logPenduduk, ({ one }) => ({
  penduduk: one(twebPenduduk, { fields: [logPenduduk.idPend], references: [twebPenduduk.id] }),
}));

export const logKeluargaRelations = relations(logKeluarga, ({ one }) => ({
  keluarga: one(twebKeluarga, { fields: [logKeluarga.idKk], references: [twebKeluarga.id] }),
}));
