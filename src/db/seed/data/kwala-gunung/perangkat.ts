/**
 * Perangkat desa (aparatur) Desa Kwala Gunung — data contoh yang bisa diubah via panel admin.
 */

export interface PerangkatSeed {
  jabatanSlug: string;
  nama: string;
  nip?: string | null;
  jenisKelamin?: "male" | "female";
  tempatLahir?: string;
  tanggalLahir?: string;
  status: "aktif";
  urut: number;
  /** Foto profil relatif storage/media/{villageId}/perangkat/... */
  foto?: string;
}

export const PERANGKAT_SEEDS: PerangkatSeed[] = [
  {
    jabatanSlug: "kepala-desa",
    nama: "H. Syahril, S.E.",
    nip: null,
    jenisKelamin: "male",
    tempatLahir: "Deli Serdang",
    tanggalLahir: "1978-05-12",
    status: "aktif",
    urut: 1,
    foto: "/1/perangkat/kepala-desa.svg",
  },
  {
    jabatanSlug: "sekretaris-desa",
    nama: "Rizky Efendi, S.E., M.M.",
    nip: "198507152010011005",
    jenisKelamin: "male",
    tempatLahir: "Medan",
    tanggalLahir: "1985-07-15",
    status: "aktif",
    urut: 2,
    foto: "/1/perangkat/sekretaris-desa.svg",
  },
  {
    jabatanSlug: "kaur-tata-usaha-umum",
    nama: "Nuraini, S.A.Kab.",
    nip: "199003222015032003",
    jenisKelamin: "female",
    tempatLahir: "Batu Bara",
    tanggalLahir: "1990-03-22",
    status: "aktif",
    urut: 3,
    foto: "/1/perangkat/kaur-tata-usaha.svg",
  },
  {
    jabatanSlug: "kaur-keuangan",
    nama: "Mulyadi, S.E.",
    nip: "198812102012011007",
    jenisKelamin: "male",
    tempatLahir: "Padang",
    tanggalLahir: "1988-12-10",
    status: "aktif",
    urut: 4,
    foto: "/1/perangkat/kaur-keuangan.svg",
  },
  {
    jabatanSlug: "kaur-perencanaan",
    nama: "Febrianti, S.IP.",
    nip: "199201182016032002",
    jenisKelamin: "female",
    tempatLahir: "Sibolga",
    tanggalLahir: "1992-01-18",
    status: "aktif",
    urut: 5,
    foto: "/1/perangkat/kaur-perencanaan.svg",
  },
  {
    jabatanSlug: "kasi-pemerintahan",
    nama: "Andi Pohan, S.Sos.",
    nip: null,
    jenisKelamin: "male",
    tempatLahir: "Batubara",
    tanggalLahir: "1987-09-03",
    status: "aktif",
    urut: 6,
    foto: "/1/perangkat/kasi-pemerintahan.svg",
  },
  {
    jabatanSlug: "kasi-kesejahteraan",
    nama: "Hj. Ratna Sari, S.Pd.",
    nip: "198306152011012004",
    jenisKelamin: "female",
    tempatLahir: "Langkat",
    tanggalLahir: "1983-06-15",
    status: "aktif",
    urut: 7,
    foto: "/1/perangkat/kasi-kesejahteraan.svg",
  },
  {
    jabatanSlug: "kasi-pelayanan",
    nama: "Saiful Bahri, A.Md.",
    nip: null,
    jenisKelamin: "male",
    tempatLahir: "Batu Bara",
    tanggalLahir: "1995-11-20",
    status: "aktif",
    urut: 8,
    foto: "/1/perangkat/kasi-pelayanan.svg",
  },
  {
    jabatanSlug: "kepala-dusun",
    nama: "Irwan Sembiring",
    nip: null,
    jenisKelamin: "male",
    tempatLahir: "Batu Bara",
    tanggalLahir: "1975-04-08",
    status: "aktif",
    urut: 9,
    foto: undefined,
  },
];
