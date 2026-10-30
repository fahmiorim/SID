import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";

export const PEMILIHAN_RESOURCE = RESOURCES.pengaturan;

export const pemilihanSchema = z.object({
  tahun: z.coerce.number().int().min(2000).max(2100),
  jenis: z.string().trim().min(1).max(50),
  tanggal: z.string().optional().nullable(),
  keterangan: z.string().trim().max(2000).optional().nullable(),
});

export type PemilihanInput = z.infer<typeof pemilihanSchema>;

export interface PemilihanDTO {
  id: number;
  villageId: number;
  tahun: number;
  jenis: string;
  tanggal: string | null;
  keterangan: string | null;
}
