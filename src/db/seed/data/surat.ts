/**
 * Katalog awal persuratan.
 *
 * Badan surat memakai placeholder `[kode]` yang diisi saat surat diterbitkan
 * (lihat `renderSuratTemplate` di domain surat).
 */

export interface KlasifikasiSuratSeed {
  code: string;
  name: string;
}

export interface JenisSuratSeed {
  code: string;
  name: string;
  classificationCode: string;
  templateBody: string;
  requiresResident: boolean;
  isActive: boolean;
  numberFormat: string;
  validityMonths: number;
  sortOrder: number;
  /** Nama master syarat surat yang dipasang pada jenis ini. */
  syaratNames?: readonly string[];
  /** Isian dinamis (JSON) sesuai definisi `IsianField`. */
  formIsian?: readonly IsianSeed[];
}

/** Definisi isian dinamis untuk seed (dipakai sebagai JSON `form_isian`). */
export interface IsianSeed {
  kode: string;
  label: string;
  tipe: "text" | "textarea" | "number" | "date" | "select" | "checkbox";
  required?: boolean;
  opsi?: readonly string[];
}

/** Master kelengkapan berkas surat. */
export interface SyaratSuratSeed {
  name: string;
  description: string;
  sortOrder: number;
}

export const KLASIFIKASI_SURAT_SEEDS: readonly KlasifikasiSuratSeed[] = [
  { code: "S", name: "Surat Keterangan" },
  { code: "SK", name: "Surat Keputusan" },
  { code: "470", name: "Surat Undangan" },
  { code: "005", name: "Nota Dinas" },
  { code: "800", name: "Surat Lainnya" },
];

const KETERANGAN_DASAR = `Yang bertanda tangan di bawah ini Kepala Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], menerangkan bahwa:

Nama              : [nama]
NIK               : [nik]
Tempat/Tgl Lahir  : [tempat_lahir], [tanggal_lahir]
Jenis Kelamin     : [jenis_kelamin]
Agama             : [agama]
Pekerjaan         : [pekerjaan]
Alamat            : [alamat]

Bahwa yang bersangkutan benar-benar warga Desa [nama_desa].

Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`;

const PENGANTAR_DASAR = `Yang bertanda tangan di bawah ini Kepala Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], dengan ini menerangkan bahwa:

Nama              : [nama]
NIK               : [nik]
Tempat/Tgl Lahir  : [tempat_lahir], [tanggal_lahir]
Jenis Kelamin     : [jenis_kelamin]
Agama             : [agama]
Pekerjaan         : [pekerjaan]
Alamat            : [alamat]

Adalah benar warga Desa [nama_desa] dan yang bersangkutan membutuhkan surat pengantar ini untuk keperluan [keperluan].

Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.`;

export const SYARAT_SURAT_SEEDS: readonly SyaratSuratSeed[] = [
  {
    name: "Fotokopi KTP",
    description: "Salinan kartu tanda penduduk pemohon.",
    sortOrder: 1,
  },
  {
    name: "Fotokopi Kartu Keluarga",
    description: "Salinan kartu keluarga pemohon beserta anggota rumah tangannya.",
    sortOrder: 2,
  },
  {
    name: "Surat Pengantar RT/RW",
    description: "Surat pengantar dari Rukun Tetangga atau Rukun Warga setempat.",
    sortOrder: 3,
  },
  {
    name: "Pas Foto 3x4",
    description: "Dua lembar pas foto berwarna ukuran 3x4.",
    sortOrder: 4,
  },
];

