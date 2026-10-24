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
  buildTriwulanRows,
  totalTriwulan,
  triwulanBarisFormSchema,
  type TriwulanBarisInput,
} from "@/features/keuangan/domain/laporan-triwulan";
import { rekonsiliasiBidang, totalRekonsiliasi } from "@/features/keuangan/domain/rekonsiliasi";
import {
  listKeuanganTahun,
  listKeuanganTahunTersedia,
  listKeuanganTriwulan,
  listTemplate,
  saveKeuanganNilai,
  saveKeuanganTriwulan,
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

/**
 * Laporan realisasi per triwulan untuk satu tahun anggaran.
 *
 * Nilai triwulan dibaca dari tabel `keuangan_triwulan`; tidak ada estimasi
 * yang diturunkan dari realisasi tahunan. Baris yang belum pernah diisi
 * ditampilkan sebagai nol.
 */
export async function getLaporanTriwulan(tahunParam?: number) {
  const { villageId, tahun, tersedia, rows } = await listKeuangan(tahunParam);
  const bidang = listBidangBelanja(rows);
  const tersimpan = await listKeuanganTriwulan(villageId, tahun);
  const byKode = new Map(tersimpan.map((row) => [row.templateUuid, row]));

  const input: TriwulanBarisInput[] = bidang.map((row) => {
    const nilai = byKode.get(row.templateUuid);
    return {
      kode: row.templateUuid,
      uraian: row.uraian,
      anggaran: row.anggaran,
      tw1: nilai?.tw1 ?? "0.00",
      tw2: nilai?.tw2 ?? "0.00",
      tw3: nilai?.tw3 ?? "0.00",
      tw4: nilai?.tw4 ?? "0.00",
    };
  });

  const baris = buildTriwulanRows(input);

  return { tahun, tersedia, baris, total: totalTriwulan(baris) };
}

/**
 * Rekonsiliasi realisasi belanja: realisasi tahunan APBDes dibandingkan
 * dengan jumlah realisasi triwulan per bidang (`5.x`).
 *
 * Kode yang hanya ada di salah satu sumber tetap ditampilkan agar data yang
 * belum lengkap terlihat. Tidak ada penulisan data di sini.
 */
export async function getRekonsiliasiKeuangan(tahunParam?: number) {
  const { villageId, tahun, tersedia, rows } = await listKeuangan(tahunParam);
  const bidang = listBidangBelanja(rows);
  const tersimpan = await listKeuanganTriwulan(villageId, tahun);
  const byKode = new Map(tersimpan.map((row) => [row.templateUuid, row]));
  const uraianBidang = new Map(bidang.map((row) => [row.templateUuid, row]));

  // Gabungkan kode dari kedua sisi supaya bidang yang hanya punya salah satu
  // data (mis. triwulan terisi tetapi baris APBDes belum ada) ikut tampil.
  const kode = [...new Set([...uraianBidang.keys(), ...byKode.keys()])].sort((a, b) =>
    a.localeCompare(b),
  );

  const triwulan: TriwulanBarisInput[] = kode.map((item) => {
    const dasar = uraianBidang.get(item);
    const nilai = byKode.get(item);
    return {
      kode: item,
      uraian: dasar?.uraian ?? item,
      anggaran: dasar?.anggaran ?? "0.00",
      tw1: nilai?.tw1 ?? "0.00",
      tw2: nilai?.tw2 ?? "0.00",
      tw3: nilai?.tw3 ?? "0.00",
      tw4: nilai?.tw4 ?? "0.00",
    };
  });

  const baris = rekonsiliasiBidang(bidang, triwulan);

  return { tahun, tersedia, baris, total: totalRekonsiliasi(baris) };
}

/** Simpan realisasi triwulan per bidang belanja (`5.x`). */
export async function saveKeuanganTriwulanData(tahun: number, inputs: unknown[]) {
  const user = await requirePermission(KEUANGAN_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  if (!isValidTahun(tahun)) throw conflict("Tahun anggaran tidak valid.");

  const rows = inputs.map((input) => {
    const parsed = triwulanBarisFormSchema.safeParse(input);
    if (!parsed.success) {
      throw conflict(parsed.error.issues[0]?.message ?? "Isian realisasi triwulan tidak valid.");
    }
    return parsed.data;
  });

  await saveKeuanganTriwulan(
    villageId,
    tahun,
    user.id,
    rows.map((row) => ({
      templateUuid: row.kode,
      tw1: numberToMoney(row.tw1),
      tw2: numberToMoney(row.tw2),
      tw3: numberToMoney(row.tw3),
      tw4: numberToMoney(row.tw4),
    })),
  );

  return { tahun };
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
