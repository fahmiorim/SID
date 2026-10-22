import { z } from "zod";

export const PERMOHONAN_STATUS = ["0", "1", "2", "3", "4", "5"] as const;
export type PermohonanStatus = (typeof PERMOHONAN_STATUS)[number];

export const PERMOHONAN_STATUS_LABELS: Record<PermohonanStatus, string> = {
  "0": "Belum Lengkap",
  "1": "Sedang Diperiksa",
  "2": "Menunggu Tandatangan",
  "3": "Siap Diambil",
  "4": "Sudah Diambil",
  "5": "Dibatalkan",
};

export const permohonanSuratFormSchema = z.object({
  idSurat: z.coerce.number().int().min(1),
  isianForm: z.string().optional().or(z.literal("")),
  noHpAktif: z.string().trim().max(50).optional().or(z.literal("")),
  keterangan: z.string().trim().max(500).optional().or(z.literal("")),
  residentId: z.coerce.number().int().positive().optional(),
});
export type PermohonanSuratInput = z.infer<typeof permohonanSuratFormSchema>;
