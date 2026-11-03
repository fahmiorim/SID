import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";

export const REGISTRASI_WARGA_RESOURCE = RESOURCES.registrasiWarga;

export const STATUS_REGISTRASI = ["menunggu", "disetujui", "ditolak"] as const;
export type StatusRegistrasi = (typeof STATUS_REGISTRASI)[number];

export const LABEL_STATUS_REGISTRASI: Record<StatusRegistrasi, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};

export const registrasiWargaSchema = z.object({
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  nama: z.string().trim().min(1, "Nama wajib diisi").max(100),
  noHp: z
    .string()
    .trim()
    .max(20)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
});

export type RegistrasiWargaInput = z.input<typeof registrasiWargaSchema>;

export interface RegistrasiWargaDTO {
  id: number;
  villageId: number;
  nik: string;
  nama: string;
  noHp: string | null;
  status: string;
  createdAt: Date;
}
