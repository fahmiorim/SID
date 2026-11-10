/**
 * Agenda kegiatan publik Desa Kwala Gunung — tayang di halaman beranda.
 */

export interface AgendaSeed {
  judul: string;
  mulai: string;
  selesai: string | null;
  lokasi: string | null;
  deskripsi: string;
  tayang: boolean;
}

export const AGENDA_SEEDS: AgendaSeed[] = [
  {
    judul: "Musyawarah Desa Penetapan Prioritas 2025",
    mulai: "2025-01-15",
    selesai: "2025-01-15",
    lokasi: "Balai Desa Kwala Gunung",
    deskripsi:
      "Rapat musyawarah terbatas bersama BPD, perangkat desa, tokoh agama, dan perwakilan warga untuk menetapkan daftar prioritas pembangunan tahun anggaran 2025.",
    tayang: true,
  },
  {
    judul: "Penyuluhan Gizi Balita & Imunisasi Campak",
    mulai: "2025-01-20",
    selesai: "2025-01-20",
    lokasi: "Posyandu Melati, Dusun I",
    deskripsi:
      "Tim medis Puskesmas Datuk Lima Puluh mengadakan penyuluhan pola gizi seimbang dan imunisasi campak gratis untuk seluruh balita usia 1–5 tahun di wilayah Kwala Gunung.",
    tayang: true,
  },
  {
    judul: "Gotong Royong Membersihkan Saluran Air Dusun II",
    mulai: "2025-02-01",
    selesai: "2025-02-01",
    lokasi: "Dusun II, Kwala Gunung",
    deskripsi:
      "Kegiatan kerja bakti serentak membersihkan gorong-gorong dan saluran irigasi sekunder guna mencegah banjir di musim hujan mendatang.",
    tayang: true,
  },
  {
    judul: "Pelatihan Pengolahan Roti & Kue Kering UMKM",
    mulai: "2025-02-10",
    selesai: "2025-02-12",
    lokasi: "Balai Desa Kwala Gunung",
    deskripsi:
      "Pelatihan tiga hari bagi pelaku UMKM warga untuk meningkatkan kualitas produk olahan roti dan kue kering, dipandu pembisnis sukses dari Medan.",
    tayang: true,
  },
  {
    judul: "Rapat Koordinasi Persiapan HUT RI ke-81",
    mulai: "2025-07-10",
    selesai: "2025-07-10",
    lokasi: "Balai Dusun III",
    deskripsi:
      "Koordinasi panitia HUT Kemerdekaan Republik Indonesia tingkat dusun, membagi seksi pertandingan, dekorasi, dan pentas seni malam puncak.",
    tayang: false,
  },
];
