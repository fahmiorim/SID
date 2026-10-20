import { z } from "zod";

import { HEAD_OF_FAMILY_RELATION_ID, type Gender } from "@/features/penduduk/domain/penduduk";
import { RESOURCES } from "@/features/rbac/domain/resources";
import { optionalSelectId, optionalText, type LabelOption } from "@/lib/forms";

/** Slug resource RBAC untuk modul keluarga (harus sama dengan `modules.slug`). */
export const KELUARGA_RESOURCE = RESOURCES.keluarga;

/**
 * `family_relations.id` untuk "KEPALA KELUARGA".
 *
 * Kepala keluarga tidak disimpan sebagai kolom, melainkan diturunkan dari
 * anggota yang punya hubungan keluarga ini (lihat `docs/ARCHITECTURE.md`).
 * Konstanta aslinya ada di domain penduduk agar aturan satu-kepala-per-KK dapat
 * ditegakkan saat menyimpan penduduk.
 */
export { HEAD_OF_FAMILY_RELATION_ID };

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

/**
 * Anggota keluarga dengan data lengkap untuk cetak Kartu Keluarga.
 *
 * Dipisahkan dari `KeluargaMember` karena formulir rincian hanya butuh kolom
 * ringkas, sedangkan KK memerlukan kolom baku (agama, pendidikan, pekerjaan,
 * nama ayah/ibu, dst.). Nama-nama atribut mengikuti urutan kolom KK agar
 * pemetaannya ke berkas cetak mudah ditelusuri.
 */
export interface KeluargaMemberDetail extends KeluargaMember {
  birthPlace: string | null;
  religionName: string | null;
  educationName: string | null;
  occupationName: string | null;
  maritalStatusName: string | null;
  bloodTypeName: string | null;
  citizenshipName: string | null;
  fatherName: string | null;
  motherName: string | null;
}

/** Data referensi yang dibutuhkan formulir keluarga. */
export interface KeluargaReferenceData {
  regions: LabelOption[];
}

/** Label ringkas keluarga, mis. "KK 3201012001120001". */
export function keluargaLabel(keluarga: Pick<KeluargaDTO, "number">): string {
  return `KK ${keluarga.number}`;
}

// --- Cetak Kartu Keluarga --------------------------------------------------

/** Isi kolom "Jenis Kelamin" pada KK. */
export function genderLabelKk(gender: Gender): string {
  return gender === "male" ? "LAKI-LAKI" : "PEREMPUAN";
}

/**
 * Tampilkan tanggal ISO (`YYYY-MM-DD`) dalam format Indonesia (`DD-MM-YYYY`).
 *
 * KK memakai format bertanda hubung; mengembalikan `null` bila tanggal tidak
 * tersedia agar pemanggil dapat menuliskan tanda kosong.
 */
export function tanggalKk(iso: string | null): string | null {
  if (!iso) return null;
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return null;
  return `${day}-${month}-${year}`;
}

/** Nama kepala keluarga (anggota dengan hubungan "kepala keluarga"). */
export function kepalaKeluarga(
  anggota: readonly KeluargaMemberDetail[],
): KeluargaMemberDetail | null {
  return anggota.find((row) => row.relationName?.toUpperCase().includes("KEPALA")) ?? null;
}
