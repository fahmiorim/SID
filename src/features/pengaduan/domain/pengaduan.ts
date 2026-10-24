import { z } from "zod";

import { optionalDigits } from "@/lib/forms";

/**
 * Domain pengaduan warga (Fase 3D).
 *
 * Berkas ini murni (tanpa I/O) sehingga aturan kategori, status, penomoran
 * tiket, dan penyamaran identitas dapat diuji tanpa basis data.
 */

/** Kategori pengaduan beserta label tampilannya. */
export const KATEGORI_PENGADUAN = [
  { value: "umum", label: "Umum" },
  { value: "infrastruktur", label: "Infrastruktur" },
  { value: "pelayanan", label: "Pelayanan Administrasi" },
  { value: "kebersihan", label: "Kebersihan & Lingkungan" },
  { value: "keamanan", label: "Keamanan & Ketertiban" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export type KategoriPengaduan = (typeof KATEGORI_PENGADUAN)[number]["value"];

const KATEGORI_VALUES = KATEGORI_PENGADUAN.map((item) => item.value) as [
  KategoriPengaduan,
  ...KategoriPengaduan[],
];

/** Nilai kategori dari DB yang tak dikenal jatuh ke `umum`. */
export function normalizeKategori(value: string | null | undefined): KategoriPengaduan {
  return KATEGORI_VALUES.includes(value as KategoriPengaduan)
    ? (value as KategoriPengaduan)
    : "umum";
}

export function labelKategori(value: string | null | undefined): string {
  const kategori = normalizeKategori(value);
  return KATEGORI_PENGADUAN.find((item) => item.value === kategori)?.label ?? "Umum";
}

/** Status penanganan pengaduan. */
export const STATUS_PENGADUAN = [
  { value: "baru", label: "Baru" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
  { value: "ditolak", label: "Ditolak" },
] as const;

export type StatusPengaduan = (typeof STATUS_PENGADUAN)[number]["value"];

const STATUS_VALUES = STATUS_PENGADUAN.map((item) => item.value) as [
  StatusPengaduan,
  ...StatusPengaduan[],
];

export function normalizeStatus(value: string | null | undefined): StatusPengaduan {
  return STATUS_VALUES.includes(value as StatusPengaduan) ? (value as StatusPengaduan) : "baru";
}

export function labelStatus(value: string | null | undefined): string {
  const status = normalizeStatus(value);
  return STATUS_PENGADUAN.find((item) => item.value === status)?.label ?? "Baru";
}

export const JUDUL_MAX = 200;
export const ISI_MAX = 4000;
export const NAMA_MAX = 100;
export const ALAMAT_MAX = 255;
export const TELEPON_MAX = 30;
export const EMAIL_MAX = 100;
export const TANGGAPAN_MAX = 4000;

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POLA_TELEPON = /^[0-9+\-\s()]{6,30}$/;

/**
 * Formulir pengaduan dari warga (publik maupun layanan mandiri).
 *
 * Nomor tiket tidak diisi pengguna: dibuat server saat menyimpan agar tidak
 * dapat dipalsukan atau bentrok.
 */
export const pengaduanFormSchema = z.object({
  kategori: z.enum(KATEGORI_VALUES),
  judul: z.string().trim().min(5, "Judul minimal 5 karakter.").max(JUDUL_MAX),
  isi: z.string().trim().min(20, "Uraikan pengaduan minimal 20 karakter.").max(ISI_MAX),
  namaPelapor: z.string().trim().min(1, "Nama wajib diisi.").max(NAMA_MAX),
  nik: optionalDigits(16),
  telepon: z
    .string()
    .trim()
    .max(TELEPON_MAX)
    .refine((value) => value === "" || POLA_TELEPON.test(value), "Nomor telepon tidak valid.")
    .transform((value) => (value === "" ? null : value)),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX)
    .refine((value) => value === "" || POLA_EMAIL.test(value), "Alamat email tidak valid.")
    .transform((value) => (value === "" ? null : value)),
  alamat: z
    .string()
    .trim()
    .max(ALAMAT_MAX)
    .transform((value) => (value === "" ? null : value)),
});

export type PengaduanInput = z.infer<typeof pengaduanFormSchema>;

/** Formulir tanggapan/penanganan oleh petugas desa. */
export const tanggapanFormSchema = z
  .object({
    status: z.enum(STATUS_VALUES),
    tanggapan: z
      .string()
      .trim()
      .max(TANGGAPAN_MAX)
      .transform((value) => (value === "" ? null : value)),
    publik: z.boolean(),
  })
  .superRefine((value, ctx) => {
    // Pengaduan yang ditandai selesai/ditolak wajib punya penjelasan agar warga
    // tahu alasan keputusannya.
    if ((value.status === "selesai" || value.status === "ditolak") && !value.tanggapan) {
      ctx.addIssue({
        code: "custom",
        path: ["tanggapan"],
        message: "Tanggapan wajib diisi saat status selesai atau ditolak.",
      });
    }
  });

export type TanggapanInput = z.infer<typeof tanggapanFormSchema>;

/** Baris pengaduan untuk daftar admin. */
export interface PengaduanRow {
  id: number;
  nomorTiket: string;
  kategori: KategoriPengaduan;
  judul: string;
  isi: string;
  namaPelapor: string;
  nik: string | null;
  telepon: string | null;
  email: string | null;
  alamat: string | null;
  lampiran: string | null;
  status: StatusPengaduan;
  tanggapan: string | null;
  petugasNama: string | null;
  ditanggapiPada: Date | null;
  publik: boolean;
  createdAt: Date | null;
}

/** Pengaduan yang sudah disamarkan untuk halaman publik. */
export interface PengaduanPublikRow {
  id: number;
  nomorTiket: string;
  kategori: KategoriPengaduan;
  judul: string;
  isi: string;
  namaPelapor: string;
  status: StatusPengaduan;
  tanggapan: string | null;
  ditanggapiPada: Date | null;
  createdAt: Date | null;
}

/**
 * Prefiks nomor tiket untuk satu tanggal, mis. `PGD-20261024-`.
 *
 * Memakai tanggal lokal (bukan UTC) agar tiket yang dibuat pagi hari di WIB
 * tidak bertanggal kemarin.
 */
export function prefiksNomorTiket(tanggal: Date): string {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return `PGD-${tahun}${bulan}${hari}-`;
}

/**
 * Nomor tiket pengaduan, mis. `PGD-20261024-0007`.
 *
 * `urutan` adalah nomor urut pengaduan pada hari tersebut (1-based).
 */
export function formatNomorTiket(tanggal: Date, urutan: number): string {
  const nomor = String(Math.max(1, Math.trunc(urutan))).padStart(4, "0");
  return `${prefiksNomorTiket(tanggal)}${nomor}`;
}

/**
 * Samarkan identitas pelapor untuk halaman publik.
 *
 * Nama tetap dikenali pemiliknya tetapi tidak menyebut nama keluarga:
 * `"Budi Santoso"` → `"Budi S."`. Nama satu kata ditampilkan utuh.
 */
export function samarkanNama(nama: string): string {
  const bagian = nama.trim().split(/\s+/).filter(Boolean);
  if (bagian.length === 0) return "Warga";
  if (bagian.length === 1) return bagian[0] ?? "Warga";

  const depan = bagian[0] ?? "Warga";
  const inisial = bagian
    .slice(1)
    .map((item) => `${item.charAt(0).toUpperCase()}.`)
    .join(" ");
  return `${depan} ${inisial}`;
}

/** Ringkasan jumlah pengaduan per status untuk kartu statistik admin. */
export interface StatistikPengaduan {
  total: number;
  baru: number;
  diproses: number;
  selesai: number;
  ditolak: number;
  publik: number;
}

export function hitungStatistikPengaduan(
  rows: readonly Pick<PengaduanRow, "status" | "publik">[],
): StatistikPengaduan {
  const hasil: StatistikPengaduan = {
    total: rows.length,
    baru: 0,
    diproses: 0,
    selesai: 0,
    ditolak: 0,
    publik: 0,
  };

  for (const row of rows) {
    hasil[normalizeStatus(row.status)] += 1;
    if (row.publik) hasil.publik += 1;
  }

  return hasil;
}