export const JENIS_SURAT_SEEDS: readonly JenisSuratSeed[] = [
  {
    code: "S-01",
    name: "Surat Pengantar Umum",
    classificationCode: "S",
    templateBody: PENGANTAR_DASAR,
    requiresResident: true,
    isActive: true,
    numberFormat: "[kode_surat]/[nomor]/[kode_desa]/[tahun]",
    validityMonths: 1,
    sortOrder: 1,
    syaratNames: ["Fotokopi KTP", "Surat Pengantar RT/RW"],
  },
  {
    code: "S-02",
    name: "Surat Keterangan Penduduk",
    classificationCode: "S",
    templateBody: KETERANGAN_DASAR,
    requiresResident: true,
    isActive: true,
    numberFormat: "[kode_surat]/[nomor]/[kode_desa]/[tahun]",
    validityMonths: 1,
    sortOrder: 2,
  },
  {
    code: "S-07",
    name: "Surat Pengantar SKCK",
    classificationCode: "S",
    templateBody: PENGANTAR_DASAR.replace(
      "untuk keperluan [keperluan]",
      "untuk keperluan pengurusan Surat Keterangan Catatan Kepolisian (SKCK)",
    ),
    requiresResident: true,
    isActive: true,
    numberFormat: "[kode_surat]/[nomor]/[kode_desa]/[tahun]",
    validityMonths: 1,
    sortOrder: 3,
  },
  {
    code: "S-11",
    name: "Surat Keterangan Kurang Mampu",
    classificationCode: "S",
    templateBody: `${KETERANGAN_DASAR}\n\nBerdasarkan data yang ada, yang bersangkutan termasuk keluarga kurang mampu dan berhak memperoleh bantuan sosial.`,
    requiresResident: true,
    isActive: true,
    numberFormat: "[kode_surat]/[nomor]/[kode_desa]/[tahun]",
    validityMonths: 1,
    sortOrder: 4,
    syaratNames: ["Fotokopi KTP", "Fotokopi Kartu Keluarga", "Surat Pengantar RT/RW"],
  },
  {
    code: "S-41",
    name: "Surat Keterangan Domisili",
    classificationCode: "S",
    templateBody: `Yang bertanda tangan di bawah ini Kepala Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], menerangkan bahwa:

Nama              : [nama]
NIK               : [nik]
Tempat/Tgl Lahir  : [tempat_lahir], [tanggal_lahir]
Jenis Kelamin     : [jenis_kelamin]
Pekerjaan         : [pekerjaan]
Alamat            : [alamat]

Benar berdomisili di Desa [nama_desa] sampai dengan [berlaku_sampai].

Demikian surat keterangan domisili ini dibuat untuk dipergunakan sebagaimana mestinya.`,
    requiresResident: true,
    isActive: true,
    numberFormat: "[kode_surat]/[nomor]/[kode_desa]/[tahun]",
    validityMonths: 6,
    sortOrder: 5,
  },
  {
    code: "500",
    name: "Surat Keterangan Usaha",
    classificationCode: "S",
    templateBody: `Yang bertanda tangan di bawah ini Kepala Desa [nama_desa], Kecamatan [nama_kecamatan], Kabupaten [nama_kabupaten], menerangkan bahwa:

Nama              : [nama]
NIK               : [nik]
Alamat            : [alamat]

Benar memiliki usaha yang beroperasi di wilayah Desa [nama_desa] dengan nama [nama_usaha], jenis usaha [jenis_usaha], dan modal usaha [modal_usaha], sehingga membutuhkan surat keterangan usaha untuk keperluan [keperluan].

Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.`,
    requiresResident: true,
    isActive: true,
    numberFormat: "[kode_surat]/[nomor]/[kode_desa]/[tahun]",
    validityMonths: 6,
    sortOrder: 6,
    syaratNames: ["Fotokopi KTP", "Surat Pengantar RT/RW"],
    formIsian: [
      { kode: "nama_usaha", label: "Nama Usaha", tipe: "text", required: true },
      {
        kode: "jenis_usaha",
        label: "Jenis Usaha",
        tipe: "select",
        required: true,
        opsi: ["Perdagangan", "Jasa", "Industri", "Pertanian"],
      },
      { kode: "modal_usaha", label: "Modal Usaha (Rp)", tipe: "number" },
    ],
  },
];
