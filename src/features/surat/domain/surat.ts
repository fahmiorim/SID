import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";
import { optionalIsoDate, optionalSelectId, optionalText } from "@/lib/forms";

export const SURAT_RESOURCE = RESOURCES.surat;
export const JENIS_SURAT_RESOURCE = RESOURCES.jenisSurat;
export const KLASIFIKASI_SURAT_RESOURCE = RESOURCES.klasifikasiSurat;
export const SURAT_MASUK_RESOURCE = RESOURCES.suratMasuk;
export const SURAT_KELUAR_RESOURCE = RESOURCES.suratKeluar;

// --- Status surat ----------------------------------------------------------

export const LETTER_STATUSES = ["draft", "issued", "cancelled"] as const;
export type LetterStatus = (typeof LETTER_STATUSES)[number];

export const LETTER_STATUS_LABELS: Readonly<Record<LetterStatus, string>> = {
  draft: "Konsep",
  issued: "Terbit",
  cancelled: "Dibatalkan",
};

// --- Placeholder -----------------------------------------------------------

export const SURAT_PLACEHOLDERS = [
  { key: "nama_desa", label: "Nama desa" },
  { key: "kode_desa", label: "Kode desa" },
  { key: "nama_kecamatan", label: "Nama kecamatan" },
  { key: "nama_kabupaten", label: "Nama kabupaten/kota" },
  { key: "nama_propinsi", label: "Nama provinsi" },
  { key: "alamat_kantor", label: "Alamat kantor desa" },
  { key: "telepon_desa", label: "Telepon desa" },
  { key: "email_desa", label: "Email desa" },
  { key: "nama", label: "Nama penduduk" },
  { key: "nik", label: "NIK penduduk" },
  { key: "tempat_lahir", label: "Tempat lahir" },
  { key: "tanggal_lahir", label: "Tanggal lahir" },
  { key: "jenis_kelamin", label: "Jenis kelamin" },
  { key: "agama", label: "Agama" },
  { key: "pekerjaan", label: "Pekerjaan" },
  { key: "alamat", label: "Alamat penduduk" },
  { key: "no_kk", label: "Nomor Kartu Keluarga" },
  { key: "nomor_surat", label: "Nomor surat (otomatis)" },
  { key: "tanggal_surat", label: "Tanggal surat" },
  { key: "keperluan", label: "Keperluan" },
  { key: "berlaku_sampai", label: "Berlaku sampai" },
] as const;

const BULAN_INDONESIA = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const BULAN_ROMAWI = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
] as const;

/** Tanggal ISO (`YYYY-MM-DD`) → "5 Oktober 2026"; nilai kosong → "-". */
export function formatTanggalIndonesia(value: string | null | undefined): string {
  if (!value) return "-";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const monthName = BULAN_INDONESIA[month - 1];

  return monthName ? `${day} ${monthName} ${year}` : value;
}

/** Bulan (1-12) → angka Romawi untuk format nomor surat. */
export function bulanRomawi(month: number): string {
  return BULAN_ROMAWI[month - 1] ?? "";
}

export const DEFAULT_NUMBER_FORMAT = "[kode_surat]/[nomor]/[kode_desa]/[tahun]";

export interface NumberContext {
  sequence: number;
  kodeSurat: string;
  kodeDesa: string;
  year: number;
  month: number;
}

/**
 * Isi format penomoran surat.
 *
 * Mendukung `[nomor]` (otomatis 3 digit), `[nomor, N]` (N digit),
 * `[kode_surat]`, `[kode_desa]`, `[tahun]`, dan `[bulan_romawi]`.
 */
export function buildSuratNumber(format: string, context: NumberContext): string {
  const padded = (digits: number) => String(context.sequence).padStart(digits, "0");

  const withNumber = format.replace(/\[nomor(?:\s*,\s*(\d+))?\]/gi, (_match, digits?: string) =>
    padded(digits ? Number(digits) : 3),
  );

  const values: Record<string, string> = {
    kode_surat: context.kodeSurat,
    kode_desa: context.kodeDesa,
    tahun: String(context.year),
    bulan_romawi: bulanRomawi(context.month),
  };

  return withNumber.replace(/\[([a-z_]+)\]/gi, (match, key: string) => {
    return values[key.toLowerCase()] ?? match;
  });
}

/** Ganti seluruh placeholder `[kode]` (tidak peka huruf besar/kecil). */
export function renderSuratTemplate(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  const normalized = new Map<string, string>();
  for (const [key, value] of Object.entries(values)) {
    normalized.set(key.toLowerCase(), value);
  }

  return template.replace(/\[([a-zA-Z0-9_]+)\]/g, (match, key: string) => {
    return normalized.get(key.toLowerCase()) ?? match;
  });
}

/**
 * Tambah bulan ke tanggal ISO (dipakai untuk masa berlaku surat).
 *
 * Hari dijepit ke hari terakhir bulan tujuan agar 31 Januari + 1 bulan menjadi
 * 28/29 Februari, bukan meluber ke awal Maret.
 */
