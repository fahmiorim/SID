import { z } from "zod";

import { RESOURCES } from "@/features/rbac/domain/resources";
import { NO_SELECTION, optionalSelectId, optionalText, type LabelOption } from "@/lib/forms";

/** Slug resource RBAC untuk modul rumah tangga (harus sama dengan `modules.slug`). */
export const RUMAH_TANGGA_RESOURCE = RESOURCES.rumahTangga;

/**
 * Rumah Tangga (RTM).
 *
 * RTM adalah unit sosial **di bawah** Kartu Keluarga: satu KK dapat memuat
 * beberapa rumah tangga (mis. satu rumah dihuni dua keluarga yang berbagi dapur).
 * Keanggotaan dinyatakan lewat `residents.rtm_id`, dan peran tiap anggota
 * disimpan pada `residents.rtm_level`.
 *
 * Berbeda dari sistem rujukan yang memakai `no_kk` sebagai nomor RTM (satu kolom
 * dua makna), di sini RTM punya **nomor sendiri** (`number`) yang dibangkitkan
 * dari kode desa + nomor urut, sehingga tidak bertabrakan dengan nomor KK.
 */

// --- Tingkat hubungan dalam rumah tangga -----------------------------------

/**
 * Tingkat hubungan anggota RTM.
 *
 * Nilai numerik dipertahankan sama seperti katalog rujukan (1 kepala, 2 anggota)
 * agar migrasi data lama tetap mudah. Disimpan sebagai angka pada baris penduduk.
 */
export const RTM_LEVELS = [1, 2] as const;
export type RtmLevel = (typeof RTM_LEVELS)[number];

export const RTM_LEVEL_KEPALA: RtmLevel = 1;
export const RTM_LEVEL_ANGGOTA: RtmLevel = 2;

export const RTM_LEVEL_LABELS: Readonly<Record<RtmLevel, string>> = {
  1: "Kepala Rumah Tangga",
  2: "Anggota",
};

/** Label tingkat hubungan, atau "-" bila belum ditentukan. */
export function rtmLevelLabel(level: number | null): string {
  if (level === 1 || level === 2) return RTM_LEVEL_LABELS[level];
  return "-";
}

/** Apakah tingkat hubungan termasuk kepala rumah tangga? */
export function isKepalaRtm(level: number | null): boolean {
  return level === RTM_LEVEL_KEPALA;
}

// --- Validasi formulir -----------------------------------------------------

/**
 * Skema validasi input rumah tangga.
 *
 * Nomor RTM **tidak** diminta dari pengguna: dibangkitkan otomatis (lihat
 * `bangunNomorRtm`) agar konsisten dan bebas salah tulis. Kelas sosial & BDT
 * (Basis Data Terpadu) bersifat opsional karena sering belum tersedia.
 */
export const rumahTanggaFormSchema = z.object({
  alamat: optionalText(255),
  regionId: optionalSelectId,
  kelasSosial: z.preprocess(
    (value) => (value === "" || value === NO_SELECTION || value === null ? null : value),
    z.coerce.number().int().min(0, "Minimal 0.").max(99, "Maksimal 99.").nullable(),
  ),
  bdt: optionalText(30),
});

export type RumahTanggaFormInput = z.infer<typeof rumahTanggaFormSchema>;

// --- Nomor RTM -------------------------------------------------------------

/** Panjang nomor urut pada nomor RTM. */
const NOMOR_URUT_LENGTH = 5;

/**
 * Bangun nomor RTM dari kode desa dan nomor urut.
 *
 * Pola mengikuti sistem rujukan (`kode_desa` + nomor urut 5 digit) tetapi
 * diterapkan pada nomor **RTM sendiri**. `urut` adalah nomor urut global desa
 * (mis. jumlah RTM + 1); bagian kode desa dipangkas agar hasilnya tidak terlalu
 * panjang dan tetap unik per desa berkat indeks unik `(village_id, number)`.
 */
export function bangunNomorRtm(kodeDesa: string | null, urut: number): string {
  const kode = (kodeDesa ?? "").trim().replace(/[^0-9]/g, "");
  const urutan = String(Math.max(1, Math.trunc(urut))).padStart(NOMOR_URUT_LENGTH, "0");
  return kode === "" ? urutan : `${kode}${urutan}`;
}

// --- Bentuk data untuk UI --------------------------------------------------

/** Bentuk data rumah tangga yang dikirim ke UI (tanpa kolom internal). */
export interface RumahTanggaDTO {
  id: number;
  number: string;
  address: string | null;
  regionId: number | null;
  kelasSosial: number | null;
  bdt: string | null;
}

/** Baris tabel rumah tangga: DTO ditambah data turunan hasil join/agregasi. */
export interface RumahTanggaListRow extends RumahTanggaDTO {
  headName: string | null;
  memberCount: number;
  regionLabel: string | null;
}

/** Satu anggota rumah tangga untuk tampilan rincian. */
export interface RumahTanggaMember {
  id: number;
  name: string;
  nationalId: string | null;
  level: number | null;
}

/**
 * Data referensi yang dibutuhkan formulir rumah tangga.
 *
 * `penduduk` berisi seluruh penduduk desa (dengan NIK) untuk dipilih saat
 * menautkan anggota; `regions` untuk memilih wilayah domisili.
 */
export interface RumahTanggaReferenceData {
  regions: LabelOption[];
  penduduk: LabelOption[];
}
