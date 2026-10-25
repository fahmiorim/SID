import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { elections } from "@/db/schema";
import { getIdentitas } from "@/features/desa/application/get-identitas";
import { resolveVillageId } from "@/features/desa/application/resolve-village";
import {
  buildDptCsv,
  dptFilename,
  type ElectionDTO,
  type ElectionFormInput,
  type ListDptParams,
  type ListDptResult,
} from "@/features/penduduk/domain/dpt";
import { PENDUDUK_RESOURCE } from "@/features/penduduk/domain/penduduk";
import {
  getActiveElection,
  listDpt,
  listDptExport,
} from "@/features/penduduk/infrastructure/dpt-repository";
import { requirePermission } from "@/lib/dal";

/** Daftar pemilihan (CRUD admin). */
export async function listElections(): Promise<ElectionDTO[]> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const rows = await db
    .select()
    .from(elections)
    .where(eq(elections.villageId, villageId))
    .orderBy(desc(elections.tanggal));

  return rows.map((r) => ({
    id: r.id,
    villageId: r.villageId,
    judul: r.judul,
    status: r.status,
    tanggal: r.tanggal,
    keterangan: r.keterangan,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/** Detail pemilihan by ID. */
export async function getElectionById(id: number): Promise<ElectionDTO | null> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);

  const row = await db
    .select()
    .from(elections)
    .where(and(eq(elections.id, id), eq(elections.villageId, villageId)))
    .limit(1);

  if (!row[0]) return null;

  return {
    id: row[0].id,
    villageId: row[0].villageId,
    judul: row[0].judul,
    status: row[0].status,
    tanggal: row[0].tanggal,
    keterangan: row[0].keterangan,
    createdAt: row[0].createdAt.toISOString(),
    updatedAt: row[0].updatedAt.toISOString(),
  };
}

/** Simpan pemilihan (buat/ubah). Hanya satu aktif per desa. */
export async function saveElection(input: ElectionFormInput, id?: number): Promise<ElectionDTO> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "update");
  const villageId = await resolveVillageId(user);

  // Validasi: hanya satu aktif per desa
  if (input.status === "aktif") {
    const existing = await db
      .select({ id: elections.id })
      .from(elections)
      .where(
        and(
          eq(elections.villageId, villageId),
          eq(elections.status, "aktif"),
          id ? sql`${elections.id} != ${id}` : undefined,
        ),
      )
      .limit(1);

    if (existing[0]) {
      throw new Error("Sudah ada pemilihan aktif untuk desa ini.");
    }
  }

  let electionId: number;

  if (id) {
    await db
      .update(elections)
      .set({
        judul: input.judul,
        status: input.status,
        tanggal: input.tanggal,
        keterangan: input.keterangan ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(elections.id, id), eq(elections.villageId, villageId)));
    electionId = id;
  } else {
    const inserted = await db
      .insert(elections)
      .values({
        villageId,
        judul: input.judul,
        status: input.status,
        tanggal: input.tanggal,
        keterangan: input.keterangan ?? null,
      })
      .$returningId();
    electionId = inserted[0]?.id ?? 0;
  }

  const saved = await getElectionById(electionId);
  if (!saved) throw new Error("Gagal menyimpan pemilihan.");
  return saved;
}

/** Hapus pemilihan. */
export async function deleteElection(id: number): Promise<void> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "delete");
  const villageId = await resolveVillageId(user);

  await db.delete(elections).where(and(eq(elections.id, id), eq(elections.villageId, villageId)));
}

/** Daftar DPT dengan filter + pagination. */
export async function getDpt(params: ListDptParams): Promise<ListDptResult> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  return listDpt(villageId, params);
}

/** Ekspor DPT CSV. */
export async function exportDpt(params: ListDptParams): Promise<{
  csv: string;
  filename: string;
}> {
  const user = await requirePermission(PENDUDUK_RESOURCE, "read");
  const villageId = await resolveVillageId(user);
  const [rows, desa, election] = await Promise.all([
    listDptExport(villageId, params),
    getIdentitas(),
    getActiveElection(villageId),
  ]);

  if (!election) {
    throw new Error("Tidak ada pemilihan aktif untuk desa ini.");
  }

  return {
    csv: buildDptCsv({
      namaDesa: desa?.namaDesa ?? null,
      judulPemilihan: election.judul,
      tanggalPemilihan: election.tanggal,
      rows,
    }),
    filename: dptFilename(desa?.namaDesa ?? null, election.judul),
  };
}