export function addMonthsIso(value: string, months: number): string {
  if (months <= 0) return value;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const targetIndex = monthIndex + months;
  const targetYear = year + Math.floor(targetIndex / 12);
  const targetMonth = ((targetIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();

  return `${String(targetYear).padStart(4, "0")}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

// --- Skema formulir --------------------------------------------------------

const codeField = z.string().trim().min(1, "Kode wajib diisi.").max(20, "Maksimal 20 karakter.");

const nameField = (label: string) =>
  z.string().trim().min(1, `${label} wajib diisi.`).max(150, "Maksimal 150 karakter.");

const selectedId = (message: string) =>
  z
    .string()
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, message)
    .transform((value) => Number(value));

export const klasifikasiSuratFormSchema = z.object({
  code: codeField,
  name: nameField("Nama klasifikasi"),
});
export type KlasifikasiSuratInput = z.infer<typeof klasifikasiSuratFormSchema>;

export const jenisSuratFormSchema = z.object({
  code: codeField,
  name: nameField("Nama jenis surat"),
  classificationId: optionalSelectId,
  templateBody: z
    .string()
    .trim()
    .min(1, "Badan surat wajib diisi.")
    .max(20000, "Maksimal 20.000 karakter."),
  requiresResident: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  numberFormat: z
    .string()
    .trim()
    .max(100, "Maksimal 100 karakter.")
    .optional()
    .default(DEFAULT_NUMBER_FORMAT)
    .transform((value) => (value === "" ? DEFAULT_NUMBER_FORMAT : value)),
  validityMonths: z.coerce
    .number()
    .int("Masa berlaku harus bilangan bulat.")
    .min(0, "Minimal 0.")
    .max(120, "Maksimal 120 bulan.")
    .optional()
    .default(1),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
});
export type JenisSuratInput = z.infer<typeof jenisSuratFormSchema>;

export const suratFormSchema = z.object({
  typeId: selectedId("Jenis surat wajib dipilih."),
  residentId: optionalSelectId,
  letterDate: z.iso.date("Tanggal surat tidak valid."),
  purpose: optionalText(255),
});
export type SuratInput = z.infer<typeof suratFormSchema>;

export const suratMasukFormSchema = z.object({
  agendaNumber: z.coerce.number().int().min(0, "Minimal 0.").max(99999).optional().default(0),
  receivedDate: z.iso.date("Tanggal penerimaan tidak valid."),
  letterNumber: optionalText(50),
  letterDate: optionalIsoDate,
  sender: optionalText(150),
  classificationId: optionalSelectId,
  summary: optionalText(255),
  disposition: optionalText(255),
  archiveLocation: optionalText(150),
});
export type SuratMasukInput = z.infer<typeof suratMasukFormSchema>;

export const suratKeluarFormSchema = z.object({
  agendaNumber: z.coerce.number().int().min(0, "Minimal 0.").max(99999).optional().default(0),
  letterNumber: optionalText(50),
  letterDate: z.iso.date("Tanggal surat tidak valid."),
  recipient: optionalText(150),
  classificationId: optionalSelectId,
  summary: optionalText(255),
  sentDate: optionalIsoDate,
  archiveLocation: optionalText(150),
});
export type SuratKeluarInput = z.infer<typeof suratKeluarFormSchema>;

// --- DTO -------------------------------------------------------------------

export interface KlasifikasiSuratDTO {
  id: number;
  code: string;
  name: string;
}

export interface JenisSuratDTO {
  id: number;
  code: string;
  name: string;
  classificationId: number | null;
  classificationName: string | null;
  templateBody: string;
  requiresResident: boolean;
  isActive: boolean;
  numberFormat: string;
  validityMonths: number;
  sortOrder: number;
}

export interface SuratListRow {
  id: number;
  typeId: number;
  residentId: number | null;
  number: string | null;
  status: LetterStatus;
  letterDate: string;
  typeName: string;
  typeCode: string;
  residentName: string | null;
  purpose: string | null;
  createdAt: Date;
  issuedAt: Date | null;
}

export interface SuratDetail extends SuratListRow {
  content?: string | null;
}

export interface SuratMasukDTO {
  id: number;
  agendaNumber: number;
  receivedDate: string;
  letterNumber: string;
  letterDate: string | null;
  sender: string | null;
  classificationId: number | null;
  classificationName: string | null;
  summary: string | null;
  disposition: string | null;
  archiveLocation: string | null;
}

export interface SuratKeluarDTO {
  id: number;
  agendaNumber: number;
  letterNumber: string;
  letterDate: string;
  recipient: string | null;
  classificationId: number | null;
  classificationName: string | null;
  summary: string | null;
  sentDate: string | null;
  archiveLocation: string | null;
}

export interface Option {
  value: string;
  label: string;
}

/** Placeholder contoh untuk ditampilkan di formulir jenis surat. */
export function placeholderHelp(): string {
  return SURAT_PLACEHOLDERS.map((item) => `[${item.key}]`).join(", ");
}
