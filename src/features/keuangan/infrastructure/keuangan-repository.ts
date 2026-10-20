import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { keuangan, keuanganTemplate } from "@/db/schema";
import {
  formatMoney,
  kodeLength,
  parentKode,
  toMinor,
  type KeuanganBarisDTO,
} from "@/features/keuangan/domain/keuangan";

// --- Chart of accounts ------------------------------------------------------

export interface TemplateRow {
  uuid: string;
  parentUuid: string | null;
  uraian: string;
}

export async function listTemplate(): Promise<TemplateRow[]> {
  return db
    .select({
      uuid: keuanganTemplate.uuid,
      parentUuid: keuanganTemplate.parentUuid,
      uraian: keuanganTemplate.uraian,
    })
    .from(keuanganTemplate)
    .orderBy(asc(keuanganTemplate.uuid));
}

/** Semua leluhur sebuah kode, dari induk langsung hingga akar. */
export function ancestorsOf(uuid: string): string[] {
  const result: string[] = [];
  let current = parentKode(uuid);
  while (current) {
    result.push(current);
    current = parentKode(current);
  }
  return result;
}

// --- Baris anggaran per tahun ----------------------------------------------

export async function listKeuanganTahun(
  villageId: number,
  tahun: number,
): Promise<KeuanganBarisDTO[]> {
  const [template, rows] = await Promise.all([
    listTemplate(),
    db
      .select({
        templateUuid: keuangan.templateUuid,
        anggaran: keuangan.anggaran,
        realisasi: keuangan.realisasi,
      })
      .from(keuangan)
      .where(and(eq(keuangan.villageId, villageId), eq(keuangan.tahun, tahun))),
  ]);

  const valueByUuid = new Map(rows.map((row) => [row.templateUuid, row]));

  return template.map((item) => {
    const value = valueByUuid.get(item.uuid);
    return {
      templateUuid: item.uuid,
      uraian: item.uraian,
      level: kodeLength(item.uuid),
      anggaran: value?.anggaran ?? "0.00",
      realisasi: value?.realisasi ?? "0.00",
    };
  });
}

/** Daftar tahun anggaran yang sudah memiliki data pada desa ini. */
export async function listKeuanganTahunTersedia(villageId: number): Promise<number[]> {
  const rows = await db
    .selectDistinct({ tahun: keuangan.tahun })
    .from(keuangan)
    .where(eq(keuangan.villageId, villageId))
    .orderBy(asc(keuangan.tahun));

  return rows.map((row) => row.tahun);
}

export interface KeuanganBarisUpsert {
  templateUuid: string;
  anggaran: string;
  realisasi: string;
}

/**
 * Simpan nilai daun lalu agregasi ulang ke seluruh induk.
 *
 * Nilai induk dihitung dari penjumlahan anak langsungnya; perhitungan dilakukan
 * di aplikasi (bukan trigger) agar idempoten dan mudah diuji. Penulisan memakai
 * UPSERT keyed pada (village, tahun, template).
 */
export async function saveKeuanganNilai(
  villageId: number,
  tahun: number,
  createdBy: string,
  input: KeuanganBarisUpsert[],
): Promise<void> {
  const template = await listTemplate();
  if (template.length === 0) return;

  const parentByUuid = new Map(template.map((row) => [row.uuid, row.parentUuid]));

  // Nilai eksisting tahun ini, lalu ditimpa oleh input.
  const existing = await db
    .select({
      templateUuid: keuangan.templateUuid,
      anggaran: keuangan.anggaran,
      realisasi: keuangan.realisasi,
    })
    .from(keuangan)
    .where(and(eq(keuangan.villageId, villageId), eq(keuangan.tahun, tahun)));

  const agg = new Map<string, { anggaran: bigint; realisasi: bigint }>();
  for (const row of existing) {
    agg.set(row.templateUuid, {
      anggaran: toMinor(row.anggaran),
      realisasi: toMinor(row.realisasi),
    });
  }
  for (const row of input) {
    agg.set(row.templateUuid, {
      anggaran: toMinor(row.anggaran),
      realisasi: toMinor(row.realisasi),
    });
  }

  // Hitung ulang induk dari level terdalam ke akar.
  const childrenByParent = new Map<string, string[]>();
  for (const item of template) {
    if (!item.parentUuid) continue;
    const list = childrenByParent.get(item.parentUuid) ?? [];
    list.push(item.uuid);
    childrenByParent.set(item.parentUuid, list);
  }

  const byDepthDesc = [...template].sort(
    (a, b) => b.uuid.split(".").length - a.uuid.split(".").length,
  );

  for (const item of byDepthDesc) {
    const parent = parentByUuid.get(item.uuid);
    if (!parent) continue;

    let sumA = 0n;
    let sumR = 0n;
    for (const child of childrenByParent.get(parent) ?? []) {
      const value = agg.get(child);
      if (value) {
        sumA += value.anggaran;
        sumR += value.realisasi;
      }
    }
    agg.set(parent, { anggaran: sumA, realisasi: sumR });
  }

  const toWrite = [...agg.entries()].map(([templateUuid, value]) => ({
    villageId,
    tahun,
    templateUuid,
    anggaran: formatMoney(value.anggaran),
    realisasi: formatMoney(value.realisasi),
    createdBy,
  }));

  if (toWrite.length === 0) return;

  await db
    .insert(keuangan)
    .values(toWrite)
    .onDuplicateKeyUpdate({
      set: {
        anggaran: sql`VALUES(${sql.raw("anggaran")})`,
        realisasi: sql`VALUES(${sql.raw("realisasi")})`,
      },
    });
}
