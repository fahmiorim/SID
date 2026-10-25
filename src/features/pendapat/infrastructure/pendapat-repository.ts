import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { pendapat } from "@/db/schema";
import {
  JAWABAN_KEPUASAN,
  type PendapatListRow,
  type PendapatRekapRow,
} from "@/features/pendapat/domain/pendapat";

export async function rekapPendapat(villageId: number): Promise<PendapatRekapRow[]> {
  const rows = await db
    .select({
      pilihan: pendapat.pilihan,
      total: count(),
    })
    .from(pendapat)
    .where(eq(pendapat.villageId, villageId))
    .groupBy(pendapat.pilihan);

  const total = rows.reduce((s, r) => s + Number(r.total), 0);
  const map = new Map(rows.map((r) => [Number(r.pilihan), Number(r.total)]));

  return JAWABAN_KEPUASAN.map((j) => {
    const t = map.get(j.value) ?? 0;
    return {
      pilihan: j.value,
      label: j.label,
      total: t,
      percentage: total ? Math.round((t / total) * 100) : 0,
    };
  });
}

export async function listPendapat(villageId: number, limit = 100): Promise<PendapatListRow[]> {
  const rows = await db
    .select()
    .from(pendapat)
    .where(eq(pendapat.villageId, villageId))
    .orderBy(desc(pendapat.createdAt))
    .limit(limit);
  return rows as unknown as PendapatListRow[];
}

export async function createPendapat(input: typeof pendapat.$inferInsert): Promise<number> {
  const [res] = await db.insert(pendapat).values(input);
  const result = res as { insertId: bigint | number };
  return Number(result.insertId);
}

export async function deletePendapat(id: number, villageId: number): Promise<void> {
  await db
    .delete(pendapat)
    .where(sql`${pendapat.id} = ${id} AND ${pendapat.villageId} = ${villageId}`);
}
