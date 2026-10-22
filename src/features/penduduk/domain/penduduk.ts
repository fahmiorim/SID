import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";
import {
  isBlankSelection,
  optionalDigits,
  optionalIsoDate,
  optionalSelectId,
  optionalText,
  type IdOption,
  type LabelOption,
} from "@/lib/forms";

/** Slug resource RBAC untuk modul penduduk (harus sama dengan `modules.slug`). */
export const PENDUDUK_RESOURCE = RESOURCES.penduduk;

/**
 * `family_relations.id` untuk "KEPALA KELUARGA".
 *
 * Ditempatkan di domain penduduk karena aturan "satu kepala per KK" ditegakkan
 * saat menyimpan penduduk; fitur keluarga memakainya untuk menurunkan kepala KK.
 */
export const HEAD_OF_FAMILY_RELATION_ID = 1;

// --- Kosakata domain (nilai disimpan dalam bahasa Inggris, label Indonesia) ---

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Readonly<Record<Gender, string>> = {
  male: "Laki-laki",
  female: "Perempuan",
};

/** Status tempat tinggal: tetap (terdaftar di desa ini) atau tidak tetap. */
export const RESIDENCE_STATUSES = ["permanent", "temporary"] as const;
export type ResidenceStatus = (typeof RESIDENCE_STATUSES)[number];

export const RESIDENCE_STATUS_LABELS: Readonly<Record<ResidenceStatus, string>> = {
  permanent: "Tetap",
  temporary: "Tidak Tetap",
};

/** Status dasar kependudukan. */
export const LIFE_STATUSES = [
  "alive",
  "deceased",
  "moved",
  "missing",
  "departed",
  "invalid",
] as const;
export type LifeStatus = (typeof LIFE_STATUSES)[number];

export const LIFE_STATUS_LABELS: Readonly<Record<LifeStatus, string>> = {
  alive: "Hidup",
  deceased: "Mati",
  moved: "Pindah",
  missing: "Hilang",
  departed: "Pergi",
  invalid: "Tidak Valid",
};

/** Penduduk berstatus `alive` dihitung sebagai warga aktif desa. */
export function isActiveResident(status: LifeStatus): boolean {
  return status === "alive";
}

// --- Validasi formulir -----------------------------------------------------

/** Skema validasi input penduduk (dipakai di server action). */
export const pendudukFormSchema = z.object({
  nationalId: optionalDigits(16),
  familyId: optionalSelectId,
  name: z.string().trim().min(1, "Nama wajib diisi.").max(100, "Maksimal 100 karakter."),
  gender: z.preprocess(
    (value) => (isBlankSelection(value) ? "" : value),
    z.enum(GENDERS, { error: "Jenis kelamin wajib dipilih." }),
  ),
  birthPlace: optionalText(100),
  birthDate: optionalIsoDate,
  religionId: optionalSelectId,
  educationId: optionalSelectId,
  educationSedangId: optionalSelectId,
  occupationId: optionalSelectId,
  maritalStatusId: optionalSelectId,
  familyRelationId: optionalSelectId,
  bloodTypeId: optionalSelectId,
  citizenshipId: optionalSelectId,
  residenceStatus: z.enum(RESIDENCE_STATUSES, { error: "Status tempat tinggal tidak valid." }),
  lifeStatus: z.enum(LIFE_STATUSES, { error: "Status kependudukan tidak valid." }),
  regionId: optionalSelectId,
  address: optionalText(255),
  phone: optionalText(30),
  fatherName: optionalText(100),
  motherName: optionalText(100),
  fatherNationalId: optionalDigits(16),
  motherNationalId: optionalDigits(16),
});

export type PendudukFormInput = z.infer<typeof pendudukFormSchema>;

// --- Bentuk data untuk UI --------------------------------------------------

/** Bentuk data penduduk yang dikirim ke UI (tanpa kolom internal). */
export interface PendudukDTO {
  id: number;
  nationalId: string | null;
  /** Kartu Keluarga (KK) tempat penduduk terdaftar; `null` bila belum ditautkan. */
  familyId: number | null;
  name: string;
  gender: Gender;
  birthPlace: string | null;
  birthDate: string | null;
  religionId: number | null;
  educationId: number | null;
  /** Pendidikan yang sedang ditempuh (bisa berbeda dari pendidikan terakhir). */
  educationSedangId: number | null;
  occupationId: number | null;
  maritalStatusId: number | null;
  familyRelationId: number | null;
  bloodTypeId: number | null;
  citizenshipId: number | null;
  residenceStatus: ResidenceStatus;
  lifeStatus: LifeStatus;
  regionId: number | null;
  address: string | null;
  phone: string | null;
  fatherName: string | null;
  motherName: string | null;
  fatherNationalId: string | null;
  motherNationalId: string | null;
}

/** Baris tabel penduduk: DTO lengkap ditambah data turunan hasil join. */
export interface PendudukListRow extends PendudukDTO {
  religionName: string | null;
  /** Nomor Kartu Keluarga yang ditautkan (hasil join), untuk ditampilkan. */
  familyNumber: string | null;
  regionLabel: string | null;
}

/** Satu pilihan katalog pada select formulir. */
export type ReferenceOption = IdOption;

/** Pilihan wilayah dengan label siap tampil. */
export type RegionOption = LabelOption;

/** Seluruh data referensi yang dibutuhkan formulir penduduk. */
export interface PendudukReferenceData {
  religions: ReferenceOption[];
  educations: ReferenceOption[];
  occupations: ReferenceOption[];
  maritalStatuses: ReferenceOption[];
  familyRelations: ReferenceOption[];
  bloodTypes: ReferenceOption[];
  citizenships: ReferenceOption[];
  /** Kartu Keluarga pada desa ini, untuk menautkan penduduk ke sebuah KK. */
  families: LabelOption[];
  regions: RegionOption[];
}

// --- Pembantu tampilan -----------------------------------------------------

/**
 * Usia dalam tahun penuh pada tanggal `today`.
 * Mengembalikan `null` bila tanggal lahir kosong, tidak valid, atau di masa depan.
 */
export function calculateAge(birthDate: string | null, today: Date = new Date()): number | null {
  if (!birthDate) return null;

  const born = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(born.getTime()) || born.getTime() > today.getTime()) return null;

  let age = today.getUTCFullYear() - born.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - born.getUTCMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < born.getUTCDate())) {
    age -= 1;
  }

  return age;
}

/** Label ringkas penduduk untuk judul dialog konfirmasi. */
export function pendudukLabel(row: Pick<PendudukDTO, "name" | "nationalId">): string {
  return row.nationalId ? `${row.name} (NIK ${row.nationalId})` : row.name;
}
