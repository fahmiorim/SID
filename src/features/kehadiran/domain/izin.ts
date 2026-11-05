import { z } from "zod";

export const JENIS_IZIN_LABELS = {
  izin: "Izin",
  sakit: "Sakit",
  cuti: "Cuti",
} as const;

export const STATUS_IZIN_LABELS = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
} as const;

export const izinWargaSchema = z
  .object({
    jenis: z.enum(["izin", "sakit", "cuti"]).default("izin"),
    tanggalMulai: z.string().date("Tanggal mulai tidak valid."),
    tanggalSelesai: z.string().date("Tanggal selesai tidak valid."),
    alasan: z
      .string()
      .trim()
      .min(10, "Alasan minimal 10 karakter.")
      .max(500, "Alasan maksimal 500 karakter."),
  })
  .refine((value) => value.tanggalSelesai >= value.tanggalMulai, {
    path: ["tanggalSelesai"],
    message: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  });

export type IzinWargaInput = z.infer<typeof izinWargaSchema>;

export const putusanIzinSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["disetujui", "ditolak"]),
  catatan: z.string().trim().max(500).optional().default(""),
});

const jamSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam harus berformat HH:MM.");

export const pengaturanKehadiranSchema = z.object({
  jamMasuk: jamSchema,
  jamKeluar: jamSchema,
  hariLibur: z.array(z.number().int().min(0).max(6)).max(7),
});

export type PengaturanKehadiranInput = z.infer<typeof pengaturanKehadiranSchema>;

export interface IzinDTO {
  id: number;
  jenis: keyof typeof JENIS_IZIN_LABELS;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  status: keyof typeof STATUS_IZIN_LABELS;
  catatanOperator: string | null;
  namaPemohon?: string;
  nikPemohon?: string;
}

export function parseHariLibur(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))];
  } catch {
    return [];
  }
}
