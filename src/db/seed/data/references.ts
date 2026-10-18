/**
 * Katalog referensi kependudukan.
 *
 * Isi katalog mengikuti kode baku nasional; `id` dipertahankan agar stabil dan
 * sama di setiap lingkungan. Label ditulis apa adanya (huruf besar) sesuai
 * sumber resmi.
 */

export interface ReferenceSeed {
  id: number;
  name: string;
}

export const RELIGION_SEEDS: readonly ReferenceSeed[] = [
  { id: 1, name: "ISLAM" },
  { id: 2, name: "KRISTEN" },
  { id: 3, name: "KATHOLIK" },
  { id: 4, name: "HINDU" },
  { id: 5, name: "BUDHA" },
  { id: 6, name: "KHONGHUCU" },
  { id: 7, name: "Kepercayaan Terhadap Tuhan YME / Lainnya" },
];

/** Jenjang pendidikan terakhir yang ditamatkan. */
export const EDUCATION_SEEDS: readonly ReferenceSeed[] = [
  { id: 1, name: "TIDAK/BELUM SEKOLAH" },
  { id: 2, name: "BELUM TAMAT SD/SEDERAJAT" },
  { id: 3, name: "TAMAT SD/SEDERAJAT" },
  { id: 4, name: "SLTP/SEDERAJAT" },
  { id: 5, name: "SLTA/SEDERAJAT" },
  { id: 6, name: "DIPLOMA I/II" },
  { id: 7, name: "AKADEMI/DIPLOMA III/S. MUDA" },
  { id: 8, name: "DIPLOMA IV/STRATA I" },
  { id: 9, name: "STRATA II" },
  { id: 10, name: "STRATA III" },
];

export const OCCUPATION_SEEDS: readonly ReferenceSeed[] = [
  { id: 1, name: "BELUM/TIDAK BEKERJA" },
  { id: 2, name: "MENGURUS RUMAH TANGGA" },
  { id: 3, name: "PELAJAR/MAHASISWA" },
  { id: 4, name: "PENSIUNAN" },
  { id: 5, name: "PEGAWAI NEGERI SIPIL (PNS)" },
  { id: 6, name: "TENTARA NASIONAL INDONESIA (TNI)" },
  { id: 7, name: "KEPOLISIAN RI (POLRI)" },
  { id: 8, name: "PERDAGANGAN" },
  { id: 9, name: "PETANI/PEKEBUN" },
  { id: 10, name: "PETERNAK" },
  { id: 11, name: "NELAYAN/PERIKANAN" },
  { id: 12, name: "INDUSTRI" },
  { id: 13, name: "KONSTRUKSI" },
  { id: 14, name: "TRANSPORTASI" },
  { id: 15, name: "KARYAWAN SWASTA" },
  { id: 16, name: "KARYAWAN BUMN" },
  { id: 17, name: "KARYAWAN BUMD" },
  { id: 18, name: "KARYAWAN HONORER" },
  { id: 19, name: "BURUH HARIAN LEPAS" },
  { id: 20, name: "BURUH TANI/PERKEBUNAN" },
  { id: 21, name: "BURUH NELAYAN/PERIKANAN" },
  { id: 22, name: "BURUH PETERNAKAN" },
  { id: 23, name: "PEMBANTU RUMAH TANGGA" },
  { id: 24, name: "TUKANG CUKUR" },
  { id: 25, name: "TUKANG LISTRIK" },
  { id: 26, name: "TUKANG BATU" },
  { id: 27, name: "TUKANG KAYU" },
  { id: 28, name: "TUKANG SOL SEPATU" },
  { id: 29, name: "TUKANG LAS/PANDAI BESI" },
  { id: 30, name: "TUKANG JAHIT" },
  { id: 31, name: "TUKANG GIGI" },
  { id: 32, name: "PENATA RIAS" },
  { id: 33, name: "PENATA BUSANA" },
  { id: 34, name: "PENATA RAMBUT" },
  { id: 35, name: "MEKANIK" },
  { id: 36, name: "SENIMAN" },
  { id: 37, name: "TABIB" },
  { id: 38, name: "PARAJI" },
  { id: 39, name: "PERANCANG BUSANA" },
  { id: 40, name: "PENTERJEMAH" },
  { id: 41, name: "IMAM MASJID" },
  { id: 42, name: "PENDETA" },
  { id: 43, name: "PASTOR" },
  { id: 44, name: "WARTAWAN" },
  { id: 45, name: "USTADZ/MUBALIGH" },
  { id: 46, name: "JURU MASAK" },
  { id: 47, name: "PROMOTOR ACARA" },
  { id: 48, name: "ANGGOTA DPR-RI" },
  { id: 49, name: "ANGGOTA DPD" },
  { id: 50, name: "ANGGOTA BPK" },
  { id: 51, name: "PRESIDEN" },
  { id: 52, name: "WAKIL PRESIDEN" },
  { id: 53, name: "ANGGOTA MAHKAMAH KONSTITUSI" },
  { id: 54, name: "ANGGOTA KABINET KEMENTERIAN" },
  { id: 55, name: "DUTA BESAR" },
  { id: 56, name: "GUBERNUR" },
  { id: 57, name: "WAKIL GUBERNUR" },
  { id: 58, name: "BUPATI" },
  { id: 59, name: "WAKIL BUPATI" },
  { id: 60, name: "WALIKOTA" },
  { id: 61, name: "WAKIL WALIKOTA" },
  { id: 62, name: "ANGGOTA DPRD PROVINSI" },
  { id: 63, name: "ANGGOTA DPRD KABUPATEN/KOTA" },
  { id: 64, name: "DOSEN" },
  { id: 65, name: "GURU" },
  { id: 66, name: "PILOT" },
  { id: 67, name: "PENGACARA" },
  { id: 68, name: "NOTARIS" },
  { id: 69, name: "ARSITEK" },
  { id: 70, name: "AKUNTAN" },
  { id: 71, name: "KONSULTAN" },
  { id: 72, name: "DOKTER" },
  { id: 73, name: "BIDAN" },
  { id: 74, name: "PERAWAT" },
  { id: 75, name: "APOTEKER" },
  { id: 76, name: "PSIKIATER/PSIKOLOG" },
  { id: 77, name: "PENYIAR TELEVISI" },
  { id: 78, name: "PENYIAR RADIO" },
  { id: 79, name: "PELAUT" },
  { id: 80, name: "PENELITI" },
  { id: 81, name: "SOPIR" },
  { id: 82, name: "PIALANG" },
  { id: 83, name: "PARANORMAL" },
  { id: 84, name: "PEDAGANG" },
  { id: 85, name: "PERANGKAT DESA" },
  { id: 86, name: "KEPALA DESA" },
  { id: 87, name: "BIARAWATI" },
  { id: 88, name: "WIRASWASTA" },
  { id: 89, name: "LAINNYA" },
];

