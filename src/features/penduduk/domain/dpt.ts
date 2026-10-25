import { z } from "zod";

import { toCsv } from "@/features/penduduk/domain/laporan-penduduk";
import { RESOURCES } from "@/features/rbac/domain/resources";

/** Slug resource RBAC untuk modul DPT. */
export const DPT_RESOURCE = RESOURCES.penduduk;

/** Skema input CRUD pemilihan (dipakai admin). */
export const electionFormSchema = z.object({
  judul: z.string().trim().min(1, "Judul wajib diisi.").max(200, "Maksimal 200 karakter."),
  status: z.enum(["draf", "aktif", "selesai"], {
    error: "Status tidak valid.",
  }),
  tanggal: z.iso.date("Tanggal pemilihan tidak valid."),
  keterangan: z.string().trim().max(1000).optional(),
});

export type ElectionFormInput = z.infer<typeof electionFormSchema>;

/** Bentuk data pemilihan untuk UI. */
export interface ElectionDTO {
  id: number;
  villageId: number;
  judul: string;
  status: "draf" | "aktif" | "selesai";
  tanggal: string;
  keterangan: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Skema filter daftar DPT. */
export const listDptParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  dusun: z.string().trim().optional(),
  rw: z.string().trim().optional(),
  rt: z.string().trim().optional(),
  gender: z.enum(["male", "female"]).optional(),
  agamaId: z.coerce.number().int().positive().optional(),
  pendidikanId: z.coerce.number().int().positive().optional(),
  pekerjaanId: z.coerce.number().int().positive().optional(),
  statusKawinId: z.coerce.number().int().positive().optional(),
  umurMin: z.coerce.number().int().min(0).optional(),
  umurMax: z.coerce.number().int().min(0).optional(),
});

export type ListDptParams = z.infer<typeof listDptParamsSchema>;

export const DEFAULT_DPT_PAGE = 1;
export const DEFAULT_DPT_PER_PAGE = 20;
export const MAX_DPT_PER_PAGE = 100;

/** Baris DPT untuk tabel/admin. */
export interface DptRow {
  id: number;
  nationalId: string | null;
  name: string;
  gender: "male" | "female";
  birthDate: string | null;
  dusun: string | null;
  rw: string | null;
  rt: string | null;
  agama: string | null;
  pendidikan: string | null;
  pekerjaan: string | null;
  statusKawin: string | null;
  umurPemilihan: number | null;
}

/** Hasil paginasi DPT. */
export interface ListDptResult {
  rows: DptRow[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

/** CSV DPT: header + baris data. */
export function buildDptCsv(input: {
  namaDesa: string | null;
  judulPemilihan: string;
  tanggalPemilihan: string;
  rows: DptRow[];
}): string {
  const header = [
    ["Daftar Pemilih Tetap"],
    [input.namaDesa ?? "-"],
    [input.judulPemilihan],
    [`Tanggal Pemilihan: ${input.tanggalPemilihan}`],
    [],
    [
      "No",
      "NIK",
      "Nama",
      "Jenis Kelamin",
      "Tanggal Lahir",
      "Umur",
      "Dusun",
      "RW",
      "RT",
      "Agama",
      "Pendidikan",
      "Pekerjaan",
      "Status Kawin",
    ],
  ] as const; // readonly tuple of readonly string arrays

  const rowsArray = input.rows.map((r, i) => [
    String(i + 1),
    r.nationalId ?? "-",
    r.name,
    r.gender === "male" ? "Laki-laki" : "Perempuan",
    r.birthDate ?? "-",
    r.umurPemilihan?.toString() ?? "-",
    r.dusun ?? "-",
    r.rw ?? "-",
    r.rt ?? "-",
    r.agama ?? "-",
    r.pendidikan ?? "-",
    r.pekerjaan ?? "-",
    r.statusKawin ?? "-",
  ]); // string[]

  const all = [...header, ...rowsArray] as readonly (readonly string[])[];

  return `\uFEFF${toCsv(all)}`;
}

export function dptFilename(namaDesa: string | null, judulPemilihan: string): string {
  const slug =
    (namaDesa ?? "desa")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "desa";
  const slugPemilu = judulPemilihan
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `dpt-${slug}-${slugPemilu}.csv`;
}
