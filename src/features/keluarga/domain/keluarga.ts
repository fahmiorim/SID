import { z } from "zod";

import type { Gender } from "@/features/penduduk/domain/penduduk";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { optionalSelectId, optionalText, type LabelOption } from "@/lib/forms";

/** Slug resource RBAC untuk modul keluarga (harus sama dengan `modules.slug`). */
export const KELUARGA_RESOURCE = RESOURCES.keluarga;

/**
 * `family_relations.id` untuk "KEPALA KELUARGA".
 *
 * Kepala keluarga tidak disimpan sebagai kolom, melainkan diturunkan dari
 * anggota yang punya hubungan keluarga ini (lihat `docs/ARCHITECTURE.md`).
 */
export const HEAD_OF_FAMILY_RELATION_ID = 1;

// --- Validasi formulir -----------------------------------------------------

/** Nomor Kartu Keluarga: tepat 16 angka (tanpa sentinel "belum dipilih"). */
const familyCardNumber = z
  .string()
  .trim()
  .regex(/^\d{16}$/, "Nomor KK harus 16 angka.");

/** Skema validasi input keluarga (dipakai di server action). */
export const keluargaFormSchema = z.object({
  number: familyCardNumber,
  address: optionalText(255),
  regionId: optionalSelectId,
});

export type KeluargaFormInput = z.infer<typeof keluargaFormSchema>;

// --- Bentuk data untuk UI --------------------------------------------------

/** Bentuk data keluarga yang dikirim ke UI (tanpa kolom internal). */
export interface KeluargaDTO {
  id: number;
  number: string;
  address: string | null;
  regionId: number | null;
}

/** Baris tabel keluarga: DTO ditambah data turunan hasil join/agregasi. */
export interface KeluargaListRow extends KeluargaDTO {
  headName: string | null;
  memberCount: number;
  regionLabel: string | null;
}

/** Satu anggota keluarga untuk tampilan rincian. */
export interface KeluargaMember {
  id: number;
  name: string;
  nationalId: string | null;
  gender: Gender;
  birthDate: string | null;
  relationName: string | null;
}

/** Data referensi yang dibutuhkan formulir keluarga. */
export interface KeluargaReferenceData {
  regions: LabelOption[];
}

/** Label ringkas keluarga, mis. "KK 3201012001120001". */
export function keluargaLabel(keluarga: Pick<KeluargaDTO, "number">): string {
  return `KK ${keluarga.number}`;
}
