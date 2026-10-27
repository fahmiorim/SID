import { z } from "zod";

import { toCsv } from "@/features/penduduk/domain/laporan-penduduk";

export const KIA_RESOURCE = "kesehatan" as const;

export const STATUS_KEHAMILAN = [
  { value: 1, label: "Normal" },
  { value: 2, label: "Risiko Tinggi" },
  { value: 3, label: "Kekurangan Energi Kronis" },
] as const;

export const STATUS_GIZI_ANAK = [
  { value: 1, label: "Sehat/Normal" },
  { value: 2, label: "Gizi Kurang" },
  { value: 3, label: "Gizi Buruk" },
  { value: 4, label: "Stunting" },
] as const;

export const STATUS_TIKAR_ANAK = [
  { value: 1, label: "Tidak Diukur" },
  { value: 2, label: "Merah" },
  { value: 3, label: "Kuning" },
  { value: 4, label: "Hijau" },
] as const;

export const posyanduSchema = z.object({
  id: z.number().int().positive().optional(),
  villageId: z.number().int().positive(),
  nama: z.string().min(1).max(100),
  alamat: z.string().max(200).optional().or(z.literal("")),
  namaKetua: z.string().max(100).optional().or(z.literal("")),
  namaBidan: z.string().max(100).optional().or(z.literal("")),
});

export type PosyanduInput = z.infer<typeof posyanduSchema>;
export type Posyandu = PosyanduInput & { id: number };

export const kiaSchema = z.object({
  id: z.number().int().positive().optional(),
  villageId: z.number().int().positive(),
  noKia: z.string().min(1).max(30),
  ibuId: z.number().int().positive(),
  anakId: z.number().int().positive().optional().nullable(),
  hariPerkiraanLahir: z.string().optional().or(z.literal("")),
});

export type KiaInput = z.infer<typeof kiaSchema>;
export type KiaRow = {
  id: number;
  villageId: number;
  noKia: string;
  ibuId: number;
  anakId: number | null;
  hariPerkiraanLahir: string | null;
  ibuName?: string | null;
  anakName?: string | null;
  posyanduId?: number;
};

export const ibuHamilSchema = z.object({
  id: z.number().int().positive().optional(),
  villageId: z.number().int().positive(),
  posyanduId: z.number().int().positive(),
  kiaId: z.number().int().positive(),
  statusKehamilan: z.coerce.number().int().min(1).max(3).optional().nullable(),
  usiaKehamilan: z.coerce.number().int().min(0).max(42).optional().nullable(),
  tanggalMelahirkan: z.string().optional().or(z.literal("")),
  pemeriksaanKehamilan: z.coerce.boolean().optional(),
  konsumsiPilFe: z.coerce.boolean().optional(),
  butirPilFe: z.coerce.number().int().min(0).optional().nullable(),
  pemeriksaanNifas: z.coerce.boolean().optional(),
  konselingGizi: z.coerce.boolean().optional(),
  kunjunganRumah: z.coerce.boolean().optional(),
  aksesAirBersih: z.coerce.boolean().optional(),
  kepemilikanJamban: z.coerce.boolean().optional(),
  jaminanKesehatan: z.coerce.boolean().optional(),
});

export type IbuHamilInput = z.infer<typeof ibuHamilSchema>;

export const bulananAnakSchema = z.object({
  id: z.number().int().positive().optional(),
  villageId: z.number().int().positive(),
  posyanduId: z.number().int().positive(),
  kiaId: z.number().int().positive(),
  statusGizi: z.coerce.number().int().min(1).max(4),
  umurBulan: z.coerce.number().int().min(0).max(60),
  statusTikar: z.coerce.number().int().min(1).max(4),
  pemberianImunisasiDasar: z.coerce.boolean().optional(),
  pemberianImunisasiCampak: z.coerce.boolean().optional().nullable(),
  pengukuranBeratBadan: z.coerce.boolean().optional(),
  beratBadan: z.coerce.number().optional().nullable(),
  pengukuranTinggiBadan: z.coerce.boolean().optional(),
  tinggiBadan: z.coerce.number().optional().nullable(),
  konselingGiziAyah: z.coerce.boolean().optional(),
  konselingGiziIbu: z.coerce.boolean().optional(),
  kunjunganRumah: z.coerce.boolean().optional(),
  airBersih: z.coerce.boolean().optional(),
  kepemilikanJamban: z.coerce.boolean().optional(),
  aktaLahir: z.coerce.boolean().optional(),
  jaminanKesehatan: z.coerce.boolean().optional(),
  pengasuhanPaud: z.coerce.boolean().optional(),
});

export type BulananAnakInput = z.infer<typeof bulananAnakSchema>;

// --- Rekapitulasi skorcard KIA ---

/** Menghitung rekapitulasi skorcard KIA: total, stunting, dan persentase konversi. */
export function hitungSkorcardKia(
  rows: readonly { statusGizi: number; statusTikar: number; posyanduId?: number }[],
): { total: number; stunting: number; konversi: number } {
  const total = rows.length;
  const stunting = rows.filter((row) => row.statusGizi === 4 || row.statusTikar === 4).length;
  const konversi = total === 0 ? 0 : Math.round((stunting / total) * 10000) / 100;
  return { total, stunting, konversi };
}

/** CSV KIA: header + baris data + baris jumlah. */
export function buildKiaCsv(input: {
  namaDesa: string | null;
  judulPemilihan: string;
  tanggalPemilihan: string;
  rows: readonly {
    statusGizi: number;
    statusTikar: number;
    posyanduId?: number;
    posyanduName?: string;
    ibuName: string | null;
    konversi: string;
  }[];
  total: number;
  stunting: number;
  konversiPersentase: number;
}): string {
  const header = [
    ["Rekapitulasi KIA"],
    [input.namaDesa ?? "-"],
    [input.judulPemilihan],
    [`Tanggal Pemilihan: ${input.tanggalPemilihan}`],
    [],
    ["No", "No KIA", "Ibu", "Status Gizi", "Status Tikar", "Persentase"],
  ] as const;

  const rowsArray = input.rows.map((r, i) => [
    String(i + 1),
    r.posyanduId ? String(r.posyanduId) : "-",
    r.ibuName ?? "-",
    STATUS_GIZI_ANAK.find((s) => s.value === r.statusGizi)?.label ?? "-",
    STATUS_TIKAR_ANAK.find((s) => s.value === r.statusTikar)?.label ?? "-",
    r.konversi,
  ]);

  const total = [
    "",
    "JUMLAH",
    "",
    String(input.total),
    String(input.stunting),
    "-",
    `${input.konversiPersentase}%`,
  ];

  return `\uFEFF${toCsv([...header, ...rowsArray, total])}`;
}

export function kiaRekapFilename(namaDesa: string | null): string {
  const slug =
    (namaDesa ?? "desa")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "desa";
  return `rekap-kia-${slug}.csv`;
}
