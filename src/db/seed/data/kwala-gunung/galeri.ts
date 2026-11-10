/**
 * Album galeri foto Desa Kwala Gunung.
 * Setiap album memiliki beberapa foto contoh.
 */

export interface GaleriAlbumSeed {
  nama: string;
  slug: string;
  keterangan: string;
  urutan: number;
  /** Gambar sampul relatif storage/media/{villageId}/galeri/... */
  sampulRelatif?: string;
  fotoSeeds: Array<{
    gambar: string;
    judul?: string;
    keterangan?: string;
    urut?: number;
    slider?: boolean;
  }>;
}

export const GALERI_ALBUM_SEEDS: GaleriAlbumSeed[] = [
  {
    nama: "Pembangunan Infrastruktur",
    slug: "pembangunan-infrastruktur",
    keterangan:
      "Dokumentasi proyek pembangunan jalan, jembatan, dan fasilitas umum di Desa Kwala Gunung.",
    urutan: 1,
    sampulRelatif: "pembangunan-jalan-1.svg",
    fotoSeeds: [
      {
        gambar: "/1/galeri/pembangunan-jalan-1.svg",
        judul: "Paving Dusun I Tahap 1",
        keterangan: "Panjang 400 m, lebar 2 m",
      },
      {
        gambar: "/1/galeri/pembangunan-jalan-2.svg",
        judul: "Paving Dusun I Tahap 2",
        keterangan: "Panjang 450 m, lebar 2 m",
      },
    ],
  },
  {
    nama: "Musyawarah Desa",
    slug: "musyawarah-desa",
    keterangan: "Rapat musyawarah perencanaan pembangunan dan penetapan program desa tahunan.",
    urutan: 2,
    fotoSeeds: [
      {
        gambar: "/1/galeri/rapat-pkkm-1.svg",
        judul: "Musdes Penetapan RKPDes 2024",
        keterangan: "Forum diskusi warga Dusun II",
      },
      {
        gambar: "/1/galeri/rapat-pkkm-2.svg",
        judul: "FGD PKKM Kecamatan",
        keterangan: "Koordinasi program bantuan tingkat kecamatan",
      },
    ],
  },
  {
    nama: "Kegiatan Keagamaan",
    slug: "kegiatan-keagamaan",
    keterangan: "Perayaan hari besar Islam dan kegiatan keagamaan masyarakat Kwala Gunung.",
    urutan: 3,
    fotoSeeds: [
      {
        gambar: "/1/galeri/kartun-desa-1.svg",
        judul: "Peringatan Isra Mi'raj",
        keterangan: "Khataman Al-Qur'an massal di masjid Jami'",
      },
      {
        gambar: "/1/galeri/karang-taruna-1.svg",
        judul: "Sahur Bersama Ramadhan",
        keterangan: "Tradisi takjil dan santunan anak yatim",
      },
    ],
  },
  {
    nama: "Kelompok Wanita & Pemuda",
    slug: "kelompok-wanita-pemuda",
    keterangan: "Aktivitas PKK, Karang Taruna, dan kelompok wanita tani di Desa Kwala Gunung.",
    urutan: 4,
    fotoSeeds: [
      {
        gambar: "/1/galeri/kelompok-wanita-1.svg",
        judul: "Senam Sehat PKK Kwala Gunung",
        keterangan: "Latihan rutin setiap Jumat pagi",
      },
      {
        gambar: "/1/galeri/karang-taruna-1.svg",
        judul: "Bakti Sosial Karang Taruna",
        keterangan: "Membersihkan lingkungan pantai sekitar desa",
      },
    ],
  },
];
