import { z } from "zod";

export const KONTAK_RESOURCE = "daftarKontak" as const;
export const GRUP_KONTAK_RESOURCE = "grupKontak" as const;

export const kontakSchema = z.object({
  id: z.number().int().positive().optional(),
  villageId: z.number().int().positive(),
  nama: z.string().min(1).max(100),
  telepon: z.string().max(20).optional().or(z.literal("")),
  email: z.string().max(100).optional().or(z.literal("")),
  telegram: z.string().max(50).optional().or(z.literal("")),
  hubungWarga: z.string().max(50).optional(),
  keterangan: z.string().optional().or(z.literal("")),
});

export type KontakInput = z.infer<typeof kontakSchema>;

export const kontakGrupSchema = z.object({
  id: z.number().int().positive().optional(),
  villageId: z.number().int().positive(),
  namaGrup: z.string().min(1).max(50),
  keterangan: z.string().optional().or(z.literal("")),
});

export type KontakGrupInput = z.infer<typeof kontakGrupSchema>;
