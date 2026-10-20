import "server-only";

import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  AKUN_LAPORAN,
  formatMoney,
  KEUANGAN_RESOURCE,
  keuanganBarisFormSchema,
  laporanRpApbd,
  listBidangBelanja,
  numberToMoney,
  realisasiPersen,
  seriGrafik,
  toMinor,
  totalLaporan,
  type KeuanganBarisInput,
} from "@/features/keuangan/domain/keuangan";
import {
  listKeuanganTahun,
  listKeuanganTahunTersedia,
  listTemplate,
  saveKeuanganNilai,
} from "@/features/keuangan/infrastructure/keuangan-repository";
import { requirePermission } from "@/lib/dal";
import { conflict } from "@/lib/errors";

const TAHUN_MIN = 2000;
const TAHUN_MAX = 2100;

/** Tahun anggaran bawaan: tahun berjalan. */
export function defaultTahun(now = new Date()): number {
  return now.getFullYear();
}

function isValidTahun(value: number): boolean {
  return Number.isInteger(value) && value >= TAHUN_MIN && value <= TAHUN_MAX;
}

export async function listKeuangan(tahunParam?: number) {
  const user = await requirePermission(KEUANGAN_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const tersedia = await listKeuanganTahunTersedia(villageId);
  const tahun =
    tahunParam !== undefined && isValidTahun(tahunParam)
      ? tahunParam
      : (tersedia.at(-1) ?? defaultTahun());

  const rows = await listKeuanganTahun(villageId, tahun);

  return { villageId, tahun, tersedia, rows };
}

/**
 * Data laporan RP APBDes & realisasi per bidang untuk satu tahun anggaran.
 *
 * Mengembalikan baris RP APBDes (pendapatan/belanja/pembiayaan dengan
 * realisasi, selisih, %) serta rincian realisasi per bidang belanja.
 */
export async function getLaporanKeuangan(tahunParam?: number) {
  const { tahun, tersedia, rows } = await listKeuangan(tahunParam);

  const baris = laporanRpApbd(rows, AKUN_LAPORAN);
  const bidang = listBidangBelanja(rows).map((row) => {
    const selisih = formatMoney(toMinor(row.anggaran) - toMinor(row.realisasi));
    return {
      kode: row.templateUuid,
      uraian: row.uraian,
      anggaran: row.anggaran,
      realisasi: row.realisasi,
      selisih,
      persen: realisasiPersen(row.anggaran, row.realisasi),
    };
  });

  return {
    tahun,
    tersedia,
    baris,
    total: totalLaporan(baris),
    bidang,
    totalBidang: totalLaporan(bidang),
    grafik: seriGrafik(baris),
  };
}

export async function listKeuanganTemplate() {
  await requirePermission(KEUANGAN_RESOURCE, "read");
  return listTemplate();
}

export async function saveKeuanganData(tahun: number, inputs: unknown[]) {
  const user = await requirePermission(KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!isValidTahun(tahun)) throw conflict("Tahun anggaran tidak valid.");

  const rows: KeuanganBarisInput[] = [];
  for (const input of inputs) {
    const parsed = keuanganBarisFormSchema.safeParse(input);
    if (!parsed.success) {
      throw conflict(parsed.error.issues[0]?.message ?? "Isian keuangan tidak valid.");
    }
    rows.push(parsed.data);
  }

  await saveKeuanganNilai(
    villageId,
    tahun,
    user.id,
    rows.map((row) => ({
      templateUuid: row.templateUuid,
      anggaran: numberToMoney(row.anggaran),
      realisasi: numberToMoney(row.realisasi),
    })),
  );
  return { tahun };
}
