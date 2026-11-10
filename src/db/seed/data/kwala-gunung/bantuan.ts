/**
 * Program Bantuan Sosial Desa Kwala Gunung — contoh data publik.
 */

export interface BantuanProgramSeed {
  nama: string;
  slug: string;
  sasaran: number; // 1=penduduk, 2=keluarga, 3=rumah-tangga, 4=kelompok
  description: string;
  startDate: string | null;
  endDate: string | null;
  asalDana: number | null; // 1=Pusat, 2=Provinsi, 3=Kabupaten, 4=Desa, 5=Lainnya
}

/**
 * Sasaran bantuan:
 *   1 = penduduk (perorang)
 *   2 = keluarga (KK)
 *   3 = rumah tangga miskin
 *   4 = kelompok / lembaga
 */
export const SASARAN = { PENDUDUK: 1, KELUARGA: 2, RTM: 3, KELOMPOK: 4 };
export const ASAL_DANA = { PUSAT: 1, PROVINSI: 2, KABUPATEN: 3, DESA: 4, LAINNYA: 5 };

export const BANTUAN_SEEDS: BantuanProgramSeed[] = [
  {
    nama: "Bantuan Langsung Tunai (BLT) Dana Desa",
    slug: "blt-dana-desa",
    sasaran: SASARAN.KELUARGA,
    description:
      "Bantuan tunai bulanan kepada Keluarga Miskin (KM) terdata dalam DTKS Kabupaten Batu Bara untuk memenuhi kebutuhan pokok.",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    asalDana: ASAL_DANA.DESA,
  },
  {
    nama: "PKH — Program Keluarga Harapan",
    slug: "pkh-keluarga-harapan",
    sasaran: SASARAN.KELUARGA,
    description:
      "Bantuan bersyarat bagi keluarga miskin yang wajib mematuhi syarat kesehatan dan pendidikan anak.",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    asalDana: ASAL_DANA.PUSAT,
  },
  {
    nama: "Bantuan Sekolah (BSH)",
    slug: "bantuan-sekolah",
    sasaran: SASARAN.PENDUDUK,
    description:
      "Bantuan pendidikan bagi siswa kurang mampu jenjang SD–SMA/SMK di wilayah Desa Kwala Gunung.",
    startDate: "2024-07-01",
    endDate: "2025-06-30",
    asalDana: ASAL_DANA.KABUPATEN,
  },
  {
    nama: "Program Raskin / BPNT Bulanan",
    slug: "bpnt-raskin",
    sasaran: SASARAN.KELUARGA,
    description:
      "Penyaluran subsidi beras melalui kartu sembako bagi keluarga penerima manfaat (KPM) yang terdaftar.",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    asalDana: ASAL_DANA.PUSAT,
  },
  {
    nama: "Bantuan Kelompok Usaha Wanita",
    slug: "bantuan-umkm-wanita",
    sasaran: SASARAN.KELOMPOK,
    description:
      "Modal usaha produktif dan pelatihan bagi kelompok wanita tani serta UMKM Ibu Rumah Tangga.",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    asalDana: ASAL_DANA.DESA,
  },
  {
    nama: "Bantuan Kesehatan Ibu Hamil & Bersalin",
    slug: "bantuan-kinban",
    sasaran: SASARAN.PENDUDUK,
    description:
      "Bantuan biaya persalinan dan pemeriksaan kehamilan bagi ibu hamil kurang mampu di Puskesmas Kecamatan Datuk Lima Puluh.",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    asalDana: ASAL_DANA.KABUPATEN,
  },
];
