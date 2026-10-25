import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";

export const SUPLEMEN_RESOURCE = RESOURCES.penduduk;

export const SASARAN_PENDUDUK = 1;
export const SASARAN_KELUARGA = 2;

export const SASARAN_LABELS: Record<number, string> = {
  [SASARAN_PENDUDUK]: "Penduduk",
  [SASARAN_KELUARGA]: "Keluarga (KK)",
};

export const suplemenCreateSchema = z.object({
  nama: z.string().min(1, "Nama suplemen wajib diisi.").max(200),
  sasaran: z.coerce.number().int().default(SASARAN_PENDUDUK),
  keterangan: z.string().max(1000).optional().nullable(),
});

export type SuplemenCreateInput = z.infer<typeof suplemenCreateSchema>;

export const suplemenUpdateSchema = suplemenCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});

export type SuplemenUpdateInput = z.infer<typeof suplemenUpdateSchema>;

export interface SuplemenListRow {
  id: number;
  nama: string;
  slug: string;
  sasaran: number;
  keterangan: string | null;
  terdataCount: number;
  updatedAt: string;
}

export interface ListSuplemenParams {
  page: number;
  perPage: number;
  search?: string;
  sasaran?: number;
}

export interface ListSuplemenResult {
  rows: SuplemenListRow[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}