export const MARITAL_STATUS_SEEDS: readonly ReferenceSeed[] = [
  { id: 1, name: "BELUM KAWIN" },
  { id: 2, name: "KAWIN" },
  { id: 3, name: "CERAI HIDUP" },
  { id: 4, name: "CERAI MATI" },
];

/** Status hubungan dalam keluarga (SHDK). */
export const FAMILY_RELATION_SEEDS: readonly ReferenceSeed[] = [
  { id: 1, name: "KEPALA KELUARGA" },
  { id: 2, name: "SUAMI" },
  { id: 3, name: "ISTRI" },
  { id: 4, name: "ANAK" },
  { id: 5, name: "MENANTU" },
  { id: 6, name: "CUCU" },
  { id: 7, name: "ORANGTUA" },
  { id: 8, name: "MERTUA" },
  { id: 9, name: "FAMILI LAIN" },
  { id: 10, name: "PEMBANTU" },
  { id: 11, name: "LAINNYA" },
];

export const BLOOD_TYPE_SEEDS: readonly ReferenceSeed[] = [
  { id: 1, name: "A" },
  { id: 2, name: "B" },
  { id: 3, name: "AB" },
  { id: 4, name: "O" },
  { id: 5, name: "A+" },
  { id: 6, name: "A-" },
  { id: 7, name: "B+" },
  { id: 8, name: "B-" },
  { id: 9, name: "AB+" },
  { id: 10, name: "AB-" },
  { id: 11, name: "O+" },
  { id: 12, name: "O-" },
  { id: 13, name: "TIDAK TAHU" },
];

export const CITIZENSHIP_SEEDS: readonly ReferenceSeed[] = [
  { id: 1, name: "WNI" },
  { id: 2, name: "WNA" },
  { id: 3, name: "DUA KEWARGANEGARAAN" },
];
