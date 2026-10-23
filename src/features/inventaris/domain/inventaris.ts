import { z } from "zod";

export const INVENTARIS_KATEGORI = [
  "tanah",
  "gedung_bangunan",
  "jalan_irigasi_jaringan",
  "peralatan_mesin",
  "aset_lainnya",
  "konstruksi_dalam_pengerjaan",
] as const;
export type InventarisKategoriGolongan = (typeof INVENTARIS_KATEGORI)[number];

export const INVENTARIS_ASAL = [
  "pembelian",
  "hibah",
  "bantuan_pemerintah",
  "sumbangan",
  "lainnya",
] as const;
export type InventarisAsal = (typeof INVENTARIS_ASAL)[number];

export const INVENTARIS_KONDISI = ["baik", "rusak_ringan", "rusak_berat"] as const;
export type InventarisKondisi = (typeof INVENTARIS_KONDISI)[number];

export const MUTASI_JENIS = ["pindah", "rusak", "hapus", "perbaikan"] as const;
export type MutasiJenis = (typeof MUTASI_JENIS)[number];

export const MUTASI_STATUS = ["diajukan", "disetujui", "ditolak"] as const;
export type MutasiStatus = (typeof MUTASI_STATUS)[number];

export const MUTASI_STATUS_LABELS: Record<MutasiStatus, string> = {
  diajukan: "Menunggu Persetujuan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

export const INVENTARIS_KATEGORI_LABELS: Record<InventarisKategoriGolongan, string> = {
  tanah: "Tanah",
  gedung_bangunan: "Gedung & Bangunan",
  jalan_irigasi_jaringan: "Jalan, Irigasi & Jaringan",
  peralatan_mesin: "Peralatan & Mesin",
  aset_lainnya: "Aset Tetap Lainnya",
  konstruksi_dalam_pengerjaan: "Konstruksi Dalam Pengerjaan",
};

export const INVENTARIS_KONDISI_LABELS: Record<InventarisKondisi, string> = {
  baik: "Baik",
  rusak_ringan: "Rusak Ringan",
  rusak_berat: "Rusak Berat",
};

export const MUTASI_JENIS_LABELS: Record<MutasiJenis, string> = {
  pindah: "Pindah Lokasi",
  rusak: "Rusak",
  hapus: "Hapus",
  perbaikan: "Perbaikan",
};

export const inventarisKategoriFormSchema = z.object({
  kode: z.string().trim().min(1, "Kode wajib diisi").max(20),
  nama: z.string().trim().min(1, "Nama wajib diisi").max(150),
  golongan: z.enum(INVENTARIS_KATEGORI),
  keterangan: z.string().trim().max(500).optional().or(z.literal("")),
});

export type InventarisKategoriInput = z.infer<typeof inventarisKategoriFormSchema>;

export const inventarisFormSchema = z.object({
  kategoriId: z.coerce.number().int().min(1).optional().or(z.literal("")),
  nomorInventaris: z.string().trim().max(50).optional().or(z.literal("")),
  namaBarang: z.string().trim().min(1, "Nama barang wajib diisi").max(200),
  kodeBarang: z.string().trim().max(50).optional().or(z.literal("")),
  merk: z.string().trim().max(100).optional().or(z.literal("")),
  tipe: z.string().trim().max(100).optional().or(z.literal("")),
  spesifikasi: z.string().trim().max(2000).optional().or(z.literal("")),
  jumlah: z.coerce.number().min(0.01).max(999999).default(1),
  satuan: z.string().trim().max(20).default("buah"),
  hargaSatuan: z.coerce.number().min(0).max(999999999999).optional(),
  tahunPembelian: z.coerce.number().int().min(1900).max(2100).optional(),
  tanggalPembelian: z.iso.date().optional().or(z.literal("")),
  asal: z.enum(INVENTARIS_ASAL).optional(),
  donatur: z.string().trim().max(150).optional().or(z.literal("")),
  kondisi: z.enum(INVENTARIS_KONDISI).default("baik"),
  lokasi: z.string().trim().max(150).optional().or(z.literal("")),
  keterangan: z.string().trim().max(500).optional().or(z.literal("")),
});

export type InventarisInput = z.infer<typeof inventarisFormSchema>;

export const inventarisMutasiFormSchema = z.object({
  inventarisId: z.coerce.number().int().min(1),
  jenis: z.enum(MUTASI_JENIS),
  tanggalMutasi: z.iso.date(),
  lokasiBaru: z.string().trim().max(150).optional().or(z.literal("")),
  kondisiBaru: z.enum(INVENTARIS_KONDISI).optional(),
  jumlahMutasi: z.coerce.number().min(0.01).max(999999).default(1),
  alasan: z.string().trim().min(1, "Alasan wajib diisi").max(500),
  keterangan: z.string().trim().max(500).optional().or(z.literal("")),
});

export type InventarisMutasiInput = z.infer<typeof inventarisMutasiFormSchema>;

/** Baris daftar mutasi yang ditampilkan di halaman admin. */
export interface MutasiRow {
  id: number;
  inventarisId: number;
  jenis: MutasiJenis;
  status: MutasiStatus;
  tanggalMutasi: string;
  lokasiBaru: string | null;
  kondisiBaru: InventarisKondisi | null;
  jumlahMutasi: string | null;
  alasan: string | null;
  namaBarang: string | null;
  nomorInventaris: string | null;
}

/** Pilihan barang untuk formulir pengajuan mutasi. */
export interface InventarisOption {
  id: number;
  namaBarang: string;
  nomorInventaris: string | null;
  jumlah: string;
  satuan: string | null;
}
