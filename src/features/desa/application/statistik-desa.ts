import { and, count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { families, letters, letterTypes, regions, residents } from "@/db/schema";

/**
 * Statistik ringkas desa untuk situs publik.
 *
 * Semua query dibatasi `villageId` dari host sehingga satu basis kode dapat
 * melayani banyak desa tanpa kebocoran data antar-tenant.
 */
export interface StatistikDesa {
  total: number;
  lakiLaki: number;
  perempuan: number;
  keluarga: number;
  perDusun: { label: string; total: number }[];
}

export async function getStatistikDesa(villageId: number): Promise<StatistikDesa> {
  const [rows, keluargaRows, dusunRows] = await Promise.all([
    db
      .select({
        total: count(),
        lakiLaki: sql<number>`sum(case when ${residents.gender} = 'male' then 1 else 0 end)`,
        perempuan: sql<number>`sum(case when ${residents.gender} = 'female' then 1 else 0 end)`,
      })
      .from(residents)
      .where(and(eq(residents.villageId, villageId), eq(residents.lifeStatus, "alive"))),
    db.select({ value: count() }).from(families).where(eq(families.villageId, villageId)),
    db
      .select({ dusun: regions.dusun, total: count() })
      .from(residents)
      .leftJoin(regions, eq(residents.regionId, regions.id))
      .where(and(eq(residents.villageId, villageId), eq(residents.lifeStatus, "alive")))
      .groupBy(regions.dusun)
      .orderBy(desc(count())),
  ]);

  const ringkas = rows[0];

  return {
    total: ringkas?.total ?? 0,
    lakiLaki: Number(ringkas?.lakiLaki ?? 0),
    perempuan: Number(ringkas?.perempuan ?? 0),
    keluarga: keluargaRows[0]?.value ?? 0,
    perDusun: dusunRows.map((row) => ({
      label: row.dusun?.trim() || "Belum diisi",
      total: row.total,
    })),
  };
}

export interface SuratPublikRow {
  id: number;
  jenisSurat: string | null;
  namaPemohon: string | null;
  tanggalLabel: string | null;
}

const TANGGAL_FORMAT = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

/** Surat terbit terbaru untuk ditampilkan di beranda publik. */
export async function listSuratTerbitTerbaru(
  villageId: number,
  limit = 5,
): Promise<SuratPublikRow[]> {
  const rows = await db
    .select({
      id: letters.id,
      typeName: letters.typeName,
      pemohon: letters.pemohon,
      issuedAt: letters.issuedAt,
      createdAt: letters.createdAt,
    })
    .from(letters)
    .leftJoin(letterTypes, eq(letters.typeId, letterTypes.id))
    .where(and(eq(letters.villageId, villageId), eq(letters.status, "issued")))
    .orderBy(desc(letters.issuedAt), desc(letters.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const tanggal = row.issuedAt ?? row.createdAt;
    return {
      id: row.id,
      jenisSurat: row.typeName ?? null,
      namaPemohon: row.pemohon ?? null,
      tanggalLabel: tanggal ? TANGGAL_FORMAT.format(tanggal) : null,
    };
  });
}

/** Banyaknya surat terbit; dipakai kartu statistik layanan. */
export async function countSuratTerbit(villageId: number): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(letters)
    .where(and(eq(letters.villageId, villageId), eq(letters.status, "issued")));
  return row?.value ?? 0;
}
