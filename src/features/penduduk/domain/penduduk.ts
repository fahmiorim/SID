import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";

/** Slug resource RBAC untuk modul penduduk (harus sama dengan `modules.slug`). */
export const PENDUDUK_RESOURCE = RESOURCES.penduduk;

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

/**
 * Nilai sentinel untuk pilihan kosong pada select.
 *
 * Radix Select menolak item ber-`value` string kosong, sehingga "belum
 * dipilih" dikirim sebagai `"none"` lalu diterjemahkan kembali menjadi `null`.
 */
export const NO_SELECTION = "none";

const isBlank = (value: unknown): boolean =>
  value === "" || value === null || value === undefined || value === NO_SELECTION;

/** NIK / No. KK: 16 angka, boleh dikosongkan. */
const optionalIdentityNumber = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d{16}$/.test(value), "Harus 16 angka.")
  .transform((value) => (value === "" ? null : value));

/** Id referensi opsional. */
const optionalId = z.preprocess(
  (value) => (isBlank(value) ? null : value),
  z.coerce.number().int().positive().nullable(),
);

/** Tanggal ISO (`YYYY-MM-DD`) opsional. */
const optionalDate = z.preprocess(
  (value) => (isBlank(value) ? null : value),
  z.iso.date("Tanggal tidak valid.").nullable(),
);

const optionalText = (max: number) =>
  z.string().trim().max(max, `Maksimal ${max} karakter.`).default("");

/** Skema validasi input penduduk (dipakai di server action). */
export const pendudukFormSchema = z.object({
  nationalId: optionalIdentityNumber,
  familyCardNumber: optionalIdentityNumber,
  name: z.string().trim().min(1, "Nama wajib diisi.").max(100, "Maksimal 100 karakter."),
  gender: z.preprocess(
    (value) => (isBlank(value) ? "" : value),
    z.enum(GENDERS, { error: "Jenis kelamin wajib dipilih." }),
  ),
  birthPlace: optionalText(100),
  birthDate: optionalDate,
  religionId: optionalId,
  educationId: optionalId,
  occupationId: optionalId,
  maritalStatusId: optionalId,
  familyRelationId: optionalId,
  bloodTypeId: optionalId,
  citizenshipId: optionalId,
  residenceStatus: z.enum(RESIDENCE_STATUSES, { error: "Status tempat tinggal tidak valid." }),
  lifeStatus: z.enum(LIFE_STATUSES, { error: "Status kependudukan tidak valid." }),
  regionId: optionalId,
  address: optionalText(255),
  phone: optionalText(30),
  fatherName: optionalText(100),
  motherName: optionalText(100),
});

export type PendudukFormInput = z.infer<typeof pendudukFormSchema>;

// --- Bentuk data untuk UI --------------------------------------------------

/** Bentuk data penduduk yang dikirim ke UI (tanpa kolom internal). */
export interface PendudukDTO {
  id: number;
  nationalId: string | null;
  familyCardNumber: string | null;
  name: string;
  gender: Gender;
  birthPlace: string | null;
  birthDate: string | null;
  religionId: number | null;
  educationId: number | null;
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
}

/** Baris tabel penduduk: DTO lengkap ditambah nama referensi hasil join. */
export interface PendudukListRow extends PendudukDTO {
  religionName: string | null;
  regionLabel: string | null;
}

/** Satu pilihan pada select formulir. */
export interface ReferenceOption {
  id: number;
  name: string;
}

/** Pilihan wilayah dengan label siap tampil. */
export interface RegionOption {
  id: number;
  label: string;
}

/** Seluruh data referensi yang dibutuhkan formulir penduduk. */
export interface PendudukReferenceData {
  religions: ReferenceOption[];
  educations: ReferenceOption[];
  occupations: ReferenceOption[];
  maritalStatuses: ReferenceOption[];
  familyRelations: ReferenceOption[];
  bloodTypes: ReferenceOption[];
  citizenships: ReferenceOption[];
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
