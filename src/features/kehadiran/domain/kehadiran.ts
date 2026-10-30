import { z } from "zod";

export const KEHADIRAN_RESOURCE = "kehadiran";

export const kehadiranFormSchema = z.object({
  perangkatId: z.coerce.number().int().positive(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jamMasuk: z.string().optional().nullable(),
  jamKeluar: z.string().optional().nullable(),
  status: z.enum(["hadir", "izin", "sakit", "alpa"]).default("hadir"),
});

export type KehadiranFormInput = z.input<typeof kehadiranFormSchema>;
export type KehadiranFormValues = z.infer<typeof kehadiranFormSchema>;

export interface KehadiranDTO {
  id: number;
  villageId: number;
  perangkatId: number | null;
  perangkatNama?: string;
  perangkatJabatan?: string;
  tanggal: string;
  jamMasuk: string | null;
  jamKeluar: string | null;
  status: string;
}
